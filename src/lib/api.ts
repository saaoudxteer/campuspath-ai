import { snapshotSchema, type Snapshot } from "./schema";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function request(
  path: string,
  body?: unknown,
  method?: string,
): Promise<unknown> {
  const response = await fetch("/api" + path, {
    method: method ?? (body === undefined ? "GET" : "POST"),
    credentials: "same-origin",
    headers:
      body instanceof FormData
        ? undefined
        : body === undefined
          ? undefined
          : { "Content-Type": "application/json" },
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload?.detail;
    throw new ApiError(
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail
              .map((e: { msg?: string }) => e.msg ?? "Champ invalide")
              .join(" · ")
          : "Le service est temporairement indisponible. Réessayez.",
      response.status,
    );
  }
  return payload;
}
export async function getSnapshot(
  path = "/state",
  body?: unknown,
  method?: string,
): Promise<Snapshot> {
  return snapshotSchema.parse(await request(path, body, method));
}
let bootstrapPromise: Promise<Snapshot> | null = null;
export function bootstrap() {
  if (!bootstrapPromise)
    bootstrapPromise = getSnapshot()
      .catch(async (error: unknown) => {
        if (
          error instanceof ApiError &&
          error.status === 401 &&
          !sessionStorage.getItem("campuspath-logged-out")
        ) {
          const health = (await request("/health")) as { demo_mode: boolean };
          if (health.demo_mode) return getSnapshot("/auth/demo", {});
        }
        throw error;
      })
      .finally(() => {
        bootstrapPromise = null;
      });
  return bootstrapPromise;
}
