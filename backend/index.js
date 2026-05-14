const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// --- 1. Import Routes ---
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");

const app = express();

// --- 2. Middleware ---
app.use(cors());
app.use(express.json());

// Serving the 'uploads' folder statically so PDFs can be accessed via URL
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- 3. Use Routes ---
app.use("/api/auth", authRoutes); // Authentication (Register/Login)
app.use("/api/books", bookRoutes); // Book management (Upload/List)

// --- 4. Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// --- 5. Base Route ---
app.get("/", (req, res) => {
  res.send("E-Library Backend Running");
});

// --- 6. Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});