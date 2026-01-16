import express from "express";
import multer from 'multer';

import certificateController from "../Controllers/CertificateCtrl.js";

import { authMiddleware } from "../Middlewares/Auth.js";

import { uploadSingleImageToCloudinary } from "../Middlewares/MultipleImageUpload.js";

import { validateCourseMediaSize } from "../Middlewares/ImageUpload.js"

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/certificate", authMiddleware, certificateController.getAllCertificate);

router.post("/certificate", authMiddleware, upload.single('certificate'), uploadSingleImageToCloudinary, validateCourseMediaSize, certificateController.createCertificate);

router.put("/editcertificate/:id", authMiddleware, upload.single('certificate'), uploadSingleImageToCloudinary, validateCourseMediaSize, certificateController.editCertificate);

router.patch("/publishCertificate/:id", authMiddleware, certificateController.publishCertificate);

router.delete("/deletecertificate/:id", authMiddleware, certificateController.deleteCertificate);

export default router;
