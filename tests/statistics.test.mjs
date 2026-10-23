import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchPageVisits } from "../src/data/statistics.ts";

const hit = (path_id, path, count, event = false) => ({ path_id, path, count, event });

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
    new Response("denied", { status: 403 }),
    Response.json({ hits: [{ path: "/blog/article/", count: "12" }], more: false }),
    Response.json({ hits: [], more: true }),
  ]) {
    const fetchMock = t.mock.method(globalThis, "fetch", async () => response);
    await assert.rejects(fetchPageVisits("https://example.goatcounter.com", "key"), /GoatCounter/);
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
