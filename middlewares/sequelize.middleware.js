import sequlize from "../database/postgres.service.js"

const sequelize_middleware = (req, res, next) => {
    req.connection = sequlize;
    next()
};

export default sequelize_middleware