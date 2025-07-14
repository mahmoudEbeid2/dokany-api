import express from "express";
import { addProduct, deleteProduct, getAllProducts, getDiscountedProductsBySeller, getProductById, getProductsBySellerId, getProductsBySubdomain, updateProduct } from "../controllers/productController.js";

const router = express.Router();

// Add product route
router.post("/", addProduct);

// Get all products route
router.get("/", getAllProducts);

// Get product by ID route
router.get("/:id", getProductById);

// Get products by seller subdomain 
router.get("/seller/subdomain/:subdomain", getProductsBySubdomain);

// Get/products/seller/:subdomain/discount
router.get("/seller/subdomain/:subdomain/discount", getDiscountedProductsBySeller);

// Get products/seller/:sellerId
router.get("/seller/:sellerId", getProductsBySellerId);

// update product route
router.put("/:id", updateProduct);

// delete product route
router.delete("/:id", deleteProduct);

export default router;
