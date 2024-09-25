const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Set up CORS to allow requests from the frontend
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from your React frontend
    methods: "GET,POST,PUT,DELETE,OPTIONS", // Allow necessary HTTP methods
    allowedHeaders: "Content-Type,Authorization", // Allow necessary headers
  })
);

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "MoveNetData",
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// Define your routes here
app.post("/api/swing-data", (req, res) => {
  const { swing_name, frames } = req.body;

  const swingQuery = "INSERT INTO swings (swing_name) VALUES (?)";

  db.query(swingQuery, [swing_name], (err, swingResult) => {
    if (err) {
      console.error("Error inserting swing:", err);
      return res.status(500).json({ message: "Error inserting swing" });
    }

    const swingId = swingResult.insertId;

    const frameQuery =
      "INSERT INTO frames (swing_id, frame_number, joint_index, x, y, score) VALUES ?";
    let values = [];
    frames.forEach((frame, frameIndex) => {
      frame[0].forEach((joint, jointIndex) => {
        values.push([
          swingId,
          frameIndex,
          jointIndex,
          joint.x,
          joint.y,
          joint.score,
        ]);
      });
    });

    db.query(frameQuery, [values], (err, frameResult) => {
      if (err) {
        console.error("Error inserting frames:", err);
        return res.status(500).json({ message: "Error inserting frames" });
      }

      res.status(200).json({ message: "Swing data inserted successfully" });
    });
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
