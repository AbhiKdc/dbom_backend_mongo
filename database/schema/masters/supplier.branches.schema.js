import mongoose from 'mongoose';
import Supplier from './supplier.schema.js'; // Assuming it's the correct import path

const supplierBranchSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Supplier ID is required'],
    },
    branchName: {
      type: String,
      required: [true, 'Branch name is required'],
      unique: true,
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
    isPrimary: {
      type: Boolean,
      default: false,
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
    materials: {
      type: [mongoose.Schema.Types.ObjectId],
      required: [true, 'Materials are required'],
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

const SupplierBranchModel = mongoose.model('supplier_branch_master', supplierBranchSchema, 'supplier_branch_master');
export default SupplierBranchModel;
