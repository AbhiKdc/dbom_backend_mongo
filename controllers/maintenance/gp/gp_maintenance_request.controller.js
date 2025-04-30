import mongoose from "mongoose";
import gp_equipment_details_model from "../../../database/schema/hoto_assets/gp_equipment_details.model.js";
import gp_maintenance_request_model from "../../../database/schema/maintenance/gp/gp_maintenance_request.schema.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import { StatusCodes } from "../../../utils/constants.js";
import { DynamicSearch } from "../../../utils/dynamicSearch/dynamic.js";
import ApiError from "../../../utils/errors/apiError.js";
import asyncHandler from "../../../utils/errors/catchAsync.js";
import { userManagementLookup } from "../../user_management/contanst.js";

export const add_maintenance_request = asyncHandler(async (req, res, next) => {
    const userDetails = req.user;
    const { assets_ids, other_details } = req.body;

    if (!assets_ids || !Array.isArray(assets_ids)) {
        throw new ApiError("Assets id is required or assets id must be array");
    };

    const assets_details = await gp_equipment_details_model.find({
        id: {
            $in: assets_ids,
        }
    });

    if (assets_details.length === 0) {
        throw new ApiError("No assets found for the provided IDs", StatusCodes.NOT_FOUND);
    }

    const maintenance_request_data = assets_details?.map((ele) => {
        return {
            assets_id: ele?._id,
            assets_details: ele,
            repair_type: other_details?.repair_type,
            maintenance_type: other_details?.maintenance_type,
            issue_reported: other_details?.issue_reported,
            initiated_by: other_details?.initiated_by,
            remarks: other_details?.remarks,
            created_by: userDetails?._id,
            updated_by: userDetails?._id,
        }
    });

    const insert_maintenance_request_data = await gp_maintenance_request_model.insertMany(
        maintenance_request_data,
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

export const cancel_maintenance_request = asyncHandler(async (req, res, next) => {
    const userDetails = req.user;
    const { maintenance_request_id } = req.params;

    if (!maintenance_request_id || !Array.isArray(maintenance_request_id)) {
        throw new ApiError("Invalid maintenance_request_id");
    };

    const cancel_gp_maintenance_request = await gp_maintenance_request_model.findOneAndUpdate(
        { _id: maintenance_request_id },
        {
            $set: {
                is_cancelled: true,
                updatedBy:userDetails?._id
            }
        },
        { new: true }
    );

    if(!cancel_gp_maintenance_request){
        throw new ApiError("Failed to cancel maintenance request",StatusCodes?.BAD_REQUEST);
    }

    const response = new ApiResponse(
        StatusCodes.OK,
        "Maintenance request has been cancelled",
        cancel_gp_maintenance_request
    );

    return res.status(StatusCodes.OK).json(response);
});

export const single_fetch_maintenance_request = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
        return next(new ApiError("Invalid Id", StatusCodes.BAD_GATEWAY));
    }

    const match_agg = {
        $match: {
            _id: mongoose.Types.ObjectId.createFromHexString(id)
        }
    }
    const user_lookup_agg = [
        ...userManagementLookup
    ]
    const fetch_maintenance_request_data = await gp_maintenance_request_model.aggregate([
        match_agg,
        user_lookup_agg
    ]);

    const maintenance_request_data = fetch_maintenance_request_data?.[0];

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

    const all_details = await gp_maintenance_request_model.aggregate(aggregationPipeline);

    // Count total documents
    const countPipeline = [
        ...lookups,
        matchStage,
        {
            $count: 'totalCount',
        },
    ];

    const countResult = await gp_maintenance_request_model.aggregate(countPipeline);
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