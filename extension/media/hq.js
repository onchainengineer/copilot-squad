/* Squad HQ — webview controller. Plain JS, no modules (webview context).
 * Mascot art + frame generation lives in sprites.js (window.Squad). */
(function () {
  'use strict';
  var vscode = acquireVsCodeApi();
  var SQUAD = window.__SQUAD__ || [];
  var Sprite = window.Squad;
  var FRAME_W = 64;

  function stripHTML(animal, color, state) {
    return Sprite.frames(animal, color, state)
      .map(function (svg) {
        return '<div class="frame">' + svg + '</div>';
      })
      .join('');
  }

  /* ── Layout ─────────────────────────────────────────────── */
  var app = document.getElementById('app');
  app.innerHTML =
    '<div class="topbar">' +
    '  <div class="brand">' +
    '    <div class="brand-mark">🐾</div>' +
    '    <div class="brand-text"><h1>Copilot Squad</h1><p>Command Center</p></div>' +
    '  </div>' +
    '  <div class="status-chip"><span class="dot"></span>' + SQUAD.length + ' agents · operational</div>' +
    '</div>' +
    '<div class="deck" id="deck"><span class="deck-label">The Deck</span></div>' +
    '<div>' +
    '  <div class="section-head"><span class="tick"></span><h2>Squad Roster</h2>' +
    '    <span class="count">' + SQUAD.length + ' agents</span></div>' +
    '  <div class="grid" id="grid"></div>' +
    '</div>' +
    '<div>' +
    '  <div class="section-head"><span class="tick"></span><h2>Live Activity</h2>' +
    '    <span class="count" id="ev-count">0 events</span></div>' +
    '  <div class="panel"><div class="stream" id="stream"></div></div>' +
    '</div>' +
    '<div class="actions">' +
    '  <button class="action primary" data-cmd="copilotSquad.askSquad">💬 Ask the Squad</button>' +
    '  <button class="action" data-cmd="copilotSquad.recruit">➕ Recruit an Agent</button>' +
    '  <button class="action" data-cmd="copilotSquad.setup">🚀 Set Up the Squad</button>' +
    '</div>' +
    '<div class="foot">Each mascot is a real Copilot agent · click one to put it to work</div>';

  /* ── Agent cards ────────────────────────────────────────── */
  var grid = document.getElementById('grid');
  SQUAD.forEach(function (agent) {
    var card = document.createElement('div');
    card.className = 'agent';
    card.id = 'agent-' + agent.id;
    card.style.setProperty('--accent', agent.color);
    card.innerHTML =
      '<div class="agent-svg">' + Sprite.frame(agent.animal, agent.color, 'idle', 2) + '</div>' +
      '<div class="agent-info"><h3>' + agent.name + '</h3>' +
      '<div class="role">' + agent.role + '</div>' +
      '<div class="blurb">' + agent.blurb + '</div></div>' +
      '<span class="agent-state">Idle</span>';
    card.addEventListener('click', function () {
      vscode.postMessage({ type: 'select', agentId: agent.id });
    });
    grid.appendChild(card);
  });

  /* ── Roaming sprite pets ────────────────────────────────── */
  var deck = document.getElementById('deck');
  var pets = SQUAD.map(function (agent, i) {
    var el = document.createElement('button');
    el.className = 'pet';
    el.style.setProperty('--accent', agent.color);
    el.title = agent.name + ' — ' + agent.role;
    el.innerHTML =
      '<span class="pet-bubble"></span>' +
      '<span class="sprite"><span class="strip"></span></span>' +
      '<span class="pet-name">' + agent.name + '</span>';
    deck.appendChild(el);

    var pet = {
      agent: agent,
      el: el,
      sprite: el.querySelector('.sprite'),
      strip: el.querySelector('.strip'),
      bubble: el.querySelector('.pet-bubble'),
      x: 14 + i * (FRAME_W + 14),
      dir: Math.random() < 0.5 ? -1 : 1,
      speed: 0.022 + Math.random() * 0.03,
      mode: 'walk',
      state: '',
      restUntil: 0,
      bubbleTimer: 0,
      modeTimer: 0,
    };
    setSprite(pet, 'walk');

    el.addEventListener('click', function () {
      vscode.postMessage({ type: 'select', agentId: agent.id });
    });
    el.addEventListener('mouseenter', function () {
      say(pet, agent.name + ' — ' + agent.role, 3000);
    });
    return pet;
  });
  var petById = {};
  pets.forEach(function (p) {
    petById[p.agent.id] = p;
  });

  function setSprite(pet, state) {
    if (pet.state === state) return;
    pet.state = state;
    pet.strip.style.setProperty('--dur', Sprite.states[state] || '0.72s');
    pet.strip.innerHTML = stripHTML(pet.agent.animal, pet.agent.color, state);
  }

  function say(pet, text, ms) {
    pet.bubble.textContent = text;
    pet.bubble.classList.add('show');
    clearTimeout(pet.bubbleTimer);
    pet.bubbleTimer = setTimeout(function () {
      pet.bubble.classList.remove('show');
    }, ms);
  }

  var last = performance.now();
  function frame(now) {
    var dt = Math.min(now - last, 48);
    last = now;
    var max = deck.clientWidth - FRAME_W - 14;

    pets.forEach(function (pet) {
      if (pet.mode === 'walk') {
        pet.x += pet.dir * pet.speed * dt;
        if (pet.x <= 14) {
          pet.x = 14;
          pet.dir = 1;
        } else if (pet.x >= max) {
          pet.x = Math.max(14, max);
          pet.dir = -1;
        }
        if (Math.random() < 0.0009) pet.dir = -pet.dir;
        if (Math.random() < 0.0014) {
          pet.mode = 'rest';
          pet.restUntil = now + 1400 + Math.random() * 2400;
          setSprite(pet, 'idle');
        }
      } else if (pet.mode === 'rest' && now > pet.restUntil) {
        pet.mode = 'walk';
        setSprite(pet, 'walk');
      }
      pet.el.style.transform = 'translateX(' + pet.x.toFixed(1) + 'px)';
      pet.sprite.style.transform = 'scaleX(' + pet.dir + ')';
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ── Activity stream ────────────────────────────────────── */
  var stream = document.getElementById('stream');
  var evCount = document.getElementById('ev-count');
  var total = 0;
  function addEvent(agent, text) {
    total++;
    evCount.textContent = total + (total === 1 ? ' event' : ' events');
    var row = document.createElement('div');
    row.className = 'event';
    row.style.setProperty('--accent', agent ? agent.color : '#6b8cff');
    var time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    row.innerHTML =
      '<span class="ev-emoji">' + (agent ? agent.emoji : '🐾') + '</span>' +
      '<span class="ev-agent">' + (agent ? agent.name : 'Squad') + '</span>' +
      '<span class="ev-text">' + text + '</span>' +
      '<span class="ev-time">' + time + '</span>';
    stream.insertBefore(row, stream.firstChild);
    while (stream.children.length > 8) stream.removeChild(stream.lastChild);
  }

  function setCard(agentId, working) {
    var card = document.getElementById('agent-' + agentId);
    if (!card) return;
    card.classList.toggle('busy', working);
    var state = card.querySelector('.agent-state');
    if (state) state.textContent = working ? 'Working' : 'Idle';
  }

  /* ── Messages from the extension ────────────────────────── */
  window.addEventListener('message', function (e) {
    var msg = e.data || {};
    if (msg.type === 'pulse') {
      var agent = SQUAD.filter(function (a) {
        return a.id === msg.agentId;
      })[0];
      var pet = petById[msg.agentId];
      if (!agent || !pet) return;
      pet.mode = 'busy';
      pet.el.classList.add('busy');
      setSprite(pet, 'idle');
      say(pet, '⚙ ' + msg.text, 4400);
      setCard(msg.agentId, true);
      addEvent(agent, msg.text);
      clearTimeout(pet.modeTimer);
      pet.modeTimer = setTimeout(function () {
        pet.mode = 'walk';
        pet.el.classList.remove('busy');
        setSprite(pet, 'walk');
        setCard(msg.agentId, false);
      }, 4400);
    } else if (msg.type === 'cheer') {
      pets.forEach(function (pet) {
        pet.mode = 'cheer';
        setSprite(pet, 'cheer');
        say(pet, '✨', 1700);
        clearTimeout(pet.modeTimer);
        pet.modeTimer = setTimeout(function () {
          pet.mode = 'walk';
          setSprite(pet, 'walk');
        }, 1900);
      });
      addEvent(null, msg.text || 'Squad assembled.');
    }
  });

  /* ── Action buttons ─────────────────────────────────────── */
  Array.prototype.forEach.call(document.querySelectorAll('.action'), function (btn) {
    btn.addEventListener('click', function () {
      vscode.postMessage({ type: 'run', command: btn.getAttribute('data-cmd') });
    });
  });
})();
