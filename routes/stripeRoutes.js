import { createCheckoutSession } from "../controllers/stripeController.js";

import express from "express";
const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);

export default router;
