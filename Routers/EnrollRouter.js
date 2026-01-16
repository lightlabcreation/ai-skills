import express from "express";

import { authMiddleware } from "../Middlewares/Auth.js";
import EnrollController from "../Controllers/enrollController.js";

const router = express.Router();

router.post('/enroll', EnrollController.enrollCourse);
router.get('/enrolled/:studentId', EnrollController.getEnrolledCoursesByStudentId )

export default router;