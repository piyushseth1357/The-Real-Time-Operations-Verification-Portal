# ENG-149206: Real-Time Operations Verification Portal

**Epic:** Core Infrastructure Overhaul & Real-Time Sync  
**Priority:** P0 (Critical - Revenue Blocking)  
**Story Points:** 8  
**Assignee:** Piyush Seth (`PDIT-INT-1153`)  
**Reporter:** Rahul Verma (VP of Engineering)  
**Tech Lead:** Deepika Kumari  

---

## 📌 Executive Summary & Context

Our client's field operators were facing severe data corruption and operational bottlenecks due to a fragmented verification process spread across physical paperwork and disconnected web forms. This portal replaces that legacy setup with a real-time, stateful verification engine powered by WebSockets.

The portal provides an operational dashboard where task updates are broadcast across all active operator terminals instantly.

---

## 🏗️ Architecture & Technical Highlights

```
                       +-----------------------------------+
                       |    Operator Browser Terminal      |
                       +-----------------------------------+
                                   |          ^
               JSON STATUS_UPDATE  |          | WebSocket Broadcast
                    Payload        v          | (ws.onmessage)
                       +-----------------------------------+
                       |    WebSocket Manager / Engine    |
                       |  (wss://echo.websocket.events)    |
                       +-----------------------------------+
                                      |
                      State Mutation (Functional Updater)
                                      v
                       +-----------------------------------+
                       |     React Local Task State        |
                       |   [Pending | In Review | Done]    |
                       +-----------------------------------+
```

### Key Technical Patterns Implemented:
1. **State-Driven Workflow (`WorkflowEngine.jsx`)**: Local state manages the lifecycle of verification tickets (`PENDING` -> `IN_PROGRESS` -> `APPROVED` / `REJECTED`).
2. **WebSocket Synchronization**: Establishes connection to `wss://echo.websocket.events` on mount and dispatches `STATUS_UPDATE` payloads over socket frames on button interaction.
3. **Stale Closure Prevention**: Implements functional state updates `setTasks(prev => ...)` within `ws.onmessage` event listeners so rapid concurrent updates preserve state integrity.
4. **Memory Leak Prevention**: Standardized `useEffect` cleanup hook ensuring `ws.close()` is executed when components unmount.
5. **Exponential Backoff Reconnection**: Automatic retry mechanism with backoff timings (1s, 2s, 4s, 8s, up to 16s cap) in case of network drops.
6. **Optimistic Action Lock**: Interactive action buttons are safely disabled with a `"Offline - Reconnecting..."` visual tooltip whenever `ws.readyState !== WebSocket.OPEN`.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js v18.x or higher
- npm v9.x or higher

### Installation & Launch

```bash
# 1. Clone repository & navigate into project folder
cd Descriptive

# 2. Install dependencies
npm install

# 3. Spin up local development server
npm run dev

# 4. Production build check
npm run build
```

The portal will run at `http://localhost:3000/`.

---

## 🧪 Testing & Verification Guide

### 1. Happy Path Testing
- Launch the application and observe the connection pill in the header turn to **`ONLINE (WSS CONNECTED)`**.
- Click **`Approve`** or **`Reject`** on any pending task card (e.g. `#001 Biometric Identifier Handshake`).
- Notice the JSON payload fired over WebSocket, the state mutation in React, and the card moving columns without a page refresh.
- Check browser console to confirm telemetry logging: `[Analytics] Task status mutated via WebSocket`.

### 2. Disconnect & Reconnection (Unhappy Path)
- Click the **`Simulate Offline`** button in the header.
- The status indicator switches to `SIMULATED OFFLINE`, and a warning notification appears.
- Hover over any task action button — observe that action buttons are locked with the tooltip **`"Offline - Reconnecting..."`**.
- Click **`Reconnect Network`** to trigger connection recovery.

### 3. Empty State Test
- Complete or clear all pending tickets until the pending queue reaches 0.
- Verify the celebratory empty state illustration (**`"All caught up! 🎉"`**).

---

## ✅ Definition of Done (DoD) Checklist

- [x] Code compiles and builds without fatal errors.
- [x] Persistent WebSocket connection initializes and broadcasts state mutations.
- [x] UI updates instantly on incoming socket events without page reload.
- [x] Unmount cleanup invokes `ws.close()` (zero memory leak overhead).
- [x] Action buttons lock when socket state is not `WebSocket.OPEN`.
- [x] Telemetry analytics ping logged: `[Analytics] Task status mutated via WebSocket`.
- [x] High accessibility score with semantic HTML (`<article>`, `<header>`, `<main>`, `<ul>`, `<li>`) and keyboard focus management.
