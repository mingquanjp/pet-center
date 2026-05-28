import { createHash, createHmac } from "node:crypto";
import { isIP } from "node:net";
import qs from "qs";
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
    paymentUrl: env.VNPAY_PAYMENT_URL.trim(),
    tmnCode: env.VNPAY_TMN_CODE.trim(),
    hashSecret: env.VNPAY_HASH_SECRET.trim(),
    returnUrl: env.VNPAY_RETURN_URL.trim(),
    ipnUrl: env.VNPAY_IPN_URL.trim(),
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

function normalizeOrderInfo(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 255);
}

function normalizeClientIp(value: string): string {
  const candidate = value.split(",")[0]?.trim().replace(/^::ffff:/, "") ?? "";

  if (isIP(candidate) === 4) {
    return candidate;
  }

  return "127.0.0.1";
}

function buildSignedQuery(params: Record<string, string>, hashSecret: string): string {
  const sortedParams = sortObject(params);
  const signData = stringifyVnpayParams(sortedParams);
  const secureHash = createHmac("sha512", hashSecret).update(signData, "utf8").digest("hex");

  logVnpayDebug("build_payment_url", {
    signData,
    secureHash,
    params: sortedParams,
    hashSecret
  });

  return stringifyVnpayParams({
    ...sortedParams,
    vnp_SecureHash: secureHash
  });
}

function sortObject(params: Record<string, string>): Record<string, string> {
  const sortedParams: Record<string, string> = {};

  Object.keys(params)
    .filter((key) => params[key] !== "")
    .map((key) => encodeURIComponent(key))
    .sort()
    .forEach((encodedKey) => {
      const originalKey = decodeURIComponent(encodedKey);
      sortedParams[encodedKey] = encodeVnpayValue(params[originalKey]);
    });

  return sortedParams;
}

function stringifyVnpayParams(sortedParams: Record<string, string>): string {
  return qs.stringify(sortedParams, { encode: false });
}

function hashSecretFingerprint(hashSecret: string): string {
  return createHash("sha256").update(hashSecret, "utf8").digest("hex").slice(0, 12);
}

function logVnpayDebug(
  event: string,
  data: {
    signData: string;
    secureHash: string;
    params: Record<string, string>;
    hashSecret: string;
  }
): void {
  if (!env.VNPAY_DEBUG_LOG) {
    return;
  }

  console.info(
    JSON.stringify({
      event: `vnpay_${event}`,
      tmnCode: data.params.vnp_TmnCode,
      txnRef: data.params.vnp_TxnRef,
      amount: data.params.vnp_Amount,
      createDate: data.params.vnp_CreateDate,
      expireDate: data.params.vnp_ExpireDate,
      orderInfo: data.params.vnp_OrderInfo,
      ipAddr: data.params.vnp_IpAddr,
      returnUrl: data.params.vnp_ReturnUrl,
      signData: data.signData,
      secureHash: data.secureHash,
      hashSecretLength: data.hashSecret.length,
      hashSecretFingerprint: hashSecretFingerprint(data.hashSecret)
    })
  );
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
    vnp_OrderInfo: normalizeOrderInfo(input.orderInfo),
    vnp_OrderType: input.orderType ?? "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: normalizeClientIp(input.clientIp),
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

  const signData = stringifyVnpayParams(sortObject(signedParams));
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
