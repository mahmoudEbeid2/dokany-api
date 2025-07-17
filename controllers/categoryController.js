import { PrismaClient } from "@prisma/client";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import cloudinary from "../utils/cloudinary.js";
const prisma = new PrismaClient();

// add category
export const addCategory = async (req, res) => {
  const file = req.file;
  const user = req.user;
  const { name } = req.body;

  if (user.role !== "seller")
    return res.status(403).json({ error: "Only sellers can add categories" });
  try {
    const categoryImage = await uploadToCloudinary(file, "category_images");
    // console.log("categoryImage", categoryImage);
    const category = await prisma.category.create({
      data: {
        name,
        image: categoryImage.url,
        seller_id: user.id,
        image_public_id: categoryImage.public_id,
      },
    });
    res.status(201).json(category);
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ error: "Failed to add category" });
  }
};

// get recommended products by category id

export const getRecommendedProducts = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          orderBy: { discount: "desc" },
          include: { images: true, reviews: true, cart: true, favorites: true },
        },
      },
    });
    if (!category) return res.status(404).json({ error: "Category not found" });

    res.status(200).json(category.products);
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    res.status(500).json({ error: "Failed to fetch recommended products" });
  }
};
// get categories by seller token
export const getCategoriesBySeller = async (req, res) => {
  const user = req.user;
  const sellserId = user.id;
  if (user.role !== "seller")
    return res.status(403).json({ error: "Only sellers can add categories" });
  try {
    const categories = await prisma.category.findMany({
      where: { seller_id: sellserId },
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// get categories by seller subdomain
export const getCategoriesBySubdomain = async (req, res) => {
  const { subdomain } = req.params;
  try {
    const seller = await prisma.user.findUnique({
      where: { subdomain },
    });

    if (!seller) return res.status(404).json({ error: "Seller not found" });

    const categories = await prisma.category.findMany({
      where: { seller_id: seller.id },
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// udate category

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const file = req.file;

  const user = req.user;
  if (user.role !== "seller")
    return res
      .status(403)
      .json({ error: "Only sellers can update categories" });

  try {
    const category = await prisma.category.findUnique({ where: { id } });

    if(user.id !== category.seller_id) return res.status(403).json({ error: "Unauthorized" });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (file) {
      if (category.image_public_id) {
        await cloudinary.uploader.destroy(category.image_public_id);
      }
    }

    const imageData = await uploadToCloudinary(file, "category_images");

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        image: imageData.url,
      },
    });

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
};

// delete category
export const deleteCategory = async (req, res) => {
  const user = req.user;

  if (user.role !== "seller")
    return res
      .status(403)
      .json({ error: "Only sellers can delete categories" });
  const { id } = req.params;
  

  try {
    const category = await prisma.category.findUnique({ where: { id } });
    if(user.id !== category.seller_id) return res.status(403).json({ error: "Unauthorized" });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (category.image_public_id) {
      await cloudinary.uploader.destroy(category.image_public_id);
    }
    await prisma.category.delete({ where: { id } });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
};
