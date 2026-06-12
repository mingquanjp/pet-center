import { z } from "zod";

const vnpayQueryValueSchema = z.union([z.string(), z.array(z.string())]);

export const vnpayCallbackQuerySchema = z
  .object({
    vnp_TxnRef: z.string().optional(),
    vnp_Amount: z.string().optional(),
    vnp_ResponseCode: z.string().optional(),
    vnp_TransactionStatus: z.string().optional(),
    vnp_TransactionNo: z.string().optional(),
    vnp_SecureHash: z.string().optional(),
    vnp_SecureHashType: z.string().optional()
  })
  .catchall(vnpayQueryValueSchema);
