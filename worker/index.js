const ALLOWED_ORIGIN = "*"; // fine for a family leaderboard; tighten later if you ever want to
const MAX_STORED = 500;     // keep only the most recent N scores overall
const RATE_LIMIT_PER_HOUR = 30;

function respond(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

function isValidPayload(p) {
  return p &&
    typeof p.game === "string" && p.game.length > 0 && p.game.length < 60 &&
    typeof p.operator === "string" && p.operator.length > 0 && p.operator.length < 60 &&
    typeof p.value === "number" && Number.isFinite(p.value);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return respond(null, 204);

    if (request.method === "GET" && url.searchParams.get("action") === "leaderboard") {
      const raw = await env.SCORES.get("scores");
      return respond(raw || "[]");
    }

    if (request.method === "POST") {
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const rlKey = "ratelimit:" + ip;
      const rl = parseInt((await env.SCORES.get(rlKey)) || "0", 10);
      if (rl >= RATE_LIMIT_PER_HOUR) return respond(JSON.stringify({ error: "rate limited" }), 429);

      let payload;
      try { payload = await request.json(); }
      catch (e) { return respond(JSON.stringify({ error: "invalid json" }), 400); }

      if (!isValidPayload(payload)) return respond(JSON.stringify({ error: "invalid payload" }), 400);

      payload.timestamp = payload.timestamp || new Date().toISOString();

      const raw = await env.SCORES.get("scores");
      const scores = raw ? JSON.parse(raw) : [];
      scores.push({
        game: payload.game,
        operator: payload.operator,
        metric: payload.metric || "",
        value: payload.value,
        outcome: payload.outcome || "",
        meta: payload.meta || {},
        timestamp: payload.timestamp,
        date: payload.timestamp.slice(0, 10)
      });
      await env.SCORES.put("scores", JSON.stringify(scores.slice(-MAX_STORED)));
      await env.SCORES.put(rlKey, String(rl + 1), { expirationTtl: 3600 });

      return respond(JSON.stringify({ ok: true }));
    }

    return respond(JSON.stringify({ error: "not found" }), 404);
  }
};
