import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    materialType: {
      type: String,
      enum: ['SOR', 'NONSOR'],
      required: [true, 'Material type is required'],
    },
    materialName: {
      type: String,
      required: [true, 'Material name is required'],
      unique: true,
      trim: true,
    },
    materialCode: {
      type: String,
      required: [true, 'Material code is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Category ID is required'],
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Sub-category ID is required'],
    },
    uomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'UOM ID is required'],
    },
    hsnCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'HSN Code ID is required'],
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

const material_model = mongoose.model('material_master', materialSchema, 'material_master');
export default material_model;
