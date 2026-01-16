import express from "express";
import StudentController from "../Controllers/StudentCtrl.js";
import { authMiddleware } from "../Middlewares/Auth.js";
import { uploadSingleImageToCloudinary } from "../Middlewares/MultipleImageUpload.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get("/student", authMiddleware,  StudentController.getAllStudents);

router.post("/student", upload.single('avatar'), uploadSingleImageToCloudinary, StudentController.createStudent);

router.put("/editstudent/:id",authMiddleware, upload.single('avatar'), uploadSingleImageToCloudinary, StudentController.editStudent);

router.patch("/studentStatus/:id", authMiddleware, StudentController.studentStatus);

router.patch("/update-student-password/:id", authMiddleware, StudentController.updateStudentPassword);

router.delete("/deletestudent/:id", authMiddleware, StudentController.deleteStudent);

export default router;
