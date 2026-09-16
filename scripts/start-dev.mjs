import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (existsSync(resolve(root, ".env")))
  process.loadEnvFile(resolve(root, ".env"));
const python = resolve(
  root,
  process.platform === "win32"
    ? ".venv/Scripts/python.exe"
    : ".venv/bin/python",
);
if (
  !existsSync(python) ||
  !existsSync(resolve(root, "node_modules/next/dist/bin/next"))
) {
  throw new Error(
    "Install dependencies first: npm ci; python -m venv .venv; then pip install -r backend/requirements.txt using that venv.",
  );
}
const runtime = resolve(root, "backend/data/runtime");
mkdirSync(runtime, { recursive: true });
const api = spawn(
  python,
  [
    "-m",
    "uvicorn",
    "app.main:app",
    "--host",
    "127.0.0.1",
    "--port",
    "8000",
    "--reload",
  ],
  {
    cwd: resolve(root, "backend"),
    stdio: "inherit",
    windowsHide: true,
    env: process.env,
  },
);
const web = spawn(
  process.execPath,
  [
    resolve(root, "node_modules/next/dist/bin/next"),
    "dev",
    "--hostname",
    "127.0.0.1",
  ],
  { cwd: root, stdio: "inherit", windowsHide: true, env: process.env },
);
writeFileSync(
  resolve(runtime, "processes.json"),
  JSON.stringify(
    { root, runner: process.pid, api: api.pid, web: web.pid },
    null,
    2,
  ),
);
let exiting = false;
function stop(code = 0) {
  if (exiting) return;
  exiting = true;
  api.kill();
  web.kill();
  process.exitCode = code;
}
for (const child of [api, web]) {
  child.on("error", (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!exiting) stop(code ?? 1);
  });
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
console.log(
  "CampusPath: http://127.0.0.1:3000 — API: http://127.0.0.1:8000/docs",
);
