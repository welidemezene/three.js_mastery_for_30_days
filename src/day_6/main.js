import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(window.devicePixelRatio ?? 1);
document.body.appendChild(renderer.domElement);
document.body.style.margin = 0
const controls = new OrbitControls(camera, renderer.domElement);

// Create a textured sphere with a canvas texture (so we can paint)
const canvas = document.createElement('canvas');
canvas.width = 2048; canvas.height = 1024; // good resolution for sphere
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width, canvas.height);
ctx.fillStyle = '#888'; ctx.fillRect(canvas.width*0.45, canvas.height*0.45, 300, 200); // sample mark

const canvasTexture = new THREE.CanvasTexture(canvas);
canvasTexture.needsUpdate = true;

const material = new THREE.MeshStandardMaterial({ map: canvasTexture, metalness:0.0, roughness:1 });
const geo = new THREE.SphereGeometry(1, 64, 32); // built-in has UVs
const sphere = new THREE.Mesh(geo, material);
scene.add(sphere);

// Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5,5,5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040, 0.5));

// Raycaster + mouse (NDC)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const hittable = [sphere];

let prevIntersect = null; // track hover

// Mouse move -> update NDC
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Click -> use the current ray-per-click and paint if uv exists
window.addEventListener('click', (e) => {
  // ensure current mouse is used: setFromCamera uses NDC mouse
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(hittable, true);
  if (hits.length > 0) {
    const hit = hits[0];
    console.log('3D point', hit.point);
    if (hit.uv) {
      console.log('uv', hit.uv.x, hit.uv.y);
      // Convert uv to pixel coords on our canvas (y is flipped)
      const u = hit.uv.x, v = hit.uv.y;
      const px = Math.floor(u * canvas.width);
      const py = Math.floor((1 - v) * canvas.height); // flip v -> canvas Y
      paintDot(px, py);
    } else {
      console.warn('No UV on hit geometry');
    }
  }
});

// Paint helper: draws a small logo/dot and updates texture
function paintDot(x, y) {
  ctx.fillStyle = 'rgba(255,0,0,0.9)';
  ctx.beginPath();
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.fill();
  canvasTexture.needsUpdate = true;
}

// Animation loop with optimized hover enter/leave
function animate() {
  requestAnimationFrame(animate);

  // rotate a bit so it's obvious
  sphere.rotation.y += 0.004;

  // Raycast for hover
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(hittable, true);
  if (hits.length > 0) {
    const obj = hits[0].object;
    if (prevIntersect !== obj) { // enter
      if (prevIntersect) prevIntersect.material.emissive.set(0x000000); // clear old
      obj.material.emissive.set(0x333322); // highlight
      prevIntersect = obj;
    }
  } else {
    if (prevIntersect) {
      prevIntersect.material.emissive.set(0x000000); // leave
      prevIntersect = null;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize handler (keep NDC correct)
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
