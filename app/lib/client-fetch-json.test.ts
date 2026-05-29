import { describe, expect, it, vi, afterEach } from "vitest";
import {
  ClientFetchTimeoutError,
  fetchClientJson,
} from "./client-fetch-json";

describe("fetchClientJson", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("traduce AbortError a ClientFetchTimeoutError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new DOMException("Aborted", "AbortError")))
    );

    await expect(fetchClientJson("/api/events?scope=home", 1000)).rejects.toBeInstanceOf(
      ClientFetchTimeoutError
    );
  });
});
