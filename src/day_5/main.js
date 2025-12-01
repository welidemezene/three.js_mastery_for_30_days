import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
document.body.style.margin = 0;

const controls = new OrbitControls(camera, renderer.domElement);

// 2. Load Texture (We use an online debug texture to be safe)
const textureLoader = new THREE.TextureLoader();
const uvTexture = textureLoader.load('https://threejs.org/examples/textures/uv_grid_opengl.jpg');

// EXPERT SETTINGS:
// By default, textures blur when zoomed in (LinearFilter).
// For pixel art or sharp lines, use NearestFilter.
uvTexture.minFilter = THREE.NearestFilter;
uvTexture.magFilter = THREE.NearestFilter;

// 3. The Object
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ 
    map: uvTexture // <--- Apply the texture here
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// 4. Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // ---------------------------------------------
    // TEXTURE MANIPULATION (The Magic)
    // ---------------------------------------------
    
    // A. Sliding (Offset)
    // Moving the texture while the box stays still
    // uvTexture.offset.x = time * 0.1; 
    
    // B. Scaling (Repeat)
    // Show the image 2 times horizontally, 2 times vertically
    // uvTexture.repeat.set(2, 2);
    // uvTexture.wrapS = THREE.RepeatWrapping; // Tell it to tile (don't stretch)
    // uvTexture.wrapT = THREE.RepeatWrapping;
    
    // C. Rotation (Center pivot)
    // uvTexture.center.set(0.5, 0.5); // Rotate around center, not corner
    // uvTexture.rotation = Math.sin(time) * 0.5;

    controls.update();
    renderer.render(scene, camera);
}
animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});