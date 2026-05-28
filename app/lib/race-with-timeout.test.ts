import { describe, expect, it } from "vitest";
import { raceWithTimeout } from "./race-with-timeout";

describe("raceWithTimeout", () => {
  it("devuelve el resultado si la promesa termina a tiempo", async () => {
    const result = await raceWithTimeout(
      Promise.resolve("ok"),
      50,
      () => "timeout"
    );
    expect(result).toBe("ok");
  });

  it("devuelve fallback si vence el timeout", async () => {
    const result = await raceWithTimeout(
      new Promise<string>((resolve) => {
        setTimeout(() => resolve("late"), 80);
      }),
      20,
      () => "timeout"
    );
    expect(result).toBe("timeout");
  });

  it("no deja rejections sin capturar si gana el timeout", async () => {
    const rejections: unknown[] = [];
    const prev = process.listeners("unhandledRejection");
    const handler = (reason: unknown) => {
      rejections.push(reason);
    };
    process.on("unhandledRejection", handler);

    try {
      await raceWithTimeout(
        new Promise<string>((_, reject) => {
          setTimeout(() => reject(new Error("abort")), 40);
        }),
        10,
        () => "timeout"
      );
      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(rejections).toHaveLength(0);
    } finally {
      process.off("unhandledRejection", handler);
      for (const listener of prev) {
        process.on("unhandledRejection", listener as NodeJS.UnhandledRejectionListener);
      }
    }
  });
});
