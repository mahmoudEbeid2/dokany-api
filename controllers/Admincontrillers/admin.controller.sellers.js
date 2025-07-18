import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";
import cloudinary from "../../utils/cloudinary.js";

const prisma = new PrismaClient();

// GET /admin/sellers
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await prisma.user.findMany({
      where: { role: "seller" }, // remove select to get all
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
    const seller = await prisma.user.findUnique({ where: { id } });
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
    theme_id, 
  } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { user_name }, { subdomain }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email, username, or subdomain already exists" });
    }

    if (!/^\d{10,15}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const isStrongPassword = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password);
    if (!isStrongPassword) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and contain letters and numbers",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl = null;
    let imageID = null;
    let logoUrl = null;
    let logoID = null;

    if (req.files?.profile) {
      const uploadedImage = await uploadToCloudinary(req.files.profile[0], "seller_profiles");
      imageUrl = uploadedImage?.url;
      imageID = uploadedImage?.public_id;
    }

    if (req.files?.logo) {
      const uploadedLogo = await uploadToCloudinary(req.files.logo[0], "seller_logos");
      logoUrl = uploadedLogo?.url;
      logoID = uploadedLogo?.public_id;
    }

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
        profile_imge: imageUrl,
        image_public_id: imageID,
        logo: logoUrl,
        logo_public_id: logoID,
        theme_id, 
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
    const existingSeller = await prisma.user.findUnique({ where: { id } });

    if (!existingSeller || existingSeller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Check for duplicates (excluding current seller)
    const duplicate = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [{ email }, { user_name }, { subdomain }],
          },
        ],
      },
    });

    if (duplicate) {
      return res.status(400).json({ message: "Email, username, or subdomain already exists" });
    }

    // Validate email
    if (email && !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Validate phone
    if (phone && !/^\d{10,15}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // Prepare data to update
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

    // Handle password
    if (password) {
      const isStrongPassword = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password);
      if (!isStrongPassword) {
        return res.status(400).json({
          message: "Password must be at least 8 characters and contain letters and numbers",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    // Handle profile image
    if (req.file) {
      if (existingSeller.image_public_id) {
        await cloudinary.uploader.destroy(existingSeller.image_public_id);
      }

      const uploadedImage = await uploadToCloudinary(req.file, "seller_profiles");
      dataToUpdate.profile_imge = uploadedImage?.url;
      dataToUpdate.image_public_id = uploadedImage?.public_id;
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
    const seller = await prisma.user.findUnique({ where: { id } });

    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    const customers = await prisma.customer.findMany({
      where: { seller_id: id },
    });

    for (const customer of customers) {
      await prisma.review.deleteMany({ where: { customer_id: customer.id } });
      await prisma.favorite.deleteMany({ where: { customer_id: customer.id } });
      await prisma.cart.deleteMany({ where: { customer_id: customer.id } });
      await prisma.orderItem.deleteMany({
        where: {
          order: {
            customer_id: customer.id,
          },
        },
      });
      await prisma.order.deleteMany({ where: { customer_id: customer.id } });
    }

    await prisma.customer.deleteMany({
      where: { seller_id: id },
    });

    const products = await prisma.product.findMany({
      where: { seller_id: id },
    });

    for (const product of products) {
      await prisma.image.deleteMany({ where: { product_id: product.id } });
      await prisma.coupon.deleteMany({ where: { product_id: product.id } });
    }

    await prisma.product.deleteMany({ where: { seller_id: id } });
    await prisma.category.deleteMany({ where: { seller_id: id } });
    await prisma.payout.deleteMany({ where: { seller_id: id } });

    if (seller.image_public_id) {
      await cloudinary.uploader.destroy(seller.image_public_id);
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
    });
    if (sellers.length === 0) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.json({ sellers });
  } catch (err) {
    res.status(500).json({ message: "Search error", error: err.message });
  }
};

