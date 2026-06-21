import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendSuccess, sendPaginated } from "../../../src/shared/responses/api-response.js";
import { httpStatus } from "../../../src/shared/errors/http-status.js";

describe("api-response unit tests", () => {
  const mockRes = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendSuccess", () => {
    it("UTX-SHARED-511 - sendSuccess sends a 200 OK json response with data and default message", () => {
      const data = { id: 123, name: "Bobby" };
      sendSuccess(mockRes as any, data);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
        message: "Thành công"
      });
    });

    it("UTX-SHARED-512 - sendSuccess sends a custom status code and custom message", () => {
      const data = { id: 456 };
      sendSuccess(mockRes as any, data, "Đã tạo mới", httpStatus.CREATED);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
        message: "Đã tạo mới"
      });
    });
  });

  describe("sendPaginated", () => {
    const mockPagination = {
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3
    };

    it("UTX-SHARED-513 - sendPaginated sends paginated array data with 200 OK default status", () => {
      const data = [{ id: 1 }, { id: 2 }];
      sendPaginated(mockRes as any, data, mockPagination);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
        pagination: mockPagination
      });
    });

    it("UTX-SHARED-514 - sendPaginated accepts and sends custom status code", () => {
      const data: any[] = [];
      sendPaginated(mockRes as any, data, mockPagination, httpStatus.NO_CONTENT);

      expect(mockRes.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
        pagination: mockPagination
      });
    });
  });
});
