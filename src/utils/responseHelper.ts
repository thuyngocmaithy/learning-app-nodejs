// src/utils/responseHelper.ts
import { Response } from "express";

// Định nghĩa kiểu cho StatusCodes
type StatusCodes = number;

// Định nghĩa hàm getReasonPhrase
function getReasonPhrase(code: StatusCodes): string {
  // Implement logic to return reason phrase based on status code
  // This is a simplified version, you might want to expand this
  const phrases: { [key: number]: string } = {
    200: "OK",
    201: "Created",
    400: "Bad Request",
    401: "Unauthorized",
    404: "Not Found",
    500: "Internal Server Error",
  };
  return phrases[code] || "Unknown Status";
}

interface ResponseData {
  status: string;
  data: any;
  message: string;
}

// Hàm phản hồi
const response = async (
  res: Response,
  code: StatusCodes,
  status: string,
  data: any,
  message?: unknown | string,
): Promise<Response<ResponseData>> => {
  if (!message) {
    message = getReasonPhrase(code);
  }
  return res.status(code).json({
    status: status,
    data: data,
    message: message,
  });
};

export { response };
