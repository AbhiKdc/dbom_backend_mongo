import ApiError from '../../../utils/errors/apiError.js';
import asyncHandler from '../../../utils/errors/catchAsync.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import gp_details_model from '../../../database/schema/hoto_assets/gp_details_model.js';
import gp_equipment_details_model from '../../../database/schema/hoto_assets/gp_equipment_details.model.js';
import gp_electrical_details_model from '../../../database/schema/hoto_assets/gp_electrical_details.model.js';
import { build_sort_order, StatusCodes } from '../../../utils/constants.js';
import mongoose from 'mongoose';
import { dynamic_filter } from '../../../utils/dymanicFilter.js';
import { DynamicSearch } from '../../../utils/dynamicSearch/dynamic.js';
import { userManagementLookup } from '../../user_management/contanst.js';


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

    const session = await mongoose.startSession();
    try {
        await session.startTransaction()
        const [add_gp_details_result] = await gp_details_model.create([gp_details], { session });

        if (!add_gp_details_result) {
            throw new ApiError("Failed to add gp details.", StatusCodes.BAD_REQUEST)
        }

        const updated_equipment_details = equipment_details?.map((item) => ({ ...item, gp_id: add_gp_details_result?._id }))
        const updated_electrical_details = electrical_details?.map((item) => ({ ...item, gp_id: add_gp_details_result?._id }));

        const add_equipment_result = await gp_equipment_details_model.insertMany(updated_equipment_details, { session });
        const add_electrical_result = await gp_electrical_details_model.insertMany(updated_electrical_details, { session });

        if (add_equipment_result?.length === 0 || add_electrical_result?.length === 0) {
            throw new ApiError("Failed to add equipment details.", StatusCodes.BAD_REQUEST)
        }
        const response = new ApiResponse(StatusCodes.CREATED, "Survey details added successfully.", add_gp_details_result);
        await session.commitTransaction()
        return res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession()
    }
});

export const fetch_gp_details = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        search = '',
        sort_field = 'updatedAt',
        sort = 'desc',
    } = req.query;
    const filter = req.body?.filters || {};

    let search_query = {};
    if (search != '' && req?.body?.searchFields) {
        const search_data = DynamicSearch(
            search,
            boolean,
            numbers,
            string,
            arrayField
        );
        if (search_data?.length == 0) {
            throw new ApiError("Result not found", StatusCodes.NOT_FOUND);
        }
        search_query = search_data;
    }

    const filterData = dynamic_filter(filter);

    const matchStage = {
        $match: {
            type: { $ne: 1 },
            ...search_query,
            ...filterData,
        },
    };

    const sortStage = {
        $sort: {
            [sort_field]: sort === 'desc' ? -1 : 1,
        },
    };

    const skipStage = {
        $skip: (parseInt(page) - 1) * parseInt(limit),
    };

    const limitStage = {
        $limit: parseInt(limit),
    };

    const lookups = [
        // ...userManagementLookup,
        {
            $lookup: {
                from: 'gp_electrical_details',
                localField: '_id',
                foreignField: 'gp_id',
                as: 'electrical_details',
            },
        },
        {
            $lookup: {
                from: 'gp_equipment_details',
                localField: '_id',
                foreignField: 'gp_id',
                as: 'equipment_details',
            },
        },
    ];

    const aggregationPipeline = [
        ...lookups,
        matchStage,
        sortStage,
        skipStage,
        limitStage,
    ];

    const gp_details = await gp_details_model.aggregate(aggregationPipeline);

    // Count total documents
    const countPipeline = [
        ...lookups,
        matchStage,
        {
            $count: 'totalCount',
        },
    ];

    const countResult = await gp_details_model.aggregate(countPipeline);
    const totalCount = countResult[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit);

    const response = new ApiResponse(StatusCodes.OK, "GP Details fetched successfully", { data: gp_details, total_pages: totalPages });
    return res.status(StatusCodes.OK).json(response)
})

export const fetch_equipment_details_by_gp = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        search = '',
        sort_field = 'updatedAt',
        sort = 'desc',
    } = req.query;
    const filter = req.body?.filters || {};

    let search_query = {};
    if (search != '' && req?.body?.searchFields) {
        const search_data = DynamicSearch(
            search,
            boolean,
            numbers,
            string,
            arrayField
        );
        if (search_data?.length == 0) {
            throw new ApiError("Result not found", StatusCodes.NOT_FOUND);
        }
        search_query = search_data;
    }

    const filterData = dynamic_filter(filter);

    const matchStage = {
        $match: {
            'gp_details.type': { $ne: 1 },
            ...search_query,
            ...filterData,
        },
    };

    const sortStage = {
        $sort: {
            [sort_field]: sort === 'desc' ? -1 : 1,
        },
    };

    const skipStage = {
        $skip: (parseInt(page) - 1) * parseInt(limit),
    };

    const limitStage = {
        $limit: parseInt(limit),
    };

    const lookups = [
        // ...userManagementLookup,
        {
            $lookup: {
                from: 'gp_details',
                localField: 'gp_id',
                foreignField: '_id',
                as: 'gp_details',
            },
        },
        {
            $unwind: {
                path: "$gp_details",
                preserveNullAndEmptyArrays: true
            }
        }

    ];

    const aggregationPipeline = [
        ...lookups,
        matchStage,
        sortStage,
        skipStage,
        limitStage,
    ];

    const gp_equipment_details = await gp_equipment_details_model.aggregate(aggregationPipeline);

    // Count total documents
    const countPipeline = [
        ...lookups,
        matchStage,
        {
            $count: 'totalCount',
        },
    ];

    const countResult = await gp_equipment_details_model.aggregate(countPipeline);
    const totalCount = countResult[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit);

    const response = new ApiResponse(StatusCodes.OK, "GP Equipment Details fetched successfully", { data: gp_equipment_details, total_pages: totalPages });
    return res.status(StatusCodes.OK).json(response)
});

export const fetch_block_details = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        search = '',
        sort_field = 'updatedAt',
        sort = 'desc',
    } = req.query;
    const filter = req.body?.filters || {};

    let search_query = {};
    if (search != '' && req?.body?.searchFields) {
        const search_data = DynamicSearch(
            search,
            boolean,
            numbers,
            string,
            arrayField
        );
        if (search_data?.length == 0) {
            throw new ApiError("Result not found", StatusCodes.NOT_FOUND);
        }
        search_query = search_data;
    }

    const filterData = dynamic_filter(filter);

    const matchStage = {
        $match: {
            type: { $eq: 1 },
            ...search_query,
            ...filterData,
        },
    };

    const sortStage = {
        $sort: {
            [sort_field]: sort === 'desc' ? -1 : 1,
        },
    };

    const skipStage = {
        $skip: (parseInt(page) - 1) * parseInt(limit),
    };

    const limitStage = {
        $limit: parseInt(limit),
    };

    const lookups = [
        // ...userManagementLookup,
        {
            $lookup: {
                from: 'gp_electrical_details',
                localField: '_id',
                foreignField: 'gp_id',
                as: 'electrical_details',
            },
        },
        {
            $lookup: {
                from: 'gp_equipment_details',
                localField: '_id',
                foreignField: 'gp_id',
                as: 'equipment_details',
            },
        },
    ];

    const aggregationPipeline = [
        ...lookups,
        matchStage,
        sortStage,
        skipStage,
        limitStage,
    ];

    const gp_details = await gp_details_model.aggregate(aggregationPipeline);

    // Count total documents
    const countPipeline = [
        ...lookups,
        matchStage,
        {
            $count: 'totalCount',
        },
    ];

    const countResult = await gp_details_model.aggregate(countPipeline);
    const totalCount = countResult[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit);

    const response = new ApiResponse(StatusCodes.OK, "Block Details fetched successfully", { data: gp_details, total_pages: totalPages });
    return res.status(StatusCodes.OK).json(response)
});

export const fetch_equipment_details_by_block = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        search = '',
        sort_field = 'updatedAt',
        sort = 'desc',
    } = req.query;
    const filter = req.body?.filters || {};

    let search_query = {};
    if (search != '' && req?.body?.searchFields) {
        const search_data = DynamicSearch(
            search,
            boolean,
            numbers,
            string,
            arrayField
        );
        if (search_data?.length == 0) {
            throw new ApiError("Result not found", StatusCodes.NOT_FOUND);
        }
        search_query = search_data;
    }

    const filterData = dynamic_filter(filter);

    const matchStage = {
        $match: {
            'gp_details.type': { $eq: 1 },
            ...search_query,
            ...filterData,
        },
    };

    const sortStage = {
        $sort: {
            [sort_field]: sort === 'desc' ? -1 : 1,
        },
    };

    const skipStage = {
        $skip: (parseInt(page) - 1) * parseInt(limit),
    };

    const limitStage = {
        $limit: parseInt(limit),
    };

    const lookups = [
        // ...userManagementLookup,
        {
            $lookup: {
                from: 'gp_details',
                localField: 'gp_id',
                foreignField: '_id',
                as: 'gp_details',
            },
        },
        {
            $unwind: {
                path: "$gp_details",
                preserveNullAndEmptyArrays: true
            }
        }

    ];

    const aggregationPipeline = [
        ...lookups,
        matchStage,
        sortStage,
        skipStage,
        limitStage,
    ];

    const gp_equipment_details = await gp_equipment_details_model.aggregate(aggregationPipeline);

    // Count total documents
    const countPipeline = [
        ...lookups,
        matchStage,
        {
            $count: 'totalCount',
        },
    ];

    const countResult = await gp_equipment_details_model.aggregate(countPipeline);
    const totalCount = countResult[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit);

    const response = new ApiResponse(StatusCodes.OK, "Block Equipment Details fetched successfully", { data: gp_equipment_details, total_pages: totalPages });
    return res.status(StatusCodes.OK).json(response)
});

// //replacement

// export const add_gp_replacement_request = asyncHandler(async (req, res) => {
//     const reqBody = req.body;
//     const user = req.user

//     if (!reqBody?.gp_asset_id) {
//         throw new ApiError("GP Asset ID is required.", StatusCodes.BAD_REQUEST)
//     };

//     const updated_body = {
//         ...reqBody,
//         createdBy: user?.id,
//         updatedBy: user?.id,
//     };

//     const add_replacement_result = await gp_replacement_model.create(updated_body, { returning: true });
//     if (!add_replacement_result) throw new ApiError("Failed to create request.", StatusCodes.BAD_REQUEST);

//     const response = new ApiResponse(StatusCodes.OK, "Replacement Request Created Successfully", add_replacement_result?.toJSON());
//     return res.status(StatusCodes.OK).json(response);
// });

// export const fetch_all_gp_replacement_request = asyncHandler(async (req, res) => {
//     const {
//         page = 1,
//         limit = 10,
//         search,
//         sort_field = 'updatedAt',
//         sort = 'desc',
//     } = req.query;
//     const filters = req.body?.filters || {};
//     const search_fields = ['replacementId', 'serialNumber', 'replacementReason', 'initiatedBy', 'replacementStatus', 'remarks', '$equipment_details.equipment_name$', '$equipment_details.condition$', '$created_user_details.firstName$', '$created_user_details.lastName$', '$created_user_details.email$', '$updated_user_details.firstName$', '$updated_user_details.lastName$', '$updated_user_details.email$'];
//     let search_query = dynamic_search(search, search_fields)
//     const filter_query = dynamic_filter(filters)

//     const match_query = {
//         [Op.and]: [search_query, filter_query]
//     };

//     const includes_map = {
//         equipment_details: gp_equipment_details_model,
//         created_user_details: user_model,
//         updated_user_details: user_model,
//     }

//     const offset = (parseInt(page) - 1) * parseInt(limit);
//     // const order = [[sort_field, sort?.toUpperCase()]];
//     const order = build_sort_order(sort_field, sort, includes_map);

//     const { rows, count } = await gp_replacement_model.findAndCountAll({
//         where: match_query,
//         include: [
//             {
//                 model: gp_equipment_details_model,
//                 as: "equipment_details"
//             },
//             ...user_management_includes
//         ],
//         offset, limit: parseInt(limit), order
//     });

//     const response = new ApiResponse(StatusCodes.OK, "GP Replacement details fetched successfully", { data: rows, total_pages: Math.ceil(count / limit) });
//     return res.status(StatusCodes.OK).json(response);
// })