// Rừng Xanh — engine/camera.js: camera thứ 3 theo sau chú bé
import * as THREE from 'three';

export function taoCamera() {
  return {
    gocXoay: 0,          // yaw quanh nhân vật (điều khiển bằng vuốt/chuột)
    khoangCach: 7.5,
    caoDo: 3.4,
    _hienTai: new THREE.Vector3(),
  };
}

export function capNhatCamera(cam, camera, mucTieu, dt) {
  // Vị trí mong muốn: sau lưng nhân vật theo gocXoay
  const x = mucTieu.x - Math.sin(cam.gocXoay) * cam.khoangCach;
  const z = mucTieu.z - Math.cos(cam.gocXoay) * cam.khoangCach;
  const y = mucTieu.y + cam.caoDo;

  cam._hienTai.set(x, y, z);
  camera.position.lerp(cam._hienTai, Math.min(1, dt * 6));
  camera.lookAt(mucTieu.x, mucTieu.y + 1.4, mucTieu.z);
}
