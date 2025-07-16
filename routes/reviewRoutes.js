import express from "express";

import { verifyToken } from "../middlewares/auth.js";
import { addReview, deleteReview, getProductReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/:productId", verifyToken, addReview);

router.get("/:productId", verifyToken, getProductReviews);

router.delete("/:reviewId", verifyToken, deleteReview);

export default router;