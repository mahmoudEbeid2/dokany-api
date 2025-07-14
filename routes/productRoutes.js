import express from "express";
import { addProduct, getAllProducts, getProductById } from "../controllers/productController.js";

const router = express.Router();

// Add product route
router.post("/", addProduct);

// Get all products route
router.get("/", getAllProducts);

// Get product by ID route
router.get("/:id", getProductById);

export default router;
