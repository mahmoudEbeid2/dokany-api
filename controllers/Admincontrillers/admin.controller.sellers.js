import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// GET /admin/sellers
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await prisma.user.findMany({
      where: { role: "seller" },
      select: {
        id: true,
        user_name: true,
        f_name: true,
        l_name: true,
        email: true,
        phone: true,
        subdomain: true,
      },
    });

    res.status(200).json({ sellers });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sellers", details: err.message });
  }
};
// GET /admin/seller/getSellerById
export const getSellerById = async (req, res) => {
  const { id } = req.params;

  try {
    const seller = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        user_name: true,
        f_name: true,
        l_name: true,
        email: true,
        phone: true,
        subdomain: true,
        city: true,
        governorate: true,
        country: true,
        payout_method: true,
        role: true
      },
    });

    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.status(200).json({ seller });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch seller", error: err.message });
  }
};
// add seller
export const addSeller = async (req, res) => {
  const {
    user_name,
    f_name,
    l_name,
    email,
    phone,
    city,
    governorate,
    country,
    password,
    subdomain,
    payout_method,
  } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { user_name }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSeller = await prisma.user.create({
      data: {
        user_name,
        f_name,
        l_name,
        email,
        phone,
        city,
        governorate,
        country,
        password: hashedPassword,
        subdomain,
        payout_method,
        role: "seller",
      },
      select: {
        id: true,
        user_name: true,
        email: true,
        subdomain: true,
        phone: true,
        role: true,
      },
    });

    res.status(201).json({ message: "Seller created", seller: newSeller });
  } catch (error) {
    res.status(500).json({ message: "Error creating seller", error: error.message });
  }
};
// update seller
export const updateSeller = async (req, res) => {
  const { id } = req.params;
  const {
    user_name,
    f_name,
    l_name,
    email,
    phone,
    city,
    governorate,
    country,
    subdomain,
    payout_method,
    password,
  } = req.body;

  try {
    const dataToUpdate = {
      user_name,
      f_name,
      l_name,
      email,
      phone,
      city,
      governorate,
      country,
      subdomain,
      payout_method,
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    const updatedSeller = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    res.status(200).json({ message: "Seller updated successfully", seller: updatedSeller });
  } catch (error) {
    res.status(500).json({ message: "Error updating seller", error: error.message });
  }
};

// delete seller
export const deleteSeller = async (req, res) => {
  const { id } = req.params;

  try {
    const seller = await prisma.user.findUnique({
      where: { id },
    });

    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: "Seller deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting seller", error: error.message });
  }
};

// searchSellers
export const searchSellers = async (req, res) => {
  const { query } = req.query;

  try {
    const sellers = await prisma.user.findMany({
      where: {
        role: "seller",
        OR: [
          { user_name: { contains: query, mode: "insensitive" } },
          { f_name: { contains: query, mode: "insensitive" } },
          { l_name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { subdomain: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } }
        ],
      },
      select: {
        id: true,
        user_name: true,
        f_name: true,
        l_name: true,
        email: true,
        phone: true,
        subdomain: true,
      },
    });

    if (sellers.length === 0) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json({ sellers });
  } catch (err) {
    res.status(500).json({ message: "Search error", error: err.message });
  }
};
