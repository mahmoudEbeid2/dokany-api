import dotenv from "dotenv";
dotenv.config(); // ⬅️ ده اللي بيخلّي Prisma يعرف DATABASE_URL

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const seed = async () => {
  try {
    const password = await bcrypt.hash("12345678", 10);

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

    await prisma.user.create({
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

    console.log(" Seed done: Admin and Sellers added.");
  } catch (error) {
    console.error(" Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seed();
