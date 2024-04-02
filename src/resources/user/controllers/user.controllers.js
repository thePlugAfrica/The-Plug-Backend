import { passwordCompare, passwordHash } from "../../../utils/lib/bcrypt.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { sendEmail } from "../../../utils/lib/email.js";
import { errorResMsg, successResMsg } from "../../../utils/lib/response.js";
import { signUpSchema } from "../../../utils/validation/validation.js";
import User from "../models/user.Models.js";
import ejs from "ejs";
import path from "path";
import {v4 as uuidv4} from "uuid";
import { createJwtToken } from "../../../middleware/isAuthenticated.js";

// Generate random OTP
function generateOTP() {
  let otp = "";
  for (let i = 0; i < 4; i++) {
    otp += Math.floor(Math.random() * 10); // Random digit between 0 and 9
  }
  return otp;
}

export const signUp = async (req, res, next) => {
  try {
    const { email, fullName, phoneNumber, password } = req.body;
    const { error } = signUpSchema.validate(req.body);
    if (error) {
      return errorResMsg(res, 404, error.message);
    }

    // Check if email is provided
    if (!email) {
      return errorResMsg(res, 400, "Email is required");
    }

    // Check if the email is already registered
    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      return errorResMsg(res, 400, "Email already registered");
    }
    //Hash Password
    const pass = await passwordHash(password);

    // Generate OTP
    const otp = generateOTP();

    // Calculate OTP expiry time (in milliseconds)
    const otpExpiry = Date.now() + 5 * 60 * 1000; // Expiry set to 5 minutes from now

    // Get the directory name of the current module
    const __dirname = dirname(fileURLToPath(import.meta.url));

    // Generate email template
    const emailTemplate = await ejs.renderFile(
      path.join(__dirname, "../../../utils/email/signup.ejs"),
      {
        title: `Hello ${fullName}`,
        body: "Welcome Message",
        otp: otp,
      }
    );

    // Send a verification email
    await sendEmail(emailTemplate, "Verify Email", email);

    // Create a new user instance
    const newUser = new User({
      email,
      password: pass,
      fullName,
      otp,
      otpExpiry,
      phoneNumber,
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    // Return success response
    return successResMsg(res, 201, {
      success: true,
      user: savedUser,
      message: "User created successfully",
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: "Internal server error",
    });
  }
};

// login.controller.js
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return errorResMsg(res, 400, "Email and password are required");
    }

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return errorResMsg(res, 404, "User not found");
    }

    // Check if user is verified
    if (!user.isVerified) {
      return errorResMsg(
        res,
        403,
        "User not verified. Please verify your email."
      );
    }

    // Check if password is correct
    const isPasswordValid = await passwordCompare(password, user.password);
    if (!isPasswordValid) {
      return errorResMsg(res, 401, "Incorrect password");
    }
    const token = createJwtToken({ userId: user._id });
    res.cookie("access_token", token);
    // Return success response
    return successResMsg(res, 200, {
      success: true,
      data: {
        userId: user._id,
        token,
        message: "User successfully logged in",
      },
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: "Internal server error",
    });
  }
};

// otp.controller.js
export const verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;

    // Find the user by OTP
    const user = await User.findOne({ otp });

    // Check if user exists
    if (!user) {
      return errorResMsg(res, 404, "User not found with provided OTP");
    }

    // Check if OTP is expired
    if (user.otpExpiry < Date.now()) {
      return errorResMsg(res, 401, "Expired OTP");
    }

    // Update user's verification status
    user.isVerified = true;
    await user.save();

    // Return success response
    return successResMsg(res, 200, {
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: "Internal server error",
    });
  }
};

// resendOTP.controller.js
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return errorResMsg(res, 404, "User not found");
    }

    // Generate new OTP
    const otp = generateOTP();

    // Calculate OTP expiry time (in milliseconds)
    const otpExpiry = Date.now() + 5 * 60 * 1000; // Expiry set to 5 minutes from now

    // Update user's OTP and OTP expiry
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Get the directory name of the current module
    const __dirname = dirname(fileURLToPath(import.meta.url));

    // Generate email template
    const emailTemplate = await ejs.renderFile(
      path.join(__dirname, "../../../utils/email/resendOtp.ejs"),
      { title: `Hello ${user.fullName}`, body: "Resend Otp Mail", otp: otp }
    );

    // Send email with new OTP
    await sendEmail(emailTemplate, "Resend OTP", email);

    // Return success response
    return successResMsg(res, 200, {
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: "Internal server error",
    });
  }
};

// forgotPassword.controller.js
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return errorResMsg(res, 404, "User not found");
    }
    // Get the directory name of the current module
    const __dirname = dirname(fileURLToPath(import.meta.url));
// Generate reset token
const resetToken = uuidv4();

    // Save reset token and expiry in user's document
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // Expiry set to 24 hours from now
    await user.save();

    // Generate email template
    const resetLink = `${process.env.RESET_PASSWORD_URL}?token=${resetToken}`;
    const emailTemplate = await ejs.renderFile(
      path.join(__dirname, "../../../utils/email/resetPassword.ejs"),
      { title: "Reset Password",
      resetLink }
    );

    // Send email with reset link
    await sendEmail(emailTemplate, "Reset Password", email);

    // Return success response
    return successResMsg(res, 200, {
      success: true,
      message: "Reset link sent successfully",
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: "Internal server error",
    });
  }
};

// resetPassword.controller.js
export const resetPassword = async (req, res, next) => {
  try {
    const {  password, confirmPassword } = req.body;
    const {  token } = req.query;

    // Find the user by reset token
    const user = await User.findOne({ resetToken: token });

    // Check if user exists and reset token is valid
    if (!user || user.resetTokenExpiry < Date.now()) {
      return errorResMsg(res, 404, "Invalid or expired reset token");
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return errorResMsg(res, 400, "Passwords do not match");
    }

    // Hash password
    const hashedPassword = await passwordHash(password);

    // Update user's password and reset token fields
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    // Return success response
    return successResMsg(res, 200, {
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: "Internal server error",
    });
  }
};

// verifyResetLink.controller.js
export const verifyResetLink = async (req, res, next) => {
  try {
    const { token } = req.query;

    // Find the user by reset token
    const user = await User.findOne({ resetToken: token });

    // Check if user exists and reset token is valid
    if (!user || user.resetTokenExpiry < Date.now()) {
      return errorResMsg(res, 404, "Invalid or expired reset token");
    }

    // Return success response
    return successResMsg(res, 200, {
      success: true,
      message: "Reset link verified successfully",
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, {
      error: error.message,
      message: "Internal server error",
    });
  }
};
