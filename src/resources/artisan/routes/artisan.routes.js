import express from "express";
import { createAccount, editArtisanProfile, verifyOtp } from "../controllers/artisanController.js";

const router = express.Router();

router.post('/register',createAccount);
router.post('/verifyOtp/:artisan_id',verifyOtp);
router.put('/add/:artisan_id',editArtisanProfile);


export default router;