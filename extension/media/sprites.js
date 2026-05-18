/*
 * Squad sprite engine — original parametric mascot art.
 *
 * Each mascot is a little standing creature drawn as an SVG. A "state" (walk /
 * idle / cheer) is an 8-frame animation: this file generates the 8 frames by
 * varying pose parameters. The controller lays the frames in a strip and a CSS
 * steps() animation flips through them on the compositor — no per-frame JS.
 *
 * All art here is original to this project.
 */
(function () {
  'use strict';
  var INK = '#141b2e';
  var TAU = Math.PI * 2;

  function n(v) {
    return Math.round(v * 100) / 100;
  }

  /* eyes — open circles, or closed arcs on a blink frame */
  function eyes(cx, cy, spread, blink, scale) {
    scale = scale || 1;
    var lx = cx - spread,
      rx = cx + spread;
    if (blink) {
      return (
        '<path d="M' + n(lx - 3) + ' ' + n(cy) + ' q3 3 6 0" stroke="' + INK +
        '" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
        '<path d="M' + n(rx - 3) + ' ' + n(cy) + ' q3 3 6 0" stroke="' + INK +
        '" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
      );
    }
    var r = 3.1 * scale;
    function eye(x) {
      return (
        '<ellipse cx="' + n(x) + '" cy="' + n(cy) + '" rx="' + n(r) + '" ry="' + n(r + 0.4) +
        '" fill="#fff"/>' +
        '<circle cx="' + n(x + 0.5) + '" cy="' + n(cy + 0.6) + '" r="' + n(r * 0.62) +
        '" fill="' + INK + '"/>' +
        '<circle cx="' + n(x + 1.3) + '" cy="' + n(cy - 0.3) + '" r="0.9" fill="#fff"/>'
      );
    }
    return eye(lx) + eye(rx);
  }

  /* per-animal head, drawn around (hx, hy) with radius hr */
  function head(animal, color, hx, hy, blink, happy) {
    var hr = 11.5;
    var ear = function (path, fill) {
      return '<path d="' + path + '" fill="' + (fill || color) + '"/>';
    };
    var pieces = '';

    if (animal === 'fox') {
      pieces +=
        ear('M' + (hx - 11) + ' ' + (hy - 4) + ' L' + (hx - 13) + ' ' + (hy - 19) + ' L' + (hx - 1) + ' ' + (hy - 8) + ' Z') +
        ear('M' + (hx + 11) + ' ' + (hy - 4) + ' L' + (hx + 13) + ' ' + (hy - 19) + ' L' + (hx + 1) + ' ' + (hy - 8) + ' Z');
      pieces += '<circle cx="' + hx + '" cy="' + hy + '" r="' + hr + '" fill="' + color + '"/>';
      pieces += '<ellipse cx="' + hx + '" cy="' + (hy + 5) + '" rx="7" ry="6" fill="#fff" opacity=".95"/>';
      pieces += eyes(hx, hy - 1, 5, blink, 1);
      pieces += '<ellipse cx="' + hx + '" cy="' + (hy + 3) + '" rx="2" ry="1.6" fill="' + INK + '"/>';
    } else if (animal === 'beaver') {
      pieces +=
        '<circle cx="' + (hx - 9) + '" cy="' + (hy - 9) + '" r="4" fill="' + color + '"/>' +
        '<circle cx="' + (hx + 9) + '" cy="' + (hy - 9) + '" r="4" fill="' + color + '"/>';
      pieces += '<circle cx="' + hx + '" cy="' + hy + '" r="' + hr + '" fill="' + color + '"/>';
      pieces += '<ellipse cx="' + hx + '" cy="' + (hy + 4) + '" rx="6.5" ry="5.5" fill="#fff" opacity=".9"/>';
      pieces += eyes(hx, hy - 2, 5, blink, 1);
      pieces += '<ellipse cx="' + hx + '" cy="' + (hy + 1.5) + '" rx="1.8" ry="1.4" fill="' + INK + '"/>';
      pieces +=
        '<rect x="' + (hx - 2.6) + '" y="' + (hy + 4) + '" width="2.4" height="4.4" rx="0.7" fill="#fff"/>' +
        '<rect x="' + (hx + 0.2) + '" y="' + (hy + 4) + '" width="2.4" height="4.4" rx="0.7" fill="#fff"/>';
    } else if (animal === 'hawk') {
      pieces +=
        ear('M' + (hx - 9) + ' ' + (hy - 7) + ' L' + (hx - 17) + ' ' + (hy - 13) + ' L' + (hx - 5) + ' ' + (hy - 1) + ' Z') +
        ear('M' + (hx + 9) + ' ' + (hy - 7) + ' L' + (hx + 17) + ' ' + (hy - 13) + ' L' + (hx + 5) + ' ' + (hy - 1) + ' Z');
      pieces += '<circle cx="' + hx + '" cy="' + hy + '" r="' + hr + '" fill="' + color + '"/>';
      pieces += eyes(hx, hy - 2, 5, blink, 1);
      pieces +=
        '<path d="M' + (hx - 3) + ' ' + (hy + 3) + ' L' + (hx + 3) + ' ' + (hy + 3) + ' L' + hx + ' ' + (hy + 9) +
        ' Z" fill="#f7b733"/>';
    } else if (animal === 'octopus') {
      pieces += '<ellipse cx="' + hx + '" cy="' + hy + '" rx="' + (hr + 1.5) + '" ry="' + hr + '" fill="' + color + '"/>';
      pieces += eyes(hx, hy - 1, 5.4, blink, 1.15);
      pieces +=
        '<path d="M' + (hx - 4) + ' ' + (hy + 5) + ' q4 ' + (happy ? 5 : 3) + ' 8 0" stroke="' + INK +
        '" stroke-width="1.7" fill="none" stroke-linecap="round"/>';
    } else if (animal === 'owl') {
      pieces +=
        ear('M' + (hx - 10) + ' ' + (hy - 6) + ' L' + (hx - 13) + ' ' + (hy - 16) + ' L' + (hx - 4) + ' ' + (hy - 8) + ' Z') +
        ear('M' + (hx + 10) + ' ' + (hy - 6) + ' L' + (hx + 13) + ' ' + (hy - 16) + ' L' + (hx + 4) + ' ' + (hy - 8) + ' Z');
      pieces += '<circle cx="' + hx + '" cy="' + hy + '" r="' + hr + '" fill="' + color + '"/>';
      if (blink) {
        pieces +=
          '<path d="M' + (hx - 9) + ' ' + (hy - 1) + ' q4 3 8 0" stroke="' + INK + '" stroke-width="1.8" fill="none"/>' +
          '<path d="M' + (hx + 1) + ' ' + (hy - 1) + ' q4 3 8 0" stroke="' + INK + '" stroke-width="1.8" fill="none"/>';
      } else {
        pieces +=
          '<circle cx="' + (hx - 5) + '" cy="' + (hy - 1) + '" r="4.6" fill="#fff"/>' +
          '<circle cx="' + (hx + 5) + '" cy="' + (hy - 1) + '" r="4.6" fill="#fff"/>' +
          '<circle cx="' + (hx - 5) + '" cy="' + (hy - 0.6) + '" r="2.3" fill="' + INK + '"/>' +
          '<circle cx="' + (hx + 5) + '" cy="' + (hy - 0.6) + '" r="2.3" fill="' + INK + '"/>';
      }
      pieces +=
        '<path d="M' + (hx - 2.4) + ' ' + (hy + 3.5) + ' L' + (hx + 2.4) + ' ' + (hy + 3.5) + ' L' + hx + ' ' + (hy + 7.5) +
        ' Z" fill="#f7b733"/>';
    } else {
      /* corgi */
      pieces +=
        ear('M' + (hx - 10) + ' ' + (hy - 3) + ' L' + (hx - 12) + ' ' + (hy - 17) + ' L' + (hx - 2) + ' ' + (hy - 7) + ' Z') +
        ear('M' + (hx + 10) + ' ' + (hy - 3) + ' L' + (hx + 12) + ' ' + (hy - 17) + ' L' + (hx + 2) + ' ' + (hy - 7) + ' Z');
      pieces += '<circle cx="' + hx + '" cy="' + hy + '" r="' + hr + '" fill="' + color + '"/>';
      pieces += '<ellipse cx="' + hx + '" cy="' + (hy + 5) + '" rx="7" ry="5.5" fill="#fff" opacity=".95"/>';
      pieces += eyes(hx, hy - 1, 5, blink, 1);
      pieces += '<ellipse cx="' + hx + '" cy="' + (hy + 2.5) + '" rx="2" ry="1.6" fill="' + INK + '"/>';
      pieces +=
        '<path d="M' + (hx - 2.4) + ' ' + (hy + 6) + ' q2.4 ' + (happy ? 4 : 2.2) + ' 4.8 0 Z" fill="#ff7a8a"/>';
    }
    return pieces;
  }

  /* darken a hex color for shading */
  function shade(hex, f) {
    var r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
    var d = function (c) {
      return Math.max(0, Math.round(c * f));
    };
    var h = function (c) {
      return ('0' + d(c).toString(16)).slice(-2);
    };
    return '#' + h(r) + h(g) + h(b);
  }

  /* one frame of one state */
  function buildFrame(animal, color, state, i) {
    var p = i / 8;
    var ang = p * TAU;
    var dark = shade(color, 0.74);

    var offsetY = 0,
      lean = 0,
      blink = false,
      happy = false;
    var bodyY = 38,
      bodyRy = 13,
      headY = 19;
    var footL = { x: 26, y: 55 },
      footR = { x: 38, y: 55 };
    var armA = 0; // arm swing in degrees
    var armUp = false;
    var shadowR = 12;

    if (state === 'walk') {
      var s = Math.sin(ang);
      footR = { x: 38 + s * 6, y: 55 - Math.max(0, s) * 5 };
      footL = { x: 26 - s * 6, y: 55 - Math.max(0, -s) * 5 };
      offsetY = -Math.abs(Math.sin(ang * 2)) * 2.4;
      lean = s * 4;
      armA = -s * 24;
      headY = 19 + offsetY * 0.4;
    } else if (state === 'cheer') {
      var j = Math.abs(Math.sin(ang));
      offsetY = -j * 11;
      armUp = true;
      happy = true;
      bodyRy = 13 + j * 1.1;
      footL = { x: 28, y: 55 - j * 4 };
      footR = { x: 36, y: 55 - j * 4 };
      shadowR = 12 - j * 5;
      headY = 19 - j * 1.4;
    } else {
      /* idle — breathing + a blink */
      var br = Math.sin(ang);
      bodyRy = 13 + br * 0.7;
      offsetY = -br * 0.7;
      armA = br * 6;
      headY = 19 - br * 0.7;
      blink = i === 4;
    }

    var cx = 32;
    /* limbs */
    function leg(foot, hipX) {
      return (
        '<line x1="' + n(hipX) + '" y1="48" x2="' + n(foot.x) + '" y2="' + n(foot.y - 1) +
        '" stroke="' + dark + '" stroke-width="4.4" stroke-linecap="round"/>' +
        '<ellipse cx="' + n(foot.x) + '" cy="' + n(foot.y) + '" rx="4.6" ry="3" fill="' + dark + '"/>'
      );
    }
    function arm(side) {
      var shoulderX = cx + side * 11.5;
      var deg = armUp ? side * 128 : side * armA;
      return (
        '<g transform="rotate(' + n(deg) + ' ' + n(shoulderX) + ' 34)">' +
        '<ellipse cx="' + n(shoulderX) + '" cy="41" rx="3.4" ry="6" fill="' + dark + '"/>' +
        '</g>'
      );
    }

    var body =
      '<ellipse cx="' + cx + '" cy="' + n(bodyY) + '" rx="12.5" ry="' + n(bodyRy) + '" fill="' + color + '"/>' +
      '<ellipse cx="' + cx + '" cy="' + n(bodyY + 3) + '" rx="7" ry="' + n(bodyRy - 5) + '" fill="#fff" opacity=".16"/>';

    var creature =
      leg(footL, cx - 4) +
      leg(footR, cx + 4) +
      arm(-1) +
      arm(1) +
      body +
      head(animal, color, cx, headY, blink, happy);

    var inner =
      '<g transform="translate(0 ' + n(offsetY) + ') rotate(' + n(lean) + ' 32 54)">' + creature + '</g>';

    var shadow =
      '<ellipse cx="32" cy="59" rx="' + n(shadowR) + '" ry="3" fill="#000" opacity="0.32"/>';

    return (
      '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' + shadow + inner + '</svg>'
    );
  }

  function frames(animal, color, state) {
    var out = [];
    for (var i = 0; i < 8; i++) out.push(buildFrame(animal, color, state, i));
    return out;
  }

  window.Squad = {
    frames: frames,
    frame: buildFrame,
    states: { walk: '0.72s', idle: '2.4s', cheer: '0.62s' },
  };
})();
