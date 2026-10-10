// Basic input validation for POST /api/courses
const REQUIRED_FIELDS = [
    ["courseName", "Course name is required"],
    ["courseCode", "Course code is required"],
    ["instructor", "Instructor is required"],
    ["duration", "Duration is required"],
    ["category", "Category is required"]
];

const isBlank = (value) =>
    value === undefined ||
    value === null ||
    String(value).trim() === "";

const validateCourse = (req, res, next) => {
    const body = req.body || {};

    for (const [field, message] of REQUIRED_FIELDS) {
        if (isBlank(body[field])) {
            return res.status(400).json({
                success: false,
                message
            });
        }
    }

    next();
};

module.exports = validateCourse;
