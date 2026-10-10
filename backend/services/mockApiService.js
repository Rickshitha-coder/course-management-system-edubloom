const AppError = require("../utils/AppError");
const { MOCK_API_URL } = require("../config/config");

// Forwards a request to JSON Server and returns { status, data }.
async function forward(path, method = "GET", body) {
    const options = { method };

    if (body !== undefined) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(body);
    }

    let response;

    try {
        response = await fetch(`${MOCK_API_URL}${path}`, options);
    } catch (error) {
        throw new AppError(
            `Mock API is not reachable at ${MOCK_API_URL}`,
            502
        );
    }

    const text = await response.text();
    let data = {};

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { message: text };
        }
    }

    return { status: response.status, data };
}

module.exports = { forward };
