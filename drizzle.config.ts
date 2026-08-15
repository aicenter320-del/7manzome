import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

import { resolveFileDatabaseUrl } from "./src/shared/config/database-url";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/server/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: resolveFileDatabaseUrl(process.env.DATABASE_URL ?? "file:./data/haft.db"),
  },
  verbose: true,
  strict: true,
});
