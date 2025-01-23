const express = require("express");
const db = require("./connection"); // Import your database connection
const router = express.Router();

router.post("/api/swing-data", (req, res) => {
  const { swing_name, frames, user_id } = req.body;

  const swingQuery = "INSERT INTO swings (swing_name, user_id) VALUES (?,?)";

  db.query(swingQuery, [swing_name, user_id], (err, swingResult) => {
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

router.get("/swing-data", (req, res) => {
  const swingName = req.query.swing_name;

  if (!swingName) {
    return res.status(400).json({ message: "Swing name is required" });
  }

  const swingQuery = "SELECT * FROM swings WHERE swing_name = ?";
  const frameQuery = "SELECT * FROM frames WHERE swing_id = ?";

  db.query(swingQuery, [swingName], (err, swingResults) => {
    if (err) {
      console.error("Error fetching swing data:", err);
      return res.status(500).json({ message: "Error fetching swing data" });
    }

    if (swingResults.length === 0) {
      return res.status(404).json({ message: "Swing not found" });
    }

    const swingId = swingResults[0].id;

    db.query(frameQuery, [swingId], (err, frameResults) => {
      if (err) {
        console.error("Error fetching frames:", err);
        return res.status(500).json({ message: "Error fetching frames" });
      }

      const groupedFrames = [];

      frameResults.forEach((frame) => {
        const frameNumber = frame.frame_number;

        if (!groupedFrames[frameNumber]) {
          groupedFrames[frameNumber] = [[]];
        }

        groupedFrames[frameNumber][0].push({
          joint_index: frame.joint_index,
          x: frame.x,
          y: frame.y,
          score: frame.score,
        });
      });

      const filteredFrames = groupedFrames.filter(
        (frame) => frame !== undefined
      );

      res.status(200).json({
        swing: swingResults[0],
        frames: filteredFrames,
      });
    });
  });
});

router.get("/swings", (req, res) => {
  const query = "SELECT * FROM swings";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching swings:", err);
      return res.status(500).json({ message: "Error fetching swings" });
    }

    res.status(200).json(results);
  });
});

router.post("/delete-swing", (req, res) => {
  // Need id of swing from swings table
  const { id } = req.body;
  const swingQuery = "DELETE FROM swings WHERE id = ?";
  const frameQuery = "DELETE FROM frames WHERE swing_id = ?";

  db.query(swingQuery, [id], (err) => {
    if (err) {
      console.error("Error deleting swing:", err);
      return res.status(500).json({ message: "Error deleting swing" });
    }

    db.query(frameQuery, [id], (err) => {
      if (err) {
        console.error("Error deleting frames:", err);
        return res.status(500).json({ message: "Error deleting frames" });
      }

      res.status(200).json({ message: "All swing data deleted successfully" });
    });
  });
});

router.get("/user/:userId", (req, res) => {
  const { userId } = req.params;

  const query = "SELECT * FROM users WHERE user_id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err);
      return res.status(500).json({ message: "Error fetching user data" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(results[0]);
  });
});

// const bcrypt = require("bcrypt");

// router.post("/api/register", async (req, res) => {
//   try {
//     const { email, password, firstName } = req.body;

//     // Validate input
//     if (!email || !password || !firstName) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     const registerQuery =
//       "INSERT INTO users (email, name, password_hash) VALUES (?,?,?)";

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = {
//       email,
//       firstName,
//       password: hashedPassword,
//     };

//     db.query(
//       registerQuery,
//       [newUser.email, newUser.firstName, newUser.password],
//       (err) => {
//         if (err) {
//           console.error("Error registering user:", err);
//           return res.status(500).json({ message: "Error registering user" });
//         }

//         res.status(201).json({ message: "User registered successfully" });
//       }
//     );
//   } catch (error) {
//     console.error("Error registering user:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

module.exports = router;
