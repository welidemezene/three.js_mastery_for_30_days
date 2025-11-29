import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 5); // Moved camera up a bit

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
document.body.style.margin = 0

const controls = new OrbitControls(camera, renderer.domElement);

// --- THE CHALLENGE: WAVING PLANE ---
// 10, 10 means we have plenty of vertices to move
const geometry = new THREE.PlaneGeometry(5, 5, 20, 20); 
const material = new THREE.MeshBasicMaterial({ 
    color: 0x00ffcc, // Cyan color
    wireframe: true, // Wireframe looks cooler for this!
    side: THREE.DoubleSide 
});
const mesh = new THREE.Mesh(geometry, material);
// Rotate flat so it looks like a floor
mesh.rotation.x = -Math.PI / 2; 
scene.add(mesh);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // 1. Get the raw positions
    const positionAttribute = geometry.attributes.position;
    const positions = positionAttribute.array;

    // 2. Loop through vertices
    // i jumps by 3 because each vertex is (x, y, z)
    for(let i = 0; i < positions.length; i += 3) {
        const x = positions[i]; // x coordinate
        // positions[i+1] is y, but since we rotated the mesh, 
        // local Z (positions[i+2]) acts as the "height" of the wave.
        
        // The Wave Formula: Z = sin(x + time)
        positions[i + 2] = Math.sin(x * 2 + time * 2) * 0.5;
    }

    // 3. TELL THE GPU TO UPDATE
    positionAttribute.needsUpdate = true;

    controls.update();
    renderer.render(scene, camera);
}

animate();