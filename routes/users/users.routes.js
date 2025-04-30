import express from "express";
import { addUser, editUser, listingUsersDetails, singleFetchUser, userChangePassword } from "../../controllers/user_management/user.controller.js";
import AuthMiddleware from "../../middlewares/verifyToken.js";
const userRouter = express.Router();

userRouter.post("/add-user-details",AuthMiddleware,addUser);
userRouter.patch("/edit-user-details/:id",AuthMiddleware,editUser);
userRouter.get("/single-user-details/:id",AuthMiddleware,singleFetchUser);
userRouter.get("/reset-password/:id",AuthMiddleware,userChangePassword);
userRouter.post("/fetch-user-details",AuthMiddleware,listingUsersDetails);

export default userRouter;