const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { param } = require("express-validator");
const controller = require("../controllers/adminController");

router.use(authMiddleware);
router.use(authorizeRoles("admin"));

router.get("/", controller.getAdmins);
router.post(
    "/:id/reset-password",
    param("id").isMongoId().withMessage("Invalid admin ID"),
    validateRequest,
    controller.resetAdminPassword
);

module.exports = router;
