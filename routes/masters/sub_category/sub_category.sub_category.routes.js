import { Router } from "express";
import { add_subcategory, dropdown_subcategories, list_all_sub_category, updated_subcategory } from "../../../controllers/masters/subcategory/subcategory.controller.js";

import AuthMiddleware from "../../../middlewares/verifyToken.js";

const sub_category_router = Router();

sub_category_router.post("/add", AuthMiddleware, add_subcategory);
sub_category_router.patch("/update/:id", AuthMiddleware, updated_subcategory)
sub_category_router.post("/list", AuthMiddleware, list_all_sub_category)
sub_category_router.get("/dropdown", AuthMiddleware, dropdown_subcategories);


export default sub_category_router