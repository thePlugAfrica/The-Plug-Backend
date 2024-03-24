import { createJwtToken } from "../../../middleware/isAuthenticated.js";
import { sendVerificationEmail } from "../../../utils/email/email-sender.js";
import { errorResMsg } from "../../../utils/lib/response.js";
import logger from "../../../utils/log/logger.js";
import {
  otpSchema,
  registerSchema,
  updateArtisan,
} from "../../../utils/validation/validation.js";
import Artisan from "../models/artisanModel.js";
import generateOtp from "../services/artisan.service.js";

export const createAccount = async (req, res) => {
  try {
    const { fullName, email, countryCode, phoneNumber, password } = req.body;
    const { error } = registerSchema.validate(req.body);
    logger.info(`Received registration request for phone number: ${countryCode}${phoneNumber}`);
    if (error) {
      return errorResMsg(res, 404, error.message);
    }
    // check if artisan already exist
    const existingArtisan = await Artisan.findOne({ email });
    if (existingArtisan) {
      logger.info(`Artisan:${email} already exists`);
      return errorResMsg(res, 409, "Artisan already exists");
    }
    // if not...
    const newArtisan = await Artisan.create({
      fullName,
      phoneNumber,
      countryCode,
      email,
      password,
    });
    // generate OTP and save it to the database
    let otp = generateOtp();
    newArtisan.otpCode = otp;
    await newArtisan.save();
    //send verification Email with generated OTP
    await sendVerificationEmail(newArtisan.email, otp);
    logger.info(newArtisan);
    return successResMsg(res, 200, {
      success: true,
      message: `OTP successfully sent to ${newArtisan.email}`,
    });
  } catch (error) {
    return errorResMsg(res, 500, error.message);
  }
};

export const verifyOtp = async (req, res) => {
  try {
    //  input
    const { otp } = req.body;
    const { error } = otpSchema.validate(req.body);
    if (error) {
      return errorResMsg(res, 400, error.message);
    }
    // check if user  exist
    const artisan = await Artisan.findOne({ _id: req.params.artisan_id });
    if (!artisan) {
      return errorResMsg(res, 404, "Artisan not found");
    }
    //    check if the otp is correct
    if (artisan.otpCode !== otp) {
      return errorResMsg(res, 400, "OTP is incorrect or Resend OTP");
    }
    // Check if OTP has expired
    const phoneOtpExpirationTime = process.env.PHONE_OTP_EXPIRATION_TIME;
    if (Date.now() > phoneOtpExpirationTime) {
      return errorResMsg(res, 409, "OTP expired, please resend OTP");
    }
    // Mark isVerified and clear OTP
    artisan.isVerified = true;
    artisan.otpCode = null;
    await artisan.save();
    //create a payload and tokenize it

    const payload = { artisan: { artisanId: artisan._id } };
    const token = createJwtToken(payload);
    // success response
    logger.info(artisan._doc);
    return successResMsg(res, 200, {
      success: true,
      message: "OTP successfully verified",
      artisan,
      token,
    });
  } catch (error) {
    return errorResMsg(res, 503, "An error occurred during OTP verification");
  }
};

export const editArtisanProfile = async (req, res) => {
  try {
    const {
      companyName,
      profession,
      yearOfExperience,
      residentialAdd,
      country,
      state,
      area,
    } = req.body;
    const { error } = updateArtisan.validate(req.body);
    if (error) {
      return errorResMsg(res, 400, error.message);
    }
    const artisanId = req.params.artisan_id;

    // Find the artisan in the database
    const artisan = await Artisan.findById(artisanId);

    if (!artisan) {
      return errorResMsg(res, 404, "Artisan not found");
    }

    // Update artisan data
    artisan.companyName = companyName;
    artisan.profession = profession;
    artisan.yearOfExperience = yearOfExperience;
    artisan.residentialAdd = residentialAdd;
    artisan.country = country;
    artisan.state = state;
    artisan.area = area;

    // Save the updated artisan data
    await artisan.save();

    // Success response
    return successResMsg(res, 200, {
      success: true,
      message: "Artisan data added successfully",
      artisan, // Return updated artisan data
    });
  } catch (error) {
    return errorResMsg(
      res,
      503,
      "An error occurred while updating artisan data"
    );
  }
};

// add past work pictures
export const addPastWork = async (req, res) => {
  try {
  } catch (error) {}
};

//  means of identification
export const setMeansOfIdentification = async (req, res) => {
  try {
  } catch (error) {}
};
