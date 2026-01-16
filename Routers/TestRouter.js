import express from "express";

import TestController from "../Controllers/TestCtrl.js";

import { authMiddleware } from "../Middlewares/Auth.js";

const router = express.Router();


router.get("/test", TestController.fetchTests);
router.get("/studentrecord/:student_id", TestController.fetchStudentRecord);
router.post("/test", TestController.createTest);
router.delete("/deletetestquestion/:id", TestController.deletetestquestion);
router.post("/submittest", TestController.submittest);

export default router;
