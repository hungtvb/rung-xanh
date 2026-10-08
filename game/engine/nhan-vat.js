// Rừng Xanh — engine/nhan-vat.js: chú bé (capsule + đầu), di chuyển WASD/joystick
import * as THREE from 'three';

export function taoChuBe(scene) {
  const group = new THREE.Group();

  // Thân: áo bà ba nâu
  const thanMat = new THREE.MeshStandardMaterial({ color: 0x8b5e3c, roughness: 0.9 });
  const than = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.7, 6, 12), thanMat);
  than.position.y = 0.85;
  than.castShadow = true;
  group.add(than);

  // Đầu
  const daMat = new THREE.MeshStandardMaterial({ color: 0xf1c27d, roughness: 0.8 });
  const dau = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16), daMat);
  dau.position.y = 1.62;
  dau.castShadow = true;
  group.add(dau);

  // Nón lá đội đầu
  const nonMat = new THREE.MeshStandardMaterial({ color: 0xd9b77c, roughness: 1, side: THREE.DoubleSide });
  const non = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.28, 16, 1, true), nonMat);
  non.position.y = 1.86;
  non.castShadow = true;
  group.add(non);

  // Chân đơn giản
  const chanMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.9 });
  const chanT = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.35, 4, 8), chanMat);
  chanT.position.set(-0.14, 0.28, 0);
  const chanP = chanT.clone();
  chanP.position.x = 0.14;
  chanT.castShadow = chanP.castShadow = true;
  group.add(chanT, chanP);

  // Tay
  const tayT = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.4, 4, 8), thanMat);
  tayT.position.set(-0.44, 1.0, 0);
  const tayP = tayT.clone();
  tayP.position.x = 0.44;
  tayT.castShadow = tayP.castShadow = true;
  group.add(tayT, tayP);

  scene.add(group);

  const nv = {
    group, chanT, chanP, tayT, tayP,
    pos: new THREE.Vector3(0, 0, 6),
    huong: 0,            // góc quay (radian)
    tocDo: 0,
    tocDoMucTieu: 0,
    dangChay: false,
    _buocPhase: 0,
  };
  group.position.copy(nv.pos);
  return nv;
}

// input: {x: -1..1 (trái/phải màn hình), z: -1..1 (trước/sau màn hình), chay: bool}
// yawCamera: góc xoay camera (để input tương đối theo hướng nhìn)
export function capNhatNhanVat(nv, input, dt, yawCamera = 0) {
  const TOC_DO_DI = 3.2;
  const TOC_DO_CHAY = 5.5;
  const tocDoMax = input.chay ? TOC_DO_CHAY : TOC_DO_DI;

  const ix = input.x || 0;
  const iz = input.z || 0;
  const coDi = Math.abs(ix) > 0.08 || Math.abs(iz) > 0.08;

  nv.tocDoMucTieu = coDi ? tocDoMax : 0;
  nv.tocDo += (nv.tocDoMucTieu - nv.tocDo) * Math.min(1, dt * 8);

  if (coDi) {
    // Hướng di chuyển tương đối theo camera
    const s = Math.sin(yawCamera), c = Math.cos(yawCamera);
    const dx = iz * s - ix * c;
    const dz = iz * c + ix * s;
    const gocMucTieu = Math.atan2(dx, dz);
    let d = gocMucTieu - nv.huong;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    nv.huong += d * Math.min(1, dt * 10);
  }

  // Di chuyển
  nv.pos.x += Math.sin(nv.huong) * nv.tocDo * dt;
  nv.pos.z += Math.cos(nv.huong) * nv.tocDo * dt;
  // Giới hạn map
  const R = 42;
  const dist = Math.hypot(nv.pos.x, nv.pos.z);
  if (dist > R) {
    nv.pos.x *= R / dist;
    nv.pos.z *= R / dist;
  }

  nv.group.position.copy(nv.pos);
  nv.group.rotation.y = nv.huong;

  // Animation chân tay đơn giản (đánh theo bước đi)
  nv._buocPhase += dt * nv.tocDo * 2.4;
  const bienDo = Math.min(1, nv.tocDo / TOC_DO_DI) * 0.5;
  const s = Math.sin(nv._buocPhase);
  nv.chanT.position.z = s * bienDo;
  nv.chanP.position.z = -s * bienDo;
  nv.tayT.position.z = -s * bienDo * 0.7;
  nv.tayP.position.z = s * bienDo * 0.7;
  // Nhún nhẹ khi chạy
  nv.group.position.y = nv.pos.y + Math.abs(Math.cos(nv._buocPhase)) * 0.04 * Math.min(1, nv.tocDo / 3);
}
