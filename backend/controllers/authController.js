const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    department: user.department
});

async function register(req, res, next) {
    try {
        const { name, email, password, studentId, department } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !EMAIL_RE.test(email) ||
            typeof password !== "string" || password.length < 12
        ) {
            return res.status(400).json({
                message: "Valid name, email and password of at least 12 characters are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (await User.findOne({ email: normalizedEmail })) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Public registration can only ever create students.
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "student",
            studentId: typeof studentId === "string" && studentId.trim() ? studentId.trim() : undefined,
            department: typeof department === "string" && department.trim() ? department.trim() : undefined
        });

        return res.status(201).json({
            message: "Registration successful",
            student: publicUser(user)
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing");
        }

        const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

        const token = jwt.sign(
            { email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { subject: String(user._id), expiresIn, algorithm: "HS256" }
        );

        return res.json({
            message: "Login successful",
            token,
            tokenType: "Bearer",
            expiresIn,
            student: publicUser(user)
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { register, login };
