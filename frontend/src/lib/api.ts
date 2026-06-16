const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";
const apiUrl = configuredApiUrl.replace(/\/$/, "");

type ApiErrorDetails = Array<{
  path?: string;
  message?: string;
}>;

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  stats?: unknown;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: ApiErrorDetails;
  };
};

type ApiRequestOptions = RequestInit & {
  cacheKey?: string;
  cacheTtlMs?: number;
};

type CachedApiEnvelope = {
  expiresAt: number;
  payload: ApiEnvelope<unknown>;
};

const apiCache = new Map<string, CachedApiEnvelope>();

export class ApiError extends Error {
  readonly code?: string;
  readonly details?: ApiErrorDetails;

  constructor(message: string, code?: string, details?: ApiErrorDetails) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("accessToken");
}

function buildCacheKey(path: string, method: string, token: string | null, cacheKey?: string): string {
  return `${token ?? "anonymous"}:${method}:${cacheKey ?? path}`;
}

export function clearApiCache(pathPrefix?: string): void {
  if (!pathPrefix) {
    apiCache.clear();
    return;
  }

  for (const key of apiCache.keys()) {
    if (key.includes(`:${pathPrefix}`)) {
      apiCache.delete(key);
    }
  }
}

export async function apiRequest<T>(path: string, init: ApiRequestOptions = {}): Promise<ApiEnvelope<T>> {
  const { cacheKey, cacheTtlMs = 0, ...requestInit } = init;
  const headers = new Headers(requestInit.headers);
  const token = getAccessToken();
  const method = (requestInit.method ?? "GET").toUpperCase();
  const isFormDataBody = typeof FormData !== "undefined" && requestInit.body instanceof FormData;
  const shouldUseCache = method === "GET" && cacheTtlMs > 0;
  const resolvedCacheKey = shouldUseCache ? buildCacheKey(path, method, token, cacheKey) : null;

  if (resolvedCacheKey) {
    const cached = apiCache.get(resolvedCacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.payload as ApiEnvelope<T>;
    }

    apiCache.delete(resolvedCacheKey);
  }

  if (!headers.has("Content-Type") && requestInit.body && !isFormDataBody) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...requestInit,
    headers,
  });
  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok) {
    const message = payload.error?.details?.[0]?.message ?? payload.error?.message ?? "Không thể kết nối đến máy chủ";
    throw new ApiError(message, payload.error?.code, payload.error?.details);
  }

  if (resolvedCacheKey) {
    apiCache.set(resolvedCacheKey, {
      expiresAt: Date.now() + cacheTtlMs,
      payload: payload as ApiEnvelope<unknown>,
    });
  }

  return payload;
}

export async function getApiHealth(){
    const reponse = await fetch(`${apiUrl}/health`);

    if (!reponse.ok) {
        throw new Error("Không thể kết nối đến API");
    }

    return await reponse.json();
}
