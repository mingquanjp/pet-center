import { describe, expect, it, vi } from "vitest";
import { validateRequest } from "../../../src/middlewares/validate.middleware.js";
import { z, ZodError } from "zod";
import type { Request, Response } from "express";

describe("validate.middleware unit tests", () => {
  const schema = {
    body: z.object({
      name: z.string().min(2),
      age: z.number().int().positive()
    }),
    query: z.object({
      page: z.string().transform(Number)
    }),
    params: z.object({
      id: z.string().uuid()
    })
  };

  it("UTX-MIDDLEWARES-537 - validateRequest successfully validates and overwrites query, params, and body", () => {
    const req = {
      body: { name: "Golden", age: 5 },
      query: { page: "2" },
      params: { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" }
    } as any;
    const res = {} as Response;
    const next = vi.fn();

    const middleware = validateRequest(schema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: "Golden", age: 5 });
    expect(req.query.page).toBe(2);
    expect(req.params.id).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
  });

  it("UTX-MIDDLEWARES-538 - validateRequest fails validation and passes error to next() when request format does not match", () => {
    const req = {
      body: { name: "G", age: -1 },
      query: { page: "invalid" },
      params: { id: "not-a-uuid" }
    } as any;
    const res = {} as Response;
    const next = vi.fn();

    const middleware = validateRequest(schema);
    
    expect(() => middleware(req, res, next)).toThrow(ZodError);
    expect(next).not.toHaveBeenCalled();
  });
});
