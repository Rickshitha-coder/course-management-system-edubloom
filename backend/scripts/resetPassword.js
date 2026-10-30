// Resets the password of ANY account (admin or student) from the terminal.
// Anyone who can run this already has the database password, so it is the
// "break glass" option for a forgotten admin password.
//
// PowerShell:
//   $env:RESET_EMAIL="admin@edubloom.com"
//   $env:RESET_PASSWORD="AtLeast12Characters!"      (optional - random if left out)
//   npm run reset-password
require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const randomPassword = (n = 14) =>
    Array.from({ length: n }, () => CHARS[crypto.randomInt(CHARS.length)]).join("");

async function main() {
    const email = (process.env.RESET_EMAIL || "").trim().toLowerCase();
    const generated = !process.env.RESET_PASSWORD;
    const password = process.env.RESET_PASSWORD || randomPassword();

    if (!email) {
        throw new Error("Set RESET_EMAIL to the account's email address");
    }

    if (password.length < 12) {
        throw new Error("RESET_PASSWORD must be at least 12 characters");
    }

    await connectDB();

    const user = await User.findOneAndUpdate(
        { email },
        {
            $set: { password: await bcrypt.hash(password, 12) },
            $unset: { passwordResetTokenHash: 1, passwordResetExpires: 1 }
        },
        { new: true }
    ).select("email role");

    if (!user) {
        throw new Error(`No account found with email ${email}`);
    }

    console.log(`Password reset for ${user.email} (${user.role}).`);
    if (generated) {
        console.log(`New password: ${password}`);
    }
    console.log("Log in, then change it under Change Password.");
}

main()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.connection.close());
