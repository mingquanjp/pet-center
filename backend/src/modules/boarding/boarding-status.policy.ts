import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type { BoardingRecordStatus } from "./boarding.types.js";

const allowedTransitions: Record<BoardingRecordStatus, BoardingRecordStatus[]> = {
  pending: ["confirmed", "rejected", "cancelled"],
  confirmed: ["staying", "cancelled"],
  staying: ["checked_out"],
  checked_out: [],
  cancelled: [],
  rejected: []
};

export function assertBoardingTransition(
  currentStatus: BoardingRecordStatus,
  nextStatus: BoardingRecordStatus
): void {
  if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
    throw new AppError(
      "Trạng thái phiếu lưu trú không hợp lệ",
      "INVALID_BOARDING_STATUS",
      httpStatus.BAD_REQUEST
    );
  }
}
