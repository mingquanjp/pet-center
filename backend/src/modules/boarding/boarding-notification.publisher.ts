import {
  notifyBoardingCreated,
  notifyBoardingConfirmed,
  notifyBoardingRejected,
  notifyBoardingCancelled,
  notifyBoardingCheckedIn,
  notifyBoardingUpdateCreated
} from "../notifications/notification-events.js";

export const boardingNotificationPublisher = {
  boardingCreated: (boardingRecordId: string) => notifyBoardingCreated(boardingRecordId),
  boardingConfirmed: (boardingRecordId: string) => notifyBoardingConfirmed(boardingRecordId),
  boardingRejected: (boardingRecordId: string) => notifyBoardingRejected(boardingRecordId),
  boardingCancelled: (boardingRecordId: string) => notifyBoardingCancelled(boardingRecordId),
  boardingCheckedIn: (boardingRecordId: string) => notifyBoardingCheckedIn(boardingRecordId),
  boardingUpdateCreated: (boardingRecordId: string) => notifyBoardingUpdateCreated(boardingRecordId)
};
