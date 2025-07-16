import { PrismaClient } from "@prisma/client";

import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import cloudinary from "../utils/cloudinary.js";

const prisma = new PrismaClient();
// add product
export const addProduct = async (req, res) => {
  const files = req.files;
  const user = req.user;

  if (user.role !== "seller") {
    return res.status(403).json({ error: "Only sellers can add products" });
  }

  try {
    const { title, description, price, discount, stock, status, category_id } =
      req.body;

    if (category_id) {
      const category = await prisma.category.findUnique({
        where: { id: category_id },
      });
      if (!category) {
        return res.status(400).json({ error: "Category not found" });
      }
    }


    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        discount: parseFloat(discount),
        stock: parseInt(stock),
        status,
        seller_id: user.id,
        category_id,

      },
    });

  //   upload images
    const product_id = product.id;

    for (const file of files) {
      const imageData = await uploadToCloudinary(file, "product_images");
      console.log("Image data:", imageData);

      await prisma.image.create({
        data: {
          image: imageData.url,
          product_id,
          image_public_id: imageData.public_id,

        },
      });
    }

    res.status(201).json({ message: "Product created successfully", product });
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

export const getProductsBySubdomain = async (req, res) => {
  try {
    const { subdomain } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // search seller
    const seller = await prisma.user.findUnique({ where: { subdomain } });
    if (!seller) return res.status(404).json({ error: "Seller not found" });

    const products = await prisma.product.findMany({
    
      where: { seller_id: seller.id },
      skip,
      take: pageSize,
      include: {
        images: true,
        category: true,
        reviews: true,
        cart: true,
        favorites: true,
        orders: true,
      },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by seller:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};


export const getDiscountedProductsBySeller = async (req, res) => {
  try {
    const { subdomain } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const products = await prisma.product.findMany({
      where: {
        seller: { subdomain },
        discount: { gt: 0 },
      },
      skip,
      take: pageSize,
      include: {
        images: true,
      },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching discounted products by seller:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Get products/seller/:sellerId
export const getProductsBySellerId = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await prisma.product.findMany({
      where: { seller_id: sellerId },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by seller:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// update product
export const updateProduct = async (req, res) => {
  const files = req.files || [];
  const user = req.user;

  if (user.role !== "seller") {
    return res.status(403).json({ error: "Only sellers can update products" });
  }

  try {
    const { id } = req.params;
    const { title, description, price, discount, stock, status, category_id } = req.body;

    if (!id) return res.status(400).json({ error: "Product id is required" });

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existingProduct)
      return res.status(404).json({ error: "Product not found" });


    if (existingProduct.seller_id !== user.id)
      return res.status(403).json({ error: "Unauthorized" });


    if (category_id) {
      const category = await prisma.category.findUnique({
        where: { id: category_id },
      });
      if (!category) {
        return res.status(400).json({ error: "Category not found" });
      }
    }


    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title,
        description,
        price: parseFloat(price),
        discount: parseFloat(discount),
        stock: parseInt(stock),
        status,
        category_id,
      },
    });

 
    if (files.length > 0) {
      for (const img of existingProduct.images) {
        const publicId = img.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
        await prisma.image.delete({ where: { id: img.id } });
      }

      for (const file of files) {
        const imageData = await uploadToCloudinary(file, "product_images");
        await prisma.image.create({
          data: {
            image: imageData.url,
            product_id: updatedProduct.id,
            image_public_id: imageData.public_id,
          },
        });
      }
    }

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};




export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Product id is required" });

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true }, // dele5t img
    });
    if (!existingProduct)
      return res.status(404).json({ error: "Product not found" });

    const product = await prisma.product.delete({ where: { id } });
    res.status(200).json({message: "Product deleted successfully", product});
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// costomer search by product title in subdomain
export const searchProductsByTitle = async (req, res) => {
  try {
    const {subdomain} = req.body
    const { title } = req.query;
    const isSubdomain = await prisma.user.findUnique({
      where: { subdomain },
    });

    if (!isSubdomain) {
      return res.status(404).json({ error: "Subdomain not found" });
    }
    const products = await prisma.product.findMany({
      where: {
        seller: { subdomain },
        title: { contains: title, mode: "insensitive" },
      },
      include: {
        images: true,
      },

    });

    res.status(200).json({
      products,
      
    })
  } catch (error) {
    console.error("Error searching products by title:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
