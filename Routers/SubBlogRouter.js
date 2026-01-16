import express from "express";
import multer from "multer";
import subBlogController from "../Controllers/SubBlogCtrl.js";
import { authMiddleware } from "../Middlewares/Auth.js";
import { uploadSingleImageToCloudinary } from "../Middlewares/MultipleImageUpload.js";
import { validateCourseMediaSize } from "../Middlewares/ImageUpload.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/subblogs", subBlogController.getAllSubBlogs);

router.post(
  "/subblogs",
  upload.single("sub_blog_image"),
  uploadSingleImageToCloudinary,
  validateCourseMediaSize,
  subBlogController.createSubBlog
);

router.put(
  "/subblogs/:id",
  authMiddleware,
  upload.single("sub_blog_image"),
  uploadSingleImageToCloudinary,
  validateCourseMediaSize,
  subBlogController.editSubBlog
);

router.delete("/subblogs/:id", authMiddleware, subBlogController.deleteSubBlog);

export default router;
