import { Router } from "express";
import block_replacement_router from "./block/block.routes.js";
import gp_replacement_router from "./gp/gp.routes.js";

const all_o_and_m_routes = Router();

all_o_and_m_routes.use("/block-replacement", block_replacement_router)
all_o_and_m_routes.use("/gp-replacement", gp_replacement_router)

export default all_o_and_m_routes;