// Rừng Xanh — main.js: bootstrap, game loop
import * as THREE from 'three';
import { taoMay } from './engine/may.js';
import { taoChuBe, capNhatNhanVat } from './engine/nhan-vat.js';
import { taoCamera, capNhatCamera } from './engine/camera.js';
import { taoRungTre } from './the-gioi/rung-tre.js';
import { taoHUD, taoDieuKhien } from './ui/hud.js';

const bar = document.getElementById('loadbar');
const setTienTrinh = (p) => { if (bar) bar.style.width = Math.round(p * 100) + '%'; };

async function khoiDong() {
  setTienTrinh(0.15);
  const app = document.getElementById('app');
  const may = taoMay(app);
  const { renderer, scene, camera } = may;
  setTienTrinh(0.35);

  const rung = taoRungTre(scene);
  setTienTrinh(0.6);

  const chuBe = taoChuBe(scene);
  const cam = taoCamera();
  setTienTrinh(0.8);

  const hud = taoHUD();
  const input = taoDieuKhien();
  hud.datMau(100);
  hud.datTui(0);
  setTienTrinh(1);

  document.getElementById('loading').style.display = 'none';

  const clock = new THREE.Clock();

  function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);

    input.docPhim();
    if (input._xoayDelta) {
      cam.gocXoay -= input._xoayDelta;
      input._xoayDelta = 0;
    }

    capNhatNhanVat(chuBe, input, dt, cam.gocXoay);
    capNhatCamera(cam, camera, chuBe.pos, dt);

    // Đốm sáng nhấp nháy nhẹ
    const t = performance.now() * 0.001;
    if (rung.domGroup.children.length > 0) {
      rung.domGroup.children[0].material.opacity = 0.28 + Math.sin(t * 1.5) * 0.1;
    }

    renderer.render(scene, camera);
  }
  loop();
}

khoiDong().catch((e) => {
  console.error('Lỗi khởi động:', e);
  const l = document.getElementById('loading');
  if (l) l.innerHTML = '<div>Lỗi tải game 😢</div><div style="font-size:12px">' + e.message + '</div>';
});
