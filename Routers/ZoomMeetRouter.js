import express from "express";
import ZoomMeetController from "../Controllers/ZoomMeetCtrl.js";

const router = express.Router();

router.post("/createMeeting", ZoomMeetController.createMeeting);
router.get("/fetchMeetings", ZoomMeetController.getAllMeetings);
router.delete("/deleteMeeting/:id", ZoomMeetController.deleteMeeting);

export default router;
