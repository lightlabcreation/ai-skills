import express from "express";
import { authMiddleware } from "../Middlewares/Auth.js";
import coursePlansCtrl from "../Controllers/CouresePlanCtrl.js";

const router = express.Router();

router.post("/course-plan", coursePlansCtrl.createCoursePlan);
router.get("/course-plan", coursePlansCtrl.getCoursePlans);
router.delete("/course-plan/:id", coursePlansCtrl.deleteCoursePlan);
router.put("/course-plan/:id", coursePlansCtrl.updateCoursePlan);

// Plan Enquiry 
router.get("/business-enquiry", coursePlansCtrl.getBusinessEnquiries);

// Create enquiry
router.post("/business-enquiry", coursePlansCtrl.createBusinessEnquiry);

// Delete enquiry
router.delete("/business-enquiry/:id", coursePlansCtrl.deleteBusinessEnquiry);

export default router;
