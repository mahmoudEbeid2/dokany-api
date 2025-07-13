import express from "express";
import dotenv from "dotenv";

import customerRouter from "./routes/customerRout.js";
import adminRoutes from "./routes/Adminroutes/admin.routes.js";
import testRoutes from "./routes/test.routes.js";

dotenv.config();
const app = express();
app.use(express.json());

// Routes

app.use("/api", customerRouter);

app.use("/api", testRoutes);

app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
