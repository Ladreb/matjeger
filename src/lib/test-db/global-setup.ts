import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const USER = "matjeger_test";
const PASSWORD = "matjeger_test";
const DATABASE = "matjeger_test";
const FOLDER_PREFIX = "matjeger-test-db-";
const STALE_FOLDER_MS = 60 * 60 * 1000;

// An interrupt can outrun the cleanup, so the next run removes what it left behind. No real run lasts an hour.
function removeStaleFolders() {
  for (const name of readdirSync(tmpdir())) {
    const folder = join(tmpdir(), name);
    if (name.startsWith(FOLDER_PREFIX) && Date.now() - statSync(folder).mtimeMs > STALE_FOLDER_MS) {
      rmSync(folder, { recursive: true, force: true });
    }
  }
}

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

function applyMigrations(url: string, port: number) {
  const env = { ...process.env, DATABASE_URL: url };
  assertThrowawayUrl(env.DATABASE_URL, port);
  try {
    execFileSync("npx", ["prisma", "migrate", "deploy"], { env, stdio: "pipe", encoding: "utf8" });
  } catch (error) {
    const { stdout, stderr } = error as { stdout: string; stderr: string };
    throw new Error(`prisma migrate deploy failed on the throwaway database:\n${stdout}\n${stderr}`);
  }
}

export default async function startThrowawayDatabase() {
  removeStaleFolders();
  const directory = mkdtempSync(join(tmpdir(), FOLDER_PREFIX));
  const port = await findFreePort();
  const postgres = new EmbeddedPostgres({
    databaseDir: join(directory, "data"),
    user: USER,
    password: PASSWORD,
    port,
    persistent: false,
    onLog: () => {},
  });

  let stopping: Promise<void> | undefined;
  const stop = () => {
    stopping ??= (async () => {
      await postgres.stop().catch(() => {});
      rmSync(directory, { recursive: true, force: true });
    })();
    return stopping;
  };

  const interruptSignals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGHUP"];
  const stopThenExit = (signal: NodeJS.Signals) => {
    void stop().finally(() => process.exit(signal === "SIGINT" ? 130 : 143));
  };
  const removeSignalHandlers = () => interruptSignals.forEach((signal) => process.off(signal, stopThenExit));
  interruptSignals.forEach((signal) => process.on(signal, stopThenExit));

  try {
    await postgres.initialise();
    await postgres.start();
    await postgres.createDatabase(DATABASE);

    // Set unconditionally so the database URLs in the .env files can never be used by these tests.
    const url = `postgresql://${USER}:${PASSWORD}@127.0.0.1:${port}/${DATABASE}`;
    process.env.DATABASE_URL = url;
    applyMigrations(url, port);
  } catch (error) {
    removeSignalHandlers();
    await stop();
    throw error;
  }

  return async () => {
    removeSignalHandlers();
    await stop();
  };
}
