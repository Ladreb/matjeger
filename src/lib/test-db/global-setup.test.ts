import { describe, expect, it } from "vitest";
import { assertThrowawayUrl } from "./global-setup";

describe("assertThrowawayUrl", () => {
  it("accepts the throwaway database on the chosen port", () => {
    expect(() => assertThrowawayUrl("postgresql://u:p@127.0.0.1:5555/matjeger_test", 5555)).not.toThrow();
  });

  it("refuses a remote database", () => {
    expect(() => assertThrowawayUrl("postgresql://u:p@ep-wild-base.neon.tech/neondb", 5555)).toThrow(/throwaway/);
  });

  it("refuses a local database on another port", () => {
    expect(() => assertThrowawayUrl("postgresql://u:p@127.0.0.1:5432/matjeger_test", 5555)).toThrow(/throwaway/);
  });

  it("refuses a missing url", () => {
    expect(() => assertThrowawayUrl(undefined, 5555)).toThrow(/throwaway/);
  });
});
