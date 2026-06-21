import { describe, expect, it } from "vitest";
import { AppError } from "../../../src/shared/errors/app-error.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";

describe("AppError unit tests", () => {
  it("UTX-SHARED-507 - AppError instantiates correctly with default parameters", () => {
    const error = new AppError("Test message");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("Test message");
    expect(error.name).toBe("AppError");
    expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(error.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(error.details).toBeUndefined();
  });

  it("UTX-SHARED-508 - AppError instantiates correctly with custom parameters", () => {
    const detailsObj = { reason: "validation_failed" };
    const error = new AppError(
      "Custom error",
      "CUSTOM_CODE",
      httpStatus.BAD_REQUEST,
      detailsObj
    );

    expect(error.message).toBe("Custom error");
    expect(error.code).toBe("CUSTOM_CODE");
    expect(error.statusCode).toBe(httpStatus.BAD_REQUEST);
    expect(error.details).toEqual(detailsObj);
  });
});
