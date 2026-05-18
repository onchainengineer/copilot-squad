/**
 * Command Centre — entry point. Builds the page and wires every panel to the
 * shared MissionEngine, so the Deck and the dashboard animate from the same
 * events.
 *
 * This is the *playground* for the Copilot Command Centre workshop. You don't
 * edit this file in the labs — your job is to build the agents in `.github/`
 * that operate on this app. (LAB 4 ends with the army editing it for you.)
 */

import './style.css';
import { squad } from './squad';
import { MissionEngine } from './missions';
import { mountDeck } from './navbar';
import { renderHud, renderMissionControl, renderRoster } from './dashboard';

const app = document.querySelector<HTMLDivElement>('#app')!;
const engine = new MissionEngine();

app.innerHTML = `
  <header class="deck">
    <div class="deck-brand">
      <span class="deck-paw">🐾</span>
      <div>
        <span class="deck-eyebrow">Copilot</span>
        <h1>Command Centre</h1>
        <p>${squad.length} agents on duty</p>
      </div>
    </div>
    <div class="deck-track" id="deck-track"></div>
  </header>

  <main class="hq">
    <section class="hud" id="hud"></section>

    <section class="panel">
      <span class="eyebrow">Mission Control</span>
      <h2><span class="panel-dot"></span>Deploy the army</h2>
      <p class="panel-sub lede">Hand the army a task. Watch them run it as a live relay — recon, build, review — with real handoffs.</p>
      <div id="mission-control"></div>
    </section>

    <section class="panel">
      <span class="eyebrow">The Roster</span>
      <h2><span class="panel-dot"></span>Agents on duty</h2>
      <p class="panel-sub lede">Every soldier is a real Copilot agent — its brain lives in <code>.github/agents/</code>.</p>
      <div class="roster-grid" id="roster"></div>
    </section>
  </main>

  <footer class="hq-foot">
    Built in the <strong>Copilot Command Centre</strong> workshop · the soldiers are your agents · go give them a brain
  </footer>`;

mountDeck(document.querySelector<HTMLElement>('#deck-track')!, engine, (id) => {
  const card = document.querySelector(`#card-${id}`);
  if (!card) return;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.classList.remove('ping');
  void (card as HTMLElement).offsetWidth;
  card.classList.add('ping');
});

renderHud(document.querySelector<HTMLElement>('#hud')!, engine);
renderMissionControl(document.querySelector<HTMLElement>('#mission-control')!, engine);
renderRoster(document.querySelector<HTMLElement>('#roster')!, engine);
