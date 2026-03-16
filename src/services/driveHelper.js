import fs from 'fs';
import driveService from '../config/drive.js';
import { pipeline } from 'stream/promises';
/**
 * Uploads a single file to Google Drive.
 * * @param {string} localFilePath - The absolute path to the file on your server (e.g., './uploads/app.js')
 * @param {string} driveFileName - What the file should be named in Google Drive
 * @param {string} mimeType - The type of file (e.g., 'text/plain', 'application/json')
 * @param {string} folderId - (Optional) The Google Drive folder ID to put it in
 * @returns {Promise<string>} - Returns the new Google Drive File ID
 */

export const uploadFileToDrive = async (localFilePath, driveFileName, mimeType= 'text/plain', folderId = null) => {
    try{
        const fileMetadata = {
            name: driveFileName,
            parents: folderId ? [folderId] : [] 
        };
        const media = {
            mimeType: mimeType,
            body: fs.createReadStream(localFilePath)
        };
        const response = await driveService.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        });
        console.log(`File ${driveFileName} uploaded successfully with ID: ${response.data.id}`);
        return response.data.id;
    } catch (error) {
        console.error(`Failed to upload ${driveFileName}:`, error.message);
        throw error;
    }
}

export const updateFileInDrive = async (fileId, localFilePath, mimeType = 'text/plain') => {
    try {
        const media = {
            mimeType: mimeType,
            body: fs.createReadStream(localFilePath)
        };
        await driveService.files.update({
            fileId: fileId,
            media: media
        });

        console.log(`File with ID ${fileId} updated successfully.`);
        return fileId;
    } catch (error) {
        console.error(`Failed to update file with ID ${fileId}:`, error.message);
        throw error;
    }
}

export const deleteFileFromDrive = async (fileId) => {
    try {
        await driveService.files.delete({ fileId: fileId });
        console.log(`File with ID ${fileId} deleted successfully.`);
    } catch (error) {
        console.error(`Failed to delete file with ID ${fileId}:`, error.message);
        throw error;
    }
}

export const downloadFileFromDrive = async (fileId, desPath) => {
    try{
        const dest = fs.createWriteStream(desPath);
        const response = await driveService.files.get({
            fileId: fileId,
            alt: 'media'
        }, { responseType: 'stream' });

        await pipeline(response.data, dest);

        return desPath;
    }catch (error) {
        console.error(`Failed to download file with ID ${fileId}:`, error.message);
        throw error;
    }
}
