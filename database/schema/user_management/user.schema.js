import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  organisationId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Organisation ID is required'],
    ref: 'Organisation',
  },
  departmentId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Department ID is required'],
    ref: 'Department',
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address',
    },
  },
  mobileNo: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpire: {
    type: Number,
    default: null,
  },
  role: {
    type: Schema.Types.Mixed, // Or define a specific structure if needed
    required: [true, 'Role is required'],
  },
  status: {
    type: Boolean,
    default: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  state: {
    type: String,
    required: [true, 'State is required'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
  },
  country: {
    type: String,
    default: 'india',
    required: [true, 'Country is required'],
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  }
}, {
  timestamps: true,
});

const user_model = mongoose.model("users",userSchema,"users");
export default user_model;
