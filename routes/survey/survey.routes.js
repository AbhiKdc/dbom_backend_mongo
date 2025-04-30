import { Router } from "express";
import { add_survey_data, fetch_block_details, fetch_equipment_details_by_block, fetch_equipment_details_by_gp, fetch_gp_details } from "../../controllers/hoto_to_assets/gp/gp.controller.js";

const survey_router = Router();

survey_router.post("/add", add_survey_data);
survey_router.post("/list-gp-details", fetch_gp_details);
survey_router.post("/list-gp-equipment-details", fetch_equipment_details_by_gp);
survey_router.post("/list-block-equipment-details", fetch_equipment_details_by_block);
survey_router.post("/list-block-details", fetch_block_details);
export default survey_router;