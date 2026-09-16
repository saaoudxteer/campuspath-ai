import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 10000);
if (!Number.isInteger(port) || port < 1 || port > 65535 || port === 8000) {
  throw new Error(
    "PORT must be a valid web port other than the internal API port 8000.",
  );
}
const externalUrl =
  process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_APP_URL;
if (!externalUrl && !process.env.ALLOWED_ORIGINS) {
  throw new Error(
    "Set PUBLIC_APP_URL or ALLOWED_ORIGINS before starting the hosted application.",
  );
}
if (externalUrl) {
  const origin = new URL(externalUrl);
  if (
    origin.protocol !== "https:" &&
    !(
      origin.protocol === "http:" &&
      ["127.0.0.1", "localhost"].includes(origin.hostname)
    )
  ) {
    throw new Error("The public application URL must use HTTPS.");
  }
  process.env.ALLOWED_ORIGINS = origin.origin;
}
const python =
  process.env.CAMPUSPATH_PYTHON ||
  resolve(
    root,
    process.platform === "win32"
      ? ".venv/Scripts/python.exe"
      : ".venv/bin/python",
  );
const webEntry =
  process.env.CAMPUSPATH_WEB_ENTRY ||
  resolve(root, ".next/standalone/server.js");
if (!existsSync(webEntry))
  throw new Error("Build the standalone Next.js server before starting.");

const children = [];
let stopping = false;
let killTimer;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children)
    if (child.exitCode === null) child.kill("SIGTERM");
  killTimer = setTimeout(() => {
    for (const child of children)
      if (child.exitCode === null) child.kill("SIGKILL");
  }, 8000);
  killTimer.unref();
}
function start(command, args, options) {
  const child = spawn(command, args, {
    stdio: "inherit",
    windowsHide: true,
    ...options,
  });
  children.push(child);
  child.on("error", (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping) stop(code || 1);
    if (children.every((process) => process.exitCode !== null))
      clearTimeout(killTimer);
  });
  return child;
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());

// Fail before launching if another app owns the internal API port.
await new Promise((resolve, reject) => {
  const probe = createServer();
  probe.once("error", reject);
  probe.listen(8000, "127.0.0.1", () => probe.close(resolve));
});
start(
  python,
  [
    "-m",
    "uvicorn",
    "app.main:app",
    "--host",
    "127.0.0.1",
    "--port",
    "8000",
    "--no-proxy-headers",
  ],
  { cwd: resolve(root, "backend"), env: process.env },
);
let ready = false;
for (let attempt = 0; attempt < 100 && !stopping; attempt++) {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/health", {
      signal: AbortSignal.timeout(1000),
    });
    if (response.ok) {
      ready = true;
      break;
    }
  } catch {
    /* API startup is still in progress. */
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
}
if (!ready) {
  console.error(
    "API startup failed; the web server will not start without it.",
  );
  stop(1);
} else if (!stopping) {
  start(process.execPath, [webEntry], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      HOSTNAME: process.env.CAMPUSPATH_WEB_HOST || "0.0.0.0",
      NODE_ENV: "production",
    },
  });
  console.log(`CampusPath web server starting on port ${port}.`);
}
