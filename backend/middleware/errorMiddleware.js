// Global error handler - must be registered LAST.
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (res.headersSent) {
        return next(err);
    }

    // Malformed JSON body (thrown by express.json())
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON in request body"
        });
    }

    const statusCode =
        err.statusCode ||
        (res.statusCode === 200 ? 500 : res.statusCode);

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};

module.exports = errorHandler;
