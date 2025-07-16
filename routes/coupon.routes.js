import { verifyToken } from "../middlewares/auth.js";
import express from "express";
import {
  createCuppon,
  getAllCuppons,
} from "../controllers/coupon.controller.js";

const couponRouter = express.Router();

couponRouter.post("/coupon", verifyToken, createCuppon);

couponRouter.get("/coupon", verifyToken, getAllCuppons);
export default couponRouter;
