<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#2563eb">
<title>A Psyche reading</title>
<meta property="og:title" content="A Psyche reading">
<meta property="og:description" content="Mapped on the PRISM personality engine.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{--bg:#f6f7f9;--surf:#fff;--ink:#0e1116;--mut:#5c6472;--faint:#8b93a1;--line:#e4e7ec;--accent:#2563eb;
    --P:#7c3aed;--R:#2563eb;--I:#d97706;--S:#e11d48;--M:#059669}
  body{background:var(--bg);color:var(--ink);font-family:Inter,system-ui,sans-serif;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:22px}
  .wrap{width:100%;max-width:440px}
  .card{background:var(--surf);border:1px solid var(--line);border-radius:16px;padding:26px;box-shadow:0 1px 2px rgba(16,17,22,.04),0 18px 50px -30px rgba(16,17,22,.4)}
  .eb{font-family:'Space Mono';font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--faint)}
  .sig{height:70px;margin:2px 0 6px}
  .arname{font-family:'Space Grotesk';font-weight:700;font-size:34px;letter-spacing:-.02em;line-height:1.02;margin-top:6px}
  .artag{color:var(--mut);font-size:14.5px;margin-top:8px;line-height:1.5}
  .code{font-family:'Space Mono';font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent)}
  .spectrum{display:flex;flex-direction:column;gap:13px;margin-top:22px}
  .sbar .lab{display:flex;justify-content:space-between;margin-bottom:6px;font-size:13.5px}
  .sbar .lab .v{font-family:'Space Mono';font-size:12px;color:var(--mut)}
  .track{height:7px;background:#eef0f3;border-radius:3px;overflow:hidden}
  .fill{height:100%;border-radius:3px}
  .foot{display:flex;justify-content:space-between;align-items:center;margin-top:24px;padding-top:18px;border-top:1px solid var(--line)}
  .foot .by{font-family:'Space Mono';font-size:11px;color:var(--faint)}
  .foot .by b{color:var(--ink)}
  .cta{display:block;text-align:center;background:var(--accent);color:#fff;font-family:'Space Grotesk';font-weight:600;font-size:15px;padding:15px;border-radius:10px;text-decoration:none;margin-top:18px}
  .muted{text-align:center;color:var(--mut);font-size:14px;padding:40px 10px}
  .name{font-family:'Space Grotesk';font-weight:600;font-size:13px;color:var(--mut);margin-bottom:2px}
</style>
</head>
<body>
<div class="wrap" id="root">
  <div class="card"><div class="muted">Loading reading…</div></div>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="config.js"></script>
<script>
(function () {
  var DIMS = { P: ['Perception', '#7c3aed'], R: ['Response', '#2563eb'], I: ['Identity', '#d97706'], S: ['Social', '#e11d48'], M: ['Motivation', '#059669'] };
  var root = document.getElementById('root');
  function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];});}
  function prismSig(){
    return '<svg class="sig" viewBox="0 0 300 70" width="100%" height="70">'+
      '<line x1="10" y1="35" x2="120" y2="35" stroke="var(--ink)" stroke-width="2"/>'+
      '<polygon points="120,14 158,58 82,58" fill="none" stroke="var(--ink)" stroke-width="1.6"/>'+
      '<g stroke-width="2.4" stroke-linecap="round">'+
      '<line x1="142" y1="36" x2="290" y2="16" stroke="#7c3aed"/><line x1="142" y1="36" x2="290" y2="28" stroke="#2563eb"/>'+
      '<line x1="142" y1="36" x2="290" y2="40" stroke="#d97706"/><line x1="142" y1="36" x2="290" y2="52" stroke="#e11d48"/>'+
      '<line x1="142" y1="36" x2="290" y2="64" stroke="#059669"/></g></svg>';
  }
  function notFound(msg){
    root.innerHTML = '<div class="card"><div class="eb">Psyche</div>'+prismSig()+
      '<div class="muted">'+esc(msg||'This reading could not be found.')+'</div>'+
      '<a class="cta" href="index.html">Take your own reading →</a>'+
      '<div class="foot"><span class="by">PRISM engine</span><span class="by">Built by <b>Aryan S</b></span></div></div>';
  }
  function renderCard(d){
    var dims = { P: d.p, R: d.r, I: d.i, S: d.s, M: d.m };
    var color = d.prim ? DIMS[d.prim][1] : 'var(--accent)';
    var bars = Object.keys(DIMS).map(function (k) {
      return '<div class="sbar"><div class="lab"><b>'+DIMS[k][0]+'</b><span class="v">'+dims[k]+'</span></div>'+
        '<div class="track"><div class="fill" style="width:'+dims[k]+'%;background:'+DIMS[k][1]+'"></div></div></div>';
    }).join('');
    root.innerHTML = '<div class="card">'+
      (d.display_name ? '<div class="name">'+esc(d.display_name)+'</div>' : '')+
      '<div class="code" style="color:'+color+'">'+esc(d.code||'')+'</div>'+
      '<div class="arname" style="color:'+color+'">'+esc(d.archetype)+'</div>'+
      prismSig()+
      '<div class="spectrum">'+bars+'</div>'+
      '<a class="cta" href="index.html">Map yourself on PRISM →</a>'+
      '<div class="foot"><span class="by">Psyche · PRISM engine</span><span class="by">Built by <b>Aryan S</b></span></div></div>';
  }
  var id = new URLSearchParams(location.search).get('id');
  var cfg = window.PSYCHE_CONFIG || {};
  if (!id) { notFound('No reading specified.'); return; }
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || !window.supabase) { notFound('Sharing is not configured yet.'); return; }
  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  sb.from('readings').select('archetype,code,prim,p,r,i,s,m,display_name').eq('short_id', id).eq('is_shared', true).maybeSingle()
    .then(function (res) { if (res.error || !res.data) notFound(); else renderCard(res.data); })
    .catch(function () { notFound(); });
})();
</script>
</body>
</html>
