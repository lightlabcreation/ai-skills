import express from "express";
import { authMiddleware } from "../Middlewares/Auth.js";
import AiQuizeCtrl from '../Controllers/AIQuizCtrl.js'

const router = express.Router();

router.post('/create', authMiddleware, AiQuizeCtrl.createQuize);
router.get('/getQuiz/:course_syllabus_id', authMiddleware, AiQuizeCtrl.getQuiz);
router.delete('/deleteQuiz/:id', authMiddleware, AiQuizeCtrl.deleteQuiz);
export default router;
