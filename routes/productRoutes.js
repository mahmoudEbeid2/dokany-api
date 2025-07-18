import express from "express";
import upload from "../utils/multer.js";
import { verifyToken } from "../middlewares/auth.js";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getDiscountedProductsBySeller,
  getProductById,
  getProductsBySeller,
  getProductsBySubdomain,
  searchProductsByTitle,
  updateProduct,
} from "../controllers/productController.js";

const router = express.Router();
router.get("/seller", getProductsBySeller);

// Add product route
router.post("/", upload.array("images"), verifyToken, addProduct);

// Get all products route
router.get("/", verifyToken, getAllProducts);

// search products by title route
router.get("/search", searchProductsByTitle);

// Get product by ID route
router.get("/:id", getProductById);

// Get products by seller subdomain
router.get("/seller/subdomain/:subdomain", getProductsBySubdomain);

// Get/products/seller/:subdomain/discount
router.get(
  "/seller/subdomain/:subdomain/discount",

  getDiscountedProductsBySeller
);

// Get products/seller/

// update product route
router.put("/:id", upload.array("images"), verifyToken, updateProduct);

// delete product route
router.delete("/:id", verifyToken, deleteProduct);

export default router;
