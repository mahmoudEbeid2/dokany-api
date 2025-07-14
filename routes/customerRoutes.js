import express from "express";
import {
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
} from "../controllers/customerByIdControllers.js";

import {
  getCustomerByToken,
  deleteCustomerByToken,
  updateCustomerByToken,
} from "../controllers/customerControllerToken.js";

import upload from "../utils/multer.js";
import { verifyToken } from "../middlewares/auth.js";

const customerRouteres = express.Router();

// Get, Update, Delete by ID (optional if admin)
customerRouteres.get("/customers/:id", verifyToken, getCustomerById);
customerRouteres.put(
  "/customers/:id",
  upload.single("image"),
  verifyToken,
  updateCustomerById
);
customerRouteres.delete("/customers/:id", verifyToken, deleteCustomerById);

// Get, Update, Delete by Token (for customer)
customerRouteres.get("/customers/me", verifyToken, getCustomerByToken);
customerRouteres.put(
  "/customers/me",
  verifyToken,
  upload.single("image"),
  updateCustomerByToken
);
customerRouteres.delete("/customers/me", verifyToken, deleteCustomerByToken);

export default customerRouteres;
