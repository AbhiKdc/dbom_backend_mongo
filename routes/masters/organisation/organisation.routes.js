import { Router } from "express";
import { add_organisation, dropdown_organisation, list_all_organisation, update_organisation } from "../../../controllers/masters/organisation/organisation.controller.js";
import AuthMiddleware from "../../../middlewares/verifyToken.js";

const organisation_router = Router();

organisation_router.post("/add", AuthMiddleware, add_organisation);
organisation_router.patch("/update/:id", AuthMiddleware, update_organisation)
organisation_router.post("/list", AuthMiddleware, list_all_organisation)
organisation_router.get("/dropdown", AuthMiddleware, dropdown_organisation);


export default organisation_router