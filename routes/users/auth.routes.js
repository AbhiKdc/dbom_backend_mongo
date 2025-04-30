import express from "express";
import AuthMiddleware from "../../middlewares/verifyToken.js";
import { loginUser, userSendOTP, userUpdatePassword, userVerifyOtp } from "../../controllers/user_management/user.controller.js";
const authRouter = express.Router();

authRouter.post("/sign-in",loginUser);
authRouter.post("/forget-password/send-otp",userSendOTP);
authRouter.post("/forget-password/verify-otp",userVerifyOtp);
authRouter.post("/forget-password/update-password",userUpdatePassword);

export default authRouter;