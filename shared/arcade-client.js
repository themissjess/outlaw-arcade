const API_ENDPOINT = "https://outlaw-arcade-scores.jessica-manuel.workers.dev";

// Debug: Log when script loads
console.log("Arcade client loaded for debugging");

async function submitScore(payload) {
  payload.timestamp = new Date().toISOString();
  console.log("Submitting score:", payload);
  
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    // Log response for debugging
    if (!response.ok) {
      console.error("Score submit failed with status:", response.status, response.statusText);
    } else {
      console.log("Score submitted successfully");
    }
  } catch (e) {
    // fail silently — a missed score post shouldn't block someone's game
    console.warn("Score submit failed", e);
  }
}

async function fetchLeaderboard() {
  try {
    const url = API_ENDPOINT + (API_ENDPOINT.includes("?") ? "&" : "?") + "action=leaderboard";
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Leaderboard fetch failed with status:", res.status, res.statusText);
      throw new Error("bad response");
    }
    return await res.json();
  } catch (e) {
    console.warn("Leaderboard fetch failed", e);
    return [];
  }
}

function getOperator() {
  try {
    const url = new URLSearchParams(location.search);
    const urlOperator = url.get("operator");
    if (urlOperator) return urlOperator;
    
    const stored = localStorage.getItem("arcade-operator");
    return stored || "";
  } catch (e) {
    console.warn("getOperator failed (localStorage may be disabled):", e);
    return "";
  }
}
