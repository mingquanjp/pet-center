export type InvoicePaymentStatus =
  | "PAID"
  | "PENDING_PAYMENT"
  | "OVERDUE"
  | "CANCELLED"
  | "REFUNDED"
  | "DRAFT";

export type InvoiceServiceType =
  | "MEDICAL"
  | "GROOMING"
  | "BOARDING"
  | "PRESCRIPTION"
  | "OTHER";

export type InvoicePaymentOption =
  | "ONLINE"
  | "AT_COUNTER";

export interface StaffInvoice {
  id: string;
  invoiceCode: string;
  title: string;
  pet: {
    id: string;
    name: string;
  };
  owner: {
    id: string;
    fullName: string;
  };
  serviceType: InvoiceServiceType;
  serviceName: string;
  serviceDate?: string;
  issuedAt: string;
  paymentOption: InvoicePaymentOption;
  paymentStatus: InvoicePaymentStatus;
  invoiceStatus: InvoicePaymentStatus;
  totalAmount: number;
  currency: "VND";
}

export type StaffInvoiceStatusFilter =
  | "ALL"
  | "PENDING_PAYMENT"
  | "PAID"
  | "OVERDUE";

export type StaffInvoiceServiceFilter =
  | "ALL"
  | "MEDICAL"
  | "GROOMING"
  | "BOARDING"
  | "PRESCRIPTION";

export type StaffInvoiceTimeFilter =
  | "TODAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "ALL";

export interface StaffInvoiceFilters {
  search: string;
  status: StaffInvoiceStatusFilter;
  serviceType: StaffInvoiceServiceFilter;
  timeRange: StaffInvoiceTimeFilter;
}

export interface StaffInvoicesResult {
  data: StaffInvoice[];
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  isFetchingNextPage: boolean;
  loadMore: () => void;
}
