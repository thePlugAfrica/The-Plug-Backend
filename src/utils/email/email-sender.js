import nodemailer from 'nodemailer';
import verificationTemplate from '../templates/verification-template.js';
import { errorResMsg } from '../lib/response.js';




const sendVerificationEmail = async (email,fullName,otp) => {
    try {
      const transporter = nodemailer.createTransport({
        host:  "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_NODEMAILER,
          pass: process.env.PASSWORD_NODEMAILER,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_NODEMAILER,
        to: email,
        subject: "Verification OTP",
        html: verificationTemplate(fullName,otp),
      };
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `${new Date().toLocaleString()} - Email sent successfully:` +
          info.response
      );
    } catch (error) {
      console.log("Email error:", error.message);
      return errorResMsg(res, 500, error.message,"Couldn't send verification OTP.");
    }
  };

  export{sendVerificationEmail};