import prisma from "../config/db.js";

// create coupon

export const createCuppon = async (req, res) => {
  const user = req.user;
  if (user.role !== "seller") {
    return res.status(403).json({ message: "Access denied. Sellers only." });
  }

  const id = user.id;

  const data = req.body;

  try {
    const newCuppon = await prisma.coupon.create({
      data: {
        ...data,
        seller_id: id,
      },
    });
    res.json(newCuppon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all coupons
export const getAllCuppons = async (req, res) => {
  const user = req.user;
  if (user.role !== "seller") {
    return res.status(403).json({ message: "Access denied. Sellers only." });
  }

  try {
    const cuppons = await prisma.coupon.findMany({
      where: {
        seller_id: user.id,
      },
    });
    res.status(200).json(cuppons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// check coupon
export const checkCoupon = async (req, res) => {
  const user = req.user;
  const subdomain = req.body.subdomain;
  const code = req.params.code;

  if (user.role !== "customer") {
    return res.status(403).json({ message: "Access denied. Customers only." });
  }

  if (!subdomain || !code) {
    return res
      .status(400)
      .json({ message: "Missing subdomain or coupon code" });
  }

  try {
    const seller = await prisma.user.findFirst({
      where: { subdomain },
      select: { id: true },
    });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code,
        seller_id: seller.id,
      },
      select: {
        discount_value: true,
        expiration_date: true,
      },
    });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (new Date(coupon.expiration_date) < new Date()) {
      return res.status(400).json({ message: "Coupon is expired" });
    }

    res.json({ discount_value: coupon.discount_value });
  } catch (error) {
    console.error("Error checking coupon:", error);
    res.status(500).json({ message: error.message });
  }
};

// delete coupon
export const deleteCoupon = async (req, res) => {
  const user = req.user;

  if (user.role !== "seller") {
    return res.status(403).json({ message: "Access denied. Sellers only." });
  }

  const id = req.params.id;
  try {
    const coupon = await prisma.coupon.findFirst({
      where: {
        id,
        seller_id: user.id,
      },
    });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    await prisma.coupon.delete({
      where: { id },
    });

    res.json({ message: "Coupon deleted successfully", coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update coupon

export const updateCoupon = async (req, res) => {
  const user = req.user;
  if (user.role !== "seller") {
    return res.status(403).json({ message: "Access denied. Sellers only." });
  }

  const id = req.params.id;

  const data = req.body;

  try {
    const cuppon = await prisma.coupon.findFirst({
      where: {
        id,
        seller_id: user.id,
      },
    });

    if (!cuppon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data,
    });
    res.json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
