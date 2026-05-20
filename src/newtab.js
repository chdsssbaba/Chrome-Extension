document.addEventListener("DOMContentLoaded", () => {
  const greetingEl = document.getElementById("greeting");
  const dateEl = document.getElementById("date-display");
  const clockEl = document.getElementById("clock");
  const widgetNotes = document.getElementById("widget-notes");
  const widgetSessions = document.getElementById("widget-sessions");
  const widgetBlocked = document.getElementById("widget-blocked");
  const toast = document.getElementById("toast");

  function showToast(message, type = "") {
    toast.textContent = message;
    toast.className = "toast show " + type;
    setTimeout(() => { toast.className = "toast"; }, 2500);
  }

  function updateGreeting() {
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 17) greeting = "Good Afternoon";
    else greeting = "Good Evening";
    greetingEl.textContent = greeting;
  }

  function updateDate() {
    const now = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    dateEl.textContent = now.toLocaleDateString("en-US", options);
  }

  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    clockEl.textContent = h + ":" + m + ":" + s;
  }

  function loadNotes() {
    chrome.storage.local.get("notes", (result) => {
      const notes = result.notes || "";
      if (!notes.trim()) {
        widgetNotes.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><p>No notes yet. Open the popup to add some.</p></div>`;
        return;
      }
      widgetNotes.innerHTML = `<div class="notes-display">${escapeHtml(notes)}</div>`;
    });
  }

  function loadSessions() {
    chrome.storage.local.get("sessions", (result) => {
      const sessions = result.sessions || {};
      const keys = Object.keys(sessions);

      if (keys.length === 0) {
        widgetSessions.innerHTML = `<div class="empty-state"><div class="empty-icon">📑</div><p>No saved sessions.</p></div>`;
        return;
      }

      widgetSessions.innerHTML = keys.map(name => {
        const session = sessions[name];
        const count = session.urls ? session.urls.length : 0;
        return `
          <div class="session-item" data-name="${escapeAttr(name)}">
            <span class="session-item-name">${escapeHtml(name)}</span>
            <span class="badge badge-accent">${count} tabs</span>
          </div>`;
      }).join("");

      widgetSessions.querySelectorAll(".session-item").forEach(item => {
        item.addEventListener("click", () => {
          chrome.runtime.sendMessage({ action: "restoreSession", name: item.dataset.name }, (response) => {
            if (response && response.success) {
              showToast("Session restored!", "success");
            }
          });
        });
      });
    });
  }

  function loadBlocked() {
    chrome.storage.sync.get("blockedSites", (result) => {
      const sites = result.blockedSites || [];
      if (sites.length === 0) {
        widgetBlocked.innerHTML = `<div class="empty-state"><div class="empty-icon">🛡️</div><p>No blocked sites. Stay focused!</p></div>`;
        return;
      }
      widgetBlocked.innerHTML = sites.map(site => `<span class="blocked-item">🚫 ${escapeHtml(site)}</span>`).join("");
    });
  }

  document.getElementById("qa-options").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById("qa-save-session").addEventListener("click", () => {
    const name = "Quick-" + Date.now();
    chrome.runtime.sendMessage({ action: "saveTabs", name }, (response) => {
      if (response && response.success) {
        showToast("Session saved!", "success");
        loadSessions();
      }
    });
  });

  document.getElementById("qa-export").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "exportData" }, (response) => {
      if (!response) return;
      const data = JSON.stringify(response, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "productivity_suite_export.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Data exported!", "success");
    });
  });

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/[&"'<>]/g, c => ({
      "&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;"
    }[c]));
  }

  updateGreeting();
  updateDate();
  updateClock();
  setInterval(updateClock, 1000);
  loadNotes();
  loadSessions();
  loadBlocked();
});
