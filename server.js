import express from "express";
import dotenv from "dotenv";

import adminRoutes from "./routes/Adminroutes/admin.routes.js";

import adminAuthRoutes from "./routes/auth/admin.auth.routes.js";
import sellerAuthRoutes from "./routes/auth/seller.auth.routes.js";
import customerAuthRoutes from "./routes/auth/customer.auth.routes.js";

import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cart.routes.js";
import favRoutes from "./routes/favorites.routes.js";

import customerRouteres from "./routes/customerRoutes.js";
import cors from "cors";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// auth
app.use("/auth/admin", adminAuthRoutes);
app.use("/auth/seller", sellerAuthRoutes);
app.use("/auth/customer", customerAuthRoutes);

// customer
app.use("/api", customerRouteres);

// admin
app.use("/admin", adminRoutes);

// product
app.use("/products", productRoutes);





// Cart
app.use("/", cartRoutes);
// fav
app.use("/", favRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
