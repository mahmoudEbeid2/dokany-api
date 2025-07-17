import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";
import cloudinary from "../../utils/cloudinary.js";

const prisma = new PrismaClient();

const isStrongPassword = (password) => {
  return /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password);
};
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

//  GET /admin/admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
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

export const addAdmin = async (req, res) => {
  try {
    const { user_name, f_name, l_name, email, phone, password } = req.body;

    // Validate email
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check duplicates
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { user_name }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    // Validate phone
    if (!/^\d{10,15}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // Validate password
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters long and contain letters and numbers" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl = null;
    let imageID = null;

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file, "admin_profiles");
      imageUrl = uploadedImage?.url;
      imageID = uploadedImage?.public_id;
    }

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
        profile_imge: imageUrl,
        image_public_id: imageID,
      },
    });

    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ message: "Error creating admin", error: error.message });
  }
};


export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  try {
    const admin = await prisma.user.findUnique({ where: { id } });

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    const updateData = { ...req.body };

    if (updateData.email && !isValidEmail(updateData.email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (updateData.phone && !/^\d{10,15}$/.test(updateData.phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    if (file) {
      const imageData = await uploadToCloudinary(file, "admin_profiles");

      if (admin.image_public_id) {
        await cloudinary.uploader.destroy(admin.image_public_id);
      }

      updateData.profile_imge = imageData.url;
      updateData.image_public_id = imageData.public_id;
    }

    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(updatedAdmin);
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
//  controllers/Admincontrillers/admin.controller.js
export const searchAdmins = async (req, res) => {
  const { query } = req.query;

  try {
    const admins = await prisma.user.findMany({
      where: {
        role: "admin",
        OR: [
          { user_name: { contains: query, mode: "insensitive" } },
          { f_name: { contains: query, mode: "insensitive" } },
          { l_name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        user_name: true,
        f_name: true,
        l_name: true,
        email: true,
        phone: true,
        role: true,
        city: true,
        governorate: true,
        country: true,
      },
    });

    if (!admins.length) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ admins });
  } catch (err) {
    res.status(500).json({ message: "Search error", error: err.message });
  }
};
// getAdminDashboardStats
export const getAdminDashboardStats = async (req, res) => {
  try {
    const sellersCount = await prisma.user.count({
      where: { role: "seller" },
    });

    const customersCount = await prisma.customer.count();

    const productsCount = await prisma.product.count();

    const totalEarningsResult = await prisma.order.aggregate({
      _sum: { total_price: true },
    });

    const totalEarnings = totalEarningsResult._sum.total_price || 0;

    res.status(200).json({
      sellersCount,
      customersCount,
      productsCount,
      totalEarnings,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
  }
};