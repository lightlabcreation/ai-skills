import express from "express";
import multer from 'multer';

import courseSyllContCtrl from "../Controllers/courseSubHeadingCtrl.js";

import { authMiddleware } from "../Middlewares/Auth.js";


const router = express.Router();    


router.post("/courseSyllabusCont", courseSyllContCtrl.createCourseSyllCon)
router.get("/courseSyllabusCont/:course_syllabus_id", courseSyllContCtrl.getByCourseSyllabusId);
router.delete("/courseSyllabusCont/:id", authMiddleware, courseSyllContCtrl.deleteCourseSyllabus)

export default router;  