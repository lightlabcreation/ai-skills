import express from "express";
import AuthController from "../Controllers/AuthCtrl.js";
import { authMiddleware } from "../Middlewares/Auth.js";
import { uploadSingleImageToCloudinary } from "../Middlewares/MultipleImageUpload.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/login", AuthController.logins);

router.post ("/admin/register", authMiddleware, upload.single('avatar'), uploadSingleImageToCloudinary, AuthController.register);

router.patch("/admin/updateStatus/:id", authMiddleware, AuthController.updateStatus);

router.get ("/admin/getData/:id", authMiddleware, AuthController.getByIdAdmin);

router.put("/admin/update/:id", authMiddleware, upload.single('avatar'), uploadSingleImageToCloudinary, AuthController.updateAdmin);

router.get ("/admin/getAll", authMiddleware, AuthController.fetchAllAdmins);

router.get("/me", authMiddleware, AuthController.fetchData);

router.get("/get-allusers",authMiddleware,  AuthController.fetchUsers);

router.post("/forgot-password", authMiddleware, AuthController.forgotPassword);

router.post("/reset-password", authMiddleware, AuthController.resetPassword);

router.post("/change-password", authMiddleware, AuthController.changePassword);

export default router;
