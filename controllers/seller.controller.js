import prisma from "../config/db.js";

//! --------------Geting Seller By ID------------------

export const getSellerById = async (req, res) => {
  const { id } = req.user;
  try {
    const seller = await prisma.user.findUnique({
      where: { id },
    });

    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//! ------------ Get Seller By Subdomain-------------
export const getSellerBySubdomain = async (req, res) => {
  const { subdomain } = req.user;
  try {
    const seller = await prisma.user.findFirst({
      where: { subdomain, role: "seller" },
    });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// !------------------------- Update Seller-----------------
export const updateSeller = async (req, res) => {
  const { id } = req.user;
  const { user_name, f_name, l_name, email, city, governorate, country } =
    req.body;

  try {
    const updatedSeller = await prisma.user.update({
      where: { id },
      data: {
        user_name,
        f_name,
        l_name,
        email,
        city,
        governorate,
        country,
      },
    });

    res.json(updatedSeller);
  } catch (error) {
    // Prisma's error code for a record not found
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

// ! -------------------Delete Seller-----------------
export const deleteSeller = async (req, res) => {
  const { id } = req.user;
  try {
    await prisma.user.delete({ where: { id, role: "seller" } });
    res.json({ message: "Seller deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

//!------------- Get Customers of Seller by sellerId----------------
export const getSellerCustomers = async (req, res) => {
  const { sellerId } = req.user;
  try {
    const customers = await prisma.customer.findMany({
      where: { seller_id: sellerId },
    });

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ! -------------------------Create Customer-----------------------
export const createCustomer = async (req, res) => {
  const {
    user_name,
    f_name,
    l_name,
    email,
    phone,
    city,
    governorate,
    country,
    password,
    seller_id,
  } = req.body;

  try {
    const customer = await prisma.customer.create({
      data: {
        user_name,
        f_name,
        l_name,
        email,
        phone,
        city,
        governorate,
        country,
        password,
        seller_id,
      },
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// !------------------------- Update Customer-----------------
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updated = await prisma.customer.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ! -------------------Delete Customer-----------------
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.customer.delete({ where: { id } });
    res.json({ message: "Customer deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// !-------------------- Get Dashboard Stats-------------------
export const getDashboardStats = async (req, res) => {
  try {
    const totalSellers = await prisma.user.count({
      where: { role: "seller" },
    });

    const totalCustomers = await prisma.customer.count();

    res.json({ totalSellers, totalCustomers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -----------------------Get Total Earnings Summary-------------------
// GET /seller/earnings-summary
export const getSellerEarningsSummary = async (req, res) => {
  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Access denied. Sellers only." });
  }

  const sellerId = req.user.id;

  try {
    // Calculate Total Earnings From Orders Only
    const ordersTotal = await prisma.orderItem.aggregate({
      where: {
        product: {
          seller_id: sellerId,
        },
        order: {
          order_status: "completed", // Completed orders (Or Status in Prisma)
        },
      },
      _sum: {
        price: true,
      },
    });

    const totalFromOrders = ordersTotal._sum.price || 0;

    // Calculate Total Earnings From Paid Out
    const payoutsTotal = await prisma.payout.aggregate({
      where: {
        seller_id: sellerId,
        status: "paid", // Paid Status (Or Status in Prisma)
      },
      _sum: {
        amount: true,
      },
    });

    const totalPaidOut = payoutsTotal._sum.amount || 0;

    const websiteTax = totalPaidOut * 0.10
    // Remaining Balance = Total Earnings From Orders - Total Earnings From Paid Out (Actual Earnings)
    const remaining = totalFromOrders - totalPaidOut - websiteTax;

    res.json({
      total_earned_from_orders: totalFromOrders,
      total_paid_out: totalPaidOut,
      remaining_balance: remaining,
    });

  } catch (error) {
    console.error("Error calculating seller earnings:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
