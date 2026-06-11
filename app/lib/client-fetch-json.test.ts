import { describe, expect, it, vi, afterEach } from "vitest";
import {
  ClientFetchTimeoutError,
  fetchClientJson,
  resetClientFetchInflightForTests,
} from "./client-fetch-json";

function mockResponse(
  init: Partial<Response> & { json?: unknown; etag?: string | null }
): Response {
  const headers = new Headers();
  if (init.etag) headers.set("etag", init.etag);
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    headers,
    json: () => Promise.resolve(init.json ?? {}),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  } as Response;
}

describe("fetchClientJson", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetClientFetchInflightForTests();
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

  it("envía If-None-Match y devuelve notModified en 304", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        mockResponse({
          etag: '"abc"',
          json: { events: [{ id: 1, title: "A", date: "2026-06-11" }] },
        })
      )
      .mockResolvedValueOnce(mockResponse({ status: 304, etag: '"abc"' }));

    vi.stubGlobal("fetch", fetchMock);

    const first = await fetchClientJson<{ events: unknown[] }>(
      "/api/events?scope=home"
    );
    expect(first.notModified).toBeUndefined();
    expect(first.body.events).toHaveLength(1);

    const second = await fetchClientJson<{ events: unknown[] }>(
      "/api/events?scope=home"
    );
    expect(second.notModified).toBe(true);
    expect(second.status).toBe(304);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[1]?.headers?.["If-None-Match"]).toBe('"abc"');
  });
});
