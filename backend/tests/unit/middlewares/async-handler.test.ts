import { describe, expect, it, vi } from "vitest";
import { asyncHandler } from "../../../src/middlewares/async-handler.js";
import type { Request, Response } from "express";

describe("asyncHandler middleware unit tests", () => {
  it("UTX-MIDDLEWARES-533 - asyncHandler runs wrapped handler and handles successful resolution", async () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn();

    const mockHandler = vi.fn().mockResolvedValue("success");
    const wrapped = asyncHandler(mockHandler);

    wrapped(req, res, next);

    // Wait for promise microtasks to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockHandler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it("UTX-MIDDLEWARES-534 - asyncHandler catches errors and forwards them to next()", async () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn();

    const error = new Error("Async handler failed");
    const mockHandler = vi.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(mockHandler);

    wrapped(req, res, next);

    // Wait for promise microtasks to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockHandler).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
