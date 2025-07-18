import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ✅ Get cart
export const getCustomerCart = async (req, res) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const cart = await prisma.cart.findMany({
      where: { customer_id: req.user.id },
      include: {
        product: { include: { images: true } },
      },
    });

    res.json({ cart });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

// ✅ Add to cart
export const addToCart = async (req, res) => {
  const { product_id, quantity, couponCode } = req.body;
  const user = req.user;
  const subdomain = req.subdomain;

  try {
    const seller = await prisma.user.findFirst({
      where: { subdomain },
    });

    if (!seller) return res.status(404).json({ message: "Seller not found." });

    const product = await prisma.product.findUnique({
      where: { id: product_id },
    });
    if (!product)
      return res.status(404).json({ message: "Product not found." });

    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          seller_id: seller.id,
          expiration_date: { gt: new Date() },
        },
      });
    }

    const productDiscount = product.discount || 0;
    const couponDiscount = coupon?.discount_value || 0;

    // ⬇️ استخدم الأقل بين الخصمين
    const appliedDiscount = Math.min(productDiscount, couponDiscount);
    const unit_price = product.price - product.price * appliedDiscount;
    const final_price = unit_price * quantity;

    const cartItem = await prisma.cart.create({
      data: {
        customer_id: user.id,
        product_id: product.id,
        quantity,
        unit_price,
        final_price,
      },
    });

    return res.status(201).json({
      message: "Item added to cart.",
      cartItem,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

// ✅ Delete from cart
export const deleteCartItem = async (req, res) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const item = await prisma.cart.findUnique({
      where: { id: req.params.itemId },
    });

    if (!item || item.customer_id !== req.user.id) {
      return res.status(404).json({ error: "Item not found or unauthorized" });
    }

    await prisma.cart.delete({ where: { id: item.id } });

    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Error deleting cart item:", err);
    res.status(500).json({ error: "Failed to delete item from cart" });
  }
};

// ✅ Check product in cart
export const checkInCart = async (req, res) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const exists = await prisma.cart.findFirst({
      where: {
        customer_id: req.user.id,
        product_id: req.params.id,
      },
    });

    res.json(!!exists);
  } catch (error) {
    console.error("Error checking in cart:", error);
    res.status(500).json({ error: "Failed to check in cart" });
  }
};

// ✅ Count items in cart
export const calcInCart = async (req, res) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const count = await prisma.cart.count({
      where: { customer_id: req.user.id },
    });

    res.json(count);
  } catch (error) {
    console.error("Error calculating cart:", error);
    res.status(500).json({ error: "Failed to count cart items" });
  }
};

// ✅ Update cart quantity
export const updateCart = async (req, res) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { quantity } = req.body;
  const cartItemId = req.params.id;

  try {
    const cartItem = await prisma.cart.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.customer_id !== req.user.id) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    const updatedItem = await prisma.cart.update({
      where: { id: cartItemId },
      data: {
        quantity,
        final_price: quantity * cartItem.unit_price, // ⬅️ استخدم السعر المخزن للوحدة
      },
    });

    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Failed to update cart" });
  }
};
