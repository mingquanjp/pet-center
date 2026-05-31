import { StaffBoardingRoomTypeOption, StaffBoardingCreateInvoicePreview } from "../types/boarding.types";

export function calculateBoardingDays(checkInDate: string, checkOutDate: string): number {
  if (!checkInDate || !checkOutDate) return 0;
  
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  // If dates are invalid
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 0;

  // Set time to start of day to avoid timezone issues
  checkIn.setHours(0, 0, 0, 0);
  checkOut.setHours(0, 0, 0, 0);

  const timeDiff = checkOut.getTime() - checkIn.getTime();
  const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  // Total days must be at least 1, and check-out must be after check-in
  if (days <= 0) return 0;
  
  return days;
}

interface CalculateBoardingInvoicePreviewParams {
  roomType: StaffBoardingRoomTypeOption | null;
  checkInDate: string;
  checkOutDate: string;
}

export function calculateBoardingInvoicePreview({
  roomType,
  checkInDate,
  checkOutDate,
}: CalculateBoardingInvoicePreviewParams): Omit<StaffBoardingCreateInvoicePreview, 'invoiceId' | 'invoiceCode'> | null {
  if (!roomType || !checkInDate || !checkOutDate) return null;

  const totalDays = calculateBoardingDays(checkInDate, checkOutDate);
  if (totalDays <= 0) return null;

  const pricePerDay = roomType.pricePerDay;
  const subtotal = pricePerDay * totalDays;
  const discountAmount = 0;
  const taxAmount = 0;
  const totalAmount = subtotal - discountAmount + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    currency: "VND",
    totalDays,
    pricePerDay,
    paymentMethod: "AT_COUNTER",
    paymentStatus: "PAID",
  };
}
