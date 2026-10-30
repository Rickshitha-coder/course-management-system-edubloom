const { rateLimit } = require("express-rate-limit");

// How many wrong/any login tries are allowed, and for how long.
// Change them in backend/.env (no code change needed):
//   LOGIN_MAX_ATTEMPTS=10      tries allowed per window
//   LOGIN_WINDOW_MINUTES=15    length of the window
const maxAttempts = Number.parseInt(process.env.LOGIN_MAX_ATTEMPTS, 10) || 10;
const windowMinutes = Number.parseInt(process.env.LOGIN_WINDOW_MINUTES, 10) || 15;

const loginLimiter = rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: process.env.NODE_ENV === "test" ? 1000 : maxAttempts,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: `Too many login attempts. Try again in ${windowMinutes} minute(s).`
    }
});

module.exports = loginLimiter;
