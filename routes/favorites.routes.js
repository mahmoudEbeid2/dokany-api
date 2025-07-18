import express from "express";
import {
  getFavorites,
  addFavorite,
  deleteFavorite,
  checkFavorite,
  calcFavorite,
} from "../controllers/favorites.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/favorites", verifyToken, getFavorites);
router.get("/favorites/check/:itemId", verifyToken, checkFavorite);
router.post("/favorites", verifyToken, addFavorite);
router.delete("/favorites/:itemId", verifyToken, deleteFavorite);

router.get("/favorites/calc", verifyToken, calcFavorite);

export default router;
