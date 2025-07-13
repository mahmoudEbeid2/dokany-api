import express from "express";
import dotenv from "dotenv";
<<<<<<< HEAD
import customerRouter from "./routes/customerRout.js";
=======
import adminRoutes from "./routes/Adminroutes/admin.routes.js";
import testRoutes from "./routes/test.routes.js";

>>>>>>> e62cea178324578e284bd33138a902f12a36dfcc

dotenv.config();
const app = express();
app.use(express.json());

// Routes
<<<<<<< HEAD
app.use("/api", customerRouter);
=======
app.use("/api", testRoutes);

app.use("/admin", adminRoutes);
>>>>>>> e62cea178324578e284bd33138a902f12a36dfcc

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
