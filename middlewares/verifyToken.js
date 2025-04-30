import jwt from 'jsonwebtoken';
import getConfigs from '../config/config.js';
import { StatusCodes } from '../utils/constants.js';
import ApiError from '../utils/errors/apiError.js';
import user_model from '../database/schema/user_management/user.schema.js';
const Configs = getConfigs();
const AuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new ApiError("Access Denied: Token not provided", StatusCodes.BAD_REQUEST)
    }

    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }

    const tokenDetails = jwt.verify(token, Configs.jwt.accessSecret);
    if (!tokenDetails) {
      throw new ApiError("Access Denied: Invalid token.", StatusCodes.BAD_REQUEST)
    }

    const userDetails = await user_model.findOne({
      _id: tokenDetails?._id,
    });

    if (!userDetails) {
      throw new ApiError("User not found", StatusCodes.NOT_FOUND)
    }

    if (userDetails?.status == false) {
      throw new ApiError("Your account has been suspended. Please contact admin.", StatusCodes.FORBIDDEN);
    }

    req.user = userDetails?.toJSON();
    next();
  } catch (error) {
    return next(error);
  }
};

export default AuthMiddleware;
