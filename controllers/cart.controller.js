import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//  GetCart
export const getCustomerCart = async (req, res) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Access denied" });
  }

  const customerId = req.user.id;

  try {
    const cart = await prisma.cart.findMany({
      where: { customer_id: customerId },
      include: { product: true },
    });

    const finalPrice = cart.reduce((sum, item) => sum + item.final_price, 0);

    res.json({ cart, finalPrice });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};


//  Add product to cart
export const addToCart = async (req, res) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Access denied" });
  }

  const customer_id = req.user.id;
  const { product_id, quantity } = req.body;

  try {
    const existingItem = await prisma.cart.findFirst({
      where: { customer_id, product_id },
    });

    if (existingItem) {
      const updatedItem = await prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      return res.status(200).json(updatedItem);
    }

    const newItem = await prisma.cart.create({
      data: { customer_id, product_id, quantity },
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
};

//  Delete cart item by itemId
export const deleteCartItem = async (req, res) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { itemId } = req.params;

  try {
    await prisma.cart.delete({
      where: { id: itemId },
    });

    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Error deleting cart item:", err);
    res.status(500).json({ error: "Failed to delete item from cart" });
  }
};
