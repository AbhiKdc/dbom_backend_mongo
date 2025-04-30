import { Router } from "express";
import { add_gst, dropdown_gst, list_all_gst, updated_gst } from "../../../controllers/masters/gst/gst.controller.js";


import AuthMiddleware from "../../../middlewares/verifyToken.js";

const gst_router = Router();

gst_router.post("/add", AuthMiddleware, add_gst);
gst_router.patch("/update/:id", AuthMiddleware, updated_gst)
gst_router.post("/list", AuthMiddleware, list_all_gst)
gst_router.get("/dropdown", AuthMiddleware, dropdown_gst);


export default gst_router