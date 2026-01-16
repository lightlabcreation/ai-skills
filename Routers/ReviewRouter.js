import express from "express";
import ReviewController from "../Controllers/ReviewCtrl.js";

const router = express.Router();

router.post("/reviews", ReviewController.createReview);
router.get("/reviews", ReviewController.getAllReviews);
router.delete("/reviews/:id", ReviewController.deleteReview);

export default router;
