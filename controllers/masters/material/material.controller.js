import material_model from '../../../database/schema/masters/material.schema.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import { StatusCodes } from '../../../utils/constants.js';
import { dynamic_filter } from '../../../utils/dymanicFilter.js';
import ApiError from '../../../utils/errors/apiError.js';
import asyncHandler from '../../../utils/errors/catchAsync.js';

export const add_material = asyncHandler(async (req, res) => {
    const reqBody = req.body;
    const user = req.user;

    const updated_body = {
        ...reqBody,
        createdBy: user?.id,
        updatedBy: user?._id
    };
    const add_category_result = await material_model.create(updated_body);

    if (!add_category_result) {
        throw new ApiError('Failed to create material.', StatusCodes.BAD_REQUEST);
    }

    const response = new ApiResponse(
        StatusCodes.CREATED,
        'Material Created Successfully.'
    );

    return res.status(StatusCodes.CREATED).json(response);
});
export const update_material = asyncHandler(async (req, res) => {
    const reqBody = req.body;
    const { id } = req.params;
    const user = req.user;

    if (!id) {
        throw new ApiError('ID is missing', StatusCodes.NOT_FOUND);
    }
    const updated_result = await material_model.findOneAndUpdate(
        { _id: id },
        {
            $set: updated_body
        },
        { new: true }
    );

    if (!updated_result) {
        throw new ApiError('Failed to update material', StatusCodes.BAD_REQUEST);
    }

    if (rows_updated === 0) {
        throw new ApiError('Failed to update material details', StatusCodes.BAD_REQUEST);
    }

    const response = new ApiResponse(
        StatusCodes.OK,
        'Material Updated Successfully.',
        updated_result
    );

    return res.status(StatusCodes.OK).json(response);
});

export const dropdown_material = asyncHandler(async (req, res) => {
    const all_material = await material_model.find(
        { status: true },
        { 'materialName': 1, 'materialCode': 1 },
    );

    return res
        .status(StatusCodes.OK)
        .json(
            new ApiResponse(
                StatusCodes.OK,
                'Dropdown Material master fetched successfully',
                all_material
            )
        );
});

export const list_all_material = asyncHandler(async (req, res, next) => {
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
            status: true,
            ...search_query,
            ...filterData,
        },
    };

    const sortStage = {
        $sort: {
            [sort_field]: sort.toLowerCase() === 'desc' ? -1 : 1,
        },
    };

    const skipStage = {
        $skip: (parseInt(page) - 1) * parseInt(limit),
    };

    const limitStage = {
        $limit: parseInt(limit),
    };

    const lookups = [
        ...userManagementLookup,
        {
            $lookup: {
                from: "category_master",
                localField: "categoryId",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            id: 1,
                            category: 1,
                        }
                    }
                ],
                as: "category_details"
            }
        },
        {
            $unwind: {
                path: "$category_details",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "sub_category_master",
                localField: "subCategoryId",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            id: 1,
                            subcategory: 1,
                        }
                    }
                ],
                as: "sub_category_details"
            }
        },
        {
            $unwind: {
                path: "$sub_category_details",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "hsn_code_master",
                let: { hsnCodeId: "$hsnCodeId" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$hsnCodeId"] }
                        }
                    },
                    {
                        $lookup: {
                            from: "gst_master",
                            localField: "gstId",
                            foreignField: "_id",
                            pipeline: [
                                {
                                    $project: {
                                        id: 1,
                                        gst: 1
                                    }
                                }
                            ],
                            as: "gst_details"
                        }
                    },
                    {
                        $unwind: {
                            path: "$gst_details",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            id: 1,
                            hsn_code: 1,
                            gst_details: 1
                        }
                    }
                ],
                as: "hsn_code_details"
            }
        },          
        {
            $unwind: {
                path: "$hsn_code_details",
                preserveNullAndEmptyArrays: true
            }
        },
    ];

    const aggregationPipeline = [
        ...lookups,
        matchStage,
        sortStage,
        skipStage,
        limitStage,
    ];

    const all_details = await material_model.aggregate(aggregationPipeline);

    // Count total documents
    const countPipeline = [
        ...lookups,
        matchStage,
        {
            $count: 'totalCount',
        },
    ];

    const countResult = await material_model.aggregate(countPipeline);
    const totalCount = countResult?.[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit);

    const response = new ApiResponse(
        StatusCodes.OK,
        'Data fetched successfully',
        {
            data: all_details,
            total_pages: totalPages,
        }
    );

    return res.status(StatusCodes.OK).json(response);
});
