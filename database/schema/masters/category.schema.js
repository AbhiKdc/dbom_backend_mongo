import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Category name is required'],
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

const category_model = mongoose.model("category_master", categorySchema, "category_master");
export default category_model;
