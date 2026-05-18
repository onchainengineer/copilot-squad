/**
 * Copilot Command Centre — entry point.
 *
 * A Grafana-style operations dashboard for the army: stat tiles, a live roaming
 * "Army" panel, mission control, soldier status, throughput, and an ops log —
 * all wired to the shared MissionEngine.
 */

import './style.css';
import { squad } from './squad';
import { MissionEngine } from './missions';
import { mountArmyLive } from './armylive';
import {
  renderStats,
  renderMissionControl,
  renderSoldierStatus,
  renderThroughput,
  renderOpsLog,
} from './dashboard';

const app = document.querySelector<HTMLDivElement>('#app')!;
const engine = new MissionEngine();

app.innerHTML = `
  <header class="cc-top">
    <div class="cc-brand">
      <span class="cc-mark">🐾</span>
      <div>
        <span class="cc-eyebrow">GitHub Copilot</span>
        <h1>Command Centre</h1>
      </div>
    </div>
    <div class="cc-status">
      <span class="cc-status-dot"></span>
      <span>Operational</span>
      <span class="cc-status-sep">·</span>
      <span>${squad.length} soldiers on duty</span>
      <span class="cc-clock" id="cc-clock"></span>
    </div>
  </header>

  <main class="cc-grid">
    <section class="gf-stats" id="stats"></section>

    <section class="gf-panel">
      <div class="gf-head"><span class="gf-title">The Army · Live</span><span class="gf-tag" id="army-tag">standing by</span></div>
      <div class="gf-body" id="army-live"></div>
    </section>

    <section class="gf-panel">
      <div class="gf-head"><span class="gf-title">Mission Control</span><span class="gf-tag">deploy</span></div>
      <div class="gf-body" id="mission-control"></div>
    </section>

    <div class="cc-row">
      <section class="gf-panel">
        <div class="gf-head"><span class="gf-title">Soldier Status</span><span class="gf-tag">${squad.length} units</span></div>
        <div class="gf-body" id="soldier-status"></div>
      </section>
      <section class="gf-panel">
        <div class="gf-head"><span class="gf-title">Mission Throughput</span><span class="gf-tag">per soldier</span></div>
        <div class="gf-body" id="throughput"></div>
      </section>
    </div>

    <section class="gf-panel">
      <div class="gf-head"><span class="gf-title">Operations Log</span><span class="gf-tag" id="ops-count">0 events</span></div>
      <div class="gf-body" id="ops-log"></div>
    </section>
  </main>

  <footer class="cc-foot">Copilot Command Centre · every soldier is a real Copilot agent in <code>.github/agents/</code></footer>`;

mountArmyLive(document.querySelector<HTMLElement>('#army-live')!, engine);
renderStats(document.querySelector<HTMLElement>('#stats')!, engine);
renderMissionControl(document.querySelector<HTMLElement>('#mission-control')!, engine);
renderSoldierStatus(document.querySelector<HTMLElement>('#soldier-status')!, engine);
renderThroughput(document.querySelector<HTMLElement>('#throughput')!, engine);
renderOpsLog(document.querySelector<HTMLElement>('#ops-log')!, engine);

const clock = document.querySelector<HTMLElement>('#cc-clock')!;
const tick = () => {
  clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};
tick();
setInterval(tick, 1000);
