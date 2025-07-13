import express from "express";
import { getCustomerById } from "../controllers/customerControllers.js";

const customerRouter = express.Router();

customerRouter.get("/customers/:id", getCustomerById);

export default customerRouter;
