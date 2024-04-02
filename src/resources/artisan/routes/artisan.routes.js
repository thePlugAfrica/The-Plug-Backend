import express from "express";
import { addPastWork, createAccount, editArtisanProfile, verifyOtp,addMeansOfIdentification, addServices } from "../controllers/artisanController.js";
import isAuthenticated from "../../../middleware/isAuthenticated.js"
import upload from "../../../utils/helper/multer.js";

const router = express.Router();

router.post('/register',createAccount);
router.post('/verifyOtp/:artisan_id',verifyOtp);
router.put('/add/:artisan_id',editArtisanProfile,isAuthenticated);
router.post('/uploadWork/:artisanId',upload.array('images',6),addPastWork);
router.put('/addId/:artisanId',upload.array('ids',2),addMeansOfIdentification);
router.post('/addService/:artisanId',addServices);


export default router;