import express from "express";
import { testLogin } from "../controllers/test.controller.js";

const router = express.Router();

router.post("/test-login", testLogin);

export default router;
