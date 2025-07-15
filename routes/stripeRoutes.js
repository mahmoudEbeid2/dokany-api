import { createCheckoutSession } from "../controllers/stripeController.js";
import { verifyToken } from "../middlewares/auth.js";

import express from "express";
const router = express.Router();

router.post("/create-checkout-session", verifyToken, createCheckoutSession);

export default router;
