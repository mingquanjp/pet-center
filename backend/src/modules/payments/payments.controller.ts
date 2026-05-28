import type { Request, Response } from "express";
import type { VnpayCallbackParams } from "./vnpay.service.js";
import * as paymentsService from "./payments.service.js";

function normalizeVnpayQuery(query: Request["query"]): VnpayCallbackParams {
  const params: VnpayCallbackParams = {};

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      const firstValue = value[0];
      if (firstValue !== undefined) {
        params[key] = String(firstValue);
      }
      continue;
    }

    if (value !== undefined) {
      params[key] = String(value);
    }
  }

  return params;
}

export async function handleVnpayReturn(req: Request, res: Response): Promise<void> {
  const redirectUrl = await paymentsService.buildVnpayReturnRedirect(normalizeVnpayQuery(req.query));

  res.redirect(302, redirectUrl);
}

export async function handleVnpayIpn(req: Request, res: Response): Promise<void> {
  const response = await paymentsService.handleVnpayIpn(normalizeVnpayQuery(req.query));

  res.status(200).json(response);
}
