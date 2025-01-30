const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./auth");
const apiRoutes = require("./api");

const app = express();

// Middleware for CORS
app.use(cors({ origin: "http://localhost:3000", credentials: true })); // Allow frontend (localhost:3000)

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json());

// Additional header setup for COEP
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Routes
app.use("/auth", authRoutes); // OAuth routes
app.use("/api", apiRoutes); // API routes

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
