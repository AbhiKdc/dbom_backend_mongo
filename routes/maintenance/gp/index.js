import express from 'express';
import gp_maintenance_request_router from './gp_maintenance_request.routes.js';

const maintenance_router = express.Router();

maintenance_router.use("/gp-maintenance-request",gp_maintenance_request_router);

export default maintenance_router;