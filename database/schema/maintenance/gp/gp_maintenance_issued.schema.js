import mongoose from "mongoose";

const gp_maintenance_issued_schema = new mongoose.Schema(
    {
        maintenance_request_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Maintenance request ID is required."],
        },
        maintenance_id: {
            type: Number,
            required: [true, "Maintenance ID is required."],
            unique: true,
        },
        issue_date: {
            type: Date,
            default: Date.now,
        },
        estimate_arrival_date: {
            type: Date,
            default: Date.now,
        },
        assets_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Asset ID is required."],
        },
        assets_details: {
            type: Object,
            required: [true, "Asset details are required."],
        },
        repair_type: {
            type: String,
            enum: {
                values: ["onsite", "offsite"],
                message: "Repair type: {VALUES} must be either 'onsite' or 'offsite'."
            },
            required: [true, "Repair type is required."],
        },
        maintenance_type: {
            type: String,
            enum: {
                values: ["amc", "o&m"],
                message: "Maintenance type: {VALUES} must be either 'amc' or 'o&m'."
            },
            required: [true, "Maintenance type is required."],
        },
        issue_reported: {
            type: String,
            required: [true, "issue reported is required"]
        },
        assign_to: {
            type: String,
            required: [true, "Assigned user is required."],
        },
        repair_status: {
            type: String,
            enum: {
                values: ["installed", "under_repair", "repaired"],
                message: "Repair status {VALUE} must be one of 'installed', 'under_repair', or 'repaired'."
            },
            default: "under_repair",
        },
        remarks: {
            type: String,
            default: null
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "createdBy is required"]
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "updatedBy is required"]
        }
    },
    {
        timestamps: true,
    }
);

const gp_maintenance_model = mongoose.model(
    "gp_maintenance_issued",
    gp_maintenance_issued_schema,
    "gp_maintenance_issued"
);

export default gp_maintenance_model;
