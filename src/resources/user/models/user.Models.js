import mongoose from 'mongoose';

// Define userSchema
const userSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ['ServiceProvider', 'User'],
    default: 'User'
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: String,
  otpExpiry: Date,
  resetToken: String,
  resetTokenExpiry: String,
  profession: String,
  address: String,
  profilePicture: String
});

// Create userModel from userSchema
const User = mongoose.model('User', userSchema);

export default User;
