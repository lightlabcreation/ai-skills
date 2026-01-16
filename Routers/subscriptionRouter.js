import express from "express";
import { authMiddleware } from "../Middlewares/Auth.js";
import SubscriptionCtrl from "../Controllers/SubscriptionCtrl.js";

const router = express.Router();

router.post("/subscription", authMiddleware,  SubscriptionCtrl.createSubscription );
router.get("/subscription/admin_id", authMiddleware,  SubscriptionCtrl.getSubscription);
router.get("/subscription", authMiddleware, SubscriptionCtrl.getAllSubscriptions);
export default router;