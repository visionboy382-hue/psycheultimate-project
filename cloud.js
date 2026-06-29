/* ============================================================
   PSYCHE v22  ·  PRISM personality engine
   Framework & app by Aryan S
   Self-contained · offline · zero AI / zero network dependency
   ============================================================ */
(function () {
'use strict';

/* ---------------- author / credit ---------------- */
var AUTHOR = { name: 'Aryan S', tagline: 'Framework & app by Aryan S', link: '' };

/* ---------------- storage (localStorage + memory fallback) ---------------- */
var Store = (function () {
  var mem = {}, ok = false;
  try { localStorage.setItem('__p', '1'); localStorage.removeItem('__p'); ok = true; } catch (e) { ok = false; }
  return {
    get: function (k) { try { return ok ? localStorage.getItem(k) : (k in mem ? mem[k] : null); } catch (e) { return mem[k] || null; } },
    set: function (k, v) { try { ok ? localStorage.setItem(k, v) : (mem[k] = v); } catch (e) { mem[k] = v; } },
    del: function (k) { try { ok ? localStorage.removeItem(k) : (delete mem[k]); } catch (e) { delete mem[k]; } }
  };
})();
var K = { result: 'psyche.result', journal: 'psyche.journal', progress: 'psyche.progress', settings: 'psyche.settings', seen: 'psyche.seen' };

/* ---------------- DATA: dimensions, facets, traits ---------------- */
var DIM_ORDER = ['P', 'R', 'I', 'S', 'M'];
var DIMS = {
  P: { name: 'Perception', color: '#7c3aed', blurb: 'How you take in the world.', facets: {
    abstraction:   { name: 'Abstraction',   hi: ['Conceptual', 'Lives in ideas, models, and what-could-be.'],          lo: ['Concrete', 'Trusts the tangible, the literal, the proven.'] },
    curiosity:     { name: 'Curiosity',     hi: ['Explorer', 'Pulled toward the new and the unknown.'],                 lo: ['Settled', 'Content within the known and familiar.'] },
    attention:     { name: 'Attention',     hi: ['Panoramic', 'Scans wide; sees the whole field at once.'],            lo: ['Focused', 'Narrows in; one thing, fully.'] },
    intuition:     { name: 'Intuition',     hi: ['Pattern-reader', 'Reads between the lines, senses the whole.'],      lo: ['Literalist', 'Takes things at face value, as stated.'] }
  }},
  R: { name: 'Response', color: '#2563eb', blurb: 'How you react and move.', facets: {
    tempo:         { name: 'Tempo',         hi: ['Quick', 'Decides on the move and adjusts as you go.'],               lo: ['Measured', 'Pauses, weighs, then acts.'] },
    expression:    { name: 'Expression',    hi: ['Expressive', 'Shows what is inside, openly.'],                       lo: ['Reserved', 'Keeps the inner world inner.'] },
    adaptability:  { name: 'Adaptability',  hi: ['Fluid', 'Bends with the moment, improvises.'],                       lo: ['Steady', 'Holds the plan, resists the swerve.'] },
    risk:          { name: 'Risk',          hi: ['Bold', 'Leans into the bet and the leap.'],                          lo: ['Cautious', 'Protects the downside first.'] }
  }},
  I: { name: 'Identity', color: '#d97706', blurb: 'Your sense of self.', facets: {
    autonomy:      { name: 'Autonomy',      hi: ['Independent', 'Steers by an inner compass.'],                        lo: ['Yielding', 'Defers to the lead and judgment of others.'] },
    conviction:    { name: 'Conviction',    hi: ['Resolute', 'Holds beliefs firmly; hard to move.'],                   lo: ['Open', 'Holds beliefs loosely; easily revised.'] },
    distinct:      { name: 'Distinctiveness', hi: ['Singular', 'Wants to stand apart, unmistakable.'],                 lo: ['Belonging', 'Wants to fit and to be of the group.'] },
    stability:     { name: 'Stability',     hi: ['Grounded', 'A stable, continuous sense of self.'],                   lo: ['Fluid', 'A self that shifts with context.'] }
  }},
  S: { name: 'Social', color: '#e11d48', blurb: 'How you relate to others.', facets: {
    warmth:        { name: 'Warmth',        hi: ['Warm', 'Leads with care and openness.'],                            lo: ['Detached', 'Keeps a cool, measured distance.'] },
    gregarious:    { name: 'Gregariousness', hi: ['Sociable', 'Energized by people and gathering.'],                  lo: ['Solitary', 'Restored by space and solitude.'] },
    empathy:       { name: 'Empathy',       hi: ['Attuned', 'Feels what others feel, quickly.'],                       lo: ['Objective', 'Reads situations head over heart.'] },
    harmony:       { name: 'Harmony',       hi: ['Accommodating', 'Smooths friction; seeks the peace.'],               lo: ['Frank', 'Says the hard thing; holds the line.'] }
  }},
  M: { name: 'Motivation', color: '#059669', blurb: 'What drives you forward.', facets: {
    drive:         { name: 'Drive',         hi: ['Striving', 'Always reaching for the next rung.'],                    lo: ['Content', 'At ease with enough.'] },
    discipline:    { name: 'Discipline',    hi: ['Structured', 'Runs on systems, plans, and order.'],                  lo: ['Spontaneous', 'Runs on impulse and the open day.'] },
    ambition:      { name: 'Ambition',      hi: ['Ambitious', 'Aims big; thinks in empires.'],                         lo: ['Modest', 'Aims true; thinks in enough.'] },
    persistence:   { name: 'Persistence',   hi: ['Relentless', 'Finishes what starts; outlasts.'],                     lo: ['Mercurial', 'Chases the spark; moves on fast.'] }
  }}
};

/* ---------------- QUESTIONS (40 · 2 per facet) ---------------- */
function Q(t, f, d) { return { t: t, f: f, d: d }; }
var QUESTIONS = [
  Q("I'd rather explore a theory than work through a checklist of facts.", 'P.abstraction', 1),
  Q("I trust what I can see and touch over what I can imagine.", 'P.abstraction', -1),
  Q("New and unfamiliar things pull me in.", 'P.curiosity', 1),
  Q("I'm happiest sticking with what I already know works.", 'P.curiosity', -1),
  Q("I naturally take in the whole situation, not just one part.", 'P.attention', 1),
  Q("I lock onto one thing and tune everything else out.", 'P.attention', -1),
  Q("I often sense the pattern before I can explain it.", 'P.intuition', 1),
  Q("I take things literally, exactly as they're said.", 'P.intuition', -1),

  Q("I decide quickly and adjust as I go.", 'R.tempo', 1),
  Q("I like to sit with a decision before I make it.", 'R.tempo', -1),
  Q("People can easily tell what I'm feeling.", 'R.expression', 1),
  Q("I keep my reactions to myself.", 'R.expression', -1),
  Q("I improvise comfortably when plans change.", 'R.adaptability', 1),
  Q("I prefer to stick to the plan once it's set.", 'R.adaptability', -1),
  Q("I'm drawn to bold bets, even risky ones.", 'R.risk', 1),
  Q("I protect against the downside before I act.", 'R.risk', -1),

  Q("I steer by my own judgment, not the crowd's.", 'I.autonomy', 1),
  Q("I usually defer to what others think is best.", 'I.autonomy', -1),
  Q("Once I believe something, I'm hard to move.", 'I.conviction', 1),
  Q("I change my mind easily when I hear a good point.", 'I.conviction', -1),
  Q("I want to stand apart from everyone else.", 'I.distinct', 1),
  Q("I'd rather blend in and belong.", 'I.distinct', -1),
  Q("Who I am stays the same across every situation.", 'I.stability', 1),
  Q("I feel like a different person depending on where I am.", 'I.stability', -1),

  Q("I lead with warmth toward people I meet.", 'S.warmth', 1),
  Q("I keep a cool distance until people earn closeness.", 'S.warmth', -1),
  Q("Being around people energizes me.", 'S.gregarious', 1),
  Q("I recharge best when I'm alone.", 'S.gregarious', -1),
  Q("I feel other people's emotions almost as my own.", 'S.empathy', 1),
  Q("I read situations with my head before my heart.", 'S.empathy', -1),
  Q("I'll smooth over conflict to keep the peace.", 'S.harmony', 1),
  Q("I'll say the hard thing even if it causes friction.", 'S.harmony', -1),

  Q("I'm always reaching for the next goal.", 'M.drive', 1),
  Q("I'm content once I have enough.", 'M.drive', -1),
  Q("I run my life on systems and plans.", 'M.discipline', 1),
  Q("I'd rather keep my days open and spontaneous.", 'M.discipline', -1),
  Q("I think big — I want to build something large.", 'M.ambition', 1),
  Q("I aim for what's enough, not what's grand.", 'M.ambition', -1),
  Q("I finish what I start, even when it drags.", 'M.persistence', 1),
  Q("I chase what excites me and move on quickly.", 'M.persistence', -1)
];

/* ---------------- ARCHETYPES (21) ---------------- */
function A(name, tag, desc, str, shadow, stress, growth) {
  return { name: name, tag: tag, desc: desc, strengths: str, shadow: shadow, stress: stress, growth: growth };
}
var ARCH = {
  P: {
    R: A('The Oracle', 'Perception-led · Response-driven', "You read the room before it speaks and act on what others haven't noticed yet. Insight arrives fast, and you move on it.", ['Pattern recognition', 'Fast read of people', 'Timely instinct'], "Can leap on a hunch before it's checked.", "retreats into overthinking and second-guessing.", "Slow down just enough to verify the signal."),
    I: A('The Visionary', 'Perception-led · Identity-driven', "You see futures others can't, and you're certain enough to chase them. Inner conviction turns vision into direction.", ['Big-picture sight', 'Conviction', 'Originality'], "May dismiss feedback that doesn't fit the vision.", "becomes rigid and isolated when challenged.", "Pressure-test the vision against reality."),
    S: A('The Empath', 'Perception-led · Social-driven', "You perceive what people feel before they say it, and you move to meet them there. Attunement is your instrument.", ['Emotional radar', 'Deep listening', 'Reads subtext'], "Absorbs others' states until your own blur.", "withdraws or over-gives when overwhelmed.", "Guard the line between their feelings and yours."),
    M: A('The Seeker', 'Perception-led · Motivation-driven', "You're driven by the hunt for understanding — always one question deeper. Curiosity is the engine; insight is the prize.", ['Relentless curiosity', 'Synthesis', 'Self-direction'], "Starts more threads than you finish.", "scatters across too many open questions.", "Convert questions into one finished answer.")
  },
  R: {
    P: A('The Improviser', 'Response-led · Perception-driven', "You think on your feet and read the moment to do it. Plans are optional; presence is everything.", ['Adaptability', 'Quick wit', 'Grace under change'], "Allergic to the structure that would help you.", "reacts instead of choosing.", "Build a little scaffolding before the jump."),
    I: A('The Catalyst', 'Response-led · Identity-driven', "You move first and you mean it. Action plus conviction makes you the spark others follow.", ['Initiative', 'Decisiveness', 'Momentum'], "Acts before the room is ready.", "pushes harder the moment it's resisted.", "Pair the push with a pause."),
    S: A('The Performer', 'Response-led · Social-driven', "You light up a room and feed off the exchange. Expression and people are your current.", ['Charisma', 'Expressiveness', 'Read of an audience'], "Can need the spotlight to feel real.", "performs even when you should rest.", "Find a self that exists off-stage."),
    M: A('The Striker', 'Response-led · Motivation-driven', "You convert drive into immediate action. When others deliberate, you've already started.", ['Bias to action', 'Drive', 'Execution speed'], "Moves so fast you skip the map.", "burns out chasing the next hit.", "Aim before you fire.")
  },
  I: {
    P: A('The Philosopher', 'Identity-led · Perception-driven', "You're anchored in who you are and forever examining why. Conviction meets contemplation.", ['Depth', 'Principled', 'Independent thought'], "Lives in the head, late to act.", "detaches into pure analysis.", "Let an idea touch the world."),
    R: A('The Maverick', 'Identity-led · Response-driven', "You know who you are and you act on it — rules be damned. Independence with a motor.", ['Boldness', 'Authenticity', 'Self-trust'], "Breaks things that didn't need breaking.", "doubles down when cornered.", "Pick which rules are worth the fight."),
    S: A('The Sovereign', 'Identity-led · Social-driven', "You hold a strong center and gather people around it. Self-defined, yet built to lead.", ['Presence', 'Inspires loyalty', 'Steady identity'], "Can mistake your way for the only way.", "controls rather than trusts.", "Lead by widening, not narrowing."),
    M: A('The Architect', 'Identity-led · Motivation-driven', "You build systems others end up living inside. A strong sense of self plus long-range drive — you design the future, then construct it.", ['Systems thinking', 'Long-horizon vision', 'Self-reliant drive'], "Can over-build and under-ship; perfection delays the launch.", "withdraws into the blueprint when overwhelmed.", "Ship the imperfect version — completion compounds.")
  },
  S: {
    P: A('The Diplomat', 'Social-led · Perception-driven', "You sense the currents between people and steer them gently. Harmony guided by insight.", ['Tact', 'Mediation', 'Social foresight'], "Avoids the conflict that's necessary.", "goes quiet and accommodates too much.", "Let honesty share the wheel with peace."),
    R: A('The Host', 'Social-led · Response-driven', "You bring people together and keep the energy moving. Connection is your craft, in real time.", ['Warmth', 'Brings people in', 'Lively presence'], "Finds it hard to be alone with yourself.", "over-extends to keep everyone happy.", "Host yourself sometimes, too."),
    I: A('The Anchor', 'Social-led · Identity-driven', "You're the steady one others orbit — warm, but rooted in a clear self.", ['Reliability', 'Loyalty', 'Calm in others\u2019 storms'], "Carries weight that isn't yours to carry.", "suppresses your own needs.", "Let people anchor you back."),
    M: A('The Mobilizer', 'Social-led · Motivation-driven', "You rally people toward a goal and won't let the group lose heart. Connection in service of a mission.", ['Galvanizing', 'Team drive', 'Follow-through with people'], "Pushes the group past its limits.", "takes the mission's setbacks personally.", "Pace the people, not just the goal.")
  },
  M: {
    P: A('The Strategist', 'Motivation-led · Perception-driven', "You play several moves ahead and act on the read. Ambition guided by a wide, sharp eye.", ['Foresight', 'Planning', 'Calm calculation'], "Can wait too long for the perfect moment.", "over-plans and under-commits.", "Trade some certainty for momentum."),
    R: A('The Driver', 'Motivation-led · Response-driven', "You want it and you go get it — now. Pure forward force.", ['Energy', 'Decisiveness', 'Closing power'], "Runs over nuance and people.", "equates rest with failure.", "Let the engine idle without guilt."),
    I: A('The Founder', 'Motivation-led · Identity-driven', "You're built to start things and stake your identity on them. Ambition fused with self.", ['Vision', 'Ownership', 'Resilience'], "Ties self-worth to the outcome.", "isolates under the load.", "Separate who you are from what you build."),
    S: A('The Champion', 'Motivation-led · Social-driven', "You chase big goals and bring everyone with you. Drive that lifts the room.", ['Inspiring drive', 'Generous ambition', 'Team lift'], "Overcommits to too many causes.", "depletes giving more than you have.", "Choose the few worth your fire.")
  },
  PRISM: A('The Prism', 'Evenly refracted', "No single dimension owns you — you flex across all five. Rare, versatile, and hard to pin down; your strength is range itself.", ['Versatility', 'Balance', 'Range'], "Without a clear center, focus can drift.", "spreads thin trying to be everything.", "Choose a lead dimension for each season.")
};

/* ---------------- ENGINE ---------------- */
var Engine = {
  facetKeys: function () {
    var out = [];
    DIM_ORDER.forEach(function (d) { Object.keys(DIMS[d].facets).forEach(function (f) { out.push(d + '.' + f); }); });
    return out;
  },
  score: function (answers) {
    var facets = {};
    Engine.facetKeys().forEach(function (key) {
      var qs = QUESTIONS.filter(function (q) { return q.f === key; });
      var raw = 0;
      qs.forEach(function (q) { var v = answers[QUESTIONS.indexOf(q)]; if (v == null) v = 3; raw += (v - 3) * q.d; });
      var max = qs.length * 2;
      facets[key] = Math.round(((raw + max) / (2 * max)) * 100);
    });
    var dims = {};
    DIM_ORDER.forEach(function (d) {
      var fk = Object.keys(DIMS[d].facets).map(function (f) { return d + '.' + f; });
      var sum = fk.reduce(function (a, k) { return a + facets[k]; }, 0);
      dims[d] = Math.round(sum / fk.length);
    });
    return { dims: dims, facets: facets };
  },
  match: function (dims) {
    var ranked = DIM_ORDER.slice().sort(function (a, b) { return dims[b] - dims[a]; });
    var hi = dims[ranked[0]], lo = dims[ranked[4]], spread = hi - lo;
    var primary = ranked[0], secondary = ranked[1];
    var key, arche;
    if (spread < 10) { key = 'PRISM'; arche = ARCH.PRISM; }
    else { key = primary + secondary; arche = ARCH[primary][secondary]; }
    var conf = Math.max(35, Math.min(99, Math.round((dims[primary] - dims[secondary]) * 2 + spread + 30)));
    return { key: key, arche: arche, primary: primary, secondary: secondary, code: key === 'PRISM' ? 'BALANCED' : (primary + '·' + secondary), confidence: conf };
  },
  signatureTraits: function (facets) {
    var out = [];
    Engine.facetKeys().forEach(function (key) {
      var parts = key.split('.'), dim = parts[0], fk = parts[1];
      var s = facets[key], dev = s - 50, fac = DIMS[dim].facets[fk];
      if (Math.abs(dev) >= 14) out.push({ dim: dim, color: DIMS[dim].color, name: (dev > 0 ? fac.hi[0] : fac.lo[0]), dev: Math.abs(dev) });
    });
    out.sort(function (a, b) { return b.dev - a.dev; });
    return out.slice(0, 6);
  },
  compatibility: function (a, b, an, bn) {
    var diffs = {}, sum = 0;
    DIM_ORDER.forEach(function (d) { diffs[d] = Math.abs(a[d] - b[d]); sum += diffs[d]; });
    var avg = sum / 5;
    var score = Math.round(Math.max(32, Math.min(97, 100 - avg * 0.72)));
    var notes = [];
    // shared strength
    var shared = DIM_ORDER.filter(function (d) { return a[d] >= 60 && b[d] >= 60; })
      .sort(function (x, y) { return (a[y] + b[y]) - (a[x] + b[x]); });
    if (shared.length) notes.push({ t: 'Shared ground', p: 'You both run high on ' + DIMS[shared[0]].name + '. It\u2019s easy, instinctive territory between you.' });
    // complement
    var comp = DIM_ORDER.slice().sort(function (x, y) { return diffs[y] - diffs[x]; })[0];
    if (diffs[comp] >= 22) {
      var hi = a[comp] >= b[comp] ? an : bn, loN = a[comp] >= b[comp] ? bn : an;
      notes.push({ t: 'Natural division', p: hi + ' leads in ' + DIMS[comp].name + ' where ' + loN + ' steps back — complementary, if you let it be.' });
    }
    // friction
    if (a.I >= 66 && b.I >= 66) notes.push({ t: 'Watch: two centers', p: 'Strong identities on both sides — give each other room to lead.' });
    else if (a.S < 42 && b.S < 42) notes.push({ t: 'Watch: distance', p: 'Neither of you reaches out first. Someone has to make the call.' });
    else if (diffs.R >= 26) notes.push({ t: 'Watch: pace', p: 'One moves fast, one moves measured. Name the tempo gap early.' });
    if (notes.length < 2) notes.push({ t: 'Quiet balance', p: 'No loud clashes here — the work is keeping it from going flat.' });
    return { score: score, notes: notes.slice(0, 3) };
  },
  exemplar: function (archKey) {
    var dims = { P: 45, R: 45, I: 45, S: 45, M: 45 };
    if (archKey === 'PRISM') { DIM_ORDER.forEach(function (d) { dims[d] = 55; }); return dims; }
    dims[archKey[0]] = 84; dims[archKey[1]] = 70;
    return dims;
  }
};

/* ---------------- STATE ---------------- */
var state = {
  tab: 'home',
  result: load(K.result),
  journal: load(K.journal) || [],
  progress: load(K.progress),
  settings: load(K.settings) || { dark: false }
};
function load(k) { var v = Store.get(k); try { return v ? JSON.parse(v) : null; } catch (e) { return null; } }
function save(k, v) { Store.set(k, JSON.stringify(v)); }

/* ---------------- helpers ---------------- */
var $ = function (s, r) { return (r || document).querySelector(s); };
function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
function fmtDate(ts) { var d = new Date(ts); return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }); }
function initials(name) { return name.replace(/^The\s+/, '').slice(0, 1).toUpperCase(); }
function toast(msg) {
  var t = el('<div class="toast">' + esc(msg) + '</div>'); $('#app').appendChild(t);
  setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 250); }, 1700);
}

/* ---------------- spectrum + radar render ---------------- */
function spectrumHTML(dims) {
  return '<div class="spectrum">' + DIM_ORDER.map(function (d) {
    return '<div class="sbar"><div class="lab"><b>' + DIMS[d].name + '</b><span class="v">' + dims[d] + '</span></div>' +
      '<div class="track"><div class="fill" data-w="' + dims[d] + '" style="background:' + DIMS[d].color + '"></div></div></div>';
  }).join('') + '</div>';
}
function animateFills(root) {
  (root || document).querySelectorAll('.fill[data-w]').forEach(function (f) {
    requestAnimationFrame(function () { f.style.width = f.getAttribute('data-w') + '%'; });
  });
}
function radarSVG(dims, size) {
  size = size || 230; var c = size / 2, R = c - 30;
  var pts = DIM_ORDER.map(function (d, i) {
    var ang = -Math.PI / 2 + i * (2 * Math.PI / 5);
    var r = R * (dims[d] / 100);
    return [c + r * Math.cos(ang), c + r * Math.sin(ang)];
  });
  var axis = DIM_ORDER.map(function (d, i) {
    var ang = -Math.PI / 2 + i * (2 * Math.PI / 5);
    var x = c + R * Math.cos(ang), y = c + R * Math.sin(ang);
    var lx = c + (R + 16) * Math.cos(ang), ly = c + (R + 16) * Math.sin(ang);
    return { x: x, y: y, lx: lx, ly: ly, d: d, ang: ang };
  });
  var grid = [0.25, 0.5, 0.75, 1].map(function (g) {
    var p = DIM_ORDER.map(function (d, i) { var a = -Math.PI / 2 + i * (2 * Math.PI / 5); return (c + R * g * Math.cos(a)) + ',' + (c + R * g * Math.sin(a)); }).join(' ');
    return '<polygon points="' + p + '" fill="none" stroke="var(--line)" stroke-width="1"/>';
  }).join('');
  var spokes = axis.map(function (a) { return '<line x1="' + c + '" y1="' + c + '" x2="' + a.x + '" y2="' + a.y + '" stroke="var(--line)" stroke-width="1"/>'; }).join('');
  var poly = '<polygon points="' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') + '" fill="color-mix(in srgb,var(--accent) 14%,transparent)" stroke="var(--accent)" stroke-width="2"/>';
  var verts = pts.map(function (p, i) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4" fill="' + DIMS[DIM_ORDER[i]].color + '"/>'; }).join('');
  var labels = axis.map(function (a) {
    var anchor = Math.abs(a.lx - c) < 6 ? 'middle' : (a.lx > c ? 'start' : 'end');
    return '<text x="' + a.lx.toFixed(1) + '" y="' + (a.ly + 4).toFixed(1) + '" text-anchor="' + anchor + '" font-family="Space Mono,monospace" font-size="10" fill="var(--mut)">' + a.d + '</text>';
  }).join('');
  return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '">' + grid + spokes + poly + verts + labels + '</svg>';
}

/* ============================================================
   VIEWS
   ============================================================ */
function render() {
  var v = $('#view'); v.scrollTop = 0;
  var fn = ({ home: viewHome, you: viewYou, atlas: viewAtlas, match: viewMatch, journal: viewJournal })[state.tab];
  v.innerHTML = '<div class="pad screen-anim">' + fn() + '</div>';
  document.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('act', t.getAttribute('data-tab') === state.tab); });
  animateFills(v);
  if (state.tab === 'you' && state._mountYouViz) state._mountYouViz();
  if (state.tab === 'you' && state.result) fillStats(state.result);
  if (state.tab === 'match') mountMatch();
}

/* ---- HOME ---- */
function viewHome() {
  var hasResult = !!state.result;
  var prism = '<div class="prismsig"><svg viewBox="0 0 360 188" width="100%" height="100%">' +
    '<line x1="14" y1="96" x2="156" y2="96" stroke="var(--ink)" stroke-width="2.2" stroke-linecap="round"/>' +
    '<polygon points="156,40 208,152 104,152" fill="color-mix(in srgb,var(--accent) 7%,transparent)" stroke="var(--ink)" stroke-width="1.8"/>' +
    '<g stroke-width="2.6" stroke-linecap="round">' +
    '<line x1="182" y1="97" x2="346" y2="44" stroke="#7c3aed"/><line x1="182" y1="97" x2="346" y2="70" stroke="#2563eb"/>' +
    '<line x1="182" y1="97" x2="346" y2="96" stroke="#d97706"/><line x1="182" y1="97" x2="346" y2="122" stroke="#e11d48"/>' +
    '<line x1="182" y1="97" x2="346" y2="148" stroke="#059669"/></g></svg></div>';
  var resume = state.progress && Object.keys(state.progress.answers || {}).length
    ? '<button class="btn ghost mt8" data-action="resume">Resume reading · ' + Object.keys(state.progress.answers).length + '/40</button>' : '';
  var lastCard = hasResult ? (
    '<button class="card pa mt18" data-action="goyou" style="width:100%;text-align:left;border:none">' +
    '<div class="eb">Your latest reading</div>' +
    '<div class="arname" style="font-size:24px;margin-top:8px;color:' + DIMS[state.result.match.primary].color + '">' + esc(state.result.match.arche.name) + '</div>' +
    '<div class="artag">' + esc(state.result.match.arche.tag) + '</div></button>') : '';
  return '<div class="eb">Personality, measured</div>' +
    '<h1 class="disp">A precise instrument for the self.</h1>' +
    '<p class="sub">One beam in, five dimensions out. Psyche refracts how you perceive, react, and relate into a spectrum you can actually read — across 21 archetypes.</p>' +
    prism +
    '<button class="btn accent" data-action="start">' + (hasResult ? 'Take it again' : 'Start the assessment') + ' &nbsp;→</button>' +
    resume + lastCard +
    '<div class="colophon">' +
      '<svg class="mark" viewBox="0 0 42 30" fill="none"><line x1="2" y1="16" x2="15" y2="16" stroke="var(--ink)" stroke-width="1.6" stroke-linecap="round"/><polygon points="15,5 25,25 5,25" fill="color-mix(in srgb,var(--accent) 10%,transparent)" stroke="var(--ink)" stroke-width="1.4"/><g stroke-width="1.9" stroke-linecap="round"><line x1="20" y1="16" x2="40" y2="8" stroke="#7c3aed"/><line x1="20" y1="16" x2="40" y2="13" stroke="#2563eb"/><line x1="20" y1="16" x2="40" y2="17" stroke="#d97706"/><line x1="20" y1="16" x2="40" y2="22" stroke="#e11d48"/></g></svg>' +
      '<div class="by">An instrument by <b>' + esc(AUTHOR.name) + '</b></div>' +
      '<div class="role">PRISM framework · engine · design</div>' +
    '</div>';
}

/* ---- ASSESSMENT ---- */
function startAssessment(resume) {
  if (!resume || !state.progress) { state.progress = { answers: {}, idx: 0 }; save(K.progress, state.progress); }
  renderAssessment();
}
function renderAssessment() {
  var p = state.progress, idx = p.idx, q = QUESTIONS[idx];
  var answered = Object.keys(p.answers).length;
  var labels = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];
  var dimKey = q.f.split('.')[0], dim = DIMS[dimKey];
  var opts = labels.map(function (lab, i) {
    var val = i + 1, sel = p.answers[idx] === val ? ' sel' : '';
    return '<button class="lk' + sel + '" data-answer="' + val + '"><span class="ind"></span>' + esc(lab) + '</button>';
  }).join('');
  var back = idx > 0 ? '<button class="btn ghost sm" data-action="qback" style="flex:none">← Back</button>' : '<span></span>';
  var html =
    '<div class="progress"><i style="width:' + (answered / QUESTIONS.length * 100) + '%"></i></div>' +
    '<div class="row" style="justify-content:space-between;align-items:center;margin-top:10px">' +
      '<span class="qcount">' + (idx + 1) + ' / ' + QUESTIONS.length + '</span>' +
      '<span class="qdim" style="color:' + dim.color + '">' + dim.name + '</span></div>' +
    '<div class="qtext">' + esc(q.t) + '</div>' +
    '<div class="likert">' + opts + '</div>' +
    '<div class="row mt24" style="justify-content:space-between;align-items:center">' + back +
      '<span class="mono" style="color:var(--faint)">tap an answer to continue</span></div>';
  $('#view').innerHTML = '<div class="pad screen-anim">' + html + '</div>';
}
function answer(val) {
  var p = state.progress; p.answers[p.idx] = val; save(K.progress, p);
  setTimeout(function () {
    if (p.idx < QUESTIONS.length - 1) { p.idx++; save(K.progress, p); renderAssessment(); }
    else { finishAssessment(); }
  }, 180);
}
function qback() { var p = state.progress; if (p.idx > 0) { p.idx--; save(K.progress, p); renderAssessment(); } }
function finishAssessment() {
  var scored = Engine.score(state.progress.answers);
  var m = Engine.match(scored.dims);
  var result = { dims: scored.dims, facets: scored.facets, match: m, ts: Date.now() };
  state.result = result; save(K.result, result);
  state.journal.unshift({ ts: result.ts, key: m.key, name: m.arche.name, primary: m.primary, dims: result.dims });
  state.journal = state.journal.slice(0, 50); save(K.journal, state.journal);
  Store.del(K.progress); state.progress = null;
  if (window.Cloud && Cloud.ready()) { Cloud.submitReading(result); Cloud.pushReading(result); }
  playCredits('Reading complete', function () { state.tab = 'you'; render(); });
}

/* ---- YOU / RESULT ---- */
function viewYou() {
  if (!state.result) {
    return emptyState('You', 'Take the reading first', 'Forty quick questions map your five PRISM dimensions and place you among 21 archetypes.', 'Start the assessment', 'start');
  }
  var r = state.result, m = r.match, color = m.primary === undefined ? 'var(--accent)' : DIMS[m.primary].color;
  if (m.key === 'PRISM') color = 'var(--accent)';
  var sig = Engine.signatureTraits(r.facets);
  var sigPills = sig.map(function (t) { return '<span class="pill"><span class="pdot" style="background:' + t.color + '"></span>' + esc(t.name) + '</span>'; }).join('');
  var lowDim = DIM_ORDER.slice().sort(function (a, b) { return r.dims[a] - r.dims[b]; })[0];

  var facetBlocks = DIM_ORDER.map(function (d) {
    var rows = Object.keys(DIMS[d].facets).map(function (fk) {
      var key = d + '.' + fk, s = r.facets[key], fac = DIMS[d].facets[fk];
      var pole = s >= 50 ? fac.hi : fac.lo;
      return '<div class="facet"><div class="top"><b>' + esc(pole[0]) + '</b><span class="v">' + s + '</span></div>' +
        '<div class="desc">' + esc(pole[1]) + '</div>' +
        '<div class="minitrack"><i style="width:' + s + '%;background:' + DIMS[d].color + '"></i></div></div>';
    }).join('');
    return '<details class="card pa mt14"><summary style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;list-style:none">' +
      '<b style="font-family:Space Grotesk;font-weight:700;color:' + DIMS[d].color + '">' + DIMS[d].name + '</b>' +
      '<span class="mono" style="color:var(--mut)">' + r.dims[d] + '</span></summary>' +
      '<div class="mt8">' + rows + '</div></details>';
  }).join('');

  return '<div class="row" style="justify-content:space-between;align-items:center">' +
      '<span class="arcode" style="color:' + color + '">' + esc(m.code) + ' · ' + m.confidence + '% match</span>' +
      '<span class="mono" style="color:var(--faint)">' + fmtDate(r.ts) + '</span></div>' +
    '<div class="arname mt8" style="color:' + color + '">' + esc(m.arche.name) + '</div>' +
    '<div class="artag">' + esc(m.arche.tag) + '</div>' +
    '<p class="sub mt14">' + esc(m.arche.desc) + '</p>' +

    '<div class="vizwrap mt18">' + radarSVG(r.dims) + '</div>' +
    '<div class="mt18">' + spectrumHTML(r.dims) + '</div>' +

    '<div id="statscard"></div>' +

    '<div class="mt24"><div class="seclabel">Signature traits</div><div class="pill-row">' + sigPills + '</div></div>' +

    '<div class="card pa mt18"><div class="eb">Strengths</div><div class="pill-row mt8">' +
      m.arche.strengths.map(function (s) { return '<span class="pill">' + esc(s) + '</span>'; }).join('') + '</div></div>' +

    '<div class="card pa mt14"><div class="eb">Shadow</div><p class="sub mt8">' + esc(m.arche.shadow) +
      ' Your quietest dimension is <b style="color:' + DIMS[lowDim].color + '">' + DIMS[lowDim].name + '</b> (' + r.dims[lowDim] + ') — where growth tends to hide.</p></div>' +

    '<div class="card pa mt14"><div class="eb">Under stress</div><p class="sub mt8">When pressure mounts, ' + esc(m.arche.name) + ' ' + esc(m.arche.stress) + '</p></div>' +

    '<div class="card pa mt14"><div class="eb">Growth edge</div><p class="sub mt8">' + esc(m.arche.growth) + '</p></div>' +

    '<div class="mt24"><div class="seclabel">Full breakdown · 20 facets</div>' + facetBlocks + '</div>' +

    '<div class="row mt24"><button class="btn accent" data-action="share">Share card</button>' +
      '<button class="btn ghost" data-action="sharelink" style="flex:none">Copy link</button></div>' +
    '<button class="btn ghost mt14" data-action="start">Retake the reading</button>' +
    '<p class="mono mt18" style="text-align:center;color:var(--faint)">Reading by the PRISM engine · <b style="color:var(--mut)">' + esc(AUTHOR.name) + '</b></p>';
}
state._mountYouViz = function () {};

/* ---- ATLAS ---- */
function viewAtlas() {
  var cards = '';
  DIM_ORDER.forEach(function (p) {
    DIM_ORDER.forEach(function (s) {
      if (p === s) return;
      var a = ARCH[p][s];
      cards += '<button class="acard" data-arche="' + p + s + '"><span class="dot" style="background:' + DIMS[p].color + '"></span>' +
        '<h4>' + esc(a.name) + '</h4><small>' + p + ' · ' + s + '</small></button>';
    });
  });
  cards += '<button class="acard" data-arche="PRISM"><span class="dot" style="background:linear-gradient(90deg,#7c3aed,#059669)"></span><h4>The Prism</h4><small>Balanced</small></button>';
  return '<div class="eb">The Atlas</div><h2 class="disp mt8">21 archetypes</h2>' +
    '<p class="sub mt8" style="margin-bottom:18px">Every pairing of a leading and supporting dimension. Tap any plate to read it in full.</p>' +
    '<div class="agrid">' + cards + '</div>';
}
function archeByKey(key) { return key === 'PRISM' ? ARCH.PRISM : ARCH[key[0]][key[1]]; }
function openArche(key) {
  var a = archeByKey(key);
  var color = key === 'PRISM' ? 'var(--accent)' : DIMS[key[0]].color;
  var dims = Engine.exemplar(key);
  var html = '<div class="sheet">' +
    '<div class="grab"></div>' +
    '<div class="shead"><div><span class="arcode" style="color:' + color + '">' + (key === 'PRISM' ? 'BALANCED' : key[0] + '·' + key[1]) + '</span>' +
      '<div class="arname mt8" style="color:' + color + '">' + esc(a.name) + '</div>' +
      '<div class="artag">' + esc(a.tag) + '</div></div>' +
      '<button class="closebtn" data-close="1"><svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>' +
    '<div class="pad" style="padding-top:14px">' +
      '<p class="sub">' + esc(a.desc) + '</p>' +
      '<div class="vizwrap mt18">' + radarSVG(dims, 200) + '</div>' +
      '<div class="card pa mt14"><div class="eb">Strengths</div><div class="pill-row mt8">' +
        a.strengths.map(function (s) { return '<span class="pill">' + esc(s) + '</span>'; }).join('') + '</div></div>' +
      '<div class="card pa mt14"><div class="eb">Shadow</div><p class="sub mt8">' + esc(a.shadow) + '</p></div>' +
      '<div class="card pa mt14"><div class="eb">Growth edge</div><p class="sub mt8">' + esc(a.growth) + '</p></div>' +
    '</div></div>';
  openSheet(html);
}

/* ---- MATCH ---- */
function matchOptions() {
  var opts = [];
  if (state.result) opts.push({ id: 'self', label: 'You · ' + state.result.match.arche.name, dims: state.result.dims, name: 'You' });
  state.journal.forEach(function (j, i) { opts.push({ id: 'j' + i, label: fmtDate(j.ts) + ' · ' + j.name, dims: j.dims, name: j.name.replace(/^The\s+/, '') }); });
  DIM_ORDER.forEach(function (p) { DIM_ORDER.forEach(function (s) { if (p === s) return; opts.push({ id: p + s, label: ARCH[p][s].name, dims: Engine.exemplar(p + s), name: ARCH[p][s].name.replace(/^The\s+/, '') }); }); });
  opts.push({ id: 'PRISM', label: 'The Prism', dims: Engine.exemplar('PRISM'), name: 'Prism' });
  return opts;
}
function viewMatch() {
  var opts = matchOptions();
  function sel(id, defIdx) {
    return '<select id="' + id + '">' + opts.map(function (o, i) {
      return '<option value="' + i + '"' + (i === defIdx ? ' selected' : '') + '>' + esc(o.label) + '</option>';
    }).join('') + '</select>';
  }
  var aDef = 0, bDef = opts.length > 1 ? 1 : 0;
  return '<div class="eb">Compatibility</div><h2 class="disp mt8">Match two profiles</h2>' +
    '<p class="sub mt8" style="margin-bottom:16px">Compare any two — your readings, saved entries, or any of the 21 archetypes. Pure PRISM math, no guesswork.</p>' +
    '<div class="pickrow"><div class="select">' + sel('mA', aDef) + '</div><div class="select">' + sel('mB', bDef) + '</div></div>' +
    '<div id="matchresult" class="mt18"></div>';
}
function mountMatch() {
  var opts = matchOptions();
  function run() {
    var a = opts[+$('#mA').value], b = opts[+$('#mB').value];
    var c = Engine.compatibility(a.dims, b.dims, a.name, b.name);
    var off = 326 - 326 * (c.score / 100);
    var ca = a.id === 'self' ? '#2563eb' : '#7c3aed', cb = '#e11d48';
    $('#matchresult').innerHTML =
      '<div style="text-align:center"><div class="ring"><svg viewBox="0 0 120 120">' +
        '<circle cx="60" cy="60" r="52" fill="none" stroke="var(--line2)" stroke-width="9"/>' +
        '<circle cx="60" cy="60" r="52" fill="none" stroke="var(--accent)" stroke-width="9" stroke-linecap="round" stroke-dasharray="326" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 60 60)"/>' +
        '</svg><div class="pct"><b>' + c.score + '</b><small>compatibility</small></div></div>' +
      '<div class="pair"><div class="ava"><div class="blob" style="background:' + ca + '">' + esc(a.name[0]) + '</div><div class="nm">' + esc(a.name) + '</div></div>' +
      '<div class="ava"><div class="blob" style="background:' + cb + '">' + esc(b.name[0]) + '</div><div class="nm">' + esc(b.name) + '</div></div></div></div>' +
      '<div class="mt18">' + c.notes.map(function (n) {
        return '<div class="card pa mt14"><b style="font-family:Space Grotesk;font-weight:700;font-size:13.5px">' + esc(n.t) + '</b><p class="sub mt8" style="font-size:13px">' + esc(n.p) + '</p></div>';
      }).join('') + '</div>';
  }
  $('#mA').addEventListener('change', run); $('#mB').addEventListener('change', run); run();
}

/* ---- JOURNAL ---- */
function viewJournal() {
  if (!state.journal.length) {
    return emptyState('Journal', 'No readings yet', 'Every assessment you complete is saved here so you can watch how you shift over time.', 'Take your first reading', 'start');
  }
  var rows = state.journal.map(function (j, i) {
    return '<button class="jrow" data-load="' + i + '"><div class="jdot" style="background:' + DIMS[j.primary].color + '">' + initials(j.name) + '</div>' +
      '<div class="jb"><b>' + esc(j.name) + '</b><small>' + fmtDate(j.ts) + (i === 0 ? ' · latest' : '') + '</small></div><span class="chev"></span></button>';
  }).join('');
  return '<div class="eb">Your journal</div><h2 class="disp mt8">' + state.journal.length + ' reading' + (state.journal.length > 1 ? 's' : '') + '</h2>' +
    '<div class="mt18">' + rows + '</div>' +
    '<button class="btn ghost mt24" data-action="clearjournal">Clear journal</button>';
}

/* ---- empty state ---- */
function emptyState(label, title, body, cta, action) {
  return '<div class="seclabel">' + label + '</div><div class="empty"><div class="ec">' +
    '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.5H19l-4.5 3.3L16 17l-4-3-4 3 1.5-5.2L5 8.5h5.2z"/></svg></div>' +
    '<h3>' + esc(title) + '</h3><p>' + esc(body) + '</p>' +
    '<button class="btn accent" data-action="' + action + '" style="max-width:260px;margin:0 auto">' + esc(cta) + '</button></div>';
}

/* ---------------- SHARE CARD (canvas) ---------------- */
function shareCard() {
  if (!state.result) return;
  var r = state.result, m = r.match, W = 1080, H = 1350;
  var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  var x = cv.getContext('2d');
  var dark = state.settings.dark;
  var bg = dark ? '#0c0e12' : '#f6f7f9', ink = dark ? '#e9ebf0' : '#0e1116', mut = dark ? '#9aa2b1' : '#5c6472', line = dark ? '#252a33' : '#e4e7ec';
  var colors = { P: '#7c3aed', R: dark ? '#60a5fa' : '#2563eb', I: '#d97706', S: '#e11d48', M: '#059669' };
  function draw() {
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    // prism mark top
    x.strokeStyle = ink; x.lineWidth = 5; x.lineCap = 'round';
    x.beginPath(); x.moveTo(90, 150); x.lineTo(190, 150); x.stroke();
    x.beginPath(); x.moveTo(190, 110); x.lineTo(228, 192); x.lineTo(152, 192); x.closePath(); x.stroke();
    var rays = [['P', 95], ['R', 122], ['I', 150], ['S', 178], ['M', 205]];
    rays.forEach(function (ry) { x.strokeStyle = colors[ry[0]]; x.beginPath(); x.moveTo(212, 151); x.lineTo(330, ry[1]); x.stroke(); });
    // eyebrow
    x.fillStyle = mut; x.font = '500 30px "Space Mono", monospace'; x.textAlign = 'left';
    x.fillText('P S Y C H E   ·   ' + (m.code), 92, 290);
    // name
    x.fillStyle = m.key === 'PRISM' ? colors.R : colors[m.primary];
    x.font = '700 130px "Space Grotesk", sans-serif';
    wrapText(x, m.arche.name, 90, 430, 920, 124);
    // tag
    x.fillStyle = mut; x.font = '500 38px "Inter", sans-serif';
    x.fillText(m.arche.tag, 92, 600);
    // bars
    var by = 720;
    DIM_ORDER.forEach(function (d) {
      x.fillStyle = ink; x.font = '600 36px "Inter", sans-serif'; x.textAlign = 'left';
      x.fillText(DIMS[d].name, 92, by - 14);
      x.fillStyle = mut; x.font = '700 32px "Space Mono", monospace'; x.textAlign = 'right';
      x.fillText(String(r.dims[d]), 988, by - 14);
      x.fillStyle = line; roundRect(x, 92, by, 896, 18, 9); x.fill();
      x.fillStyle = colors[d]; roundRect(x, 92, by, 896 * (r.dims[d] / 100), 18, 9); x.fill();
      by += 116;
    });
    // footer credit
    x.strokeStyle = line; x.lineWidth = 2; x.beginPath(); x.moveTo(92, H - 150); x.lineTo(988, H - 150); x.stroke();
    x.fillStyle = mut; x.font = '400 30px "Space Mono", monospace'; x.textAlign = 'left';
    x.fillText('psyche · PRISM engine', 92, H - 100);
    x.fillStyle = ink; x.font = '700 30px "Space Mono", monospace'; x.textAlign = 'right';
    x.fillText('Built by ' + AUTHOR.name, 988, H - 100);
    // download
    cv.toBlob(function (blob) {
      var url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = 'psyche-' + m.arche.name.replace(/\s+/g, '-').toLowerCase() + '.png';
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      toast('Card saved to your device');
    }, 'image/png');
  }
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(draw); } else { draw(); }
}
function wrapText(ctx, text, x0, y0, maxW, lh) {
  var words = text.split(' '), line = '', y = y0;
  for (var i = 0; i < words.length; i++) {
    var test = line + words[i] + ' ';
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line.trim(), x0, y); line = words[i] + ' '; y += lh; }
    else line = test;
  }
  ctx.fillText(line.trim(), x0, y);
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

/* ---------------- SHEETS / SETTINGS ---------------- */
function openSheet(html) {
  closeSheet();
  var scrim = el('<div class="scrim">' + html + '</div>');
  scrim.addEventListener('click', function (e) { if (e.target === scrim || e.target.closest('[data-close]')) closeSheet(); });
  $('#app').appendChild(scrim);
}
function closeSheet() { var s = $('.scrim'); if (s) s.remove(); }

function openSettings() {
  var s = state.settings;
  var html = '<div class="sheet"><div class="grab"></div>' +
    '<div class="shead"><h2 class="disp">Settings</h2><button class="closebtn" data-close="1"><svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>' +
    '<div class="pad" style="padding-top:14px">' +
      accountSectionHTML() +
      '<div class="card pa mt14"><div class="row" style="justify-content:space-between;align-items:center">' +
        '<div><b style="font-family:Space Grotesk;font-weight:700">Dark mode</b><p class="sub" style="font-size:13px">Switch the instrument to a dark theme.</p></div>' +
        '<button class="btn sm ' + (s.dark ? 'accent' : 'ghost') + '" data-action="toggledark">' + (s.dark ? 'On' : 'Off') + '</button></div></div>' +

      '<button class="btn ghost mt14" data-action="replayintro">Replay intro animation</button>' +
      '<div class="row mt14"><button class="btn ghost" data-action="exportdata">Export data</button>' +
        '<button class="btn ghost" data-action="importdata">Import data</button></div>' +
      '<button class="btn ghost mt14" data-action="resetall" style="color:var(--S);border-color:color-mix(in srgb,var(--S) 35%,var(--line))">Reset everything</button>' +

      '<div class="card pa mt24"><div class="eb">About</div>' +
        '<p class="sub mt8"><b style="color:var(--ink)">Psyche</b> is a personality instrument built on <b style="color:var(--ink)">PRISM</b> — Perception, Response, Identity, Social, Motivation — an original framework distinct from MBTI. It runs entirely on your device: no accounts, no servers, no AI.</p>' +
        '<p class="sub mt14">PRISM framework, engine, and app — <b style="color:var(--ink)">created by ' + esc(AUTHOR.name) + '</b>.</p>' +
        '<p class="mono mt14" style="color:var(--faint)">Psyche v22 · accounts, sync + refreshed UI</p></div>' +
    '</div></div>';
  openSheet(html);
}

/* ---------------- CREDITS / SPLASH ---------------- */
function logoSVG() {
  return '<svg class="splogo" viewBox="0 0 150 110" fill="none">' +
    '<line class="beam" x1="6" y1="58" x2="56" y2="58" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round"/>' +
    '<polygon class="prism" points="58,26 88,88 28,88" stroke="var(--ink)" stroke-width="2.2" fill="color-mix(in srgb,var(--accent) 8%,transparent)"/>' +
    '<g stroke-width="3" stroke-linecap="round">' +
    '<line class="ray r1" x1="72" y1="57" x2="146" y2="32" stroke="#7c3aed"/>' +
    '<line class="ray r2" x1="72" y1="57" x2="146" y2="45" stroke="#2563eb"/>' +
    '<line class="ray r3" x1="72" y1="57" x2="146" y2="58" stroke="#d97706"/>' +
    '<line class="ray r4" x1="72" y1="57" x2="146" y2="71" stroke="#e11d48"/>' +
    '<line class="ray r5" x1="72" y1="57" x2="146" y2="84" stroke="#059669"/></g></svg>';
}
function playCredits(headline, cb) {
  var root = el('<div class="splashroot">' + logoSVG() +
    '<div class="spword">Psyche<span class="vv">v22</span></div>' +
    '<div class="spcred">Built by <b>' + esc(AUTHOR.name) + '</b></div>' +
    '<div class="spsmall">' + esc(headline || 'The PRISM personality engine') + '</div></div>');
  $('#app').appendChild(root);
  setTimeout(function () { root.classList.add('done'); setTimeout(function () { root.remove(); if (cb) cb(); }, 560); }, 2300);
}
function dismissSplash() {
  var sp = $('#splash'); if (!sp) return;
  setTimeout(function () { sp.classList.add('done'); setTimeout(function () { sp.remove(); }, 560); }, 2500);
}

/* ---------------- THEME ---------------- */
function applyTheme() { document.body.classList.toggle('dark', !!state.settings.dark); }

/* ---------------- CLOUD UI ---------------- */
function accountSectionHTML() {
  if (!window.Cloud || !Cloud.ready()) {
    return '<div class="card pa"><div class="eb">Cloud · off</div>' +
      '<p class="sub mt8" style="color:var(--mut)">Running fully offline. To turn on accounts, cross-device sync, share links, and rarity stats, add your Supabase keys in <b style="color:var(--ink)">config.js</b> — setup steps are in the README.</p></div>';
  }
  var u = Cloud.user();
  if (u) {
    return '<div class="card pa"><div class="eb">Account · synced</div>' +
      '<p class="sub mt8">Signed in as <b style="color:var(--ink)">' + esc(u.email || 'you') + '</b>. Your readings sync across devices automatically.</p>' +
      '<button class="btn ghost mt14" data-action="signout">Sign out</button></div>';
  }
  if (state.ui && state.ui.otpEmail) {
    return '<div class="card pa"><div class="eb">Check your email</div>' +
      '<p class="sub mt8" style="color:var(--mut)">We sent a 6-digit code to <b style="color:var(--ink)">' + esc(state.ui.otpEmail) + '</b>. Enter it to sign in.</p>' +
      '<input id="acCode" class="acin" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="6-digit code" maxlength="6">' +
      '<div class="row mt8"><button class="btn accent" data-action="otpverify">Verify &amp; sign in</button>' +
      '<button class="btn ghost" data-action="otpcancel">Back</button></div></div>';
  }
  return '<div class="card pa"><div class="eb">Account · sync across devices</div>' +
    '<p class="sub mt8" style="color:var(--mut)">Optional. Sign in to back up and sync your readings across every device.</p>' +
    '<button class="btn mt8" style="width:100%;border:1px solid var(--line);background:var(--surf);color:var(--ink);display:flex;align-items:center;justify-content:center;gap:9px" data-action="google">' +
      '<span style="display:inline-flex;width:18px;height:18px;border-radius:50%;background:#fff;color:#4285F4;font-weight:800;align-items:center;justify-content:center;font-size:12px;border:1px solid #e3e3e3">G</span>Continue with Google</button>' +
    '<div style="display:flex;align-items:center;gap:10px;margin:13px 0;color:var(--faint);font-size:12px"><span style="flex:1;height:1px;background:var(--line)"></span>or<span style="flex:1;height:1px;background:var(--line)"></span></div>' +
    '<input id="acEmail" class="acin" type="email" placeholder="your email" autocomplete="email">' +
    '<button class="btn accent mt8" style="width:100%" data-action="otpsend">Email me a sign-in code</button>' +
    '<details class="mt14" style="color:var(--mut)"><summary style="cursor:pointer;font-size:13px;color:var(--faint)">Use a password instead</summary>' +
      '<input id="acPw" class="acin mt8" type="password" placeholder="password" autocomplete="current-password">' +
      '<div class="row mt8"><button class="btn ghost" data-action="signin">Sign in</button>' +
      '<button class="btn ghost" data-action="signup">Create</button></div></details></div>';
}

function syncFromCloud() {
  if (!window.Cloud || !Cloud.ready() || !Cloud.user()) return;
  Cloud.pull().then(function (cloudReadings) {
    if (!cloudReadings || !cloudReadings.length) { if (state.result) Cloud.pushReading(state.result); return; }
    var seen = {}; state.journal.forEach(function (j) { seen[j.ts] = true; });
    cloudReadings.forEach(function (r) {
      if (r && r.ts && r.match && !seen[r.ts]) {
        state.journal.push({ ts: r.ts, key: r.match.key, name: r.match.arche.name, primary: r.match.primary, dims: r.dims });
        seen[r.ts] = true;
      }
    });
    state.journal.sort(function (a, b) { return b.ts - a.ts; });
    state.journal = state.journal.slice(0, 50);
    save(K.journal, state.journal);
    if (!state.result && cloudReadings[0]) { state.result = cloudReadings[0]; save(K.result, state.result); }
    if (state.result) Cloud.pushReading(state.result);
    if (state.tab === 'journal' || state.tab === 'you') render();
  });
}

function fillStats(r) {
  var host = $('#statscard'); if (!host) return;
  if (!window.Cloud || !Cloud.ready()) { host.innerHTML = ''; return; }
  host.innerHTML = '<div class="card pa mt18"><div class="eb">Where you stand</div><p class="sub mt8" style="color:var(--faint)">Reading the population\u2026</p></div>';
  Cloud.getStats(r).then(function (s) {
    if (!s || !s.count) { host.innerHTML = ''; return; }
    var p = s.percentiles || {};
    var lines = DIM_ORDER.map(function (d) {
      return '<div class="statline"><b style="color:' + DIMS[d].color + '">' + DIMS[d].name + '</b>' +
        '<span class="pc" style="color:' + DIMS[d].color + '">' + (p[d] || 0) + '%</span></div>';
    }).join('');
    var rare = s.archetype_pct;
    var rareLine = (rare <= 5)
      ? 'Only <b>' + rare + '%</b> of people share your archetype — you\u2019re rare.'
      : '<b>' + rare + '%</b> of people share your archetype, ' + r.match.arche.name + '.';
    host.innerHTML =
      '<div class="card pa mt18"><div class="eb">Where you stand</div>' +
      '<div class="rarity mt8"><span class="big" style="color:var(--accent)">' + rare + '%</span>' +
        '<span class="sub" style="font-size:13px">' + rareLine + '</span></div>' +
      '<p class="sub mt14" style="font-size:12.5px;color:var(--faint)">You score higher than this share of ' + s.count.toLocaleString() + ' readings on each dimension:</p>' +
      '<div class="mt8">' + lines + '</div></div>';
  });
}

function doAuth(mode) {
  var em = $('#acEmail'), pw = $('#acPw');
  var email = em && em.value.trim(), pass = pw && pw.value;
  if (!email || !pass) { toast('Enter email and password'); return; }
  if (pass.length < 6) { toast('Password needs 6+ characters'); return; }
  var op = mode === 'up' ? Cloud.signUp(email, pass) : Cloud.signIn(email, pass);
  op.then(function (res) {
    if (res.error) { toast(res.error.message || 'Auth failed'); return; }
    toast(mode === 'up' ? 'Account created' : 'Signed in');
    syncFromCloud();
    closeSheet(); openSettings();
  }, function () { toast('Auth error'); });
}

function doGoogle() {
  if (!window.Cloud || !Cloud.ready()) { toast('Cloud is off'); return; }
  Cloud.signInWithGoogle().then(function (res) {
    if (res && res.error) toast(res.error.message || 'Google sign-in unavailable');
    // on success the browser redirects to Google, then back; onAuth handles the rest
  }, function () { toast('Google sign-in error'); });
}

function doSendOtp() {
  var em = $('#acEmail');
  var email = em && em.value.trim();
  if (!email || email.indexOf('@') < 0) { toast('Enter a valid email'); return; }
  toast('Sending code\u2026');
  Cloud.sendOtp(email).then(function (res) {
    if (res && res.error) { toast(res.error.message || 'Could not send code'); return; }
    state.ui = state.ui || {}; state.ui.otpEmail = email;
    closeSheet(); openSettings();
  }, function () { toast('Could not send code'); });
}

function doVerifyOtp() {
  var cd = $('#acCode');
  var token = cd && cd.value.trim();
  var email = state.ui && state.ui.otpEmail;
  if (!email) { cancelOtp(); return; }
  if (!token || token.length < 6) { toast('Enter the 6-digit code'); return; }
  Cloud.verifyOtp(email, token).then(function (res) {
    if (res && res.error) { toast(res.error.message || 'Invalid or expired code'); return; }
    if (state.ui) state.ui.otpEmail = null;
    toast('Signed in');
    syncFromCloud();
    closeSheet(); openSettings();
  }, function () { toast('Verification error'); });
}

function cancelOtp() {
  if (state.ui) state.ui.otpEmail = null;
  closeSheet(); openSettings();
}

function doShareLink() {
  if (!state.result) return;
  if (!window.Cloud || !Cloud.ready()) { toast('Add Supabase keys in config.js to enable share links'); return; }
  toast('Creating link\u2026');
  var name = (Cloud.user() && Cloud.user().email) ? Cloud.user().email.split('@')[0] : null;
  Cloud.createShare(state.result, name).then(function (url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { toast('Share link copied'); }, function () { window.prompt('Your share link:', url); });
    } else { window.prompt('Your share link:', url); }
  }, function () { toast('Could not create link'); });
}

/* ---------------- EVENTS ---------------- */
document.addEventListener('click', function (e) {
  var tab = e.target.closest('.tab');
  if (tab) { state.tab = tab.getAttribute('data-tab'); render(); return; }

  var lk = e.target.closest('[data-answer]');
  if (lk) { answer(+lk.getAttribute('data-answer')); return; }
  if (e.target.closest('[data-action="qback"]')) { qback(); return; }

  var ac = e.target.closest('[data-arche]');
  if (ac) { openArche(ac.getAttribute('data-arche')); return; }

  var jl = e.target.closest('[data-load]');
  if (jl) { var i = +jl.getAttribute('data-load'); var j = state.journal[i];
    if (j.dims) { state.result = { dims: j.dims, facets: Engine.score({}).facets, match: Engine.match(j.dims), ts: j.ts };
      // recompute facets properly is not possible from journal; keep dims-based match
      state.result.match = Engine.match(j.dims); }
    state.tab = 'you'; closeSheet(); render(); return; }

  var act = e.target.closest('[data-action]');
  if (!act) return;
  var a = act.getAttribute('data-action');
  switch (a) {
    case 'start': closeSheet(); startAssessment(false); break;
    case 'resume': startAssessment(true); break;
    case 'goyou': state.tab = 'you'; render(); break;
    case 'share': shareCard(); break;
    case 'settings': openSettings(); break;
    case 'toggledark': state.settings.dark = !state.settings.dark; save(K.settings, state.settings); applyTheme(); closeSheet(); openSettings(); break;
    case 'replayintro': closeSheet(); playCredits('The PRISM personality engine'); break;
    case 'signin': doAuth('in'); break;
    case 'signup': doAuth('up'); break;
    case 'google': doGoogle(); break;
    case 'otpsend': doSendOtp(); break;
    case 'otpverify': doVerifyOtp(); break;
    case 'otpcancel': cancelOtp(); break;
    case 'signout': Cloud.signOut().then(function () { toast('Signed out'); closeSheet(); openSettings(); }); break;
    case 'sharelink': doShareLink(); break;
    case 'exportdata': exportData(); break;
    case 'importdata': importData(); break;
    case 'resetall': resetAll(); break;
    case 'clearjournal': if (confirm('Clear all saved readings? This cannot be undone.')) { state.journal = []; save(K.journal, state.journal); render(); } break;
  }
});

/* ---------------- DATA PORTABILITY ---------------- */
function exportData() {
  var blob = new Blob([JSON.stringify({ result: state.result, journal: state.journal, settings: state.settings, v: 22 }, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = 'psyche-backup.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  toast('Backup downloaded');
}
function importData() {
  var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json';
  inp.onchange = function () {
    var f = inp.files[0]; if (!f) return; var rd = new FileReader();
    rd.onload = function () { try {
      var d = JSON.parse(rd.result);
      if (d.result) { state.result = d.result; save(K.result, state.result); }
      if (d.journal) { state.journal = d.journal; save(K.journal, state.journal); }
      if (d.settings) { state.settings = d.settings; save(K.settings, state.settings); applyTheme(); }
      closeSheet(); state.tab = 'you'; render(); toast('Data imported');
    } catch (e) { toast('Could not read that file'); } };
    rd.readAsText(f);
  };
  inp.click();
}
function resetAll() {
  if (!confirm('Erase your result, journal, and settings? This cannot be undone.')) return;
  Store.del(K.result); Store.del(K.journal); Store.del(K.progress); Store.del(K.settings);
  state.result = null; state.journal = []; state.progress = null; state.settings = { dark: false };
  applyTheme(); closeSheet(); state.tab = 'home'; render(); toast('Everything reset');
}

/* ---------------- INIT ---------------- */
function init() {
  applyTheme();
  render();
  if (Store.get(K.seen)) { var sp = $('#splash'); if (sp) sp.remove(); }
  else { Store.set(K.seen, '1'); dismissSplash(); }
  if (window.Cloud) {
    Cloud.init();
    Cloud.onAuth(function (u) {
      if (u) syncFromCloud();
      if ($('.scrim')) { closeSheet(); openSettings(); }
    });
  }
  if ('serviceWorker' in navigator) {
    try { navigator.serviceWorker.register('service-worker.js'); } catch (e) {}
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

})();
