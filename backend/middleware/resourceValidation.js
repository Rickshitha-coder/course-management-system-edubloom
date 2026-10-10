const { ALLOWED_RESOURCES } = require("../config/config");

// Rejects requests for resources that are not exposed by the API.
const validateResource = (req, res, next) => {
    if (!ALLOWED_RESOURCES.includes(req.params.resource)) {
        return res.status(404).json({
            success: false,
            message: "Resource not found"
        });
    }

    next();
};

module.exports = validateResource;
