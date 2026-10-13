(() => {
  'use strict';

  /* ================= DATA ================= */
  // ค่า pitch จริงของแต่ละรุ่น (ป้ายชื่อ P2.9 จริงๆ คือ 2.976 mm ฯลฯ)
  const PITCHES = [
    { id: 'P0.9', v: 0.9375 }, { id: 'P1.2', v: 1.25 }, { id: 'P1.5', v: 1.5625 },
    { id: 'P1.8', v: 1.875 }, { id: 'P1.9', v: 1.953 }, { id: 'P2.5', v: 2.5 },
    { id: 'P2.6', v: 2.604 }, { id: 'P2.9', v: 2.976 }, { id: 'P3.9', v: 3.91 },
    { id: 'P4.8', v: 4.81 }, { id: 'P5', v: 5 }, { id: 'P6', v: 6 },
    { id: 'P8', v: 8 }, { id: 'P10', v: 10 }, { id: 'custom', v: null },
  ];
  // tag = key ใน I18N หรือข้อความที่เหมือนกันทุกภาษา
  const CABINETS = [
    { id: '500x500', w: 500, h: 500, tag: 'cab.std' },
    { id: '500x1000', w: 500, h: 1000 },
    { id: '500x250', w: 500, h: 250 },
    { id: '1000x500', w: 1000, h: 500 },
    { id: '600x337.5', w: 600, h: 337.5, tag: ' (16:9)' },
    { id: '640x480', w: 640, h: 480 },
    { id: '960x960', w: 960, h: 960, tag: 'cab.outdoor' },
    { id: 'custom', w: null, h: null },
  ];
  const FORMATS = [
    { n: 'HD', w: 1280, h: 720 }, { n: 'Full HD', w: 1920, h: 1080 },
    { n: '2K DCI', w: 2048, h: 1080 }, { n: 'QHD', w: 2560, h: 1440 },
    { n: '4K UHD', w: 3840, h: 2160 }, { n: '8K', w: 7680, h: 4320 },
  ];
  const RATIOS = [
    ['1:1', 1], ['5:4', 1.25], ['4:3', 4 / 3], ['3:2', 1.5], ['16:10', 1.6], ['16:9', 16 / 9],
    ['2:1', 2], ['21:9', 21 / 9], ['3:1', 3], ['32:9', 32 / 9], ['4:1', 4], ['9:16', 9 / 16], ['3:4', 0.75],
  ];
  const PX_PER_PORT = 650000; // 1 พอร์ต Gigabit ≈ 650,000 px (60Hz, 8bit)
  const DEG = Math.PI / 180;
  const MAX_N = 100;

  const DEFAULT = {
    pitchId: 'P2.6', pitch: 2.604,
    cabId: '500x500', cabW: 500, cabH: 500,
    pxOverride: false, cabPxW: 192, cabPxH: 192,
    mode: 'count', cols: 12, rows: 6, targetW: 6, targetH: 3,
    mountH: 0.6,
    curve: 'flat', angle: 5, joints: [],
    kgM2: 30, wM2: 600,
    view: '3d',
  };

  /* ================= LANGUAGE ================= */
  const LANGS = ['th', 'en', 'ja'];
  let LANG = (() => {
    const q = new URLSearchParams(location.search).get('lang');
    if (LANGS.includes(q)) return q;
    try { const v = localStorage.getItem('ledwall-lang'); if (LANGS.includes(v)) return v; } catch (e) { /* ignore */ }
    return 'th';
  })();
  function t(key, ...args) {
    const v = (window.I18N[LANG] && window.I18N[LANG][key]) ?? window.I18N.th[key];
    if (v === undefined) return key;
    return typeof v === 'function' ? v(...args) : v;
  }
  function applyLang() {
    document.documentElement.lang = LANG;
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    $('metaDesc').content = t('meta.desc');
    setSeg('langSeg', LANG);
  }

  /* ================= STATE ================= */
  const S = loadState();
  const cam = { yaw: -0.55, pitch: 0.22, zoom: 1 };

  function loadState() {
    let s = {};
    try {
      if (location.hash.length > 2) s = JSON.parse(decodeURIComponent(atob(location.hash.slice(1))));
      else s = JSON.parse(localStorage.getItem('ledwall-state') || '{}');
    } catch (e) { s = {}; }
    return Object.assign({}, DEFAULT, s);
  }
  function saveState() {
    try { localStorage.setItem('ledwall-state', JSON.stringify(S)); } catch (e) { /* ignore */ }
  }
  function shareUrl() {
    const h = btoa(encodeURIComponent(JSON.stringify(S)));
    return location.href.split('#')[0] + '#' + h;
  }

  /* ================= HELPERS ================= */
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
  const fmt = (n, d = 0) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtAuto = (n, max = 2) => Number(n).toLocaleString('en-US', { maximumFractionDigits: max });
  const m = (mm, d = 2) => fmt(mm / 1000, d);
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);

  /* ================= CALC ================= */
  function cabPixels() {
    if (S.pxOverride) return { w: Math.max(1, Math.round(S.cabPxW)), h: Math.max(1, Math.round(S.cabPxH)) };
    return { w: Math.max(1, Math.round(S.cabW / S.pitch)), h: Math.max(1, Math.round(S.cabH / S.pitch)) };
  }

  function gridSize() {
    if (S.mode === 'size') {
      return {
        cols: clamp(Math.round((S.targetW * 1000) / S.cabW), 1, MAX_N),
        rows: clamp(Math.round((S.targetH * 1000) / S.cabH), 1, MAX_N),
      };
    }
    return { cols: clamp(Math.round(S.cols), 1, MAX_N), rows: clamp(Math.round(S.rows), 1, MAX_N) };
  }

  function jointAngles(cols) {
    const n = cols - 1;
    if (S.curve === 'uniform') return Array(n).fill(clamp(S.angle, -90, 90));
    if (S.curve === 'custom') return Array.from({ length: n }, (_, i) => clamp(num(S.joints[i], 0), -180, 180));
    return Array(n).fill(0);
  }

  // สร้างเส้นทางมุมบน (top view) ของแนวจอ — x ขวา, z เข้าหาผู้ชม
  function buildGeometry(cols, w, joints) {
    let x = 0, z = 0, h = 0;
    const raw = [{ x, z }];
    for (let i = 0; i < cols; i++) {
      x += w * Math.cos(h);
      z += w * Math.sin(h);
      raw.push({ x, z });
      if (i < cols - 1) h += joints[i] * DEG;
    }
    const a = raw[0], b = raw[raw.length - 1];
    const chord = Math.hypot(b.x - a.x, b.z - a.z);
    // หมุนให้คอร์ดอยู่แนวนอน (ถ้าคอร์ดสั้นมาก เช่นวงกลม ใช้ทิศเริ่มต้น)
    const ang = chord > 1 ? Math.atan2(b.z - a.z, b.x - a.x) : 0;
    const c = Math.cos(-ang), s = Math.sin(-ang);
    let pts = raw.map((p) => {
      const dx = p.x - a.x, dz = p.z - a.z;
      return { x: dx * c - dz * s, z: dx * s + dz * c };
    });
    const midX = (pts[0].x + pts[pts.length - 1].x) / 2;
    pts = pts.map((p) => ({ x: p.x - midX, z: p.z }));
    // ให้ศูนย์กลางของความลึกอยู่ที่ 0 เพื่อให้ 3D หมุนสวย
    let xMin = Infinity, xMax = -Infinity, zMin = Infinity, zMax = -Infinity;
    for (const p of pts) {
      xMin = Math.min(xMin, p.x); xMax = Math.max(xMax, p.x);
      zMin = Math.min(zMin, p.z); zMax = Math.max(zMax, p.z);
    }
    return {
      pts, chord, xMin, xMax, zMin, zMax,
      footW: xMax - xMin, depth: zMax - zMin,
      total: joints.reduce((s2, v) => s2 + v, 0),
    };
  }

  function nearestRatio(r) {
    let best = RATIOS[0], bd = Infinity;
    for (const it of RATIOS) {
      const d = Math.abs(Math.log(r / it[1]));
      if (d < bd) { bd = d; best = it; }
    }
    return { name: best[0], exact: bd < 0.012 };
  }

  function compute() {
    const px = cabPixels();
    const { cols, rows } = gridSize();
    const joints = jointAngles(cols);
    const geo = buildGeometry(cols, S.cabW, joints);
    const W = cols * px.w, H = rows * px.h;
    const wallW = cols * S.cabW, wallH = rows * S.cabH;
    const area = (wallW * wallH) / 1e6;
    const pitchX = S.cabW / px.w, pitchY = S.cabH / px.h;
    const curved = joints.some((j) => j !== 0);
    const uniform = curved && joints.every((j) => j === joints[0]);
    const radius = uniform ? S.cabW / (2 * Math.sin(Math.abs(joints[0]) * DEG / 2)) : null;
    const g = gcd(W, H);
    return {
      px, cols, rows, joints, geo, W, H, wallW, wallH, area, pitchX, pitchY,
      curved, uniform, radius,
      total: W * H, cabinets: cols * rows,
      ratio: W / H, ratioTxt: g ? `${W / g}:${H / g}` : '-',
      ratioNear: nearestRatio(W / H),
      diagIn: Math.hypot(wallW, wallH) / 25.4,
      minView: pitchX, // ม. (กฎ 1mm ≈ 1m)
      bestView: pitchX * 3,
      density: Math.round((1000 / pitchX) * (1000 / pitchY)),
      weight: area * S.kgM2,
      powerMax: area * S.wM2,
      powerAvg: area * S.wM2 * 0.35,
      ports: Math.ceil((W * H) / PX_PER_PORT),
    };
  }

  /* ================= UI BUILD ================= */
  function buildStatic() {
    $('pitchChips').innerHTML = PITCHES.map((p) =>
      `<button type="button" data-id="${p.id}">${p.id === 'custom' ? t('custom') : p.id}</button>`).join('');
    $('cabSelect').innerHTML = CABINETS.map((c) => {
      const label = c.w ? `${c.w} × ${c.h} mm${c.tag ? (c.tag.startsWith('cab.') ? t(c.tag) : c.tag) : ''}` : t('custom');
      return `<option value="${c.id}">${label}</option>`;
    }).join('');
  }

  function syncInputs() {
    document.querySelectorAll('#pitchChips button').forEach((b) => b.classList.toggle('on', b.dataset.id === S.pitchId));
    $('customPitchField').hidden = S.pitchId !== 'custom';
    $('customPitch').value = S.pitch;
    $('cabSelect').value = S.cabId;
    $('cabW').value = S.cabW; $('cabH').value = S.cabH;
    const locked = S.cabId !== 'custom';
    $('cabW').readOnly = locked; $('cabH').readOnly = locked;
    $('cabW').style.opacity = locked ? 0.6 : 1; $('cabH').style.opacity = locked ? 0.6 : 1;
    $('pxOverride').checked = S.pxOverride;
    $('pxOverrideFields').hidden = !S.pxOverride;
    $('cabPxW').value = S.cabPxW; $('cabPxH').value = S.cabPxH;
    setSeg('modeSeg', S.mode);
    $('countFields').hidden = S.mode !== 'count';
    $('sizeFields').hidden = S.mode !== 'size';
    $('cols').value = S.cols; $('rows').value = S.rows;
    $('targetW').value = S.targetW; $('targetH').value = S.targetH;
    $('mountH').value = S.mountH;
    setSeg('curveSeg', S.curve);
    $('uniformFields').hidden = S.curve !== 'uniform';
    $('customFields').hidden = S.curve !== 'custom';
    $('angle').value = S.angle; $('angleRange').value = clamp(S.angle, -15, 15);
    $('kgM2').value = S.kgM2; $('wM2').value = S.wM2;
    setSeg('viewTabs', S.view);
  }
  function setSeg(id, v) {
    document.querySelectorAll(`#${id} button`).forEach((b) => b.classList.toggle('on', b.dataset.v === v));
  }

  let jointsBuiltFor = -1;
  function buildJoints(cols, force) {
    if (S.curve !== 'custom') { jointsBuiltFor = -1; return; }
    if (!force && jointsBuiltFor === cols) return;
    jointsBuiltFor = cols;
    const n = cols - 1;
    if (n < 1) { $('jointsList').innerHTML = `<p class="hint">${t('j.need2')}</p>`; return; }
    let html = '';
    for (let i = 0; i < n; i++) {
      html += `<label class="joint"><span>${t('j.label', i + 1, i + 2)}</span>` +
        `<input type="number" step="0.5" min="-180" max="180" data-j="${i}" value="${num(S.joints[i], 0)}"></label>`;
    }
    $('jointsList').innerHTML = html;
  }

  /* ================= RENDER RESULTS ================= */
  let R = null;
  function update(opts = {}) {
    R = compute();
    buildJoints(R.cols, opts.rebuildJoints);
    renderInfo();
    draw();
    saveState();
    $('btnSim').href = 'vp-sim.html#' + btoa(encodeURIComponent(JSON.stringify(S)));
  }

  function renderInfo() {
    const r = R;
    $('cabPxHint').textContent = S.pxOverride
      ? t('hint.pxOverride', fmtAuto(r.pitchX, 3), fmtAuto(r.pitchY, 3))
      : t('hint.px', r.px.w, r.px.h, fmtAuto(S.pitch, 3));
    $('sizeHint').textContent = S.mode === 'size'
      ? t('hint.size', r.cols, r.rows, m(r.wallW), m(r.wallH))
      : '';

    // คำเตือนเรื่ององศา
    const maxJ = r.joints.reduce((a, v) => Math.max(a, Math.abs(v)), 0);
    const warn = $('angleWarn');
    if (S.curve !== 'flat' && maxJ > 10 && maxJ < 89) {
      warn.hidden = false;
      warn.textContent = t('warn.angle', fmtAuto(maxJ, 1));
    } else if (Math.abs(r.geo.total) > 360) {
      warn.hidden = false;
      warn.textContent = t('warn.over360', fmtAuto(r.geo.total, 1));
    } else warn.hidden = true;

    // Hero
    $('hero').innerHTML = `
      <div class="hero-card">
        <div class="lbl">${t('hero.res')}</div>
        <div class="val">${fmt(r.W)} × ${fmt(r.H)} <small style="font-size:.5em">px</small></div>
        <div class="sub">${t('hero.pixels', fmt(r.total), fmtAuto(r.total / 1e6, 2))}</div>
      </div>
      <div class="hero-card">
        <div class="lbl">${t('hero.size', r.curved)}</div>
        <div class="val">${m(r.wallW)} × ${m(r.wallH)} <small style="font-size:.5em">m</small></div>
        <div class="sub">${t('hero.area', fmt(r.area, 2), fmt(r.diagIn, 0))}</div>
      </div>
      <div class="hero-card">
        <div class="lbl">${t('hero.cab')}</div>
        <div class="val">${r.cols} × ${r.rows} = ${fmt(r.cabinets)}</div>
        <div class="sub">${t('hero.cabSub', fmtAuto(S.cabW, 1), fmtAuto(S.cabH, 1), r.px.w, r.px.h)}</div>
      </div>`;

    // Stats
    const items = [];
    const st = (lbl, val, sub = '', cls = '', extra = '') =>
      items.push(`<div class="stat ${cls}"><div class="lbl">${lbl}</div><div class="val">${val}</div>${sub ? `<div class="sub">${sub}</div>` : ''}${extra}</div>`);

    st(t('st.aspect'), `${fmtAuto(r.ratio, 3)} : 1`,
      r.ratioNear.exact
        ? (r.ratioTxt === r.ratioNear.name ? r.ratioTxt : `${r.ratioTxt} ≈ ${r.ratioNear.name}`)
        : `${r.ratioTxt} · ${t('st.near', r.ratioNear.name)}`);
    st('Pixel Pitch', `${fmtAuto(r.pitchX, 3)} mm`, `${S.pitchId === 'custom' ? t('custom') : S.pitchId} · ${fmt(r.density)} px/m²`);
    st(t('st.view'), `${fmtAuto(r.minView, 1)} – ${fmtAuto(r.bestView, 1)} m`, t('st.viewSub'));

    if (r.curved) {
      st(t('st.total'), `${fmtAuto(r.geo.total, 1)}°`, r.geo.total > 0 ? t('concave') : r.geo.total < 0 ? t('convex') : t('mixed'), 'hl');
      st(t('st.foot'), `${m(r.geo.footW)} m`, t('st.footSub', m(r.geo.chord)), 'hl');
      st(t('st.depth'), `${m(r.geo.depth)} m`, t('st.depthSub'), 'hl');
      if (r.radius) st(t('st.radius'), `${m(r.radius)} m`, t('st.radiusSub', fmtAuto(r.joints[0], 1), r.cols - 1), 'hl');
    }

    const fhd = FORMATS[1], uhd = FORMATS[4];
    const pct = (f) => Math.round(Math.min(r.W / f.w, r.H / f.h) * 100);
    let fit = FORMATS.filter((f) => r.W >= f.w && r.H >= f.h).pop();
    st(t('st.vs', 'Full HD 1920×1080'), `${fmtAuto((r.total / (fhd.w * fhd.h)) * 100, 0)}%`,
      fit ? t('st.fit', fit.n) : t('st.noFit'), '',
      `<div class="bar"><i style="width:${clamp(pct(fhd), 2, 100)}%"></i></div>`);
    st(t('st.vs', '4K UHD 3840×2160'), `${fmtAuto((r.total / (uhd.w * uhd.h)) * 100, 0)}%`,
      t('st.uhdSub', fmtAuto(r.W / uhd.w, 2), fmtAuto(r.H / uhd.h, 2)), '',
      `<div class="bar"><i style="width:${clamp(pct(uhd), 2, 100)}%"></i></div>`);
    st(t('st.ports'), t('st.portsVal', r.ports), t('st.portsSub', fmt(PX_PER_PORT)));
    st(t('st.weight'), `${fmt(r.weight)} kg`, t('st.weightSub', S.kgM2, fmtAuto(r.weight / r.cabinets, 1)));
    st(t('st.power'), `${fmtAuto(r.powerMax / 1000, 1)} kW`, t('st.powerSub', fmtAuto(r.powerAvg / 1000, 1)));
    st(t('st.height'), `${m(r.wallH + S.mountH * 1000)} m`, t('st.heightSub', fmtAuto(S.mountH, 2)));
    $('stats').innerHTML = items.join('');
  }

  function summaryText() {
    const r = R;
    const lines = [
      'LED Wall — REAL Bangkok',
      `Pixel Pitch: ${S.pitchId === 'custom' ? '' : S.pitchId + ' '}(${fmtAuto(r.pitchX, 3)} mm)`,
      t('sum.cab', fmtAuto(S.cabW, 1), fmtAuto(S.cabH, 1), r.px.w, r.px.h),
      t('sum.count', r.cols, r.rows, r.cabinets),
      t('sum.size', m(r.wallW), m(r.wallH), fmt(r.area, 2)),
      t('sum.res', r.W, r.H, fmt(r.total)),
      t('sum.ratio', fmtAuto(r.ratio, 3), r.ratioTxt),
    ];
    if (r.curved) {
      lines.push(t('sum.angle', r.uniform ? t('sum.perJoint', fmtAuto(r.joints[0], 1)) : r.joints.map((j) => fmtAuto(j, 1)).join(', ') + '°'));
      lines.push(t('sum.curve', fmtAuto(r.geo.total, 1), m(r.geo.footW), m(r.geo.depth)) + (r.radius ? t('sum.radius', m(r.radius)) : ''));
    }
    lines.push(t('sum.view', fmtAuto(r.minView, 1), fmtAuto(r.bestView, 1)));
    lines.push(t('sum.est', fmt(r.weight), fmtAuto(r.powerMax / 1000, 1), r.ports));
    return lines.join('\n');
  }

  /* ================= DRAWING ================= */
  const canvas = $('view');
  const ctx = canvas.getContext('2d');
  let CW = 0, CH = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    CW = rect.width; CH = rect.height;
    canvas.width = Math.round(CW * dpr);
    canvas.height = Math.round(CH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function screenColor(u, v, shade = 1) {
    // ไล่สีจำลองภาพบนจอ: ฟ้า → ม่วง → ชมพู
    const hue = 205 + u * 115 - v * 20;
    const light = (52 - v * 14) * shade;
    return `hsl(${hue.toFixed(0)}, 72%, ${light.toFixed(1)}%)`;
  }

  function draw() {
    if (!R || !CW) return;
    ctx.clearRect(0, 0, CW, CH);
    if (S.view === '3d') draw3D();
    else if (S.view === 'front') drawFront();
    else drawTop();
    $('viewerHint').hidden = S.view !== '3d';
  }

  function hud(text) { $('hud').textContent = text; }

  /* ---------- Front view ---------- */
  function drawFront() {
    const r = R;
    const wallW = r.wallW, wallH = r.wallH, mount = S.mountH * 1000;
    const personH = 1750, personW = 520;
    const totalH = wallH + mount;
    const personGap = Math.max(900, wallW * 0.08, totalH * 0.25);
    const totalW = wallW + personGap + personW;
    const padL = 30, padR = 30, padT = 56, padB = 58;
    const sc = Math.min((CW - padL - padR - 70) / totalW, (CH - padT - padB) / Math.max(totalH, personH));
    const ox = (CW - totalW * sc - 70) / 2 + 20;
    const floorY = CH - padB;
    const wx = ox + personW * sc + personGap * sc;
    const wyTop = floorY - (mount + wallH) * sc;

    // floor
    ctx.strokeStyle = '#3a404a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(10, floorY + 0.5); ctx.lineTo(CW - 10, floorY + 0.5); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.025)';
    ctx.fillRect(10, floorY, CW - 20, 22);

    // person
    drawPerson2D(ox + (personW * sc) / 2, floorY, personH * sc);

    // legs/support when mounted
    if (mount > 0) {
      ctx.fillStyle = '#1d2128';
      ctx.fillRect(wx, floorY - mount * sc, wallW * sc, mount * sc);
      ctx.strokeStyle = '#2b3038';
      ctx.strokeRect(wx + 0.5, floorY - mount * sc + 0.5, wallW * sc - 1, mount * sc - 1);
    }

    // cabinets
    const cw = S.cabW * sc, ch = S.cabH * sc;
    for (let c = 0; c < r.cols; c++) {
      for (let row = 0; row < r.rows; row++) {
        const x = wx + c * cw, y = wyTop + row * ch;
        ctx.fillStyle = screenColor((c + 0.5) / r.cols, (row + 0.5) / r.rows);
        ctx.fillRect(x, y, cw, ch);
      }
    }
    // seams
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = cw > 8 ? 1 : 0.5;
    ctx.beginPath();
    for (let c = 1; c < r.cols; c++) { const x = Math.round(wx + c * cw) + 0.5; ctx.moveTo(x, wyTop); ctx.lineTo(x, wyTop + wallH * sc); }
    for (let row = 1; row < r.rows; row++) { const y = Math.round(wyTop + row * ch) + 0.5; ctx.moveTo(wx, y); ctx.lineTo(wx + wallW * sc, y); }
    ctx.stroke();
    // curved joints marker
    if (r.curved) {
      ctx.strokeStyle = 'rgba(255,181,71,0.9)'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath();
      r.joints.forEach((j, i) => { if (j) { const x = wx + (i + 1) * cw; ctx.moveTo(x, wyTop); ctx.lineTo(x, wyTop + wallH * sc); } });
      ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
    ctx.strokeRect(wx + 0.5, wyTop + 0.5, wallW * sc - 1, wallH * sc - 1);

    // cabinet labels
    if (cw > 54 && ch > 30) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = `500 ${Math.min(13, cw / 6)}px "IBM Plex Sans Thai", "Noto Sans JP", sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let c = 0; c < r.cols; c++) for (let row = 0; row < r.rows; row++)
        ctx.fillText(`${r.px.w}×${r.px.h}`, wx + (c + 0.5) * cw, wyTop + (row + 0.5) * ch);
    }

    // dimensions
    dimH(wx, wx + wallW * sc, wyTop - 18, `${m(wallW)} m  ·  ${fmt(r.W)} px`);
    dimV(wx + wallW * sc + 18, wyTop, wyTop + wallH * sc, `${m(wallH)} m`, `${fmt(r.H)} px`);
    if (mount > 0 && mount * sc > 12) {
      ctx.fillStyle = '#8b93a0';
      ctx.font = `${Math.min(12, mount * sc - 2)}px "IBM Plex Sans Thai", "Noto Sans JP", sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(t('cv.mount', m(mount)), wx + (wallW * sc) / 2, floorY - (mount * sc) / 2);
    }
    hud(t('cv.frontHud'));
  }

  function drawPerson2D(cx, floorY, h) {
    const head = h * 0.12;
    ctx.fillStyle = '#9aa1ab';
    ctx.beginPath(); ctx.arc(cx, floorY - h + head / 2, head / 2, 0, Math.PI * 2); ctx.fill();
    const bw = h * 0.26;
    roundRect(cx - bw / 2, floorY - h + head * 1.08, bw, h * 0.42, bw * 0.3); ctx.fill();
    const lw = bw * 0.38;
    roundRect(cx - bw / 2 + bw * 0.06, floorY - h * 0.47, lw, h * 0.47, lw * 0.4); ctx.fill();
    roundRect(cx + bw / 2 - bw * 0.06 - lw, floorY - h * 0.47, lw, h * 0.47, lw * 0.4); ctx.fill();
    ctx.fillStyle = '#6c737d';
    ctx.font = '11px "IBM Plex Sans Thai", "Noto Sans JP", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('1.75 m', cx, floorY + 4);
  }
  function roundRect(x, y, w, h, rr) {
    rr = Math.min(rr, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y); ctx.arcTo(x + w, y, x + w, y + h, rr); ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr); ctx.arcTo(x, y, x + w, y, rr); ctx.closePath();
  }

  function dimH(x1, x2, y, label) {
    ctx.strokeStyle = '#c9ced5'; ctx.fillStyle = '#c9ced5'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y); ctx.lineTo(x2, y);
    ctx.moveTo(x1, y - 5); ctx.lineTo(x1, y + 5); ctx.moveTo(x2, y - 5); ctx.lineTo(x2, y + 5);
    ctx.stroke();
    arrow(x1, y, 1, 0); arrow(x2, y, -1, 0);
    ctx.font = '600 13px "IBM Plex Sans Thai", "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    const tw = ctx.measureText(label).width + 14;
    const mx = (x1 + x2) / 2;
    ctx.fillStyle = '#0b0d10'; ctx.fillRect(mx - tw / 2, y - 18, tw, 16);
    ctx.fillStyle = '#eef0f3'; ctx.fillText(label, mx, y - 3);
  }
  function dimV(x, y1, y2, l1, l2, left) {
    ctx.strokeStyle = '#c9ced5'; ctx.fillStyle = '#c9ced5'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y1); ctx.lineTo(x, y2);
    ctx.moveTo(x - 5, y1); ctx.lineTo(x + 5, y1); ctx.moveTo(x - 5, y2); ctx.lineTo(x + 5, y2);
    ctx.stroke();
    if (y2 - y1 > 14) { arrow(x, y1, 0, 1); arrow(x, y2, 0, -1); }
    ctx.font = '600 13px "IBM Plex Sans Thai", "Noto Sans JP", sans-serif';
    ctx.textAlign = left ? 'right' : 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#eef0f3';
    const my = (y1 + y2) / 2, tx = left ? x - 8 : x + 8;
    ctx.fillText(l1, tx, l2 ? my - 9 : my);
    if (l2) { ctx.fillStyle = '#8b93a0'; ctx.font = '12px "IBM Plex Sans Thai", "Noto Sans JP", sans-serif'; ctx.fillText(l2, tx, my + 9); }
  }
  function arrow(x, y, dx, dy) {
    const s = 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx * s - dy * s * 0.5, y + dy * s - dx * s * 0.5);
    ctx.lineTo(x + dx * s + dy * s * 0.5, y + dy * s + dx * s * 0.5);
    ctx.closePath(); ctx.fill();
  }

  /* ---------- Top view ---------- */
  function drawTop() {
    const r = R, g = r.geo;
    const viewerZ = g.zMax + Math.max(2000, r.bestView * 1000 * 0.6);
    const spanX = Math.max(g.footW, 1000), spanZ = viewerZ - g.zMin + 400;
    const pad = 60;
    const sc = Math.min((CW - pad * 2) / spanX, (CH - pad * 2) / spanZ);
    const ox = CW / 2 - ((g.xMin + g.xMax) / 2) * sc;
    const oy = (CH - spanZ * sc) / 2 - g.zMin * sc + 10;
    const P = (p) => ({ x: ox + p.x * sc, y: oy + p.z * sc });

    // grid 1 m
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
    const step = 1000 * sc;
    if (step > 6) {
      ctx.beginPath();
      for (let x = ox % step; x < CW; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, CH); }
      for (let y = oy % step; y < CH; y += step) { ctx.moveTo(0, y); ctx.lineTo(CW, y); }
      ctx.stroke();
    }

    // chord
    const a = P(g.pts[0]), b = P(g.pts[g.pts.length - 1]);
    if (r.curved) {
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]);
    }

    // cabinets (thickness ~ 80mm)
    const thick = Math.max(4, 90 * sc);
    for (let i = 0; i < r.cols; i++) {
      const p1 = P(g.pts[i]), p2 = P(g.pts[i + 1]);
      ctx.strokeStyle = screenColor((i + 0.5) / r.cols, 0.4);
      ctx.lineWidth = thick; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    }
    // joints
    const showLabels = r.curved && r.cols <= 40;
    g.pts.forEach((p, i) => {
      const q = P(p);
      ctx.fillStyle = i === 0 || i === g.pts.length - 1 ? '#fff' : '#0b0d10';
      ctx.beginPath(); ctx.arc(q.x, q.y, Math.min(4, thick / 2 + 1), 0, Math.PI * 2); ctx.fill();
      if (showLabels && i > 0 && i < g.pts.length - 1 && r.joints[i - 1]) {
        const prev = P(g.pts[i - 1]), next = P(g.pts[i + 1]);
        let nx = -(next.y - prev.y), ny = next.x - prev.x;
        const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
        const off = -(thick / 2 + 12);
        ctx.fillStyle = '#ffb547';
        ctx.font = '600 11px "IBM Plex Sans Thai", "Noto Sans JP", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (!r.uniform || i % Math.max(1, Math.ceil(r.cols / 12)) === 0)
          ctx.fillText(`${fmtAuto(r.joints[i - 1], 1)}°`, q.x + nx * off, q.y + ny * off);
      }
    });

    // dimensions
    const topY = oy + g.zMin * sc - 28;
    dimH(ox + g.xMin * sc, ox + g.xMax * sc, Math.max(24, topY), t('cv.foot', m(g.footW)));
    if (r.curved && g.depth > 1) {
      const dx = ox + g.xMax * sc + 22;
      dimV(Math.min(CW - 70, dx), oy + g.zMin * sc, oy + g.zMax * sc, t('cv.depth', m(g.depth)), '');
    }

    // viewer
    const v = P({ x: 0, z: viewerZ });
    ctx.fillStyle = '#9aa1ab';
    ctx.beginPath(); ctx.arc(v.x, v.y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(v.x, v.y - 14); ctx.lineTo(v.x - 6, v.y - 6); ctx.lineTo(v.x + 6, v.y - 6); ctx.closePath(); ctx.fill();
    ctx.font = '12px "IBM Plex Sans Thai", "Noto Sans JP", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(t('cv.viewer'), v.x, v.y + 10);

    hud(r.curved
      ? t('cv.topCurved', fmtAuto(g.total, 1), r.radius ? m(r.radius) : null, m(g.chord))
      : t('cv.topFlat'));
  }

  /* ---------- 3D view ---------- */
  function draw3D() {
    const r = R, g = r.geo;
    const wallH = r.wallH, mount = S.mountH * 1000;
    const pz = g.zMax + Math.max(1500, Math.min(4000, g.footW * 0.25)); // ตำแหน่งคนเทียบสเกล
    const cxw = (g.xMin + g.xMax) / 2, czw = (g.zMin + pz) / 2;
    const cyw = (mount + wallH) / 2;
    // bounding sphere ของฉากทั้งหมด → กล้องพอดีจอทุกมุมหมุน
    let rad = 0;
    for (const p of g.pts) for (const y of [0, mount + wallH])
      rad = Math.max(rad, Math.hypot(p.x - cxw, y - cyw, p.z - czw));
    rad = Math.max(rad, Math.hypot(pz - czw, cyw), 1500);
    const size = rad * 2;
    const D = rad * 3.2;
    const f = (Math.min(CW * 1.15, CH) * 0.5 * D) / rad * 0.84 * cam.zoom;
    const cyaw = Math.cos(cam.yaw), syaw = Math.sin(cam.yaw);
    const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);

    const T = (x, y, z) => {
      x -= cxw; y -= cyw; z -= czw;
      const x1 = x * cyaw + z * syaw;
      const z1 = -x * syaw + z * cyaw;
      const y2 = y * cp - z1 * sp;
      const z2 = y * sp + z1 * cp;
      const depth = D - z2;
      return { x: CW / 2 + (f * x1) / depth, y: CH / 2 - (f * y2) / depth, d: depth, z: z2 };
    };
    const camPos = (() => {
      // ตำแหน่งกล้องในพิกัดโลก (inverse rotation ของ (0,0,D))
      const z1 = D * cp, y = D * sp; // inverse pitch
      return { x: -z1 * syaw + cxw, y: y + cyw, z: z1 * cyaw + czw };
    })();

    // floor grid
    const ext = Math.ceil(size / 1000) + 2;
    ctx.lineWidth = 1;
    const gx0 = Math.floor((cxw - ext * 1000) / 1000) * 1000, gx1 = gx0 + ext * 2000;
    const gz0 = Math.floor((czw - ext * 1000) / 1000) * 1000, gz1 = gz0 + ext * 2000;
    for (let x = gx0; x <= gx1; x += 1000) line3(T(x, 0, gz0), T(x, 0, gz1), x === 0);
    for (let z = gz0; z <= gz1; z += 1000) line3(T(gx0, 0, z), T(gx1, 0, z), false);
    function line3(p, q, strong) {
      if (p.d < D * 0.15 || q.d < D * 0.15) return;
      ctx.strokeStyle = strong ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.045)';
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
    }

    // collect faces
    const faces = [];
    for (let i = 0; i < r.cols; i++) {
      const a = g.pts[i], b = g.pts[i + 1];
      const nx = -(b.z - a.z), nz = b.x - a.x; // front normal (toward viewer side)
      const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
      const front = (camPos.x - mx) * nx + (camPos.z - mz) * nz > 0;
      const nl = Math.hypot(nx, nz) || 1;
      // shading: เทียบกับทิศแสงด้านหน้า-ซ้าย
      const lit = 0.72 + 0.28 * ((nx / nl) * -0.35 + (nz / nl) * 0.94);
      for (let row = 0; row < r.rows; row++) {
        const y0 = mount + wallH - (row + 1) * S.cabH, y1 = y0 + S.cabH;
        const pts = [T(a.x, y0, a.z), T(b.x, y0, b.z), T(b.x, y1, b.z), T(a.x, y1, a.z)];
        const d = (pts[0].d + pts[1].d + pts[2].d + pts[3].d) / 4;
        faces.push({ pts, d, fill: front ? screenColor((i + 0.5) / r.cols, (row + 0.5) / r.rows, lit) : '#262a31', front });
      }
      // support base when mounted
      if (mount > 0) {
        const pts = [T(a.x, 0, a.z), T(b.x, 0, b.z), T(b.x, mount, b.z), T(a.x, mount, a.z)];
        faces.push({ pts, d: (pts[0].d + pts[1].d + pts[2].d + pts[3].d) / 4, fill: '#1a1d23', front: false, base: true });
      }
    }
    // person
    const personTop = T(cxw, 1750, pz), personBot = T(cxw, 0, pz);
    faces.push({ person: true, d: personBot.d, top: personTop, bot: personBot });

    faces.sort((p, q) => q.d - p.d);
    const seam = r.cols * r.rows < 2500;
    for (const fc of faces) {
      if (fc.person) {
        if (fc.bot.d > D * 0.15) drawPerson2D(fc.bot.x, fc.bot.y, fc.bot.y - fc.top.y);
        continue;
      }
      if (fc.pts.some((p) => p.d < D * 0.1)) continue;
      ctx.beginPath();
      ctx.moveTo(fc.pts[0].x, fc.pts[0].y);
      for (let k = 1; k < 4; k++) ctx.lineTo(fc.pts[k].x, fc.pts[k].y);
      ctx.closePath();
      ctx.fillStyle = fc.fill; ctx.fill();
      if (seam || !fc.front) {
        ctx.strokeStyle = fc.front ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 0.8; ctx.stroke();
      } else {
        ctx.strokeStyle = fc.fill; ctx.lineWidth = 0.6; ctx.stroke();
      }
    }
    hud(t('cv.3d', r.cols, r.rows, fmt(r.W), fmt(r.H), r.curved ? fmtAuto(g.total, 1) : null));
  }

  /* ================= EVENTS ================= */
  function bind() {
    $('pitchChips').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      S.pitchId = b.dataset.id;
      const p = PITCHES.find((x) => x.id === S.pitchId);
      if (p && p.v) S.pitch = p.v;
      if (S.pxOverride) { S.pxOverride = false; }
      syncInputs(); update();
    });
    $('customPitch').addEventListener('input', (e) => {
      const v = num(e.target.value, 0); if (v < 0.3) return;
      S.pitch = v; update();
    });
    $('cabSelect').addEventListener('change', (e) => {
      S.cabId = e.target.value;
      const c = CABINETS.find((x) => x.id === S.cabId);
      if (c && c.w) { S.cabW = c.w; S.cabH = c.h; }
      syncInputs(); update();
    });
    ['cabW', 'cabH'].forEach((id) => $(id).addEventListener('input', (e) => {
      const v = num(e.target.value, 0); if (v < 50) return;
      S[id] = v; update();
    }));
    $('pxOverride').addEventListener('change', (e) => {
      S.pxOverride = e.target.checked;
      if (S.pxOverride) { S.cabPxW = Math.round(S.cabW / S.pitch); S.cabPxH = Math.round(S.cabH / S.pitch); }
      syncInputs(); update();
    });
    ['cabPxW', 'cabPxH'].forEach((id) => $(id).addEventListener('input', (e) => {
      const v = Math.round(num(e.target.value, 0)); if (v < 1) return;
      S[id] = v; update();
    }));
    $('modeSeg').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.v === 'count' && S.mode === 'size') { const gs = gridSize(); S.cols = gs.cols; S.rows = gs.rows; }
      if (b.dataset.v === 'size' && S.mode === 'count') { S.targetW = +(S.cols * S.cabW / 1000).toFixed(2); S.targetH = +(S.rows * S.cabH / 1000).toFixed(2); }
      S.mode = b.dataset.v; syncInputs(); update();
    });
    ['cols', 'rows'].forEach((id) => $(id).addEventListener('input', (e) => {
      const v = Math.round(num(e.target.value, 0)); if (v < 1) return;
      S[id] = clamp(v, 1, MAX_N); update();
    }));
    document.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
      const [k, d] = b.dataset.step.split(':');
      S[k] = clamp(Math.round(S[k]) + Number(d), 1, MAX_N);
      $(k).value = S[k]; update();
    }));
    ['targetW', 'targetH', 'mountH', 'kgM2', 'wM2'].forEach((id) => $(id).addEventListener('input', (e) => {
      const v = num(e.target.value, NaN); if (!Number.isFinite(v) || v < 0) return;
      S[id] = v; update();
    }));
    $('curveSeg').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const prev = S.curve;
      S.curve = b.dataset.v;
      if (S.curve === 'custom' && prev === 'uniform') S.joints = Array(MAX_N).fill(S.angle);
      if (S.curve !== 'flat' && S.view === 'front') S.view = 'top';
      syncInputs(); update({ rebuildJoints: true });
    });
    $('angleRange').addEventListener('input', (e) => { S.angle = num(e.target.value, 0); $('angle').value = S.angle; update(); });
    $('angle').addEventListener('input', (e) => {
      const v = num(e.target.value, NaN); if (!Number.isFinite(v)) return;
      S.angle = clamp(v, -90, 90); $('angleRange').value = clamp(S.angle, -15, 15); update();
    });
    $('anglePresets').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      S.angle = Number(b.dataset.a); syncInputs(); update();
    });
    $('jointsList').addEventListener('input', (e) => {
      const i = e.target.dataset.j; if (i === undefined) return;
      const v = num(e.target.value, NaN); if (!Number.isFinite(v)) return;
      S.joints[Number(i)] = clamp(v, -180, 180); update();
    });
    $('jointsCorner').addEventListener('click', () => {
      const n = R.cols - 1; S.joints = Array(n).fill(0);
      if (n >= 1) S.joints[Math.floor(n / 2)] = 90;
      update({ rebuildJoints: true });
    });
    $('jointsTwoCorner').addEventListener('click', () => {
      const n = R.cols - 1; S.joints = Array(n).fill(0);
      if (n >= 2) { const q = Math.max(0, Math.round(n / 4)); S.joints[q] = 90; S.joints[n - 1 - q] = 90; }
      update({ rebuildJoints: true });
    });
    $('jointsClear').addEventListener('click', () => { S.joints = []; update({ rebuildJoints: true }); });

    $('viewTabs').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      S.view = b.dataset.v; setSeg('viewTabs', S.view); draw(); saveState();
    });

    $('langSeg').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b || b.dataset.v === LANG) return;
      LANG = b.dataset.v;
      try { localStorage.setItem('ledwall-lang', LANG); } catch (err) { /* ignore */ }
      applyLang(); buildStatic(); syncInputs(); update({ rebuildJoints: true });
    });

    $('btnCopy').addEventListener('click', () => copy(summaryText(), t('toast.summary')));
    $('btnLink').addEventListener('click', () => copy(shareUrl(), t('toast.link')));
    $('btnReset').addEventListener('click', () => {
      Object.assign(S, DEFAULT, { joints: [] });
      cam.yaw = -0.55; cam.pitch = 0.22; cam.zoom = 1;
      history.replaceState(null, '', location.pathname + location.search);
      syncInputs(); update({ rebuildJoints: true });
    });

    // 3D interaction
    // ลากนิ้วเดียว = หมุน, สองนิ้ว (มือถือ) = บีบซูม
    let drag = null, pinch = null;
    const pts = new Map();
    const pinchDist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };
    canvas.addEventListener('pointerdown', (e) => {
      if (S.view !== '3d') return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging');
      if (pts.size === 2) { drag = null; pinch = { d: pinchDist(), zoom: cam.zoom }; }
      else if (pts.size === 1) drag = { x: e.clientX, y: e.clientY, yaw: cam.yaw, pitch: cam.pitch };
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pts.size === 2) {
        cam.zoom = clamp(pinch.zoom * pinchDist() / pinch.d, 0.35, 4);
        draw();
      } else if (drag) {
        cam.yaw = drag.yaw + (e.clientX - drag.x) * 0.008;
        cam.pitch = clamp(drag.pitch + (e.clientY - drag.y) * 0.006, -0.25, 1.45);
        draw();
      }
    });
    const end = (e) => {
      pts.delete(e.pointerId);
      pinch = null;
      drag = null;
      // เหลือนิ้วเดียวหลังบีบซูม → หมุนต่อจากตำแหน่งปัจจุบันโดยไม่กระตุก
      if (pts.size === 1) { const p = [...pts.values()][0]; drag = { x: p.x, y: p.y, yaw: cam.yaw, pitch: cam.pitch }; }
      if (!pts.size) canvas.classList.remove('dragging');
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('wheel', (e) => {
      if (S.view !== '3d') return;
      e.preventDefault();
      cam.zoom = clamp(cam.zoom * Math.exp(-e.deltaY * 0.0012), 0.35, 4);
      draw();
    }, { passive: false });
    canvas.addEventListener('dblclick', () => { cam.yaw = -0.55; cam.pitch = 0.22; cam.zoom = 1; draw(); });

    new ResizeObserver(resize).observe($('canvasWrap'));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  }

  function copy(text, msg) {
    const done = () => toast(msg);
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, () => fallback());
    else fallback();
    function fallback() {
      const t = document.createElement('textarea');
      t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast(t('toast.fail')); }
      t.remove();
    }
  }
  let toastT;
  function toast(msg) {
    const t = $('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1800);
  }

  /* ================= INIT ================= */
  applyLang();
  buildStatic();
  syncInputs();
  bind();
  update({ rebuildJoints: true });
  resize();
})();
