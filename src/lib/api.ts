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
    signal: AbortSignal.timeout(20000),
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
  }).catch(() => {
    throw new ApiError("Connexion interrompue ou trop lente. Vérifiez votre connexion et réessayez.", 0);
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
    // Only the server session determines authentication. A demo is an explicit choice.
    bootstrapPromise = getSnapshot()
      .finally(() => {
        bootstrapPromise = null;
      });
  return bootstrapPromise;
}
