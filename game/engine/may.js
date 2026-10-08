// Rừng Xanh — engine/may.js: Three.js scene, renderer, ánh sáng, sương
import * as THREE from 'three';

export function taoMay(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87b5a0);
  scene.fog = new THREE.Fog(0x9fc8a8, 25, 90);

  const camera = new THREE.PerspectiveCamera(
    55, window.innerWidth / window.innerHeight, 0.1, 300
  );
  camera.position.set(0, 4, 8);

  // Ánh sáng mặt trời xuyên tán lá
  const sun = new THREE.DirectionalLight(0xfff2cc, 2.2);
  sun.position.set(18, 30, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -30;
  sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 30;
  sun.shadow.camera.bottom = -30;
  sun.shadow.camera.far = 90;
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  // Ánh sáng môi trường xanh mát
  const hemi = new THREE.HemisphereLight(0xbfe3c0, 0x2d4a33, 0.9);
  scene.add(hemi);

  // Đốm sáng xuyên tán (god-ray giả bằng sprite sáng)
  const may = { renderer, scene, camera, sun, hemi };

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return may;
}
