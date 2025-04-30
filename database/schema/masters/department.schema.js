import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Organisation ID is required']
    },
    departmentName: {
      type: String,
      required: [true, 'Department name is required'],
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

const department_model = mongoose.model(
  'department_master',
  departmentSchema,
  'department_master'
);

export default department_model;
