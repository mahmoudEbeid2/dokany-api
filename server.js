import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import webhookRouter from "./middlewares/rawBody.js"; // ⬅️ قبل express.json
import stripeRoutes from "./routes/stripeRoutes.js";

// باقي الراوتات...
import adminRoutes from "./routes/Adminroutes/admin.routes.js";
import adminAuthRoutes from "./routes/auth/admin.auth.routes.js";
import sellerAuthRoutes from "./routes/auth/seller.auth.routes.js";
import customerAuthRoutes from "./routes/auth/customer.auth.routes.js";
import productRoutes from "./routes/productRoutes.js";
import customerRoutId from "./routes/customer/customerById.routes.js";
import customerRouterToken from "./routes/customer/customerByToken.routes.js";

dotenv.config();
const app = express();

app.use("/api/stripe/webhook", webhookRouter);

app.use(cors());
app.use(express.json());

// auth
app.use("/auth/admin", adminAuthRoutes);
app.use("/auth/seller", sellerAuthRoutes);
app.use("/auth/customer", customerAuthRoutes);

// customer
app.use("/api", customerRoutId);
app.use("/api", customerRouterToken);

// admin
app.use("/admin", adminRoutes);

// product
app.use("/products", productRoutes);

// stripe
app.use("/api/stripe", stripeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
