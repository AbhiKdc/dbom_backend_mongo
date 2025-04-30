import mongoose from 'mongoose';

const organisationSchema = new mongoose.Schema(
  {
    organisationName: {
      type: String,
      required: [true, 'Organisation name is required'],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    landmark: {
      type: String,
      required: [true, 'Landmark is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
    },
    industryType: {
      type: String,
      required: [true, 'Industry type is required'],
      trim: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Created by is required'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Updated by is required'],
    },
  },
  {
    timestamps: true,
  }
);

const organisation_model = mongoose.model('organisation_master', organisationSchema, 'organisation_master');
export default organisation_model;
