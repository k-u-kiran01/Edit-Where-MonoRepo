import { Router } from "express";
import { loginController, validateOTP } from "../controllers/login.js";
import { requireAuth } from "../middleware/webAuth.js";
const loginRouter = Router();

loginRouter.post('/login', loginController)

loginRouter.post('/validate-otp', validateOTP);

loginRouter.get('/keys', requireAuth, getKeys);

loginRouter.post('/keys', requireAuth, addKey);

loginRouter.delete('/keys', requireAuth, deleteKey);

export default loginRouter;