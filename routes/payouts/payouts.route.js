import express from "express";
import {
  getPayouts,
  getSellerPayouts,
  createPayout,
  updatePayoutStatus,
  deletePayout,
} from "../../controllers/payouts/payouts.controller.js";

import { verifyToken } from "../../middlewares/auth.js";

import { isAdmin, isSeller } from "../../middlewares/isAuthorized.js";

const router = express.Router();

// GET /api/payouts
router.get("/payouts", verifyToken, isAdmin, getPayouts);

// GET /api/payouts/seller/:sellerId

router.get("/payouts/seller/:sellerId", verifyToken, isSeller, getSellerPayouts);

// POST /api/payouts

router.post("/payouts", verifyToken, isSeller, createPayout);

// PUT /api/payouts/:id/status

router.put("/payouts/:id/status", verifyToken, isAdmin, updatePayoutStatus);

// DELETE /api/payouts/:id

router.delete("/payouts/:id", verifyToken, isAdmin, deletePayout);

export default router;

