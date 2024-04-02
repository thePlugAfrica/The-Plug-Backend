import express from 'express';
import { forgotPassword, login, resendOTP, resetPassword, signUp, verifyOTP } from '../controllers/user.controllers.js';
const router = express.Router();

router.post('/signup', signUp)
router.post('/login', login)
router.post('/verify', verifyOTP)
router.post('/resend', resendOTP)
router.post('/forgot', forgotPassword)
router.post('/reset', resetPassword)


export default router