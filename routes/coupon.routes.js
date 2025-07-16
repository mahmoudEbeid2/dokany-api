import { verifyToken } from "../middlewares/auth.js";
import express from "express";
import {
  createCuppon,
  getAllCuppons,
  checkCoupon,
  deleteCoupon,
  updateCoupon,
} from "../controllers/coupon.controller.js";

const couponRouter = express.Router();

couponRouter.post("/coupon", verifyToken, createCuppon);

couponRouter.get("/coupon", verifyToken, getAllCuppons);

couponRouter.get("/coupon/check/:code", verifyToken, checkCoupon);

couponRouter.delete("/coupon/:id", verifyToken, deleteCoupon);

couponRouter.put("/coupon/:id", verifyToken, updateCoupon);
export default couponRouter;
