document.addEventListener("DOMContentLoaded", () => {
  const hostnameInput = document.getElementById("block-hostname-input");
  const addBlockBtn = document.getElementById("add-block-btn");
  const blockedSitesList = document.getElementById("blocked-sites-list");
  const exportDataBtn = document.getElementById("export-data-btn");
  const toast = document.getElementById("toast");

  function showToast(message, type = "") {
    toast.textContent = message;
    toast.className = "toast show " + type;
    setTimeout(() => { toast.className = "toast"; }, 2500);
  }

  function loadBlockedSites() {
    chrome.storage.sync.get("blockedSites", (result) => {
      const sites = result.blockedSites || [];

      if (sites.length === 0) {
        blockedSitesList.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🛡️</div>
            <p>No blocked sites yet</p>
          </div>`;
        return;
      }

      blockedSitesList.innerHTML = sites.map(site => `
        <div class="blocked-site-item">
          <span class="hostname">🚫 ${escapeHtml(site)}</span>
          <button class="remove-btn" data-site="${escapeAttr(site)}" title="Remove">✕</button>
        </div>
      `).join("");

      blockedSitesList.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          removeSite(btn.dataset.site);
        });
      });
    });
  }

  function addSite(hostname) {
    hostname = hostname.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
    if (!hostname) return;

    chrome.storage.sync.get("blockedSites", (result) => {
      const sites = result.blockedSites || [];
      if (sites.includes(hostname)) {
        showToast("Site already blocked", "error");
        return;
      }
      sites.push(hostname);
      chrome.storage.sync.set({ blockedSites: sites }, () => {
        hostnameInput.value = "";
        showToast("Site blocked!", "success");
        loadBlockedSites();
      });
    });
  }

  function removeSite(hostname) {
    chrome.storage.sync.get("blockedSites", (result) => {
      const sites = (result.blockedSites || []).filter(s => s !== hostname);
      chrome.storage.sync.set({ blockedSites: sites }, () => {
        showToast("Site unblocked", "success");
        loadBlockedSites();
      });
    });
  }

  addBlockBtn.addEventListener("click", () => {
    addSite(hostnameInput.value);
  });

  hostnameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addSite(hostnameInput.value);
  });

  exportDataBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "exportData" }, (response) => {
      if (!response) {
        showToast("Export failed", "error");
        return;
      }
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

  loadBlockedSites();
});
