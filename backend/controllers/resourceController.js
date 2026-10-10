const { forward } = require("../services/mockApiService");
const asyncHandler = require("../utils/asyncHandler");

const recordPath = (req) =>
    `/${req.params.resource}/${encodeURIComponent(req.params.id)}`;

// GET /api/:resource  (supports query strings)
const getAll = asyncHandler(async (req, res) => {
    const query = new URLSearchParams(req.query).toString();
    const path = `/${req.params.resource}${query ? `?${query}` : ""}`;
    const { status, data } = await forward(path);
    res.status(status).json(data);
});

// GET /api/:resource/:id
const getOne = asyncHandler(async (req, res) => {
    const { status, data } = await forward(recordPath(req));

    if (status === 404) {
        return res.status(404).json({
            success: false,
            message: "Record not found"
        });
    }

    res.status(status).json(data);
});

// POST /api/:resource
const create = asyncHandler(async (req, res) => {
    const { status, data } = await forward(
        `/${req.params.resource}`, "POST", req.body
    );
    res.status(status).json(data);
});

// PUT /api/:resource/:id
const replace = asyncHandler(async (req, res) => {
    const { status, data } = await forward(recordPath(req), "PUT", req.body);
    res.status(status).json(data);
});

// PATCH /api/:resource/:id
const update = asyncHandler(async (req, res) => {
    const { status, data } = await forward(recordPath(req), "PATCH", req.body);
    res.status(status).json(data);
});

// DELETE /api/:resource/:id
const remove = asyncHandler(async (req, res) => {
    const { status, data } = await forward(recordPath(req), "DELETE");
    res.status(status).json(data);
});

module.exports = { getAll, getOne, create, replace, update, remove };
