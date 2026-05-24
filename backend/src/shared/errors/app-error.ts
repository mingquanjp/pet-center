import { httpStatus, type HttpStatus } from "./http-status.js";

export class AppError extends Error {
  readonly code: string;
  readonly statusCode: HttpStatus;
  readonly details?: unknown;

  constructor(message: string, code = "INTERNAL_SERVER_ERROR", statusCode: HttpStatus = httpStatus.INTERNAL_SERVER_ERROR, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}
