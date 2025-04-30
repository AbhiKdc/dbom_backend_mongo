import { Router } from "express";
import { add_block_replacement_request, fetch_all_block_replacement_request } from "../../../controllers/hoto_to_assets/block/block.controller.js";
import AuthMiddleware from "../../../middlewares/verifyToken.js";

const block_replacement_router = Router();

block_replacement_router.post("/add", AuthMiddleware, add_block_replacement_request);
block_replacement_router.post("/list", AuthMiddleware, fetch_all_block_replacement_request)


export default block_replacement_router