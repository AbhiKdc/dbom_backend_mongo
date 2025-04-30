// import { DataTypes } from "sequelize";
// import sequlize from "../../postgres.service.js";
// import gp_details_model from "./gp_details_model.js";

// const gp_equipment_details_model = sequlize.define('gp_equipment_details', {
//     id: {
//         type: DataTypes.UUID,
//         primaryKey: true,
//         allowNull: false,
//         unique: true,
//         defaultValue: DataTypes.UUIDV4
//     },
//     gp_id: {
//         type: DataTypes.UUID,
//         allowNull: false,
//         references: {
//             model: "gp_details",
//             key: "id",
//         },
//         onDelete: 'SET NULL'
//     },
//     survey_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false
//     },
//     serial_no: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         defaultValue: null
//     },
//     equipment_name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         // unique: true
//     },
//     warranty_status: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: null
//     },
//     warranty_date: {
//         type: DataTypes.DATE,
//         defaultValue: null
//     },
//     condition: {
//         type: DataTypes.STRING,
//         defaultValue: null
//     },
//     condition_status: {
//         type: DataTypes.STRING,
//         defaultValue: null
//     },
//     model: {
//         type: DataTypes.STRING,
//         defaultValue: null
//     },
//     make: {
//         type: DataTypes.STRING,
//         defaultValue: null
//     },
//     content: {
//         type: DataTypes.STRING,
//         allowNull: true,
//         defaultValue: null
//     },
//     other_details: {
//         type: DataTypes.JSONB,
//         allowNull: false
//     },
//     created_by: {
//         type: DataTypes.UUID,
//         allowNull: true,
//         defaultValue: null
//     },
//     deleted_by: {
//         type: DataTypes.UUID,
//         allowNull: true,
//         defaultValue: null
//     },
//     updated_by: {
//         type: DataTypes.UUID,
//         allowNull: true,
//         defaultValue: null
//     },
//     deleted_at: {
//         type: DataTypes.DATE,
//         defaultValue: null,
//         allowNull: true
//     }

// }, { tableName: "gp_equipment_details", timestamps: true, underscored: true });

// export default gp_equipment_details_model;

import mongoose from 'mongoose';

const gpEquipmentDetailsSchema = new mongoose.Schema({
    gp_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    survey_id: {
        type: Number,
        required: true
    },
    serial_no: {
        type: String,
        default: null
    },
    equipment_name: {
        type: String,
        required: true
    },
    warranty_status: {
        type: Boolean,
        default: null
    },
    warranty_date: {
        type: Date,
        default: null
    },
    condition: {
        type: String,
        default: null
    },
    condition_status: {
        type: String,
        default: null
    },
    model: {
        type: String,
        default: null
    },
    make: {
        type: String,
        default: null
    },
    content: {
        type: String,
        default: null
    },
    other_details: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: {}
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    // deleted_by: {
    //     type: String,
    //     default: null
    // },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    deleted_at: {
        type: Date,
        default: null
    }
}, {
    // collection: 'gp_equipment_details',
    timestamps: true
});

const gp_equipment_details_model = mongoose.model('gp_equipment_details', gpEquipmentDetailsSchema, 'gp_equipment_details');

export default gp_equipment_details_model;
