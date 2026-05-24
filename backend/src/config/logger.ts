import type { IncomingMessage, ServerResponse } from "node:http";
import type { Options } from "pino-http";

function isSwaggerAsset(req: IncomingMessage): boolean {
  const url = getRequestUrl(req);

  return (
    url.startsWith("/api-docs/") &&
    !url.endsWith("/api-docs/") &&
    url !== "/api-docs"
  );
}

function getRequestUrl(req: IncomingMessage): string {
  return "originalUrl" in req && typeof req.originalUrl === "string"
    ? req.originalUrl
    : req.url ?? "";
}

function getRequestLog(req: IncomingMessage) {
  return {
    method: req.method,
    url: getRequestUrl(req)
  };
}

function getResponseLog(res: ServerResponse) {
  return {
    statusCode: res.statusCode
  };
}

export const httpLoggerOptions: Options = {
  autoLogging: {
    ignore: isSwaggerAsset
  },
  serializers: {
    req: getRequestLog,
    res: getResponseLog,
    err(error: Error) {
      return {
        name: error.name,
        message: error.message
      };
    }
  },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['set-cookie']",
      "res.headers['set-cookie']"
    ],
    remove: true
  },
  customSuccessMessage(req, res) {
    return `${req.method} ${getRequestUrl(req)} ${res.statusCode}`;
  },
  customErrorMessage(req, res, error) {
    return `${req.method} ${getRequestUrl(req)} ${res.statusCode} ${error.message}`;
  }
};
