import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    packageName: {
      type: String,
      required: [true, 'Package name is required'],
      unique: true,
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
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

const package_model = mongoose.model('package_master', packageSchema, 'package_master');
export default package_model;
