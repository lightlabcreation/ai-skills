// server.js
import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const ZOOM_ACCOUNT_ID = "zG8hsmGlTXC5rHzbJvvQjA";
const ZOOM_CLIENT_ID = "Yx5_WxqGQyOBegM7Z2eazw";
const ZOOM_CLIENT_SECRET = "lrXiMNjmNPdZwvu9q78jsTps3eHvzu0u";

console.log("✅ Loaded environment variables:",ZOOM_CLIENT_ID);
const getZoomAccessToken = async () => {
  const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`;

  const authHeader =
    "Basic " +
    Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64");

  const response = await axios.post(tokenUrl, {}, {
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data.access_token;
};


app.post("/api/create-meeting", async (req, res) => {
  try {
    const token = await getZoomAccessToken();
    console.log("token",token);
    console.log("✅ Retrieved Zoom Access Token:", token);
    const { topic, start_time, duration } = req.body;

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
          participant_video: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Zoom API Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Meeting creation failed", error: error.message });
  }
});

// ✅ Start Server
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
