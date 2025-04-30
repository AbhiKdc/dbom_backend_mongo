import district_model from '../../../database/schema/masters/district.schema.js';
import gp_model from '../../../database/schema/masters/gp.schema.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import { StatusCodes } from '../../../utils/constants.js';
import { dynamic_filter } from '../../../utils/dymanicFilter.js';
import { DynamicSearch } from '../../../utils/dynamicSearch/dynamic.js';
import ApiError from '../../../utils/errors/apiError.js';
import asyncHandler from '../../../utils/errors/catchAsync.js';
import { userManagementLookup } from '../../user_management/contanst.js';

export const add_gp = asyncHandler(async (req, res) => {
    const reqBody = req.body;
    const user = req.user;

    const updated_body = {
        ...reqBody,
        createdBy: user?.id,
        updatedBy: user?._id
    };
    const add_category_result = await gp_model.create(updated_body);

    if (!add_category_result) {
        throw new ApiError('Failed to create GP.', StatusCodes.BAD_REQUEST);
    }

    const response = new ApiResponse(
        StatusCodes.CREATED,
        'GP Created Successfully.'
    );

    return res.status(StatusCodes.CREATED).json(response);
});
export const update_gp = asyncHandler(async (req, res) => {
    const reqBody = req.body;
    const { id } = req.params;
    const user = req.user;

    if (!id) {
        throw new ApiError('ID is missing', StatusCodes.NOT_FOUND);
    }
    const updated_body = {
        ...reqBody,
        updated_by: user?.id
    };

    const updated_result = await district_model.findOneAndUpdate(
        { _id: id },
        {
            $set: updated_body
        },
        { new: true }
    );

    if (!updated_result) {
        throw new ApiError('Failed to update block', StatusCodes.BAD_REQUEST);
    }

    const response = new ApiResponse(
        StatusCodes.OK,
        'GP Updated Successfully.',
        updated_result
    );

    return res.status(StatusCodes.OK).json(response);
});

export const dropdown_gp = asyncHandler(async (req, res) => {
    const all_packages = await gp_model.find({ status: true }, { gpName: 1 });

    return res
        .status(StatusCodes.OK)
        .json(
            new ApiResponse(
                StatusCodes.OK,
                'Dropdown GP master fetched successfully',
                all_packages
            )
        );
});

export const list_all_gp = asyncHandler(async (req, res, next) => {
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
                from: 'package_master',
                localField: 'packageId',
                foreignField: '_id',
                pipeline: [
                    {
                        $project: {
                            packageName: 1,
                            state:1
                        }
                    }
                ],
                as: 'package_details',
            },
        },
        {
            $unwind: {
                path: '$package_details',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'district_master',
                localField: 'districtId',
                foreignField: '_id',
                pipeline: [
                    {
                        $project: {
                            district:1,
                            districtCode: 1
                        }
                    }
                ],
                as: 'district_details',
            },
        },
        {
            $unwind: {
                path: '$district_details',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'block_master',
                localField: 'blockId',
                foreignField: '_id',
                pipeline: [
                    {
                        $project: {
                            blockName:1,
                            blockCode: 1
                        }
                    }
                ],
                as: 'block_details',
            },
        },
        {
            $unwind: {
                path: '$block_details',
                preserveNullAndEmptyArrays: true,
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

    const all_details = await gp_model.aggregate(aggregationPipeline);

    // Count total documents
    const countPipeline = [
        ...lookups,
        matchStage,
        {
            $count: 'totalCount',
        },
    ];

    const countResult = await gp_model.aggregate(countPipeline);
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
