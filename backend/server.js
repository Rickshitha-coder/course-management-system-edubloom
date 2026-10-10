const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { PORT, MOCK_API_URL } = require("./config/config");
const resourceRoutes = require("./routes/resourceRoutes");
const notFound = require("./middleware/notFoundMiddleware");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// ---------------------------------------------
// Middleware
// ---------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ---------------------------------------------
// Test route
// ---------------------------------------------
app.get("/", (req, res) => {
    res.json({
        message: "Student Course Management API is running",
        status: "running",
        mockApi: MOCK_API_URL
    });
});

// ---------------------------------------------
// Health check
// ---------------------------------------------
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is healthy",
        timestamp: new Date().toISOString()
    });
});

// ---------------------------------------------
// Routes
// ---------------------------------------------
app.use("/api", resourceRoutes);

// ---------------------------------------------
// 404 and error handling (order matters: keep last)
// ---------------------------------------------
app.use(notFound);
app.use(errorHandler);

// ---------------------------------------------
// Server
// ---------------------------------------------
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Using JSON Server mock API at ${MOCK_API_URL}`);
});
