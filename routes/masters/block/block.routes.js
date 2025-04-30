import { Router } from "express";
import { add_block, dropdown_block, list_all_blocks, update_block } from "../../../controllers/masters/block/block.controller.js";
import AuthMiddleware from "../../../middlewares/verifyToken.js";

const block_router = Router();

block_router.post("/add", AuthMiddleware, add_block);
block_router.patch("/update/:id", AuthMiddleware, update_block)
block_router.post("/list", AuthMiddleware, list_all_blocks)
block_router.get("/dropdown", AuthMiddleware, dropdown_block);


export default block_router