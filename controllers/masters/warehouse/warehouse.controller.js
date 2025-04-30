import warehouse_model from "../../../database/schema/masters/warehouse.schema.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import { StatusCodes } from "../../../utils/constants.js";
import { DynamicSearch } from "../../../utils/dynamicSearch/dynamic.js";
import ApiError from "../../../utils/errors/apiError.js";
import asyncHandler from "../../../utils/errors/catchAsync.js";
import { userManagementLookup } from "../../user_management/contanst.js";

export const add_warehouse = asyncHandler(async (req, res, next) => {
    const userDetails = req.user;
    const insert_warehouse_details = await warehouse_model.create({
        ...req.body,
        created_by: userDetails?.id,
        updated_by: userDetails?.id,
    });
    if (!insert_warehouse_details) {
        throw new ApiError("Failed to insert data in warehouse", StatusCodes.BAD_REQUEST);
    }
    const response = new ApiResponse(
        StatusCodes.CREATED,
        "Warehouse Created",
        insert_warehouse_details
    );
    return res.status(StatusCodes.CREATED).json(response)
});

export const update_warehouse = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userDetails = req.user;
    if (!id) {
        throw new ApiError("id is required", StatusCodes.BAD_REQUEST)
    }
    const updated_body = {
        ...req.body,
        updated_by: userDetails?.id,
    }
    const updated_result = await warehouse_model.findOneAndUpdate(
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
        "Warehouse Updated",
        updated_result
    );
    return res.status(StatusCodes.OK).json(response)
});

export const fetch_single_warehouse = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError("Warehouse id is required", StatusCodes.BAD_GATEWAY)
    };

    const warehouseDetails = await warehouse_model.findOne({ _id: id });
    if (!warehouseDetails) {
        throw new ApiError("User data not found", StatusCodes.NOT_FOUND)
    }

    const response = new ApiResponse(
        StatusCodes.OK,
        "Warehouse fetch successfully",
        warehouseDetails
    )

    return res.status(StatusCodes.OK).json(response);
});

export const dropdown_warehouse = asyncHandler(async (req, res, next) => {
    const warehouseDetailsDropdown = await warehouse_model.find(
        { status: true },
        { 'warehouse_name': 1 },
    );

    const response = new ApiResponse(
        StatusCodes.OK,
        "Warehouse Dropdown fetch successfully",
        warehouseDetailsDropdown
    )

    return res.status(StatusCodes.OK).json(response);
});

export const listingWarehouseDetails = asyncHandler(async (req, res, next) => {
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

    const all_details = await warehouse_model.aggregate(aggregationPipeline);

    // Count total documents
    const countPipeline = [
        ...lookups,
        matchStage,
        {
            $count: 'totalCount',
        },
    ];

    const countResult = await warehouse_model.aggregate(countPipeline);
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