import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Category ID is required'],
    },
    subcategory: {
      type: String,
      required: [true, 'Subcategory name is required'],
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

const sub_category_model = mongoose.model('sub_category_master', subCategorySchema, 'sub_category_master');
export default sub_category_model;
