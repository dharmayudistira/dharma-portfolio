export default {
  async fetch(request: Request): Promise<Response> {
    const headers = { "Cache-Control": "no-store" };
    if (request.method !== "GET") {
      return new Response("Method not allowed.", { status: 405, headers: { ...headers, Allow: "GET" } });
    }

    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
      return new Response("Unauthorized.", { status: 401, headers });
    }

    const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
    if (!hook) {
      return new Response("Rebuild hook is not configured.", { status: 503, headers });
    }

    try {
      const response = await fetch(hook, {
        method: "POST",
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        return new Response("Rebuild could not be requested.", { status: 502, headers });
      }
      return Response.json({ message: "Rebuild requested." }, { status: 202, headers });
    } catch {
      return new Response("Rebuild could not be requested.", { status: 502, headers });
    }
  },
};
