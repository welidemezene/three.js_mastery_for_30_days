import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. SETUP
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111); // Dark background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 2.5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
document.body.style.margin = 0;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// -----------------------------------------------------------
// 2. THE NOISE LIBRARY (The Magic Block)
// -----------------------------------------------------------
// GLSL is strictly math. It doesn't have a built-in noise function.
// We must inject this mathematical recipe (Simplex Noise) into our shader string.
const noiseGLSL = `
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
        i = mod289(i);
        vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857; // 1.0/7.0
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                      dot(p2,x2), dot(p3,x3) ) );
    }
`;

// -----------------------------------------------------------
// 3. THE SHADER LOGIC
// -----------------------------------------------------------

const vertexShader = `
    uniform float uTime;
    varying float vNoise;
    varying vec3 vNormal;

    ${noiseGLSL} // Injecting the library

    void main() {
        vNormal = normal;

        // --- EXPERT SECTION: FBM (Fractal Brownian Motion) ---
        // We don't just use one noise. We layer them.
        
        // Layer 1: The General Shape (Low Freq, High Amp)
        float noise1 = snoise(position * 1.5 + uTime * 0.2) * 0.5;
        
        // Layer 2: The Details (High Freq, Low Amp)
        float noise2 = snoise(position * 4.0 + uTime * 0.4) * 0.1;

        // Combine them
        float combinedNoise = noise1 + noise2;
        
        // DISPLACEMENT
        // Move the vertex along the normal vector
        vec3 newPos = position + (normal * combinedNoise);

        // Send noise to fragment to colorize the peaks/valleys
        vNoise = combinedNoise;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
`;

const fragmentShader = `
    varying float vNoise;
    varying vec3 vNormal;

    void main() {
        // 1. Color Palette
        vec3 purple = vec3(0.3, 0.0, 0.6);
        vec3 orange = vec3(1.0, 0.3, 0.1);
        vec3 white = vec3(1.0, 1.0, 1.0);

        // 2. Mix based on Noise
        // Map noise (-0.5 to 0.5) to (0.0 to 1.0)
        float mixStrength = vNoise * 2.0 + 0.5; 
        
        vec3 finalColor = mix(purple, orange, mixStrength);

        // 3. Add simple lighting
        // Fake light from top-right
        vec3 lightPos = normalize(vec3(1.0, 1.0, 1.0));
        float light = max(0.0, dot(vNormal, lightPos));

        // Combine color + light + slight ambient glow
        gl_FragColor = vec4(finalColor * (light + 0.3), 1.0);
    }
`;

// -----------------------------------------------------------
// 4. THE OBJECT
// -----------------------------------------------------------
// We need LOTS of vertices to make the noise look smooth
const geometry = new THREE.IcosahedronGeometry(1, 100); 

const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTime: { value: 0 }
    },
    // wireframe: true // Uncomment to see the mesh deform
});

const blob = new THREE.Mesh(geometry, material);
scene.add(blob);

// -----------------------------------------------------------
// 5. ANIMATION
// -----------------------------------------------------------
const clock = new THREE.Clock();

function animate() {
    const time = clock.getElapsedTime();
    material.uniforms.uTime.value = time;
    
    // Slow rotation
    blob.rotation.y = time * 0.1;
    
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});