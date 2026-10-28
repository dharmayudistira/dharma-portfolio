import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchPageVisits } from "../src/data/statistics.ts";

const hit = (path_id, path, count, event = false) => ({ path_id, path, count, event });

const mockRetryDelays = (t) => {
  const delays = [];
  const schedule = globalThis.setTimeout;
  t.mock.method(globalThis, "setTimeout", (callback, delay, ...args) => {
    delays.push(delay);
    return schedule(callback, 0, ...args);
  });
  return delays;
};

test("recovers from an intermittent 404 without changing the request", async (t) => {
  const delays = mockRetryDelays(t);
  const warnings = t.mock.method(console, "warn", () => {});
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url: String(url), options });
    return requests.length === 1
      ? new Response("not found", { status: 404 })
      : Response.json({ hits: [hit(1, "/blog/article/", 12)], more: false });
  });

  const { visits } = await fetchPageVisits("https://example.goatcounter.com", "private-key");

  assert.equal(visits.get("/blog/article/"), 12);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].url, requests[1].url);
  assert.deepEqual(requests[0].options.headers, requests[1].options.headers);
  assert.notEqual(requests[0].options.signal, requests[1].options.signal);
  assert.deepEqual(delays, [1_000]);
  assert.match(warnings.mock.calls[0].arguments[0], /404.*2\/3/);
  assert.ok(!warnings.mock.calls[0].arguments[0].includes("private-key"));
});

test("retries request timeouts, rate limits, and server errors", async (t) => {
  for (const status of [408, 429, 500, 502, 503, 504]) {
    await t.test(String(status), async (t) => {
      const delays = mockRetryDelays(t);
      t.mock.method(console, "warn", () => {});
      let attempt = 0;
      const fetchMock = t.mock.method(globalThis, "fetch", async () => ++attempt === 1
        ? new Response("unavailable", { status })
        : Response.json({ hits: [], more: false }));

      assert.equal((await fetchPageVisits("https://example.goatcounter.com", "key")).visits.size, 0);
      assert.equal(fetchMock.mock.callCount(), 2);
      assert.deepEqual(delays, [1_000]);
    });
  }
});

test("retries connection failures and timeouts while fetching or reading the response", async (t) => {
  for (const [name, failure] of [
    ["connection", () => { throw new TypeError("fetch failed"); }],
    ["fetch timeout", () => { throw new DOMException("Timed out", "TimeoutError"); }],
    ["body timeout", () => new Response(new ReadableStream({
      start(controller) { controller.error(new DOMException("Timed out", "TimeoutError")); },
    }))],
  ]) {
    await t.test(name, async (t) => {
      const delays = mockRetryDelays(t);
      t.mock.method(console, "warn", () => {});
      let attempt = 0;
      const fetchMock = t.mock.method(globalThis, "fetch", async () => {
        if (++attempt === 1) return failure();
        return Response.json({ hits: [hit(1, "/blog/article/", 12)], more: false });
      });

      assert.equal((await fetchPageVisits("https://example.goatcounter.com", "key")).visits.get("/blog/article/"), 12);
      assert.equal(fetchMock.mock.callCount(), 2);
      assert.deepEqual(delays, [1_000]);
    });
  }
});

test("stops after three attempts when the upstream stays unavailable", async (t) => {
  for (const status of [404, 503, undefined]) {
    await t.test(status === undefined ? "connection failure" : String(status), async (t) => {
      const delays = mockRetryDelays(t);
      t.mock.method(console, "warn", () => {});
      const fetchMock = t.mock.method(globalThis, "fetch", async () => {
        if (status === undefined) throw new TypeError("fetch failed");
        return new Response("unavailable", { status });
      });

      await assert.rejects(fetchPageVisits("https://example.goatcounter.com", "key"), /GoatCounter/);
      assert.equal(fetchMock.mock.callCount(), 3);
      assert.deepEqual(delays, [1_000, 2_000]);
    });
  }
});

test("retries only the failed page and keeps complete, unduplicated totals", async (t) => {
  const delays = mockRetryDelays(t);
  t.mock.method(console, "warn", () => {});
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url) => {
    requests.push(new URL(url));
    if (requests.length === 1) return Response.json({ hits: [hit(1, "/blog/article/", 12)], more: true });
    if (requests.length < 4) return new Response("not found", { status: 404 });
    return Response.json({ hits: [hit(2, "/projects/demo/", 5)], more: false });
  });

  const { visits } = await fetchPageVisits("https://example.goatcounter.com", "key");

  assert.deepEqual([...visits], [["/blog/article/", 12], ["/projects/demo/", 5]]);
  assert.equal(requests.length, 4);
  assert.ok(requests.slice(1).every((url) => url.searchParams.get("exclude_paths") === "1"));
  assert.deepEqual(delays, [300, 1_000, 2_000]);
});

test("loads every page, excludes custom events, and merges slash and query variants", async (t) => {
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url: new URL(url), options });
    return Response.json(requests.length === 1
      ? { hits: [hit(1, "/blog/article", 12), hit(2, "contact-click", 9, true)], more: true }
      : { hits: [hit(3, "/blog/article/?utm_source=test", 3), hit(4, "/projects/demo/", 5)], more: false });
  });

  const { visits, start, end } = await fetchPageVisits(
    "https://example.goatcounter.com",
    "private-key",
    new Date("2026-10-23T06:37:23.000Z"),
  );

  assert.deepEqual([...visits], [["/blog/article/", 15], ["/projects/demo/", 5]]);
  assert.equal(start.toISOString(), "1970-01-01T00:00:00.000Z");
  assert.equal(end.toISOString(), "2026-10-23T06:00:00.000Z");
  assert.equal(requests[0].url.pathname, "/api/v0/stats/hits");
  assert.equal(requests[0].url.searchParams.get("limit"), "100");
  assert.equal(requests[0].url.searchParams.get("start"), start.toISOString());
  assert.equal(requests[0].url.searchParams.get("end"), end.toISOString());
  assert.equal(requests[1].url.searchParams.get("exclude_paths"), "1,2");
  assert.equal(requests[0].options.headers.Authorization, "Bearer private-key");
});

test("includes visits older than 30 days", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => {
    const start = new Date(new URL(url).searchParams.get("start"));
    const oldVisitsIncluded = start <= new Date("2025-01-01T00:00:00.000Z");
    return Response.json({
      hits: [hit(1, "/blog/article/", 3 + (oldVisitsIncluded ? 12 : 0))],
      more: false,
    });
  });

  const { visits } = await fetchPageVisits(
    "https://example.goatcounter.com",
    "key",
    new Date("2026-10-23T06:37:23.000Z"),
  );
  assert.equal(visits.get("/blog/article/"), 15);
});

test("an empty analytics response produces valid zero counts", async (t) => {
  for (const hits of [[], null]) {
    const fetchMock = t.mock.method(globalThis, "fetch", async () => Response.json({ hits, more: false }));
    const { visits } = await fetchPageVisits("https://example.goatcounter.com", "key");
    assert.equal(visits.size, 0);
    fetchMock.mock.restore();
  }
});

test("refuses failed, malformed, or stalled responses instead of publishing false totals", async (t) => {
  for (const response of [
    new Response("bad request", { status: 400 }),
    new Response("unauthorized", { status: 401 }),
    new Response("denied", { status: 403 }),
    new Response("not JSON"),
    Response.json({ hits: [{ path: "/blog/article/", count: "12" }], more: false }),
    Response.json({ hits: [], more: true }),
  ]) {
    const fetchMock = t.mock.method(globalThis, "fetch", async () => response);
    await assert.rejects(fetchPageVisits("https://example.goatcounter.com", "key"), /GoatCounter/);
    assert.equal(fetchMock.mock.callCount(), 1);
    fetchMock.mock.restore();
  }
});

test("does not count a repeated path ID twice during pagination", async (t) => {
  let page = 0;
  t.mock.method(globalThis, "fetch", async () => Response.json(++page === 1
    ? { hits: [hit(1, "/", 7)], more: true }
    : { hits: [hit(1, "/", 7), hit(2, "/blog/article/", 4)], more: false }));
  const { visits } = await fetchPageVisits("https://example.goatcounter.com", "key");
  assert.equal(visits.get("/"), 7);
  assert.equal(visits.get("/blog/article/"), 4);
});
