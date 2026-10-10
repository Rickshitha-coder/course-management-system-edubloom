// 404 handler - runs when no route matched.
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
};

module.exports = notFound;
