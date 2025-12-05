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