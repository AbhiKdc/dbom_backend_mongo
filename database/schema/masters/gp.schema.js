import mongoose from 'mongoose';

const gpSchema = new mongoose.Schema(
    {
        packageId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Package ID is required']
        },
        districtId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'District ID is required']
        },
        blockId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Block ID is required']
        },
        gpName: {
            type: String,
            required: [true, 'GP name is required'],
            unique: true,
            trim: true,
        },
        LGDCode: {
            type: String,
            required: [true, 'LGD Code is required'],
            unique: true,
            trim: true,
        },
        longitude: {
            type: Number,
            required: [true, 'Longitude is required'],
        },
        latitude: {
            type: Number,
            required: [true, 'Latitude is required'],
        },
        phase: {
            type: String,
            required: [true, 'Phase is required'],
            trim: true,
        },
        covered: {
            type: String,
            enum: ['COVERED', 'UNCOVERED'],
            required: [true, 'Covered status is required'],
        },
        SRStatus: {
            type: String,
            required: [true, 'SR Status is required'],
            trim: true,
        },
        gpStatus: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE'],
            required: [true, 'GP Status is required'],
        },
        status: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Created by is required']
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Updated by is required']
        },
    },
    {
        timestamps: true,
    }
);

const gp_model = mongoose.model('gp_master', gpSchema, 'gp_master');

export default gp_model;
