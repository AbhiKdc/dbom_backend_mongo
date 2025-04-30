import { Router } from "express";
import { add_gp, dropdown_gp, list_all_gp, update_gp } from "../../../controllers/masters/gp/gp.controller.js";
import AuthMiddleware from "../../../middlewares/verifyToken.js";

const gp_router = Router();

gp_router.post("/add", AuthMiddleware, add_gp);
gp_router.patch("/update/:id", AuthMiddleware, update_gp)
gp_router.post("/list", AuthMiddleware, list_all_gp)
gp_router.get("/dropdown", AuthMiddleware, dropdown_gp);


export default gp_router