// Rừng Xanh — ui/hud.js: thanh máu, túi đồ, joystick cảm ứng
export function taoHUD() {
  const hud = document.createElement('div');
  hud.id = 'hud';
  hud.innerHTML = `
    <div id="hud-top">
      <div class="hud-mau"><div class="hud-mau-fill" id="mau-fill"></div><span id="mau-so">100</span></div>
      <div class="hud-ngay">☀️ Ngày 1 · Sáng</div>
      <div class="hud-tui">🎒 <span id="tui-so">0</span>/20</div>
    </div>
    <div id="joystick"><div id="joy-nut"></div></div>
    <div id="nut-chay">🏃</div>
  `;
  document.body.appendChild(hud);

  const style = document.createElement('style');
  style.textContent = `
    #hud { position:fixed; inset:0; pointer-events:none; z-index:10; font-family:system-ui,sans-serif; }
    #hud-top { position:absolute; top:calc(8px + env(safe-area-inset-top)); left:12px; right:12px; display:flex; align-items:center; gap:10px; }
    .hud-mau { position:relative; width:130px; height:20px; background:rgba(0,0,0,.45); border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,.25); }
    .hud-mau-fill { height:100%; width:100%; background:linear-gradient(90deg,#e63946,#ff6b6b); border-radius:10px; transition:width .25s; }
    .hud-mau span { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#fff; text-shadow:0 1px 2px #000; }
    .hud-ngay { flex:1; text-align:center; color:#fff; font-size:13px; font-weight:600; text-shadow:0 1px 3px #000; }
    .hud-tui { color:#fff; font-size:13px; font-weight:600; text-shadow:0 1px 3px #000; background:rgba(0,0,0,.35); padding:4px 10px; border-radius:12px; }
    #joystick { position:absolute; left:22px; bottom:calc(26px + env(safe-area-inset-bottom)); width:110px; height:110px; border-radius:50%; background:rgba(255,255,255,.12); border:2px solid rgba(255,255,255,.3); pointer-events:auto; display:none; }
    #joy-nut { position:absolute; left:50%; top:50%; width:48px; height:48px; border-radius:50%; background:rgba(255,255,255,.45); transform:translate(-50%,-50%); }
    #nut-chay { position:absolute; right:26px; bottom:calc(36px + env(safe-area-inset-bottom)); width:62px; height:62px; border-radius:50%; background:rgba(255,255,255,.15); border:2px solid rgba(255,255,255,.35); display:none; align-items:center; justify-content:center; font-size:26px; pointer-events:auto; }
    body.cam-ung #joystick { display:block; }
    body.cam-ung #nut-chay { display:flex; }
    body.cam-ung #nut-chay.dang-chay { background:rgba(116,198,157,.5); }
  `;
  document.head.appendChild(style);

  return {
    datMau(v) {
      document.getElementById('mau-fill').style.width = Math.max(0, v) + '%';
      document.getElementById('mau-so').textContent = Math.round(Math.max(0, v));
    },
    datTui(n) {
      document.getElementById('tui-so').textContent = n;
    },
  };
}

// Trả về input {x, z, chay}; tự gắn joystick + phím
export function taoDieuKhien() {
  const input = { x: 0, z: 0, chay: false };
  const phim = {};

  window.addEventListener('keydown', (e) => {
    phim[e.code] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => { phim[e.code] = false; });

  const laCamUng = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (laCamUng) document.body.classList.add('cam-ung');

  // Joystick
  const joy = document.getElementById('joystick');
  const nut = document.getElementById('joy-nut');
  let joyId = null;
  let joyCX = 0, joyCY = 0;

  function joyStart(e) {
    const t = e.changedTouches[0];
    joyId = t.identifier;
    const r = joy.getBoundingClientRect();
    joyCX = r.left + r.width / 2;
    joyCY = r.top + r.height / 2;
    e.preventDefault();
  }
  function joyMove(e) {
    for (const t of e.changedTouches) {
      if (t.identifier !== joyId) continue;
      let dx = (t.clientX - joyCX) / 45;
      let dy = (t.clientY - joyCY) / 45;
      const len = Math.hypot(dx, dy);
      if (len > 1) { dx /= len; dy /= len; }
      input.x = dx;
      input.z = -dy;
      nut.style.transform = `translate(calc(-50% + ${dx * 30}px), calc(-50% + ${dy * 30}px))`;
      e.preventDefault();
    }
  }
  function joyEnd(e) {
    for (const t of e.changedTouches) {
      if (t.identifier !== joyId) continue;
      joyId = null;
      input.x = 0; input.z = 0;
      nut.style.transform = 'translate(-50%,-50%)';
    }
  }
  if (joy) {
    joy.addEventListener('touchstart', joyStart, { passive: false });
    window.addEventListener('touchmove', joyMove, { passive: false });
    window.addEventListener('touchend', joyEnd);
    window.addEventListener('touchcancel', joyEnd);
  }

  // Nút chạy
  const nutChay = document.getElementById('nut-chay');
  if (nutChay) {
    nutChay.addEventListener('touchstart', (e) => {
      input.chay = !input.chay;
      nutChay.classList.toggle('dang-chay', input.chay);
      e.preventDefault();
    }, { passive: false });
  }

  // Xoay camera bằng vuốt nửa phải màn hình
  let xoayId = null, xoayX = 0;
  window.addEventListener('touchstart', (e) => {
    for (const t of e.changedTouches) {
      if (t.clientX > window.innerWidth * 0.45 && xoayId === null && t.identifier !== joyId) {
        xoayId = t.identifier;
        xoayX = t.clientX;
      }
    }
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === xoayId) {
        input._xoayDelta = (input._xoayDelta || 0) + (t.clientX - xoayX) * 0.008;
        xoayX = t.clientX;
      }
    }
  }, { passive: true });
  const ketThucXoay = (e) => {
    for (const t of e.changedTouches) if (t.identifier === xoayId) xoayId = null;
  };
  window.addEventListener('touchend', ketThucXoay);
  window.addEventListener('touchcancel', ketThucXoay);

  // Đọc phím mỗi frame
  input.docPhim = () => {
    if (joyId !== null) return; // đang dùng joystick
    let x = 0, z = 0;
    if (phim['KeyA'] || phim['ArrowLeft']) x -= 1;
    if (phim['KeyD'] || phim['ArrowRight']) x += 1;
    if (phim['KeyW'] || phim['ArrowUp']) z += 1;
    if (phim['KeyS'] || phim['ArrowDown']) z -= 1;
    input.x = x;
    input.z = z;
    input.chay = !!(phim['ShiftLeft'] || phim['ShiftRight']);
  };

  return input;
}
