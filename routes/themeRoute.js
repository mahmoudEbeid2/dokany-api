import express from "express";
import upload from "../utils/multer.js";
import {verifyToken} from "../middlewares/auth.js";
import { addTheme, deleteTheme, getThemes, updateTheme } from "../controllers/themeController.js";

const router = express.Router();

router.post("/",upload.single("image"),verifyToken,addTheme);

router.get("/",verifyToken,getThemes);

router.put("/:id",upload.single("image"),verifyToken,updateTheme);

router.delete("/:id",verifyToken,deleteTheme);

export default router;