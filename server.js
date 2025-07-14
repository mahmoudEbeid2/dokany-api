import express from "express";
import dotenv from "dotenv";

import customerRouter from "./routes/customerRout.js";
import adminRoutes from "./routes/Adminroutes/admin.routes.js";
import testRoutes from "./routes/test.routes.js";

import adminAuthRoutes from './routes/auth/admin.auth.routes.js';
import sellerAuthRoutes from './routes/auth/seller.auth.routes.js';
import customerAuthRoutes from './routes/auth/customer.auth.routes.js';

import productRoutes from "./routes/productRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.use('/auth/admin', adminAuthRoutes);
app.use('/auth/seller', sellerAuthRoutes);
app.use('/auth/customer', customerAuthRoutes);

app.use("/api", customerRouter);

app.use("/api", testRoutes);

app.use("/admin", adminRoutes);

app.use("/products", productRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


















