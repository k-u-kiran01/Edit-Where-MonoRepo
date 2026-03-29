import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import AdmZip from 'adm-zip';
import prisma from '../db.js';
import { uploadFileToDrive, updateFileInDrive, deleteFileFromDrive, downloadFileFromDrive } from '../services/driveHelper.js';

const getAllFiles = (dirPath, arrayOfFiles = [])=>{
    const files = fs.readdirSync(dirPath);
    files.forEach((file)=>{
        const filePath = path.join(dirPath, file);
        if(fs.statSync(filePath).isDirectory()){
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
        } else {
            arrayOfFiles.push(filePath);
        } 
    });
    return arrayOfFiles;
}

export const calcuateFileHash = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

export const addProject = async (req,res) => {
    const { userId } = req.user;
    const zipFile = req.file;
    const workspaceName = req.body.workspaceName || `workspace_${Date.now()}`;

    if(!zipFile){
        return res.status(400).json({ error: 'No Zip forwarded.' });
    }
    const extractDir = path.join('uploads', `extracted_${Date.now()}`);
    try{
        console.log(`Extracting zip to ${extractDir}...`);
        const zip = new AdmZip(zipFile.path);
        zip.extractAllTo(extractDir, true);

        const workspace = await prisma.rootDirectory.create({
            data: {
                name: workspaceName,
                userId: userId
            }
        });
        const allLocalFiles = getAllFiles(extractDir);

        for(const localFilePath of allLocalFiles){
            const relativePath = localFilePath.replace(extractDir, '').replace(/\\/g, '/');
            const fileName = path.basename(localFilePath);

            const driveFileId = await uploadFileToDrive(localFilePath, fileName,'text/plain', process.env.DRIVE_FOLDER_ID);
            await prisma.file.create({
                data:{
                    filePath: relativePath,
                    fileHash: '',
                    driveFileId: driveFileId,
                    rootDirectoryId: workspace.id
                }
            });
        }
        fs.rmSync(extractDir, { recursive: true, force: true });
        fs.unlinkSync(zipFile.path);

        return res.status(200).json({ message: 'Project added successfully', workspaceId: workspace.id });
    }catch (error) {
        console.error('Error processing project:', error);
        if(fs.existsSync(extractDir)){
            fs.rmSync(extractDir, { recursive: true, force: true });
        }
        if(fs.existsSync(zipFile.path)){
            fs.unlinkSync(zipFile.path);
        }
        return res.status(500).json({ error: 'Failed to process project' });
    }
}

export const editProject = async (req,res) => {
    const {userId} = req.user;
    const  workspaceId = parseInt(req.body.workspaceId);
    const zipFile = req.file;
    if(!zipFile){
        return res.status(400).json({ error: 'No Zip forwarded.' });
    }
    if(!workspaceId){
        return res.status(400).json({ error: 'No workspaceId provided.' });
    }
    const extractDir = path.join('uploads', `extracted_${Date.now()}`);
    try{
        console.log(`Extracting zip to ${extractDir}...`);
        const zip = new AdmZip(zipFile.path);
        zip.extractAllTo(extractDir, true);

        const allLocalFiles = getAllFiles(extractDir);
        const existingFiles = await prisma.file.findMany({
            where: { rootDirectoryId: workspaceId }
        });
        const dbFileMap = new Map();
        existingFiles.forEach(file => {
            dbFileMap.set(file.filePath, file);
        });

        for(const localFilePath of allLocalFiles){
            const relativePath = localFilePath.replace(extractDir, '').replace(/\\/g, '/');
            const newFileHash = calcuateFileHash(localFilePath);
            const existingRecord = dbFileMap.get(relativePath);

            if(!existingRecord){
                // New File
                const driveId = await uploadFileToDrive(localFilePath, path.basename(localFilePath), 'text/plain', process.env.DRIVE_FOLDER_ID);
                await prisma.file.create({
                    data: {
                        filePath: relativePath,
                        fileHash: newFileHash,
                        driveFileId: driveId,
                        rootDirectoryId: workspaceId
                    }
                });
            } else if(existingRecord.fileHash !== newFileHash){
                // Modified File
                await updateFileInDrive(existingRecord.driveFileId, localFilePath);
                await prisma.file.update({
                    where: { id: existingRecord.id },
                    data: { fileHash: newFileHash }
                });
                dbFileMap.delete(relativePath);
            }
            else{
                // Unchanged File
                dbFileMap.delete(relativePath);
            }
        }
        for(const [deletedPath, deletedRecord ]of dbFileMap.entries()){
            console.log(`[DELETED] ${deletedPath}`);
            await deleteFileFromDrive(deletedRecord.driveFileId);
            await prisma.file.delete({ where: { id: deletedRecord.id } });
        }

        fs.rmSync(extractDir, { recursive: true, force: true });
        fs.unlinkSync(zipFile.path);

        return res.status(200).json({ message: 'Project edited successfully' });
    }catch (error) {
        console.error('Error processing project:', error);
        if(fs.existsSync(extractDir)){
            fs.rmSync(extractDir, { recursive: true, force: true });
        }
        if(fs.existsSync(zipFile.path)){
            fs.unlinkSync(zipFile.path);
        }
        return res.status(500).json({ error: 'Failed to process project' });
    }
}

export const getProject = async (req,res)=>{
    const { userId } = req.user;
    const workspaceId = parseInt(req.params.workspaceId);
    if(!workspaceId){
        return res.status(400).json({ error: 'No workspaceId provided.' });
    }
    const rawLocalFiles = req.body.localFiles || {};
    const localFiles = {};
    for( const [key, value] of Object.entries(rawLocalFiles)){
        const normalizedKey = key.startsWith('/') ? key : `/${key}`;
        localFiles[normalizedKey] = value;
    }
    const tempDir = path.join('uploads', `download_${Date.now()}`);
    const zipPath = path.join('uploads', `payload_${Date.now()}.zip`);
    try{
        const storedFiles = await prisma.file.findMany({
            where: { rootDirectoryId: workspaceId }
        });
        const filesToDownload = [];
        const filesToDelete = [];
        const dbFileMap = new Map();

        storedFiles.forEach(dbFile => {
            dbFileMap.set(dbFile.filePath, dbFile);
            const localHash = localFiles[dbFile.filePath];

            if(!localHash || localHash !== dbFile.fileHash){
                filesToDownload.push(dbFile);
            }
        });
        
        for(const localPath of Object.keys(localFiles)){
            if(!dbFileMap.has(localPath)){
                filesToDelete.push(localPath);
            }
        }
        fs.mkdirSync(tempDir, { recursive: true });
        for(const file of filesToDownload){
            const fileDestPath = path.join(tempDir, file.filePath);
            fs.mkdirSync(path.dirname(fileDestPath), { recursive: true });
            await downloadFileFromDrive(file.driveFileId, fileDestPath);
        }
        fs.writeFileSync(path.join(tempDir, 'instructions.json'), JSON.stringify({ delete: filesToDelete }));

        console.log(`Zipping ${filesToDownload.length} updated files...`);
        const zip = new AdmZip();
        zip.addLocalFolder(tempDir);
        zip.writeZip(zipPath);

        res.download(zipPath, 'project_payload.zip', (err)=>{

            if(fs.existsSync(tempDir)){
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
            if(fs.existsSync(zipPath)){
                fs.unlinkSync(zipPath);
            }
        })
    }
    catch(error){
        console.error('Error fetching project:', error);
        return res.status(500).json({ error: 'Failed to fetch project' });
    }
}