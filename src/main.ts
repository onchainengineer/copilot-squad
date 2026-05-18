/**
 * Squad HQ — entry point. Assembles the page and wires the panels together.
 *
 * This is the *playground* for the Copilot Squad workshop. You don't need to
 * touch this file in the labs — your job is to build the agents in `.github/`
 * that operate on this app. (LAB 4 ends with the squad editing it for you.)
 */

import './style.css';
import { squad } from './squad';
import { mountDeck } from './navbar';
import { renderRoster, renderMissionControl, startComms } from './dashboard';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <header class="deck">
    <div class="deck-brand">
      <span class="deck-paw">🐾</span>
      <div>
        <h1>Copilot Squad</h1>
        <p>${squad.length} agents on duty</p>
      </div>
    </div>
    <div class="deck-track" id="deck-track"></div>
  </header>

  <main class="hq">
    <section class="panel panel-mc">
      <h2><span class="panel-dot"></span>Mission Control</h2>
      <p class="panel-sub">Hand the Captain a task. They'll route it to the right teammate.</p>
      <div id="mission-control"></div>
    </section>

    <section class="panel panel-roster">
      <h2><span class="panel-dot"></span>The Roster</h2>
      <p class="panel-sub">Every pet is a real Copilot agent — its file lives in <code>.github/agents/</code>.</p>
      <div class="roster-grid" id="roster"></div>
    </section>

    <section class="panel panel-comms">
      <h2><span class="panel-dot"></span>Squad Comms</h2>
      <div class="comms-feed" id="comms"></div>
    </section>
  </main>

  <footer class="hq-foot">
    Built in the <strong>Copilot Squad</strong> workshop · the pets are your agents · go give them a brain
  </footer>`;

const track = document.querySelector<HTMLElement>('#deck-track')!;

mountDeck(track, (id) => {
  const card = document.querySelector(`#card-${id}`);
  if (!card) return;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.classList.remove('ping');
  void (card as HTMLElement).offsetWidth; // restart the animation
  card.classList.add('ping');
});

renderRoster(document.querySelector<HTMLElement>('#roster')!);
renderMissionControl(document.querySelector<HTMLElement>('#mission-control')!);
startComms(document.querySelector<HTMLElement>('#comms')!);
