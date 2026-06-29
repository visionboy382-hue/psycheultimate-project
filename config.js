/* ============================================================
   PSYCHE v21 · cloud layer (Supabase)
   Entirely optional. If config.js has no keys, Cloud.ready() is
   false and every call is a safe no-op — the app stays offline.
   ============================================================ */
window.Cloud = (function () {
  'use strict';
  var sb = null, cfg = (window.PSYCHE_CONFIG || {}), _user = null, listeners = [];

  function ready() { return !!sb; }
  function user() { return _user; }
  function onAuth(f) { listeners.push(f); }
  function emit() { listeners.forEach(function (f) { try { f(_user); } catch (e) {} }); }

  function init() {
    try {
      if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase && window.supabase.createClient) {
        sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
        sb.auth.getSession().then(function (r) { _user = (r.data && r.data.session) ? r.data.session.user : null; emit(); });
        sb.auth.onAuthStateChange(function (_e, s) { _user = s ? s.user : null; emit(); });
      }
    } catch (e) { sb = null; }
  }

  function shortId() {
    var a = 'abcdefghijkmnpqrstuvwxyz23456789', s = '';
    for (var i = 0; i < 8; i++) s += a[Math.floor(Math.random() * a.length)];
    return s;
  }
  function row(r, extra) {
    var d = r.dims, m = r.match, base = {
      archetype: m.arche.name, code: m.code, prim: m.primary || null,
      p: d.P, r: d.R, i: d.I, s: d.S, m: d.M, user_id: _user ? _user.id : null
    };
    for (var k in (extra || {})) base[k] = extra[k];
    return base;
  }

  /* auth — password (legacy), Google OAuth, and passwordless email OTP */
  function signUp(email, pw) { return sb.auth.signUp({ email: email, password: pw }); }
  function signIn(email, pw) { return sb.auth.signInWithPassword({ email: email, password: pw }); }
  function signOut() { return sb.auth.signOut(); }
  function signInWithGoogle() {
    var redirectTo = location.origin + location.pathname; // come back to the app, not the OAuth callback
    return sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectTo } });
  }
  function sendOtp(email) {
    // sends a 6-digit code (requires the Supabase email template to use {{ .Token }})
    return sb.auth.signInWithOtp({ email: email, options: { shouldCreateUser: true } });
  }
  function verifyOtp(email, token) {
    return sb.auth.verifyOtp({ email: email, token: token, type: 'email' });
  }

  /* stats population — every completed reading contributes (anonymous, no PII) */
  function submitReading(r) {
    if (!ready()) return Promise.resolve();
    return sb.from('readings').insert(row(r, { is_shared: false })).then(function () {}, function () {});
  }
  /* rarity / percentile stats */
  function getStats(r) {
    if (!ready()) return Promise.resolve(null);
    var d = r.dims, m = r.match;
    return sb.rpc('get_stats', { p_p: d.P, p_r: d.R, p_i: d.I, p_s: d.S, p_m: d.M, p_arch: m.arche.name })
      .then(function (res) { return res.error ? null : res.data; }, function () { return null; });
  }
  /* create a public share link */
  function createShare(r, name) {
    if (!ready()) return Promise.reject(new Error('cloud off'));
    var id = shortId();
    return sb.from('readings').insert(row(r, { short_id: id, display_name: name || null, is_shared: true }))
      .then(function (res) {
        if (res.error) throw res.error;
        var base = location.origin + location.pathname.replace(/[^/]*$/, '');
        return base + 'r.html?id=' + id;
      });
  }
  /* sync — push current reading, pull all of the user's readings */
  function pushReading(r) {
    if (!ready() || !_user) return Promise.resolve();
    return sb.from('user_readings')
      .upsert({ user_id: _user.id, client_ts: r.ts, data: r }, { onConflict: 'user_id,client_ts' })
      .then(function () {}, function () {});
  }
  function pull() {
    if (!ready() || !_user) return Promise.resolve([]);
    return sb.from('user_readings').select('data').order('client_ts', { ascending: false })
      .then(function (res) { return (res.error || !res.data) ? [] : res.data.map(function (x) { return x.data; }); }, function () { return []; });
  }

  return {
    ready: ready, init: init, onAuth: onAuth, user: user,
    signUp: signUp, signIn: signIn, signOut: signOut,
    signInWithGoogle: signInWithGoogle, sendOtp: sendOtp, verifyOtp: verifyOtp,
    submitReading: submitReading, getStats: getStats, createShare: createShare,
    pushReading: pushReading, pull: pull
  };
})();
