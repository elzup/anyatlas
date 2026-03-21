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

function shortenPath(path) {
  if (!path) return "-";
  const home = "/Users/" + path.split("/")[2];
  return path.startsWith(home) ? "~" + path.slice(home.length) : path;
}

function renderTable(sessions) {
  count.textContent = String(sessions.length);
  busyCount.textContent = String(sessions.filter((item) => item.status.startsWith("busy")).length);
  updated.textContent = new Date().toLocaleTimeString();

  if (!sessions.length) {
    rows.innerHTML = '<tr><td colspan="7" class="empty">No sessions found.</td></tr>';
    return;
  }

  const sorted = [...sessions].sort((a, b) => {
    const projCmp = (a.project || "").localeCompare(b.project || "");
    if (projCmp !== 0) return projCmp;
    const busyA = a.status.startsWith("busy") ? 0 : 1;
    const busyB = b.status.startsWith("busy") ? 0 : 1;
    return busyA - busyB;
  });

  const groups = Map.groupBy(sorted, (item) => item.project || "-");
  let html = "";
  for (const [project, items] of groups) {
    const busyN = items.filter((s) => s.status.startsWith("busy")).length;
    const label = busyN > 0 ? `${project} <span class="group-busy">${busyN} busy</span>` : project;
    html += `<tr class="group-header"><td colspan="7"><span class="group-name">${label}</span> <span class="group-cwd">${shortenPath(items[0].cwd)}</span></td></tr>`;
    html += items.map((item) => `
      <tr>
        <td><span class="tool">${item.tool}</span></td>
        <td><span class="badge ${statusClass(item.status)}">${item.status}</span></td>
        <td>${item.tty}</td>
        <td>${item.cpu}%</td>
        <td>${item.elapsed}</td>
        <td>${item.pid}</td>
        <td>${item.source}</td>
      </tr>
    `).join("");
  }
  rows.innerHTML = html;
}

function renderError(message) {
  updated.textContent = new Date().toLocaleTimeString();
  rows.innerHTML = `<tr><td colspan="7" class="empty error">${message}</td></tr>`;
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
