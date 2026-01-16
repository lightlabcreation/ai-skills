import express from "express";
import multer from 'multer';

import CourseController from "../Controllers/CourseCtrl.js";

import { authMiddleware } from "../Middlewares/Auth.js";

import { uploadCourseMedia, validateCourseMediaSize } from '../Middlewares/ImageUpload.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/course",  CourseController.getAllCourses);

router.get("/coursebyCategoryId/:category_id", authMiddleware,  CourseController.getcoursebyCategoryId);

router.post("/course",  upload.fields([{ name: 'course_image', maxCount: 1 }, { name: 'test_video', maxCount: 1 }]), validateCourseMediaSize, uploadCourseMedia, CourseController.createCourse);

router.put("/editcourse/:id", authMiddleware,  upload.fields([{ name: "course_image", maxCount: 1 }, { name: "test_video", maxCount: 1 }]), validateCourseMediaSize, uploadCourseMedia, CourseController.editCourse);

router.patch("/publishCourse/:id", authMiddleware,  CourseController.publishCourse);

router.delete("/deletecourse/:id", authMiddleware,  CourseController.deleteCourse);

export default router;
