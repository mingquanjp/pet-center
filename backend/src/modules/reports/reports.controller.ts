import type { Request, Response, NextFunction } from "express";
import { AdminReportQueryDto } from "./reports.types.js";
import { reportsService } from "./reports.service.js";

export const reportsController = {
  getAdminReportsController: async (
    req: Request<unknown, unknown, unknown, AdminReportQueryDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await reportsService.getAdminReports(req.query);
      res.status(200).json({
        success: true,
        data,
        message: "Lấy báo cáo thành công.",
      });
    } catch (error) {
      next(error);
    }
  },

  exportAdminReportsController: async (
    req: Request<unknown, unknown, AdminReportQueryDto & { format: "excel" | "pdf" }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          status: "pending",
          format: req.body.format,
          message: "Chức năng xuất báo cáo sẽ được hoàn thiện sau.",
        },
        message: "Đã nhận yêu cầu xuất báo cáo.",
      });
    } catch (error) {
      next(error);
    }
  },
};
