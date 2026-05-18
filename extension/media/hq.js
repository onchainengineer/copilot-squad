/* Command Centre — webview controller. Plain JS, no modules (webview context).
 * A Grafana-style operations dashboard. The webview has no mission engine — it
 * reacts to `postMessage` from the extension (`pulse` / `cheer`).
 * Soldier art lives in sprites.js (window.Squad). */
(function () {
  'use strict';
  var vscode = acquireVsCodeApi();
  var SQUAD = window.__SQUAD__ || [];
  var Sprite = window.Squad;
  var BUSY_MS = 4400;

  /* ── Layout ─────────────────────────────────────────────── */
  var app = document.getElementById('app');
  app.innerHTML =
    '<header class="cc-top">' +
    '  <div class="cc-brand">' +
    '    <span class="cc-mark">🐾</span>' +
    '    <div><span class="cc-eyebrow">GitHub Copilot</span><h1>Command Centre</h1></div>' +
    '  </div>' +
    '  <div class="cc-status">' +
    '    <span class="cc-status-dot"></span><span>Operational</span>' +
    '    <span class="cc-status-sep">·</span>' +
    '    <span>' + SQUAD.length + ' soldiers on duty</span>' +
    '    <span class="cc-clock" id="cc-clock"></span>' +
    '  </div>' +
    '</header>' +
    '<main class="cc-grid">' +
    '  <section class="gf-stats" id="stats"></section>' +
    '  <section class="gf-panel">' +
    '    <div class="gf-head"><span class="gf-title">Mission Control</span>' +
    '      <span class="gf-tag">deploy</span></div>' +
    '    <div class="gf-body"><div class="cc-actions">' +
    '      <button class="action primary" data-cmd="commandCentre.askSquad">💬 Ask the Army</button>' +
    '      <button class="action" data-cmd="commandCentre.recruit">➕ Recruit a Soldier</button>' +
    '      <button class="action" data-cmd="commandCentre.setup">🚀 Set Up the Army</button>' +
    '    </div></div>' +
    '  </section>' +
    '  <div class="cc-row">' +
    '    <section class="gf-panel">' +
    '      <div class="gf-head"><span class="gf-title">Soldier Status</span>' +
    '        <span class="gf-tag">' + SQUAD.length + ' units</span></div>' +
    '      <div class="gf-body" id="soldier-status"></div>' +
    '    </section>' +
    '    <section class="gf-panel">' +
    '      <div class="gf-head"><span class="gf-title">Operations Log</span>' +
    '        <span class="gf-tag" id="ops-count">0 events</span></div>' +
    '      <div class="gf-body" id="ops-log"></div>' +
    '    </section>' +
    '  </div>' +
    '</main>' +
    '<footer class="cc-foot">Copilot Command Centre · every soldier is a real Copilot agent in <code>.github/agents/</code></footer>';

  /* ── Live clock ─────────────────────────────────────────── */
  var clock = document.getElementById('cc-clock');
  function tick() {
    clock.textContent = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  tick();
  setInterval(tick, 1000);

  /* ── Stat tiles ─────────────────────────────────────────── */
  var stats = { onduty: SQUAD.length, events: 0, recruited: 0, skills: SQUAD.length };
  var STAT_TILES = [
    { id: 'onduty', label: 'Soldiers on duty' },
    { id: 'events', label: 'Events observed' },
    { id: 'recruited', label: 'Recruited' },
    { id: 'skills', label: 'Agents' },
  ];
  document.getElementById('stats').innerHTML = STAT_TILES.map(function (t) {
    return (
      '<div class="gf-stat"><span class="gf-stat-num" id="stat-' + t.id + '">' +
      stats[t.id] +
      '</span><span class="gf-stat-label">' + t.label + '</span></div>'
    );
  }).join('');

  function bumpStat(id, value) {
    stats[id] = value;
    var el = document.getElementById('stat-' + id);
    if (!el) return;
    el.textContent = String(value);
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  /* ── Soldier Status table ───────────────────────────────── */
  var soldierStatus = document.getElementById('soldier-status');
  soldierStatus.innerHTML =
    '<div class="ss-table">' +
    '<div class="ss-head"><span>Soldier</span><span>Status</span><span>Events</span></div>' +
    SQUAD.map(function (agent) {
      return (
        '<div class="ss-row" id="ss-' + agent.id + '" data-agent="' + agent.id +
        '" style="--accent:' + agent.color + '">' +
        '<span class="ss-soldier">' + Sprite.frame(agent.animal, agent.color, 'idle', 2) +
        '<span class="ss-meta"><b>' + agent.name + '</b><em>' + agent.role + '</em></span></span>' +
        '<span class="ss-status" data-status="idle"><i></i>Idle</span>' +
        '<span class="ss-missions"><b id="ssm-' + agent.id + '">0</b></span>' +
        '</div>'
      );
    }).join('') +
    '</div>';

  Array.prototype.forEach.call(soldierStatus.querySelectorAll('.ss-row'), function (row) {
    row.addEventListener('click', function () {
      vscode.postMessage({ type: 'select', agentId: row.getAttribute('data-agent') });
    });
  });

  var ssCounts = {};
  var ssTimers = {};
  function setSoldierStatus(agentId, status, label) {
    var cell = document.querySelector('#ss-' + agentId + ' .ss-status');
    if (!cell) return;
    cell.dataset.status = status;
    cell.innerHTML = '<i></i>' + label;
  }

  /* ── Operations Log ─────────────────────────────────────── */
  var opsLog = document.getElementById('ops-log');
  var opsCount = document.getElementById('ops-count');
  var opsTotal = 0;
  function pushOps(accent, tag, text) {
    opsTotal++;
    opsCount.textContent = opsTotal + (opsTotal === 1 ? ' event' : ' events');
    var row = document.createElement('div');
    row.className = 'ops-line';
    row.style.setProperty('--accent', accent);
    var time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    row.innerHTML =
      '<span class="ops-time">' + time + '</span>' +
      '<span class="ops-tag">' + tag + '</span>' +
      '<span class="ops-text">' + text + '</span>';
    opsLog.insertBefore(row, opsLog.firstChild);
    while (opsLog.children.length > 14) opsLog.removeChild(opsLog.lastChild);
  }

  /* ── Messages from the extension ────────────────────────── */
  window.addEventListener('message', function (e) {
    var msg = e.data || {};
    if (msg.type === 'pulse') {
      var agent = SQUAD.filter(function (a) {
        return a.id === msg.agentId;
      })[0];
      if (!agent) return;
      bumpStat('events', stats.events + 1);
      setSoldierStatus(msg.agentId, 'working', 'Working');
      ssCounts[msg.agentId] = (ssCounts[msg.agentId] || 0) + 1;
      var counter = document.getElementById('ssm-' + msg.agentId);
      if (counter) counter.textContent = String(ssCounts[msg.agentId]);
      pushOps(agent.color, 'DISPATCH', agent.name + ' → ' + msg.text);
      clearTimeout(ssTimers[msg.agentId]);
      ssTimers[msg.agentId] = setTimeout(function () {
        setSoldierStatus(msg.agentId, 'idle', 'Idle');
      }, BUSY_MS);
    } else if (msg.type === 'cheer') {
      bumpStat('recruited', stats.recruited + 1);
      SQUAD.forEach(function (a) {
        setSoldierStatus(a.id, 'done', 'Done');
        setTimeout(function () {
          setSoldierStatus(a.id, 'idle', 'Idle');
        }, 1900);
      });
      pushOps('#3fb950', 'RECRUIT', msg.text || 'Army assembled.');
    }
  });

  /* ── Action buttons ─────────────────────────────────────── */
  Array.prototype.forEach.call(document.querySelectorAll('.action'), function (btn) {
    btn.addEventListener('click', function () {
      vscode.postMessage({ type: 'run', command: btn.getAttribute('data-cmd') });
    });
  });
})();
