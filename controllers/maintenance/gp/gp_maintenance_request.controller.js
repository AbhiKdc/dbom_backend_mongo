import { Op } from "sequelize";
import ApiError from "../../../utils/errors/apiError.js";
import asyncHandler from "../../../utils/errors/catchAsync.js";
import gp_equipment_details_model from "../../../database/schema/hoto_assets/gp_equipment_details.model.js";
import gp_maintenance_request_model from "../../../database/schema/maintenance/gp/gp_maintenance_request.schema.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import { StatusCodes } from "../../../utils/constants.js";
import { user_management_includes } from "../../user_management/contanst.js";

export const add_maintenance_request = asyncHandler(async (req, res, next) => {
    const userDetails = req.user;
    const { assets_ids, other_details } = req.body;

    if (!assets_ids || !Array.isArray(assets_ids)) {
        throw new ApiError("Assets id is required or assets id must be array");
    };

    const assets_details = await gp_equipment_details_model.findAll({
        where: {
            id: {
                [Op.in]: assets_ids,
            }
        }
    });

    if (assets_details.length === 0) {
        throw new ApiError("No assets found for the provided IDs", StatusCodes.NOT_FOUND);
    }

    const maintenance_request_data = assets_details?.map((ele) => {
        return {
            assets_id: ele?.id,
            assets_details: ele,
            repair_type: other_details?.repair_type,
            maintenance_type: other_details?.maintenance_type,
            issue_reported: other_details?.issue_reported,
            initiated_by: other_details?.initiated_by,
            remarks: other_details?.remarks,
            created_by: userDetails?.id,
            updated_by: userDetails?.id,
        }
    });

    const insert_maintenance_request_data = await gp_maintenance_request_model.bulkCreate(
        maintenance_request_data,
        { returning: true }
    );

    if (insert_maintenance_request_data?.length === 0) {
        throw new ApiError("Failed to create maintenance request", StatusCodes.BAD_REQUEST)
    }

    const response = new ApiResponse(
        StatusCodes.CREATED,
        "Maintenance request has been created",
        insert_maintenance_request_data
    );

    return res.status(StatusCodes.CREATED).json(response);
});

export const single_fetch_maintenance_request = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id) return next(new ApiError("id is required", StatusCodes.BAD_GATEWAY));

    const maintenance_request_data = await gp_maintenance_request_model.findOne({
        where: { id: id },
        include: [
            ...user_management_includes
        ]
    });
    if (!maintenance_request_data) {
        throw new ApiError("data not found", StatusCodes.NOT_FOUND)
    }

    const response = new ApiResponse(
        StatusCodes.OK,
        "Data fetch successfully",
        maintenance_request_data
    )

    return res.status(StatusCodes.OK).json(response);
});

export const listing_maintenance_request = asyncHandler(async (req, res, next) => {
    const search = req.query.search || null;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const filters = req.body?.filters || {}
    const sort_field = req.body?.sort_field || "createdAt"
    const sort = req.body?.sort || "desc"

    const matchQuery = {
        status: true
    };

    if (search) {
        const search_fields = ['firstName', 'lastName', 'email', 'mobileNo', 'address', 'state', 'city', '$organisation_details.organisationName$', '$department_details.departmentName$', '$team_details.teamName$'];
        const search_conditions = [];

        search_fields?.forEach((field) => {
            search_conditions.push({
                [field]: {
                    [Op.iLike]: `%${search}%`,
                },
            });
        });

        if (search_conditions?.length > 0) {
            matchQuery[Op.or] = search_conditions
        }
    }
    const filter_conditions = [];
    if (Object.keys(filters)?.length > 0) {
        for (let [field, value] of Object.entries(filters)) {
            switch (true) {
                case field?.includes('.'):
                    const [model, nested_field] = field?.split('.');
                    filter_conditions?.push({ [`$${model}.${nested_field}$`]: value });
                    break;

                case Array.isArray(value) && value?.length == 2:
                    filter_conditions.push({
                        [field]: {
                            [Op.between]: value,
                        },
                    });
                    break;

                case Array.isArray(value):
                    filter_conditions.push({
                        [field]: {
                            [Op.in]: value,
                        },
                    });
                    break;
                case value instanceof Date:
                    filter_conditions.push({
                        [field]: {
                            [Op.eq]: value,
                        },
                    });
                    break;

                default:
                    filter_conditions?.push({ [field]: value });
                    break;
            }
        }
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const order = [[sort_field, sort?.toUpperCase()]];

    const { rows, count } = await user_model.findAndCountAll({
        where: {
            ...matchQuery,
            [Op.and]: filter_conditions
        },
        include: [
            ...user_management_includes,
            {
                model: organisation_model,
                required: true,
                as: 'organisation_details',
                attributes: ["id", "organisationName"]
            },
            {
                model: department_model,
                required: true,
                as: 'department_details',
                attributes: ["id", "departmentName"]
            },
            {
                model: team_model,
                required: true,
                as: 'team_details',
                attributes: ["id", "teamName"]
            }
        ],
        offset,
        limit: parseInt(limit),
        order,
    });

    const total_pages = Math.ceil(count / limit);

    const response = new ApiResponse(
        StatusCodes.OK,
        "user details fetched successfully",
        { data: rows, total_pages: total_pages }
    );
    return res.status(StatusCodes.OK).json(response);
})