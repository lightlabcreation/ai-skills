import express from "express";
import multer from "multer";

import CourseSyllabusContentController from "../Controllers/CourseSyllabusContentCtrl.js";
import { authMiddleware } from "../Middlewares/Auth.js";
import { uploadSingleImageToCloudinary } from "../Middlewares/MultipleImageUpload.js";
import { validateCourseMediaSize } from "../Middlewares/ImageUpload.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/course-syllabus-content", CourseSyllabusContentController.getAllContent);

router.post(
  "/course-syllabus-content",
  authMiddleware,
  upload.single("image"),
  uploadSingleImageToCloudinary,
  validateCourseMediaSize,
  CourseSyllabusContentController.createContent
);

router.put(
  "/course-syllabus-content/:id",
  authMiddleware,
  upload.single("image"),
  uploadSingleImageToCloudinary,
  validateCourseMediaSize,
  CourseSyllabusContentController.editContent
);

router.delete("/course-syllabus-content/:id", authMiddleware, CourseSyllabusContentController.deleteContent);

export default router;
