interface GoatCounterHit {
  path_id: number;
  path: string;
  count: number;
  event: boolean;
}

interface GoatCounterResponse {
  hits: GoatCounterHit[] | null;
  more: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isHit = (value: unknown): value is GoatCounterHit => isRecord(value)
  && Number.isSafeInteger(value.path_id)
  && typeof value.path === "string"
  && typeof value.count === "number"
  && Number.isSafeInteger(value.count)
  && value.count >= 0
  && typeof value.event === "boolean";

const isResponse = (value: unknown): value is GoatCounterResponse => isRecord(value)
  && (value.hits === null || (Array.isArray(value.hits) && value.hits.every(isHit)))
  && typeof value.more === "boolean";

// Both slash forms refer to the same static route; discard URL query fragments.
const normalizeStatisticsPath = (path: string): string => {
  const pathname = path.split(/[?#]/, 1)[0] || "/";
  return pathname === "/" ? pathname : `${pathname.replace(/\/+$/, "")}/`;
};

export const fetchPageVisits = async (
  dashboardUrl: string,
  apiKey: string,
  now = new Date(),
): Promise<{ visits: Map<string, number>; start: Date; end: Date }> => {
  const end = new Date(now);
  end.setUTCMinutes(0, 0, 0);
  // An explicit start includes all history instead of the API's one-week default.
  const start = new Date(0);
  const url = new URL("/api/v0/stats/hits", dashboardUrl);
  url.searchParams.set("start", start.toISOString());
  url.searchParams.set("end", end.toISOString());
  url.searchParams.set("limit", "100");

  const visits = new Map<string, number>();
  const seenIds = new Set<number>();

  while (true) {
    if (seenIds.size > 0) {
      url.searchParams.set("exclude_paths", [...seenIds].join(","));
      // GoatCounter permits four requests per second.
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const maxAttempts = 3;
    let data: unknown;
    for (let attempt = 1; ; attempt += 1) {
      if (attempt > 1) {
        await new Promise((resolve) => setTimeout(resolve, 1_000 * 2 ** (attempt - 2)));
      }

      let response: Response;
      try {
        response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(15_000),
        });
        if (response.ok) {
          data = await response.json();
          break;
        }
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error("GoatCounter returned an invalid JSON statistics response.", { cause: error });
        }
        if (attempt === maxAttempts) {
          throw new Error(`GoatCounter statistics connection failed after ${maxAttempts} attempts.`, { cause: error });
        }
        console.warn(`GoatCounter statistics connection failed; retrying (${attempt + 1}/${maxAttempts}).`);
        continue;
      }

      const message = `GoatCounter statistics request failed (${response.status}).`;
      // Retry intermittent upstream 404s as well as transient HTTP failures.
      const retryable = [404, 408, 429].includes(response.status) || response.status >= 500;
      if (!retryable || attempt === maxAttempts) throw new Error(message);
      console.warn(`${message} Retrying (${attempt + 1}/${maxAttempts}).`);
    }

    if (!isResponse(data)) {
      throw new Error("GoatCounter returned an invalid statistics response.");
    }

    const previousSize = seenIds.size;
    for (const hit of data.hits ?? []) {
      if (seenIds.has(hit.path_id)) continue;
      seenIds.add(hit.path_id);
      if (hit.event) continue;
      const path = normalizeStatisticsPath(hit.path);
      visits.set(path, (visits.get(path) ?? 0) + hit.count);
    }

    if (!data.more) break;
    if (seenIds.size === previousSize) {
      throw new Error("GoatCounter statistics pagination did not advance.");
    }
  }

  return { visits, start, end };
};
