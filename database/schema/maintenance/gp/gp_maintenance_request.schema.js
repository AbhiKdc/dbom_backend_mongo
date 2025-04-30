import { DataTypes } from "sequelize";
import sequelize from "../../../postgres.service.js";

const gp_maintenance_request_model = sequelize.define("gp_maintenance_request", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    maintenance_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        unique: true, // not a second primary key, but still unique
    },
    assets_id:{
        type: DataTypes.UUID,
        allowNull: false,
    },
    assets_details:{
        type:DataTypes.JSONB,
        allowNull:false
    },
    repair_type: {
        type: DataTypes.ENUM('onsite', 'offsite'),
        allowNull: false,
    },
    maintenance_type: {
        type: DataTypes.ENUM('amc', 'o&m'),
        allowNull: false,
    },
    issue_reported: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    initiated_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_cancelled:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    is_created:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    updated_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'gp_maintenance_request',
    timestamps: true, // adds createdAt and updatedAt fields automatically,
});

export default gp_maintenance_request_model;
