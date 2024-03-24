import nodemailer from 'nodemailer';
import verificationTemplate from '../templates/verification-template.js';




const sendVerificationEmail = async (email,Otp) => {
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
        html: verificationTemplate(Otp),
      };
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `${new Date().toLocaleString()} - Email sent successfully:` +
          info.response
      );
    } catch (error) {
      console.log("Email error:", error.message);
      throw new error("Couldn't send verification OTP.");
    }
  };

  export{sendVerificationEmail};