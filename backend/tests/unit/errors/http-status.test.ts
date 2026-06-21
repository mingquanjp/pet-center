import { describe, expect, it } from "vitest";
import { httpStatus } from "../../../src/shared/errors/http-status.js";

describe("httpStatus unit tests", () => {
  it("UTX-SHARED-509 - httpStatus object has correct standard HTTP code values", () => {
    expect(httpStatus.OK).toBe(200);
    expect(httpStatus.CREATED).toBe(201);
    expect(httpStatus.NO_CONTENT).toBe(204);
    expect(httpStatus.BAD_REQUEST).toBe(400);
    expect(httpStatus.UNAUTHORIZED).toBe(401);
    expect(httpStatus.FORBIDDEN).toBe(403);
    expect(httpStatus.NOT_FOUND).toBe(404);
  });

  it("UTX-SHARED-510 - httpStatus object has correct error code values", () => {
    expect(httpStatus.CONFLICT).toBe(409);
    expect(httpStatus.UNPROCESSABLE_ENTITY).toBe(422);
    expect(httpStatus.SERVICE_UNAVAILABLE).toBe(503);
    expect(httpStatus.INTERNAL_SERVER_ERROR).toBe(500);
  });
});
