import { Router } from "express";
import { add_uom, dropdown_uom, list_all_uom, updated_uom } from "../../../controllers/masters/uom/uom.controller.js";

import AuthMiddleware from "../../../middlewares/verifyToken.js";

const uom_router = Router();

uom_router.post("/add", AuthMiddleware, add_uom);
uom_router.patch("/update/:id", AuthMiddleware, updated_uom)
uom_router.post("/list", AuthMiddleware, list_all_uom)
uom_router.get("/dropdown", AuthMiddleware, dropdown_uom);


export default uom_router