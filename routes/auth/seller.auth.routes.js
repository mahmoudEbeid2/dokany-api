import { Router } from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../../controllers/auth/auth.Seller.Controller.js";
import upload from "../../utils/multer.js";

const router = Router();

router.post("/register", upload.single("profile_imge"), register);
router.post("/login", login);
router.post("/reset-password", forgotPassword);
router.post("/reset-password/confirm", resetPassword);

export default router;
