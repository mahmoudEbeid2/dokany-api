import express from "express";
import upload from "../../utils/multer.js";
import { verifyToken } from "../../middlewares/auth.js";
import {
  getCustomerByToken,
  updateCustomerByToken,
  deleteCustomerByToken,
} from "../../controllers/customerControllerToken.js";

const customerRouterToken = express.Router();

// Get, Update, Delete by Token (for customer)
customerRouterToken.get("/customer/me", verifyToken, getCustomerByToken);
customerRouterToken.put(
  "/customer/me",
  verifyToken,
  upload.single("image"),
  updateCustomerByToken
);
customerRouterToken.delete("/customer/me", verifyToken, deleteCustomerByToken);

export default customerRouterToken;
