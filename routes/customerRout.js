import express from "express";
import {
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
} from "../controllers/customerControllers.js";
import upload from "../utils/multer.js";

const customerRouter = express.Router();

customerRouter.get("/customers/:id", getCustomerById);

customerRouter.put(
  "/customers/:id",
  upload.single("image"),
  updateCustomerById
);

customerRouter.delete("/customers/:id", deleteCustomerById);

export default customerRouter;
