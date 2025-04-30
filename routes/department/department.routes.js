import { Router } from "express";
import { add_department, dropdown_department, list_all_department, update_department } from '../../controllers/masters/department/department.controller.js';
import AuthMiddleware from "../../../middlewares/verifyToken.js";

const department_router = Router();

department_router.post("/add", AuthMiddleware, add_department);
department_router.patch("/update/:id", AuthMiddleware, update_department)
department_router.post("/list", AuthMiddleware, list_all_department)
department_router.get("/dropdown", AuthMiddleware, dropdown_department);


export default department_router