import prisma from "../config/db.js";

export const getAllOrders = async (req, res) => {
  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Access denied. Sellers only." });
  }

  const sellerId = req.user.id;

  try {
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              seller_id: sellerId,
            },
          },
        },
      },
      include: {
        customer: {
          select: {
            f_name: true,
            l_name: true,
            email: true,
            city: true,
            governorate: true,
            country: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                title: true,
                price: true,
                discount: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error fetching seller orders:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get by status

export const getOrdersByStatus = async (req, res) => {
  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Access denied. Sellers only." });
  }

  const sellerId = req.user.id;
  const status = req.params.status;

  try {
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              seller_id: sellerId,
            },
          },
        },
        order_status: status,
      },
      include: {
        customer: {
          select: {
            f_name: true,
            l_name: true,
            email: true,
            city: true,
            governorate: true,
            country: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                title: true,
                price: true,
                discount: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error fetching seller orders:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// update order status
export const updateOrderStatus = async (req, res) => {
  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Access denied. Sellers only." });
  }

  const orderId = req.params.id;

  const { status } = req.body;

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { order_status: status },
    });

    res
      .status(200)
      .json({
        message: "Order status updated successfully",
        order: updatedOrder,
      });
  } catch (error) {
    console.error("❌ Error updating order status:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
