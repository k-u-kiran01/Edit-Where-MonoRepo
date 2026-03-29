import { Router } from "express";
import { checkAuthController, loginController, logoutController, validateOTP } from "../controllers/login.js";
import { requireAuth } from "../middleware/webAuth.js";
import { getKeys, addKey, deleteKey } from "../controllers/login.js";
const loginRouter = Router();

loginRouter.get('/me', requireAuth, checkAuthController)

loginRouter.post('/login', loginController)

loginRouter.post('/validate-otp', validateOTP);

loginRouter.post('/logout',requireAuth, logoutController);

loginRouter.get('/keys', requireAuth, getKeys);

loginRouter.post('/keys', requireAuth, addKey);

loginRouter.delete('/keys/:id', requireAuth, deleteKey);

export default loginRouter;