import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//  Get all favorites
export const getFavorites = async (req, res) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Access denied" });
  }

  const customerId = req.user.id;

  try {
    const favorites = await prisma.favorite.findMany({
      where: { customer_id: customerId },
      include: {
        product: {
          include: {
            images: true,
          },
        },
      },
    });

    res.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};

//  Add to favorites
export const addFavorite = async (req, res) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Access denied" });
  }

  const customer_id = req.user.id;
  const { product_id } = req.body;

  try {
    const exists = await prisma.favorite.findFirst({
      where: { customer_id, product_id },
    });

    if (exists) {
      return res.status(400).json({ error: "Already in favorites" });
    }

    const favorite = await prisma.favorite.create({
      data: { customer_id, product_id },
    });

    res.status(201).json(favorite);
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ error: "Failed to add favorite" });
  }
};

//  Delete favorite by item ID
export const deleteFavorite = async (req, res) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { itemId } = req.params;

  try {
    await prisma.favorite.delete({
      where: { id: itemId },
    });

    res.json({ message: "Favorite deleted successfully" });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    res.status(500).json({ error: "Failed to delete favorite" });
  }
};

// check favorite
export const checkFavorite = async (req, res) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Access denied" });
  }

  const customer_id = req.user.id;
  const product_id = req.params.id;

  try {
    const exists = await prisma.favorite.findFirst({
      where: { customer_id, product_id },
    });

    res.json(exists ? true : false);
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(500).json({ error: "Failed to check favorite" });
  }
};

//calc favorite
export const calcFavorite = async (req, res) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Access denied" });
  }

  const customer_id = req.user.id;

  try {
    const count = await prisma.favorite.count({ where: { customer_id } });

    res.json(count);
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(500).json({ error: "Failed to check favorite" });
  }
};
