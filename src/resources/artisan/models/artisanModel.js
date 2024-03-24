import mongoose from "mongoose";

const artisanSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      alphanumeric: true,
      trim: true,
      minLength: 6,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    countryCode: {
      type: String,
    },
    country: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
    },
    area: {
      type: String,
    },
    companyName:{
type:String,
    },
    profession: {
      type: String,
    },
    yearOfExperience: {
      type: Number,
      min: 0,
      max: 16,
    },
    residentialAdd: {
      type: String,
    },
    otpCode: {
      type: String,
      expire: "10m",
    },
    workPic: {
      type: String,
    },
    isVerified:{
      type:String,
      default:"false"
    },
    role: { type: String, enum: ["artisan", "user"], default: "artisan" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Artisan", artisanSchema);
