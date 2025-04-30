import { Router } from "express";
import package_router from "./package/package.routes.js";
import block_router from "./block/block.routes.js";
import district_router from "./district/district.routes.js";
import organisation_router from "./organisation/organisation.routes.js";
import departmnet_router from "./department/department.routes.js";
import team_router from "./team/team.routes.js";
import gp_router from "./gp/gp.routes.js";
import category_router from "./category/category.category.routes.js";
import sub_category_router from "./sub_category/sub_category.sub_category.routes.js";
import hsn_code_router from "./hsn_code/hsn_code.routes.js";
import gst_router from "./gst/gst.routes.js";
import material_router from "./material/material.routes.js";
import uom_router from "./uom/uom.routes.js";
// import supplier_router from "./supplier/supplier.routes.js";
import warehouseRoute from "./warehouse/warehouse.routes.js";

const all_master_router = Router();

all_master_router.use("/package", package_router);
all_master_router.use("/block", block_router);
all_master_router.use("/district", district_router);
all_master_router.use("/gp", gp_router);
all_master_router.use("/organisation", organisation_router)
all_master_router.use("/department", departmnet_router)
all_master_router.use("/team", team_router)
all_master_router.use("/category", category_router)
all_master_router.use("/sub-category", sub_category_router)
all_master_router.use("/hsn-code", hsn_code_router)
all_master_router.use("/gst", gst_router)
all_master_router.use("/uom", uom_router)
all_master_router.use("/material", material_router);
// all_master_router.use("/supplier", supplier_router);
all_master_router.use("/warehouse", warehouseRoute)

export default all_master_router;