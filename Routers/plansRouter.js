import express from "express";
import { authMiddleware } from "../Middlewares/Auth.js";
import PlansController from "../Controllers/PlanCtrl.js";

const router = express.Router();

router.post("/plan", authMiddleware, PlansController.createPlan);
router.get("/plan", PlansController.getPlans);
router.delete("/plan/:id", authMiddleware, PlansController.deletePlan);
router.put("/plan/:id", authMiddleware, PlansController.updatePlan);

// Plan Enquiry 
router.get("/planenquiry", PlansController.getPlanenquiry);
router.post("/planenquiry", PlansController.createPlanenquiry);

export default router;
