import express from "express";
import dotenv from "dotenv";
import customerRouter from "./routes/customerRout.js";

dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.use("/api", customerRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
