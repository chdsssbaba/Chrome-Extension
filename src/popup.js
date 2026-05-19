document.addEventListener("DOMContentLoaded", () => {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");
  const sessionNameInput = document.getElementById("session-name-input");
  const saveSessionBtn = document.getElementById("save-session-btn");
  const sessionsList = document.getElementById("sessions-list");
  const notesTextarea = document.getElementById("notes-textarea");
  const saveNotesBtn = document.getElementById("save-notes-btn");
  const charCount = document.getElementById("char-count");
  const openOptionsBtn = document.getElementById("open-options-btn");
  const toast = document.getElementById("toast");

  function showToast(message, type = "") {
    toast.textContent = message;
    toast.className = "toast show " + type;
    setTimeout(() => { toast.className = "toast"; }, 2500);
  }

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("panel-" + btn.dataset.tab).classList.add("active");
    });
  });

  openOptionsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  function loadSessions() {
    chrome.storage.local.get("sessions", (result) => {
      const sessions = result.sessions || {};
      const keys = Object.keys(sessions);

      if (keys.length === 0) {
        sessionsList.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📑</div>
            <p>No saved sessions yet</p>
          </div>`;
        return;
      }

      sessionsList.innerHTML = keys.map(name => {
        const session = sessions[name];
        const count = session.urls ? session.urls.length : 0;
        const date = session.createdAt ? new Date(session.createdAt).toLocaleDateString() : "";
        return `
          <div class="session-card">
            <div class="session-header">
              <span class="session-name">${escapeHtml(name)}</span>
              <span class="badge badge-accent">${count} tabs</span>
            </div>
            <div class="session-meta">${date}</div>
            <div class="session-actions">
              <button class="btn btn-primary btn-sm restore-btn" data-testid="restore-session-${escapeAttr(name)}" data-name="${escapeAttr(name)}">
                🔄 Restore
              </button>
              <button class="btn btn-danger btn-sm delete-btn" data-name="${escapeAttr(name)}">
                🗑️ Delete
              </button>
            </div>
          </div>`;
      }).join("");

      sessionsList.querySelectorAll(".restore-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          chrome.runtime.sendMessage({ action: "restoreSession", name: btn.dataset.name }, (response) => {
            if (response && response.success) {
              showToast("Session restored!", "success");
            } else {
              showToast("Failed to restore session", "error");
            }
          });
        });
      });

      sessionsList.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          chrome.runtime.sendMessage({ action: "deleteSession", name: btn.dataset.name }, (response) => {
            if (response && response.success) {
              showToast("Session deleted", "success");
              loadSessions();
            }
          });
        });
      });
    });
  }

  saveSessionBtn.addEventListener("click", () => {
    let name = sessionNameInput.value.trim();
    if (!name) {
      name = "Session " + new Date().toLocaleString();
    }
    chrome.runtime.sendMessage({ action: "saveTabs", name }, (response) => {
      if (response && response.success) {
        sessionNameInput.value = "";
        showToast("Session saved!", "success");
        loadSessions();
      } else {
        showToast("Failed to save session", "error");
      }
    });
  });

  function loadNotes() {
    chrome.storage.local.get("notes", (result) => {
      const notes = result.notes || "";
      notesTextarea.value = notes;
      charCount.textContent = notes.length + " chars";
    });
  }

  notesTextarea.addEventListener("input", () => {
    charCount.textContent = notesTextarea.value.length + " chars";
  });

  saveNotesBtn.addEventListener("click", () => {
    chrome.storage.local.set({ notes: notesTextarea.value }, () => {
      showToast("Notes saved!", "success");
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

  loadSessions();
  loadNotes();
});
