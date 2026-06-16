export function mapInvoiceStatus(status: string, dueDate: Date | null, paymentOption: string): string {
    if (paymentOption === "online") {
    return "PAID";
    }
    if (status === "pending_payment" && dueDate && new Date(dueDate).getTime() < Date.now()) {
    return "OVERDUE";
    }
    return status.toUpperCase();
}

export function mapOwnerInvoiceStatus(status: string, dueDate: Date | null, paidAt: Date | null): string {
    if (status === "paid" || paidAt) {
    return "PAID";
    }
    if (status === "pending_payment" && dueDate && new Date(dueDate).getTime() < Date.now()) {
    return "OVERDUE";
    }
    return status.toUpperCase();
}

export function getOwnerInvoiceNote(status: string) {
    if (status === "PAID") return "Hóa đơn đã được thanh toán thành công.";
    if (status === "PENDING_PAYMENT") return "Vui lòng thanh toán tại trung tâm.";
    if (status === "OVERDUE") return "Hóa đơn đã quá hạn thanh toán.";
    if (status === "CANCELLED") return "Hóa đơn đã được hủy.";
    return "Hóa đơn đang ở trạng thái nháp.";
}

export function mapPaymentOption(opt: string): string {
    return opt === "online" ? "ONLINE" : "AT_COUNTER";
}
