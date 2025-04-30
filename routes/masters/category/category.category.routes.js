import { Router } from "express";
import { add_category, dropdown_categories, list_all_category, updated_category } from "../../../controllers/masters/category/category.controller.js";
import AuthMiddleware from "../../../middlewares/verifyToken.js";

const category_router = Router();

category_router.post("/add", AuthMiddleware, add_category);
category_router.patch("/update/:id", AuthMiddleware, updated_category)
category_router.post("/list", AuthMiddleware, list_all_category)
category_router.get("/dropdown", AuthMiddleware, dropdown_categories);


export default category_router