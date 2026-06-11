import {
  applyVnpayIpnUpdate,
  findVnpayAttemptByTxnRef,
  type VnpayIpnUpdateResult
} from "./payments.repository.js";
import {
  getPaymentResultRedirectUrl,
  verifyVnpaySignature,
  type VnpayCallbackParams
} from "./vnpay.service.js";

export type VnpayIpnResponse = {
  RspCode: string;
  Message: string;
};

function isVnpaySuccess(params: VnpayCallbackParams): boolean {
  return params.vnp_ResponseCode === "00" && (params.vnp_TransactionStatus ?? "00") === "00";
}

export async function buildVnpayReturnRedirect(params: VnpayCallbackParams): Promise<string> {
  if (!verifyVnpaySignature(params)) {
    return getPaymentResultRedirectUrl("failed", null);
  }

  const providerTxnRef = params.vnp_TxnRef;
  if (!providerTxnRef) {
    return getPaymentResultRedirectUrl("failed", null);
  }

  const attempt = await findVnpayAttemptByTxnRef(providerTxnRef);
  const status = isVnpaySuccess(params) ? "success" : "failed";

  return getPaymentResultRedirectUrl(status, attempt?.payment_attempt_id ?? null);
}

export async function handleVnpayIpn(params: VnpayCallbackParams): Promise<VnpayIpnResponse> {
  if (!verifyVnpaySignature(params)) {
    return { RspCode: "97", Message: "Invalid signature" };
  }

  const providerTxnRef = params.vnp_TxnRef;
  if (!providerTxnRef) {
    return { RspCode: "01", Message: "Order not found" };
  }

  const amount = Number(params.vnp_Amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { RspCode: "04", Message: "Invalid amount" };
  }

  const responseCode = params.vnp_ResponseCode;
  if (!responseCode) {
    return { RspCode: "99", Message: "Unknown error" };
  }

  const transactionStatus = params.vnp_TransactionStatus ?? null;

  const result = await applyVnpayIpnUpdate({
    providerTxnRef,
    providerTransactionNo: params.vnp_TransactionNo ?? null,
    responseCode,
    transactionStatus,
    amount,
    isSuccessful: isVnpaySuccess(params),
    payload: params
  });

  return mapIpnResult(result);
}

function mapIpnResult(result: VnpayIpnUpdateResult): VnpayIpnResponse {
  if (result.outcome === "not_found") {
    return { RspCode: "01", Message: "Order not found" };
  }

  if (result.outcome === "already_success") {
    return { RspCode: "00", Message: "Confirm Success" };
  }

  if (result.outcome === "already_final") {
    return { RspCode: "00", Message: "Confirm Success" };
  }

  if (result.outcome === "amount_mismatch") {
    return { RspCode: "04", Message: "Invalid amount" };
  }

  return { RspCode: "00", Message: "Confirm Success" };
}
