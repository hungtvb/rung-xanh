// Rừng Xanh — the-gioi/rung-tre.js: đất, 100 cây tre InstancedMesh, bụi cỏ, đốm sáng
import * as THREE from 'three';

function rand(min, max) {
  return min + Math.random() * (max - min);
}

export function taoRungTre(scene) {
  const R = 45; // bán kính rừng

  // --- Mặt đất: xanh rêu, hơi gồ ghề ---
  const datGeo = new THREE.CircleGeometry(R + 8, 48);
  const datMat = new THREE.MeshStandardMaterial({ color: 0x3d6b35, roughness: 1 });
  const dat = new THREE.Mesh(datGeo, datMat);
  dat.rotation.x = -Math.PI / 2;
  dat.receiveShadow = true;
  // Gồ ghề nhẹ bằng vertex displacement
  const pos = datGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const d = Math.hypot(x, y);
    if (d > 2) pos.setZ(i, Math.sin(x * 0.4) * Math.cos(y * 0.35) * 0.35 * Math.min(1, d / 10));
  }
  datGeo.computeVertexNormals();
  scene.add(dat);

  // --- Đường mòn đất ---
  const monGeo = new THREE.PlaneGeometry(3.2, R * 1.6, 1, 24);
  const monMat = new THREE.MeshStandardMaterial({ color: 0x9a7b4f, roughness: 1 });
  const mon = new THREE.Mesh(monGeo, monMat);
  mon.rotation.x = -Math.PI / 2;
  mon.position.set(0, 0.03, -6);
  mon.receiveShadow = true;
  scene.add(mon);

  // --- Cây tre: thân cylinder + khóm lá, InstancedMesh ---
  const SO_CAY = 120;
  const thanGeo = new THREE.CylinderGeometry(0.09, 0.13, 7, 7);
  thanGeo.translate(0, 3.5, 0);
  const thanMat = new THREE.MeshStandardMaterial({ color: 0x7fb069, roughness: 0.85 });
  const thanIM = new THREE.InstancedMesh(thanGeo, thanMat, SO_CAY);
  thanIM.castShadow = true;
  thanIM.receiveShadow = true;

  // Lá tre: cụm 3 mặt phẳng chéo ở ngọn
  const laGeo = new THREE.ConeGeometry(1.5, 2.6, 6);
  laGeo.translate(0, 7.6, 0);
  const laMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.9, flatShading: true });
  const laIM = new THREE.InstancedMesh(laGeo, laMat, SO_CAY);
  laIM.castShadow = true;

  const dummy = new THREE.Object3D();
  const cayViTri = [];
  let dem = 0;
  let guard = 0;
  while (dem < SO_CAY && guard++ < 4000) {
    const a = Math.random() * Math.PI * 2;
    const r = 6 + Math.random() * (R - 6);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    // Tránh đường mòn (|x| < 2.8, z trong đoạn đường) và tránh điểm spawn (0,6)
    if (Math.abs(x) < 2.8 && z > -42 && z < 30) continue;
    if (Math.hypot(x, z - 6) < 3) continue;
    const cao = rand(0.8, 1.25);
    const goc = Math.random() * Math.PI * 2;
    dummy.position.set(x, 0, z);
    dummy.rotation.set(rand(-0.04, 0.04), goc, rand(-0.04, 0.04));
    dummy.scale.setScalar(cao);
    dummy.updateMatrix();
    thanIM.setMatrixAt(dem, dummy.matrix);
    laIM.setMatrixAt(dem, dummy.matrix);
    cayViTri.push({ x, z });
    dem++;
  }
  thanIM.count = dem;
  laIM.count = dem;
  thanIM.instanceMatrix.needsUpdate = true;
  laIM.instanceMatrix.needsUpdate = true;
  scene.add(thanIM, laIM);

  // --- Bụi cỏ thấp ---
  const coGeo = new THREE.ConeGeometry(0.22, 0.7, 5);
  coGeo.translate(0, 0.35, 0);
  const coMat = new THREE.MeshStandardMaterial({ color: 0x52a675, roughness: 1 });
  const coIM = new THREE.InstancedMesh(coGeo, coMat, 220);
  for (let i = 0; i < 220; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * R;
    dummy.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    dummy.rotation.set(0, Math.random() * Math.PI, 0);
    dummy.scale.setScalar(rand(0.7, 1.6));
    dummy.updateMatrix();
    coIM.setMatrixAt(i, dummy.matrix);
  }
  coIM.instanceMatrix.needsUpdate = true;
  scene.add(coIM);

  // --- Đốm sáng xuyên tán lá (sprite additive) ---
  const domTex = taoDomSangTexture();
  const domMat = new THREE.SpriteMaterial({
    map: domTex, color: 0xfff6c9, transparent: true,
    opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const domGroup = new THREE.Group();
  for (let i = 0; i < 26; i++) {
    const sp = new THREE.Sprite(domMat);
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * (R - 4);
    sp.position.set(Math.cos(a) * r, rand(0.5, 5), Math.sin(a) * r);
    sp.scale.setScalar(rand(0.8, 2.2));
    domGroup.add(sp);
  }
  scene.add(domGroup);

  return { cayViTri, domGroup };
}

function taoDomSangTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}
