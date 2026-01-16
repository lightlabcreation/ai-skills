import express from "express";
import multer from 'multer';

import articleController from "../Controllers/ArticleCtrl.js";

import { authMiddleware } from "../Middlewares/Auth.js";

import { uploadSingleImageToCloudinary } from "../Middlewares/MultipleImageUpload.js";

import { validateCourseMediaSize } from "../Middlewares/ImageUpload.js"

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/article", articleController.getAllarticle);

router.post("/article", authMiddleware, upload.single("article"),
(req, res, next) => {
  console.log(">>> req.file:", req.file); // ✅ this should show file data
  console.log(">>>   req.body:", req.body); // ✅ form fields
  next();
}, uploadSingleImageToCloudinary, validateCourseMediaSize, articleController.createarticle);

router.put("/editarticle/:id", authMiddleware, upload.single('article'), uploadSingleImageToCloudinary, validateCourseMediaSize, articleController.editarticle);

router.patch("/publisharticle/:id",authMiddleware,  articleController.publisharticle);

router.delete("/deletearticle/:id", authMiddleware, articleController.deletearticle);

export default router;
