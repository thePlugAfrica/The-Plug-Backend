import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { errorResMsg } from './response.js';

dotenv.config();

const { EMAIL_USER, EMAIL_PASS, EMAIL_SERVER } = process.env;

const sendEmail = async (msg, subject, receiver) => {
    try {
        const transporter = nodemailer.createTransport({
            host: EMAIL_SERVER,
            port: 465,
            secure: true,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        const info = await transporter.sendMail({
            from: 'grazacacademy@gmail.com',
            subject,
            html: msg,
            to: receiver,
        });

        return `Message sent: ${nodemailer.getTestMessageUrl(info)}`;
    } catch (err) {
        console.log(err);
        throw new Error("Error sending mail");
    }
};


export { sendEmail };
