const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function getProfile(req, res, next) {
    try {
        const user = await User.findById(req.user.sub).select("name email role createdAt");

        if (!user) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json({ user });
    } catch (error) {
        next(error);
    }
}

async function updateProfile(req, res, next) {
    try {
        const { name } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ message: "Valid name is required" });
        }

        const user = await User.findByIdAndUpdate(
            req.user.sub,
            { $set: { name: name.trim() } },
            { new: true, runValidators: true }
        ).select("name email role");

        if (!user) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json({ message: "Profile updated", user });
    } catch (error) {
        next(error);
    }
}

// PUT /profile/password  { currentPassword, newPassword }
async function changePassword(req, res, next) {
    try {
        const { currentPassword, newPassword } = req.body;

        if (typeof currentPassword !== "string" || !currentPassword) {
            return res.status(400).json({ message: "Current password is required" });
        }

        if (typeof newPassword !== "string" || newPassword.length < 12 || newPassword.length > 128) {
            return res.status(400).json({ message: "New password must contain 12 to 128 characters" });
        }

        if (newPassword === currentPassword) {
            return res.status(400).json({ message: "New password must be different from the current one" });
        }

        const user = await User.findById(req.user.sub).select("+password");

        if (!user) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // 400 (not 401) so the website does not treat a typo as an expired session
        if (!(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save({ validateBeforeSave: false });

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        next(error);
    }
}

module.exports = { getProfile, updateProfile, changePassword };
