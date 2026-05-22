# Architecture

## System Overview

The Productivity Suite follows a modular event-driven architecture using Chrome's Manifest V3 platform.

## Component Diagram

```mermaid
graph TB
    subgraph Extension["Productivity Suite Extension"]
        SW["Service Worker<br/>(background.js)"]
        PP["Popup<br/>(popup.html/js)"]
        OP["Options Page<br/>(options.html/js)"]
        NT["New Tab Page<br/>(newtab.html/js)"]
        BP["Blocked Page<br/>(blocked.html)"]
    end

    subgraph Storage["Chrome Storage"]
        SL["storage.local<br/>Sessions, Notes"]
        SS["storage.sync<br/>Blocked Sites"]
    end

    subgraph APIs["Chrome APIs"]
        TA["chrome.tabs"]
        CM["chrome.contextMenus"]
        SC["chrome.scripting"]
        CMD["chrome.commands"]
    end

    PP -->|sendMessage| SW
    OP -->|sendMessage| SW
    NT -->|sendMessage| SW
    SW -->|onMessage| PP
    SW -->|onMessage| OP
    SW -->|onMessage| NT
    SW --> SL
    SW --> SS
    PP --> SL
    OP --> SS
    NT --> SL
    NT --> SS
    SW --> TA
    SW --> CM
    SW --> SC
    SW --> CMD
    SW -->|redirect| BP
```

## Data Flow

```mermaid
flowchart LR
    subgraph Input
        U["User Action"]
    end

    subgraph Processing
        SW["Service Worker"]
        UI["UI Component"]
    end

    subgraph Storage
        L["Local Storage"]
        S["Sync Storage"]
    end

    U --> UI
    UI -->|Message| SW
    SW --> L
    SW --> S
    L -->|Data| UI
    S -->|Data| UI
```

## Storage Strategy

| Data | Storage Type | Reason |
|---|---|---|
| Tab Sessions | `storage.local` | Large data, device-specific |
| Notes | `storage.local` | Can grow large |
| Blocked Sites | `storage.sync` | Small config, syncs across devices |

## Message Protocol

All inter-component communication uses `chrome.runtime.sendMessage` with this pattern:

```
{ action: "actionName", ...params }
```

### Supported Actions

| Action | Sender | Handler | Description |
|---|---|---|---|
| `saveTabs` | Popup, New Tab | Service Worker | Save current window tabs |
| `restoreSession` | Popup, New Tab | Service Worker | Open session in new window |
| `deleteSession` | Popup | Service Worker | Remove a saved session |
| `exportData` | Options, New Tab | Service Worker | Get all data for export |

## Event Listeners

```mermaid
flowchart TD
    A["chrome.runtime.onInstalled"] --> B["Create Context Menu"]
    C["chrome.contextMenus.onClicked"] --> D["Append to Notes"]
    E["chrome.commands.onCommand"] --> F["Quick Save Session"]
    G["chrome.tabs.onUpdated"] --> H{"URL Blocked?"}
    H -->|Yes| I["Redirect to blocked.html"]
    H -->|No| J["Allow Navigation"]
    K["chrome.runtime.onMessage"] --> L{"Action?"}
    L --> M["saveTabs"]
    L --> N["restoreSession"]
    L --> O["deleteSession"]
    L --> P["exportData"]
```
