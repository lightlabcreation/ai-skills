import express from "express";

import { authMiddleware } from "../Middlewares/Auth.js";
import CourseReviewController from "../Controllers/CourceReviewCtrl.js";

const router = express.Router();

router.post('/course/review', CourseReviewController.AddReview);
router.get('/course/review/:courseId', CourseReviewController.getReviewByCourseId )

export default router;