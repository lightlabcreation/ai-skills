import express from "express";

import DashboardController from "../Controllers/DashboardCtrl.js";

import { authMiddleware } from "../Middlewares/Auth.js";

const router = express.Router();

router.get("/admin-dashboard",  DashboardController.AdminDashboard);
router.get("/instructor-dashboard/:instructorId",  DashboardController.instructorDashboard);


export default router;
