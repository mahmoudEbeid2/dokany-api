import prisma from "../../config/db.js";

// GET /payouts?status=pending

export const getPayouts = async (req, res) => {
  const { status } = req.query;

  const where = status ? { status } : {};

  try {
    const payouts = await prisma.payout.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        seller: {
          select: {
            user_name: true,
            email: true,
          },
        },
      },
    });

    res.json(payouts);
  } catch (err) {
    console.error("Error fetching payouts:", err);
    res.status(500).json({ message: "Server Error" });
  }
};




// GET /payouts/seller/:sellerId
export const getSellerPayouts = async (req, res) => {
  const { sellerId } = req.params;
  const payouts = await prisma.payout.findMany({
    where: { seller_id: sellerId },
    orderBy: { date: 'desc' },
  });
  res.json(payouts);
};

// POST /payouts
export const createPayout = async (req, res) => {
  const { amount, payout_method, seller_id } = req.body;
  const payout = await prisma.payout.create({
    data: { amount, payout_method, seller_id, status: "pending" },
  });
  res.status(201).json(payout);
};

// PUT /payouts/:id/status
export const updatePayoutStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const payout = await prisma.payout.update({
    where: { id },
    data: { status },
  });
  res.json(payout);
};

// DELETE /payouts/:id
export const deletePayout = async (req, res) => {
  const { id } = req.params;
  await prisma.payout.delete({ where: { id } });
  res.status(204).send();
};
