import { describe, expect, it } from "vitest";
import {
  getStatusLabel,
  getPaymentMethodLabel
} from "../../../src/modules/boarding/boarding.mapper.js";

describe("boarding.mapper unit tests", () => {
  it("UTX-BOARDING-125 - getStatusLabel maps boarding status to Vietnamese display label", () => {
    expect(getStatusLabel("pending")).toBe("Chờ xác nhận");
    expect(getStatusLabel("confirmed")).toBe("Chờ check-in");
    expect(getStatusLabel("staying")).toBe("Đang lưu trú");
    expect(getStatusLabel("checked_out")).toBe("Hoàn tất");
    expect(getStatusLabel("cancelled")).toBe("Đã hủy");
    expect(getStatusLabel("rejected")).toBe("Từ chối");
  });

  it("UTX-BOARDING-126 - getPaymentMethodLabel maps payment option to Vietnamese display label", () => {
    expect(getPaymentMethodLabel("online")).toBe("Thanh toán online");
    expect(getPaymentMethodLabel("counter")).toBe("Thanh toán tại quầy");
    expect(getPaymentMethodLabel(null)).toBe("Chưa cập nhật");
  });
});
