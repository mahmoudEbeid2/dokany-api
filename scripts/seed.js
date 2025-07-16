import dotenv from "dotenv";
dotenv.config(); 

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const seed = async () => {
  try {
    const password = await bcrypt.hash("12345678", 10);

    // ✅ Admin
    await prisma.user.create({
      data: {
        user_name: "admin",
        f_name: "Admin",
        l_name: "User",
        email: "admin@dokany.com",
        phone: "01000000001",
        city: "Cairo",
        governorate: "Cairo",
        country: "Egypt",
        role: "admin",
        password,
      },
    });

    // ✅ Seller 1
    const seller1 = await prisma.user.create({
      data: {
        user_name: "seller1",
        f_name: "Seller",
        l_name: "One",
        email: "seller1@dokany.com",
        phone: "01000000002",
        city: "Giza",
        governorate: "Giza",
        country: "Egypt",
        role: "seller",
        subdomain: "seller1-shop",
        payout_method: "vodafone_cash",
        password,
      },
    });

    // ✅ Seller 2
    await prisma.user.create({
      data: {
        user_name: "seller2",
        f_name: "Seller",
        l_name: "Two",
        email: "seller2@dokany.com",
        phone: "01000000003",
        city: "Alex",
        governorate: "Alex",
        country: "Egypt",
        role: "seller",
        subdomain: "seller2-shop",
        payout_method: "bank",
        password,
      },
    });

   // Customer for seller1
await prisma.customer.create({
  data: {
    user_name: "omnia1",
    f_name: "Omnia",
    l_name: "One",
    email: "omnia1@dokany.com",
    phone: "01012345671",
    city: "City1",
    governorate: "Gov1",
    country: "Egypt",
    password,
    seller_id: seller1.id,
  },
});

// Customer for seller2
const seller2 = await prisma.user.findUnique({
  where: { email: "seller2@dokany.com" }, // أو ممكن تاخديه من create لو حفظتيه فمتغير
});

await prisma.customer.create({
  data: {
    user_name: "omnia2",
    f_name: "Omnia",
    l_name: "Two",
    email: "omnia2@dokany.com",
    phone: "01012345672",
    city: "City2",
    governorate: "Gov2",
    country: "Egypt",
    password,
    seller_id: seller2.id,
  },
});


    console.log("✅ Seed done: Admin, Sellers, and Customer added.");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seed();
