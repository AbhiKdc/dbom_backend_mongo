import { Router } from "express";
import { add_district, dropdown_district, list_all_districts, updated_district } from "../../../controllers/masters/district/district.controller.js";
import AuthMiddleware from "../../../middlewares/verifyToken.js";

const district_router = Router();

district_router.post("/add", AuthMiddleware, add_district);
district_router.patch("/update/:id", AuthMiddleware, updated_district)
district_router.post("/list", AuthMiddleware, list_all_districts)
district_router.get("/dropdown", AuthMiddleware, dropdown_district);


export default district_router