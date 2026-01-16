import express from "express";



import { authMiddleware } from "../Middlewares/Auth.js";
import CourseSyllabusCtrl from "../Controllers/courseSyllabusCtrl.js";

const router = express.Router();
router.get("/courseSyllabus/:id", authMiddleware,  CourseSyllabusCtrl.getCourseSyllabusById)
router.get("/courseSyll/:id", CourseSyllabusCtrl.getCourseSyllabusTitileById);
export default router;