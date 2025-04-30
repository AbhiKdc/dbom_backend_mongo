export const StatusCodes = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,

  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};


//user model association
export const add_user_associations = (model, user_model) => {
  model.belongsTo(user_model, { foreignKey: "createdBy", as: "created_user_details" });
  model.belongsTo(user_model, { foreignKey: "updatedBy", as: "updated_user_details" });
};


//utility for handling nested sort fields
export function build_sort_order(sort_field, sort_direction, includesMap = {}) {
  if (sort_field?.includes('.')) {
    const parts = sort_field.split('.');
    const relation = parts[0];
    const field = parts[1];

    if (!includesMap[relation]) {
      throw new Error(`Invalid sort relation: ${relation}`);
    }

    return [
      [{ model: includesMap[relation], as: relation }, field, sort_direction.toUpperCase()]
    ];
  } else {
    return [[sort_field, sort_direction.toUpperCase()]];
  }
}

