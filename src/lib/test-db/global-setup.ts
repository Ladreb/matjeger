import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const USER = "matjeger_test";
const PASSWORD = "matjeger_test";
const DATABASE = "matjeger_test";

function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as { port: number };
      server.close(() => resolve(port));
    });
  });
}

export function assertThrowawayUrl(url: string | undefined, port: number) {
  const parsed = url ? new URL(url) : null;
  const isThrowaway = parsed?.hostname === "127.0.0.1" && parsed.port === String(port) && parsed.pathname === `/${DATABASE}`;
  if (!isThrowaway) {
    throw new Error("Refusing to run migrations: DATABASE_URL is not the throwaway test database.");
  }
}

function applyMigrations(url: string) {
  try {
    execFileSync("npx", ["prisma", "migrate", "deploy"], { env: { ...process.env, DATABASE_URL: url }, stdio: "pipe", encoding: "utf8" });
  } catch (error) {
    const { stdout, stderr } = error as { stdout: string; stderr: string };
    throw new Error(`prisma migrate deploy failed on the throwaway database:\n${stdout}\n${stderr}`);
  }
}

export default async function startThrowawayDatabase() {
  const directory = mkdtempSync(join(tmpdir(), "matjeger-test-db-"));
  const port = await findFreePort();
  const postgres = new EmbeddedPostgres({
    databaseDir: join(directory, "data"),
    user: USER,
    password: PASSWORD,
    port,
    persistent: false,
    onLog: () => {},
  });

  const stop = async () => {
    await postgres.stop().catch(() => {});
    rmSync(directory, { recursive: true, force: true });
  };

  const stopThenExit = (signal: NodeJS.Signals) => {
    void stop().finally(() => process.exit(signal === "SIGINT" ? 130 : 143));
  };
  process.once("SIGINT", stopThenExit);
  process.once("SIGTERM", stopThenExit);

  try {
    await postgres.initialise();
    await postgres.start();
    await postgres.createDatabase(DATABASE);

    // Set unconditionally so the database URLs in the .env files can never be used by these tests.
    const url = `postgresql://${USER}:${PASSWORD}@127.0.0.1:${port}/${DATABASE}`;
    process.env.DATABASE_URL = url;
    assertThrowawayUrl(process.env.DATABASE_URL, port);
    applyMigrations(url);
  } catch (error) {
    await stop();
    throw error;
  }

  return async () => {
    process.off("SIGINT", stopThenExit);
    process.off("SIGTERM", stopThenExit);
    await stop();
  };
}
