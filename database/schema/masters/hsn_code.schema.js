import mongoose from 'mongoose';

const hsnCodeSchema = new mongoose.Schema(
  {
    gstId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'GST ID is required'],
    },
    hsn_code: {
      type: String,
      required: [true, 'HSN code is required'],
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

const hsn_code_model = mongoose.model('hsn_code_master', hsnCodeSchema, 'hsn_code_master');
export default hsn_code_model;
