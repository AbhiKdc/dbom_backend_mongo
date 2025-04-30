import mongoose from 'mongoose';

const uomSchema = new mongoose.Schema(
  {
    uom: {
      type: String,
      required: [true, 'UOM is required'],
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

const uom_model = mongoose.model('uom_master', uomSchema, 'uom_master');
export default uom_model;
