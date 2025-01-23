const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./auth");
const apiRoutes = require("./api");

const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({ origin: "http://localhost:3000" })); // Adjust for frontend origin
app.use(bodyParser.json());

// Routes
app.use("/auth", authRoutes); // OAuth routes
app.use("/api", apiRoutes); // API routes

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
