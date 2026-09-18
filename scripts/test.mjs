import { spawnSync } from "node:child_process";

const result = spawnSync("npm", ["run", "typecheck"], {
  stdio: "inherit",
});
process.exitCode = result.status ?? 0;
