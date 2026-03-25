import express from "express";
import multer from "multer";
import { addProject, editProject, getProject } from "../controllers/cliController.js";

const cliRouter = express.Router();
const upload = multer({ dest: 'uploads/' });

// cliRouter.post('/add-project', upload.single('projectZip'), addProject);
cliRouter.post('/edit-project', upload.single('projectZip'), editProject);
cliRouter.post('/pull/:workspaceId', getProject);
export default cliRouter;
