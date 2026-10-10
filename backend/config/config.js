const dotenv = require("dotenv");

dotenv.config();

// Resources the Express API is allowed to forward to JSON Server
const ALLOWED_RESOURCES = [
    "students",
    "admins",
    "courses",
    "enrollments",
    "progress",
    "sessions",
    "appState",
    "draftCourses"
];

module.exports = {
    PORT: process.env.PORT || 3001,
    MOCK_API_URL: process.env.MOCK_API_URL || "http://localhost:5000",
    NODE_ENV: process.env.NODE_ENV || "development",
    ALLOWED_RESOURCES
};
