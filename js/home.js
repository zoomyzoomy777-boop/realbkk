/* หน้าหลัก — แกลเลอรีผลงาน Virtual Production */
(() => {
  const $ = (id) => document.getElementById(id);

  /* ================= DATA ================= */
  const PLAYLIST = 'PLheltF9b_MaKxw93Tf2hFwQGweFtbq2q9';
  const FEATURED = [
    { id: 'L0bjRDkoISo', tag: 'Mobile Legends: Bang Bang', title: 'MLBB เปิดตัวกายหงิด' },
    { id: 'Mb83J-dJDBE', tag: 'Google Indonesia', title: 'Google Play Protector Squad Challenge' },
  ];
  const VIDEOS = [
    { id: 'XHiSSVjgMeg', tag: 'Cover', title: 'แก๋ว – Kikie (Cover)' },
    { id: 'CrEOjy6UpGA', tag: 'Official MV', title: 'JARVIS - เอิงเอย (Aoeng Aoey) FT. ZOL' },
    { id: 'YO1Ou8yyN58', tag: 'Official Video', title: 'underclover - แค่หลอกกัน (Lies)' },
    { id: 'Q8nJ4Cf29hE', tag: 'Behind The Scene', title: 'underclover - ไม่ทนอีกแล้ว, มากับฝน & แค่หลอกกัน' },
    { id: 'Ia85HEoymBo', tag: 'Official Video', title: 'underclover - มากับฝน (When It Rains)' },
    { id: 'FSgDyLM9ziU', tag: 'Official Video', title: 'underclover - ไม่ทนอีกแล้ว (No More)' },
    { id: '9gKCCpUcWtM', tag: 'Official MV', title: 'PARADISE - TRVG3DY OF MVRD3R' },
    { id: 'QPA9LoJbrZY', tag: 'Live Performance', title: 'DREAMGALS - PRIORITY' },
    { id: '9HUqdcdLgXo', tag: 'Live Performance', title: 'DREAMGALS - SORRY' },
  ];
  const PHOTOS = (window.GALLERY_PHOTOS || []).map(([id, w, h, cat]) => ({ id, w, h, cat }));
  const HERO = ['jes-3042', '20241006-222539', '20241107-094314', '20250530-162859', 'jes-3050'];

  /* ================= LANGUAGE ================= */
  const T = {
    th: {
      'meta.desc': 'ผลงาน Virtual Production ของ REAL Bangkok — LED Volume, In-Camera VFX, Music Video, โฆษณา และไลฟ์ พร้อมภาพเบื้องหลังการถ่ายทำ',
      'nav.sim': 'จำลองการถ่ายทำ', 'cta.btn2': 'จำลองการถ่ายทำ →', 'nav.videos': 'วิดีโอผลงาน', 'nav.photos': 'ภาพเบื้องหลัง', 'nav.tool': 'LED Wall Configurator',
      'hero.lead': 'ถ่ายทำบนเวที LED Volume ด้วย In-Camera VFX — ฉากเปลี่ยนได้ทันที แสงสะท้อนจริง จบงานได้ในกล้อง',
      'hero.cta1': 'ดูวิดีโอผลงาน', 'hero.cta2': 'ภาพเบื้องหลัง',
      'stat.videos': 'วิดีโอผลงาน', 'stat.photos': 'ภาพเบื้องหลัง', 'stat.years': 'ปีที่ทำงาน',
      'sec.videos': 'วิดีโอผลงาน', 'sec.videosSub': 'โฆษณา · Music Video · Live Performance ที่ถ่ายทำด้วย Virtual Production',
      'sec.playlist': 'Music Video & Live', 'sec.playlistLink': 'ดูเพลย์ลิสต์บน YouTube ↗',
      'sec.photos': 'ภาพเบื้องหลังการถ่ายทำ', 'sec.photosSub': 'Behind The Production — เวที LED, ทีมงาน และระบบควบคุมหน้างาน',
      'f.all': 'ทั้งหมด', 'f.stage': 'เวที LED', 'f.crew': 'ทีมงาน & กล้อง', 'f.control': 'ระบบควบคุม',
      'pc.hint': 'ชี้ที่ต้นไม้เพื่อดูภาพเต็ม · คลิกเพื่อขยาย',
      'cta.title': 'วางแผนจอ LED สำหรับงานของคุณ',
      'cta.sub': 'คำนวณ Pixel Pitch, จำนวนตู้, ความละเอียด และองศาความโค้งของจอ พร้อมมุมมอง 3D',
      'cta.btn': 'เปิด LED Wall Configurator →',
      'alt.stage': 'เวที LED Volume ระหว่างถ่ายทำ Virtual Production',
      'alt.crew': 'ทีมงานและกล้องในกองถ่าย Virtual Production',
      'alt.control': 'ระบบควบคุมและจอมอนิเตอร์หน้างาน Virtual Production',
    },
    en: {
      'meta.desc': 'REAL Bangkok virtual production work — LED volume, in-camera VFX, music videos, commercials and live shows, plus behind-the-scenes photos.',
      'nav.sim': 'Shoot simulator', 'cta.btn2': 'Open shoot simulator →', 'nav.videos': 'Showreel', 'nav.photos': 'Behind the scenes', 'nav.tool': 'LED Wall Configurator',
      'hero.lead': 'Shot on an LED volume with in-camera VFX — instant set changes, real reflections, finished in camera.',
      'hero.cta1': 'Watch our work', 'hero.cta2': 'Behind the scenes',
      'stat.videos': 'Videos', 'stat.photos': 'BTS photos', 'stat.years': 'Years active',
      'sec.videos': 'Featured work', 'sec.videosSub': 'Commercials · music videos · live performances shot with virtual production',
      'sec.playlist': 'Music Video & Live', 'sec.playlistLink': 'Open playlist on YouTube ↗',
      'sec.photos': 'Behind the production', 'sec.photosSub': 'LED stages, crew and on-set control systems',
      'f.all': 'All', 'f.stage': 'LED stage', 'f.crew': 'Crew & camera', 'f.control': 'Control',
      'pc.hint': 'Point at a tree to reveal its photo · click to enlarge',
      'cta.title': 'Plan the LED wall for your shoot',
      'cta.sub': 'Work out pixel pitch, cabinet count, resolution and curve angles with a live 3D view.',
      'cta.btn': 'Open LED Wall Configurator →',
      'alt.stage': 'LED volume stage during a virtual production shoot',
      'alt.crew': 'Crew and camera on a virtual production set',
      'alt.control': 'On-set control systems and monitors for virtual production',
    },
    ja: {
      'meta.desc': 'REAL Bangkok のバーチャルプロダクション作品 — LEDボリューム、インカメラVFX、MV、CM、ライブ、撮影の舞台裏写真。',
      'nav.sim': '撮影シミュレーター', 'cta.btn2': '撮影シミュレーターを開く →', 'nav.videos': '作品動画', 'nav.photos': '舞台裏', 'nav.tool': 'LED Wall Configurator',
      'hero.lead': 'LEDボリュームとインカメラVFXで撮影 — 背景を即座に切り替え、リアルな映り込みをそのままカメラで完成。',
      'hero.cta1': '作品を見る', 'hero.cta2': '舞台裏',
      'stat.videos': '作品動画', 'stat.photos': '舞台裏写真', 'stat.years': '活動期間',
      'sec.videos': '作品動画', 'sec.videosSub': 'バーチャルプロダクションで撮影したCM・MV・ライブ',
      'sec.playlist': 'Music Video & Live', 'sec.playlistLink': 'YouTubeで再生リストを見る ↗',
      'sec.photos': '撮影の舞台裏', 'sec.photosSub': 'LEDステージ、スタッフ、現場のコントロールシステム',
      'f.all': 'すべて', 'f.stage': 'LEDステージ', 'f.crew': 'スタッフ・カメラ', 'f.control': 'コントロール',
      'pc.hint': '木にカーソルを合わせて写真を表示 · クリックで拡大',
      'cta.title': '撮影用LEDウォールを計画する',
      'cta.sub': 'ピクセルピッチ、キャビネット数、解像度、カーブ角度を3Dビューで計算。',
      'cta.btn': 'LED Wall Configurator を開く →',
      'alt.stage': 'バーチャルプロダクション撮影中のLEDボリューム',
      'alt.crew': 'バーチャルプロダクション現場のスタッフとカメラ',
      'alt.control': 'バーチャルプロダクション現場のコントロールシステム',
    },
  };
  const LANGS = ['th', 'en', 'ja'];
  let LANG = (() => {
    const q = new URLSearchParams(location.search).get('lang');
    if (LANGS.includes(q)) return q;
    try { const v = localStorage.getItem('ledwall-lang'); if (LANGS.includes(v)) return v; } catch (e) { /* ignore */ }
    return 'th';
  })();
  const t = (k) => T[LANG][k] ?? T.th[k];

  function applyLang() {
    document.documentElement.lang = LANG;
    $('metaDesc').content = t('meta.desc');
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('#langSeg button').forEach((b) => b.classList.toggle('on', b.dataset.v === LANG));
    document.querySelectorAll('.ph img').forEach((img) => { img.alt = t('alt.' + img.dataset.cat); });
    renderFilterCounts();
    showRead(hov);
  }
  $('langSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b || b.dataset.v === LANG) return;
    LANG = b.dataset.v;
    try { localStorage.setItem('ledwall-lang', LANG); } catch (err) { /* ignore */ }
    applyLang();
  });

  /* ================= HERO SLIDESHOW ================= */
  const slides = HERO.map((id, i) => {
    const img = new Image();
    img.src = `images/gallery/full/${id}.webp`;
    img.alt = '';
    if (i === 0) img.className = 'on';
    else img.loading = 'lazy';
    $('heroSlides').appendChild(img);
    return img;
  });
  let heroIdx = 0;
  setInterval(() => {
    if (document.hidden) return;
    slides[heroIdx].classList.remove('on');
    heroIdx = (heroIdx + 1) % slides.length;
    slides[heroIdx].classList.add('on');
    $('hudScn').textContent = String(heroIdx + 1).padStart(2, '0');
    $('hudPct').textContent = 60 + Math.floor(Math.random() * 40) + '%';
  }, 6000);

  /* ================= HUD CLOCK (เวลากรุงเทพฯ) ================= */
  const clockFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const tick = () => { $('sysClock').textContent = clockFmt.format(new Date()); };
  tick();
  setInterval(tick, 1000);

  /* ================= VIDEOS ================= */
  function vidCard(v) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'vid';
    b.innerHTML = `<div class="vid-thumb"><img loading="lazy" alt=""><span class="play"></span></div>
      <div class="vid-meta"><div class="vid-tag"></div><div class="vid-title"></div></div>`;
    const img = b.querySelector('img');
    img.src = `https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`;
    img.onerror = () => { img.onerror = null; img.src = `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`; };
    b.querySelector('.vid-tag').textContent = v.tag;
    b.querySelector('.vid-title').textContent = v.title;
    b.setAttribute('aria-label', '▶ ' + v.title);
    b.addEventListener('click', () => openVideo(v));
    return b;
  }
  FEATURED.forEach((v) => $('vidFeatured').appendChild(vidCard({ ...v })));
  VIDEOS.forEach((v) => $('vidGrid').appendChild(vidCard({ ...v, list: PLAYLIST })));
  $('statVideos').textContent = FEATURED.length + VIDEOS.length;

  /* ================= PHOTOS: POINT CLOUD FOREST ================= */
  // แต่ละภาพ = ต้นไม้ 1 ต้นในป่าแบบ point cloud 3D (พิกเซลของภาพถูกพันรอบลำต้น/พุ่มไม้)
  // บนสุดของภาพ = ยอดไม้, แถวล่าง = ลำต้น / ชี้ที่ต้นไม้ → จุดบินมาเรียงเป็นภาพ แล้วภาพจริงปรากฏ / คลิกเพื่อขยาย
  // ไม่มี WebGL2 หรืออ่านพิกเซลไม่ได้ → แสดงเป็นตารางรูปปกติ (.pc-off)
  let filter = 'all';
  let visible = PHOTOS;
  let hov = null;
  const pc = $('pc'), tiles = $('photoGrid'), cvs = $('pcCanvas'), reveal = $('pcReveal');
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLS = 36;        // จำนวนจุดตามแนวกว้างของแต่ละภาพ
  const N = PHOTOS.length;
  const STRIDE = 11;      // uv2, tile, lum, local xyz, rnd4

  // สุ่มแบบกำหนด seed ได้ — ป่าหน้าตาเดิมทุกครั้งที่เปิด
  const rng = (s) => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let x = Math.imul(s ^ s >>> 15, 1 | s); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };

  PHOTOS.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ph';
    b.dataset.cat = p.cat;
    const img = document.createElement('img');
    img.dataset.cat = p.cat;
    img.dataset.src = `images/gallery/thumb/${p.id}.webp`;
    img.decoding = 'async';
    img.draggable = false;
    img.onload = () => { img.classList.add('ld'); sample(p); };
    b.appendChild(img);
    b.addEventListener('click', () => openPhoto(visible.indexOf(p)));
    b.addEventListener('focus', () => setHover(p));
    b.addEventListener('blur', () => { if (hov === p) setHover(null); });
    tiles.appendChild(b);
    const r = rng(i * 7919 + 13);
    const pine = r() < .62;
    p.tree = {
      pine,
      ht: 170 + r() * 110,
      R: pine ? 42 + r() * 30 : 55 + r() * 32,
      trunk: .28 + r() * .12,
      tw: 4 + r() * 3.5,
      layers: 4 + Math.floor(r() * 3),
    };
    Object.assign(p, { el: b, i, pts: null, pos: null, to: null, hv: 0, vis: 1, hRatio: p.h / p.w, img: [0, 0, 0, 0] });
  });
  $('statPhotos').textContent = N;

  function setHover(p) {
    if (hov === p) return;
    hov = p;
    pc.classList.toggle('hot', !!p);
    if (p) reveal.firstChild.src = p.el.firstChild.dataset.src;
    reveal.firstChild.alt = p ? t('alt.' + p.cat) : '';
    showRead(p);
  }
  function showRead(p) {
    $('pcIdx').textContent = p ? String(visible.indexOf(p) + 1).padStart(2, '0') : '--';
    $('pcCat').textContent = p ? t('f.' + p.cat) : t('pc.hint');
  }

  // ตำแหน่งจุดบนต้นไม้ (พิกัดท้องถิ่น) จากตำแหน่งพิกเซลในภาพ: u = รอบลำต้น, v = บนลงล่าง
  function treePoint(tr, u, v, r1, r2) {
    const ang = u * Math.PI * 2 + r1 * .35;
    if (v > .8) {                                   // 20% ล่าง = ลำต้น
      const k = Math.random();                      // สุ่มความสูงตลอดลำต้น (ไม่เป็นวงแหวนตามแถวพิกเซล)
      const rad = tr.tw * (.75 + .25 * r2) * (1 + k * .6);
      return [Math.cos(ang) * rad, (1 - k) * tr.ht * tr.trunk, Math.sin(ang) * rad];
    }
    const k = Math.min(1, Math.max(0, v / .8 + (Math.random() - .5) * .06));   // 0 = ยอด, 1 = โคนพุ่ม
    const y = tr.ht - k * (tr.ht - tr.ht * tr.trunk * .7);
    let rad = tr.pine
      ? tr.R * Math.pow(k, .9) * (.6 + .4 * ((k * tr.layers) % 1))
      : tr.R * Math.pow(Math.sin(Math.PI * Math.min(1, k * 1.04)), .6);
    rad *= .4 + .6 * Math.sqrt(r2);
    return [Math.cos(ang) * rad, y + (r1 - .5) * 6, Math.sin(ang) * rad];
  }

  /* ---- กล้อง & การวางต้นไม้ ---- */
  let W = 0, CH = 0, F = 1, dpr = 1;
  const cam = { x: 0, y: 125, cx: 0, cy: 0 };
  const proj = (x, y, z) => { const k = F / Math.max(z, 40); return [cam.cx + (x - cam.x) * k, cam.cy - (y - cam.y) * k, k]; };

  function layout() {
    W = pc.clientWidth; CH = pc.clientHeight;
    F = Math.max(W * .75, CH * .9);   // จอแนวตั้ง (มือถือ): ซูมเข้าให้ป่าเต็มความสูง
    cam.cx = W / 2; cam.cy = CH * (CH > W ? .52 : .44);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cvs.width = Math.round(W * dpr); cvs.height = Math.round(CH * dpr);
    // แถวลึกเข้าไปในป่า: แถวหลังกว้างกว่า (มุมมองเพอร์สเปกทีฟ) จึงมีต้นไม้มากกว่า
    const n = visible.length;
    const rows = Math.max(1, Math.round(Math.sqrt(n / 2.4)));
    const zs = Array.from({ length: rows }, (_, r) => rows === 1 ? 520 : 430 + r * (1150 / (rows - 1)));
    const sum = zs.reduce((s, z) => s + z, 0);
    let left = n;
    const counts = zs.map((z, r) => { const c = r === rows - 1 ? left : Math.max(1, Math.round(n * z / sum)); left -= c; return c; });
    const r = rng(n * 31 + 7);
    let k = 0;
    zs.forEach((z, ri) => {
      const half = (W / 2) * z / F * .94, c = counts[ri], gap = 2 * half / Math.max(1, c);
      for (let j = 0; j < c && k < n; j++, k++) {
        const p = visible[(k * 37) % n];       // กระจายภาพแต่ละหมวดให้ทั่วป่า
        p.to = [-half + (j + .5) * gap + (r() - .5) * gap * .55 + (ri % 2) * gap * .25, z + (r() - .5) * 90];
        if (!p.pos) p.pos = p.to.slice();
      }
    });
    PHOTOS.forEach((p) => { p.el.hidden = !visible.includes(p); if (!p.to) p.to = [0, 1400]; if (!p.pos) p.pos = p.to.slice(); });
    $('pcTotal').textContent = String(n).padStart(2, '0');
  }

  /* ---- WebGL2 point renderer ---- */
  const gl = cvs.getContext('webgl2', { antialias: false, premultipliedAlpha: true, alpha: true });
  let prog = null, vbo = null, count = 0, dirty = false, U = {}, env = null;
  if (!gl || gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) < N * 2 + 16) pc.classList.add('pc-off');
  else initGL();

  function initGL() {
    const vs = `#version 300 es
      precision highp float;
      layout(location=0) in vec2 aUV; layout(location=1) in float aTile; layout(location=2) in float aLum;
      layout(location=3) in vec3 aLoc; layout(location=4) in vec4 aRnd;
      uniform vec4 uTree[${N}];   // x, z, hover, visible
      uniform vec4 uRect[${N}];   // กรอบภาพเต็มบนจอ (px)
      uniform vec2 uRes, uMouse, uCen; uniform vec3 uCam;
      uniform float uTime, uDpr, uMotion, uBorn;
      out vec4 vC;
      void main() {
        float h = 0., vis = 1.; vec4 r = vec4(0.); vec3 P;
        bool isTree = aTile > -.5;
        if (isTree) {
          int ti = int(aTile + .5);
          vec4 tr = uTree[ti]; r = uRect[ti]; h = tr.z; vis = tr.w;
          float sway = sin(uTime * .7 + aTile * 1.7) * pow(max(aLoc.y, 0.) / 260., 2.) * 9. * uMotion;
          P = vec3(tr.x + aLoc.x + sway, aLoc.y, tr.y + aLoc.z);
        } else {
          P = aLoc;   // พื้นป่า (-1) / ละอองลอย (-2)
          if (aTile < -1.5) P += vec3(sin(uTime * .3 + aRnd.x * 40.) * 22., sin(uTime * .5 + aRnd.y * 30.) * 14., 0.) * uMotion;
        }
        float born = smoothstep(0., 1., clamp(uBorn * 1.6 - aRnd.w * .6, 0., 1.));
        P += (aRnd.xyz - .5) * vec3(1600., 900., 900.) * (1. - born);
        float z = max(P.z, 40.), k = uCam.z / z;
        vec2 s = uCen + vec2(P.x - uCam.x, -(P.y - uCam.y)) * k;
        float sz = (.8 + aLum * 1.5) * k;
        vec2 dm = s - uMouse; float lm = length(dm);
        s += dm / max(lm, 1.) * smoothstep(110., 0., lm) * 10. * (1. - h);
        // ต้นไม้ที่ถูกชี้: จุดบินไปเรียงเป็นภาพ
        vec2 tgt = r.xy + aUV * r.zw;
        float hh = smoothstep(0., 1., clamp(h * 1.3 - aRnd.w * .3, 0., 1.));
        s = mix(s, tgt, hh);
        sz = mix(sz, r.z / ${COLS}. * (.45 + aLum * .75), hh);
        gl_Position = vec4(s.x / uRes.x * 2. - 1., 1. - s.y / uRes.y * 2., 0., 1.);
        gl_PointSize = max(sz, .9) * uDpr;
        float fog = 1. - smoothstep(450., 1900., z) * .78;
        float a = vis * (.16 + aLum * .95) * mix(fog, 1., hh) * mix(.25, 1., born) * (1. - smoothstep(.88, 1., h));
        vec3 col = isTree
          ? mix(mix(vec3(.26, .36, .32), vec3(.9, .95, .92), aLum), vec3(.96), hh)
          : vec3(.5, .56, .6);
        if (aRnd.z > .982) col = vec3(.88, .13, .17);
        vC = vec4(col * a, a);
      }`;
    const fs = `#version 300 es
      precision mediump float;
      in vec4 vC; out vec4 o;
      void main() { o = vC * smoothstep(.5, .28, length(gl_PointCoord - .5)); }`;
    const sh = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (err) { console.warn('point cloud disabled:', err); prog = null; pc.classList.add('pc-off'); return; }
    ['uTree', 'uRect', 'uRes', 'uMouse', 'uCen', 'uCam', 'uTime', 'uDpr', 'uMotion', 'uBorn'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
    vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    [[0, 2, 0], [1, 1, 2], [2, 1, 3], [3, 3, 4], [4, 4, 7]].forEach(([loc, n, off]) => {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, n, gl.FLOAT, false, STRIDE * 4, off * 4);
    });
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // พื้นป่า + ละอองลอยในอากาศ
    const r = rng(99), out = [];
    for (let i = 0; i < 6000; i++) out.push(0, 0, -1, .2 + r() * .35, (r() - .5) * 4200, 0, 300 + r() * 1800, r(), r(), r(), r());
    for (let i = 0; i < 700; i++) out.push(0, 0, -2, .2 + r() * .6, (r() - .5) * 3200, r() * 380, 320 + r() * 1600, r(), r(), r(), r());
    env = new Float32Array(out);
    dirty = true;
  }

  // อ่านพิกเซลจาก thumbnail → จุดบนต้นไม้
  const smp = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  function sample(p) {
    if (!prog || p.pts) return;
    const cols = COLS, rows = Math.max(8, Math.round(COLS * p.h / p.w));
    smp.canvas.width = cols; smp.canvas.height = rows;
    smp.drawImage(p.el.firstChild, 0, 0, cols, rows);
    let d;
    try { d = smp.getImageData(0, 0, cols, rows).data; } catch (err) { prog = null; pc.classList.add('pc-off'); return; }
    const out = new Float32Array(cols * rows * STRIDE);
    let o = 0;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const q = (y * cols + x) * 4;
      const lum = (d[q] * .299 + d[q + 1] * .587 + d[q + 2] * .114) / 255;
      const u = (x + .5) / cols, v = (y + .5) / rows;
      const r1 = Math.random(), r2 = Math.random();
      const [lx, ly, lz] = treePoint(p.tree, u, v, r1, r2);
      out.set([u, v, p.i, lum, lx, ly, lz, Math.random(), Math.random(), Math.random(), Math.random()], o);
      o += STRIDE;
    }
    p.pts = out;
    loaded++;
    dirty = true;
  }
  function upload() {
    dirty = false;
    const parts = [env, ...PHOTOS.map((p) => p.pts)].filter(Boolean);
    const all = new Float32Array(parts.reduce((s, a) => s + a.length, 0));
    let o = 0;
    parts.forEach((a) => { all.set(a, o); o += a.length; });
    count = all.length / STRIDE;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, all, gl.STATIC_DRAW);
  }

  /* ---- เมาส์: หาต้นไม้ที่อยู่ใต้เคอร์เซอร์ (ต้นหน้าสุดก่อน) ---- */
  const mouse = [-1e4, -1e4], par = [0, 0], parT = [0, 0];
  function treeBox(p) {
    const [x, z] = p.pos, tr = p.tree;
    const [sx, sb, k] = proj(x, 0, z), st = proj(x, tr.ht, z)[1];
    return [sx - tr.R * k, st, sx + tr.R * k, sb];
  }
  const inside = (b, x, y) => x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3];
  function pick() {
    const [mx, my] = mouse;
    if (hov && hov.hv > .3 && inside([hov.img[0], hov.img[1], hov.img[0] + hov.img[2], hov.img[1] + hov.img[3]], mx, my)) return hov;
    let best = null;
    visible.forEach((p) => { if (inside(treeBox(p), mx, my) && (!best || p.pos[1] < best.pos[1])) best = p; });
    return best;
  }
  pc.addEventListener('pointermove', (e) => {
    const r = pc.getBoundingClientRect();
    mouse[0] = e.clientX - r.left; mouse[1] = e.clientY - r.top;
    parT[0] = (e.clientX / window.innerWidth - .5) * 2; parT[1] = (e.clientY / window.innerHeight - .5) * 2;
    if (e.pointerType !== 'touch' && prog) setHover(pick());
  });
  pc.addEventListener('pointerleave', (e) => {
    mouse[0] = mouse[1] = -1e4; parT[0] = parT[1] = 0;
    if (e.pointerType !== 'touch' && !pc.contains(document.activeElement)) setHover(null);
  });
  // แตะ (มือถือ): แตะต้นไม้ = เปิดภาพ, แตะภาพ = ขยาย, แตะที่ว่าง = ปิด
  pc.addEventListener('click', (e) => {
    if (!prog || e.target === reveal || reveal.contains(e.target) || e.target.closest('.ph')) return;
    const r = pc.getBoundingClientRect();
    mouse[0] = e.clientX - r.left; mouse[1] = e.clientY - r.top;
    const p = pick();
    if (p && p === hov && p.hv > .6) openPhoto(visible.indexOf(p));
    else setHover(p);
  });
  reveal.addEventListener('click', () => { if (hov) openPhoto(visible.indexOf(hov)); });

  const treeArr = new Float32Array(N * 4), rectArr = new Float32Array(N * 4);
  let running = false, last = 0, born = reduceMotion ? 1 : 0, loaded = 0, seenAt = 0;
  function frame(now) {
    if (!running || !prog) return;
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    if (dirty) upload();
    if (!seenAt) seenAt = now;
    if (born < 1 && (loaded >= N * .9 || now - seenAt > 2500)) born = Math.min(1, born + dt * .45);
    const ease = reduceMotion ? 1 : 1 - Math.pow(.001, dt);
    par[0] += (parT[0] - par[0]) * ease; par[1] += (parT[1] - par[1]) * ease;
    const mo = reduceMotion ? 0 : 1;
    cam.x = (par[0] * 70 + Math.sin(now / 1000 * .12) * 40) * mo;
    cam.y = 125 - par[1] * 35 * mo;
    const iw = Math.min(380, Math.max(200, W * .3));
    PHOTOS.forEach((p, i) => {
      p.pos[0] += (p.to[0] - p.pos[0]) * Math.min(1, ease * 1.6);
      p.pos[1] += (p.to[1] - p.pos[1]) * Math.min(1, ease * 1.6);
      p.hv += ((p === hov ? 1 : 0) - p.hv) * Math.min(1, ease * 2.4);
      p.vis += ((p.el.hidden ? 0 : 1) - p.vis) * Math.min(1, ease * 2);
      if (p.hv > .001) {
        // กรอบภาพเต็ม: ตรงกลางพุ่มไม้ ไม่ล้นขอบ
        const [sx, sy] = proj(p.pos[0], p.tree.ht * .6, p.pos[1]);
        const w = Math.min(iw, W - 24);
        p.img[2] = w; p.img[3] = w * p.hRatio;
        p.img[0] = Math.min(W - 12 - w, Math.max(12, sx - w / 2));
        p.img[1] = Math.min(CH - 12 - p.img[3], Math.max(12, sy - p.img[3] / 2));
      }
      treeArr.set([p.pos[0], p.pos[1], p.hv, p.vis], i * 4);
      rectArr.set(p.img, i * 4);
    });
    // ภาพจริงขึ้นทับเมื่อจุดเรียงตัวเกือบเสร็จ
    const on = hov && hov.hv > .82;
    reveal.classList.toggle('on', !!on);
    if (hov) Object.assign(reveal.style, { left: hov.img[0] + 'px', top: hov.img[1] + 'px', width: hov.img[2] + 'px', height: hov.img[3] + 'px' });

    gl.viewport(0, 0, cvs.width, cvs.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    if (count) {
      gl.useProgram(prog);
      gl.uniform4fv(U.uTree, treeArr); gl.uniform4fv(U.uRect, rectArr);
      gl.uniform2f(U.uRes, W, CH); gl.uniform2f(U.uMouse, mouse[0], mouse[1]);
      gl.uniform2f(U.uCen, cam.cx, cam.cy); gl.uniform3f(U.uCam, cam.x, cam.y, F);
      gl.uniform1f(U.uTime, now / 1000); gl.uniform1f(U.uDpr, dpr);
      gl.uniform1f(U.uMotion, mo); gl.uniform1f(U.uBorn, born);
      gl.drawArrays(gl.POINTS, 0, count);
    }
    requestAnimationFrame(frame);
  }

  // โหลด thumbnail ทั้งหมดเมื่อใกล้ถึงส่วนนี้ / วาดเฉพาะตอนที่มองเห็น
  const loadAll = () => PHOTOS.forEach((p) => { const img = p.el.firstChild; if (!img.src) img.src = img.dataset.src; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { loadAll(); if (!running) { running = true; last = 0; requestAnimationFrame(frame); } }
        else running = false;
      });
    }, { rootMargin: '400px 0px' }).observe(pc);
  } else { loadAll(); running = true; requestAnimationFrame(frame); }
  window.addEventListener('resize', layout);

  function renderFilterCounts() {
    document.querySelectorAll('#photoFilter button').forEach((b) => {
      const f = b.dataset.f;
      const n = f === 'all' ? PHOTOS.length : PHOTOS.filter((p) => p.cat === f).length;
      const s = document.createElement('span'); s.className = 'n'; s.textContent = n;
      b.appendChild(s);
    });
  }
  $('photoFilter').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b || b.dataset.f === filter) return;
    filter = b.dataset.f;
    document.querySelectorAll('#photoFilter button').forEach((x) => x.classList.toggle('on', x === b));
    visible = PHOTOS.filter((p) => filter === 'all' || p.cat === filter);
    setHover(null);
    layout();
  });
  layout();

  /* ================= LIGHTBOX ================= */
  const lb = $('lb'), stage = $('lbStage');
  let lbIdx = -1, lastFocus = null;

  function openLb(isVideo) {
    lastFocus = document.activeElement;
    lb.classList.toggle('video', isVideo);
    lb.hidden = false;
    document.body.classList.add('lb-open');
    $('lbClose').focus();
  }
  function closeLb() {
    lb.hidden = true;
    stage.textContent = '';
    lbIdx = -1;
    document.body.classList.remove('lb-open');
    if (lastFocus) lastFocus.focus();
  }
  function openVideo(v) {
    const f = document.createElement('iframe');
    f.className = 'yt';
    f.src = `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0${v.list ? '&list=' + v.list : ''}`;
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.allowFullscreen = true;
    f.title = v.title;
    stage.replaceChildren(f);
    openLb(true);
  }
  function showPhoto(i) {
    lbIdx = (i + visible.length) % visible.length;
    const p = visible[lbIdx];
    const img = new Image();
    img.src = `images/gallery/full/${p.id}.webp`;
    img.alt = t('alt.' + p.cat);
    stage.replaceChildren(img);
    $('lbCount').textContent = `${lbIdx + 1} / ${visible.length}`;
    // โหลดรูปถัดไปล่วงหน้า
    const nx = visible[(lbIdx + 1) % visible.length];
    if (nx) new Image().src = `images/gallery/full/${nx.id}.webp`;
  }
  function openPhoto(i) { showPhoto(i); openLb(false); }

  $('lbClose').addEventListener('click', closeLb);
  $('lbPrev').addEventListener('click', () => showPhoto(lbIdx - 1));
  $('lbNext').addEventListener('click', () => showPhoto(lbIdx + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target === stage) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (lbIdx >= 0 && e.key === 'ArrowLeft') showPhoto(lbIdx - 1);
    else if (lbIdx >= 0 && e.key === 'ArrowRight') showPhoto(lbIdx + 1);
  });
  let touchX = null;
  stage.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (touchX == null || lbIdx < 0) return;
    const dx = e.changedTouches[0].clientX - touchX; touchX = null;
    if (Math.abs(dx) > 50) showPhoto(lbIdx + (dx < 0 ? 1 : -1));
  });

  applyLang();
})();

/* ================= LOGO INTRO ================= */
(() => {
  const root = document.documentElement;
  const intro = document.getElementById('intro');
  if (!root.classList.contains('intro-on')) { intro.remove(); return; }
  const vid = document.getElementById('introVid');
  const bar = document.getElementById('introBar');
  let done = false;

  function finish() {
    if (done) return;
    done = true;
    try { sessionStorage.setItem('intro-seen', '1'); } catch (e) { /* ignore */ }
    intro.classList.add('out');
    root.classList.remove('intro-on');
    setTimeout(() => { vid.pause(); intro.remove(); }, 800);
  }

  vid.addEventListener('ended', finish);
  vid.addEventListener('error', finish, true);
  vid.addEventListener('timeupdate', () => {
    if (vid.duration) bar.style.width = (vid.currentTime / vid.duration) * 100 + '%';
  });
  document.getElementById('introSkip').addEventListener('click', finish);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') finish(); });

  const sound = document.getElementById('introSound');
  sound.addEventListener('click', () => {
    vid.muted = !vid.muted;
    sound.setAttribute('aria-pressed', String(!vid.muted));
    sound.textContent = vid.muted ? '♪ Sound off' : '♪ Sound on';
  });

  // เบราว์เซอร์บล็อกการเล่นอัตโนมัติ หรือโหลดช้าเกินไป → ข้ามไปหน้าเว็บเลย
  const p = vid.play();
  if (p && p.catch) p.catch(finish);
  setTimeout(() => { if (!done && vid.currentTime === 0) finish(); }, 4000);
})();
