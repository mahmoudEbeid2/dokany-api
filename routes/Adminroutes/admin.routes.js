import express from "express";
import {
  getAllSellers,addSeller,updateSeller ,deleteSeller 
} from "../../controllers/Admincontrillers/admin.controller.sellers.js";
import { verifyToken } from "../../middlewares/auth.js";
import { isAdmin } from "../../middlewares/isAdmin.js";

const router = express.Router();
// getAllSellers http://localhost:4000/admin/sellers
router.get("/sellers", verifyToken, isAdmin, getAllSellers);
// AddSeller http://localhost:4000/admin/sellers
router.post("/sellers", verifyToken, isAdmin, addSeller);
// update seller http://localhost:4000/admin/sellers/id
router.put("/sellers/:id", verifyToken, isAdmin, updateSeller);
// delete seller http://localhost:4000/admin/sellers/id
router.delete("/sellers/:id", verifyToken, isAdmin, deleteSeller);

export default router;
