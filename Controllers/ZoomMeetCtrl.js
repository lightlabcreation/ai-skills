import axios from "axios";
import Controllers from "../Models/Model.js";
import { successResponse, errorResponse } from "../Utils/responseHandler.js";
import dotenv from "dotenv";

dotenv.config();

const ZoomTable = new Controllers("zoom_meetings");

const {
  ZOOM_ACCOUNT_ID,
  ZOOM_CLIENT_ID,
  ZOOM_CLIENT_SECRET
} = process.env;

const getZoomAccessToken = async () => {
  const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`;
  const authHeader =
    "Basic " +
    Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64");

  const response = await axios.post(tokenUrl, {}, {
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });

  return response.data.access_token;
};

class ZoomMeetController {
  // ✅ Create Meeting
  static async createMeeting(req, res) {
    try {
      const { topic, start_time, duration } = req.body;

      if (!topic || !start_time || !duration) {
        return errorResponse(res, 400, "All fields (topic, start_time, duration) are required.");
      }

      const accessToken = await getZoomAccessToken();

      const response = await axios.post(
        "https://api.zoom.us/v2/users/me/meetings",
        {
          topic,
          type: 2,
          start_time,
          duration,
          timezone: "Asia/Kolkata",
          settings: {
            host_video: true,
            participant_video: true
          }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      const meeting = response.data;

      // Optional: Store in your DB
      await ZoomTable.create({
        topic,
        meeting_id: meeting.id,
        join_url: meeting.join_url,
        start_url: meeting.start_url,
        password: meeting.password,
        start_time,
        duration
      });

      return successResponse(res, 201, "Meeting created successfully", {
        meeting_id: meeting.id,
        join_url: meeting.join_url,
        start_url: meeting.start_url,
        password: meeting.password,
        start_time
      });
    } catch (error) {
      console.error("Zoom Meeting Error:", error?.response?.data || error.message);
      return errorResponse(res, 500, error.message);
    }
  }

  // ✅ Get All Meetings from DB
  static async getAllMeetings(req, res) {
    try {
      const meetings = await ZoomTable.getAll();

      return successResponse(res, 200, "All meetings fetched successfully", meetings);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  // ✅ Delete Meeting (local delete + Zoom API optional)
  static async deleteMeeting(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return errorResponse(res, 400, "Meeting ID is required.");
      }

      const result = await ZoomTable.delete(id);

      if (result.affectedRows > 0) {
        return successResponse(res, 200, "Meeting deleted successfully.");
      } else {
        return errorResponse(res, 404, "Meeting not found.");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

export default ZoomMeetController;
