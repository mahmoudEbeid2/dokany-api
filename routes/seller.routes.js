import express from "express";
import {
  getSellerById,
  getSellerBySubdomain,
  getSellerCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getDashboardStats,
  updateSeller,
  deleteSeller,
  getSellerEarningsSummary,
} from "../controllers/seller.controller.js";
import { verifyToken } from "../middlewares/auth.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.get("/seller/id", verifyToken, getSellerById);
router.get("/seller/subdomain/:subdomain", verifyToken, getSellerBySubdomain);
router.get("/seller/customers", verifyToken, getSellerCustomers);
router.post(
  "/seller/customers",
  verifyToken,
  upload.single("profile_imge"),
  createCustomer
);
router.put(
  "/seller/customers/:id",
  verifyToken,
  upload.single("profile_imge"),
  updateCustomer
);
router.delete("/seller/customers/:id", verifyToken, deleteCustomer);
router.get("/seller/dashboard-stats", verifyToken, getDashboardStats);
router.delete("/seller/delete", verifyToken, deleteSeller);
router.get("/seller/earnings-summary", verifyToken, getSellerEarningsSummary);

router.put(
  "/seller/update",
  verifyToken,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "profile_imge", maxCount: 1 },
  ]),
  updateSeller
);

export default router;
