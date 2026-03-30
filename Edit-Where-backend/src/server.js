import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import driveService from './config/drive.js';
import 'dotenv/config';
import cliRouter from './routes/cliRoutes.js';
import { requireCliAuth } from './middleware/clientAuth.js';
import { requireAuth } from './middleware/webAuth.js';
import webRouter from './routes/webRoutes.js';
import loginRouter from './routes/loginRoutes.js';

const app = express();
const frontend_url = process.env.FRONTEND_URL;
app.use(cors({
    origin: frontend_url,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT

app.use('/api/v1/cli', requireCliAuth, cliRouter);
app.use('/api/v1/web', requireAuth, webRouter);
app.use('/api/v1/auth', loginRouter);

app.get('/api/test-drive', async (req, res) => {
    try {
        // Let's ask Google Drive to list the first 5 files it can see
        const response = await driveService.files.list({
            pageSize: 5,
            fields: 'nextPageToken, files(id, name)',
        });

        const files = response.data.files;
        
        if (files.length === 0) {
            return res.json({ message: "Connected! But the Drive is empty." });
        } else {
            return res.json({ 
                message: "Success! Here is what the robot sees:", 
                files: files 
            });
        }
    } catch (error) {
        console.error("Google Drive API Error:", error);
        return res.status(500).json({ error: "Failed to connect to Google Drive." });
    }
});

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})
