import { sendVerificationEmail } from "../../../utils/email/email-sender.js";
import cloudinary from "../../../utils/helper/cloudinary.js";
import { passwordHash } from "../../../utils/helper/hashing.js";
import { createJwtToken } from "../../../utils/helper/jwt.js";
import generateOtp from "../../../utils/helper/otpGenerator.js";
import { errorResMsg, successResMsg } from "../../../utils/lib/response.js";
import logger from "../../../utils/log/logger.js";
import {
  otpSchema,
  registerSchema,
  updateArtisan,
  validateService,
} from "../../../utils/validation/validation.js";
import Artisan from "../models/artisanModel.js";
import PastWorkPic from "../models/pastWorkPicModel.js";
import Service from "../models/services.js";

export const createAccount = async (req, res) => {
  try {
    const { fullName, email, countryCode, phoneNumber, password } = req.body;
    const { error } = registerSchema.validate(req.body);
    logger.info(
      `Received registration request for phone number: ${countryCode}${phoneNumber}`
    );
    if (error) {
      return errorResMsg(res, 404, error.message);
    }
    // check if artisan already exist
    const existingArtisan = await Artisan.findOne({ email });
    if (existingArtisan) {
      logger.info(`Artisan:${email} already exists`);
      return errorResMsg(res, 409, "Artisan already exists");
    }
    // hash password
    const hashedPassword = await passwordHash(password);
    // if not...
    const newArtisan = await Artisan.create({
      fullName,
      phoneNumber,
      countryCode,
      email,
      password: hashedPassword,
    });
    // generate OTP and save it to the database
    let otp = generateOtp();
    newArtisan.otpCode = otp;
    await newArtisan.save();
    //send verification Email with generated OTP
    await sendVerificationEmail(newArtisan.email, newArtisan.fullName, otp);
    // logger.info(newArtisan);
    return successResMsg(res, 200, {
      success: true,
      message: `OTP successfully sent to ${newArtisan.email}`,
      newArtisan,
    });
    // redirect endpoint to otp verification page
  } catch (error) {
    return errorResMsg(res, 500, error.message);
  }
};

export const verifyOtp = async (req, res) => {
  try {
    //  input
    const { otpCode } = req.body;
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
    if (artisan.otpCode !== otpCode) {
      return errorResMsg(res, 400, "OTP is incorrect or Resend OTP");
    }
    // Check if OTP has expired
    const phoneOtpExpirationTime = process.env.PHONE_OTP_EXPIRATION_TIME;
    if (Date.now() > phoneOtpExpirationTime) {
      return errorResMsg(res, 409, "OTP expired, please resend OTP");
    }
    //create a payload and tokenize it
    const payload = { artisan: { artisanId: artisan._id } };
    const token = createJwtToken(payload);
    // Mark isVerified and clear OTP
    artisan.isVerified = true;
    artisan.otpCode = null;
    await artisan.save();
    // success response
    logger.info(artisan._doc);
    return successResMsg(res, 200, {
      success: true,
      message: "OTP successfully verified",
      artisan,
      token,
    });
  } catch (error) {
    return errorResMsg(
      res,
      503,
      error.message,
      "An error occurred during OTP verification"
    );
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
    // Get the artisan from the request
    const { artisanId } = req.params;

    // Find the artisan in the database
    let artisan = await Artisan.findById(artisanId);
    if (!artisan) {
      return errorResMsg(res, 404, "Artisan not found");
    }

    const results = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path);
        return {
          publicId: result.public_id,
          imageUrl: result.secure_url,
        };
      })
    );

    const newPastWorks = results.map(
      (result) =>
        new PastWorkPic({
          artisan: artisanId,
          cloudinaryPublicId: result.publicId,
          image: result.imageUrl,
          description: req.body.description,
        })
    );
    await PastWorkPic.insertMany(newPastWorks);

    return res.status(200).json({
      success: true,
      message: "Pictures uploaded successfully",
      newPastWorks,
    });
  } catch (error) {
    return errorResMsg(
      res,
      503,
      error.message,
      "An error occurred while uploading pictures"
    );
  }
};

//  means of identification
export const addMeansOfIdentification = async (req, res) => {
  try {
    const { artisanId } = req.params;

    // Find the artisan in the database
    let artisan = await Artisan.findById(artisanId);
    if (!artisan) {
      return errorResMsg(res, 404, "Artisan not found");
    }

    const results = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path);
        return {
          imageUrl: result.secure_url,
        };
      })
    );

    // Update the artisan document with means of identification
    artisan.idCardImage = results.map((result) => result.imageUrl);
    await artisan.save();

    return res.status(200).json({
      success: true,
      message: "Means of Identification uploaded successfully",
      idCardImages: artisan.idCardImage,
    });
  } catch (error) {
    return errorResMsg(
      res,
      503,
      error.message,
      "An error occurred while uploading pictures"
    );
  }
};

// add Services
export const addServices = async (req, res) => {
  try{
  const {serviceName,price} = req.body;
  const { error } = validateService.validate(req.body);
    if (error) {
      return errorResMsg(res, 400, error.message);
    }
  const { artisanId } = req.params;
  // Check if artisan exists
  const artisan = await Artisan.findById(artisanId);
  if(!artisan){
    return errorResMsg(res, 404, "Artisan not found");
  }
  // check if service already exist
  const checkService = await Service.findOne({serviceName});
  if (checkService) {
    return errorResMsg(res, 409, "Service already exists");
  }

  const addService = await Service.create({serviceName,price, artisanId: artisan._id});
  return res.status(200).json({
    success: true,
    message: "Services uploaded successfully",
    addService
  });

  }catch(error){
    console.log("Error on adding services : ", error.message);
    return errorResMsg(res,  400, "Invalid request body");
  }
};

// login

export const login = async (req, res) => {
  try {
  } catch (error) {}
};
