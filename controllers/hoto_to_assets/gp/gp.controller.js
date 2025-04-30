import ApiError from '../../../utils/errors/apiError.js';
import asyncHandler from '../../../utils/errors/catchAsync.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import sequlize from '../../../database/postgres.service.js';
import gp_details_model from '../../../database/schema/hoto_assets/gp_details_model.js';
import gp_equipment_details_model from '../../../database/schema/hoto_assets/gp_equipment_details.model.js';
import gp_electrical_details_model from '../../../database/schema/hoto_assets/gp_electrical_details.model.js';
import { build_sort_order, StatusCodes } from '../../../utils/constants.js';
import { Op, Sequelize } from 'sequelize';
import gp_replacement_model from '../../../database/schema/hoto_assets/gp/gp.replacement.schema.js';
import { dynamic_search } from '../../../utils/dynamicSearch/dynamic.js';
import { dynamic_filter } from '../../../utils/dymanicFilter.js';
import user_model from '../../../database/schema/user_management/user.schema.js';
import { user_management_includes } from '../../user_management/contanst.js';

export const add_survey_data = asyncHandler(async (req, res) => {
    const { gp_details, equipment_details, electrical_details } = req.body;

    for (let field of ['gp_details', 'equipment_details', 'electrical_details']) {
        if (!req.body[field]) {
            throw new ApiError(`${field} is missing.`);
        }
    };
    if (!Array.isArray(equipment_details) || equipment_details?.length === 0) {
        throw new ApiError("equipment_details must be a non-empty array.");
    }

    if (!Array.isArray(electrical_details) || electrical_details?.length === 0) {
        throw new ApiError("electrical_details must be a non-empty array.");
    }

    const transaction = await sequlize.transaction();
    try {
        const add_gp_details_result = await gp_details_model.create(gp_details, { transaction });

        const updated_equipment_details = equipment_details?.map((item) => ({ ...item, gp_id: add_gp_details_result?.id }))
        const updated_electrical_details = electrical_details?.map((item) => ({ ...item, gp_id: add_gp_details_result?.id }));

        const add_equipment_result = await gp_equipment_details_model.bulkCreate(updated_equipment_details, { transaction, returning: true });
        const add_electrical_result = await gp_electrical_details_model.bulkCreate(updated_electrical_details, { transaction, returning: true });

        if (!add_gp_details_result || add_equipment_result?.length === 0 || add_electrical_result?.length === 0) {
            throw new ApiError("Failed to add survey data.", StatusCodes.BAD_REQUEST);
        }
        const response = new ApiResponse(StatusCodes.CREATED, "Survey details added successfully.", add_gp_details_result?.toJSON());
        await transaction.commit();
        return res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

export const fetch_gp_details = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, sort_field = "updated_at", sortBy = "desc" } = req.query;
    const filters = req.body.filters || {}
    let search_query = {};
    const filter_conditions = [];
    if (search) {
        const field_types = {
            type: 'integer',
            gp_name: 'string',
            state: 'string',
            gp_id: 'integer',
            gp_code: 'integer',
            block_id: 'integer',
            "block.name": 'string'
        };

        const search_conditions = [];

        for (const [field, type] of Object.entries(field_types)) {
            let condition;

            switch (true) {
                case field.includes('.'): {
                    const [model, nested_field] = field.split('.');
                    condition = Sequelize.where(
                        Sequelize.cast(Sequelize.col(`$${model}.${nested_field}$`), 'TEXT'),
                        { [Op.iLike]: `%${search}%` }
                    );
                    break;
                }
                case type !== 'string': {
                    condition = Sequelize.where(
                        Sequelize.cast(Sequelize.col(field), 'TEXT'),
                        { [Op.iLike]: `%${search}%` }
                    );
                    break;
                }
                default: {
                    condition = {
                        [field]: {
                            [Op.iLike]: `%${search}%`,
                        },
                    };
                }
            }

            search_conditions.push(condition);
        }

        search_query = search_conditions.length > 0 ? { [Op.or]: search_conditions } : {};
    }


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

    const match_query = {
        [Op.and]: [
            search_query,
            { type: { [Op.ne]: 1 } },
            ...filter_conditions
        ]
    };


    const offset = (parseInt(page) - 1) * parseInt(limit);
    const order = [[sort_field, sortBy?.toUpperCase()]];

    const { rows, count } = await gp_details_model.findAndCountAll({
        where: match_query,
        include: [
            {
                model: gp_equipment_details_model,
                required: true,
            },
            {
                model: gp_electrical_details_model,
                required: true,
            },
        ], offset, limit: parseInt(limit), order

    });
    const response = new ApiResponse(StatusCodes.OK, "GP Details fetched successfully", { data: rows, total_pages: Math.ceil(count / limit) });
    return res.status(StatusCodes.OK).json(response)
})

export const fetch_equipment_details_by_gp = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, sort_field = "updated_at", sortBy = "desc" } = req.query;
    const filters = req.body?.filters || {}
    let search_query = {};
    const filter_conditions = []

    if (search) {
        const search_fields = ["condition", "condition_status", "gp_id"];
        const search_conditions = []

        search_fields?.forEach((field) => {
            search_conditions.push({
                [field]: {
                    [Op.iLike]: `%${search}%`
                }
            })
        });

        const nested_fields = ["gp_details.gp_id", "gp_details.gp_name"];

        nested_fields.forEach((field) => {
            const [model, nested_field] = field.split(".");
            search_conditions.push({
                [`$${model}.${nested_field}$`]: {
                    [Op.iLike]: `%${search}%`
                }
            })
        });

        search_conditions?.length > 0 ? search_query = { [Op.or]: search_conditions } : {}
    };
    console.log(search_query)

    for (let [field, value] of Object.entries(filters)) {
        switch (true) {
            case field?.includes("."):
                const [model, nested_field] = field?.split(".");
                filter_conditions?.push({ [`$${model}.${nested_field}$`]: value });
                break;

            case Array.isArray(value) && value?.length == 2:
                filter_conditions.push({
                    [field]: {
                        [Op.between]: value
                    }
                });
                break;

            case Array.isArray(value):
                filter_conditions.push({
                    [field]: {
                        [Op.in]: value
                    }
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

    const match_query = {
        [Op.and]: [
            search_query,
            { '$gp_detail.type$': { [Op.ne]: 1 } },
            ...filter_conditions
        ]
    };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const order = [[sort_field, sortBy?.toUpperCase()]];

    const { rows, count } = await gp_equipment_details_model.findAndCountAll({
        where: match_query,
        include: [
            {
                model: gp_details_model,
                required: true,
                include: [
                    { model: gp_electrical_details_model, required: true }
                ]
            },
        ], offset, limit: parseInt(limit), order

    });
    const response = new ApiResponse(StatusCodes.OK, "GP Details fetched successfully", { data: rows, total_pages: Math.ceil(count / limit) });
    return res.status(StatusCodes.OK).json(response)
});

export const fetch_block_details = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, sort_field = "updated_at", sortBy = "desc" } = req.query;
    const filters = req.body.filters || {}
    let search_query = {};
    const filter_conditions = [];
    if (search) {
        const field_types = {
            type: 'integer',
            gp_name: 'string',
            state: 'string',
            gp_id: 'integer',
            gp_code: 'integer',
            block_id: 'integer',
            "block.name": 'string'
        };

        const search_conditions = [];

        for (const [field, type] of Object.entries(field_types)) {
            let condition;

            switch (true) {
                case field.includes('.'): {
                    const [model, nested_field] = field.split('.');
                    condition = Sequelize.where(
                        Sequelize.cast(Sequelize.col(`$${model}.${nested_field}$`), 'TEXT'),
                        { [Op.iLike]: `%${search}%` }
                    );
                    break;
                }
                case type !== 'string': {
                    condition = Sequelize.where(
                        Sequelize.cast(Sequelize.col(field), 'TEXT'),
                        { [Op.iLike]: `%${search}%` }
                    );
                    break;
                }
                default: {
                    condition = {
                        [field]: {
                            [Op.iLike]: `%${search}%`,
                        },
                    };
                }
            }

            search_conditions.push(condition);
        }

        search_query = search_conditions.length > 0 ? { [Op.or]: search_conditions } : {};
    }


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

    // const match_query = {
    //     ...search_query,
    //     { type: 1 },
    // [Op.and]: filter_conditions,
    // };
    const match_query = {
        [Op.and]: [
            search_query,
            { type: 1 },
            ...filter_conditions
        ]
    };




    const offset = (parseInt(page) - 1) * parseInt(limit);
    const order = [[sort_field, sortBy?.toUpperCase()]];
    console.log(match_query)
    const { rows, count } = await gp_details_model.findAndCountAll({
        where: match_query,
        include: [
            {
                model: gp_equipment_details_model,
                required: true,
            },
            {
                model: gp_electrical_details_model,
                required: true,
            },
        ], offset, limit: parseInt(limit), order

    });
    const response = new ApiResponse(StatusCodes.OK, "Block Details fetched successfully", { data: rows, total_pages: Math.ceil(count / limit) });
    return res.status(StatusCodes.OK).json(response)
});

export const fetch_equipment_details_by_block = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, sort_field = "updated_at", sortBy = "desc" } = req.query;
    const filters = req.body?.filters || {}
    let search_query = {};
    const filter_conditions = []

    if (search) {
        const search_fields = ["condition", "condition_status", "gp_id"];
        const search_conditions = []

        search_fields?.forEach((field) => {
            search_conditions.push({
                [field]: {
                    [Op.iLike]: `%${search}%`
                }
            })
        });

        const nested_fields = ["gp_details.gp_id", "gp_details.gp_name"];

        nested_fields.forEach((field) => {
            const [model, nested_field] = field.split(".");
            search_conditions.push({
                [`$${model}.${nested_field}$`]: {
                    [Op.iLike]: `%${search}%`
                }
            })
        });

        search_conditions?.length > 0 ? search_query = { [Op.or]: search_conditions } : {}
    };
    console.log(search_query)

    for (let [field, value] of Object.entries(filters)) {
        switch (true) {
            case field?.includes("."):
                const [model, nested_field] = field?.split(".");
                filter_conditions?.push({ [`$${model}.${nested_field}$`]: value });
                break;

            case Array.isArray(value) && value?.length == 2:
                filter_conditions.push({
                    [field]: {
                        [Op.between]: value
                    }
                });
                break;

            case Array.isArray(value):
                filter_conditions.push({
                    [field]: {
                        [Op.in]: value
                    }
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

    const match_query = {
        [Op.and]: [
            search_query,
            { '$gp_detail.type$': { [Op.eq]: 1 } },
            ...filter_conditions
        ]
    };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const order = [[sort_field, sortBy?.toUpperCase()]];

    const { rows, count } = await gp_equipment_details_model.findAndCountAll({
        where: match_query,
        include: [
            {
                model: gp_details_model,
                required: true,
                include: [
                    { model: gp_electrical_details_model, required: true }
                ]
            },
        ], offset, limit: parseInt(limit), order

    });
    const response = new ApiResponse(StatusCodes.OK, "GP Details fetched successfully", { data: rows, total_pages: Math.ceil(count / limit) });
    return res.status(StatusCodes.OK).json(response)
});

//replacement

export const add_gp_replacement_request = asyncHandler(async (req, res) => {
    const reqBody = req.body;
    const user = req.user

    if (!reqBody?.gp_asset_id) {
        throw new ApiError("GP Asset ID is required.", StatusCodes.BAD_REQUEST)
    };

    const updated_body = {
        ...reqBody,
        createdBy: user?.id,
        updatedBy: user?._id,
    };

    const add_replacement_result = await gp_replacement_model.create(updated_body, { returning: true });
    if (!add_replacement_result) throw new ApiError("Failed to create request.", StatusCodes.BAD_REQUEST);

    const response = new ApiResponse(StatusCodes.OK, "Replacement Request Created Successfully", add_replacement_result?.toJSON());
    return res.status(StatusCodes.OK).json(response);
});

export const fetch_all_gp_replacement_request = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        search,
        sort_field = 'updatedAt',
        sort = 'desc',
    } = req.query;
    const filters = req.body?.filters || {};
    const search_fields = ['replacementId', 'serialNumber', 'replacementReason', 'initiatedBy', 'replacementStatus', 'remarks', '$equipment_details.equipment_name$', '$equipment_details.condition$', '$created_user_details.firstName$', '$created_user_details.lastName$', '$created_user_details.email$', '$updated_user_details.firstName$', '$updated_user_details.lastName$', '$updated_user_details.email$'];
    let search_query = dynamic_search(search, search_fields)
    const filter_query = dynamic_filter(filters)

    const match_query = {
        [Op.and]: [search_query, filter_query]
    };

    const includes_map = {
        equipment_details: gp_equipment_details_model,
        created_user_details: user_model,
        updated_user_details: user_model,
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    // const order = [[sort_field, sort?.toUpperCase()]];
    const order = build_sort_order(sort_field, sort, includes_map);

    const { rows, count } = await gp_replacement_model.findAndCountAll({
        where: match_query,
        include: [
            {
                model: gp_equipment_details_model,
                as: "equipment_details"
            },
            ...user_management_includes
        ],
        offset, limit: parseInt(limit), order
    });

    const response = new ApiResponse(StatusCodes.OK, "GP Replacement details fetched successfully", { data: rows, total_pages: Math.ceil(count / limit) });
    return res.status(StatusCodes.OK).json(response);
})