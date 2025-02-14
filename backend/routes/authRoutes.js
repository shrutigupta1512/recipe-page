const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware")
const router = express.Router();
const User = require("../models/User")

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.userId).select("-password");
      if (!user) throw new Error("User not found");
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });


  router.put("/update-profile", authMiddleware, async (req, res) => {
    try {
      const { username } = req.body;
      
      const user = await User.findById(req.userId);
      if (!user) throw new Error("User not found");
  
      // Check if username is already taken
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== req.userId) {
        throw new Error("Username already taken");
      }
  
      user.username = username;
      await user.save();
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  
module.exports = router;