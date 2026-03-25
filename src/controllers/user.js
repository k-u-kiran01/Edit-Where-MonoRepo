
import prisma from "../db.js";
import driveService from "../config/drive.js";
import crypto from "crypto";
import { Readable } from "stream";

export const addProject = async (req,res) => {
    const { id:userId } = req.user;
    const { name } = req.body;
    if(!name || name.trim() === ""){
        return res.status(400).json({ message: "Workspace name is required." });
    }
    try{
        const newworkspace = await prisma.RootDirectory.create({
            data: {
                name: name.trim(),
                userId: userId
            }
        })
        return res.status(201).json({
            message: "Workspace created successfully",
            workspaceId: newworkspace.id,
            workspace: newworkspace
        })
    }catch(err){
        console.error(err);
        return res.status(500).json({ message: "Cannot Create New Workspace" })
    }
}

export const getProjects = async (req,res) => {
    const { id } = req.user;
    try {
        const projects = await prisma.RootDirectory.findMany({
            where: { userId: id },
            select: {
                id: true,
                name: true,
                createdAt: true,
            }
        });
        res.status(200).json(projects);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getProjectFiles = async (req,res) => {
    // const { id } = req.user;
    const workspaceId = parseInt(req.params.workspaceId);
    try{
        const rootDirectory = await prisma.rootDirectory.findUnique({
            where: {id: workspaceId},
            include: {
                files: true
            }
        })
        if(!rootDirectory){
            return res.status(404).json({ message: "Workspace not foung" })
        }
        const formattedWorkspace = {
            ...rootDirectory,
            files: rootDirectory.files.map(file => ({
                ...file,
                workspaceId: file.rootDirectoryId
            }))
        }
        res.status(200).json(formattedWorkspace);
    }catch(error){
        console.error("Failed to fetch workspace:",error);
        res.status(500).json({ message: "Server error" });
        
    }
}

export const getFileContent = async (req,res) => {
    const { id } = req.user;
    const fileId = parseInt(req.params.fileId);

    if(!fileId || isNaN(fileId)){
        return res.status(400).json({ message: "Invalid file ID" });
    }

    try {
        const file = await prisma.File.findUnique({
            where: { id: fileId },
            select: {
                filePath: true,
                driveFileId: true,
        }});
        if(!file){
            return res.status(404).json({ message: "File not found" });
        }
        const driveResponse = await driveService.files.get(
            {fileId: file.driveFileId, alt: 'media'},
            { responseType: 'text' }
        );
        res.status(200).json({ 
            filePath: file.filePath,
            content: driveResponse.data 
        });
    }catch(error){
        console.error(" Error fetching file content: ", error);
        res.status(500).json({ message: "Failed to fetch file content" });
    }
}

export const updateFileContent = async (req,res) => {
    const fileId = parseInt(req.params.fileId);
    const { content } = req.body;
    if(!fileId || isNaN(fileId)){
        return res.status(400).json({ message: "Invalid file ID" });
    }
    if(content === undefined){
        return res.status(400).json({ message: "File content must be provided." });
    }
    try{
        const file = await prisma.File.findUnique({
            where: { id: fileId },
            select: {
                id: true,
                driveFileId: true,
            }
        });
        if(!file){
            return res.status(404).json({ message: "File not found" });
        }
        const newHash = crypto.createHash('sha256').update(content).digest('hex');
        await driveService.files.update({
            fileId: file.driveFileId,
            media: {
                mimeType: 'text/plain',
                body: Readable.from([content]),
            },
        });
        await prisma.File.update({
            where: { id: fileId },
            data: { fileHash: newHash },
        });
        res.status(200).json({ message: "File saved successfully.", newHash: newHash });
    }catch(error){
        console.error("Error saving file: ", error);
        res.status(500).json({ message: "Failed to save file." });
    }

}
 