const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 3001;

// Keep mock-api running separately on port 5000
const MOCK_API_URL = "http://localhost:5000";


// =============================================
// MIDDLEWARE
// =============================================

app.use(cors());

app.use(express.json());


// =============================================
// ALLOWED MOCK RESOURCES
// =============================================

const allowedResources = [
    "students",
    "admins",
    "courses",
    "enrollments",
    "progress",
    "sessions",
    "appState",
    "draftCourses"
];


// =============================================
// VALIDATE RESOURCE
// =============================================

function isValidResource(resource) {
    return allowedResources.includes(resource);
}


// =============================================
// HOME
// =============================================

app.get("/", (req, res) => {

    res.json({
        message: "Student Course Management System API",
        status: "running",
        mockApi: MOCK_API_URL
    });

});


// =============================================
// GET ALL / QUERY
// =============================================

app.get("/api/:resource", async (req, res) => {

    try {

        const { resource } = req.params;

        if (!isValidResource(resource)) {

            return res.status(404).json({
                message: "Resource not found"
            });

        }

        const query =
            new URLSearchParams(req.query).toString();

        const url = query
            ? `${MOCK_API_URL}/${resource}?${query}`
            : `${MOCK_API_URL}/${resource}`;

        const response = await fetch(url);

        const data = await response.json();

        res
            .status(response.status)
            .json(data);

    }
    catch (error) {

        console.error("GET error:", error);

        res.status(500).json({
            message: "Unable to retrieve data"
        });

    }

});


// =============================================
// GET BY ID
// =============================================

app.get("/api/:resource/:id", async (req, res) => {

    try {

        const {
            resource,
            id
        } = req.params;

        if (!isValidResource(resource)) {

            return res.status(404).json({
                message: "Resource not found"
            });

        }

        const response = await fetch(
            `${MOCK_API_URL}/${resource}/${encodeURIComponent(id)}`
        );

        if (response.status === 404) {

            return res.status(404).json({
                message: "Record not found"
            });

        }

        const data = await response.json();

        res
            .status(response.status)
            .json(data);

    }
    catch (error) {

        console.error("GET BY ID error:", error);

        res.status(500).json({
            message: "Unable to retrieve record"
        });

    }

});


// =============================================
// POST
// =============================================

app.post("/api/:resource", async (req, res) => {

    try {

        const { resource } = req.params;

        if (!isValidResource(resource)) {

            return res.status(404).json({
                message: "Resource not found"
            });

        }

        const response = await fetch(
            `${MOCK_API_URL}/${resource}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(req.body)
            }
        );

        const data = await response.json();

        res
            .status(response.status)
            .json(data);

    }
    catch (error) {

        console.error("POST error:", error);

        res.status(500).json({
            message: "Unable to create record"
        });

    }

});


// =============================================
// PUT
// =============================================

app.put("/api/:resource/:id", async (req, res) => {

    try {

        const {
            resource,
            id
        } = req.params;

        if (!isValidResource(resource)) {

            return res.status(404).json({
                message: "Resource not found"
            });

        }

        const response = await fetch(
            `${MOCK_API_URL}/${resource}/${encodeURIComponent(id)}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(req.body)
            }
        );

        const data = await response.json();

        res
            .status(response.status)
            .json(data);

    }
    catch (error) {

        console.error("PUT error:", error);

        res.status(500).json({
            message: "Unable to update record"
        });

    }

});


// =============================================
// PATCH
// =============================================

app.patch("/api/:resource/:id", async (req, res) => {

    try {

        const {
            resource,
            id
        } = req.params;

        if (!isValidResource(resource)) {

            return res.status(404).json({
                message: "Resource not found"
            });

        }

        const response = await fetch(
            `${MOCK_API_URL}/${resource}/${encodeURIComponent(id)}`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(req.body)
            }
        );

        const data = await response.json();

        res
            .status(response.status)
            .json(data);

    }
    catch (error) {

        console.error("PATCH error:", error);

        res.status(500).json({
            message: "Unable to patch record"
        });

    }

});


// =============================================
// DELETE
// =============================================

app.delete("/api/:resource/:id", async (req, res) => {

    try {

        const {
            resource,
            id
        } = req.params;

        if (!isValidResource(resource)) {

            return res.status(404).json({
                message: "Resource not found"
            });

        }

        const response = await fetch(
            `${MOCK_API_URL}/${resource}/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );

        if (
            response.ok ||
            response.status === 404
        ) {

            return res
                .status(response.status)
                .json({
                    success: true
                });

        }

        res
            .status(response.status)
            .json({
                success: false
            });

    }
    catch (error) {

        console.error("DELETE error:", error);

        res.status(500).json({
            message: "Unable to delete record"
        });

    }

});


// =============================================
// START SERVER
// =============================================

app.listen(PORT, () => {

    console.log(
        `Express API running on http://localhost:${PORT}`
    );

    console.log(
        `Using JSON Server mock API at ${MOCK_API_URL}`
    );

});