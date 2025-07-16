import express from "express";
import {
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
} from "../../controllers/customerByIdControllers.js";

import upload from "../../utils/multer.js";
import { verifyToken } from "../../middlewares/auth.js";

const customerRoutId = express.Router();

// Get, Update, Delete by ID (optional if admin)
customerRoutId.get("/customers/:id", verifyToken, getCustomerById);
customerRoutId.put(
  "/customers/:id",
  upload.single("image"),
  verifyToken,
  updateCustomerById
);
customerRoutId.delete("/customers/:id", verifyToken, deleteCustomerById);

export default customerRoutId;
