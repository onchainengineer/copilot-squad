/* Squad HQ — webview controller. Plain ES5-ish JS, no modules (webview context). */
(function () {
  'use strict';
  var vscode = acquireVsCodeApi();
  var SQUAD = window.__SQUAD__ || [];
  var INK = '#141926';

  /* ── Mascot art ─────────────────────────────────────────── */
  function eyes(cy, dx) {
    cy = cy || 50;
    dx = dx || 13;
    return (
      '<circle cx="' + (50 - dx) + '" cy="' + cy + '" r="7" fill="#fff"/>' +
      '<circle cx="' + (50 + dx) + '" cy="' + cy + '" r="7" fill="#fff"/>' +
      '<circle cx="' + (50 - dx + 1) + '" cy="' + (cy + 1) + '" r="4" fill="' + INK + '"/>' +
      '<circle cx="' + (50 + dx + 1) + '" cy="' + (cy + 1) + '" r="4" fill="' + INK + '"/>' +
      '<circle cx="' + (50 - dx + 2.5) + '" cy="' + (cy - 0.5) + '" r="1.6" fill="#fff"/>' +
      '<circle cx="' + (50 + dx + 2.5) + '" cy="' + (cy - 0.5) + '" r="1.6" fill="#fff"/>'
    );
  }
  var BUILDERS = {
    fox: function (c) {
      return (
        '<path d="M20 40 L30 6 L48 32 Z" fill="' + c + '"/><path d="M80 40 L70 6 L52 32 Z" fill="' + c + '"/>' +
        '<ellipse cx="50" cy="58" rx="35" ry="33" fill="' + c + '"/>' +
        '<ellipse cx="50" cy="72" rx="22" ry="17" fill="#fff" opacity=".95"/>' +
        eyes(53, 14) + '<ellipse cx="50" cy="66" rx="5.5" ry="4.2" fill="' + INK + '"/>'
      );
    },
    beaver: function (c) {
      return (
        '<circle cx="26" cy="24" r="11" fill="' + c + '"/><circle cx="74" cy="24" r="11" fill="' + c + '"/>' +
        '<ellipse cx="50" cy="60" rx="36" ry="34" fill="' + c + '"/>' +
        '<ellipse cx="50" cy="70" rx="20" ry="16" fill="#fff" opacity=".9"/>' +
        eyes(50, 13) + '<ellipse cx="50" cy="64" rx="4.5" ry="3.5" fill="' + INK + '"/>' +
        '<rect x="44" y="69" width="5.5" height="11" rx="1.5" fill="#fff"/>' +
        '<rect x="50.5" y="69" width="5.5" height="11" rx="1.5" fill="#fff"/>'
      );
    },
    hawk: function (c) {
      return (
        '<path d="M16 36 L34 14 L42 34 Z" fill="' + c + '"/><path d="M84 36 L66 14 L58 34 Z" fill="' + c + '"/>' +
        '<ellipse cx="50" cy="56" rx="35" ry="34" fill="' + c + '"/>' + eyes(50, 14) +
        '<path d="M50 60 L60 66 L50 78 L40 66 Z" fill="#f9b234"/>'
      );
    },
    octopus: function (c) {
      return (
        '<path d="M14 76 q6 14 12 0 q6 14 12 0 q6 14 12 0 q6 14 12 0 q6 14 12 0 q6 14 12 0" ' +
        'fill="none" stroke="' + c + '" stroke-width="9" stroke-linecap="round"/>' +
        '<ellipse cx="50" cy="48" rx="36" ry="34" fill="' + c + '"/>' + eyes(46, 14) +
        '<path d="M40 62 q10 9 20 0" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>'
      );
    },
    owl: function (c) {
      return (
        '<path d="M22 22 L32 6 L40 24 Z" fill="' + c + '"/><path d="M78 22 L68 6 L60 24 Z" fill="' + c + '"/>' +
        '<ellipse cx="50" cy="56" rx="36" ry="35" fill="' + c + '"/>' +
        '<circle cx="37" cy="50" r="15" fill="#fff" opacity=".95"/><circle cx="63" cy="50" r="15" fill="#fff" opacity=".95"/>' +
        '<circle cx="38" cy="51" r="7" fill="' + INK + '"/><circle cx="62" cy="51" r="7" fill="' + INK + '"/>' +
        '<circle cx="40" cy="49" r="2.4" fill="#fff"/><circle cx="64" cy="49" r="2.4" fill="#fff"/>' +
        '<path d="M50 60 L57 67 L50 74 L43 67 Z" fill="#f9b234"/>'
      );
    },
    corgi: function (c) {
      return (
        '<path d="M50 30 L84 50 L78 86 L22 86 L16 50 Z" fill="#f9b234" opacity=".9"/>' +
        '<path d="M22 42 L30 8 L46 34 Z" fill="' + c + '"/><path d="M78 42 L70 8 L54 34 Z" fill="' + c + '"/>' +
        '<ellipse cx="50" cy="58" rx="35" ry="33" fill="' + c + '"/>' +
        '<ellipse cx="50" cy="72" rx="23" ry="17" fill="#fff" opacity=".95"/>' +
        eyes(53, 14) + '<ellipse cx="50" cy="66" rx="5" ry="4" fill="' + INK + '"/>' +
        '<path d="M44 76 q6 8 12 0 Z" fill="#ff7a8a"/>'
      );
    },
  };
  function mascot(agent) {
    var build = BUILDERS[agent.animal];
    var inner = build
      ? build(agent.color)
      : '<ellipse cx="50" cy="56" rx="35" ry="34" fill="' + agent.color + '"/>' + eyes(50, 13);
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
  }

  var IDLE = ['standing by', 'systems nominal', 'ready', 'on watch', 'awaiting orders'];

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
      '<div class="agent-svg">' + mascot(agent) + '</div>' +
      '<div class="agent-info"><h3>' + agent.name + '</h3>' +
      '<div class="role">' + agent.role + '</div>' +
      '<div class="blurb">' + agent.blurb + '</div></div>' +
      '<span class="agent-state">Idle</span>';
    card.addEventListener('click', function () {
      vscode.postMessage({ type: 'select', agentId: agent.id });
    });
    grid.appendChild(card);
  });

  /* ── Roaming pets ───────────────────────────────────────── */
  var deck = document.getElementById('deck');
  var SIZE = 60;
  var pets = SQUAD.map(function (agent, i) {
    var el = document.createElement('button');
    el.className = 'pet';
    el.style.setProperty('--accent', agent.color);
    el.title = agent.name + ' — ' + agent.role;
    el.innerHTML =
      '<span class="pet-bubble"></span>' +
      '<span class="pet-svg">' + mascot(agent) + '</span>' +
      '<span class="pet-name">' + agent.name + '</span>';
    deck.appendChild(el);
    var pet = {
      agent: agent,
      el: el,
      svg: el.querySelector('.pet-svg'),
      bubble: el.querySelector('.pet-bubble'),
      x: 14 + i * (SIZE + 18),
      dir: Math.random() < 0.5 ? -1 : 1,
      speed: 0.02 + Math.random() * 0.035,
      phase: Math.random() * 6.28,
      busy: false,
      cheerUntil: 0,
      bubbleTimer: 0,
    };
    el.addEventListener('click', function () {
      vscode.postMessage({ type: 'select', agentId: agent.id });
    });
    el.addEventListener('mouseenter', function () {
      say(pet, agent.name + ': ' + IDLE[(Math.random() * IDLE.length) | 0], 3200);
    });
    return pet;
  });
  var petById = {};
  pets.forEach(function (p) {
    petById[p.agent.id] = p;
  });

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
    var max = deck.clientWidth - SIZE - 14;
    pets.forEach(function (pet) {
      pet.phase += dt * 0.005;
      var cheering = now < pet.cheerUntil;
      if (!pet.busy && !cheering) {
        pet.x += pet.dir * pet.speed * dt;
        if (pet.x <= 14) {
          pet.x = 14;
          pet.dir = 1;
        } else if (pet.x >= max) {
          pet.x = Math.max(14, max);
          pet.dir = -1;
        }
        if (Math.random() < 0.001) pet.dir = -pet.dir;
      }
      var bob = cheering
        ? -Math.abs(Math.sin(pet.phase * 3)) * 14
        : Math.sin(pet.phase) * (pet.busy ? 6 : 4);
      pet.el.style.transform = 'translate(' + pet.x + 'px,' + bob + 'px)';
      pet.svg.style.transform = 'scaleX(' + pet.dir + ')';
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

  function setBusy(agentId, on) {
    var pet = petById[agentId];
    var card = document.getElementById('agent-' + agentId);
    if (pet) {
      pet.busy = on;
      pet.el.classList.toggle('busy', on);
    }
    if (card) {
      card.classList.toggle('busy', on);
      var state = card.querySelector('.agent-state');
      if (state) state.textContent = on ? 'Working' : 'Idle';
    }
  }

  /* ── Messages from the extension ────────────────────────── */
  window.addEventListener('message', function (e) {
    var msg = e.data || {};
    if (msg.type === 'pulse') {
      var agent = SQUAD.filter(function (a) {
        return a.id === msg.agentId;
      })[0];
      if (!agent) return;
      setBusy(msg.agentId, true);
      var pet = petById[msg.agentId];
      if (pet) say(pet, '⚙ ' + msg.text, 4200);
      addEvent(agent, msg.text);
      clearTimeout(petById[msg.agentId] && petById[msg.agentId]._t);
      var t = setTimeout(function () {
        setBusy(msg.agentId, false);
      }, 4200);
      if (pet) pet._t = t;
    } else if (msg.type === 'cheer') {
      var now = performance.now();
      pets.forEach(function (p) {
        p.cheerUntil = now + 1700;
        say(p, '✨', 1500);
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
