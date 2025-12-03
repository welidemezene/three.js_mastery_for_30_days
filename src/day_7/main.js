import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 1. Import the GUI
import GUI from 'lil-gui'; 

// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Helpers (Expert Move: Always visualize axes)
// Red = X, Green = Y, Blue = Z
const axesHelper = new THREE.AxesHelper(3); 
scene.add(axesHelper);

// Object (The "Ball")
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshStandardMaterial({ 
    color: 0xff0000,
    roughness: 0.5,
    metalness: 0.5
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

// PointLight Helper (See where the light is)
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.5);
scene.add(pointLightHelper);

// ------------------------------------------------
// 3. THE DEBUG PANEL (LIL-GUI)
// ------------------------------------------------
const gui = new GUI();

// A. Tweak Material
const matFolder = gui.addFolder('Golf Ball Material');
matFolder.add(material, 'roughness', 0, 1, 0.01); // min, max, step
matFolder.add(material, 'metalness', 0, 1, 0.01);
matFolder.add(material, 'wireframe');
matFolder.addColor(material, 'color'); // Special color picker

// B. Tweak Position
const posFolder = gui.addFolder('Position');
posFolder.add(mesh.position, 'x', -3, 3, 0.1);
posFolder.add(mesh.position, 'y', -3, 3, 0.1);
posFolder.add(mesh.position, 'z', -3, 3, 0.1);

// C. Tweak Light
const lightFolder = gui.addFolder('Lighting');
lightFolder.add(pointLight, 'intensity', 0, 10, 0.1);
// When we move the light, update the helper
lightFolder.add(pointLight.position, 'x', -5, 5).onChange(() => pointLightHelper.update());

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();