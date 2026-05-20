chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "add-to-notes",
    title: "Add page to notes",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "add-to-notes") {
    try {
      const result = await chrome.storage.local.get("notes");
      const existing = result.notes || "";
      const entry = `\n[${tab.title}](${tab.url})`;
      const updated = existing + entry;
      await chrome.storage.local.set({ notes: updated });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const toast = document.createElement("div");
          toast.textContent = "Page added to notes!";
          toast.style.cssText = "position:fixed;top:20px;right:20px;z-index:999999;padding:12px 24px;background:rgba(99,102,241,0.95);color:#fff;border-radius:12px;font-family:system-ui;font-size:14px;box-shadow:0 8px 32px rgba(0,0,0,0.3);backdrop-filter:blur(10px);transition:opacity 0.4s;";
          document.body.appendChild(toast);
          setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 400); }, 2000);
        }
      });
    } catch (e) {}
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "save-session") {
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const urls = tabs.map(t => t.url).filter(u => u && !u.startsWith("chrome://"));
      const sessionName = "quick-" + Date.now();
      const result = await chrome.storage.local.get("sessions");
      const sessions = result.sessions || {};
      sessions[sessionName] = { urls, createdAt: new Date().toISOString() };
      await chrome.storage.local.set({ sessions });
    } catch (e) {}
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && tab.url) {
    try {
      const hostname = new URL(tab.url).hostname.replace(/^www\./, "");
      const result = await chrome.storage.sync.get("blockedSites");
      const blockedSites = result.blockedSites || [];
      const isBlocked = blockedSites.some(site => {
        const cleanSite = site.replace(/^www\./, "");
        return hostname === cleanSite || hostname.endsWith("." + cleanSite);
      });
      if (isBlocked) {
        const blockedPageUrl = chrome.runtime.getURL("blocked.html") + "?site=" + encodeURIComponent(tab.url);
        chrome.tabs.update(tabId, { url: blockedPageUrl });
      }
    } catch (e) {}
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveTabs") {
    chrome.tabs.query({ currentWindow: true }).then(tabs => {
      const urls = tabs.map(t => t.url).filter(u => u && !u.startsWith("chrome://") && !u.startsWith("chrome-extension://"));
      chrome.storage.local.get("sessions").then(result => {
        const sessions = result.sessions || {};
        sessions[message.name] = { urls, createdAt: new Date().toISOString() };
        chrome.storage.local.set({ sessions }).then(() => {
          sendResponse({ success: true });
        });
      });
    });
    return true;
  }

  if (message.action === "restoreSession") {
    chrome.storage.local.get("sessions").then(result => {
      const sessions = result.sessions || {};
      const session = sessions[message.name];
      if (session && session.urls.length > 0) {
        chrome.windows.create({ url: session.urls }).then(() => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: "Session not found" });
      }
    });
    return true;
  }

  if (message.action === "deleteSession") {
    chrome.storage.local.get("sessions").then(result => {
      const sessions = result.sessions || {};
      delete sessions[message.name];
      chrome.storage.local.set({ sessions }).then(() => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (message.action === "exportData") {
    Promise.all([
      chrome.storage.local.get(["sessions", "notes"]),
      chrome.storage.sync.get("blockedSites")
    ]).then(([localData, syncData]) => {
      sendResponse({
        sessions: localData.sessions || {},
        notes: localData.notes || "",
        blockedSites: syncData.blockedSites || []
      });
    });
    return true;
  }
});
