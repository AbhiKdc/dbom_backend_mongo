import block_replacement_model from '../../../database/schema/hoto_assets/block/block.replacement.schema.js';
import gp_equipment_details_model from '../../../database/schema/hoto_assets/gp_equipment_details.model.js';
import user_model from '../../../database/schema/user_management/user.schema.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import { build_sort_order, StatusCodes } from '../../../utils/constants.js';
import { dynamic_filter } from '../../../utils/dymanicFilter.js';
import { dynamic_search } from '../../../utils/dynamicSearch/dynamic.js';
import ApiError from '../../../utils/errors/apiError.js';
import asyncHandler from '../../../utils/errors/catchAsync.js';
import { user_management_includes } from '../../user_management/contanst.js';
import { Op } from 'sequelize';
export const add_block_replacement_request = asyncHandler(async (req, res) => {
    const reqBody = req.body;
    const user = req.user

    if (!reqBody?.block_asset_id) {
        throw new ApiError("Block Asset ID is required.", StatusCodes.BAD_REQUEST)
    };

    const updated_body = {
        ...reqBody,
        createdBy: user?.id,
        updatedBy: user?._id,
    };

    const add_replacement_result = await block_replacement_model.create(updated_body, { returning: true });
    if (!add_replacement_result) throw new ApiError("Failed to create request.", StatusCodes.BAD_REQUEST);

    const response = new ApiResponse(StatusCodes.OK, "Replacement Request Created Successfully", add_replacement_result?.toJSON());
    return res.status(StatusCodes.OK).json(response);
});

export const fetch_all_block_replacement_request = asyncHandler(async (req, res) => {
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

    const { rows, count } = await block_replacement_model.findAndCountAll({
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

    const response = new ApiResponse(StatusCodes.OK, "Block Replacement details fetched successfully", { data: rows, total_pages: Math.ceil(count / limit) });
    return res.status(StatusCodes.OK).json(response);
})