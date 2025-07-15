import express from "express";
import {
  getCustomerCart,
  addToCart,
  deleteCartItem
} from "../controllers/cart.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/cart", verifyToken, getCustomerCart);
router.post("/cart", verifyToken, addToCart);
router.delete("/cart/:itemId", verifyToken, deleteCartItem);

export default router;
