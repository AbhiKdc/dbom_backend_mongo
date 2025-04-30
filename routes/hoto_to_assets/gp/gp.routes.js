import { Router } from "express";
import { add_gp_replacement_request, fetch_all_gp_replacement_request } from "../../../controllers/hoto_to_assets/gp/gp.controller.js";
import AuthMiddleware from "../../../middlewares/verifyToken.js";

const gp_replacement_router = Router();

gp_replacement_router.post("/add", AuthMiddleware, add_gp_replacement_request);
gp_replacement_router.post("/list", AuthMiddleware, fetch_all_gp_replacement_request)


export default gp_replacement_router