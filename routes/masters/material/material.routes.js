import { Router } from "express";
import { add_material, update_material, dropdown_material, list_all_material } from "../../../controllers/masters/material/material.controller.js";

import AuthMiddleware from "../../../middlewares/verifyToken.js";

const material_router = Router();

material_router.post("/add", AuthMiddleware, add_material);
material_router.patch("/update/:id", AuthMiddleware, update_material)
material_router.post("/list", AuthMiddleware, list_all_material)
material_router.get("/dropdown", AuthMiddleware, dropdown_material);


export default material_router