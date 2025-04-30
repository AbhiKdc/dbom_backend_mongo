import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema(
  {
    warehouse_name: {
      type: String,
      required: [true, 'Warehouse name is required'],
      unique: true,
    },
    warehouse_type: {
      type: String,
      enum: ['zonal', 'district'],
      default: 'zonal',
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    district: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'india',
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
    },
    contact_persons: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    capacity: {
      type: String,
      default: null, // Can change to number if required
    },
    status: {
      type: Boolean,
      default: true,
    },
    latitude: {
      type: String,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: String,
      required: [true, 'Longitude is required'],
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Created by is required'],
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Updated by is required'],
    },
  },
  {
    timestamps: true,
  }
);

const warehouse_model = mongoose.model('warehouse_master', warehouseSchema, 'warehouse_master');
export default warehouse_model;
