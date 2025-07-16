import express from "express";
import upload from "../utils/multer.js";

import { verifyToken } from "../middlewares/auth.js";
import {
  addCategory,
  deleteCategory,
  getCategoriesBySeller,
  getCategoriesBySubdomain,
  getRecommendedProducts,
  updateCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.post("/", upload.single("image"), verifyToken, addCategory);
router.get("/seller", verifyToken, getCategoriesBySeller);
router.get("/subdomain/:subdomain", verifyToken, getCategoriesBySubdomain);
router.get("/:id", verifyToken, getRecommendedProducts);
router.put("/:id", upload.single("image"), verifyToken, updateCategory);
router.delete("/:id", verifyToken, deleteCategory);

export default router;
