import mongoose from 'mongoose';
import district_model from '../../../database/schema/masters/district.schema.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import { StatusCodes } from '../../../utils/constants.js';
import { dynamic_filter } from '../../../utils/dymanicFilter.js';
import ApiError from '../../../utils/errors/apiError.js';
import asyncHandler from '../../../utils/errors/catchAsync.js';
import { userManagementLookup } from '../../user_management/contanst.js';

export const add_district = asyncHandler(async (req, res) => {
    const reqBody = req.body;
    const user = req.user;
    for (let field of ['packageId', 'district', 'districtCode']) {
        if (!req.body[field]) {
            throw new ApiError(`${field} is missing.`, StatusCodes.NOT_FOUND);
        }
    }

    const updated_body = {
        ...reqBody,
        createdBy: user?.id,
        updatedBy: user?.id
    };

    const add_district_result = await district_model.create(updated_body);

    if (!add_district_result) {
        throw new ApiError('Failed to create district.', StatusCodes.BAD_REQUEST);
    }

    const response = new ApiResponse(
        StatusCodes.CREATED,
        'District Created Successfully.'
    );

    return res.status(StatusCodes.CREATED).json(response);
});
export const updated_district = asyncHandler(async (req, res) => {
    const reqBody = req.body;
    const { id } = req.params;
    const user = req.user;
    if (!id) {
        throw new ApiError('ID is missing', StatusCodes.NOT_FOUND);
    }

    const updated_body = {
        ...reqBody,
        updatedBy: user?.id
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
        'District Updated Successfully.',
        updated_result
    );

    return res.status(StatusCodes.OK).json(response);
});



export const list_all_districts = asyncHandler(async (req, res, next) => {
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
                from: "package_master",
                localField: "packageId",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            id: 1,
                            packageName: 1,
                            state: 1,
                        }
                    }
                ],
                as: "package_details"
            }
        },
        {
            $unwind: {
                path: "$package_details",
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

    const all_details = await district_model.aggregate(aggregationPipeline);

    // Count total documents
    const countPipeline = [
        ...lookups,
        matchStage,
        {
            $count: 'totalCount',
        },
    ];

    const countResult = await district_model.aggregate(countPipeline);
    const totalCount = countResult[0]?.totalCount || 0;
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


export const dropdown_district = asyncHandler(async (req, res) => {
    const { id } = req.query
    const match_query = {
        status: true
    }
    if (id) {
        match_query.packageId = mongoose.Types.ObjectId.createFromHexString(id)
    }
    const all_packages = await district_model.find(match_query).select({ district: 1 });

    return res
        .status(StatusCodes.OK)
        .json(
            new ApiResponse(
                StatusCodes.OK,
                'Dropdown district master fetched successfully',
                all_packages
            )
        );
});