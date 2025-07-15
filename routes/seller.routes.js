import express from "express";
import {
  getSellerById,
  getSellerBySubdomain,
  getSellerCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getDashboardStats,
  getSellerByToken,
  updateSeller,
  deleteSeller,
} from "../controllers/seller.controller.js";

import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/seller/id/:id", verifyToken, getSellerById);
router.get("/seller/subdomain/:subdomain", verifyToken, getSellerBySubdomain);
router.get("/seller/:sellerId/customers", verifyToken, getSellerCustomers);
router.post("/seller/customers", verifyToken, createCustomer);
router.put("/seller/customers/:id", verifyToken, updateCustomer);
router.delete("/seller/customers/:id", verifyToken, deleteCustomer);
router.get("/seller/dashboard-stats", verifyToken, getDashboardStats);
router.get("/seller/token", verifyToken, getSellerByToken);
router.put("/seller/id/:id", verifyToken, updateSeller);
router.delete("/seller/id/:id", verifyToken, deleteSeller);
export default router;
