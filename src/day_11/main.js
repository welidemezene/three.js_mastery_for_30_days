import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

// 1. SETUP
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Sharpness
document.body.appendChild(renderer.domElement);
document.body.style.margin = 0;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// -----------------------------------------------------------
// 2. THE ADVANCED SHADERS
// -----------------------------------------------------------

const vertexShader = `
    uniform float uTime;
    
    // Control variables for the wave shape
    uniform float uBigWavesElevation;
    uniform vec2 uBigWavesFrequency;
    uniform float uBigWavesSpeed;
    uniform float uSmallWavesElevation;
    uniform float uSmallWavesFrequency;
    uniform float uSmallWavesSpeed;
    uniform float uSmallIterations;

    varying float vElevation;
    varying vec3 vViewPosition;

    // A Pseudo-Random function (The "Noise" Generator)
    // Returns a random number between 0.0 and 1.0 based on a coordinate
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // Perlin-like Noise function
    float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);

        // --- PHASE 1: BIG WAVES (The Swell) ---
        float elevation = sin(modelPosition.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) * 
                          sin(modelPosition.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) * 
                          uBigWavesElevation;

        // --- PHASE 2: SMALL WAVES (The Texture) ---
        // We use a loop (FBM - Fractal Brownian Motion) to add layers of detail
        for(float i = 1.0; i <= uSmallIterations; i++) {
            // "abs" makes the waves sharp (crests)
            // We multiply frequency by i (make it smaller)
            // We divide elevation by i (make it shorter)
            elevation -= abs(noise(vec2(modelPosition.xz * uSmallWavesFrequency * i + uTime * uSmallWavesSpeed)) * uSmallWavesElevation / i); 
        }
        
        modelPosition.y += elevation;
        vElevation = elevation;

        // Calculate view position for the fragment shader (Lighting)
        vec4 viewPosition = viewMatrix * modelPosition;
        gl_Position = projectionMatrix * viewPosition;
        
        vViewPosition = viewPosition.xyz;
    }
`;

const fragmentShader = `
    uniform vec3 uColorDeep;
    uniform vec3 uColorSurface;
    uniform vec3 uColorFoam;
    uniform vec3 uLightPosition; // The Sun
    
    varying float vElevation;
    varying vec3 vViewPosition;

    void main() {
        // ------------------------------------
        // 1. RE-CALCULATE NORMALS (The Diamond Trick)
        // ------------------------------------
        vec3 x = dFdx(vViewPosition);
        vec3 y = dFdy(vViewPosition);
        vec3 normal = normalize(cross(x, y));

        // ------------------------------------
        // 2. LIGHTING (Blinn-Phong Model)
        // ------------------------------------
        
        // A. Diffuse (Base Lighting)
        // We normalize light pos relative to the view position
        vec3 viewDirection = normalize(-vViewPosition);
        vec3 lightDirection = normalize(uLightPosition); // Fixed sun direction
        
        // Dot product: How much is the face looking at the sun?
        float diffuse = max(0.0, dot(normal, lightDirection));

        // B. Specular (The Shininess/Reflection)
        // Reflect the light off the surface
        vec3 reflectionDirection = reflect(-lightDirection, normal);
        // Is the reflection hitting the camera (viewDirection)?
        float specular = pow(max(0.0, dot(viewDirection, reflectionDirection)), 16.0); // 16.0 is shininess

        // ------------------------------------
        // 3. COLOR MIXING
        // ------------------------------------
        
        // Base mix based on height
        float mixStrength = (vElevation * 3.0) + 0.5;
        mixStrength = clamp(mixStrength, 0.0, 1.0);
        vec3 color = mix(uColorDeep, uColorSurface, mixStrength);

        // Add Lighting
        vec3 lightColor = vec3(1.0); // Sun is white
        
        // Combine: Color * Diffuse + White * Specular
        vec3 finalColor = color * (diffuse + 0.3) + (lightColor * specular * 0.5);

        // Foam Tip (If elevation is very high)
        if(vElevation > 0.15) {
            finalColor = mix(finalColor, uColorFoam, 0.5);
        }

        gl_FragColor = vec4(finalColor, 1.0);
        
        // Debug: Uncomment to see normals
        // gl_FragColor = vec4(normal, 1.0); 
    }
`;

// -----------------------------------------------------------
// 3. THE OBJECT & GUI
// -----------------------------------------------------------

const debugObject = {
    colorDeep: '#002b59',
    colorSurface: '#1982c4',
    colorFoam: '#ffffff',
    uBigWavesElevation: 0.2,
    uBigWavesFrequencyX: 4.0,
    uBigWavesFrequencyY: 1.5,
    uBigWavesSpeed: 0.75,
    uSmallWavesElevation: 0.15,
    uSmallWavesFrequency: 3.0,
    uSmallWavesSpeed: 0.2,
    uSmallIterations: 4.0,
};

const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
    extensions: { derivatives: true }, // ESSENTIAL
    uniforms: {
        uTime: { value: 0 },
        uColorDeep: { value: new THREE.Color(debugObject.colorDeep) },
        uColorSurface: { value: new THREE.Color(debugObject.colorSurface) },
        uColorFoam: { value: new THREE.Color(debugObject.colorFoam) },
        
        uBigWavesElevation: { value: debugObject.uBigWavesElevation },
        uBigWavesFrequency: { value: new THREE.Vector2(debugObject.uBigWavesFrequencyX, debugObject.uBigWavesFrequencyY) },
        uBigWavesSpeed: { value: debugObject.uBigWavesSpeed },
        
        uSmallWavesElevation: { value: debugObject.uSmallWavesElevation },
        uSmallWavesFrequency: { value: debugObject.uSmallWavesFrequency },
        uSmallWavesSpeed: { value: debugObject.uSmallWavesSpeed },
        uSmallIterations: { value: debugObject.uSmallIterations },
        
        uLightPosition: { value: new THREE.Vector3(1, 1, 0) } 
    }
});

const geometry = new THREE.PlaneGeometry(4, 4, 128, 128); // High resolution required!
const water = new THREE.Mesh(geometry, material);
water.rotation.x = -Math.PI * 0.5;
scene.add(water);

// GUI Setup
const gui = new GUI({ width: 340 });
const waveFolder = gui.addFolder('🌊 Wave Physics');
waveFolder.add(material.uniforms.uBigWavesElevation, 'value').min(0).max(1).name('Big Height');
waveFolder.add(material.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).name('Freq X');
waveFolder.add(material.uniforms.uBigWavesSpeed, 'value').min(0).max(4).name('Big Speed');
waveFolder.add(material.uniforms.uSmallWavesElevation, 'value').min(0).max(1).name('Small Ripples');
waveFolder.add(material.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).name('Ripple Freq');
waveFolder.add(material.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).name('Ripple Speed');

const colorFolder = gui.addFolder('🎨 Colors & Light');
colorFolder.addColor(debugObject, 'colorDeep').onChange(c => material.uniforms.uColorDeep.value.set(c));
colorFolder.addColor(debugObject, 'colorSurface').onChange(c => material.uniforms.uColorSurface.value.set(c));

// -----------------------------------------------------------
// 4. ANIMATION LOOP
// -----------------------------------------------------------
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();
    material.uniforms.uTime.value = elapsedTime;
    
    // Animate Light Position nicely
    material.uniforms.uLightPosition.value.x = Math.sin(elapsedTime * 0.5);
    material.uniforms.uLightPosition.value.z = Math.cos(elapsedTime * 0.5);

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();