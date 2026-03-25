import { Router } from "express";
import { getProjects, getProjectFiles, getFileContent, updateFileContent, addProject, addFile } from "../controllers/user.js";

const webRouter = Router();

webRouter.post('/workspaces',addProject);
webRouter.get('/workspaces', getProjects);
webRouter.get('/workspaces/:workspaceId', getProjectFiles);
webRouter.get('/files/:fileId', getFileContent);
webRouter.put('/files/:fileId', updateFileContent);
webRouter.post('/workspaces/:workspaceId/files', addFile);
export default webRouter;