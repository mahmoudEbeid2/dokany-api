import { PrismaClient } from "@prisma/client";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import cloudinary from "../utils/cloudinary.js";

const prisma = new PrismaClient();

// get all themes
export const getThemes = async (req, res) => {
  try {
    const themes = await prisma.theme.findMany();
    res.status(200).json(themes);
  } catch (error) {
    console.error("Error fetching theme:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// add theme
export const addTheme = async (req, res) => {
  const { name } = req.body;
  const user = req.user;
  const file = req.file;
  try {
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Only admin can add themes" });
    }
    const themeImage = await uploadToCloudinary(file, "theme_images");
    const theme = await prisma.theme.create({
      data: {
        name,
        preview_image: themeImage.url,
        image_public_id: themeImage.public_id,
      },
    });
    res.status(201).json(theme);
  } catch (error) {
    console.error("Error adding theme:", error);
    res.status(500).json({ error: "Failed to add theme" });
  }
};

// update theme
export const updateTheme = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const file = req.file;
  const user = req.user;
  try {
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Only admin can update themes" });
    }
    const theme = await prisma.theme.findUnique({ where: { id } });
    if (!theme) {
      return res.status(404).json({ error: "Theme not found" });
    }
    // delete old image
    if (file) {
      if (theme.image_public_id) {
        await cloudinary.uploader.destroy(theme.image_public_id);
      }
    }

    const themeImage = await uploadToCloudinary(file, "theme_images");
    const updatedTheme = await prisma.theme.update({
      where: { id },
      data: {
        name,
        preview_image: themeImage.url,
        image_public_id: themeImage.public_id,
      },
    });
    res.status(200).json(updatedTheme);
  } catch (error) {
    console.error("Error updating theme:", error);
    res.status(500).json({ error: "Failed to update theme" });
  }
};

// delete theme
export const deleteTheme = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  try {
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Only sellers can delete themes" });
    }
    const theme = await prisma.theme.findUnique({ where: { id } });
    if (!theme) {
      return res.status(404).json({ error: "Theme not found" });
    }
    // delete image
    if (theme.image_public_id) {
      await cloudinary.uploader.destroy(theme.image_public_id);
    }
    await prisma.theme.delete({ where: { id } });
    res.status(200).json({ message: "Theme deleted successfully" });
  } catch (error) {
    console.error("Error deleting theme:", error);
    res.status(500).json({ error: "Failed to delete theme" });
  }
};
