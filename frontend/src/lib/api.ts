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

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
  });
  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok) {
    const message = payload.error?.details?.[0]?.message ?? payload.error?.message ?? "Không thể kết nối đến máy chủ";
    throw new ApiError(message, payload.error?.code, payload.error?.details);
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
