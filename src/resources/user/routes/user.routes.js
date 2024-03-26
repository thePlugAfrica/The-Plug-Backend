import express from 'express';
import { login, resendOTP, signUp, verifyOTP } from '../controllers/user.controllers.js';
const router = express.Router();

router.post('/signup', signUp)
router.post('/login', login)
router.post('/verify', verifyOTP)
router.post('/resend', resendOTP)


export default router