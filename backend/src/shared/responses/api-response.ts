import type { Response } from "express";
import type { HttpStatus } from "../errors/http-status.js";
import { httpStatus } from "../errors/http-status.js";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "OK",
  statusCode: HttpStatus = httpStatus.OK
): void {
  res.status(statusCode).json({
    success: true,
    data,
    message
  });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: Pagination,
  statusCode: HttpStatus = httpStatus.OK
): void {
  res.status(statusCode).json({
    success: true,
    data,
    pagination
  });
}
