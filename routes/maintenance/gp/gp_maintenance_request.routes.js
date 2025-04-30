import express from "express";
import AuthMiddleware from "../../../middlewares/verifyToken.js";
import { add_maintenance_request, listing_maintenance_request, single_fetch_maintenance_request } from "../../../controllers/maintenance/gp/gp_maintenance_request.controller.js";

const gp_maintenance_request_router = express.Router();

gp_maintenance_request_router.post("/add-maintenance-request",AuthMiddleware,add_maintenance_request);
gp_maintenance_request_router.post("/listing-maintenance-request",AuthMiddleware,listing_maintenance_request);
gp_maintenance_request_router.get("/single-maintenance-request/:id",AuthMiddleware,single_fetch_maintenance_request);

export default gp_maintenance_request_router;