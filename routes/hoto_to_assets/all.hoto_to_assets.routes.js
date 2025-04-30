import { Router } from "express";
import block_replacement_router from "./block/block.routes.js";
import gp_replacement_router from "./gp/gp.routes.js";

const all_hoto_routes = Router();

all_hoto_routes.use("/block-replacement", block_replacement_router)
all_hoto_routes.use("/gp-replacement", gp_replacement_router)

export default all_hoto_routes;