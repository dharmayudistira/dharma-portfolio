import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import rebuild from "../api/rebuild.ts";

const previous = {
  CRON_SECRET: process.env.CRON_SECRET,
  VERCEL_DEPLOY_HOOK_URL: process.env.VERCEL_DEPLOY_HOOK_URL,
};

afterEach(() => {
  for (const [name, value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

const request = (authorization, method = "GET") => new Request("https://example.com/api/rebuild", {
  method,
  headers: authorization ? { Authorization: authorization } : {},
});

test("requires the configured cron secret before calling any deploy hook", async (t) => {
  process.env.CRON_SECRET = "cron-key";
  const fetchMock = t.mock.method(globalThis, "fetch", async () => { throw new Error("Must not be called"); });
  for (const value of [undefined, "Bearer wrong-key"]) {
    assert.equal((await rebuild.fetch(request(value))).status, 401);
  }
  delete process.env.CRON_SECRET;
  assert.equal((await rebuild.fetch(request("Bearer undefined"))).status, 401);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("requests a rebuild using POST and never exposes the private hook response", async (t) => {
  process.env.CRON_SECRET = "cron-key";
  process.env.VERCEL_DEPLOY_HOOK_URL = "https://api.vercel.com/private-deploy-hook";
  const fetchMock = t.mock.method(globalThis, "fetch", async () => Response.json({ private: "value" }));
  const response = await rebuild.fetch(request("Bearer cron-key"));
  assert.equal(response.status, 202);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { message: "Rebuild requested." });
  assert.equal(fetchMock.mock.calls[0].arguments[0], process.env.VERCEL_DEPLOY_HOOK_URL);
  assert.equal(fetchMock.mock.calls[0].arguments[1].method, "POST");
});

test("reports a missing hook, upstream error, and unsupported method", async (t) => {
  process.env.CRON_SECRET = "cron-key";
  delete process.env.VERCEL_DEPLOY_HOOK_URL;
  assert.equal((await rebuild.fetch(request("Bearer cron-key"))).status, 503);
  process.env.VERCEL_DEPLOY_HOOK_URL = "https://api.vercel.com/private-deploy-hook";
  t.mock.method(globalThis, "fetch", async () => new Response("failed", { status: 500 }));
  assert.equal((await rebuild.fetch(request("Bearer cron-key"))).status, 502);
  assert.equal((await rebuild.fetch(request("Bearer cron-key", "POST"))).status, 405);
});
