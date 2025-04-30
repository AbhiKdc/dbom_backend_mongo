import gst_model from '../../../database/schema/masters/gst.schema.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import { StatusCodes } from '../../../utils/constants.js';
import { dynamic_filter } from '../../../utils/dymanicFilter.js';
import { DynamicSearch } from '../../../utils/dynamicSearch/dynamic.js';
import ApiError from '../../../utils/errors/apiError.js';
import asyncHandler from '../../../utils/errors/catchAsync.js';
import { userManagementLookup } from '../../user_management/contanst.js';

export const add_gst = asyncHandler(async (req, res) => {
    const reqBody = req.body;
    const user = req.user;

    const updated_body = {
        ...reqBody,
        createdBy: user?.id,
        updatedBy: user?.id
    };
    const add_category_result = await gst_model.create(updated_body);

    if (!add_category_result) {
        throw new ApiError('Failed to create GST.', StatusCodes.BAD_REQUEST);
    }

    const response = new ApiResponse(
        StatusCodes.CREATED,
        'GST Created Successfully.'
    );

    return res.status(StatusCodes.CREATED).json(response);
});
export const updated_gst = asyncHandler(async (req, res) => {
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

    const updated_result = await gst_model.findOneAndUpdate(
        { _id: id },
        {
            $set: updated_body
        },
        { new: true }
    );

    if (!updated_result) {
        throw new ApiError('Failed to update gst', StatusCodes.BAD_REQUEST);
    }

    const response = new ApiResponse(
        StatusCodes.OK,
        'GST Updated Successfully.',
        updated_result
    );

    return res.status(StatusCodes.OK).json(response);
});

export const dropdown_gst = asyncHandler(async (req, res) => {
    const all_packages = await gst_model.findAll(
        { status: true },
        { gst: 1 },
    );

    return res
        .status(StatusCodes.OK)
        .json(
            new ApiResponse(
                StatusCodes.OK,
                'Dropdown GST master fetched successfully',
                all_packages
            )
        );
});

export const list_all_gst = asyncHandler(async (req, res, next) => {
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
    ];

    const aggregationPipeline = [
        ...lookups,
        matchStage,
        sortStage,
        skipStage,
        limitStage,
    ];

    const all_details = await gst_model.aggregate(aggregationPipeline);

    // Count total documents
    const countPipeline = [
        ...lookups,
        matchStage,
        {
            $count: 'totalCount',
        },
    ];

    const countResult = await gst_model.aggregate(countPipeline);
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
