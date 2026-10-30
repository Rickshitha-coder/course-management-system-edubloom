const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getProfile, updateProfile, changePassword } = require("../controllers/profileController");
const loginLimiter = require("../middleware/loginLimiter");

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);
router.put("/password", authMiddleware, loginLimiter, changePassword);

module.exports = router;
