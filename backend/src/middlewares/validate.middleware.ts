import type { RequestHandler } from "express";
import type { ZodType } from "zod";

type RequestSchemas = {
  params?: ZodType;
  query?: ZodType;
  body?: ZodType;
};

export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (req, _res, next) => {
    if (schemas.params) {
      Object.defineProperty(req, "params", {
        value: schemas.params.parse(req.params),
        configurable: true
      });
    }

    if (schemas.query) {
      Object.defineProperty(req, "query", {
        value: schemas.query.parse(req.query),
        configurable: true
      });
    }

    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }

    next();
  };
}
