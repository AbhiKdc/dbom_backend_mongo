import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema(
  {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Package ID is required'],
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'District ID is required'],
    },
    blockName: {
      type: String,
      required: [true, 'Block name is required'],
      unique: true,
      trim: true,
    },
    blockCode: {
      type: String,
      required: [true, 'Block code is required'],
      unique: true,
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

const block_model = mongoose.model("block_master",blockSchema,"block_master")
export default block_model;
