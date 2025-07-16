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
