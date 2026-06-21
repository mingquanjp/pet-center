import { describe, expect, it } from "vitest";
import {
  formatMoney,
  formatStartingPrice,
  formatDuration,
  getSpeciesLabel,
  getTicketStatusLabel
} from "../../../src/modules/grooming/grooming.mapper.js";

describe("grooming.mapper unit tests", () => {
  it("UTX-GROOMING-230 - formatMoney formats number to Vietnamese style currency representation", () => {
    expect(formatMoney(150000)).toBe("150.000");
    expect(formatMoney(0)).toBe("0");
    expect(formatMoney(2500000)).toBe("2.500.000");
  });

  it("UTX-GROOMING-231 - formatStartingPrice formats base price with text prefix and suffix", () => {
    expect(formatStartingPrice(150000)).toBe("Từ 150.000 VNĐ");
    expect(formatStartingPrice(0)).toBe("Từ 0 VNĐ");
  });

  it("UTX-GROOMING-232 - formatDuration formats duration in minutes to hours/minutes representation", () => {
    expect(formatDuration(null)).toBe("Chưa cập nhật");
    expect(formatDuration(45)).toBe("45 phút");
    expect(formatDuration(60)).toBe("1 giờ");
    expect(formatDuration(120)).toBe("2 giờ");
    expect(formatDuration(90)).toBe("1 giờ 30 phút");
  });

  it("UTX-GROOMING-233 - getSpeciesLabel maps DB species string to Vietnamese display label", () => {
    expect(getSpeciesLabel("Dog")).toBe("Chó");
    expect(getSpeciesLabel("Cat")).toBe("Mèo");
    expect(getSpeciesLabel("Other")).toBe("Khác");
  });

  it("UTX-GROOMING-234 - getTicketStatusLabel maps ticket status to Vietnamese display label", () => {
    expect(getTicketStatusLabel("pending_payment")).toBe("Chờ thanh toán");
    expect(getTicketStatusLabel("pending")).toBe("Chờ tiếp nhận");
    expect(getTicketStatusLabel("waiting")).toBe("Đã tiếp nhận");
    expect(getTicketStatusLabel("in_progress")).toBe("Đang thực hiện");
    expect(getTicketStatusLabel("completed")).toBe("Hoàn thành");
    expect(getTicketStatusLabel("cancelled")).toBe("Đã hủy");
  });
});
