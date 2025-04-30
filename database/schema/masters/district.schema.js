import mongoose from 'mongoose';

const districtSchema = new mongoose.Schema(
    {
        packageId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Package ID is required']
        },
        district: {
            type: String,
            required: [true, 'District name is required'],
            unique: true,
            trim: true,
        },
        districtCode: {
            type: String,
            required: [true, 'District code is required'],
            unique: true,
            trim: true,
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

const district_model = mongoose.model(
    'district_master',
    districtSchema,
    'district_master'
);

export default district_model;
