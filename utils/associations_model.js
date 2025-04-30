import { warehouse_aasociate } from "../controllers/masters/warehouse/warehouse.associate.js";
import { user_association } from "../controllers/user_management/user.association.js";
import gp_details_model from "../database/schema/hoto_assets/gp_details_model.js";
import gp_electrical_details_model from "../database/schema/hoto_assets/gp_electrical_details.model.js";
import gp_equipment_details_model from "../database/schema/hoto_assets/gp_equipment_details.model.js";
import block_model from "../database/schema/masters/block.schema.js";
import category_model from "../database/schema/masters/category.schema.js";
import department_model from "../database/schema/masters/department.schema.js";
import district_model from "../database/schema/masters/district.schema.js";
import gp_model from "../database/schema/masters/gp.schema.js";
import gst_model from "../database/schema/masters/gst.schema.js";
import hsn_code_model from "../database/schema/masters/hsn_code.schema.js";
import material_model from "../database/schema/masters/material.schema.js";
import organisation_model from "../database/schema/masters/organisation.schema.js";
import package_model from "../database/schema/masters/package.schema.js";
import sub_category_model from "../database/schema/masters/sub_category.schema.js";
import team_model from "../database/schema/masters/team.schema.js";
import uom_model from "../database/schema/masters/uom.schema.js";
import supplier_model from "../database/schema/masters/supplier.schema.js";
import supplier_branch_model from "../database/schema/masters/supplier.branches.schema.js";
import user_model from "../database/schema/user_management/user.schema.js";
import { add_user_associations } from "./constants.js";
import block_replacement_model from "../database/schema/hoto_assets/block/block.replacement.schema.js";
import gp_replacement_model from "../database/schema/hoto_assets/gp/gp.replacement.schema.js";


const init_association_models = async () => {
    //USER
    user_association();
    warehouse_aasociate();

    gp_details_model.hasMany(gp_electrical_details_model, { foreignKey: "gp_id" })
    gp_electrical_details_model.belongsTo(gp_details_model, { foreignKey: "gp_id" })
    gp_details_model.hasMany(gp_equipment_details_model, { foreignKey: "gp_id" })
    gp_equipment_details_model.belongsTo(gp_details_model, { foreignKey: "gp_id" });

    //package model associations
    package_model.hasMany(district_model, { foreignKey: "packageId" })
    district_model.belongsTo(package_model, { foreignKey: "packageId", as: "package_details" })
    district_model.belongsTo(user_model, { foreignKey: "createdBy", as: "created_user_details" })
    district_model.belongsTo(user_model, { foreignKey: "updatedBy", as: "updated_user_details" })
    package_model.belongsTo(user_model, { foreignKey: "updatedBy", as: "updated_user_details" })
    package_model.belongsTo(user_model, { foreignKey: "createdBy", as: "created_user_details" })
    block_model.belongsTo(user_model, { foreignKey: "createdBy", as: "created_user_details" })
    block_model.belongsTo(user_model, { foreignKey: "updatedBy", as: "updated_user_details" })
    district_model.hasOne(block_model, { foreignKey: "blockId" })
    package_model.hasMany(block_model, { foreignKey: "packageId" })
    block_model.belongsTo(package_model, { foreignKey: "packageId", as: "package_details" })
    block_model.belongsTo(district_model, { foreignKey: "districtId", as: "district_details" });
    department_model.belongsTo(organisation_model, { foreignKey: "organisationId", as: "organisation_details" })
    team_model.belongsTo(department_model, { foreignKey: "departmentId", as: "department_details" });
    sub_category_model.belongsTo(category_model, { foreignKey: "categoryId", as: "category_details" })
    hsn_code_model.belongsTo(gst_model, { foreignKey: "gstId", as: "gst_details" })


    //user assocaitions
    const models_for_user_associations = [organisation_model, department_model, team_model, gp_model, category_model, sub_category_model, uom_model, hsn_code_model, gst_model, material_model, supplier_model, supplier_branch_model, block_replacement_model, gp_details_model, gp_replacement_model];
    models_for_user_associations?.forEach(model => add_user_associations(model, user_model));

    const gp_association_models = [
        { model: package_model, as: 'package_details', foreignKey: 'packageId' },
        { model: district_model, as: 'district_details', foreignKey: 'districtId' },
        { model: block_model, as: 'block_details', foreignKey: 'blockId' },
    ];

    gp_association_models?.forEach(({ model, as, foreignKey }) => gp_model.belongsTo(model, { foreignKey, as }))
    const material_association_models = [
        { model: category_model, as: 'category_details', foreignKey: 'categoryId' },
        { model: sub_category_model, as: 'subcategory_details', foreignKey: 'subCategoryId' },
        { model: uom_model, as: 'uom_details', foreignKey: 'uomId' },
        { model: hsn_code_model, as: 'hsn_code_details', foreignKey: 'hsnCodeId' },
    ];

    material_association_models?.forEach(({ model, as, foreignKey }) => material_model.belongsTo(model, { foreignKey, as }));
    supplier_model.hasMany(supplier_branch_model, { foreignKey: "supplierId", as: "branch_details" });
    // supplier_branch_model.belongsToMany(material_model, { through: supplier_branch_model, foreignKey: "materials", as: "material_details" })


    //block replacement
    block_replacement_model.belongsTo(gp_equipment_details_model, { foreignKey: "block_asset_id", as: "equipment_details" })
    gp_replacement_model.belongsTo(gp_equipment_details_model, { foreignKey: "gp_asset_id", as: "equipment_details" })
};

export default init_association_models;