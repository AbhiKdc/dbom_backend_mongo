import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import getConfigs from "../../config/config.js";
import user_model from "../../database/schema/user_management/user.schema.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { StatusCodes } from "../../utils/constants.js";
import { dynamic_filter } from "../../utils/dymanicFilter.js";
import { DynamicSearch } from "../../utils/dynamicSearch/dynamic.js";
import { SendOtpEmail } from "../../utils/emailServices/otp.js";
import ApiError from "../../utils/errors/apiError.js";
import asyncHandler from "../../utils/errors/catchAsync.js";
import { userManagementLookup } from "./contanst.js";
const config = getConfigs();

export const addUser = asyncHandler(async (req, res, next) => {
    const userData = req.body;
    const userDetails = req.user;

    // Check if password is provided
    if (!userData?.password) {
        throw new ApiError("Password is required", StatusCodes.BAD_REQUEST);
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    userData.password = hashedPassword;

    // Create the user
    const addUserData = await user_model.create({
        ...userData,
        createdBy: userDetails?.id,
        updatedBy: userDetails?.id,
    });

    if (!addUserData) {
        throw new ApiError("Failed to add user details", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    // Successful response
    const response = new ApiResponse(
        StatusCodes.CREATED,
        "User created successfully",
        addUserData
    );

    return res.status(StatusCodes.CREATED).json(response);
});

export const loginUser = asyncHandler(async (req, res, next) => {
    const origin = req.get('Origin');
    const { email, password } = req.body;

    if (!email || !password) return next(new ApiError("Enter Email or Password", StatusCodes.BAD_GATEWAY))

    const userDetails = await user_model.findOne({ email: email, status: true });
    if (!userDetails) return next(new ApiError("Invalid Email or Password", StatusCodes.BAD_GATEWAY))

    const passwordMatch = await bcrypt.compare(
        password,
        userDetails.password
    );

    if (!passwordMatch) return next(new ApiError("Invalid Email or Password", StatusCodes.BAD_GATEWAY))

    userDetails.password = undefined;
    userDetails.otp = undefined;
    userDetails.otpExpire = undefined;

    const tokenUserDetails = {
        _id: userDetails?._id,
        organisationId: userDetails?.organisationId,
        departmentId: userDetails?.departmentId,
        teamId: userDetails?.teamId,
        firstName: userDetails?.firstName,
        lastName: userDetails?.lastName,
        email: userDetails?.email,
        mobileNo: userDetails?.mobileNo,
    }
    const token = jwt.sign(tokenUserDetails, config.jwt.accessSecret, config.jwt.accessOptions);
    const options = {
        expires: new Date(
            Date.now() + config.cookie.cookie_expire * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        sameSite: 'Lax',
    };

    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');

    const response = new ApiResponse(
        StatusCodes.OK,
        "Login Successfull",
        {
            token: token,
            userDetails: userDetails
        }
    )

    return res.status(StatusCodes.OK).cookie('token', token, options).json(response);

});

export const userSendOTP = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    let otp = Math.floor(10000 + Math.random() * 90000);
    let expiresIn = Date.now() + (5 * 60 * 1000);

    const update_user_details = await user_model.findOneAndUpdate({ email: email },
        {
            $set: {
                otp: otp,
                otpExpire: expiresIn,
            },
        },
        { new: true }
    );

    if (!update_user_details) {
        return next(new ApiError("user not found with this email", StatusCodes.BAD_GATEWAY));
    };
    const userDetails = update_user_details

    const message = `
     <!DOCTYPE html>
  <html>
  <head>
    <style>
      /* General Styles */
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        color:black
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f9f9f9;
      }
  
      /* Header Styles */
      .header {
        background-color: #007bff;
        color: #ffffff;
        text-align: left;
        padding: 0.1px 20px;
      }
      .content h1 {
        font-size: 32px;
        text-align: center;
      }
  
      /* Content Styles */
      .content {
        padding: 20px;
        background-color: #ffffff;
      }
      .message {
        font-size: 18px;
        line-height: 1;
      }
      .reset-button {
        display: inline-block;
        background-color: #007bff;
        color: #ffffff !important;
        font-size: 16px;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 15px;
        margin-bottom: 15px;
      }
      .reset-button:hover {
        background-color: #0056b3;
        color: #ffffff;
      }
  
      /* Footer Styles */
      .footer {
        text-align: center;
        padding: 20px 0;
      }
      .footer p {
        font-size: 14px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>DBOM</h1>
      </div>
      <div class="content">
        <h1>One Time Password </h1>
        <p class="message">We received a request to reset your account password.</p>
        <p class="message">Yout OTP is :${otp} </p>
       
        <p><sup class="message" style="font-size: 14px;">If you didn't initiate this request, you can safely ignore this email.</sup></p>
      </div>
      <div class="footer">
        <p>Best regards </p>
      </div>
    </div>
  </body>
  </html>
    `;

    await SendOtpEmail(
        userDetails?.email,
        message,
        "OTP",
    );

    const response = new ApiResponse(
        StatusCodes.OK,
        "OTP sent successfully"
    )
    return res.status(StatusCodes.OK).json(response);
});

export const userVerifyOtp = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;
    if (!email, !otp) return next(new ApiError("Enter Email or OTP", StatusCodes.BAD_GATEWAY));

    const fetchUserDetails = await user_model.findOne({ email: email, otp: otp });

    if (!fetchUserDetails) return next(new ApiError("Invalid User or Otp", StatusCodes.BAD_GATEWAY));

    if (fetchUserDetails.otpExpire <= Date.now()) {
        const userUpdatedOtpDetails = await User.findByIdAndUpdate(
            fetchUserDetails._id,
            {
                $set: {
                    otp: null,
                    otpExpire: null
                }
            },
            { new: true } // returns the updated document
        );

        if (!userUpdatedOtpDetails) {
            throw new ApiError("Failed to update OTP", StatusCodes.BAD_GATEWAY);
        }

        throw new ApiError("Your OTP has expired", StatusCodes.BAD_GATEWAY);
    }

    const response = new ApiResponse(
        StatusCodes.OK,
        "otp verified successfully"
    )
    return res.status(StatusCodes.OK).json(response)
});

export const userUpdatePassword = asyncHandler(async (req, res, next) => {
    const { email, newPassword } = req.body;

    if (!email, !newPassword) return next(new ApiError("Enter Email or Password", StatusCodes.BAD_GATEWAY));

    const fetchUserDetails = await user_model.findOne({ email: email });

    if (!fetchUserDetails) return next(new ApiError("Invalid User", StatusCodes.BAD_GATEWAY));

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const userUpdatedOtpDetails = await User.findByIdAndUpdate(
        fetchUserDetails._id,
        {
            $set: {
                otp: null,
                otpExpire: null,
                password: hashedPassword,
            },
        },
        { new: true }
    );

    if (!userUpdatedOtpDetails) {
        throw new ApiError("Failed to update password", StatusCodes.BAD_GATEWAY);
    }


    const response = new ApiResponse(
        StatusCodes.OK,
        "Password updated successfully",
        {
            userDetails: fetchUserDetails
        }
    )
    return res.status(200).json(response);
});

export const userChangePassword = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const userDetails = req.user;
    const { currentPassword, newPassword } = req.body;
    const saltRounds = 10;
    if (!id) {
        throw new ApiError("User ID is required", StatusCodes.BAD_REQUEST);
    }
    if (!currentPassword || !newPassword) {
        throw new ApiError("currentPassword or newPassword is required", StatusCodes.BAD_REQUEST);
    }
    const fetchUserDetails = await user_model.findOne({ _id: id })

    if (!fetchUserDetails) return next(new ApiError("Invalid User", StatusCodes.BAD_GATEWAY));
    // Check if the current password matches
    const isPasswordValid = await bcrypt.compare(
        currentPassword,
        fetchUserDetails.password
    );

    if (!isPasswordValid) {
        throw new ApiError("Invalid Password", StatusCodes.BAD_REQUEST);
    }
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const updatedUserDetail = await user_model.findOneAndUpdate({ _id: fetchUserDetails?._id },
        {
            $set: {
                password: hashedPassword,
                updatedBy: userDetails.id
            },
        },
        { new: true },
    );
    if (!updatedUserDetail) {
        throw new ApiError("Failed to update password", StatusCodes.BAD_GATEWAY);
    }

    const response = new ApiError(
        StatusCodes.OK,
        "Password updated successfully",
        {
            user: updatedUserDetail,
        }
    )
    return res.status(StatusCodes.OK).json(response);
});

export const editUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userDetails = req.user;
    if (!id) {
        throw new ApiError("id is required", StatusCodes.BAD_REQUEST)
    }
    const { password, otp, otpExpire, ...userData } = req.body;

    const updatedUserDetail = await user_model.findOneAndUpdate(
        { _id: id },
        {
            $set: {
                ...userData,
                updatedBy: userDetails?.id
            }
        },
        { new: true });

    if (!updatedUserDetail) {
        throw new ApiError("Failed to update user details", StatusCodes.BAD_GATEWAY);
    }

    // Successful response
    const response = new ApiResponse(
        StatusCodes.OK,
        "User updated successfully",
        updatedUserDetail
    );

    return res.status(StatusCodes.OK).json(response);
});

export const singleFetchUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id) return next(new ApiError("User id is required", StatusCodes.BAD_GATEWAY));

    const fetchUserDetails = await user_model.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId.createFromHexString(id)
            }
        },
        ...userManagementLookup
    ]);
    const userDetails = fetchUserDetails?.[0]
    if (!userDetails) {
        throw new ApiError("User data not found", StatusCodes.NOT_FOUND)
    }

    userDetails.password = undefined;
    userDetails.otp = undefined;
    userDetails.otpExpire = undefined;

    const response = new ApiResponse(
        StatusCodes.OK,
        "User fetch successfully",
        userDetails
    )

    return res.status(StatusCodes.OK).json(response);

});

export const listingUsersDetails = asyncHandler(async (req, res, next) => {
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
                from: 'organisations',
                localField: 'organisationId',
                foreignField: '_id',
                pipeline: [
                    {
                        $project: {
                            organisationName: 1
                        }
                    }
                ],
                as: 'organisation_details',
            },
        },
        {
            $unwind: {
                path: '$organisation_details',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'departments',
                localField: 'departmentId',
                foreignField: '_id',
                pipeline: [
                    {
                        $project: {
                            departmentName: 1
                        }
                    }
                ],
                as: 'department_details',
            },
        },
        {
            $unwind: {
                path: '$department_details',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'teams',
                localField: 'teamId',
                foreignField: '_id',
                pipeline: [
                    {
                        $project: {
                            teamName: 1
                        }
                    }
                ],
                as: 'team_details',
            },
        },
        {
            $unwind: {
                path: '$team_details',
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

    const users = await user_model.aggregate(aggregationPipeline);

    // Count total documents
    const countPipeline = [
        ...lookups,
        matchStage,
        {
            $count: 'totalCount',
        },
    ];

    const countResult = await user_model.aggregate(countPipeline);
    const totalCount = countResult[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit);

    const response = new ApiResponse(
        StatusCodes.OK,
        'User details fetched successfully',
        {
            data: users,
            total_pages: totalPages,
        }
    );

    return res.status(StatusCodes.OK).json(response);
});
