import * as THREE from 'three';

// ---------------- Basic Setup ----------------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = '0';
document.body.appendChild(renderer.domElement);

// ---------------- Lights ----------------
const hemi = new THREE.HemisphereLight(0xeef8ff, 0x101020, 0.6);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(5, 10, 7);
scene.add(dir);

// ---------------- Geometry ----------------
const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(1.2, 32, 32),
  new THREE.MeshStandardMaterial({
    emissive: 0xffff66,
    emissiveIntensity: 1.0
  })
);

const earthMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.6, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x2a6eff })
);

const moonMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.25, 24, 24),
  new THREE.MeshStandardMaterial({ color: 0xbebebe })
);

// ---------------- Group Logic ----------------
const solarSystem = new THREE.Group();
scene.add(solarSystem);

solarSystem.add(sunMesh);

// Earth orbit pivot (centered at Sun)
const earthOrbitGroup = new THREE.Group();
solarSystem.add(earthOrbitGroup);

// Earth is moved outwards from its pivot
earthOrbitGroup.add(earthMesh);
earthMesh.position.set(4, 0, 0);

// Moon orbit pivot (must be located at Earth's position)
const moonOrbitPivot = new THREE.Group();
earthOrbitGroup.add(moonOrbitPivot);

// ⭐ THE MOST IMPORTANT FIX:
moonOrbitPivot.position.set(4, 0, 0); // pivot must sit at Earth

// Moon moved outward from its pivot
moonMesh.position.set(1.2, 0, 0);
moonOrbitPivot.add(moonMesh);

// ---------------- Animation ----------------
const speeds = {
  solarSystemOrbit: 0.01,
  earthSpin: 0.04,
  moonOrbit: 0.03
};

function animate() {
  requestAnimationFrame(animate);

  earthOrbitGroup.rotation.y += speeds.solarSystemOrbit;
  earthMesh.rotation.y += speeds.earthSpin;
  moonOrbitPivot.rotation.y += speeds.moonOrbit;

  renderer.render(scene, camera);
}
animate();
