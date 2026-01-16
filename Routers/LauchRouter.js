import express from "express";
import launchNowController from "../Controllers/LaunchCtrl.js";

const router = express.Router();

router.post("/launch-now", launchNowController.createLaunchNow);
router.get("/launch-now", launchNowController.getAllLaunchRequests);
router.delete("/launch-now/:id", launchNowController.deleteLaunchRequest);

export default router;
