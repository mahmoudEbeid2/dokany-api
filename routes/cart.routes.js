import express from "express";
import {
  getCustomerCart,
  addToCart,
  deleteCartItem,
  checkInCart,
  calcInCart,
  updateCart,
} from "../controllers/cart.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/cart", verifyToken, getCustomerCart);
router.post("/cart", verifyToken, addToCart);
router.get("/cart/check/:itemId", verifyToken, checkInCart);
router.get("/cart/calc", verifyToken, calcInCart);
router.delete("/cart/:itemId", verifyToken, deleteCartItem);
router.put("/cart/update/:id", verifyToken, updateCart);

export default router;
