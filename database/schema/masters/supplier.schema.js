import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    supplierName: {
      type: String,
      required: [true, 'Supplier name is required'],
      unique: true,
    },
    onBoardingDate: {
      type: Date,
      required: [true, 'Onboarding date is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: 'Invalid email format',
      },
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
    },
    panNo: {
      type: String,
      required: [true, 'PAN number is required'],
      unique: true,
    },
    gstNo: {
      type: String,
      required: [true, 'GST number is required'],
      unique: true,
    },
    address: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    contactPerson: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Contact person details are required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Created by is required'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Updated by is required'],
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const supplier_model = mongoose.model('supplier_master', supplierSchema, 'supplier_master');
export default supplier_model;
