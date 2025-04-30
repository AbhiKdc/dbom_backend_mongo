import ApiError from '../../../utils/errors/apiError.js';
import asyncHandler from '../../../utils/errors/catchAsync.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import { StatusCodes } from '../../../utils/constants.js';
import package_model from '../../../database/schema/masters/package.schema.js';
import { Op } from 'sequelize';
import user_model from '../../../database/schema/user_management/user.schema.js';
import { user_management_includes } from '../../user_management/contanst.js';
import supplier_branch_model from '../../../database/schema/masters/supplier.branches.schema.js';
import supplier_model from '../../../database/schema/masters/supplier.schema.js';
import sequlize from '../../../database/postgres.service.js';
import material_model from '../../../database/schema/masters/material.schema.js';

export const add_supplier = asyncHandler(async (req, res) => {
    const { supplier_details, branch_details } = req.body;
    const user = req.user;
    const session = await sequlize.transaction();
    if (!supplier_details) {
        throw new ApiError(
            'Supplier Details are required.',
            StatusCodes.BAD_REQUEST
        );
    }
    if (branch_details?.length === 0) {
        throw new ApiError(
            'At least one branch is required.',
            StatusCodes.BAD_REQUEST
        );
    }
    try {
        const updated_body = {
            ...supplier_details,
            createdBy: user?.id,
            updatedBy: user?._id,
        };

        const add_supplier_result = await supplier_model.create(updated_body, {
            transaction: session,
        });

        if (!add_supplier_result) {
            throw new ApiError('Failed to create package.', StatusCodes.BAD_REQUEST);
        }
        const updated_branch_details = branch_details?.map((item) => {
            return {
                ...item,
                supplierId: add_supplier_result?.toJSON()?.id,
                createdBy: user?.id,
                updatedBy: user?._id,
            };
        });
        const add_supplier_branch_result = await supplier_branch_model.bulkCreate(
            updated_branch_details,
            { transaction: session }
        );

        if (
            !add_supplier_branch_result ||
            add_supplier_branch_result?.length === 0
        ) {
            throw new ApiError(
                'Failed to add supplier branch.',
                StatusCodes.BAD_REQUEST
            );
        }

        const response = new ApiResponse(
            StatusCodes.CREATED,
            'Supplier Created Successfully.',
            {
                supplier_details: add_supplier_result?.toJSON(),
                branch_details: add_supplier_branch_result,
            }
        );
        await session.commit();
        return res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        await session.rollback();
        throw error;
    }
});
export const updatesupplier = asyncHandler(async (req, res) => {
    const reqBody = req.body;
    const { id } = req.params;
    const user = req.user;

    if (!id) {
        throw new ApiError('ID is missing', StatusCodes.NOT_FOUND);
    }
    const updated_body = {
        ...reqBody,
        updated_by: user?.id,
    };

    const [rows_updated, [updated_result]] = await package_model.update(
        updated_body,
        { where: { id }, returning: true }
    );

    if (rows_updated === 0) {
        throw new ApiError('Failed to update package', StatusCodes.BAD_REQUEST);
    }

    const response = new ApiResponse(
        StatusCodes.OK,
        'Package Updated  Successfully.',
        updated_result
    );

    return res.status(StatusCodes.OK).json(response);
});

export const dropdown_supplier_master = asyncHandler(async (req, res) => {
    const all_packages = await supplier_model.findAll({
        attributes: ['id', 'supplierName'],
    });

    return res
        .status(StatusCodes.OK)
        .json(
            new ApiResponse(
                StatusCodes.OK,
                'Dropdown supplier master fetched successfully',
                all_packages
            )
        );
});

export const list_all_supplier_with_branches = asyncHandler(
    async (req, res) => {
        const {
            page = 1,
            limit = 10,
            search,
            sort_field = 'updatedAt',
            sort = 'desc',
        } = req.query;
        const filters = req.body?.filters || {};
        let search_query = {};
        const filter_conditions = [];

        if (search) {
            const search_fields = ['packageName', 'state'];
            const search_conditions = [];

            search_fields?.forEach((field) => {
                search_conditions.push({
                    [field]: {
                        [Op.iLike]: `%${search}%`,
                    },
                });
            });

            search_conditions?.length > 0
                ? (search_query = { [Op.or]: search_conditions })
                : {};
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
            ...search_query,
            [Op.and]: filter_conditions,
        };

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const order = [[sort_field, sort?.toUpperCase()]];

        const { rows, count } = await supplier_model.findAndCountAll({
            where: match_query,
            include: [
                {
                    model: supplier_branch_model,
                    required: true,
                    as: 'branch_details',
                    include: [
                        {
                            model: material_model,
                            required: true, as: "material_details"
                        }
                    ]
                },
                ...user_management_includes,
            ],
            offset,
            limit: parseInt(limit),
            order,
        });

        const response = new ApiResponse(
            StatusCodes.OK,
            'Supplier details fetched successfully',
            { data: rows, total_pages: Math.ceil(count / limit) }
        );
        return res.status(StatusCodes.OK).json(response);
    }
);
