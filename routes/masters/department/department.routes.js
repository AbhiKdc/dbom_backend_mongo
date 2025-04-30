import { Router } from "express";
import { add_department, dropdown_department, list_all_department, update_department } from "../../../controllers/masters/department/department.controller.js";
import AuthMiddleware from "../../../middlewares/verifyToken.js";

const departmnet_router = Router();

departmnet_router.post("/add", AuthMiddleware, add_department);
departmnet_router.patch("/update/:id", AuthMiddleware, update_department)
departmnet_router.post("/list", AuthMiddleware, list_all_department)
departmnet_router.get("/dropdown", AuthMiddleware, dropdown_department);


export default departmnet_router