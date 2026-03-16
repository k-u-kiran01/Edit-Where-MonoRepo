import { Router } from "express";
import { getProjects, getProjectFiles, getFileContent, updateFileContent } from "../controllers/user";

const webRouter = Router();

webRouter.get('/projects', getProjects);
webRouter.get('/projects/:workspaceId', getProjectFiles);
webRouter.get('/files/:fileId', getFileContent);
webRouter.put('/files/:fileId', updateFileContent);

export default webRouter;