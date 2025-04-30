import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Department ID is required'],
    },
    teamName: {
      type: String,
      required: [true, 'Team name is required'],
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

const team_model = mongoose.model('team_master', teamSchema, 'team_master');
export default team_model;
