// import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GUI } from 'lil-gui';

// // ============================================
// // 1. STORM SIMULATION CONFIGURATION
// // ============================================
// const STORM_CONFIG = {
//     // Wave System 1: Primary Swell (Big, rolling waves)
//     wave1: {
//         amplitude: 0.5,
//         frequency: 2.0,
//         speed: 1.0,
//         direction: new THREE.Vector2(1.0, 0.0), // Pure X direction
//         wavelength: 3.0,
//         active: true,
//         color: new THREE.Color(0xff0000) // Visualize with red
//     },
    
//     // Wave System 2: Secondary Chop (Smaller, choppy waves)
//     wave2: {
//         amplitude: 0.3,
//         frequency: 3.0,
//         speed: 1.5,
//         direction: new THREE.Vector2(0.0, 1.0), // Pure Y direction
//         wavelength: 2.0,
//         active: true,
//         color: new THREE.Color(0x00ff00) // Visualize with green
//     },
    
//     // Wave System 3: Cross Swell (Diagonal interference)
//     wave3: {
//         amplitude: 0.2,
//         frequency: 4.0,
//         speed: 0.8,
//         direction: new THREE.Vector2(0.7, 0.7).normalize(), // Diagonal
//         wavelength: 1.5,
//         active: false,
//         color: new THREE.Color(0x0000ff) // Visualize with blue
//     },
    
//     // Combined Effects
//     interference: {
//         mode: 'add', // 'add', 'multiply', or 'complex'
//         turbulence: 0.0, // Additional randomness
//         choppiness: 1.0 // Wave sharpness
//     },
    
//     // Visualization
//     visualization: {
//         showWireframe: false,
//         showWaveComponents: true, // Show individual waves as colors
//         showNormals: false,
//         showGrid: true,
//         showVectors: true
//     },
    
//     // Scene
//     planeSize: 10,
//     segments: 64
// };

// // ============================================
// // 2. STORMY OCEAN CLASS
// // ============================================
// class StormyOcean {
//     constructor() {
//         this.scene = new THREE.Scene();
//         this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
//         this.renderer = new THREE.WebGLRenderer({ antialias: true });
//         this.clock = new THREE.Clock();
//         this.time = 0;
        
//         this.oceanPlane = null;
//         this.wave1Mesh = null;
//         this.wave2Mesh = null;
//         this.wave3Mesh = null;
        
//         this.init();
//         this.createVisualHelpers();
//         this.createGUI();
//     }
    
//     init() {
//         // Setup renderer
//         this.renderer.setSize(window.innerWidth, window.innerHeight);
//         this.renderer.setClearColor(0x111122);
//         document.body.appendChild(this.renderer.domElement);
//         document.body.style.margin = '0';
//         document.body.style.overflow = 'hidden';
        
//         // Setup camera
//         this.camera.position.set(8, 8, 8);
//         this.controls = new OrbitControls(this.camera, this.renderer.domElement);
//         this.controls.enableDamping = true;
        
//         // Add lighting
//         const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
//         this.scene.add(ambientLight);
        
//         const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
//         directionalLight.position.set(5, 10, 5);
//         this.scene.add(directionalLight);
        
//         // Create the stormy ocean
//         this.createStormOcean();
        
//         // Add grid helper
//         const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
//         this.scene.add(gridHelper);
        
//         // Create coordinate axes
//         const axesHelper = new THREE.AxesHelper(5);
//         this.scene.add(axesHelper);
//     }
    
//     createStormOcean() {
//         // Create geometry with high resolution for smooth waves
//         const geometry = new THREE.PlaneGeometry(
//             STORM_CONFIG.planeSize,
//             STORM_CONFIG.planeSize,
//             STORM_CONFIG.segments,
//             STORM_CONFIG.segments
//         );
        
//         // ============================================
//         // THE CORE STORM SHADER
//         // ============================================
//         const vertexShader = `
//             uniform float uTime;
            
//             // Wave 1 parameters (Swell)
//             uniform float uWave1Amplitude;
//             uniform float uWave1Frequency;
//             uniform float uWave1Speed;
//             uniform vec2 uWave1Direction;
            
//             // Wave 2 parameters (Chop)
//             uniform float uWave2Amplitude;
//             uniform float uWave2Frequency;
//             uniform float uWave2Speed;
//             uniform vec2 uWave2Direction;
            
//             // Wave 3 parameters (Cross)
//             uniform float uWave3Amplitude;
//             uniform float uWave3Frequency;
//             uniform float uWave3Speed;
//             uniform vec2 uWave3Direction;
            
//             // Interference parameters
//             uniform float uTurbulence;
//             uniform float uChoppiness;
//             uniform int uInterferenceMode;
            
//             // Visualization
//             uniform bool uShowWaveComponents;
            
//             varying vec3 vPosition;
//             varying vec2 vUv;
//             varying float vWave1Contribution;
//             varying float vWave2Contribution;
//             varying float vWave3Contribution;
//             varying float vTotalHeight;
            
//             // Function to calculate a single wave
//             float calculateWave(vec3 position, float amplitude, float frequency, 
//                                float speed, vec2 direction, float time) {
//                 // Calculate wave phase
//                 float phase = dot(direction, position.xy) * frequency + time * speed;
                
//                 // Return wave height
//                 return sin(phase) * amplitude;
//             }
            
//             void main() {
//                 vUv = uv;
//                 vPosition = position;
                
//                 // -------------------------------------------------
//                 // WAVE 1: THE SWELL (Big, rolling waves)
//                 // -------------------------------------------------
//                 vWave1Contribution = calculateWave(
//                     position,
//                     uWave1Amplitude,
//                     uWave1Frequency,
//                     uWave1Speed,
//                     uWave1Direction,
//                     uTime
//                 );
                
//                 // -------------------------------------------------
//                 // WAVE 2: THE CHOP (Smaller, choppy waves)
//                 // -------------------------------------------------
//                 vWave2Contribution = calculateWave(
//                     position,
//                     uWave2Amplitude,
//                     uWave2Frequency,
//                     uWave2Speed,
//                     uWave2Direction,
//                     uTime
//                 );
                
//                 // -------------------------------------------------
//                 // WAVE 3: THE CROSS SWELL (Diagonal interference)
//                 // -------------------------------------------------
//                 vWave3Contribution = calculateWave(
//                     position,
//                     uWave3Amplitude,
//                     uWave3Frequency,
//                     uWave3Speed,
//                     uWave3Direction,
//                     uTime
//                 );
                
//                 // -------------------------------------------------
//                 // WAVE INTERFERENCE - THE STORM EFFECT
//                 // -------------------------------------------------
//                 float totalHeight = 0.0;
                
//                 // MODE 1: ADDITIVE INTERFERENCE (Stormy Ocean)
//                 // Waves combine by adding together
//                 // This creates constructive/destructive interference
//                 if (uInterferenceMode == 0) {
//                     totalHeight = vWave1Contribution + vWave2Contribution + vWave3Contribution;
//                 }
                
//                 // MODE 2: MULTIPLICATIVE INTERFERENCE (Egg Carton)
//                 // Waves multiply together - creates checkerboard pattern
//                 else if (uInterferenceMode == 1) {
//                     totalHeight = vWave1Contribution * vWave2Contribution;
//                     if (uWave3Amplitude > 0.0) {
//                         totalHeight *= vWave3Contribution;
//                     }
//                 }
                
//                 // MODE 3: COMPLEX INTERFERENCE (Chaotic Storm)
//                 // Combination of additive and multiplicative
//                 else if (uInterferenceMode == 2) {
//                     float additivePart = (vWave1Contribution + vWave2Contribution) * 0.7;
//                     float multiplicativePart = vWave1Contribution * vWave2Contribution * 0.3;
//                     totalHeight = additivePart + multiplicativePart;
                    
//                     // Add some randomness for turbulence
//                     if (uTurbulence > 0.0) {
//                         float turbulence = sin(position.x * 10.0 + uTime * 2.0) * 
//                                          sin(position.y * 8.0 + uTime * 1.5) *
//                                          uTurbulence;
//                         totalHeight += turbulence;
//                     }
//                 }
                
//                 // Apply choppiness (makes waves sharper)
//                 totalHeight *= uChoppiness;
                
//                 vTotalHeight = totalHeight;
                
//                 // -------------------------------------------------
//                 // APPLY DISPLACEMENT
//                 // -------------------------------------------------
//                 vec3 displacedPosition = position;
//                 displacedPosition.z = totalHeight;
                
//                 // -------------------------------------------------
//                 // TRANSFORM TO SCREEN SPACE
//                 // -------------------------------------------------
//                 gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
//             }
//         `;
        
//         const fragmentShader = `
//             uniform vec3 uWave1Color;
//             uniform vec3 uWave2Color;
//             uniform vec3 uWave3Color;
//             uniform bool uShowWaveComponents;
            
//             varying vec3 vPosition;
//             varying vec2 vUv;
//             varying float vWave1Contribution;
//             varying float vWave2Contribution;
//             varying float vWave3Contribution;
//             varying float vTotalHeight;
            
//             // Function to map value from one range to another
//             float map(float value, float min1, float max1, float min2, float max2) {
//                 return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
//             }
            
//             void main() {
//                 // Normalize height to 0-1 range for coloring
//                 float normalizedHeight = (vTotalHeight + 1.0) * 0.5;
                
//                 if (uShowWaveComponents) {
//                     // -------------------------------------------------
//                     // VISUALIZE INDIVIDUAL WAVE CONTRIBUTIONS
//                     // -------------------------------------------------
//                     // Each wave gets a color channel
//                     float r = abs(vWave1Contribution) * 2.0; // Red for Wave 1
//                     float g = abs(vWave2Contribution) * 2.0; // Green for Wave 2
//                     float b = abs(vWave3Contribution) * 2.0; // Blue for Wave 3
                    
//                     // Base ocean color
//                     vec3 baseColor = vec3(0.0, 0.3, 0.6);
                    
//                     // Add wave contributions
//                     vec3 waveColors = vec3(r, g, b) * 0.5;
                    
//                     // Final color
//                     vec3 finalColor = baseColor + waveColors;
                    
//                     gl_FragColor = vec4(finalColor, 1.0);
//                 } else {
//                     // -------------------------------------------------
//                     // REALISTIC OCEAN COLORING
//                     // -------------------------------------------------
//                     // Deep water color
//                     vec3 deepColor = vec3(0.0, 0.1, 0.3);
                    
//                     // Shallow water color
//                     vec3 shallowColor = vec3(0.0, 0.5, 0.8);
                    
//                     // Foam color (for wave peaks)
//                     vec3 foamColor = vec3(1.0, 1.0, 1.0);
                    
//                     // Mix between deep and shallow based on height
//                     vec3 waterColor = mix(deepColor, shallowColor, normalizedHeight);
                    
//                     // Add foam at wave peaks
//                     float foamThreshold = 0.7;
//                     if (normalizedHeight > foamThreshold) {
//                         float foamAmount = (normalizedHeight - foamThreshold) / (1.0 - foamThreshold);
//                         waterColor = mix(waterColor, foamColor, foamAmount * 0.8);
//                     }
                    
//                     // Add lighting based on surface normal
//                     vec3 lightDir = normalize(vec3(1.0, 2.0, 1.0));
//                     float light = max(dot(normalize(vec3(0.0, 0.0, 1.0)), lightDir), 0.0);
//                     waterColor *= (0.7 + light * 0.3);
                    
//                     gl_FragColor = vec4(waterColor, 1.0);
//                 }
//             }
//         `;
        
//         const material = new THREE.ShaderMaterial({
//             vertexShader: vertexShader,
//             fragmentShader: fragmentShader,
//             side: THREE.DoubleSide,
//             uniforms: {
//                 // Time
//                 uTime: { value: 0 },
                
//                 // Wave 1 (Swell)
//                 uWave1Amplitude: { value: STORM_CONFIG.wave1.amplitude },
//                 uWave1Frequency: { value: STORM_CONFIG.wave1.frequency },
//                 uWave1Speed: { value: STORM_CONFIG.wave1.speed },
//                 uWave1Direction: { value: STORM_CONFIG.wave1.direction },
//                 uWave1Color: { value: STORM_CONFIG.wave1.color },
                
//                 // Wave 2 (Chop)
//                 uWave2Amplitude: { value: STORM_CONFIG.wave2.amplitude },
//                 uWave2Frequency: { value: STORM_CONFIG.wave2.frequency },
//                 uWave2Speed: { value: STORM_CONFIG.wave2.speed },
//                 uWave2Direction: { value: STORM_CONFIG.wave2.direction },
//                 uWave2Color: { value: STORM_CONFIG.wave2.color },
                
//                 // Wave 3 (Cross)
//                 uWave3Amplitude: { value: STORM_CONFIG.wave3.amplitude },
//                 uWave3Frequency: { value: STORM_CONFIG.wave3.frequency },
//                 uWave3Speed: { value: STORM_CONFIG.wave3.speed },
//                 uWave3Direction: { value: STORM_CONFIG.wave3.direction },
//                 uWave3Color: { value: STORM_CONFIG.wave3.color },
                
//                 // Interference
//                 uTurbulence: { value: STORM_CONFIG.interference.turbulence },
//                 uChoppiness: { value: STORM_CONFIG.interference.choppiness },
//                 uInterferenceMode: { value: 0 }, // 0=add, 1=multiply, 2=complex
                
//                 // Visualization
//                 uShowWaveComponents: { value: STORM_CONFIG.visualization.showWaveComponents }
//             },
//             wireframe: STORM_CONFIG.visualization.showWireframe
//         });
        
//         this.oceanPlane = new THREE.Mesh(geometry, material);
//         this.oceanPlane.rotation.x = -Math.PI / 2; // Lay flat
//         this.scene.add(this.oceanPlane);
//     }
    
//     createVisualHelpers() {
//         // Create individual wave visualization meshes (transparent overlays)
//         if (STORM_CONFIG.visualization.showWaveComponents) {
//             this.createWaveVisualization();
//         }
        
//         // Create vector visualization for wave directions
//         if (STORM_CONFIG.visualization.showVectors) {
//             this.createVectorVisualization();
//         }
//     }
    
//     createWaveVisualization() {
//         const geometry = new THREE.PlaneGeometry(STORM_CONFIG.planeSize, STORM_CONFIG.planeSize, 32, 32);
        
//         // Wave 1 visualization (red)
//         const wave1Material = new THREE.ShaderMaterial({
//             vertexShader: `
//                 uniform float uTime;
//                 uniform float uAmplitude;
//                 uniform float uFrequency;
//                 uniform float uSpeed;
//                 uniform vec2 uDirection;
                
//                 void main() {
//                     vec3 pos = position;
//                     float wave = sin(dot(uDirection, pos.xy) * uFrequency + uTime * uSpeed) * uAmplitude;
//                     pos.z = wave;
//                     gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
//                 }
//             `,
//             fragmentShader: `
//                 uniform vec3 uColor;
//                 void main() {
//                     gl_FragColor = vec4(uColor, 0.3);
//                 }
//             `,
//             uniforms: {
//                 uTime: { value: 0 },
//                 uAmplitude: { value: STORM_CONFIG.wave1.amplitude },
//                 uFrequency: { value: STORM_CONFIG.wave1.frequency },
//                 uSpeed: { value: STORM_CONFIG.wave1.speed },
//                 uDirection: { value: STORM_CONFIG.wave1.direction },
//                 uColor: { value: STORM_CONFIG.wave1.color }
//             },
//             transparent: true,
//             side: THREE.DoubleSide,
//             depthWrite: false
//         });
        
//         this.wave1Mesh = new THREE.Mesh(geometry, wave1Material);
//         this.wave1Mesh.rotation.x = -Math.PI / 2;
//         this.wave1Mesh.position.y = 0.01; // Slightly above ocean
//         this.scene.add(this.wave1Mesh);
        
//         // Wave 2 visualization (green)
//         const wave2Material = new THREE.ShaderMaterial({
//             vertexShader: `
//                 uniform float uTime;
//                 uniform float uAmplitude;
//                 uniform float uFrequency;
//                 uniform float uSpeed;
//                 uniform vec2 uDirection;
                
//                 void main() {
//                     vec3 pos = position;
//                     float wave = sin(dot(uDirection, pos.xy) * uFrequency + uTime * uSpeed) * uAmplitude;
//                     pos.z = wave;
//                     gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
//                 }
//             `,
//             fragmentShader: `
//                 uniform vec3 uColor;
//                 void main() {
//                     gl_FragColor = vec4(uColor, 0.3);
//                 }
//             `,
//             uniforms: {
//                 uTime: { value: 0 },
//                 uAmplitude: { value: STORM_CONFIG.wave2.amplitude },
//                 uFrequency: { value: STORM_CONFIG.wave2.frequency },
//                 uSpeed: { value: STORM_CONFIG.wave2.speed },
//                 uDirection: { value: STORM_CONFIG.wave2.direction },
//                 uColor: { value: STORM_CONFIG.wave2.color }
//             },
//             transparent: true,
//             side: THREE.DoubleSide,
//             depthWrite: false
//         });
        
//         this.wave2Mesh = new THREE.Mesh(geometry, wave2Material);
//         this.wave2Mesh.rotation.x = -Math.PI / 2;
//         this.wave2Mesh.position.y = 0.02; // Above wave 1
//         this.scene.add(this.wave2Mesh);
//     }
    
//     createVectorVisualization() {
//         // Create arrows showing wave directions
//         const origin = new THREE.Vector3(0, 0.1, 0);
        
//         // Wave 1 direction arrow (red)
//         const wave1Dir = new THREE.Vector3(
//             STORM_CONFIG.wave1.direction.x, 
//             0, 
//             STORM_CONFIG.wave1.direction.y
//         ).normalize().multiplyScalar(2);
        
//         const arrow1 = new THREE.ArrowHelper(
//             wave1Dir,
//             origin,
//             wave1Dir.length(),
//             STORM_CONFIG.wave1.color,
//             0.3,
//             0.15
//         );
//         this.scene.add(arrow1);
        
//         // Wave 2 direction arrow (green)
//         const wave2Dir = new THREE.Vector3(
//             STORM_CONFIG.wave2.direction.x, 
//             0, 
//             STORM_CONFIG.wave2.direction.y
//         ).normalize().multiplyScalar(2);
        
//         const arrow2 = new THREE.ArrowHelper(
//             wave2Dir,
//             origin,
//             wave2Dir.length(),
//             STORM_CONFIG.wave2.color,
//             0.3,
//             0.15
//         );
//         this.scene.add(arrow2);
//     }
    
//     createGUI() {
//         const gui = new GUI({ title: '🌊 Storm Controls', width: 350 });
        
//         // Wave 1 controls
//         const wave1Folder = gui.addFolder('Wave 1 - Swell (Red)');
//         wave1Folder.add(STORM_CONFIG.wave1, 'amplitude', 0, 2, 0.1)
//             .name('Amplitude')
//             .onChange(() => this.updateUniforms());
//         wave1Folder.add(STORM_CONFIG.wave1, 'frequency', 0.1, 10, 0.1)
//             .name('Frequency')
//             .onChange(() => this.updateUniforms());
//         wave1Folder.add(STORM_CONFIG.wave1, 'speed', 0, 3, 0.1)
//             .name('Speed')
//             .onChange(() => this.updateUniforms());
//         wave1Folder.add(STORM_CONFIG.wave1, 'active')
//             .name('Active')
//             .onChange(() => this.updateUniforms());
        
//         // Wave 2 controls
//         const wave2Folder = gui.addFolder('Wave 2 - Chop (Green)');
//         wave2Folder.add(STORM_CONFIG.wave2, 'amplitude', 0, 2, 0.1)
//             .name('Amplitude')
//             .onChange(() => this.updateUniforms());
//         wave2Folder.add(STORM_CONFIG.wave2, 'frequency', 0.1, 10, 0.1)
//             .name('Frequency')
//             .onChange(() => this.updateUniforms());
//         wave2Folder.add(STORM_CONFIG.wave2, 'speed', 0, 3, 0.1)
//             .name('Speed')
//             .onChange(() => this.updateUniforms());
//         wave2Folder.add(STORM_CONFIG.wave2, 'active')
//             .name('Active')
//             .onChange(() => this.updateUniforms());
        
//         // Wave 3 controls
//         const wave3Folder = gui.addFolder('Wave 3 - Cross (Blue)');
//         wave3Folder.add(STORM_CONFIG.wave3, 'amplitude', 0, 2, 0.1)
//             .name('Amplitude')
//             .onChange(() => this.updateUniforms());
//         wave3Folder.add(STORM_CONFIG.wave3, 'frequency', 0.1, 10, 0.1)
//             .name('Frequency')
//             .onChange(() => this.updateUniforms());
//         wave3Folder.add(STORM_CONFIG.wave3, 'active')
//             .name('Active')
//             .onChange(() => this.updateUniforms());
        
//         // Interference controls
//         const interferenceFolder = gui.addFolder('Wave Interference');
//         interferenceFolder.add(STORM_CONFIG.interference, 'turbulence', 0, 1, 0.1)
//             .name('Turbulence')
//             .onChange(() => this.updateUniforms());
//         interferenceFolder.add(STORM_CONFIG.interference, 'choppiness', 0.5, 2, 0.1)
//             .name('Choppiness')
//             .onChange(() => this.updateUniforms());
        
//         // Interference mode selector
//         const interferenceMode = {
//             mode: 'Additive (Storm)',
//             value: 0
//         };
        
//         interferenceFolder.add(interferenceMode, 'mode', [
//             'Additive (Storm)',
//             'Multiplicative (Egg Carton)',
//             'Complex (Chaotic)'
//         ]).onChange((value) => {
//             switch(value) {
//                 case 'Additive (Storm)': 
//                     interferenceMode.value = 0; 
//                     break;
//                 case 'Multiplicative (Egg Carton)': 
//                     interferenceMode.value = 1; 
//                     break;
//                 case 'Complex (Chaotic)': 
//                     interferenceMode.value = 2; 
//                     break;
//             }
//             if (this.oceanPlane) {
//                 this.oceanPlane.material.uniforms.uInterferenceMode.value = interferenceMode.value;
//             }
//         });
        
//         // Visualization controls
//         const visualFolder = gui.addFolder('Visualization');
//         visualFolder.add(STORM_CONFIG.visualization, 'showWaveComponents')
//             .name('Show Wave Components')
//             .onChange((value) => {
//                 if (this.oceanPlane) {
//                     this.oceanPlane.material.uniforms.uShowWaveComponents.value = value;
//                 }
//                 if (this.wave1Mesh) this.wave1Mesh.visible = value;
//                 if (this.wave2Mesh) this.wave2Mesh.visible = value;
//             });
        
//         visualFolder.add(STORM_CONFIG.visualization, 'showWireframe')
//             .name('Show Wireframe')
//             .onChange((value) => {
//                 if (this.oceanPlane) {
//                     this.oceanPlane.material.wireframe = value;
//                 }
//             });
        
//         // Presets
//         const presetsFolder = gui.addFolder('Presets');
//         presetsFolder.add({
//             calmOcean: () => this.applyPreset('calm'),
//             stormyOcean: () => this.applyPreset('storm'),
//             eggCarton: () => this.applyPreset('eggCarton'),
//             chaotic: () => this.applyPreset('chaotic')
//         }, 'calmOcean').name('Calm Ocean');
        
//         presetsFolder.add({
//             calmOcean: () => this.applyPreset('calm'),
//             stormyOcean: () => this.applyPreset('storm'),
//             eggCarton: () => this.applyPreset('eggCarton'),
//             chaotic: () => this.applyPreset('chaotic')
//         }, 'stormyOcean').name('Stormy Ocean');
        
//         presetsFolder.add({
//             calmOcean: () => this.applyPreset('calm'),
//             stormyOcean: () => this.applyPreset('storm'),
//             eggCarton: () => this.applyPreset('eggCarton'),
//             chaotic: () => this.applyPreset('chaotic')
//         }, 'eggCarton').name('Egg Carton');
        
//         presetsFolder.add({
//             calmOcean: () => this.applyPreset('calm'),
//             stormyOcean: () => this.applyPreset('storm'),
//             eggCarton: () => this.applyPreset('eggCarton'),
//             chaotic: () => this.applyPreset('chaotic')
//         }, 'chaotic').name('Chaotic Storm');
        
//         // Close folders by default
//         wave1Folder.close();
//         wave2Folder.close();
//         wave3Folder.close();
//         interferenceFolder.close();
//         visualFolder.close();
//         presetsFolder.close();
//     }
    
//     applyPreset(preset) {
//         switch(preset) {
//             case 'calm':
//                 STORM_CONFIG.wave1.amplitude = 0.2;
//                 STORM_CONFIG.wave1.frequency = 1.0;
//                 STORM_CONFIG.wave2.active = false;
//                 STORM_CONFIG.wave3.active = false;
//                 STORM_CONFIG.interference.turbulence = 0.0;
//                 break;
                
//             case 'storm':
//                 STORM_CONFIG.wave1.amplitude = 0.8;
//                 STORM_CONFIG.wave1.frequency = 2.0;
//                 STORM_CONFIG.wave2.amplitude = 0.4;
//                 STORM_CONFIG.wave2.frequency = 4.0;
//                 STORM_CONFIG.wave2.active = true;
//                 STORM_CONFIG.wave3.active = false;
//                 STORM_CONFIG.interference.turbulence = 0.3;
//                 break;
                
//             case 'eggCarton':
//                 STORM_CONFIG.wave1.amplitude = 0.5;
//                 STORM_CONFIG.wave1.frequency = 3.0;
//                 STORM_CONFIG.wave2.amplitude = 0.5;
//                 STORM_CONFIG.wave2.frequency = 3.0;
//                 STORM_CONFIG.wave2.active = true;
//                 STORM_CONFIG.wave3.active = false;
//                 if (this.oceanPlane) {
//                     this.oceanPlane.material.uniforms.uInterferenceMode.value = 1;
//                 }
//                 break;
                
//             case 'chaotic':
//                 STORM_CONFIG.wave1.amplitude = 0.6;
//                 STORM_CONFIG.wave1.frequency = 1.5;
//                 STORM_CONFIG.wave2.amplitude = 0.4;
//                 STORM_CONFIG.wave2.frequency = 3.0;
//                 STORM_CONFIG.wave3.amplitude = 0.3;
//                 STORM_CONFIG.wave3.frequency = 5.0;
//                 STORM_CONFIG.wave2.active = true;
//                 STORM_CONFIG.wave3.active = true;
//                 STORM_CONFIG.interference.turbulence = 0.5;
//                 if (this.oceanPlane) {
//                     this.oceanPlane.material.uniforms.uInterferenceMode.value = 2;
//                 }
//                 break;
//         }
        
//         this.updateUniforms();
//     }
    
//     updateUniforms() {
//         if (!this.oceanPlane) return;
        
//         const uniforms = this.oceanPlane.material.uniforms;
        
//         // Update wave 1
//         uniforms.uWave1Amplitude.value = STORM_CONFIG.wave1.active ? STORM_CONFIG.wave1.amplitude : 0;
//         uniforms.uWave1Frequency.value = STORM_CONFIG.wave1.frequency;
//         uniforms.uWave1Speed.value = STORM_CONFIG.wave1.speed;
        
//         // Update wave 2
//         uniforms.uWave2Amplitude.value = STORM_CONFIG.wave2.active ? STORM_CONFIG.wave2.amplitude : 0;
//         uniforms.uWave2Frequency.value = STORM_CONFIG.wave2.frequency;
//         uniforms.uWave2Speed.value = STORM_CONFIG.wave2.speed;
        
//         // Update wave 3
//         uniforms.uWave3Amplitude.value = STORM_CONFIG.wave3.active ? STORM_CONFIG.wave3.amplitude : 0;
//         uniforms.uWave3Frequency.value = STORM_CONFIG.wave3.frequency;
//         uniforms.uWave3Speed.value = STORM_CONFIG.wave3.speed;
        
//         // Update interference
//         uniforms.uTurbulence.value = STORM_CONFIG.interference.turbulence;
//         uniforms.uChoppiness.value = STORM_CONFIG.interference.choppiness;
        
//         // Update visualization meshes if they exist
//         if (this.wave1Mesh) {
//             this.wave1Mesh.material.uniforms.uAmplitude.value = STORM_CONFIG.wave1.active ? STORM_CONFIG.wave1.amplitude : 0;
//             this.wave1Mesh.visible = STORM_CONFIG.visualization.showWaveComponents && STORM_CONFIG.wave1.active;
//         }
        
//         if (this.wave2Mesh) {
//             this.wave2Mesh.material.uniforms.uAmplitude.value = STORM_CONFIG.wave2.active ? STORM_CONFIG.wave2.amplitude : 0;
//             this.wave2Mesh.visible = STORM_CONFIG.visualization.showWaveComponents && STORM_CONFIG.wave2.active;
//         }
//     }
    
//     animate() {
//         requestAnimationFrame(() => this.animate());
        
//         this.time = this.clock.getElapsedTime();
        
//         // Update shader uniforms
//         if (this.oceanPlane) {
//             this.oceanPlane.material.uniforms.uTime.value = this.time;
//         }
        
//         // Update visualization meshes
//         if (this.wave1Mesh) {
//             this.wave1Mesh.material.uniforms.uTime.value = this.time;
//         }
        
//         if (this.wave2Mesh) {
//             this.wave2Mesh.material.uniforms.uTime.value = this.time;
//         }
        
//         // Update controls
//         this.controls.update();
        
//         // Render
//         this.renderer.render(this.scene, this.camera);
//     }
    
//     setupEventListeners() {
//         window.addEventListener('resize', () => this.onWindowResize());
        
//         // Add keyboard shortcuts
//         window.addEventListener('keydown', (event) => this.onKeyDown(event));
//     }
    
//     onWindowResize() {
//         this.camera.aspect = window.innerWidth / window.innerHeight;
//         this.camera.updateProjectionMatrix();
//         this.renderer.setSize(window.innerWidth, window.innerHeight);
//     }
    
//     onKeyDown(event) {
//         // Quick presets with keyboard
//         switch(event.key) {
//             case '1':
//                 this.applyPreset('calm');
//                 console.log('Calm Ocean preset applied');
//                 break;
//             case '2':
//                 this.applyPreset('storm');
//                 console.log('Stormy Ocean preset applied');
//                 break;
//             case '3':
//                 this.applyPreset('eggCarton');
//                 console.log('Egg Carton preset applied');
//                 break;
//             case '4':
//                 this.applyPreset('chaotic');
//                 console.log('Chaotic Storm preset applied');
//                 break;
//             case ' ':
//                 // Toggle wave visualization
//                 STORM_CONFIG.visualization.showWaveComponents = !STORM_CONFIG.visualization.showWaveComponents;
//                 if (this.oceanPlane) {
//                     this.oceanPlane.material.uniforms.uShowWaveComponents.value = STORM_CONFIG.visualization.showWaveComponents;
//                 }
//                 console.log('Wave visualization:', STORM_CONFIG.visualization.showWaveComponents ? 'ON' : 'OFF');
//                 break;
//         }
//     }
    
//     dispose() {
//         window.removeEventListener('resize', this.onWindowResize);
//         window.removeEventListener('keydown', this.onKeyDown);
        
//         if (this.oceanPlane) {
//             this.oceanPlane.geometry.dispose();
//             this.oceanPlane.material.dispose();
//         }
        
//         this.renderer.dispose();
//     }
// }

// // ============================================
// // 3. INTERACTIVE DEMO & EDUCATIONAL COMMENTS
// // ============================================

// // Initialize the storm simulation
// const stormOcean = new StormyOcean();
// stormOcean.animate();
// stormOcean.setupEventListeners();

// // Add educational overlay
// const infoDiv = document.createElement('div');
// infoDiv.innerHTML = `
//     <div style="
//         position: absolute;
//         top: 10px;
//         left: 10px;
//         color: white;
//         background: rgba(0,0,0,0.7);
//         padding: 15px;
//         border-radius: 5px;
//         font-family: monospace;
//         max-width: 400px;
//     ">
//         <h3 style="margin-top: 0;">🌊 WAVE INTERFERENCE SIMULATOR</h3>
        
//         <strong>🎯 WHAT YOU'RE SEEING:</strong><br>
//         • <span style="color: #ff0000">RED</span>: Wave 1 - The Swell (X-direction)<br>
//         • <span style="color: #00ff00">GREEN</span>: Wave 2 - The Chop (Y-direction)<br>
//         • <span style="color: #0000ff">BLUE</span>: Ocean surface (combined waves)<br><br>
        
//         <strong>🧠 THE MATH BEHIND IT:</strong><br>
//         • <strong>Additive Interference</strong> (Waves ADD together):<br>
//           Height = sin(x) + sin(y)<br>
//           Creates stormy ocean with peaks & valleys<br><br>
        
//         • <strong>Multiplicative Interference</strong> (Waves MULTIPLY):<br>
//           Height = sin(x) × sin(y)<br>
//           Creates "Egg Carton" pattern<br><br>
        
//         <strong>🎮 CONTROLS:</strong><br>
//         • 1-4: Apply presets<br>
//         • SPACE: Toggle wave visualization<br>
//         • Mouse: Rotate camera<br>
//         • Scroll: Zoom in/out<br><br>
        
//         <strong>⚡ PERFORMANCE:</strong><br>
//         • GPU: Running at 60+ FPS<br>
//         • CPU: Virtually idle<br>
//         • Vertices: ${STORM_CONFIG.segments * STORM_CONFIG.segments}<br>
//         • All waves calculated in parallel!
//     </div>
// `;
// document.body.appendChild(infoDiv);

// // Add performance monitor
// const statsDiv = document.createElement('div');
// statsDiv.style.cssText = `
//     position: absolute;
//     bottom: 10px;
//     right: 10px;
//     color: white;
//     background: rgba(0,0,0,0.7);
//     padding: 10px;
//     border-radius: 5px;
//     font-family: monospace;
// `;
// document.body.appendChild(statsDiv);

// let frameCount = 0;
// let lastTime = performance.now();
// function updateStats() {
//     frameCount++;
//     const currentTime = performance.now();
//     if (currentTime - lastTime >= 1000) {
//         const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
//         statsDiv.textContent = `FPS: ${fps} | GPU: Active | CPU: Idle`;
//         frameCount = 0;
//         lastTime = currentTime;
//     }
//     requestAnimationFrame(updateStats);
// }
// updateStats();

// export { stormOcean };

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Configuration object for easy adjustments
const CONFIG = {
    WAVE: {
        AMPLITUDE: 0.5,
        FREQUENCY: 2.0,
        SPEED: 1.0
    },
    PLANE: {
        WIDTH: 5,
        HEIGHT: 5,
        SEGMENTS: 64
    },
    COLORS: {
        PRIMARY: new THREE.Color(0x0088ff),
        BACKGROUND: 0x111122
    }
};

class WaveSimulation {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.plane = null;
        this.clock = new THREE.Clock();
        this.time = 0;
        
        this.init();
        this.animate();
        this.setupEventListeners();
    }
    
    init() {
        // Setup scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.COLORS.BACKGROUND);
        
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            100
        );
        this.camera.position.set(0, 3, 5);
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.body.appendChild(this.renderer.domElement);
        
        // Remove default margins
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';
        
        // Setup controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Add lighting
        this.setupLighting();
        
        // Create the wave plane
        this.createWavePlane();
    }
    
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 2, 3);
        this.scene.add(directionalLight);
    }
    
    createWavePlane() {
        const geometry = new THREE.PlaneGeometry(
            CONFIG.PLANE.WIDTH,
            CONFIG.PLANE.HEIGHT,
            CONFIG.PLANE.SEGMENTS,
            CONFIG.PLANE.SEGMENTS
        );
        
        const material = new THREE.ShaderMaterial({
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader(),
            side: THREE.DoubleSide,
            uniforms: {
                uTime: { value: 0 },
                uAmplitude: { value: CONFIG.WAVE.AMPLITUDE },
                uFrequency: { value: CONFIG.WAVE.FREQUENCY },
                uSpeed: { value: CONFIG.WAVE.SPEED },
                uColor: { value: CONFIG.COLORS.PRIMARY }
            },
            // Optional: Enable for debugging
            // wireframe: true,
            transparent: false
        });
        
        this.plane = new THREE.Mesh(geometry, material);
        this.plane.rotation.x = -Math.PI / 2;
        this.scene.add(this.plane);
        
        // Add a simple grid helper for reference
        // const gridHelper = new THREE.GridHelper(10, 20, 0x444444, 0x222222);
        // this.scene.add(gridHelper);
    }
    
    getVertexShader() {
        return `
            uniform float uTime;
            uniform float uAmplitude;
            uniform float uFrequency;
            uniform float uSpeed;
            
            varying vec2 vUv;
            varying float vElevation;
            
            void main() {
                vUv = uv;
                
                vec3 newPosition = position;
                
                // Calculate wave elevation
                float elevation = sin(
                    position.x * uFrequency + 
                    uTime * uSpeed
                ) * uAmplitude;
                
                // Add additional wave for complexity
                elevation += sin(
                    position.y * uFrequency * 0.8 + 
                    uTime * uSpeed * 1.2
                ) * uAmplitude * 0.5;
                
                newPosition.z += elevation;
                vElevation = elevation;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `;
    }
    
    getFragmentShader() {
        return `
            uniform vec3 uColor;
            varying vec2 vUv;
            varying float vElevation;
            
            void main() {
                // Add color variation based on elevation
                float colorVariation = vElevation * 0.5 + 0.5;
                vec3 finalColor = uColor * colorVariation;
                
                // Add slight gradient based on UV coordinates
                float gradient = mix(0.7, 1.0, vUv.y);
                finalColor *= gradient;
                
                // Add subtle highlight at wave peaks
                float highlight = smoothstep(0.4, 0.6, abs(vElevation) / 0.5);
                finalColor += highlight * 0.2;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time = this.clock.getElapsedTime();
        
        // Update shader uniforms
        if (this.plane && this.plane.material.uniforms.uTime) {
            this.plane.material.uniforms.uTime.value = this.time;
        }
        
        // Update controls with damping
        this.controls.update();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Add keyboard controls for wave parameters (optional)
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    
    onKeyDown(event) {
        const uniforms = this.plane.material.uniforms;
        const step = 0.1;
        
        switch(event.key.toLowerCase()) {
            case 'arrowup':
                uniforms.uAmplitude.value += step;
                console.log('Amplitude:', uniforms.uAmplitude.value.toFixed(2));
                break;
            case 'arrowdown':
                uniforms.uAmplitude.value = Math.max(0, uniforms.uAmplitude.value - step);
                console.log('Amplitude:', uniforms.uAmplitude.value.toFixed(2));
                break;
            case 'arrowright':
                uniforms.uFrequency.value += step;
                console.log('Frequency:', uniforms.uFrequency.value.toFixed(2));
                break;
            case 'arrowleft':
                uniforms.uFrequency.value = Math.max(0.1, uniforms.uFrequency.value - step);
                console.log('Frequency:', uniforms.uFrequency.value.toFixed(2));
                break;
            case 'w':
                uniforms.uSpeed.value += 0.2;
                console.log('Speed:', uniforms.uSpeed.value.toFixed(2));
                break;
            case 's':
                uniforms.uSpeed.value = Math.max(0, uniforms.uSpeed.value - 0.2);
                console.log('Speed:', uniforms.uSpeed.value.toFixed(2));
                break;
        }
    }
    
    // Cleanup method for when the simulation is no longer needed
    dispose() {
        window.removeEventListener('resize', this.onWindowResize);
        window.removeEventListener('keydown', this.onKeyDown);
        
        if (this.plane) {
            this.plane.geometry.dispose();
            this.plane.material.dispose();
        }
        
        this.renderer.dispose();
    }
}

// Initialize the simulation
const simulation = new WaveSimulation();

// Export for potential module usage
export { simulation };