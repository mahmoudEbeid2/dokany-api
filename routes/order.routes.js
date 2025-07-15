import { verifyToken } from "../middlewares/auth.js";
import express from "express";
import {
  getAllOrders,
  getOrdersByStatus,
  updateOrderStatus,
} from "../controllers/orderControler.js";

const orderRouter = express.Router();

orderRouter.get("/orders", verifyToken, getAllOrders);
orderRouter.get("/orders/:status", verifyToken, getOrdersByStatus);
orderRouter.put("/orders/:id", verifyToken, updateOrderStatus);
export default orderRouter;
