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

  try {
    await postgres.initialise();
    await postgres.start();
    await postgres.createDatabase(DATABASE);

    // Set unconditionally so the database URLs in the .env files can never be used by these tests.
    const url = `postgresql://${USER}:${PASSWORD}@127.0.0.1:${port}/${DATABASE}`;
    process.env.DATABASE_URL = url;
    execFileSync("npx", ["prisma", "migrate", "deploy"], { env: process.env, stdio: "pipe" });
  } catch (error) {
    await stop();
    throw error;
  }

  return stop;
}
