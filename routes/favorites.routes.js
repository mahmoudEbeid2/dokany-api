import express from 'express';
import {
  getFavorites,
  addFavorite,
  deleteFavorite,
} from '../controllers/favorites.controller.js';
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.get('/favorites', verifyToken, getFavorites);
router.post('/favorites', verifyToken, addFavorite);
router.delete('/favorites/:itemId', verifyToken, deleteFavorite);

export default router;
