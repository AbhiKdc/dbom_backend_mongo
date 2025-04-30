import { Router } from "express";
import { add_package, dropdown_packages, list_all_packages, updated_package } from "../../../controllers/masters/package/package.controller.js";
import AuthMiddleware from "../../../middlewares/verifyToken.js";

const package_router = Router();

package_router.post("/add", AuthMiddleware, add_package);
package_router.patch("/update/:id", AuthMiddleware, updated_package)
package_router.post("/list", AuthMiddleware, list_all_packages)
package_router.get("/dropdown", AuthMiddleware, dropdown_packages);


export default package_router