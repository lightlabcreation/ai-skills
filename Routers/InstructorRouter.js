import express from "express";
import multer from 'multer';

import InstructorController from "../Controllers/InstructorCtrl.js";

import { authMiddleware } from "../Middlewares/Auth.js";

import { uploadSingleImageToCloudinary } from '../Middlewares/MultipleImageUpload.js';

import { validateCourseMediaSize } from '../Middlewares/ImageUpload.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/instructor", authMiddleware, InstructorController.getAllInstructor);

router.post("/instructor", upload.single('avatar'), validateCourseMediaSize, uploadSingleImageToCloudinary, InstructorController.createInstructor);

router.put("/editinstructor/:id",authMiddleware,  upload.single('avatar'), validateCourseMediaSize, uploadSingleImageToCloudinary, InstructorController.editInstructor);

router.patch("/update-instructor-password/:id", authMiddleware, InstructorController.updateinstructortPassword);

router.patch("/instructorStatus/:id", authMiddleware, InstructorController.instructorStatus);

router.delete("/deleteinstructor/:id", authMiddleware, InstructorController.deleteInstructor);

router.patch("/update-instructor/Varified/:id", InstructorController.updateInsturctortIsVarified);

export default router;
