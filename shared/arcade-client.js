const API_ENDPOINT = "https://outlaw-arcade-scores.jessica-manuel.workers.dev";

// Show visible notification for score submission (works without console access)
function showScoreNotification(message, isSuccess) {
  try {
    var existing = document.getElementById('score-notification');
    if (existing) existing.remove();
    
    var notification = document.createElement('div');
    notification.id = 'score-notification';
    var bgColor = isSuccess ? '#4CAF50' : '#f44336';
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:' + bgColor + ';color:white;padding:15px 20px;border-radius:8px;font-family:system-ui,sans-serif;font-size:14px;z-index:10000;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:300px;';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(function() {
      var notif = document.getElementById('score-notification');
      if (notif) {
        notif.style.opacity = '0';
        notif.style.transition = 'opacity 0.5s';
        setTimeout(function() {
          var notif2 = document.getElementById('score-notification');
          if (notif2) notif2.remove();
        }, 500);
      }
    }, 5000);
  } catch (e) {
    console.warn("Could not show notification:", e);
  }
}

// Add visible loading indicator when script loads
window.addEventListener('load', function() {
  setTimeout(function() {
    showScoreNotification('Arcade client loaded', true);
  }, 1000);
});

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
      // Show visible error on screen
      showScoreNotification("Score failed to submit. Error: " + response.status, false);
    } else {
      console.log("Score submitted successfully");
      // Show visible success on screen
      showScoreNotification("Score submitted successfully!", true);
    }
  } catch (e) {
    // fail silently — a missed score post shouldn't block someone's game
    console.warn("Score submit failed", e);
    // Show visible error on screen
    showScoreNotification("Score submit failed: " + e.message, false);
  }
}

// Show visible notification for score submission (works without console access)
function showScoreNotification(message, isSuccess) {
  try {
    var existing = document.getElementById('score-notification');
    if (existing) existing.remove();
    
    var notification = document.createElement('div');
    notification.id = 'score-notification';
    var bgColor = isSuccess ? '#4CAF50' : '#f44336';
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:' + bgColor + ';color:white;padding:15px 20px;border-radius:8px;font-family:system-ui,sans-serif;font-size:14px;z-index:10000;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:300px;';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(function() {
      var notif = document.getElementById('score-notification');
      if (notif) {
        notif.style.opacity = '0';
        notif.style.transition = 'opacity 0.5s';
        setTimeout(function() {
          var notif2 = document.getElementById('score-notification');
          if (notif2) notif2.remove();
        }, 500);
      }
    }, 5000);
  } catch (e) {
    console.warn("Could not show notification:", e);
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
