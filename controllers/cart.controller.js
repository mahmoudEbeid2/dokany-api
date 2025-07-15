import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//  Get all cart items for a customer
export const getCustomerCart = async (req, res) => {
  const { customerId } = req.params;
  try {
    const cart = await prisma.cart.findMany({
      where: { customer_id: customerId },
      include: {
        product: true
      }
    });
    res.json(cart);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};
// Add cart item
export const addToCart = async (req, res) => {
  const { product_id, quantity } = req.body;
  const customer_id = req.user.id; 

  try {
    const existingItem = await prisma.cart.findFirst({
      where: { customer_id, product_id }
    });

    if (existingItem) {
      const updatedItem = await prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
      return res.status(200).json(updatedItem);
    }

    const newItem = await prisma.cart.create({
      data: { customer_id, product_id, quantity }
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
};

//  Delete cart item
export const deleteCartItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    await prisma.cart.delete({
      where: { id: itemId }
    });
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Error deleting cart item:", err);
    res.status(500).json({ error: "Failed to delete item from cart" });
  }
};
