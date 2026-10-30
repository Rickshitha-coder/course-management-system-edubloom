const { body } = require("express-validator");

const registerValidation = [
    body("name").isString().trim().notEmpty().withMessage("Name is required")
        .isLength({ max: 100 }).withMessage("Name is too long"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").isString().isLength({ min: 12, max: 128 })
        .withMessage("Password must contain 12 to 128 characters"),
    body("studentId").optional().isString().trim().isLength({ max: 50 })
        .withMessage("Student ID is too long"),
    body("department").optional().isString().trim().isLength({ max: 100 })
        .withMessage("Department is too long")
];

const loginValidation = [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isString().notEmpty().withMessage("Password is required")
];

module.exports = { registerValidation, loginValidation };
