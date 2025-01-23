const express = require("express");
const axios = require("axios");
const router = express.Router();
const db = require("./connection");

const clientId =
  "317043823196-8tsqvi7t539ute977m3t69en7ajgpbpt.apps.googleusercontent.com";
const clientSecret = "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";
const redirectUri = "http://localhost:5001/auth/callback";

// Redirect to Google for login
router.get("/google", (req, res) => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=email%20profile&access_type=offline`;
  res.redirect(authUrl);
});

// Handle the callback from Google
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange the authorization code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }
    );

    const { access_token, id_token } = tokenResponse.data;

    // Fetch user information
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const userInfo = userInfoResponse.data;
    console.log("User Info:", userInfo);

    const userQuery =
      "INSERT INTO users (user_id, email, name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = ?";

    db.query(
      userQuery,
      [userInfo.sub, userInfo.email, userInfo.name, userInfo.name],
      (err, result) => {
        if (err) {
          console.error("Error saving user:", err);
          return res.status(500).json({ message: "Error saving user" });
        }
        // res.status(200).json({ message: "Authentication successful", userInfo });
        res.redirect(`http://localhost:3000/?userId=${userInfo.sub}`);
      }
    );
  } catch (error) {
    console.error(
      "Error during OAuth callback:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Authentication failed" });
  }
});

module.exports = router;
