/* Virtual Production Simulator — จำลองการถ่ายทำบนจอ LED ตามขนาดจาก LED Wall Configurator */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
const fmt = (n, d = 0) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtAuto = (n, max = 2) => Number(n).toLocaleString('en-US', { maximumFractionDigits: max });
const DEG = Math.PI / 180;

/* ================= LANGUAGE ================= */
const T = {
  th: {
    'meta.desc': 'จำลองการถ่ายทำ Virtual Production — อัปโหลดภาพขึ้นจอ LED ตามขนาดจริงจาก LED Wall Configurator แล้วดูผ่านมุมกล้อง',
    sub: 'จำลองการถ่ายทำบนจอ LED — ใส่ภาพ วางกล้อง แล้วดูผลผ่านเลนส์',
    'btn.config': 'LED Wall Configurator ↗', 'btn.shot': 'บันทึกภาพจากกล้อง',
    'btn.editWall': 'แก้ขนาดจอ ↗', 'btn.reloadWall': 'โหลดค่าล่าสุด',
    'sec.wall': 'จอ LED', 'sec.content': 'ภาพบนจอ', 'sec.camera': 'กล้อง', 'sec.set': 'นักแสดง & ฉาก',
    drop: 'อัปโหลดภาพ / ลากไฟล์มาวาง / วาง (Ctrl+V)', dropHere: 'วางภาพเพื่อแสดงบนจอ',
    's.sunset': 'ทะเลทรายยามเย็น', 's.forest': 'เดินในป่า', 's.city': 'เมืองกลางคืน', 's.space': 'อวกาศ', 's.bars': 'Test Pattern', 's.nosignal': 'No Signal',
    'f.fit': 'การวางภาพ', 'fit.cover': 'เต็มจอ (ครอป)', 'fit.contain': 'พอดีภาพ', 'fit.stretch': 'ยืดเต็มจอ',
    'f.bright': 'ความสว่างจอ', 'f.seams': 'แสดงรอยต่อตู้',
    'f.pixelTrue': 'แสดงพิกเซล LED แบบคมชัด (เห็นเม็ดพิกเซลเมื่อซูมใกล้)',
    'f.lens': 'เลนส์ (mm)', 'f.sensor': 'เซนเซอร์', 'f.camDist': 'ระยะกล้อง–จอ (m)', 'f.camH': 'ความสูงกล้อง (m)',
    'f.camX': 'เลื่อนซ้าย–ขวา (m)', 'f.pan': 'Pan (°)', 'f.tilt': 'Tilt (°)',
    'f.talent': 'แสดงนักแสดง (สูง 1.75 m)', 'f.talentDist': 'ระยะนักแสดง–จอ (m)',
    'f.reflect': 'พื้นสะท้อนเงา', 'f.frustum': 'แสดงกรอบมุมมองกล้อง (Frustum)',
    'view.studio': 'สตูดิโอ 3D', 'view.camera': 'มุมกล้อง',
    'view.hint': 'ลากเพื่อหมุน · คลิกขวาลากเพื่อเลื่อน · ลูกกลิ้งซูม',
    foot: 'ภาพจำลองเพื่อวางแผนเบื้องต้น — แสง สี และมุมมองจริงขึ้นกับกล้อง เลนส์ และระบบ tracking หน้างาน',
    'w.size': 'ขนาดจอ', 'w.res': 'ความละเอียด', 'w.cab': 'จำนวนตู้', 'w.shape': 'รูปทรง',
    'w.flat': 'จอแบน', 'w.curve': (a) => `โค้งรวม ${a}°`,
    'src.link': 'ค่าจากลิงก์ที่แชร์มา', 'src.saved': 'ค่าล่าสุดจาก LED Wall Configurator', 'src.default': 'ค่าเริ่มต้น — ยังไม่เคยตั้งค่าใน Configurator',
    'st.wall': 'จอ LED', 'st.img': 'ภาพต้นฉบับ',
    'st.imgUp': (x) => `เล็กกว่าจอ — ถูกขยาย ×${x} อาจไม่คม`, 'st.imgOk': 'ความละเอียดพอสำหรับจอนี้',
    'st.sample': 'ภาพตัวอย่าง',
    'st.fov': 'มุมมองกล้อง (FOV)', 'st.frame': 'สิ่งที่อยู่ในเฟรม',
    'st.frameSub': (a, b, c) => `จอ ${a}% · พื้น ${b}% · นอกฉาก ${c}%`,
    'st.frameWarn': 'เห็นพื้นที่นอกจอ — ขยับกล้อง/ซูมเข้า หรือขยายจอ',
    'st.frameOk': 'ฉากหลังอยู่บนจอทั้งหมด',
    'st.ledpx': 'พิกเซล LED ในเฟรม', 'st.ledpxSub': (w) => `เฟรมกว้าง ${w} m ที่ระยะจอ`,
    'st.ledpxLow': 'ต่ำกว่า 4K — อย่าโฟกัสที่จอ ใช้ระยะชัดตื้น',
    'st.ledpxOk': 'ละเอียดกว่า 4K ในเฟรม',
    'st.dist': 'ระยะกล้อง–จอ', 'st.distSub': (a, b) => `แนะนำ ≥ ${a} m · ดีที่สุด ≥ ${b} m`,
    'st.distWarn': 'ใกล้เกินไป เสี่ยงมัวเร่ (moiré)',
    'st.talent': 'ระยะนักแสดง–จอ',
    'st.talentWarn': 'นักแสดงอยู่หลังกล้อง',
    'st.talentNear': 'ใกล้จอ — แสงจอจะสาดตัวและฉากหลังชัดเกินไป',
    'st.talentOk': 'ระยะดี แยกโฟกัสจากจอได้',
    'hud.studio': (d, l) => `STUDIO · CAM ${d} m · ${l} mm`,
    'toast.shot': 'บันทึกภาพแล้ว', 'toast.badImg': 'เปิดไฟล์นี้ไม่ได้ (เช่น HEIC) — ลองแปลงเป็น JPG/PNG',
    'toast.wall': 'โหลดขนาดจอล่าสุดแล้ว', 'toast.wallLive': 'อัปเดตขนาดจอจาก Configurator',
    'err.webgl': 'เบราว์เซอร์นี้ไม่รองรับ WebGL หรือโหลดไลบรารี 3D ไม่สำเร็จ',
  },
  en: {
    'meta.desc': 'Virtual production simulator — put your image on an LED wall sized in the LED Wall Configurator and look through the camera.',
    sub: 'Simulate an LED volume shoot — load an image, place the camera, see the shot',
    'btn.config': 'LED Wall Configurator ↗', 'btn.shot': 'Save camera frame',
    'btn.editWall': 'Edit wall size ↗', 'btn.reloadWall': 'Load latest',
    'sec.wall': 'LED wall', 'sec.content': 'Wall content', 'sec.camera': 'Camera', 'sec.set': 'Talent & set',
    drop: 'Upload image / drop a file / paste (Ctrl+V)', dropHere: 'Drop image to show on the wall',
    's.sunset': 'Desert sunset', 's.forest': 'Forest walk', 's.city': 'Night city', 's.space': 'Space', 's.bars': 'Test pattern', 's.nosignal': 'No signal',
    'f.fit': 'Image fit', 'fit.cover': 'Fill (crop)', 'fit.contain': 'Fit', 'fit.stretch': 'Stretch',
    'f.bright': 'Wall brightness', 'f.seams': 'Show cabinet seams',
    'f.pixelTrue': 'Sharp LED pixels (see individual pixels up close)',
    'f.lens': 'Lens (mm)', 'f.sensor': 'Sensor', 'f.camDist': 'Camera–wall (m)', 'f.camH': 'Camera height (m)',
    'f.camX': 'Truck left/right (m)', 'f.pan': 'Pan (°)', 'f.tilt': 'Tilt (°)',
    'f.talent': 'Show talent (1.75 m)', 'f.talentDist': 'Talent–wall (m)',
    'f.reflect': 'Reflective floor', 'f.frustum': 'Show camera frustum',
    'view.studio': 'Studio 3D', 'view.camera': 'Camera view',
    'view.hint': 'Drag to orbit · right-drag to pan · wheel to zoom',
    foot: 'Planning preview only — real light, colour and framing depend on the camera, lens and on-set tracking.',
    'w.size': 'Size', 'w.res': 'Resolution', 'w.cab': 'Cabinets', 'w.shape': 'Shape',
    'w.flat': 'Flat', 'w.curve': (a) => `Curved ${a}° total`,
    'src.link': 'From a shared link', 'src.saved': 'Latest from LED Wall Configurator', 'src.default': 'Defaults — nothing set in the Configurator yet',
    'st.wall': 'LED wall', 'st.img': 'Source image',
    'st.imgUp': (x) => `Smaller than the wall — upscaled ×${x}, may look soft`, 'st.imgOk': 'Enough resolution for this wall',
    'st.sample': 'Sample image',
    'st.fov': 'Camera field of view', 'st.frame': 'In frame',
    'st.frameSub': (a, b, c) => `Wall ${a}% · floor ${b}% · off-set ${c}%`,
    'st.frameWarn': 'Frame sees past the wall — move/zoom in or enlarge the wall',
    'st.frameOk': 'Background is fully on the wall',
    'st.ledpx': 'LED pixels across frame', 'st.ledpxSub': (w) => `Frame is ${w} m wide at the wall`,
    'st.ledpxLow': 'Below 4K — keep the wall out of focus',
    'st.ledpxOk': 'Finer than 4K in frame',
    'st.dist': 'Camera–wall distance', 'st.distSub': (a, b) => `Min ≥ ${a} m · best ≥ ${b} m`,
    'st.distWarn': 'Too close — moiré risk',
    'st.talent': 'Talent–wall distance',
    'st.talentWarn': 'Talent is behind the camera',
    'st.talentNear': 'Close to the wall — more spill, background too sharp',
    'st.talentOk': 'Good separation from the wall',
    'hud.studio': (d, l) => `STUDIO · CAM ${d} m · ${l} mm`,
    'toast.shot': 'Frame saved', 'toast.badImg': 'Cannot open this file (e.g. HEIC) — try JPG/PNG',
    'toast.wall': 'Loaded latest wall size', 'toast.wallLive': 'Wall updated from the Configurator',
    'err.webgl': 'This browser has no WebGL, or the 3D library failed to load',
  },
  ja: {
    'meta.desc': 'バーチャルプロダクション・シミュレーター — LED Wall Configurator のサイズでLEDに画像を表示し、カメラ越しに確認。',
    sub: 'LEDボリューム撮影をシミュレーション — 画像を入れ、カメラを置き、画を確認',
    'btn.config': 'LED Wall Configurator ↗', 'btn.shot': 'カメラ画像を保存',
    'btn.editWall': 'サイズを編集 ↗', 'btn.reloadWall': '最新を読み込む',
    'sec.wall': 'LEDウォール', 'sec.content': '表示する画像', 'sec.camera': 'カメラ', 'sec.set': '演者・セット',
    drop: '画像をアップロード / ドロップ / 貼り付け (Ctrl+V)', dropHere: 'ドロップしてLEDに表示',
    's.sunset': '砂漠の夕景', 's.forest': '森を歩く', 's.city': '夜の街', 's.space': '宇宙', 's.bars': 'テストパターン', 's.nosignal': 'ノーシグナル',
    'f.fit': '画像の配置', 'fit.cover': 'フィル (トリミング)', 'fit.contain': '全体表示', 'fit.stretch': '引き伸ばし',
    'f.bright': 'LEDの明るさ', 'f.seams': 'キャビネットの継ぎ目を表示',
    'f.pixelTrue': 'LEDピクセルをシャープに (近づくと画素が見える)',
    'f.lens': 'レンズ (mm)', 'f.sensor': 'センサー', 'f.camDist': 'カメラ〜LED (m)', 'f.camH': 'カメラ高さ (m)',
    'f.camX': '左右移動 (m)', 'f.pan': 'パン (°)', 'f.tilt': 'チルト (°)',
    'f.talent': '演者を表示 (1.75 m)', 'f.talentDist': '演者〜LED (m)',
    'f.reflect': '床の映り込み', 'f.frustum': 'カメラの視錐台を表示',
    'view.studio': 'スタジオ 3D', 'view.camera': 'カメラビュー',
    'view.hint': 'ドラッグで回転 · 右ドラッグで移動 · ホイールでズーム',
    foot: '計画用のシミュレーションです。実際の光・色・画角はカメラ、レンズ、トラッキングにより異なります。',
    'w.size': 'サイズ', 'w.res': '解像度', 'w.cab': 'キャビネット', 'w.shape': '形状',
    'w.flat': 'フラット', 'w.curve': (a) => `カーブ 合計 ${a}°`,
    'src.link': '共有リンクの設定', 'src.saved': 'LED Wall Configurator の最新設定', 'src.default': '初期値 — Configurator で未設定',
    'st.wall': 'LEDウォール', 'st.img': '元画像',
    'st.imgUp': (x) => `LEDより小さい — ×${x} 拡大、ぼやける可能性`, 'st.imgOk': 'このLEDに十分な解像度',
    'st.sample': 'サンプル画像',
    'st.fov': 'カメラ画角 (FOV)', 'st.frame': 'フレーム内訳',
    'st.frameSub': (a, b, c) => `LED ${a}% · 床 ${b}% · セット外 ${c}%`,
    'st.frameWarn': 'LEDの外が映っています — カメラを動かすかズーム',
    'st.frameOk': '背景はすべてLED上',
    'st.ledpx': 'フレーム内のLED画素', 'st.ledpxSub': (w) => `LED位置でのフレーム幅 ${w} m`,
    'st.ledpxLow': '4K未満 — LEDにピントを合わせない',
    'st.ledpxOk': 'フレーム内で4Kより高精細',
    'st.dist': 'カメラ〜LED距離', 'st.distSub': (a, b) => `最小 ≥ ${a} m · 推奨 ≥ ${b} m`,
    'st.distWarn': '近すぎ — モアレの恐れ',
    'st.talent': '演者〜LED距離',
    'st.talentWarn': '演者がカメラの後ろにいます',
    'st.talentNear': 'LEDに近い — 光が回り、背景がシャープすぎる',
    'st.talentOk': 'LEDと十分に離れています',
    'hud.studio': (d, l) => `STUDIO · CAM ${d} m · ${l} mm`,
    'toast.shot': '保存しました', 'toast.badImg': 'このファイルは開けません (HEIC など) — JPG/PNG をお試しください',
    'toast.wall': '最新のLEDサイズを読み込みました', 'toast.wallLive': 'Configurator からサイズを更新しました',
    'err.webgl': 'WebGL 非対応、または3Dライブラリの読み込みに失敗しました',
  },
};
const LANGS = ['th', 'en', 'ja'];
let LANG = (() => {
  const q = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(q)) return q;
  try { const v = localStorage.getItem('ledwall-lang'); if (LANGS.includes(v)) return v; } catch (e) { /* ignore */ }
  return 'th';
})();
function t(key, ...args) {
  const v = T[LANG][key] ?? T.th[key];
  if (v === undefined) return key;
  return typeof v === 'function' ? v(...args) : v;
}

/* ================= LED WALL (ค่าเดียวกับ js/app.js) ================= */
const WALL_DEFAULT = {
  pitchId: 'P2.6', pitch: 2.604, cabW: 500, cabH: 500,
  pxOverride: false, cabPxW: 192, cabPxH: 192,
  mode: 'count', cols: 12, rows: 6, targetW: 6, targetH: 3,
  mountH: 0.6, curve: 'flat', angle: 5, joints: [],
};
const encodeWall = (s) => btoa(encodeURIComponent(JSON.stringify(s)));

function readWall() {
  if (location.hash.length > 2) {
    try { return { s: Object.assign({}, WALL_DEFAULT, JSON.parse(decodeURIComponent(atob(location.hash.slice(1))))), src: 'link' }; } catch (e) { /* ignore */ }
  }
  try {
    const raw = localStorage.getItem('ledwall-state');
    if (raw) return { s: Object.assign({}, WALL_DEFAULT, JSON.parse(raw)), src: 'saved' };
  } catch (e) { /* ignore */ }
  return { s: Object.assign({}, WALL_DEFAULT), src: 'default' };
}

// สร้างแนวจอมุมบน (เหมือน buildGeometry ใน app.js) — หน่วย mm, z เข้าหาผู้ชม
function buildPath(cols, w, joints) {
  let x = 0, z = 0, h = 0;
  const raw = [{ x, z }];
  for (let i = 0; i < cols; i++) {
    x += w * Math.cos(h); z += w * Math.sin(h);
    raw.push({ x, z });
    if (i < cols - 1) h += joints[i] * DEG;
  }
  const a = raw[0], b = raw[raw.length - 1];
  const chord = Math.hypot(b.x - a.x, b.z - a.z);
  const ang = chord > 1 ? Math.atan2(b.z - a.z, b.x - a.x) : 0;
  const c = Math.cos(-ang), s = Math.sin(-ang);
  let pts = raw.map((p) => { const dx = p.x - a.x, dz = p.z - a.z; return { x: dx * c - dz * s, z: dx * s + dz * c }; });
  const midX = (pts[0].x + pts[pts.length - 1].x) / 2;
  pts = pts.map((p) => ({ x: p.x - midX, z: p.z }));
  return pts;
}

function wallInfo(s) {
  const pitch = s.pitch > 0 ? s.pitch : 2.604;
  const cabW = Math.max(50, num(s.cabW, 500)), cabH = Math.max(50, num(s.cabH, 500));
  const px = s.pxOverride
    ? { w: Math.max(1, Math.round(s.cabPxW)), h: Math.max(1, Math.round(s.cabPxH)) }
    : { w: Math.max(1, Math.round(cabW / pitch)), h: Math.max(1, Math.round(cabH / pitch)) };
  const cols = s.mode === 'size' ? clamp(Math.round((s.targetW * 1000) / cabW), 1, 100) : clamp(Math.round(s.cols), 1, 100);
  const rows = s.mode === 'size' ? clamp(Math.round((s.targetH * 1000) / cabH), 1, 100) : clamp(Math.round(s.rows), 1, 100);
  const n = cols - 1;
  const joints = s.curve === 'uniform' ? Array(n).fill(clamp(s.angle, -90, 90))
    : s.curve === 'custom' ? Array.from({ length: n }, (_, i) => clamp(num(s.joints && s.joints[i], 0), -180, 180))
      : Array(n).fill(0);
  const pts = buildPath(cols, cabW, joints).map((p) => ({ x: p.x / 1000, z: p.z / 1000 }));
  const total = joints.reduce((a, v) => a + v, 0);
  return {
    s, pitch, cabW, cabH, px, cols, rows, joints, pts, total,
    curved: joints.some((j) => j !== 0),
    W: cols * px.w, H: rows * px.h,
    wallW: (cols * cabW) / 1000, wallH: (rows * cabH) / 1000,
    mount: Math.max(0, num(s.mountH, 0)),
    pitchX: cabW / px.w,
  };
}

/* ================= SETTINGS ================= */
const SENSORS = [
  { id: 's35', n: 'Super 35 · 16:9', w: 24.89, h: 14.0 },
  { id: 'ff', n: 'Full Frame · 16:9', w: 36, h: 20.25 },
  { id: 'lf', n: 'Large Format · 16:9', w: 31.68, h: 17.82 },
  { id: 'm43', n: 'Micro 4/3 · 16:9', w: 17.3, h: 9.73 },
];
const DEFAULT = {
  view: 'studio', fit: 'cover', bright: 100, seams: true, pixelTrue: false,
  lens: 35, sensor: 's35', camDist: 6, camH: 1.5, camX: 0, pan: 0, tilt: 4,
  talent: true, talentDist: 2.5, reflect: true, frustum: true, sample: 'sunset',
};
const P = (() => {
  try { return Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem('vpsim-state') || '{}')); } catch (e) { return Object.assign({}, DEFAULT); }
})();
const save = () => { try { localStorage.setItem('vpsim-state', JSON.stringify(P)); } catch (e) { /* ignore */ } };
const sensor = () => SENSORS.find((x) => x.id === P.sensor) || SENSORS[0];

let wall = readWall();
let WI = wallInfo(wall.s);

/* ================= SAMPLE IMAGES (วาดด้วยโค้ด) ================= */
function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function makeSample(kind) {
  const c = document.createElement('canvas');
  const w = 3200, h = 1400;
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const R = rng(7);
  if (kind === 'sunset') {
    let gr = g.createLinearGradient(0, 0, 0, h * 0.72);
    gr.addColorStop(0, '#1b2350'); gr.addColorStop(0.45, '#7a3b6e'); gr.addColorStop(0.8, '#f2795a'); gr.addColorStop(1, '#ffc27a');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    gr = g.createRadialGradient(w * 0.62, h * 0.66, 10, w * 0.62, h * 0.66, h * 0.55);
    gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.12, 'rgba(255,214,150,.95)'); gr.addColorStop(0.13, 'rgba(255,190,120,.55)'); gr.addColorStop(1, 'rgba(255,150,90,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const dune = (y0, amp, col, ph) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(0, h);
      for (let x = 0; x <= w; x += 16) g.lineTo(x, y0 + Math.sin(x / 420 + ph) * amp + Math.sin(x / 150 + ph * 2) * amp * 0.25);
      g.lineTo(w, h); g.closePath(); g.fill();
    };
    dune(h * 0.7, 28, '#b8574a', 0.3); dune(h * 0.76, 40, '#7e3438', 1.7); dune(h * 0.85, 52, '#4a1d2a', 3.1); dune(h * 0.94, 30, '#25101a', 4.4);
  } else if (kind === 'forest') {
    // ป่าสนยามเช้า มีหมอกระหว่างชั้นต้นไม้ + ทางเดินด้านล่าง (สัตว์ GIF เดินทับ ดู wallActor)
    let gr = g.createLinearGradient(0, 0, 0, h * 0.75);
    gr.addColorStop(0, '#9fc7c0'); gr.addColorStop(0.55, '#d8e6c4'); gr.addColorStop(1, '#f3eccb');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    gr = g.createRadialGradient(w * 0.7, h * 0.28, 10, w * 0.7, h * 0.28, h * 0.7);
    gr.addColorStop(0, 'rgba(255,250,215,.95)'); gr.addColorStop(0.15, 'rgba(255,240,190,.5)'); gr.addColorStop(1, 'rgba(255,240,190,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const pine = (x, base, th, tw, col) => {
      g.fillStyle = col;
      g.fillRect(x - tw * 0.04, base - th * 0.2, tw * 0.08, th * 0.2);
      for (let k = 0; k < 4; k++) {
        const y0 = base - th * (0.12 + k * 0.21), ww = tw * (1 - k * 0.2);
        g.beginPath(); g.moveTo(x - ww / 2, y0); g.lineTo(x, y0 - th * 0.36); g.lineTo(x + ww / 2, y0); g.closePath(); g.fill();
      }
    };
    const row = (base, minH, maxH, gap, col, fog) => {
      for (let x = -80; x < w + 80; x += gap * (0.6 + R() * 0.8)) { const th = minH + R() * (maxH - minH); pine(x, base + R() * 20, th, th * 0.42, col); }
      g.fillStyle = col; g.fillRect(0, base + 10, w, h - base);
      if (fog) {
        const fg = g.createLinearGradient(0, base - maxH * 0.6, 0, base + 20);
        fg.addColorStop(0, 'rgba(230,238,220,0)'); fg.addColorStop(1, `rgba(230,238,220,${fog})`);
        g.fillStyle = fg; g.fillRect(0, base - maxH * 0.6, w, maxH * 0.6 + 20);
      }
    };
    row(h * 0.6, 260, 420, 70, '#8fae9a', 0.55);
    row(h * 0.68, 340, 560, 90, '#5f8a6e', 0.45);
    row(h * 0.76, 420, 700, 120, '#3b6447', 0.35);
    row(h * 0.84, 520, 860, 170, '#22402c', 0);
    // แสงลอดยอดไม้
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const x0 = w * (0.45 + R() * 0.45), sp = 40 + R() * 90;
      gr = g.createLinearGradient(0, 0, 0, h * 0.9);
      gr.addColorStop(0, 'rgba(255,240,190,.16)'); gr.addColorStop(1, 'rgba(255,240,190,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + sp, 0); g.lineTo(x0 - 500 + sp * 3, h * 0.9); g.lineTo(x0 - 500, h * 0.9); g.closePath(); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
    // พื้นป่า + ทางดิน
    gr = g.createLinearGradient(0, h * 0.84, 0, h);
    gr.addColorStop(0, '#2c4a2a'); gr.addColorStop(1, '#16260f');
    g.fillStyle = gr; g.fillRect(0, h * 0.84, w, h * 0.16);
    g.fillStyle = '#6b5236'; g.beginPath(); g.moveTo(0, h * 0.9);
    for (let x = 0; x <= w; x += 40) g.lineTo(x, h * 0.9 + Math.sin(x / 300) * 8);
    for (let x = w; x >= 0; x -= 40) g.lineTo(x, h * 0.97 + Math.sin(x / 260 + 1) * 10);
    g.closePath(); g.fill();
    for (let i = 0; i < 900; i++) { g.fillStyle = R() < 0.5 ? 'rgba(60,110,50,.8)' : 'rgba(25,55,25,.8)'; g.fillRect(R() * w, h * (0.85 + R() * 0.15), 3, 8 + R() * 10); }
  } else if (kind === 'city') {
    let gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#03040c'); gr.addColorStop(0.6, '#141a3a'); gr.addColorStop(1, '#3a2346');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(255,255,255,${R() * 0.8})`; g.fillRect(R() * w, R() * h * 0.5, 2, 2); }
    g.fillStyle = '#f4f1e6'; g.beginPath(); g.arc(w * 0.18, h * 0.2, 60, 0, Math.PI * 2); g.fill();
    const layer = (base, minH, maxH, col, win) => {
      let x = -20;
      while (x < w) {
        const bw = 60 + R() * 160, bh = minH + R() * (maxH - minH);
        g.fillStyle = col; g.fillRect(x, base - bh, bw, bh + 4);
        if (win) for (let yy = base - bh + 14; yy < base - 10; yy += 22) for (let xx = x + 10; xx < x + bw - 12; xx += 18) {
          if (R() < 0.42) { g.fillStyle = R() < 0.8 ? 'rgba(255,205,120,.9)' : 'rgba(120,220,255,.9)'; g.fillRect(xx, yy, 9, 12); }
        }
        x += bw + 4;
      }
    };
    layer(h * 0.82, 150, 480, '#151a33', false);
    layer(h * 0.9, 200, 620, '#0c0f20', true);
    layer(h + 10, 120, 360, '#05060e', true);
    gr = g.createLinearGradient(0, h * 0.7, 0, h);
    gr.addColorStop(0, 'rgba(255,80,160,0)'); gr.addColorStop(1, 'rgba(255,80,160,.18)');
    g.fillStyle = gr; g.fillRect(0, h * 0.7, w, h * 0.3);
  } else if (kind === 'space') {
    g.fillStyle = '#02030a'; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'lighter';
    [['#3b1d78', 0.3, 0.4, 700], ['#0f5a8a', 0.55, 0.55, 600], ['#8a1d5a', 0.75, 0.3, 500], ['#1d3b78', 0.15, 0.75, 500]].forEach(([col, x, y, r]) => {
      const gr = g.createRadialGradient(w * x, h * y, 0, w * x, h * y, r);
      gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    for (let i = 0; i < 1400; i++) { const s = R() < 0.97 ? 1.5 : 3.5; g.fillStyle = `rgba(255,255,255,${0.3 + R() * 0.7})`; g.fillRect(R() * w, R() * h, s, s); }
    g.globalCompositeOperation = 'source-over';
    const px = w * 0.68, py = h * 0.62, pr = 260;
    const gr = g.createRadialGradient(px - pr * 0.4, py - pr * 0.4, pr * 0.1, px, py, pr);
    gr.addColorStop(0, '#e7c08a'); gr.addColorStop(0.6, '#a0603a'); gr.addColorStop(1, '#2a140c');
    g.fillStyle = gr; g.beginPath(); g.arc(px, py, pr, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(230,210,180,.55)'; g.lineWidth = 14;
    g.beginPath(); g.ellipse(px, py, pr * 1.9, pr * 0.35, -0.25, 0, Math.PI * 2); g.stroke();
  } else if (kind === 'nosignal') {
    // จอ "NO SIGNAL" แบบทีวีเก่า — วงกลมแถบสีตรงกลาง รายล้อมด้วยบล็อกนอยส์/ลายทาง/แถบไล่สี
    const cx = 1500, cy = 700, Rc = 650;
    const noise = (x, y, bw, bh, bg, fg, cell = 14, dens = 0.11) => {
      g.fillStyle = bg; g.fillRect(x, y, bw, bh); g.fillStyle = fg;
      for (let yy = y + cell; yy < y + bh - cell; yy += cell) for (let xx = x + cell; xx < x + bw - cell; xx += cell) {
        if (R() < dens) { g.fillRect(xx, yy, cell - 2, cell - 2); if (R() < 0.5) g.fillRect(xx + cell, yy + (R() < 0.5 ? cell : 0), cell - 2, cell - 2); }
      }
    };
    const stripes = (x, y, bw, bh, sh, seg) => {
      g.fillStyle = '#f4f4f4'; g.fillRect(x, y, bw, bh); g.fillStyle = '#0a0a0a';
      for (let sx = x, n = 0; sx < x + bw; sx += seg, n++) {
        const off = n % 2 ? sh : 0, sw = Math.min(seg, x + bw - sx);
        for (let yy = y + off - sh; yy < y + bh; yy += sh * 2) { const t = Math.max(yy, y); g.fillRect(sx, t, sw, Math.min(yy + sh, y + bh) - t); }
      }
    };
    const grad = (x, y, bw, bh, cols) => {
      const gr = g.createLinearGradient(x, 0, x + bw, 0);
      cols.forEach((col, i) => gr.addColorStop(i / (cols.length - 1), col));
      g.fillStyle = gr; g.fillRect(x, y, bw, bh);
    };

    // พื้นกริดเทาเข้ม
    g.fillStyle = '#1b1b1b'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 2;
    for (let x = 0; x <= w; x += 70) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h; y += 70) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }

    // บล็อกด้านหลังวงกลม
    noise(280, 80, 1150, 270, '#050505', '#f4f4f4');
    noise(150, 230, 240, 340, '#f4f4f4', '#050505');
    noise(2470, 120, 520, 430, '#050505', '#f4f4f4');
    noise(2800, 560, 400, 170, '#f4f4f4', '#050505');
    noise(0, 620, 600, 560, '#050505', '#f4f4f4');
    noise(1850, 1180, 1100, 220, '#050505', '#f4f4f4');
    stripes(2300, 0, 900, 70, 12, 300);
    stripes(2080, 250, 360, 80, 12, 180);
    stripes(2400, 780, 800, 70, 12, 260);
    stripes(230, 1000, 620, 290, 36, 330);
    stripes(570, 920, 260, 300, 22, 130);
    stripes(2350, 960, 850, 380, 34, 270);
    stripes(0, 1290, 760, 70, 10, 250);
    stripes(360, 1330, 1300, 70, 10, 260);

    // วงกลมกลาง — วาดทุกแถวโดย clip ให้อยู่ในวงกลม
    g.save();
    g.beginPath(); g.arc(cx, cy, Rc, 0, Math.PI * 2); g.clip();
    const L = cx - Rc, Wd = Rc * 2;
    g.fillStyle = '#f6f6f6'; g.fillRect(L, 0, Wd, h);
    g.fillStyle = '#f1cf2b'; g.fillRect(L, 0, Wd, 200);
    g.fillStyle = '#d2101d'; g.fillRect(cx - 70, 0, 140, 200);
    g.fillStyle = '#141414'; g.fillRect(cx - 420, 225, 840, 80);
    g.fillStyle = '#f6f6f6'; g.font = '500 30px "JetBrains Mono", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('REAL BANGKOK · VIRTUAL PRODUCTION', cx, 266);
    g.fillStyle = '#141414'; g.fillRect(L, 335, Wd, 60);
    g.fillStyle = '#f6f6f6'; [-390, -250, -235, 40, 300, 315, 470].forEach((dx) => g.fillRect(cx + dx, 335, 10, 60));
    for (let x = L, n = 0; x < L + Wd; x += 72, n++) { g.fillStyle = n % 2 ? '#f6f6f6' : '#141414'; g.fillRect(x, 395, 72, 85); }
    [['#f1cf2b', 0.12], ['#7ccf3e', 0.22], ['#c10a1e', 0.22], ['#d283ad', 0.22], ['#3d63e8', 0.22]].reduce((x, [col, f]) => {
      g.fillStyle = col; g.fillRect(x, 480, Wd * f + 1, 170); return x + Wd * f;
    }, L);
    g.fillStyle = '#1d1d1d'; g.fillRect(L, 650, Wd, 130);
    g.fillStyle = '#f6f6f6'; g.font = '500 96px "Space Grotesk", sans-serif';
    g.fillText('NO SIGNAL', cx, 718);
    for (let y = 680; y <= 750; y += 10) { g.fillRect(cx - 560, y, 290, 3); g.fillRect(cx + 270, y, 290, 3); }
    // ลายเส้นตั้งความถี่ไล่ระดับ
    g.fillStyle = '#0a0a0a'; g.fillRect(L, 780, Wd, 130);
    g.fillStyle = '#f6f6f6';
    for (let x = cx - 560, s = 26; x < cx + 560; x += s * 2, s = Math.max(6, s * 0.94)) g.fillRect(x, 790, s, 110);
    [['#3d63e8', 0.1], ['#d283ad', 0.3], ['#c10a1e', 0.3], ['#7ccf3e', 0.3]].reduce((x, [col, f]) => {
      g.fillStyle = col; g.fillRect(x, 910, Wd * f + 1, 65); return x + Wd * f;
    }, L);
    for (let i = 0; i < 11; i++) { const v = 50 + i * 19; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(cx - 560 + i * 102, 975, 103, 120); }
    g.fillStyle = '#0a0a0a'; g.fillRect(L, 1095, Wd, 110);
    g.strokeStyle = '#f6f6f6'; g.lineWidth = 3;
    for (let x = cx - 560; x <= cx + 560; x += 56) { g.beginPath(); g.moveTo(x, 1095); g.lineTo(x, 1205); g.stroke(); }
    for (let y = 1095; y <= 1205; y += 55) { g.beginPath(); g.moveTo(L, y); g.lineTo(L + Wd, y); g.stroke(); }
    ['#3a3a3a', '#8a8a8a', '#c4c4c4', '#ededed'].forEach((col, i) => { g.fillStyle = col; g.fillRect(cx - 560 + i * 280, 1215, 280, 45); });
    g.restore();

    // แถบไล่สีวางทับ
    grad(300, 300, 1460, 80, ['#3d63e8', '#7fd6e8', '#7ccf3e', '#f1e83a', '#e0920f', '#d2101d']);
    grad(2040, 440, 900, 150, ['#6fd6a0', '#c64aa0', '#d79ab5', '#e0a040', '#f1e070']);
    grad(200, 1140, 1080, 170, ['#7fd6e8', '#e0a040', '#d79ab5', '#c64aa0', '#c10a1e', '#7b4ad6']);

    // กล่องเทา + ขีดสเกลความละเอียด
    g.fillStyle = '#777'; g.fillRect(1330, 1220, 1050, 180);
    g.fillStyle = '#141414';
    for (let x = 1600, i = 0; x < 2330; x += 14, i++) g.fillRect(x, i % 5 ? 1290 : 1260, 4, i % 5 ? 70 : 100);

    // วงกลมไล่สีด้านขวา
    const gc = g.createLinearGradient(2000, 0, 2580, 0);
    gc.addColorStop(0, '#f1d02b'); gc.addColorStop(0.5, '#c64aa0'); gc.addColorStop(1, '#3d63e8');
    g.fillStyle = gc; g.beginPath(); g.arc(2290, 930, 290, 0, Math.PI * 2); g.fill();
  } else {
    // Test pattern สไตล์โปสเตอร์กริดดำ — ยังมีแถบสี/สเกลเทา/วงกลม/กากบาทให้เช็กจอได้จริง
    const W = '#f2f2f2', M = 70, cx = w / 2, cy = h / 2;
    const smpte = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
    const pop = ['#ff2e93', '#ffd400', '#00d1ff', '#3ddc4a', '#ff5a1f', '#7b5cff', '#ffffff', '#e8b48a'];
    const line = (x1, y1, x2, y2) => { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
    const plus = (x, y, s) => { line(x - s, y, x + s, y); line(x, y - s, x, y + s); };
    const sparkle = (x, y, s) => {
      g.beginPath();
      for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, r = i % 2 ? s * 0.22 : s; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
      g.closePath(); g.stroke();
    };
    const pill = (x, y, pw, ph, txt) => {
      g.fillStyle = '#0a0a0a'; g.beginPath(); g.roundRect(x - pw / 2, y - ph / 2, pw, ph, ph / 2); g.fill(); g.stroke();
      g.fillStyle = W; g.font = '500 30px "JetBrains Mono", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(txt, x, y + 1);
    };
    const mono = (txt, x, y, size = 24, align = 'left') => {
      g.fillStyle = W; g.font = `500 ${size}px "JetBrains Mono", monospace`; g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(txt, x, y);
    };

    g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, w, h);
    // กริด: เส้นรอง 50px, เส้นหลัก 200px
    g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.07)';
    for (let x = 0; x <= w; x += 50) line(x, 0, x, h);
    for (let y = 0; y <= h; y += 50) line(0, y, w, y);
    g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.22)';
    for (let x = 0; x <= w; x += 200) line(x, 0, x, h);
    for (let y = 0; y <= h; y += 200) line(0, y, w, y);

    // กรอบ + มุม
    g.strokeStyle = W; g.lineWidth = 3;
    g.strokeRect(M, M, w - M * 2, h - M * 2);
    [[M, M], [w - M, M], [M, h - M], [w - M, h - M]].forEach(([x, y]) => sparkle(x, y, 34));
    pill(cx, M, 900, 64, 'REAL BANGKOK · VIRTUAL PRODUCTION TEST');
    pill(cx, h - M, 900, 64, `LED WALL ALIGNMENT · ${w} × ${h} PX`);

    // แถบสีแนวตั้งสองข้าง (SMPTE + สีสด + สเกลเทา)
    const strip = [...smpte, null, ...pop, null, '#ffffff', '#bfbfbf', '#808080', '#404040', '#000000'];
    [M + 46, w - M - 46 - 30].forEach((sx) => {
      let y = 200;
      strip.forEach((col) => {
        if (col) { g.fillStyle = col; g.fillRect(sx, y, 30, 30); if (col === '#000000') { g.strokeStyle = W; g.lineWidth = 1; g.strokeRect(sx, y, 30, 30); } }
        y += col ? 38 : 50;
      });
    });

    // วงกลมกลางจอ + กากบาท + ขีดสเกล
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 3;
    g.beginPath(); g.arc(cx, cy, h * 0.4, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, h * 0.2, 0, Math.PI * 2); g.stroke();
    line(cx - h * 0.44, cy, cx + h * 0.44, cy); line(cx, cy - h * 0.44, cx, cy + h * 0.44);
    for (let i = 0; i < 72; i++) {
      const a = (i * Math.PI) / 36, r1 = h * 0.4, r2 = r1 - (i % 6 ? 12 : 28);
      line(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    }

    // พิกเซลไล่แนวทแยง (เช็กสี/ขอบพิกเซล)
    const ps = 44;
    for (let k = 0; k < 26; k++) {
      const bx = 1180 + k * ps, by = 1010 - k * ps * 0.62;
      for (let j = -2; j <= 2; j++) {
        if (R() < 0.3) continue;
        g.fillStyle = pop[Math.floor(R() * pop.length)];
        g.fillRect(Math.round(bx + j * ps * 0.5), Math.round(by + j * ps), ps - 4, ps - 4);
      }
    }

    // หัวข้อใหญ่ฝั่งซ้าย — กล่องขาวกลับสีตัวอักษร
    g.fillStyle = W;
    g.fillRect(470, 170, 230, 210); g.fillRect(260, 600, 150, 190);
    g.globalCompositeOperation = 'difference';
    g.font = '700 200px "Space Grotesk", sans-serif'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    ['REAL', 'BANGKOK', 'VP TEST'].forEach((t, i) => g.fillText(t, 240, 360 + i * 200));
    g.globalCompositeOperation = 'source-over';
    mono('Calibrate the wall. Match the camera.', 250, 820, 28);
    mono('Shoot it like it was always there.', 250, 860, 28);

    // สเกลเทา 11 ขั้น
    for (let i = 0; i <= 10; i++) {
      const v = Math.round((i / 10) * 255);
      g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(250 + i * 66, 960, 66, 110);
      mono(String(i * 10), 250 + i * 66 + 33, 1110, 20, 'center');
    }
    g.strokeStyle = W; g.lineWidth = 2; g.strokeRect(250, 960, 726, 110);

    // สามเหลี่ยมไล่เหลือง + แท่งไล่ขาว-ดำ
    let gr = g.createLinearGradient(1000, 0, 1230, 0);
    gr.addColorStop(0, 'rgba(255,230,0,0)'); gr.addColorStop(1, '#ffe600');
    g.fillStyle = gr; g.beginPath(); g.moveTo(1000, 1180); g.lineTo(1230, 1130); g.lineTo(1230, 1230); g.closePath(); g.fill();
    gr = g.createLinearGradient(0, 640, 0, 1240);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#000000');
    g.fillStyle = gr; g.fillRect(1100, 640, 44, 470);
    g.strokeStyle = W; g.strokeRect(1100, 640, 44, 470);

    // ไอคอนเส้นบาง
    g.strokeStyle = W; g.lineWidth = 3;
    for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; line(2150, 300, 2150 + Math.cos(a) * 130, 300 + Math.sin(a) * 130); }
    g.lineWidth = 2;
    [[1150, 330], [2300, 1050], [1950, 1180]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 34, 0, Math.PI * 2); g.stroke(); plus(x, y, 22); });
    g.lineWidth = 6; [[2000, 560], [1060, 520], [2050, 800]].forEach(([x, y]) => plus(x, y, 26));
    g.lineWidth = 3; [[1350, 230], [2380, 760]].forEach(([x, y]) => sparkle(x, y, 40));
    g.lineWidth = 14; g.lineCap = 'round';
    line(2400, 400, 2440, 440); line(2440, 400, 2400, 440); line(2470, 400, 2510, 440); line(2510, 400, 2470, 440);
    g.lineCap = 'butt';

    // โค้ดสี่เหลี่ยม (แบบ QR) + บาร์โค้ด
    const qx = 2620, qy = 210, qs = 11, qn = 21;
    g.fillStyle = W; g.fillRect(qx - 14, qy - 14, qn * qs + 28, qn * qs + 28);
    g.fillStyle = '#0a0a0a';
    for (let y = 0; y < qn; y++) for (let x = 0; x < qn; x++) {
      const fin = (x < 7 && y < 7) || (x >= qn - 7 && y < 7) || (x < 7 && y >= qn - 7);
      if (fin) {
        const fx = x % 14, fy = y % 14;
        if (fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4)) g.fillRect(qx + x * qs, qy + y * qs, qs, qs);
      } else if (R() < 0.48) g.fillRect(qx + x * qs, qy + y * qs, qs, qs);
    }
    g.fillStyle = W;
    for (let x = 2620; x < 2860;) { const bw = 3 + Math.floor(R() * 10); g.fillRect(x, 560, bw, 130); x += bw + 4 + Math.floor(R() * 8); }
    mono('RBK-VP-0001', 2620, 725, 22);

    // หัวข้อชิดขวาล่าง
    g.fillStyle = W; g.font = '700 128px "Space Grotesk", sans-serif'; g.textAlign = 'right'; g.textBaseline = 'alphabetic';
    ['Align.', 'Focus.', 'Shoot.'].forEach((t, i) => g.fillText(t, w - 240, 980 + i * 120));

    // ป้ายกำกับเล็ก
    mono('GRID 200 PX · SUB 50 PX', 250, 140, 22);
    mono('CENTER ⌖ ' + cx + ', ' + cy, cx + 20, cy + h * 0.2 + 40, 22);
    mono('SMPTE 75% · REC.709', w - 240, 140, 22, 'right');
    mono('2026 · BANGKOK', w - 240, 790, 22, 'right');
  }
  return c;
}

/* ================= THREE SETUP ================= */
const canvas = $('sim');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (e) {
  $('simError').hidden = false; $('simError').textContent = t('err.webgl');
  throw e;
}
window.__vpReady = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
RectAreaLightUniformsLib.init();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030303);
scene.fog = new THREE.Fog(0x030303, 30, 70);
scene.add(new THREE.HemisphereLight(0xffffff, 0x101010, 0.35));
// ไฟคีย์อ่อนๆ จากฝั่งกล้อง (หน้างานจริงมักมีไฟเสริมให้นักแสดง)
const key = new THREE.DirectionalLight(0xfff1e0, 0.7);
key.position.set(-4, 5, 12);
scene.add(key);

const studioCam = new THREE.PerspectiveCamera(40, 1, 0.05, 300);
studioCam.layers.enable(1);
const controls = new OrbitControls(studioCam, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.495;

const vcam = new THREE.PerspectiveCamera(30, 16 / 9, 0.05, 300);
vcam.rotation.order = 'YXZ';

// พื้น: กระจกสะท้อน + ผิวด้านโปร่งแสงทับ + กริด
const reflector = new Reflector(new THREE.PlaneGeometry(80, 80), {
  textureWidth: 1024, textureHeight: 1024, color: 0x8a8a8a,
});
reflector.rotation.x = -Math.PI / 2;
scene.add(reflector);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.6, metalness: 0.1, transparent: true });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), floorMat);
floor.rotation.x = -Math.PI / 2; floor.position.y = 0.002;
scene.add(floor);
const grid = new THREE.GridHelper(80, 80, 0x2c2c2c, 0x181818);
grid.position.y = 0.004;
grid.material.transparent = true; grid.material.opacity = 0.7;
scene.add(grid);

/* ---------- จอ LED ---------- */
const texCanvas = document.createElement('canvas');
const texCtx = texCanvas.getContext('2d');
const tex = new THREE.CanvasTexture(texCanvas);
tex.colorSpace = THREE.SRGBColorSpace;
tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
const screenMat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.FrontSide, fog: false });
const backMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.8, side: THREE.BackSide });
const baseMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.9, side: THREE.DoubleSide });
const seamMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
const wallGroup = new THREE.Group();
scene.add(wallGroup);
let wallFront = null, seamLines = null;
const lights = [];
let wallCenter = { x: 0, z: 0 };

function disposeGroup(g) {
  g.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  g.clear();
}

function buildWall() {
  disposeGroup(wallGroup);
  lights.forEach((l) => scene.remove(l)); lights.length = 0;
  const { pts, cols, rows, mount, wallH } = WI;
  const y0 = mount, y1 = mount + wallH;
  const pos = [], uv = [], idx = [];
  for (let i = 0; i < cols; i++) {
    const a = pts[i], b = pts[i + 1], k = i * 4, u0 = i / cols, u1 = (i + 1) / cols;
    pos.push(a.x, y0, a.z, b.x, y0, b.z, b.x, y1, b.z, a.x, y1, a.z);
    uv.push(u0, 0, u1, 0, u1, 1, u0, 1);
    idx.push(k, k + 1, k + 2, k, k + 2, k + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  wallFront = new THREE.Mesh(geo, screenMat);
  wallGroup.add(wallFront, new THREE.Mesh(geo, backMat));

  // ฐาน/ขาตั้งใต้จอ
  if (mount > 0.01) {
    const bp = [];
    for (let i = 0; i < cols; i++) {
      const a = pts[i], b = pts[i + 1];
      bp.push(a.x, 0, a.z, b.x, 0, b.z, b.x, mount, b.z, a.x, 0, a.z, b.x, mount, b.z, a.x, mount, a.z);
    }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3));
    bg.computeVertexNormals();
    wallGroup.add(new THREE.Mesh(bg, baseMat));
  }

  // รอยต่อตู้ (ยกออกจากผิวจอเล็กน้อย)
  const sp = [], off = 0.004;
  const nrm = (i) => { const a = pts[i], b = pts[i + 1]; const nx = -(b.z - a.z), nz = b.x - a.x, l = Math.hypot(nx, nz) || 1; return { x: nx / l, z: nz / l }; };
  for (let i = 0; i <= cols; i++) {
    const n1 = nrm(Math.min(i, cols - 1)), n0 = nrm(Math.max(i - 1, 0));
    const nx = (n0.x + n1.x) / 2, nz = (n0.z + n1.z) / 2;
    const p = pts[i];
    sp.push(p.x + nx * off, y0, p.z + nz * off, p.x + nx * off, y1, p.z + nz * off);
  }
  for (let r = 0; r <= rows; r++) {
    const y = y0 + (r * WI.cabH) / 1000;
    for (let i = 0; i < cols; i++) {
      const a = pts[i], b = pts[i + 1], n = nrm(i);
      sp.push(a.x + n.x * off, y, a.z + n.z * off, b.x + n.x * off, y, b.z + n.z * off);
    }
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  seamLines = new THREE.LineSegments(sg, seamMat);
  seamLines.visible = P.seams;
  wallGroup.add(seamLines);

  // จุดกึ่งกลางจอ (ตามความยาวโค้ง)
  if (cols % 2 === 0) wallCenter = { ...pts[cols / 2] };
  else { const a = pts[(cols - 1) / 2], b = pts[(cols + 1) / 2]; wallCenter = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 }; }

  // แสงจากจอ: แบ่งเป็นช่วงละ 1/3 ความกว้าง แสงสีเฉลี่ยของภาพแต่ละช่วง
  const parts = cols >= 3 ? 3 : 1;
  for (let k = 0; k < parts; k++) {
    const i0 = Math.floor((k * cols) / parts), i1 = Math.floor(((k + 1) * cols) / parts);
    let mx = 0, mz = 0, nx = 0, nz = 0;
    for (let i = i0; i < i1; i++) {
      const a = pts[i], b = pts[i + 1], n = nrm(i);
      mx += (a.x + b.x) / 2; mz += (a.z + b.z) / 2; nx += n.x; nz += n.z;
    }
    const c = i1 - i0;
    const L = new THREE.RectAreaLight(0xffffff, 1, (c * WI.cabW) / 1000, wallH);
    L.position.set(mx / c + (nx / c) * 0.02, mount + wallH / 2, mz / c + (nz / c) * 0.02);
    L.lookAt(L.position.x + nx, L.position.y, L.position.z + nz);
    scene.add(L); lights.push(L);
  }
  paintTexture();
}

/* ---------- เนื้อหาบนจอ ---------- */
let source = null;       // HTMLImageElement | HTMLCanvasElement
let sourceName = '';
let isSample = true;

function texSize() {
  const max = Math.min(renderer.capabilities.maxTextureSize, 4096);
  const s = Math.min(1, max / WI.W, max / WI.H);
  return [Math.max(2, Math.round(WI.W * s)), Math.max(2, Math.round(WI.H * s))];
}

function paintTexture() {
  drawWall();
  renderStats();
  invalidate();
}

function drawWall() {
  const [cw, ch] = texSize();
  if (texCanvas.width !== cw || texCanvas.height !== ch) {
    texCanvas.width = cw; texCanvas.height = ch;
    tex.dispose(); // ขนาดเปลี่ยนต้องสร้าง GPU texture ใหม่
  }
  texCtx.fillStyle = '#000'; texCtx.fillRect(0, 0, cw, ch);
  if (source) {
    const iw = source.naturalWidth || source.width, ih = source.naturalHeight || source.height;
    // ใช้สัดส่วนจริงของจอ (เมตร) เพื่อไม่ให้ภาพบิดเมื่อพิกเซลไม่เป็นสี่เหลี่ยมจัตุรัส
    const sx = cw / WI.wallW, sy = ch / WI.wallH;
    let dw, dh;
    if (P.fit === 'stretch') { dw = cw; dh = ch; } else {
      const k = (P.fit === 'cover' ? Math.max : Math.min)(WI.wallW / iw, WI.wallH / ih);
      dw = iw * k * sx; dh = ih * k * sy;
    }
    texCtx.imageSmoothingEnabled = true; texCtx.imageSmoothingQuality = 'high';
    texCtx.drawImage(source, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    if (wallActorOn()) drawWallActor((cw - dw) / 2, (ch - dh) / 2, dw / iw, dh / ih);
  }
  tex.magFilter = P.pixelTrue ? THREE.NearestFilter : THREE.LinearFilter;
  tex.needsUpdate = true;
  updateLightColors();
}

/* ---------- สัตว์เดินในฉากป่า (GIF วาดทับภาพบนจอ เดินจากขวาไปซ้ายวนไปเรื่อยๆ) ---------- */
const wallActor = { frames: [], durations: [], i: 0, next: 0, last: 0, t0: performance.now() };
const ACTOR_H = 420, ACTOR_GROUND = 1340, ACTOR_SPEED = 110; // พิกัดในภาพตัวอย่าง 3200×1400, px/s
const wallActorOn = () => isSample && P.sample === 'forest' && wallActor.frames.length > 0;
function drawWallActor(ox, oy, kx, ky) {
  const f = wallActor.frames[wallActor.i];
  const s = ACTOR_H / f.height, aw = f.width * s;
  const span = 3200 + aw;
  const x = 3200 - (((performance.now() - wallActor.t0) / 1000 * ACTOR_SPEED) % span);
  texCtx.imageSmoothingEnabled = false; // pixel art ให้คม
  texCtx.drawImage(f, ox + x * kx, oy + (ACTOR_GROUND - ACTOR_H) * ky, aw * kx, ACTOR_H * ky);
}
function tickWallActor(now) {
  if (!wallActorOn() || now - wallActor.last < 33) return false; // ~30 fps พอสำหรับการเลื่อน
  wallActor.last = now;
  if (wallActor.frames.length > 1 && now >= wallActor.next) {
    wallActor.i = (wallActor.i + 1) % wallActor.frames.length;
    wallActor.next = now + wallActor.durations[wallActor.i];
  }
  drawWall();
  return true;
}

const avgCanvas = document.createElement('canvas');
avgCanvas.width = 3; avgCanvas.height = 1;
const avgCtx = avgCanvas.getContext('2d', { willReadFrequently: true });
function updateLightColors() {
  const b = P.bright / 100;
  screenMat.color.setScalar(b);
  const parts = lights.length;
  if (!parts) return;
  avgCtx.clearRect(0, 0, 3, 1);
  avgCtx.drawImage(texCanvas, 0, 0, parts, 1);
  const d = avgCtx.getImageData(0, 0, parts, 1).data;
  lights.forEach((L, k) => {
    L.color.setRGB(d[k * 4] / 255, d[k * 4 + 1] / 255, d[k * 4 + 2] / 255, THREE.SRGBColorSpace);
    L.intensity = 6 * b;
  });
}

function useSample(kind) {
  P.sample = kind; isSample = true;
  source = makeSample(kind); sourceName = '';
  try { localStorage.removeItem('vpsim-img'); } catch (e) { /* ignore */ }
  syncInputs(); paintTexture(); save();
}

function loadFile(file) {
  if (!file || !/^image\//.test(file.type || 'image/')) { toast(t('toast.badImg')); return; }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    source = img; sourceName = file.name; isSample = false; P.sample = '';
    syncInputs(); paintTexture(); save();
    storeImage(img);
  };
  img.onerror = () => { URL.revokeObjectURL(url); toast(t('toast.badImg')); };
  img.src = url;
}

// เก็บภาพย่อไว้ในเบราว์เซอร์ เพื่อเปิดหน้าใหม่แล้วยังเห็นภาพเดิม (ถ้าพื้นที่ไม่พอก็ข้าม)
function storeImage(img) {
  try {
    const max = 2400, k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    localStorage.setItem('vpsim-img', JSON.stringify({ name: sourceName, data: c.toDataURL('image/jpeg', 0.86) }));
  } catch (e) { /* ignore */ }
}
function restoreImage() {
  try {
    const raw = localStorage.getItem('vpsim-img');
    if (!raw) return false;
    const { name, data } = JSON.parse(raw);
    const img = new Image();
    img.onload = () => { source = img; sourceName = name; isSample = false; syncInputs(); paintTexture(); };
    img.src = data;
    return true;
  } catch (e) { return false; }
}

/* ---------- นักแสดง (GIF แบบ billboard หันหากล้องเสมอ + รับแสงสีจากจอ) ---------- */
const TALENT_H = 1.75;
const talent = new THREE.Group();
scene.add(talent);
const talentPivot = new THREE.Group();
talent.add(talentPivot);
const gifCanvas = document.createElement('canvas');
const gifCtx = gifCanvas.getContext('2d');
const gifTex = new THREE.CanvasTexture(gifCanvas);
gifTex.colorSpace = THREE.SRGBColorSpace;
gifTex.magFilter = THREE.NearestFilter; gifTex.minFilter = THREE.NearestFilter; gifTex.generateMipmaps = false;
const gif = { frames: [], durations: [], i: 0, next: 0 };
// แสงจากจอที่ตกกระทบนักแสดง: แยกซีกซ้าย/ขวาของภาพ + ขอบ (rim) ที่หันเข้าหาจอ
const spillU = {
  uSpillL: { value: new THREE.Color(0, 0, 0) }, uSpillR: { value: new THREE.Color(0, 0, 0) },
  uFill: { value: 0.5 }, uTexel: { value: new THREE.Vector2(1, 1) },
};
const talentMat = new THREE.MeshStandardMaterial({ map: gifTex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 });
talentMat.onBeforeCompile = (sh) => {
  Object.assign(sh.uniforms, spillU);
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', '#include <common>\nuniform vec3 uSpillL, uSpillR; uniform float uFill; uniform vec2 uTexel;')
    .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      vec3 spill = mix(uSpillL, uSpillR, vMapUv.x);
      float nb = 1.0;
      for (int k = 1; k <= 2; k++) {
        vec2 o = uTexel * float(k);
        nb = min(nb, min(min(texture2D(map, vMapUv + vec2(o.x, 0.)).a, texture2D(map, vMapUv - vec2(o.x, 0.)).a),
                         min(texture2D(map, vMapUv + vec2(0., o.y)).a, texture2D(map, vMapUv - vec2(0., o.y)).a)));
      }
      float rim = 1.0 - nb;
      totalEmissiveRadiance += diffuseColor.rgb * spill * uFill + spill * rim * 1.2;`);
};
const _v = new THREE.Vector3();
const _ax = new THREE.Vector3();
let talentMesh = null;

function updateTalentSpill(cam) {
  if (!lights.length) return;
  const tp = _v.set(talent.position.x, 1.0, talent.position.z);
  const a = talentPivot.rotation.y;
  _ax.set(Math.cos(a), 0, -Math.sin(a)); // แกน x ของภาพในโลก
  const L = spillU.uSpillL.value.setRGB(0, 0, 0), R = spillU.uSpillR.value.setRGB(0, 0, 0);
  let face = 0, wsum = 0;
  const half = Math.max(1, WI.wallW / 2);
  lights.forEach((lt) => {
    const dx = lt.position.x - tp.x, dy = lt.position.y - tp.y, dz = lt.position.z - tp.z;
    const d = Math.hypot(dx, dy, dz) || 1;
    const w = (lt.intensity / 6) * 1.3 / (1 + 0.12 * d * d);
    const lat = clamp((dx * _ax.x + dz * _ax.z) / half, -1, 1);
    L.r += lt.color.r * w * (0.5 - 0.5 * lat); L.g += lt.color.g * w * (0.5 - 0.5 * lat); L.b += lt.color.b * w * (0.5 - 0.5 * lat);
    R.r += lt.color.r * w * (0.5 + 0.5 * lat); R.g += lt.color.g * w * (0.5 + 0.5 * lat); R.b += lt.color.b * w * (0.5 + 0.5 * lat);
    if (cam) {
      const vx = cam.position.x - tp.x, vz = cam.position.z - tp.z, vl = Math.hypot(vx, vz) || 1;
      face += ((vx * dx + vz * dz) / (vl * Math.hypot(dx, dz) || 1)) * w; wsum += w;
    }
  });
  const n = lights.length / 2; // ซ้าย/ขวารวมกันเท่ากับแสงทั้งหมด
  L.multiplyScalar(1 / n); R.multiplyScalar(1 / n);
  // กล้องอยู่ฝั่งเดียวกับจอ = เห็นด้านที่โดนแสงจอเต็มๆ, อยู่ตรงข้าม = เห็นแค่แสงฟุ้ง + ขอบ
  const f = wsum ? face / wsum : -1;
  spillU.uFill.value = 0.6 + 0.8 * (f + 1) / 2;
}

function buildTalentMesh(w, h, box) {
  const s = TALENT_H / (box.y1 - box.y0); // เมตรต่อพิกเซล
  gifCanvas.width = w; gifCanvas.height = h;
  gifTex.dispose();
  spillU.uTexel.value.set(1 / w, 1 / h);
  talentMesh = new THREE.Mesh(new THREE.PlaneGeometry(w * s, h * s), talentMat);
  // วางเท้าแตะพื้น และให้กึ่งกลางตัวอยู่ที่จุดยืน
  talentMesh.position.set((w / 2 - (box.x0 + box.x1) / 2) * s, (box.y1 - h / 2) * s, 0);
  talentMesh.frustumCulled = false;
  talentMesh.onBeforeRender = (r, sc, cam) => {
    cam.getWorldPosition(_v);
    const a = Math.atan2(_v.x - talent.position.x, _v.z - talent.position.z);
    talentPivot.rotation.y = a;
    talentPivot.updateMatrixWorld(true);
    updateTalentSpill(cam);
  };
  talentPivot.add(talentMesh);
}

function drawGifFrame() {
  gifCtx.clearRect(0, 0, gifCanvas.width, gifCanvas.height);
  gifCtx.drawImage(gif.frames[gif.i], 0, 0);
  gifTex.needsUpdate = true;
}

// กรอบของพิกเซลที่ไม่โปร่งใส (รวมทุกเฟรม) เพื่อสเกลให้สูงตามจริงและวางเท้าบนพื้น
function alphaBox(frames, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  const b = { x0: w, y0: h, x1: 0, y1: 0 };
  frames.forEach((f) => {
    g.clearRect(0, 0, w, h); g.drawImage(f, 0, 0);
    const d = g.getImageData(0, 0, w, h).data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] < 128) continue;
      if (x < b.x0) b.x0 = x; if (x + 1 > b.x1) b.x1 = x + 1;
      if (y < b.y0) b.y0 = y; if (y + 1 > b.y1) b.y1 = y + 1;
    }
  });
  return b.x1 > b.x0 ? b : { x0: 0, y0: 0, x1: w, y1: h };
}

async function decodeGif(url) {
  let frames = [], durations = [];
  try {
    if (!('ImageDecoder' in window)) throw new Error('no ImageDecoder');
    const buf = await (await fetch(url)).arrayBuffer();
    const dec = new ImageDecoder({ data: buf, type: 'image/gif' });
    await dec.tracks.ready;
    const n = dec.tracks.selectedTrack.frameCount;
    for (let i = 0; i < n; i++) {
      const { image } = await dec.decode({ frameIndex: i });
      durations.push(Math.max(20, (image.duration || 100000) / 1000));
      frames.push(await createImageBitmap(image));
      image.close();
    }
  } catch (e) {
    // เบราว์เซอร์ที่ไม่รองรับ ImageDecoder: ใช้ภาพนิ่งเฟรมแรก
    const img = new Image();
    img.src = url;
    await img.decode();
    frames = [img]; durations = [Infinity];
  }
  return { frames, durations };
}

async function loadTalentGif(url) {
  const { frames, durations } = await decodeGif(url);
  const w = frames[0].width, h = frames[0].height;
  gif.frames = frames; gif.durations = durations; gif.i = 0;
  gif.next = performance.now() + durations[0];
  buildTalentMesh(w, h, alphaBox(frames, w, h));
  drawGifFrame();
  invalidate();
}
loadTalentGif('1587.gif').catch(() => { /* ไม่มีไฟล์: ไม่แสดงนักแสดง */ });
decodeGif('1885.gif').then(({ frames, durations }) => {
  Object.assign(wallActor, { frames, durations, i: 0, next: performance.now() + durations[0] });
}).catch(() => { /* ไม่มีไฟล์: ฉากป่าไม่มีสัตว์ */ });

function tickGif(now) {
  if (!talent.visible || gif.frames.length < 2 || now < gif.next) return false;
  gif.i = (gif.i + 1) % gif.frames.length;
  gif.next = now + gif.durations[gif.i];
  drawGifFrame();
  return true;
}

/* ---------- โมเดลกล้อง (เห็นเฉพาะมุมสตูดิโอ: layer 1) ---------- */
const camRig = new THREE.Group();
const camHead = new THREE.Group();
const camTripod = new THREE.Group();
(() => {
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5, metalness: 0.4 });
  const acc = new THREE.MeshBasicMaterial({ color: 0xe0222b });
  const add = (geo, mat, x, y, z, parent = camHead) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); parent.add(o); return o; };
  add(new THREE.BoxGeometry(0.15, 0.16, 0.28), dark, 0, 0, 0.08);
  const lens = add(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 20), dark, 0, 0, -0.14);
  lens.rotation.x = Math.PI / 2;
  add(new THREE.BoxGeometry(0.2, 0.14, 0.03), dark, 0, 0, -0.26);
  add(new THREE.BoxGeometry(0.152, 0.02, 0.06), acc, 0, 0.09, 0.12);
  add(new THREE.BoxGeometry(0.1, 0.07, 0.01), acc, 0.11, 0.06, 0.18).rotation.y = 0.6;
  camRig.add(camHead, camTripod);
  scene.add(camRig);
})();
const tripodMat = new THREE.LineBasicMaterial({ color: 0x6a6a6a });
const frustumMat = new THREE.LineBasicMaterial({ color: 0xe0222b, transparent: true, opacity: 0.85 });
const frustumOutlineMat = new THREE.LineBasicMaterial({ color: 0xe0222b });
const frustumGroup = new THREE.Group();
scene.add(frustumGroup);
const setLayer1 = (o) => o.traverse((c) => c.layers.set(1));

/* ---------- วางกล้อง/นักแสดง + คำนวณสิ่งที่อยู่ในเฟรม ---------- */
const raycaster = new THREE.Raycaster();
let cover = { wall: 0, floor: 0, out: 0, centerDist: 0 };

function fovs() {
  const s = sensor();
  return { h: 2 * Math.atan(s.w / (2 * P.lens)), v: 2 * Math.atan(s.h / (2 * P.lens)), aspect: s.w / s.h };
}

function hitAt(ndcX, ndcY) {
  raycaster.setFromCamera({ x: ndcX, y: ndcY }, vcam);
  const hit = raycaster.intersectObject(wallFront, false)[0];
  const r = raycaster.ray;
  const tFloor = r.direction.y < -1e-6 ? -r.origin.y / r.direction.y : Infinity;
  if (hit && hit.distance < tFloor) return { type: 'wall', p: hit.point, d: hit.distance };
  if (tFloor < 200) return { type: 'floor', p: r.at(tFloor, new THREE.Vector3()), d: tFloor };
  return null;
}

function placeCamera() {
  const f = fovs();
  vcam.fov = f.v / DEG;
  vcam.aspect = f.aspect;
  vcam.updateProjectionMatrix();
  vcam.position.set(P.camX, P.camH, wallCenter.z + P.camDist);
  vcam.rotation.set(P.tilt * DEG, -P.pan * DEG, 0);
  vcam.updateMatrixWorld();

  camRig.position.copy(vcam.position);
  camHead.rotation.set(P.tilt * DEG, -P.pan * DEG, 0, 'YXZ');
  // ขาตั้งสามขา
  disposeGroup(camTripod);
  const tp = [];
  for (let k = 0; k < 3; k++) {
    const a = -P.pan * DEG + k * (Math.PI * 2 / 3) + Math.PI / 6;
    tp.push(0, -0.1, 0, Math.sin(a) * 0.45, -P.camH, Math.cos(a) * 0.45);
  }
  const tg = new THREE.BufferGeometry();
  tg.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3));
  camTripod.add(new THREE.LineSegments(tg, tripodMat));
  setLayer1(camRig);

  talent.visible = P.talent;
  talent.position.set(0, 0, wallCenter.z + P.talentDist);

  // ขอบเฟรมที่ตกบนจอ/พื้น + เส้นจากกล้อง
  disposeGroup(frustumGroup);
  if (wallFront && P.frustum) {
    const N = 40, border = [];
    for (let i = 0; i < N; i++) border.push([-1 + (2 * i) / N, 1]);
    for (let i = 0; i < N; i++) border.push([1, 1 - (2 * i) / N]);
    for (let i = 0; i < N; i++) border.push([1 - (2 * i) / N, -1]);
    for (let i = 0; i < N; i++) border.push([-1, -1 + (2 * i) / N]);
    const hits = border.map(([x, y]) => hitAt(x, y));
    const op = [];
    hits.forEach((h, i) => {
      const n = hits[(i + 1) % hits.length];
      if (h && n) op.push(h.p.x, h.p.y + 0.003, h.p.z + 0.003, n.p.x, n.p.y + 0.003, n.p.z + 0.003);
    });
    const og = new THREE.BufferGeometry();
    og.setAttribute('position', new THREE.Float32BufferAttribute(op, 3));
    frustumGroup.add(new THREE.LineSegments(og, frustumOutlineMat));
    const rp = [], o = vcam.position;
    [[-1, 1], [1, 1], [1, -1], [-1, -1]].forEach(([x, y]) => {
      const h = hitAt(x, y);
      raycaster.setFromCamera({ x, y }, vcam);
      const end = h ? h.p : raycaster.ray.at(12, new THREE.Vector3());
      rp.push(o.x, o.y, o.z, end.x, end.y, end.z);
    });
    const rg = new THREE.BufferGeometry();
    rg.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3));
    frustumGroup.add(new THREE.LineSegments(rg, frustumMat));
    setLayer1(frustumGroup);
  }

  // สัดส่วนในเฟรม (สุ่มตัวอย่างเป็นกริด)
  if (wallFront) {
    const GX = 36, GY = 20;
    let w = 0, fl = 0, out = 0;
    for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) {
      const h = hitAt(-1 + (2 * i + 1) / GX, -1 + (2 * j + 1) / GY);
      if (!h) out++; else if (h.type === 'wall') w++; else fl++;
    }
    const n = GX * GY;
    const c = hitAt(0, 0);
    cover = { wall: (w / n) * 100, floor: (fl / n) * 100, out: (out / n) * 100, centerDist: c && c.type === 'wall' ? c.d : P.camDist };
  }
  renderStats();
  invalidate();
}

/* ================= RENDER ================= */
let CW = 1, CH = 1, needs = true;
const invalidate = () => { needs = true; };
const wrap = $('simWrap');

function resize() {
  const r = wrap.getBoundingClientRect();
  CW = Math.max(1, r.width); CH = Math.max(1, r.height);
  renderer.setSize(CW, CH, false);
  layoutCamHud();
  invalidate();
}
new ResizeObserver(resize).observe(wrap);

function letterbox(aspect) {
  let w = CW, h = CW / aspect;
  if (h > CH) { h = CH; w = CH * aspect; }
  return { x: (CW - w) / 2, y: (CH - h) / 2, w, h };
}
function layoutCamHud() {
  const b = letterbox(fovs().aspect);
  const hudEl = $('camHud');
  hudEl.style.setProperty('--fx', b.x + 'px');
  hudEl.style.setProperty('--fy', b.y + 'px');
  hudEl.querySelectorAll('span').forEach((s) => {
    s.style.margin = `${b.y}px ${b.x}px`;
  });
  $('monitor').style.aspectRatio = String(fovs().aspect);
}

function renderTo(cam, x, y, w, h) {
  // y ของ WebGL นับจากล่าง
  const yy = CH - y - h;
  renderer.setViewport(x, yy, w, h);
  renderer.setScissor(x, yy, w, h);
  renderer.render(scene, cam);
}

function render() {
  reflector.visible = P.reflect;
  floorMat.opacity = P.reflect ? 0.86 : 1;
  renderer.setScissorTest(true);
  if (P.view === 'studio') {
    studioCam.aspect = CW / CH; studioCam.updateProjectionMatrix();
    renderTo(studioCam, 0, 0, CW, CH);
    const m = $('monitor').getBoundingClientRect(), c = canvas.getBoundingClientRect();
    renderTo(vcam, m.left - c.left + 1, m.top - c.top + 1, m.width - 2, m.height - 2);
  } else {
    renderer.setViewport(0, 0, CW, CH); renderer.setScissor(0, 0, CW, CH);
    renderer.setClearColor(0x000000); renderer.clear();
    const b = letterbox(vcam.aspect);
    renderTo(vcam, b.x, b.y, b.w, b.h);
  }
}

function loop(now = performance.now()) {
  requestAnimationFrame(loop);
  if (controls.update()) needs = true;
  if (tickGif(now)) needs = true;
  if (tickWallActor(now)) needs = true;
  if (!needs) return;
  needs = false;
  render();
}
controls.addEventListener('change', invalidate);

function frameStudio() {
  const { wallW, wallH, mount } = WI;
  const tz = wallCenter.z + P.camDist * 0.4;
  controls.target.set(0, (mount + wallH) * 0.4, tz);
  const span = Math.max(wallW, P.camDist + 2, wallH * 2);
  const dir = new THREE.Vector3(0.75, 0.55, 1).normalize();
  // จอแคบ (มือถือ) ต้องถอยกล้องออกให้เห็นทั้งจอ
  const narrow = Math.max(1, 1.6 / (CW / CH));
  studioCam.position.copy(controls.target).addScaledVector(dir, span * 1.05 * narrow);
  controls.update();
  invalidate();
}

function snapshot() {
  const f = fovs();
  const w = 1920, h = Math.round(w / f.aspect);
  const pr = renderer.getPixelRatio();
  renderer.setPixelRatio(1);
  renderer.setSize(w, h, false);
  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, w, h);
  reflector.visible = P.reflect;
  renderer.render(scene, vcam);
  const url = canvas.toDataURL('image/png');
  renderer.setPixelRatio(pr);
  resize();
  render();
  const a = document.createElement('a');
  a.href = url; a.download = `vp-sim_${P.lens}mm.png`;
  document.body.appendChild(a); a.click(); a.remove();
  toast(t('toast.shot'));
}

/* ================= UI ================= */
function applyLang() {
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $('metaDesc').content = t('meta.desc');
  setSeg('langSeg', LANG);
}
function setSeg(id, v) { document.querySelectorAll(`#${id} button`).forEach((b) => b.classList.toggle('on', b.dataset.v === v)); }

function syncInputs() {
  setSeg('fitSeg', P.fit); setSeg('viewTabs', P.view);
  $('bright').value = P.bright; $('brightOut').textContent = P.bright + '%';
  $('seams').checked = P.seams; $('pixelTrue').checked = P.pixelTrue;
  $('lens').value = P.lens; $('lensRange').value = clamp(P.lens, 12, 200);
  $('sensor').value = P.sensor;
  ['camDist', 'camH', 'camX', 'pan', 'talentDist'].forEach((k) => { $(k).value = P[k]; });
  $('tilt').value = P.tilt; $('tiltRange').value = clamp(P.tilt, -30, 30);
  $('talent').checked = P.talent; $('reflect').checked = P.reflect; $('frustum').checked = P.frustum;
  document.querySelectorAll('#samples button').forEach((b) => b.classList.toggle('on', isSample && b.dataset.s === P.sample));
  document.querySelectorAll('#lensPresets button').forEach((b) => b.classList.toggle('on', Number(b.dataset.l) === P.lens));
  $('dropName').textContent = sourceName ? '▸ ' + sourceName : '';
  const camMain = P.view === 'camera';
  wrap.classList.toggle('cam-main', camMain);
  $('monitor').hidden = camMain;
  $('camHud').hidden = !camMain;
  $('viewerHint').hidden = camMain;
  controls.enabled = !camMain;
}

function renderWallCard() {
  const w = WI;
  $('wallCard').innerHTML = `
    <div><div class="lbl">${t('w.size')}</div><div class="val">${fmt(w.wallW, 2)} × ${fmt(w.wallH, 2)} m</div></div>
    <div><div class="lbl">${t('w.res')}</div><div class="val">${fmt(w.W)} × ${fmt(w.H)}</div></div>
    <div><div class="lbl">${t('w.cab')}</div><div class="val">${w.cols} × ${w.rows} · ${w.s.pitchId === 'custom' ? fmtAuto(w.pitchX, 2) + ' mm' : w.s.pitchId}</div></div>
    <div><div class="lbl">${t('w.shape')}</div><div class="val">${w.curved ? t('w.curve', fmtAuto(w.total, 1)) : t('w.flat')}</div></div>`;
  $('wallSrc').textContent = '▸ ' + t('src.' + wall.src);
  const href = 'led-wall.html#' + encodeWall(wall.s);
  $('btnEditWall').href = href; $('btnConfig').href = href;
}

function renderStats() {
  if (!WI) return;
  const w = WI, f = fovs(), items = [];
  const st = (lbl, val, sub = '', cls = '', extra = '') =>
    items.push(`<div class="stat ${cls}"><div class="lbl">${lbl}</div><div class="val">${val}</div>${sub ? `<div class="sub">${sub}</div>` : ''}${extra}</div>`);

  st(t('st.wall'), `${fmt(w.W)} × ${fmt(w.H)} px`, `${fmt(w.wallW, 2)} × ${fmt(w.wallH, 2)} m · ${fmtAuto(w.pitchX, 3)} mm`);
  if (source) {
    const iw = source.naturalWidth || source.width, ih = source.naturalHeight || source.height;
    const up = P.fit === 'cover' ? Math.max(w.W / iw, w.H / ih) : P.fit === 'contain' ? Math.min(w.W / iw, w.H / ih) : Math.max(w.W / iw, w.H / ih);
    if (isSample) st(t('st.img'), `${fmt(iw)} × ${fmt(ih)} px`, t('st.sample'));
    else st(t('st.img'), `${fmt(iw)} × ${fmt(ih)} px`, up > 1.05 ? t('st.imgUp', fmtAuto(up, 2)) : t('st.imgOk'), up > 1.05 ? 'warn' : 'ok');
  }
  st(t('st.fov'), `${fmtAuto(f.h / DEG, 1)}° × ${fmtAuto(f.v / DEG, 1)}°`, `${P.lens} mm · ${sensor().n}`);
  const outWarn = cover.out > 0.5;
  st(t('st.frame'), outWarn ? t('st.frameWarn') : t('st.frameOk'),
    t('st.frameSub', fmtAuto(cover.wall, 0), fmtAuto(cover.floor, 0), fmtAuto(cover.out, 0)), outWarn ? 'warn' : 'ok',
    `<div class="seg3"><i style="width:${cover.wall}%;background:var(--accent)"></i><i style="width:${cover.floor}%;background:var(--silver3)"></i><i style="width:${cover.out}%;background:var(--warn)"></i></div>`);
  const frameW = 2 * cover.centerDist * Math.tan(f.h / 2);
  const ledPx = (frameW * 1000) / w.pitchX;
  st(t('st.ledpx'), `${fmt(ledPx)} px`, `${t('st.ledpxSub', fmtAuto(frameW, 2))} · ${ledPx < 3840 ? t('st.ledpxLow') : t('st.ledpxOk')}`, ledPx < 3840 ? 'warn' : 'ok');
  const minD = w.pitchX, bestD = w.pitchX * 3;
  st(t('st.dist'), `${fmtAuto(P.camDist, 2)} m`, P.camDist < minD ? t('st.distWarn') : t('st.distSub', fmtAuto(minD, 1), fmtAuto(bestD, 1)), P.camDist < minD ? 'warn' : P.camDist >= bestD ? 'ok' : '');
  if (P.talent) {
    const behind = P.talentDist >= P.camDist, near = P.talentDist < 1.5;
    st(t('st.talent'), `${fmtAuto(P.talentDist, 2)} m`, behind ? t('st.talentWarn') : near ? t('st.talentNear') : t('st.talentOk'), behind || near ? 'warn' : 'ok');
  }
  $('stats').innerHTML = items.join('');

  $('hud').textContent = t('hud.studio', fmtAuto(P.camDist, 1), P.lens);
  $('monLens').textContent = `${P.lens}MM · H${fmtAuto(f.h / DEG, 1)}°`;
  $('camHudTr').textContent = `${P.lens}MM · ${sensor().n.toUpperCase()}`;
  $('camHudBl').textContent = `D ${fmtAuto(P.camDist, 1)}M · H ${fmtAuto(P.camH, 2)}M · PAN ${fmtAuto(P.pan, 1)}° · TILT ${fmtAuto(P.tilt, 1)}°`;
}

function setWall(next, reframe) {
  wall = next; WI = wallInfo(wall.s);
  buildWall(); placeCamera(); renderWallCard();
  if (reframe) frameStudio();
}

let toastT;
function toast(msg) {
  const el = $('toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200);
}

function bind() {
  $('sensor').innerHTML = SENSORS.map((s) => `<option value="${s.id}">${s.n} — ${s.w} × ${s.h} mm</option>`).join('');

  $('langSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b || b.dataset.v === LANG) return;
    LANG = b.dataset.v;
    try { localStorage.setItem('ledwall-lang', LANG); } catch (err) { /* ignore */ }
    applyLang(); renderWallCard(); renderStats();
  });
  $('viewTabs').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    P.view = b.dataset.v; syncInputs(); layoutCamHud(); invalidate(); save();
  });
  $('fitSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    P.fit = b.dataset.v; syncInputs(); paintTexture(); save();
  });
  $('samples').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    useSample(b.dataset.s);
  });
  $('bright').addEventListener('input', (e) => {
    P.bright = clamp(num(e.target.value, 100), 20, 150); $('brightOut').textContent = P.bright + '%';
    updateLightColors(); invalidate(); save();
  });
  $('seams').addEventListener('change', (e) => { P.seams = e.target.checked; if (seamLines) seamLines.visible = P.seams; invalidate(); save(); });
  $('pixelTrue').addEventListener('change', (e) => { P.pixelTrue = e.target.checked; paintTexture(); save(); });

  const camInput = (id, key, lo, hi, after) => $(id).addEventListener('input', (e) => {
    const v = num(e.target.value, NaN); if (!Number.isFinite(v)) return;
    P[key] = clamp(v, lo, hi);
    if (after) after();
    placeCamera(); layoutCamHud(); save();
  });
  camInput('lens', 'lens', 8, 400, () => { $('lensRange').value = clamp(P.lens, 12, 200); syncLensChips(); });
  camInput('lensRange', 'lens', 8, 400, () => { $('lens').value = P.lens; syncLensChips(); });
  camInput('camDist', 'camDist', 0.5, 60);
  camInput('camH', 'camH', 0.1, 15);
  camInput('camX', 'camX', -50, 50);
  camInput('pan', 'pan', -90, 90);
  camInput('tilt', 'tilt', -60, 60, () => { $('tiltRange').value = clamp(P.tilt, -30, 30); });
  camInput('tiltRange', 'tilt', -60, 60, () => { $('tilt').value = P.tilt; });
  camInput('talentDist', 'talentDist', 0.3, 40);
  function syncLensChips() { document.querySelectorAll('#lensPresets button').forEach((b) => b.classList.toggle('on', Number(b.dataset.l) === P.lens)); }
  $('lensPresets').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    P.lens = Number(b.dataset.l); syncInputs(); placeCamera(); save();
  });
  $('sensor').addEventListener('change', (e) => { P.sensor = e.target.value; placeCamera(); layoutCamHud(); save(); });
  ['talent', 'reflect', 'frustum'].forEach((k) => $(k).addEventListener('change', (e) => { P[k] = e.target.checked; placeCamera(); save(); }));

  $('btnShot').addEventListener('click', snapshot);
  $('btnReloadWall').addEventListener('click', () => {
    history.replaceState(null, '', location.pathname + location.search);
    setWall(readWall(), true);
    toast(t('toast.wall'));
  });
  // Configurator เปิดอยู่อีกแท็บ → อัปเดตตามทันที
  window.addEventListener('storage', (e) => {
    if (e.key !== 'ledwall-state' || !e.newValue) return;
    history.replaceState(null, '', location.pathname + location.search);
    setWall(readWall(), false);
    toast(t('toast.wallLive'));
  });

  // อัปโหลด / ลากวาง / วางจากคลิปบอร์ด
  $('file').addEventListener('change', (e) => { loadFile(e.target.files[0]); e.target.value = ''; });
  const drop = $('drop');
  const hasFile = (e) => e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files');
  [drop, wrap].forEach((el) => {
    el.addEventListener('dragover', (e) => { if (!hasFile(e)) return; e.preventDefault(); el.classList.add('over'); });
    el.addEventListener('dragleave', (e) => { if (!el.contains(e.relatedTarget)) el.classList.remove('over'); });
    el.addEventListener('drop', (e) => {
      if (!hasFile(e)) return;
      e.preventDefault(); el.classList.remove('over');
      loadFile(e.dataTransfer.files[0]);
    });
  });
  window.addEventListener('paste', (e) => {
    const item = Array.from((e.clipboardData && e.clipboardData.items) || []).find((i) => i.type.startsWith('image/'));
    if (item) { e.preventDefault(); loadFile(item.getAsFile()); }
  });

  canvas.addEventListener('dblclick', () => { if (P.view === 'studio') frameStudio(); });
}

/* ================= INIT ================= */
applyLang();
bind();
if (!restoreImage()) {
  P.sample = P.sample || 'sunset';
  source = makeSample(P.sample);
} else isSample = false;
// Test pattern วาดตัวอักษรบน canvas — รอฟอนต์โหลดแล้ววาดใหม่ ไม่งั้นจะได้ฟอนต์สำรอง
if (document.fonts) {
  Promise.all(['700 100px "Space Grotesk"', '500 24px "JetBrains Mono"'].map((f) => document.fonts.load(f))).then(() => {
    if (isSample && (P.sample === 'bars' || P.sample === 'nosignal')) { source = makeSample(P.sample); paintTexture(); }
  }).catch(() => {});
}
syncInputs();
resize();
setWall(wall, true);
loop();
