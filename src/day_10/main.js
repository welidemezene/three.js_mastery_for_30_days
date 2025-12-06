import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
document.body.style.margin = 0; // Remove default margin

const controls = new OrbitControls(camera, renderer.domElement);

// -----------------------------------------------------------
// 2. THE SHADERS (The Expert Logic)
// -----------------------------------------------------------

const vertexShader = `
    uniform float uTime;
    
    // We send UVs to fragment (for mapping)
    varying vec2 vUv;
    // We send Height to fragment (for coloring)
    varying float vElevation;

    void main() {
        vUv = uv;

        vec3 newPos = position;
        
        // WAVE MATH
        float elevation = sin(newPos.x * 2.0 + uTime) * 0.5;
        elevation += sin(newPos.y * 3.0 + uTime) * 0.2;
        
        newPos.z += elevation;

        // Pass calculated height to the Fragment Shader
        vElevation = elevation;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
`;

const fragmentShader = `
    // Receive data from Vertex Shader
    varying float vElevation;

    void main() {
        // 1. Define Colors
        vec3 deepColor = vec3(0.0, 0.1, 0.4); // Dark Blue
        vec3 surfColor = vec3(0.0, 0.8, 1.0); // Light Cyan
// Multiply by 5 to create 5 "bands"
// 'fract' keeps only the decimal part (0.1, 0.2... 0.9, 0.0) -> Repeating pattern
float mixStrength = fract(vElevation * 5.0); 
// float mixStrength = step(0.2, vElevation);

// float mixStrength = fract(vElevation * 10.0);

// OR use step for a hard cutoff (Ice vs Water)
// float mixStrength = step(0.1, vElevation);
        // 3. The "Mix" Function (Crucial Expert Function)
        // linearly interpolates between Color A and Color B based on strength
        vec3 finalColor = mix(deepColor, surfColor, mixStrength);

       gl_FragColor = vec4(finalColor,1.0);
    }
`;

// -----------------------------------------------------------
// 3. THE OBJECT
// -----------------------------------------------------------

const geometry = new THREE.PlaneGeometry(5, 5, 64, 64); // More segments = smoother

const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
        uTime: { value: 0 }
    }
});

const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// -----------------------------------------------------------
// 4. LOOP
// -----------------------------------------------------------

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    material.uniforms.uTime.value = clock.getElapsedTime();
    controls.update();
    renderer.render(scene, camera);
}
animate();