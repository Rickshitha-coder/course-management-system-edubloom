const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: { type: String, required: true, select: false },
        // Optional profile fields collected by the existing registration form
        studentId: { type: String, trim: true, maxlength: 50, unique: true, sparse: true },
        department: { type: String, trim: true, maxlength: 100 },
        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
