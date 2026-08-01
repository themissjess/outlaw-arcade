const API_ENDPOINT = "https://outlaw-arcade-scores.jessica-manuel.workers.dev";

async function submitScore(payload) {
  payload.timestamp = new Date().toISOString();
  try {
    await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    // fail silently — a missed score post shouldn't block someone's game
    console.warn("Score submit failed", e);
  }
}

async function fetchLeaderboard() {
  try {
    const url = API_ENDPOINT + (API_ENDPOINT.includes("?") ? "&" : "?") + "action=leaderboard";
    const res = await fetch(url);
    if (!res.ok) throw new Error("bad response");
    return await res.json();
  } catch (e) {
    return [];
  }
}

function getOperator() {
  const url = new URLSearchParams(location.search);
  return url.get("operator") || localStorage.getItem("arcade-operator") || "";
}
