export interface StaffInvoiceLineRow {
  id: string;
  description: string;
  service_type: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  line_amount: number;
}

export interface StaffInvoiceDetailRow {
  id: string;
  invoice_code: string;
  invoice_status: string;
  payment_option: string;
  issued_at: Date;
  payment_due_at: Date | null;
  paid_at: Date | null;
  pet_id: string;
  pet_name: string;
  pet_image_url: string | null;
  owner_id: string;
  owner_name: string;
  subtotal_amount: number;
  discount_amount: number;
  surcharge_amount: number;
  total_amount: number;
}

export interface StaffInvoiceListItemRow {
  id: string;
  invoice_code: string;
  pet_id: string;
  pet_name: string;
  pet_image_url: string | null;
  owner_id: string;
  owner_name: string;
  issued_at: Date;
  payment_option: string;
  invoice_status: string;
  payment_due_at: Date | null;
  total_amount: number;
  first_line_desc: string | null;
  first_line_source: string | null;
  service_time: Date | null;
}

export interface OwnerInvoiceListItemRow {
  id: string;
  invoice_code: string;
  pet_id: string;
  pet_name: string;
  pet_image_url: string | null;
  issued_at: Date;
  payment_option: string;
  invoice_status: string;
  payment_due_at: Date | null;
  paid_at: Date | null;
  total_amount: number;
  first_line_desc: string | null;
  first_line_source: string | null;
}

export interface OwnerInvoicesListResult {
  rows: OwnerInvoiceListItemRow[];
  total: number;
}
