/* Nisha portfolio: behaviour (plain JavaScript, no libraries)
   1. theme switch   2. typing line   3. scroll reveal and counters   4. active menu link
   5. copy buttons   6. mobile menu   7. scroll effects (progress bar, timeline, screenshot pan, back to top)
   8. nisha.js window (dots, tabs, Run; the code and its output come from the same data)
   9. spotlight and tilt   10. background aurora (WebGL shader, 2D fallback) */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* theme toggle */
  try { var saved = localStorage.getItem('nisha-theme'); if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved); } catch (e) {}
  var themeBtn = document.getElementById('theme');
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function paintIcon() { themeBtn.setAttribute('aria-checked', isDark() ? 'true' : 'false'); }
  paintIcon();
  themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    if (!reduce) root.classList.add('theme-anim');
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('nisha-theme', next); } catch (e) {}
    paintIcon(); readColors(); if (reduce) drawBg(0);
    setTimeout(function () { root.classList.remove('theme-anim'); }, 600);
  });

  /* typed role line */
  var typed = document.getElementById('typed');
  var words = ['web applications', 'responsive interfaces', 'Laravel applications', 'database-driven systems'];
  if (!reduce) {
    var w = 0, c = words[0].length, del = true;
    (function tick() {
      var word = words[w];
      typed.textContent = word.slice(0, c);
      var wait = 70;
      if (del) { c--; wait = 38; if (c < 0) { del = false; w = (w + 1) % words.length; c = 0; wait = 260; } }
      else { c++; if (c > word.length) { del = true; c = word.length; wait = 1800; } }
      setTimeout(tick, wait);
    })();
  }

  /* scroll reveal */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* counters */
  var nums = document.querySelectorAll('.num');
  if ('IntersectionObserver' in window && !reduce) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        var el = e.target, to = parseFloat(el.dataset.to), dec = parseInt(el.dataset.dec, 10), start = null;
        function frame(t) {
          if (start === null) start = t;
          var p = Math.min((t - start) / 1100, 1), v = to * (1 - Math.pow(1 - p, 3));
          el.firstChild.nodeValue = v.toFixed(dec);
          if (p < 1) requestAnimationFrame(frame);
        }
        el.firstChild.nodeValue = (0).toFixed(dec);
        requestAnimationFrame(frame);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { co.observe(n); });
  }

  /* active nav link */
  var links = document.querySelectorAll('.nav a');
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('section[id]').forEach(function (s) { so.observe(s); });
  }

  /* mobile menu toggle */
  var hdr = document.querySelector('.top'), menuBtn = document.getElementById('menu');
  function setMenu(open) {
    hdr.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!hdr.classList.contains('open')); });
  document.querySelectorAll('.nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', function (e) { if (!hdr.contains(e.target)) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 880) setMenu(false); });

  /* scroll effects: progress bar, timeline that draws itself, screenshot pan, back-to-top */
  var bar = document.getElementById('progress'), toTop = document.getElementById('totop');
  var tl = document.querySelector('.tl'), tlFill = document.createElement('span'), jobs = tl.querySelectorAll('.job');
  tlFill.className = 'tl-fill'; tlFill.setAttribute('aria-hidden', 'true'); tl.insertBefore(tlFill, tl.firstChild);
  var shots = document.querySelectorAll('.view img');
  function scrollFx() {
    var vh = window.innerHeight, y = window.pageYOffset, max = document.documentElement.scrollHeight - vh;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    toTop.classList.toggle('show', y > 700);
    var r = tl.getBoundingClientRect(), mid = vh * .6;
    var p = reduce ? 1 : Math.max(0, Math.min(1, (mid - r.top) / r.height));
    tlFill.style.transform = 'scaleY(' + p + ')';
    jobs.forEach(function (j) { j.classList.toggle('on', reduce || j.getBoundingClientRect().top < mid); });
    if (!reduce) shots.forEach(function (img) {
      var b = img.parentNode.getBoundingClientRect();
      if (b.bottom < -60 || b.top > vh + 60) return;
      var q = ((b.top + b.height / 2) - vh / 2) / (vh / 2 + b.height / 2);
      q = Math.max(-1, Math.min(1, q));
      img.style.setProperty('--py', (q * -b.height * .05).toFixed(1) + 'px');
    });
  }
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; scrollFx(); }); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  scrollFx();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* nisha.js window: working dots, file tabs and a run button */
  var K = function (s) { return '<span class="k">' + s + '</span>'; };
  var Pp = function (s) { return '<span class="p">' + s + '</span>'; };
  var S = function (s) { return '<span class="s">"' + s + '"</span>'; };
  var Tp = function (s) { return '<span class="s">' + s + '</span>'; };
  /* One set of data drives both the code on screen and the terminal output, so they always match. */
  var DATA = {
    nisha: { name: 'Nisha', role: 'Web Developer', stack: ['PHP', 'Laravel', 'Node.js'], degree: 'BSCS, CGPA 3.44', based: 'Faisalabad, Pakistan' },
    skills: { interface: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap', 'jQuery'], logic: ['PHP', 'Laravel', 'Node.js', 'Express.js'], data: ['MySQL', 'MongoDB'] },
    contact: { email: 'nisha.webdesigner13@gmail.com', phone: '+92 3433050994', city: 'Faisalabad, Pakistan' }
  };
  var N = DATA.nisha, SK = DATA.skills, C = DATA.contact;
  function objLines(name, o) {
    var out = [K('const') + ' ' + name + ' = {'];
    Object.keys(o).forEach(function (key) {
      var v = o[key];
      out.push('  ' + Pp(key) + ': ' + (Array.isArray(v) ? '[' + v.map(S).join(', ') + ']' : S(v)) + ',');
    });
    out.push('};', ' ');
    return out;
  }
  function CL(args) { return K('console') + '.log(' + args + ');'; }
  function log() { return Array.prototype.join.call(arguments, ' '); }
  var FILES = {
    nisha: {
      cmd: 'node nisha.js',
      lines: objLines('nisha', N).concat([
        CL(Tp("`Hi, I'm ${nisha.name}, a ${nisha.role}.`")),
        CL(S('Stack:') + ', nisha.stack.join(' + S(', ') + ')'),
        CL(S('Degree:') + ', nisha.degree'),
        CL(S('Based in') + ', nisha.based')
      ]),
      out: ["Hi, I'm " + N.name + ', a ' + N.role + '.', log('Stack:', N.stack.join(', ')), log('Degree:', N.degree), log('Based in', N.based)]
    },
    skills: {
      cmd: 'node skills.js',
      lines: objLines('skills', SK).concat([
        K('for') + ' (' + K('const') + ' [layer, tools] ' + K('of') + ' Object.entries(skills)) {',
        '  ' + CL('layer + ' + S(':') + ', tools.join(' + S(', ') + ')'),
        '}'
      ]),
      out: Object.keys(SK).map(function (layer) { return log(layer + ':', SK[layer].join(', ')); })
    },
    contact: {
      cmd: 'node contact.js',
      lines: objLines('contact', C).concat([
        CL(S("Let's build something together.")),
        CL(S('Email:') + ', contact.email'),
        CL(S('Phone:') + ', contact.phone'),
        CL(S('City:') + ', contact.city')
      ]),
      out: ["Let's build something together.", log('Email:', C.email), log('Phone:', C.phone), log('City:', C.city)]
    }
  };
  var winEl = document.getElementById('win'), anim = document.getElementById('winAnim'), wrapEl = document.getElementById('winWrap');
  var reopen = document.getElementById('reopen'), dClose = document.getElementById('dClose'), dMin = document.getElementById('dMin'), dMax = document.getElementById('dMax');
  var codeEl = document.getElementById('codeEl'), termEl = document.getElementById('term'), termOut = document.getElementById('termOut');
  var tabs = document.querySelectorAll('.tab'), cur = 'nisha', runId = 0, scrim = null;

  function renderCode(f) {
    var L = FILES[f].lines;
    codeEl.innerHTML = L.map(function (l, i) {
      return '<span class="ln" style="--i:' + i + '">' + l + (i === L.length - 1 ? '<span class="caret" aria-hidden="true"></span>' : '') + '</span>';
    }).join('');
  }
  function selectFile(f, focus) {
    cur = f; runId++;
    tabs.forEach(function (t) {
      var on = t.dataset.f === f;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    renderCode(f); termEl.hidden = true; termOut.textContent = '';
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectFile(t.dataset.f); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); selectFile(tabs[(i + d + tabs.length) % tabs.length].dataset.f, true); }
    });
  });

  renderCode('nisha');

  function setMin(v) { winEl.classList.toggle('min', v); dMin.setAttribute('aria-pressed', v ? 'true' : 'false'); }
  function setMax(v) {
    if (v === winEl.classList.contains('max')) return;
    if (v) {
      wrapEl.style.minHeight = wrapEl.offsetHeight + 'px';
      setMin(false);
      winEl.classList.add('max');
      scrim = document.createElement('div'); scrim.className = 'scrim';
      scrim.addEventListener('click', function () { setMax(false); });
      document.body.appendChild(scrim);
      document.body.style.overflow = 'hidden';
    } else {
      winEl.classList.remove('max');
      if (scrim) { scrim.remove(); scrim = null; }
      document.body.style.overflow = '';
      wrapEl.style.minHeight = '';
    }
    dMax.setAttribute('aria-pressed', v ? 'true' : 'false');
    dMax.setAttribute('aria-label', v ? 'Restore window size' : 'Maximize window');
  }
  function setClosed(v) {
    if (v) { setMax(false); runId++; }
    anim.classList.toggle('closed', v);
    reopen.hidden = !v;
    if (v) reopen.focus(); else document.querySelector('.tab[aria-selected="true"]').focus();
  }
  dClose.addEventListener('click', function () { setClosed(true); });
  reopen.addEventListener('click', function () { setClosed(false); });
  dMin.addEventListener('click', function () { if (winEl.classList.contains('max')) setMax(false); setMin(!winEl.classList.contains('min')); });
  dMax.addEventListener('click', function () { setMax(!winEl.classList.contains('max')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && winEl.classList.contains('max')) setMax(false); });

  function run() {
    var id = ++runId, f = FILES[cur], li = 0, ci = 0, out = document.createElement('span');
    if (winEl.classList.contains('min')) setMin(false);
    termEl.hidden = false;
    termOut.textContent = '';
    var pr = document.createElement('span'); pr.className = 'pr'; pr.textContent = '$';
    termOut.appendChild(pr); termOut.appendChild(document.createTextNode(' ' + f.cmd + '\n')); termOut.appendChild(out);
    if (reduce) { out.textContent = f.out.join('\n'); return; }
    (function step() {
      if (id !== runId || li >= f.out.length) return;
      var txt = f.out[li];
      if (ci < txt.length) { out.textContent += txt.charAt(ci++); setTimeout(step, 18); }
      else { out.textContent += '\n'; li++; ci = 0; setTimeout(step, 240); }
    })();
  }
  document.getElementById('run').addEventListener('click', run);
  document.getElementById('clear').addEventListener('click', function () { runId++; termEl.hidden = true; termOut.textContent = ''; });

  /* cursor spotlight on panels, tilt on screenshots */
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  document.querySelectorAll('.shot, .fact, .layer').forEach(function (el) {
    el.setAttribute('data-spot', '');
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
  if (fine && !reduce) {
    document.querySelectorAll('.shot').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.setProperty('--rx', (-y * 5).toFixed(2) + 'deg');
        el.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* copy buttons */
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.dataset.copy;
      function done() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy'; }, 1600); }
      function fallback() {
        var v = btn.parentNode.querySelector('.v');
        var r = document.createRange(); r.selectNodeContents(v);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        btn.textContent = 'Selected';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1600);
      }
      try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
    });
  });

  /* page-wide background: a slow flowing aurora drawn by a WebGL shader (soft moving light on a 2D canvas if WebGL is missing) */
  var cv = document.getElementById('bg'), gl = null, U = {}, ctx = null;
  var W = 0, H = 0, mouse = { x: .5, y: .5, tx: .5, ty: .5 }, frames = 0;
  var cBg = [242, 245, 250], cA = [194, 48, 78], cN = [23, 54, 93];
  function hex(s) {
    s = (s || '').trim();
    if (s.charAt(0) !== '#') return null;
    if (s.length === 4) s = '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
    return [parseInt(s.substr(1, 2), 16), parseInt(s.substr(3, 2), 16), parseInt(s.substr(5, 2), 16)];
  }
  function readColors() {
    var cs = getComputedStyle(root);
    cBg = hex(cs.getPropertyValue('--bg')) || cBg;
    cA = hex(cs.getPropertyValue('--accent')) || cA;
    cN = hex(cs.getPropertyValue('--navy')) || cN;
  }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  var FS = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH', 'precision highp float;', '#else', 'precision mediump float;', '#endif',
    'uniform vec2 uRes; uniform vec2 uMouse; uniform float uTime; uniform float uScroll; uniform float uK;',
    'uniform vec3 uBg; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;',
    'float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }',
    'float noise(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }',
    'float fbm(vec2 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(7.1, 3.7); a *= 0.5; } return v; }',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / uRes;',
    '  float asp = uRes.x / uRes.y;',
    '  vec2 p = vec2(uv.x * asp, uv.y) * 1.35;',
    '  p.y += uScroll * 0.00045;',
    '  float t = uTime * 0.045;',
    '  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));',
    '  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.8), fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.6));',
    '  float f = fbm(p + 3.0 * r);',
    '  vec3 col = mix(uBg, uA, smoothstep(0.25, 0.85, f));',
    '  col = mix(col, uB, smoothstep(0.35, 1.0, length(q)) * 0.85);',
    '  col = mix(col, uC, smoothstep(0.45, 1.0, r.x) * 0.7);',
    '  float d = distance(vec2(uv.x * asp, uv.y), vec2(uMouse.x * asp, uMouse.y));',
    '  col += uA * exp(-d * d * 14.0) * 0.22;',
    '  vec3 o = mix(uBg, col, uK);',
    '  o += (hash(gl_FragCoord.xy) - 0.5) / 255.0;',
    '  gl_FragColor = vec4(o, 1.0);',
    '}'
  ].join('\n');
  function initGL() {
    try { gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }); } catch (e) { gl = null; }
    if (!gl) return false;
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
    var v = sh(gl.VERTEX_SHADER, 'attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }'), f = sh(gl.FRAGMENT_SHADER, FS);
    if (!v || !f) { gl = null; return false; }
    var pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { gl = null; return false; }
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['uRes', 'uTime', 'uMouse', 'uScroll', 'uBg', 'uA', 'uB', 'uC', 'uK'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
    return true;
  }
  function size() {
    W = window.innerWidth; H = window.innerHeight;
    var k = gl ? .5 : Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.max(2, Math.round(W * k)); cv.height = Math.max(2, Math.round(H * k));
    if (gl) gl.viewport(0, 0, cv.width, cv.height); else ctx.setTransform(k, 0, 0, k, 0, 0);
  }
  function blob(c, a, cx, cy, r) {
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, rgba(c, a)); g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function drawBg(t) {
    var dark = isDark();
    if (gl) {
      var P = dark ? { a: [.92, .36, .5], b: [.16, .34, .78], c: [.32, .22, .7], k: .36 } : { a: [.86, .34, .48], b: [.3, .48, .85], c: [.5, .4, .8], k: .4 };
      gl.uniform2f(U.uRes, cv.width, cv.height);
      gl.uniform1f(U.uTime, t * .001);
      gl.uniform2f(U.uMouse, mouse.x, mouse.y);
      gl.uniform1f(U.uScroll, window.pageYOffset);
      gl.uniform3f(U.uBg, cBg[0] / 255, cBg[1] / 255, cBg[2] / 255);
      gl.uniform3f(U.uA, P.a[0], P.a[1], P.a[2]);
      gl.uniform3f(U.uB, P.b[0], P.b[1], P.b[2]);
      gl.uniform3f(U.uC, P.c[0], P.c[1], P.c[2]);
      gl.uniform1f(U.uK, P.k);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return;
    }
    var big = Math.max(W, H), k2 = dark ? 1.3 : 1;
    ctx.clearRect(0, 0, W, H);
    blob(cA, .13 * k2, W * (.22 + .2 * Math.sin(t * .00013)), H * (.3 + .22 * Math.cos(t * .00011)), big * .5);
    blob(cN, .16 * k2, W * (.78 + .16 * Math.cos(t * .0001 + 1)), H * (.62 + .22 * Math.sin(t * .00012 + 2)), big * .55);
    blob(cA, .08 * k2, W * (.5 + .3 * Math.sin(t * .00008 + 4)), H * (.92 + .1 * Math.cos(t * .0001)), big * .4);
  }
  function loop(now) {
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    drawBg(now);
    if (++frames % 120 === 0) readColors();
    requestAnimationFrame(loop);
  }
  readColors();
  if (!initGL()) { var fresh = cv.cloneNode(false); cv.parentNode.replaceChild(fresh, cv); cv = fresh; ctx = cv.getContext('2d'); }
  cv.setAttribute('data-mode', gl ? 'webgl' : '2d');
  size(); drawBg(0);
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); drawBg(0); }, 150); });
  try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { setTimeout(function () { readColors(); if (reduce) drawBg(0); }, 50); }); } catch (e) {}
  window.addEventListener('pointermove', function (e) {
    mouse.tx = e.clientX / W; mouse.ty = 1 - e.clientY / H;
    if (fine && !reduce) { root.style.setProperty('--px', (e.clientX / W - .5).toFixed(3)); root.style.setProperty('--py', (e.clientY / H - .5).toFixed(3)); }
  }, { passive: true });
  document.addEventListener('pointerleave', function () { mouse.tx = mouse.ty = .5; root.style.setProperty('--px', '0'); root.style.setProperty('--py', '0'); });
  if (reduce) { window.addEventListener('scroll', function () { drawBg(0); }, { passive: true }); }
  else requestAnimationFrame(loop);
})();
