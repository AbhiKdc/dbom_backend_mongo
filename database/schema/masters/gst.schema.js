import mongoose from 'mongoose';

const gstSchema = new mongoose.Schema(
  {
    gst: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'GST value is required'],
      unique: true,
      validate: {
        validator: (value) => parseFloat(value) >= 0,
        message: 'GST must be a non-negative number',
      },
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

const gst_model = mongoose.model('gst_master', gstSchema, 'gst_master');

export default gst_model;
