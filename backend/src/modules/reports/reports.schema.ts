import { z } from "zod";
import {
  AdminReportTab,
  ReportCompareMode,
  ReportGroupBy,
  ReportPaymentMethodGroup,
  ReportTimeRange,
} from "./reports.types.js";

const ReportTimeRangeEnum = z.enum([
  "TODAY",
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "THIS_MONTH",
  "THIS_QUARTER",
  "THIS_YEAR",
  "CUSTOM",
]);

const ReportCompareModeEnum = z.enum([
  "NONE",
  "PREVIOUS_PERIOD",
  "SAME_PERIOD_LAST_MONTH",
]);

const ReportGroupByEnum = z.enum(["DAY", "WEEK", "MONTH"]);

const ReportPaymentMethodGroupEnum = z.enum(["ALL", "ONLINE", "COUNTER"]);

const AdminReportTabEnum = z.enum([
  "ALL",
  "REVENUE",
  "SERVICES",
  "BOARDING",
  "MEDICAL",
  "CUSTOMERS",
]);

export const getAdminReportsQuerySchema = z
  .object({
    timeRange: ReportTimeRangeEnum.optional().default("LAST_30_DAYS"),
    compareMode: ReportCompareModeEnum.optional().default("NONE"),
    groupBy: ReportGroupByEnum.optional().default("DAY"),
    paymentMethodGroup: ReportPaymentMethodGroupEnum.optional().default("ALL"),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    tab: AdminReportTabEnum.optional().default("ALL"),
  })
  .refine(
    (data) => {
      if (data.timeRange === "CUSTOM") {
        return !!data.fromDate && !!data.toDate;
      }
      return true;
    },
    {
      message: "fromDate and toDate are required when timeRange is CUSTOM",
      path: ["timeRange"],
    }
  )
  .refine(
    (data) => {
      if (data.fromDate && data.toDate) {
        return new Date(data.fromDate) <= new Date(data.toDate);
      }
      return true;
    },
    {
      message: "fromDate must be less than or equal to toDate",
      path: ["fromDate"],
    }
  );

export const exportAdminReportsSchema = z.object({
  timeRange: ReportTimeRangeEnum.optional().default("LAST_30_DAYS"),
  compareMode: ReportCompareModeEnum.optional().default("NONE"),
  groupBy: ReportGroupByEnum.optional().default("DAY"),
  paymentMethodGroup: ReportPaymentMethodGroupEnum.optional().default("ALL"),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  tab: AdminReportTabEnum.optional().default("ALL"),
  format: z.enum(["excel", "pdf"]).optional().default("excel"),
});
