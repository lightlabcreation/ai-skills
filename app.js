import express, { Router } from "express";
import AuthRouter from "./Routers/AuthRouter.js";
import StudentRouterr from "./Routers/StudentRouter.js";
import InstructorRouter from "./Routers/InstructorRouter.js";
import CourseRouter from "./Routers/CourseRouter.js";
import CategoryRouter from "./Routers/CategoryRouter.js";
import ProductRouter from "./Routers/ProductRouter.js";
import CertificateRouter from "./Routers/CertificateRouter.js";
import ArticleRouter from "./Routers/ArticleRouter.js";
import DashboardRouter from "./Routers/DashboardRouter.js";
import PlansRouter from "./Routers/plansRouter.js";
import courseSubHeadingRouter from "./Routers/courseSubHeadingRouter.js";
import CourseSyllabusRouter from "./Routers/CourseSyllabusRouter.js"
import CartItemsRouter from "./Routers/CartItemRouter.js";
import AIQuizRouter from "./Routers/AIQuizRouter.js";
import SubBlogRouter from "./Routers/SubBlogRouter.js";
import LauchRouter from "./Routers/LauchRouter.js";
import TestRouter from "./Routers/TestRouter.js";
import ReviewRouter from "./Routers/ReviewRouter.js";
import CourseSyllabusContentRouter from "./Routers/CourseSyllabusContentRouter.js";
import ZoomMeetRouter from "./Routers/ZoomMeetRouter.js";
import PaymentRouter from "./Routers/PaymentRouter.js";
import CoursePlanRouter from "./Routers/CoursePlanRouter.js";

import axios from "axios";

const router = Router();
router.use(express.json());

router.get("/api/location", async (req, res) => {
  try {
    const response = await axios.get("https://ipinfo.io/json?token=c3c95e99b5d153");
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching location:", error);
    res.status(500).json({ error: "Failed to fetch location" });
  }
});

router.use("/api", AuthRouter);
router.use("/api", StudentRouterr);
router.use("/api", InstructorRouter);
router.use("/api", CourseRouter);
router.use("/api", ProductRouter);
router.use("/api", CategoryRouter);
router.use("/api", CertificateRouter);
router.use("/api", ArticleRouter);
router.use("/api", DashboardRouter);
router.use("/api", PlansRouter);
router.use("/api", courseSubHeadingRouter);
router.use("/api", CourseSyllabusRouter);
router.use("/api", CartItemsRouter);
router.use("/api/Ai", AIQuizRouter);
router.use("/api", SubBlogRouter);
router.use("/api", LauchRouter);
router.use("/api", TestRouter);
router.use("/api", ReviewRouter);
router.use("/api", CourseSyllabusContentRouter);
router.use("/api", ZoomMeetRouter);
router.use("/api", PaymentRouter);
router.use("/api", CoursePlanRouter);

export default router;
