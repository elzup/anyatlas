import { invoke } from "@tauri-apps/api/core";
import "./styles.css";

const rows = document.getElementById("rows");
const count = document.getElementById("count");
const busyCount = document.getElementById("busy-count");
const updated = document.getElementById("updated");
const intervalSelect = document.getElementById("interval");
const refreshButton = document.getElementById("refresh");

let timer = null;

function statusClass(status) {
  return {
    "busy": "busy",
    "busy?": "busyq",
    "idle": "idle",
    "idle?": "idleq",
    "stopped": "stopped",
    "daemon": "daemon"
  }[status] || "idle";
}

function renderTable(sessions) {
  count.textContent = String(sessions.length);
  busyCount.textContent = String(sessions.filter((item) => item.status.startsWith("busy")).length);
  updated.textContent = new Date().toLocaleTimeString();

  if (!sessions.length) {
    rows.innerHTML = '<tr><td colspan="8" class="empty">No sessions found.</td></tr>';
    return;
  }

  const sorted = [...sessions].sort((a, b) => {
    const busyA = a.status.startsWith("busy") ? 0 : 1;
    const busyB = b.status.startsWith("busy") ? 0 : 1;
    if (busyA !== busyB) return busyA - busyB;
    return (a.project || "").localeCompare(b.project || "");
  });

  rows.innerHTML = sorted.map((item) => `
    <tr>
      <td><span class="tool">${item.tool}</span></td>
      <td><span class="badge ${statusClass(item.status)}">${item.status}</span></td>
      <td>
        <div class="project">${item.project || "-"}</div>
        <div class="cwd">${item.cwd || "-"}</div>
      </td>
      <td>${item.tty}</td>
      <td>${item.cpu}%</td>
      <td>${item.elapsed}</td>
      <td>${item.pid}</td>
      <td>${item.source}</td>
    </tr>
  `).join("");
}

function renderError(message) {
  updated.textContent = new Date().toLocaleTimeString();
  rows.innerHTML = `<tr><td colspan="8" class="empty error">${message}</td></tr>`;
}

async function loadSessions() {
  try {
    const text = await invoke("sessions_json");
    const data = JSON.parse(text);
    renderTable(data);
  } catch (error) {
    renderError(String(error));
  }
}

function restartTimer() {
  if (timer) {
    clearInterval(timer);
  }
  timer = setInterval(loadSessions, Number(intervalSelect.value));
}

refreshButton.addEventListener("click", loadSessions);
intervalSelect.addEventListener("change", restartTimer);

loadSessions();
restartTimer();
