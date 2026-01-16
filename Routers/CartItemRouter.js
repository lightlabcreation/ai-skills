import express from "express";
import { authMiddleware } from "../Middlewares/Auth.js";
import CartItemCtrl from "../Controllers/CartItemCtrl.js";

const router = express.Router();

router.post("/cart/add",authMiddleware, CartItemCtrl.addToCart);
router.get("/cart/:user_id",  CartItemCtrl.getCartByUserId);
router.delete("/cart/remove/:id", authMiddleware, CartItemCtrl.deleteCartItem);


export default router;
