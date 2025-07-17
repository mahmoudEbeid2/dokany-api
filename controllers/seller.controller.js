import prisma from "../config/db.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
//! --------------Geting Seller By ID------------------
export const getSellerById = async (req, res) => {
  const { id } = req.user;
  try {
    const seller = await prisma.user.findUnique({
      where: { id, role: "seller" },
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
    const seller = await prisma.user.findUnique({
      where: { subdomain },
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
  const textData = req.body;

  const dataToUpdate = { ...textData };

  try {
    if (req.files) {
      const currentSeller = await prisma.user.findUnique({ where: { id } });

      if (req.files.logo) {
        const logoResult = await cloudinary.uploader.upload(
          req.files.logo[0].path,
          {
            folder: "seller_logos",
          }
        );
        dataToUpdate.logo = logoResult.secure_url;

        fs.unlinkSync(req.files.logo[0].path);
      }

      if (req.files.profile_imge) {
        if (currentSeller.image_public_id) {
          await cloudinary.uploader.destroy(currentSeller.image_public_id);
        }

        const profileResult = await cloudinary.uploader.upload(
          req.files.profile_imge[0].path,
          {
            folder: "seller_profiles",
          }
        );
        dataToUpdate.profile_imge = profileResult.secure_url;
        dataToUpdate.image_public_id = profileResult.public_id;

        fs.unlinkSync(req.files.profile_imge[0].path);
      }
    }

    if (dataToUpdate.theme_id) {
      dataToUpdate.theme = {
        connect: { id: dataToUpdate.theme_id },
      };
      delete dataToUpdate.theme_id;
    }

    if (!dataToUpdate.password) {
      delete dataToUpdate.password;
    }

    const updatedSeller = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json(updatedSeller);
  } catch (error) {
    console.error("Error updating seller:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.status(500).json({
      message: "An error occurred during the update process.",
      error: error.message,
    });
  }
};
// ! -------------------Delete Seller-----------------
export const deleteSeller = async (req, res) => {
  const { id } = req.user;
  try {
    await prisma.user.delete({ where: { id } });
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
  const { id: sellerId } = req.user;
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
  const { id: seller_id } = req.user;
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
  } = req.body;

  const dataToCreate = {
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
  };

  try {
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "customer_profiles",
      });
      dataToCreate.profile_imge = result.secure_url;
      dataToCreate.image_public_id = result.public_id;

      fs.unlinkSync(req.file.path);
    }

    const customer = await prisma.customer.create({
      data: dataToCreate,
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ message: error.message });
  }
};

// !------------------------- Update Customer-----------------
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const textData = req.body;

  const dataToUpdate = { ...textData };

  try {
    if (req.file) {
      const currentCustomer = await prisma.customer.findUnique({
        where: { id },
      });

      if (currentCustomer && currentCustomer.image_public_id) {
        await cloudinary.uploader.destroy(currentCustomer.image_public_id);
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "customer_profiles",
      });

      dataToUpdate.profile_imge = result.secure_url;
      dataToUpdate.image_public_id = result.public_id;

      fs.unlinkSync(req.file.path);
    }

    if (!dataToUpdate.password) {
      delete dataToUpdate.password;
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Customer not found" });
    }
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
  const { id: sellerId } = req.user;
  try {
    const totalCustomers = await prisma.customer.count({
      where: { seller_id: sellerId },
    });
    const sellerOrderItems = await prisma.$queryRaw`
      SELECT DISTINCT oi.order_id
      FROM "OrderItem" AS oi
      INNER JOIN "Product" AS p ON oi.product_id = p.id
      WHERE p.seller_id = ${sellerId}
    `;
    const totalOrders = sellerOrderItems.length;

    const earningsResult = await prisma.$queryRaw`
      SELECT SUM(oi.price) as total
      FROM "OrderItem" AS oi
      INNER JOIN "Order" AS o ON oi.order_id = o.id
      INNER JOIN "Product" AS p ON oi.product_id = p.id
      WHERE p.seller_id = ${sellerId} AND o.order_status = 'completed'
    `;
    const totalEarnings = Number(earningsResult[0]?.total) || 0;

    const totalProducts = await prisma.product.count({
      where: { seller_id: sellerId },
    });

    res.json({
      totalCustomers,
      totalOrders,
      totalEarnings,
      totalProducts,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
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
