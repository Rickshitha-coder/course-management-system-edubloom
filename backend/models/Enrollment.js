const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        status: {
            type: String,
            enum: ["active", "completed", "withdrawn"],
            default: "active"
        },
        enrolledAt: { type: Date, default: Date.now },
        // Administrator decision on the enrollment request (existing "Manage Enrollments" workflow)
        approvalStatus: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending"
        }
    },
    { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
