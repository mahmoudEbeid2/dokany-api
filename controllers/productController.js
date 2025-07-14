import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const addProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discount,
      stock,
      status,
      seller_id,
      category_id
    } = req.body;

    // التحقق من وجود البائع
    const seller = await prisma.user.findUnique({ where: { id: seller_id } });
    if (!seller) return res.status(400).json({ error: "Seller not found" });

    // التحقق من وجود التصنيف (لو موجود)
    if (category_id) {
      const category = await prisma.category.findUnique({ where: { id: category_id } });
      if (!category) return res.status(400).json({ error: "Category not found" });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        discount,
        stock,
        status,
        seller_id,
        category_id,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        seller: true,
        images: true,
        coupons: true,
        reviews: true,
        cart: true,
        favorites: true,
        orders: true,
      },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        seller: true,
        images: true,
        coupons: true,
        reviews: true,
        cart: true,
        favorites: true,
        orders: true,
      },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

//  get products/seller/:subdomin

export const getProductsBySeller = async (req, res) => {
  try {
    const { subdomain } = req.params;
    const products = await prisma.product.findMany({
      where: { seller: { subdomain } },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by seller:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
  
}