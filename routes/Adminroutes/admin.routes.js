import express from "express";
import {
  getAllSellers,
  getSellerById,
  addSeller,
  updateSeller,
  deleteSeller,
  searchSellers,
} from "../../controllers/Admincontrillers/admin.controller.sellers.js";
import { verifyToken } from "../../middlewares/auth.js";
import { isAdmin } from "../../middlewares/isAdmin.js";

import {
  getAllAdmins,
  getAdminById,
  addAdmin,
  updateAdmin,
  deleteAdmin,
  searchAdmins,
} from "../../controllers/Admincontrillers/admin.controller.js";

const router = express.Router();

// seller Management
// searchSellers http://localhost:4000/admin/sellers/search?query=####
router.get("/sellers/search", verifyToken, isAdmin, searchSellers);
// getAllSellers http://localhost:4000/admin/sellers
router.get("/sellers", verifyToken, isAdmin, getAllSellers);
// getgetSellerById http://localhost:4000/admin/seller/id
router.get("/sellers/:id", verifyToken, isAdmin, getSellerById);
// AddSeller http://localhost:4000/admin/sellers
router.post("/sellers", verifyToken, isAdmin, addSeller);

// updateseller http://localhost:4000/admin/sellers/id
router.put("/sellers/:id", verifyToken, isAdmin, updateSeller);
// deleteseller http://localhost:4000/admin/sellers/id
router.delete("/sellers/:id", verifyToken, isAdmin, deleteSeller);

// Admin Management

// searchSellers http://localhost:4000/admin/sellers/search?query=####
router.get("/search", verifyToken, isAdmin, searchAdmins);
// getAllSAdmins http://localhost:4000/admin/admins
router.get("/admins", verifyToken, isAdmin, getAllAdmins);
// getgetAdminById http://localhost:4000/admin/admins/id
router.get("/admins/:id", verifyToken, isAdmin, getAdminById);
// AddAdmin http://localhost:4000/admin/admins
router.post("/admins", verifyToken, isAdmin, addAdmin);
// updateAdmin http://localhost:4000/admin/admins/id
router.put("/admins/:id", verifyToken, isAdmin, updateAdmin);
// deleteAdmin http://localhost:4000/admin/admins/id
router.delete("/admins/:id", verifyToken, isAdmin, deleteAdmin);

export default router;
