import { Router } from "express";
import { add_supplier, list_all_supplier_with_branches, dropdown_supplier_master } from "../../../controllers/masters/supplier/supplier.controller.js";
import AuthMiddleware from "../../../middlewares/verifyToken.js";

const supplier_router = Router();

supplier_router.post("/add", AuthMiddleware, add_supplier);
// supplier_router.patch("/update/:id", AuthMiddleware, update_block)
supplier_router.post("/list", AuthMiddleware, list_all_supplier_with_branches)
supplier_router.get("/dropdown", AuthMiddleware, dropdown_supplier_master);


export default supplier_router