// داخل controllers/admin.controller.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

//  GET /admin/admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: {
        id: true,
        user_name: true,
        f_name: true,
        l_name: true,
        email: true,
        phone: true,
      },
    });

    res.json({ admins });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admins", error: error.message });
  }
};

//  GET /admin/admins/:id
export const getAdminById = async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await prisma.user.findUnique({
      where: { id },
    });

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin", error: error.message });
  }
};

//  POST /admin/admins
export const addAdmin = async (req, res) => {
  try {
    const { user_name, f_name, l_name, email, phone, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        user_name,
        f_name,
        l_name,
        email,
        phone,
        password: hashedPassword,
        role: "admin",
        city: "Cairo",
        governorate: "Cairo",
        country: "Egypt",
      },
    });

    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ message: "Error creating admin", error: error.message });
  }
};

// PUT /admin/admins/:id
export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { user_name, f_name, l_name, email, phone } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        user_name,
        f_name,
        l_name,
        email,
        phone,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating admin", error: error.message });
  }
};

//  DELETE /admin/admins/:id
export const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting admin", error: error.message });
  }
};
