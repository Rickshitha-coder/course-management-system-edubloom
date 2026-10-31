const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Notification = require("../models/Notification");
const generateTemporaryPassword = require("../utils/generatePassword");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /admins  - every administrator account (never includes passwords)
async function getAdmins(req, res, next) {
    try {
        const admins = await User.find({ role: "admin" })
            .select("name email createdAt")
            .sort({ createdAt: 1 })
            .lean();

        res.json({
            admins: admins.map((admin) => ({
                ...admin,
                isCurrent: String(admin._id) === String(req.user.sub)
            }))
        });
    } catch (error) {
        next(error);
    }
}

// POST /admins/:id/reset-password
// One administrator resets ANOTHER administrator's password. Resetting your own
// account this way is refused (use Change Password, which needs the old one).
async function resetAdminPassword(req, res, next) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid admin ID" });
        }

        if (String(id) === String(req.user.sub)) {
            return res.status(403).json({
                message: "You cannot reset your own password here. Use Change Password instead."
            });
        }

        const temporaryPassword = generateTemporaryPassword();
        const hashed = await bcrypt.hash(temporaryPassword, 12);

        const admin = await User.findOneAndUpdate(
            { _id: id, role: "admin" },
            {
                $set: { password: hashed },
                $unset: { passwordResetTokenHash: 1, passwordResetExpires: 1 }
            },
            { new: true }
        ).select("name email");

        if (!admin) {
            return res.status(404).json({ message: "Administrator not found" });
        }

        await Notification.create({
            recipient: admin._id,
            message:
                "Your password was reset by another administrator. Log in with the " +
                "temporary password you were given, then change it under Change Password."
        });

        // Visible in the server log so a surprise reset can be traced
        console.log(`Admin password reset: ${admin.email} reset by user ${req.user.sub}`);

        res.json({
            message: "Password reset",
            temporaryPassword,
            admin: { id: admin.id, name: admin.name, email: admin.email }
        });
    } catch (error) {
        next(error);
    }
}

// POST /admins  { name, email, password }
// Only a logged-in administrator can reach this, so new admins cannot be self-registered.
async function createAdmin(req, res, next) {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" || !name.trim() || name.trim().length > 100 ||
            typeof email !== "string" || !EMAIL_RE.test(email.trim()) ||
            typeof password !== "string" || password.length < 12 || password.length > 128
        ) {
            return res.status(400).json({
                message: "Valid name, email and a password of 12 to 128 characters are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (await User.exists({ email: normalizedEmail })) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const admin = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: await bcrypt.hash(password, 12),
            role: "admin"
        });

        console.log(`Admin created: ${admin.email} by user ${req.user.sub}`);

        res.status(201).json({
            message: "Administrator created",
            admin: { _id: admin._id, id: admin.id, name: admin.name, email: admin.email, createdAt: admin.createdAt }
        });
    } catch (error) {
        next(error);
    }
}

// PUT /admins/:id  { name }  - change an administrator's display name
async function renameAdmin(req, res, next) {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid admin ID" });
        }

        if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
            return res.status(400).json({ message: "A name of 1 to 100 characters is required" });
        }

        const admin = await User.findOneAndUpdate(
            { _id: id, role: "admin" },
            { $set: { name: name.trim() } },
            { new: true, runValidators: true }
        ).select("name email");

        if (!admin) {
            return res.status(404).json({ message: "Administrator not found" });
        }

        res.json({ message: "Name updated", admin });
    } catch (error) {
        next(error);
    }
}

module.exports = { getAdmins, resetAdminPassword, createAdmin, renameAdmin };
