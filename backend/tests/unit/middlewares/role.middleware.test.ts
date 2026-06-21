import { describe, expect, it, vi } from "vitest";
import { requireRole } from "../../../src/middlewares/role.middleware.js";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";
import type { Request, Response } from "express";

describe("role.middleware unit tests", () => {
  it("UTX-MIDDLEWARES-535 - requireRole calls next() if user role matches allowed roles", () => {
    const req = {
      user: {
        userId: "usr_123",
        role: "Owner" as const,
        email: "owner@gmail.com"
      }
    } as any;
    const res = {} as Response;
    const next = vi.fn();

    const middleware = requireRole("Owner", "Staff");
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("UTX-MIDDLEWARES-536 - requireRole throws AppError if req.user is missing or role is not allowed", () => {
    const res = {} as Response;

    // 1. Missing user (Unauthorized)
    const reqNoUser = {} as any;
    const nextUnauthorized = vi.fn();
    const middleware = requireRole("Owner");
    
    middleware(reqNoUser, res, nextUnauthorized);

    expect(nextUnauthorized).toHaveBeenCalledTimes(1);
    const errorAuth = nextUnauthorized.mock.calls[0][0] as AppError;
    expect(errorAuth).toBeInstanceOf(AppError);
    expect(errorAuth.message).toBe("Vui lòng đăng nhập để tiếp tục");
    expect(errorAuth.code).toBe("UNAUTHORIZED");
    expect(errorAuth.statusCode).toBe(httpStatus.UNAUTHORIZED);

    // 2. Forbidden role
    const reqWrongRole = {
      user: {
        userId: "usr_123",
        role: "Owner" as const,
        email: "owner@gmail.com"
      }
    } as any;
    const nextForbidden = vi.fn();
    const middlewareDoctor = requireRole("Doctor", "Staff");

    middlewareDoctor(reqWrongRole, res, nextForbidden);

    expect(nextForbidden).toHaveBeenCalledTimes(1);
    const errorForbidden = nextForbidden.mock.calls[0][0] as AppError;
    expect(errorForbidden).toBeInstanceOf(AppError);
    expect(errorForbidden.message).toBe("Bạn không có quyền thực hiện thao tác này");
    expect(errorForbidden.code).toBe("FORBIDDEN");
    expect(errorForbidden.statusCode).toBe(httpStatus.FORBIDDEN);
  });
});
