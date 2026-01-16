import express from "express";

import categoryController from "../Controllers/CategoryCtrl.js";

import { authMiddleware } from "../Middlewares/Auth.js";

const router = express.Router();

router.get("/category",   categoryController.getAllCategory);

router.post("/category", authMiddleware, categoryController.createCategory);

router.put("/editcategory/:id", authMiddleware, categoryController.editCategory);

router.delete("/deletecategory/:id", authMiddleware, categoryController.deleteCategory);

export default router;
