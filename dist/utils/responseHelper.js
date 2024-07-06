"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.response = void 0;
// Định nghĩa hàm getReasonPhrase
function getReasonPhrase(code) {
    // Implement logic to return reason phrase based on status code
    // This is a simplified version, you might want to expand this
    const phrases = {
        200: "OK",
        201: "Created",
        400: "Bad Request",
        401: "Unauthorized",
        404: "Not Found",
        500: "Internal Server Error",
    };
    return phrases[code] || "Unknown Status";
}
const response = async (res, code, status, data, message) => {
    if (!message) {
        message = getReasonPhrase(code);
    }
    return res.status(code).json({
        status: status,
        data: data,
        message: message,
    });
};
exports.response = response;
