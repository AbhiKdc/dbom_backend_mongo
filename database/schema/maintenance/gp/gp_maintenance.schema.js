import { DataTypes } from "sequelize";
import sequelize from "../../../postgres.service.js";

const gp_maintenance_model = sequelize.define("gp_maintenance", {
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
    request_maintenance_id:{
        type: DataTypes.UUID,
        allowNull: false,
    },
    issue_date:{
        type:DataTypes.DATE,
        defaultValue:new Date()
    },
    estimate_arrival_date:{
        type:DataTypes.DATE,
        defaultValue:new Date()
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
    assign_to:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    repair_status:{
        type:DataTypes.ENUM("installed","under_repair","repaired"),
        defaultValue:"under_repair"
    },
    initiated_by: {
        type: DataTypes.STRING,
        allowNull: true,
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
    tableName: 'gp_maintenance',
    timestamps: true, // adds createdAt and updatedAt fields automatically
});

export default gp_maintenance_model;
