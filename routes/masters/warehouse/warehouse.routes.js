import express from 'express';
import { add_warehouse, dropdown_warehouse, fetch_single_warehouse, listingWarehouseDetails, update_warehouse } from '../../../controllers/masters/warehouse/warehouse.controller.js';
import AuthMiddleware from '../../../middlewares/verifyToken.js';
const warehouseRoute = express.Router();

warehouseRoute.post("/add", AuthMiddleware, add_warehouse);
warehouseRoute.patch("/update/:id", AuthMiddleware, update_warehouse);
warehouseRoute.post("/list", AuthMiddleware, listingWarehouseDetails);
warehouseRoute.get("/single-fetch/:id", AuthMiddleware, fetch_single_warehouse);
warehouseRoute.get("/dropdown", AuthMiddleware, dropdown_warehouse);

export default warehouseRoute;