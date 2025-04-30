import { Router } from "express";
import { add_hsn_code, dropdown_hsn_code, list_all_hsn_code, update_hsn_code } from "../../../controllers/masters/hsn_code/hsn_code.controller.js";

import AuthMiddleware from "../../../middlewares/verifyToken.js";

const hsn_code_router = Router();

hsn_code_router.post("/add", AuthMiddleware, add_hsn_code);
hsn_code_router.patch("/update/:id", AuthMiddleware, update_hsn_code)
hsn_code_router.post("/list", AuthMiddleware, list_all_hsn_code)
hsn_code_router.get("/dropdown", AuthMiddleware, dropdown_hsn_code);


export default hsn_code_router