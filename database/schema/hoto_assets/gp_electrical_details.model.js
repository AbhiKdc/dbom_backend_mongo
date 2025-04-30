// import { DataTypes } from "sequelize";
// import sequlize from "../../postgres.service.js";

// const gp_electrical_details_model = sequlize.define('gp_electrical_details', {
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
//     electrical_item_name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         // unique: true
//     },
//     warranty_status: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: null
//     },
//     warranty_due_date: {
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
//     content: {
//         type: DataTypes.STRING,
//         allowNull: true,
//         defaultValue: null
//     },
//     power_available: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: true
//     },
//     permanent_connection: {
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

// }, { tableName: "gp_electrical_details", timestamps: true, underscored: true });

// export default gp_electrical_details_model;

import mongoose from 'mongoose';

const gpElectricalDetailsSchema = new mongoose.Schema({
    gp_id: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: 'GpDetails', // Reference to gp_details collection
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
    electrical_item_name: {
        type: String,
        required: true
    },
    warranty_status: {
        type: Boolean,
        default: null
    },
    warranty_due_date: {
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
    content: {
        type: String,
        default: null
    },
    power_available: {
        type: Boolean,
        default: true
    },
    permanent_connection: {
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
    other_details: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: {}
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    deleted_at: {
        type: Date,
        default: null
    }
}, {
    // collection: 'gp_electrical_details',
    timestamps: true
});

const gp_electrical_details_model = mongoose.model('gp_electrical_details', gpElectricalDetailsSchema, 'gp_electrical_details');
export default gp_electrical_details_model
