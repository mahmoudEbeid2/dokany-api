import express from "express";
import upload from "../utils/multer.js";

import { verifyToken } from "../middlewares/auth.js";
import { addCategory, deleteCategory, getCategoriesBySellerId, getCategoriesBySubdomain, getRecommendedProducts, updateCategory } from "../controllers/categoryController.js";

const router = express.Router();

router.post("/", upload.single("image"),verifyToken, addCategory);
router.get("/:id", verifyToken, getRecommendedProducts);
router.get("/sellers/:id", verifyToken, getCategoriesBySellerId);
router.get("/subdomain/:subdomain", verifyToken,getCategoriesBySubdomain );
router.put("/:id", upload.single("image"), verifyToken, updateCategory);
router.delete("/:id", verifyToken, deleteCategory);

export default router;