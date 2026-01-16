import express from "express";
import multer from 'multer';

import productController from "../Controllers/ProductCtrl.js";

import { authMiddleware } from "../Middlewares/Auth.js";

import { validateCourseMediaSize } from '../Middlewares/ImageUpload.js';

import { uploadCloudinary } from "../Middlewares/MultipleImageUpload.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/product" , productController.getAllproduct);

router.post("/product",authMiddleware, upload.array('product_images'), validateCourseMediaSize, uploadCloudinary, productController.createproduct);

router.put("/editproduct/:id",authMiddleware, upload.array('product_images'), validateCourseMediaSize, uploadCloudinary, productController.editproduct);

router.patch("/publishProduct/:id", authMiddleware, productController.publishProduct);

router.delete("/deleteproduct/:id", authMiddleware, productController.deleteproduct);

export default router;
