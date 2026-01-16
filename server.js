import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
dotenv.config();

import routes from "./app.js";
import { setupSocket } from "./Controllers/MessageCtrl.js";

const app = express();
const server = http.createServer(app);

// Configuration
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "https://ai-skill.netlify.app";

// Middlewares
app.use(express.json());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

// Routes
app.use("/", routes);

// WebSocket Setup
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/socket.io",
});

// Attach socket events
setupSocket(io);

// Start the server
server.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
