import { createHmac } from "node:crypto";
import { env } from "../../config/env.js";

export type VnpayPaymentUrlInput = {
  txnRef: string;
  amount: number;
  orderInfo: string;
  orderType?: string;
  clientIp: string;
  createdAt?: Date;
};

type VnpayConfig = {
  paymentUrl: string;
  tmnCode: string;
  hashSecret: string;
  returnUrl: string;
  ipnUrl: string;
  expireMinutes: number;
};

export type VnpayCallbackParams = Record<string, string>;

const timeZone = "Asia/Ho_Chi_Minh";

function getVnpayConfig(): VnpayConfig {
  const config = {
    paymentUrl: env.VNPAY_PAYMENT_URL,
    tmnCode: env.VNPAY_TMN_CODE,
    hashSecret: env.VNPAY_HASH_SECRET,
    returnUrl: env.VNPAY_RETURN_URL,
    ipnUrl: env.VNPAY_IPN_URL,
    expireMinutes: env.VNPAY_PAYMENT_EXPIRE_MINUTES
  };

  if (
    !config.paymentUrl ||
    !config.tmnCode ||
    !config.hashSecret ||
    !config.returnUrl ||
    !config.ipnUrl ||
    !Number.isFinite(config.expireMinutes)
  ) {
    throw new Error("VNPAY_CONFIGURATION_MISSING");
  }

  return config;
}

function formatVnpayDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);

  const valueByType = new Map(parts.map((part) => [part.type, part.value]));

  return [
    valueByType.get("year"),
    valueByType.get("month"),
    valueByType.get("day"),
    valueByType.get("hour"),
    valueByType.get("minute"),
    valueByType.get("second")
  ].join("");
}

function encodeVnpayValue(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

function buildSignedQuery(params: Record<string, string>, hashSecret: string): string {
  const signData = buildSignData(params);
  const secureHash = createHmac("sha512", hashSecret).update(signData, "utf8").digest("hex");

  return `${signData}&vnp_SecureHash=${secureHash}`;
}

function buildSignData(params: Record<string, string>): string {
  const sortedKeys = Object.keys(params).sort();

  return sortedKeys
    .map((key) => `${encodeVnpayValue(key)}=${encodeVnpayValue(params[key])}`)
    .join("&");
}

export function buildVnpayPaymentUrl(input: VnpayPaymentUrlInput): {
  paymentUrl: string;
  expiresAt: Date;
} {
  const config = getVnpayConfig();
  const createdAt = input.createdAt ?? new Date();
  const expiresAt = new Date(createdAt.getTime() + config.expireMinutes * 60 * 1000);
  const amountInVnpayUnit = Math.round(input.amount * 100);

  const params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.tmnCode,
    vnp_Amount: String(amountInVnpayUnit),
    vnp_CurrCode: "VND",
    vnp_TxnRef: input.txnRef,
    vnp_OrderInfo: input.orderInfo,
    vnp_OrderType: input.orderType ?? "210000",
    vnp_Locale: "vn",
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: input.clientIp || "127.0.0.1",
    vnp_CreateDate: formatVnpayDate(createdAt),
    vnp_ExpireDate: formatVnpayDate(expiresAt)
  };

  return {
    paymentUrl: `${config.paymentUrl}?${buildSignedQuery(params, config.hashSecret)}`,
    expiresAt
  };
}

export function verifyVnpaySignature(params: VnpayCallbackParams): boolean {
  const config = getVnpayConfig();
  const secureHash = params.vnp_SecureHash;

  if (!secureHash) {
    return false;
  }

  const signedParams = { ...params };
  delete signedParams.vnp_SecureHash;
  delete signedParams.vnp_SecureHashType;

  const signData = buildSignData(signedParams);
  const expectedHash = createHmac("sha512", config.hashSecret).update(signData, "utf8").digest("hex");

  return secureHash.toLowerCase() === expectedHash.toLowerCase();
}

export function getPaymentResultRedirectUrl(status: "success" | "failed", attemptId: string | null): string {
  if (!env.FRONTEND_BASE_URL) {
    throw new Error("VNPAY_CONFIGURATION_MISSING");
  }

  const redirectUrl = new URL("/owner/payment/result", env.FRONTEND_BASE_URL);
  redirectUrl.searchParams.set("status", status);

  if (attemptId) {
    redirectUrl.searchParams.set("attemptId", attemptId);
  }

  return redirectUrl.toString();
}
