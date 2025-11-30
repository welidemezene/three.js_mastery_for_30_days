import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// FIX 1: Correct Import Name
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'; 

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
document.body.appendChild(renderer.domElement);
document.body.style.margin = 0;

const controls = new OrbitControls(camera, renderer.domElement);

// FIX 2: Use a working URL first to verify code logic
const hdrUrl = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/blue_photo_studio_1k.hdr';

// FIX 3: Use RGBELoader
const loader = new RGBELoader();
loader.load(hdrUrl, function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping; 
    scene.background = texture;
    scene.environment = texture;
    
    // Debug: Log to verify it loaded
    console.log("HDR Loaded successfully");
});

// Objects
const geometry = new THREE.SphereGeometry(0.5, 32, 32);

for(let i = 0; i <= 4; i++) {
    const material = new THREE.MeshStandardMaterial({
        color: 0xffaa00, 
        metalness: 1,     
        roughness: i / 4 
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = (i - 2) * 1.2;
    scene.add(mesh);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();