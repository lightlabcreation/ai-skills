import express from "express";

import { authMiddleware } from "../Middlewares/Auth.js";
import PaymentController from "../Controllers/PaymentController.js";

const router = express.Router();

router.post('/payment', PaymentController.createPayment);
router.get('/payment', PaymentController.payments)
router.delete('/payment/:id', PaymentController.DeletePayments)

export default router;