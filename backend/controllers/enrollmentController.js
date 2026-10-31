const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Notification = require("../models/Notification");

// POST /enrollments  { courseId }
// Reactivates a withdrawn enrollment instead of inserting a duplicate
// (the unique { student, course } index would reject a second document).
async function enroll(req, res, next) {
    try {
        const { courseId } = req.body;

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({ message: "Invalid course ID" });
        }

        const course = await Course.findById(courseId).select("courseName");

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        let enrollment = await Enrollment.findOne({
            student: req.user.sub,
            course: courseId
        });

        if (enrollment && enrollment.status !== "withdrawn") {
            return res.status(409).json({ message: "Already enrolled in this course" });
        }

        if (enrollment) {
            enrollment.status = "active";
            enrollment.approvalStatus = "Pending";
            enrollment.enrolledAt = new Date();
            await enrollment.save();
        } else {
            enrollment = await Enrollment.create({
                student: req.user.sub,
                course: courseId
            });
        }

        await Notification.create({
            recipient: req.user.sub,
            message: `You are enrolled in ${course.courseName}`
        });

        res.status(201).json({ message: "Enrollment successful", enrollment });
    } catch (error) {
        next(error);
    }
}

// GET /enrollments/me
async function getMyEnrollments(req, res, next) {
    try {
        const enrollments = await Enrollment.find({
            student: req.user.sub,
            status: { $ne: "withdrawn" }
        }).populate("course").sort({ enrolledAt: -1 }).lean();

        res.json({ enrollments });
    } catch (error) {
        next(error);
    }
}

// DELETE /enrollments/:courseId  -> marks the enrollment as withdrawn
async function unenroll(req, res, next) {
    try {
        if (!mongoose.isValidObjectId(req.params.courseId)) {
            return res.status(400).json({ message: "Invalid course ID" });
        }

        const enrollment = await Enrollment.findOneAndUpdate(
            {
                student: req.user.sub,
                course: req.params.courseId,
                status: { $ne: "withdrawn" }
            },
            { $set: { status: "withdrawn" } },
            { new: true }
        );

        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }

        res.json({ message: "Unenrolled successfully", enrollment });
    } catch (error) {
        next(error);
    }
}

// GET /enrollments  (admin)
async function getAllEnrollments(req, res, next) {
    try {
        const enrollments = await Enrollment.find()
            .populate("student", "name email studentId")
            .populate("course", "courseName courseCode")
            .sort({ enrolledAt: -1 })
            .limit(1000)
            .lean();

        res.json({
            enrollments: enrollments.map((item) => ({
                ...item,
                approvalStatus: item.approvalStatus || "Pending"
            }))
        });
    } catch (error) {
        next(error);
    }
}

// PUT /enrollments/:id/approval  { approvalStatus: "Approved" | "Rejected" }  (admin)
async function setApproval(req, res, next) {
    try {
        const { id } = req.params;
        const { approvalStatus } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid enrollment ID" });
        }

        if (!["Approved", "Rejected"].includes(approvalStatus)) {
            return res.status(400).json({ message: "approvalStatus must be Approved or Rejected" });
        }

        const enrollment = await Enrollment.findById(id).populate("course", "courseName");

        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }

        enrollment.approvalStatus = approvalStatus;

        // A rejected request removes the course from the student's list
        if (approvalStatus === "Rejected") {
            enrollment.status = "withdrawn";
        } else if (enrollment.status === "withdrawn") {
            enrollment.status = "active";
        }

        await enrollment.save();

        const courseName = enrollment.course ? enrollment.course.courseName : "the course";

        await Notification.create({
            recipient: enrollment.student,
            message:
                approvalStatus === "Approved"
                    ? `Your enrollment in "${courseName}" has been approved. You can continue learning.`
                    : `Your enrollment request for "${courseName}" was rejected. Please try another course.`
        });

        res.json({ message: `Enrollment ${approvalStatus.toLowerCase()}`, enrollment });
    } catch (error) {
        next(error);
    }
}

module.exports = { enroll, getMyEnrollments, unenroll, getAllEnrollments, setApproval };
