const crypto = require("crypto");

// Letters and digits without look-alike characters (no 0/O, 1/l/I)
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function generateTemporaryPassword(length = 14) {
    let password = "";
    for (let i = 0; i < length; i++) {
        password += CHARS[crypto.randomInt(CHARS.length)];
    }
    return password;
}

module.exports = generateTemporaryPassword;
