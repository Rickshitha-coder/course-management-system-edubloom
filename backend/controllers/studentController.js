const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const LearningProgress = require("../models/LearningProgress");
const Notification = require("../models/Notification");
const Message = require("../models/Message");

const publicFields = "name email role studentId department createdAt updatedAt";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getStudents(req, res, next) {
    try {
        const students = await User.find({ role: "student" })
            .select(publicFields).sort({ createdAt: -1 }).lean();
        res.json({ students });
    } catch (error) {
        next(error);
    }
}

async function getStudentById(req, res, next) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid student ID" });
        }

        const student = await User.findOne({ _id: req.params.id, role: "student" })
            .select(publicFields);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({ student });
    } catch (error) {
        next(error);
    }
}

async function createStudent(req, res, next) {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !EMAIL_RE.test(email) ||
            typeof password !== "string" || password.length < 12
        ) {
            return res.status(400).json({
                message: "Valid name, email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (await User.exists({ email: normalizedEmail })) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const student = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: await bcrypt.hash(password, 12),
            role: "student"
        });

        res.status(201).json({
            message: "Student created",
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                role: student.role
            }
        });
    } catch (error) {
        next(error);
    }
}

async function updateStudent(req, res, next) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid student ID" });
        }

        const updates = {};

        if (req.body.name !== undefined) {
            if (typeof req.body.name !== "string" || !req.body.name.trim()) {
                return res.status(400).json({ message: "Invalid name" });
            }
            updates.name = req.body.name.trim();
        }

        if (req.body.email !== undefined) {
            if (typeof req.body.email !== "string" || !EMAIL_RE.test(req.body.email)) {
                return res.status(400).json({ message: "Invalid email" });
            }
            updates.email = req.body.email.trim().toLowerCase();
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid fields supplied" });
        }

        const student = await User.findOneAndUpdate(
            { _id: id, role: "student" },
            { $set: updates },
            { new: true, runValidators: true }
        ).select(publicFields);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({ message: "Student updated", student });
    } catch (error) {
        next(error);
    }
}

async function deleteStudent(req, res, next) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid student ID" });
        }

        const student = await User.findOneAndDelete({
            _id: req.params.id,
            role: "student"
        });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Remove dependent records so no orphaned data is left behind.
        await Promise.all([
            Enrollment.deleteMany({ student: student._id }),
            LearningProgress.deleteMany({ student: student._id }),
            Notification.deleteMany({ recipient: student._id }),
            Message.deleteMany({
                $or: [{ sender: student._id }, { recipient: student._id }]
            })
        ]);

        res.json({ message: "Student deleted" });
    } catch (error) {
        next(error);
    }
}

// Letters and digits without look-alike characters (no 0/O, 1/l/I)
const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function generateTemporaryPassword(length = 12) {
    let password = "";
    for (let i = 0; i < length; i++) {
        password += PASSWORD_CHARS[crypto.randomInt(PASSWORD_CHARS.length)];
    }
    return password;
}

// POST /students/:id/reset-password  (admin)
// Sets a new random password. It is returned ONCE so the admin can give it to
// the student; only the bcrypt hash is stored.
async function resetStudentPassword(req, res, next) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid student ID" });
        }

        const temporaryPassword = generateTemporaryPassword();
        const hashed = await bcrypt.hash(temporaryPassword, 12);

        const student = await User.findOneAndUpdate(
            { _id: req.params.id, role: "student" },
            {
                $set: { password: hashed },
                $unset: { passwordResetTokenHash: 1, passwordResetExpires: 1 }
            },
            { new: true }
        ).select("name email");

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        await Notification.create({
            recipient: student._id,
            message:
                "Your password was reset by the administrator. Log in with the " +
                "temporary password the administrator gave you, then change it under Change Password."
        });

        res.json({
            message: "Password reset",
            temporaryPassword,
            student: { id: student.id, name: student.name, email: student.email }
        });
    } catch (error) {
        next(error);
    }
}

// Quote a CSV cell; a leading = + - @ is neutralised so spreadsheets never run it as a formula.
function csvCell(value) {
    let text = value === undefined || value === null ? "" : String(value);
    if (/^[=+\-@\t\r]/.test(text)) {
        text = "'" + text;
    }
    return `"${text.replace(/"/g, '""')}"`;
}

// GET /students/export  (admin) -> students.csv
async function exportStudents(req, res, next) {
    try {
        const students = await User.find({ role: "student" })
            .select("name email studentId department createdAt")
            .sort({ name: 1 })
            .lean();

        const rows = [["Name", "Email", "Student ID", "Department", "Registered On"]];

        for (const s of students) {
            rows.push([
                s.name, s.email, s.studentId, s.department,
                s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : ""
            ]);
        }

        const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", 'attachment; filename="students.csv"');
        res.send("\ufeff" + csv);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getStudents, getStudentById, createStudent, updateStudent, deleteStudent,
    resetStudentPassword, exportStudents
};
