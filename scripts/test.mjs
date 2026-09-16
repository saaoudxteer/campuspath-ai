import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const python = resolve(
  root,
  process.platform === "win32"
    ? ".venv/Scripts/python.exe"
    : ".venv/bin/python",
);
const result = spawnSync(python, ["-m", "pytest", "-q"], {
  cwd: resolve(root, "backend"),
  stdio: "inherit",
});
process.exitCode = result.status ?? 1;
