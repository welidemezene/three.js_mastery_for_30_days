import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// ============================================================================
// LIL-GUI IMPORT & CONCEPT
// ============================================================================
// lil-gui is a lightweight GUI library for creating debug panels in web apps.
// It automatically creates UI controls (sliders, color pickers, buttons) based
// on JavaScript object properties. When you change values in the GUI, it updates
// the object properties, and vice versa.
import GUI from 'lil-gui';

// ============================================================================
// 1. SCENE SETUP & INITIALIZATION
// ============================================================================

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(8, 5, 10);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 50;

// ============================================================================
// 2. DEBUG OBJECTS & STATE MANAGEMENT
// ============================================================================
// 
// CONCEPT: The Debug Object Pattern
// ===================================
// This is a central object that stores ALL parameters you want to control
// through the GUI. Instead of directly controlling Three.js objects, you:
// 1. Store values in this debugObject
// 2. Use lil-gui to create controls that modify debugObject properties
// 3. Use onChange callbacks to sync debugObject values to actual scene objects
//
// WHY THIS PATTERN?
// - Single source of truth for all debug values
// - Easy to save/load configurations
// - Can reset all values easily
// - Keeps GUI code separate from scene logic
//
// Main debug object containing all tweakable parameters
const debugObject = {
    // Scene
    backgroundColor: '#1a1a2e',
    showHelpers: true,
    showGrid: true,
    showAxes: true,
    
    // Objects
    showGolfBall: true,
    showGhost: false,
    showRandomObjects: false,
    
    // Materials
    ballRoughness: 0.5,
    ballMetalness: 0.3,
    ballColor: '#ff3b6d',
    ballWireframe: false,
    ballOpacity: 1.0,
    
    // Lighting
    ambientIntensity: 0.3,
    directIntensity: 2.5,
    directColor: '#ffffff',
    ambientColor: '#444466',
    
    // Camera
    cameraFov: 75,
    cameraNear: 0.1,
    cameraFar: 1000,
    autoRotate: false,
    rotationSpeed: 0.5,
    
    // Performance
    statsEnabled: true,
    maxFPS: 60,
    
    // Ghost Object
    ghostColor: '#00ff88',
    ghostOpacity: 0.7,
    
    // Animation
    animationSpeed: 1.0,
    pulseAnimation: true,
    rotationAnimation: true,
    
    // ========================================================================
    // METHODS IN DEBUG OBJECT
    // ========================================================================
    // CONCEPT: Function Controllers
    // When you add a function to debugObject and then add it to GUI using
    // gui.add(debugObject, 'functionName'), lil-gui creates a BUTTON that,
    // when clicked, calls that function. This is how you create action buttons.
    //
    // Methods
    randomizeScene: function() {
        this.ballColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
        this.ghostColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
        this.backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
        this.ballRoughness = Math.random();
        this.ballMetalness = Math.random();
        
        golfBall.material.color.set(this.ballColor);
        if (ghost) ghost.material.color.set(this.ghostColor);
        scene.background.set(this.backgroundColor);
        
        console.log('🎲 Scene randomized!');
    },
    
    takeScreenshot: function() {
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `screenshot-${timestamp}.png`;
        link.href = renderer.domElement.toDataURL('image/png');
        link.click();
        console.log('📸 Screenshot saved!');
    },
    
    resetScene: function() {
        // Reset positions
        golfBall.position.set(0, 1, 0);
        golfBall.rotation.set(0, 0, 0);
        golfBall.scale.set(1, 1, 1);
        
        // Reset lights
        directionalLight.position.set(5, 8, 5);
        directionalLight.intensity = 2.5;
        
        // Reset camera
        camera.position.set(8, 5, 10);
        camera.lookAt(0, 0, 0);
        
        // Reset parameters
        const resetValues = {
            backgroundColor: '#1a1a2e',
            showHelpers: true,
            showGrid: true,
            showAxes: true,
            showGolfBall: true,
            showGhost: false,
            showRandomObjects: false,
            ballRoughness: 0.5,
            ballMetalness: 0.3,
            ballColor: '#ff3b6d',
            ballWireframe: false,
            ballOpacity: 1.0,
            ambientIntensity: 0.3,
            directIntensity: 2.5,
            directColor: '#ffffff',
            ambientColor: '#444466',
            cameraFov: 75,
            cameraNear: 0.1,
            cameraFar: 1000,
            autoRotate: false,
            rotationSpeed: 0.5,
            statsEnabled: true,
            maxFPS: 60,
            ghostColor: '#00ff88',
            ghostOpacity: 0.7,
            animationSpeed: 1.0,
            pulseAnimation: true,
            rotationAnimation: true
        };
        
        // Apply reset values
        Object.assign(this, resetValues);
        
        // Apply to scene objects
        golfBall.material.color.set(this.ballColor);
        golfBall.material.roughness = this.ballRoughness;
        golfBall.material.metalness = this.ballMetalness;
        golfBall.material.wireframe = this.ballWireframe;
        golfBall.material.opacity = this.ballOpacity;
        scene.background.set(this.backgroundColor);
        ambientLight.color.set(this.ambientColor);
        ambientLight.intensity = this.ambientIntensity;
        directionalLight.color.set(this.directColor);
        directionalLight.intensity = this.directIntensity;
        
        console.log('🔄 Scene reset!');
    },
    
    // Method to update material
    updateMaterial: function() {
        golfBall.material.needsUpdate = true;
        console.log('Material update requested!');
    }
};

// ============================================================================
// 3. SCENE OBJECTS CREATION
// ============================================================================

// Golf Ball (Main Object)
const golfBallGeometry = new THREE.SphereGeometry(1, 64, 64);
const golfBallMaterial = new THREE.MeshStandardMaterial({
    color: debugObject.ballColor,
    roughness: debugObject.ballRoughness,
    metalness: debugObject.ballMetalness,
    wireframe: debugObject.ballWireframe,
    transparent: true,
    opacity: debugObject.ballOpacity
});
const golfBall = new THREE.Mesh(golfBallGeometry, golfBallMaterial);
golfBall.position.y = 1;
golfBall.castShadow = true;
golfBall.receiveShadow = true;
scene.add(golfBall);

// Ground Plane
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x333344,
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Ghost Object (Initially not in scene)
let ghost = null;
let ghostAdded = false;

function createGhostObject() {
    const ghostGeometry = new THREE.BoxGeometry(1, 2, 1);
    const ghostMaterial = new THREE.MeshBasicMaterial({
        color: debugObject.ghostColor,
        transparent: true,
        opacity: debugObject.ghostOpacity,
        side: THREE.DoubleSide,
        wireframe: false
    });
    
    ghost = new THREE.Mesh(ghostGeometry, ghostMaterial);
    ghost.position.set(3, 1, 0);
    ghost.name = 'GhostObject';
    ghost.userData = { type: 'debug', createdAt: Date.now() };
    
    console.log('👻 Ghost object created (not added to scene)');
}
createGhostObject();

// Random decorative objects
const randomObjects = [];
function createRandomObjects(count = 10) {
    // Clear existing
    randomObjects.forEach(obj => scene.remove(obj));
    randomObjects.length = 0;
    
    // Create new
    const geometries = [
        () => new THREE.BoxGeometry(0.5, 0.5, 0.5),
        () => new THREE.ConeGeometry(0.3, 1, 8),
        () => new THREE.CylinderGeometry(0.3, 0.3, 1, 8),
        () => new THREE.SphereGeometry(0.4, 16, 16)
    ];
    
    for (let i = 0; i < count; i++) {
        const geoFunc = geometries[Math.floor(Math.random() * geometries.length)];
        const geometry = geoFunc();
        
        const material = new THREE.MeshStandardMaterial({
            color: Math.random() * 0xffffff,
            roughness: Math.random(),
            metalness: Math.random()
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            (Math.random() - 0.5) * 15,
            0.5,
            (Math.random() - 0.5) * 15
        );
        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        mesh.castShadow = true;
        
        scene.add(mesh);
        randomObjects.push(mesh);
    }
    
    console.log(`🎲 Created ${count} random objects`);
}

// ============================================================================
// 4. LIGHTING SETUP
// ============================================================================

// Ambient Light
const ambientLight = new THREE.AmbientLight(
    debugObject.ambientColor,
    debugObject.ambientIntensity
);
scene.add(ambientLight);

// Directional Light (Main light)
const directionalLight = new THREE.DirectionalLight(
    debugObject.directColor,
    debugObject.directIntensity
);
directionalLight.position.set(5, 8, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

// Point Light (for accent)
const pointLight = new THREE.PointLight(0xffaa33, 1.5, 20);
pointLight.position.set(-5, 3, -5);
pointLight.castShadow = true;
scene.add(pointLight);

// ============================================================================
// 5. DEBUG HELPERS & VISUAL AIDS
// ============================================================================

// Axes Helper
const axesHelper = new THREE.AxesHelper(5);
axesHelper.visible = debugObject.showAxes;
scene.add(axesHelper);

// Grid Helper
const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
gridHelper.visible = debugObject.showGrid;
scene.add(gridHelper);

// Light Helpers
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
directionalLightHelper.visible = debugObject.showHelpers;
scene.add(directionalLightHelper);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
pointLightHelper.visible = debugObject.showHelpers;
scene.add(pointLightHelper);

// Camera Helper
const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
cameraHelper.visible = debugObject.showHelpers;
scene.add(cameraHelper);

// Bounding Box Helper (for golf ball)
const golfBallBBox = new THREE.Box3();
const golfBallBBoxHelper = new THREE.Box3Helper(golfBallBBox, 0xffff00);
golfBallBBoxHelper.visible = debugObject.showHelpers;
scene.add(golfBallBBoxHelper);

// ============================================================================
// 6. GUI CONFIGURATION - COMPLETE CONTROLS
// ============================================================================
//
// ========================================================================
// LIL-GUI COMPREHENSIVE GUIDE
// ========================================================================
//
// 1. CREATING CONTROLS
//    -----------------
//    - add(object, 'property') → Creates control based on property type:
//      * boolean → Checkbox
//      * number → Slider (can add min, max, step: add(obj, 'prop', 0, 100, 1))
//      * string → Text input
//      * function → Button
//    - addColor(object, 'property') → Color picker (for hex strings like '#ff0000')
//
// 2. CHAINING METHODS
//    ----------------
//    - .name('Label') → Custom display name
//    - .onChange(callback) → Called when value changes (callback receives new value)
//    - .listen() → Makes GUI watch property and auto-update display
//
// 3. TWO PATTERNS FOR UPDATING SCENE
//    --------------------------------
//    PATTERN A: Through debugObject (with onChange)
//      debugObject.value → GUI → onChange → sceneObject.property
//      Example: debugObject.ballColor → onChange → golfBall.material.color.set()
//
//    PATTERN B: Direct binding (no onChange needed)
//      sceneObject.property → GUI (two-way binding)
//      Example: golfBall.position.x → GUI (directly bound)
//
// 4. DISPLAY-ONLY VALUES (Read-Only Info)
//    -------------------------------------
//    - Create object with string/number properties
//    - Update properties in code (e.g., in animation loop)
//    - Use .listen() so GUI reflects changes automatically
//    - IMPORTANT: Arrays don't work! Use strings: '1, 2, 3' not [1, 2, 3]
//
// 5. ORGANIZATION
//    ------------
//    - gui.addFolder('Name') → Creates collapsible group
//    - folder.close() → Starts folder collapsed
//    - Can nest folders: subFolder = mainFolder.addFolder('Sub')
//
// 6. FUNCTION CONTROLLERS (Buttons)
//    --------------------------------
//    - Add function to any object
//    - GUI creates button that calls function when clicked
//    - No onChange needed - function IS the action
//
// ========================================================================
//
// CONCEPT: Creating a GUI Instance
// =================================
// new GUI(options) creates a new debug panel. The options object can include:
// - title: Text shown at the top of the panel
// - width: Width in pixels
// - close: Whether to show a close button
//
// Initialize GUI
const gui = new GUI({
    title: '🎯 Expert Debug Panel',
    width: 350,
    close: true
});

// CONCEPT: Styling the GUI
// ========================
// gui.domElement is the actual HTML element of the GUI panel. You can style
// it like any DOM element using standard CSS properties. This is useful for
// positioning the panel on your page.
//
// Apply custom styles
gui.domElement.style.position = 'absolute';
gui.domElement.style.top = '100px';
gui.domElement.style.right = '10px';
gui.domElement.style.zIndex = '1000';

// ----------------------------------------------------------------------------
// A. SCENE FOLDER
// ----------------------------------------------------------------------------
// CONCEPT: Creating Folders
// ==========================
// gui.addFolder(name) creates a collapsible folder/group in the GUI.
// Folders help organize controls into logical sections. You can nest folders
// by calling addFolder() on another folder.
//
// Example: const subFolder = mainFolder.addFolder('Sub Settings');
//
const sceneFolder = gui.addFolder('🌍 Scene Settings');

// CONCEPT: addColor() - Color Picker Controller
// =============================================
// folder.addColor(object, propertyName) creates a COLOR PICKER control.
// It automatically detects if the property is a color (hex string like '#ff0000')
// and creates a color picker UI.
//
// SYNTAX: folder.addColor(object, 'propertyName')
// - object: The object containing the property
// - propertyName: The name of the property (as a string)
//
// CHAINING METHODS:
// .name('Display Name') - Changes the label shown in GUI
// .onChange(callback) - Runs a function whenever the value changes
//
sceneFolder.addColor(debugObject, 'backgroundColor')
    .name('Background Color')  // Custom label (instead of 'backgroundColor')
    .onChange(color => scene.background.set(color));  // Sync to scene when changed

// CONCEPT: add() - Universal Controller
// ======================================
// folder.add(object, propertyName) creates a control based on the property TYPE:
// - boolean → creates a CHECKBOX
// - number → creates a SLIDER (needs min, max, step)
// - string → creates a TEXT INPUT
// - function → creates a BUTTON
//
// For numbers, you can specify range: add(object, 'prop', min, max, step)
//
sceneFolder.add(debugObject, 'showGrid')  // boolean → checkbox
    .name('Show Grid')
    .onChange(value => gridHelper.visible = value);  // Update scene object

sceneFolder.add(debugObject, 'showAxes')
    .name('Show Axes')
    .onChange(value => axesHelper.visible = value);

// CONCEPT: onChange() Callback Pattern
// =====================================
// .onChange(callback) is called EVERY TIME the user changes the value in GUI.
// The callback receives the NEW value as its first parameter.
//
// WHY USE onChange?
// - GUI controls modify debugObject properties
// - But your actual scene objects (lights, meshes) need to be updated too
// - onChange bridges the gap: when debugObject changes, update the scene
//
// PATTERN: debugObject → GUI → onChange → Scene Object
//
sceneFolder.add(debugObject, 'showHelpers')
    .name('Show All Helpers')
    .onChange(value => {  // value = new boolean value from checkbox
        // Update multiple scene objects when one GUI control changes
        directionalLightHelper.visible = value;
        pointLightHelper.visible = value;
        cameraHelper.visible = value;
        golfBallBBoxHelper.visible = value;
    });

// ----------------------------------------------------------------------------
// B. GOLF BALL FOLDER (Material & Transform)
// ----------------------------------------------------------------------------
// CONCEPT: Nested Folders
// =======================
// You can create folders inside folders for better organization.
// ballFolder → ballMaterialFolder (nested)
// ballFolder → ballTransformFolder (nested)
//
const ballFolder = gui.addFolder('🏌️ Golf Ball');
const ballMaterialFolder = ballFolder.addFolder('Material');  // Nested folder
const ballTransformFolder = ballFolder.addFolder('Transform');  // Nested folder

// Material Controls

// Color picker for material color
ballMaterialFolder.addColor(debugObject, 'ballColor')
    .name('Color')
    .onChange(color => golfBall.material.color.set(color));

// CONCEPT: Number Slider with Range
// ==================================
// For NUMBER properties, you can specify:
// add(object, 'property', min, max, step)
// - min: Minimum value (left end of slider)
// - max: Maximum value (right end of slider)
// - step: How much the value changes per slider movement (precision)
//
// Example: add(debugObject, 'ballRoughness', 0, 1, 0.01)
// Creates a slider from 0 to 1, with 0.01 increments
//
ballMaterialFolder.add(debugObject, 'ballRoughness', 0, 1, 0.01)
    .name('Roughness')
    .onChange(value => golfBall.material.roughness = value);

ballMaterialFolder.add(debugObject, 'ballMetalness', 0, 1, 0.01)
    .name('Metalness')
    .onChange(value => golfBall.material.metalness = value);

ballMaterialFolder.add(debugObject, 'ballWireframe')
    .name('Wireframe')
    .onChange(value => golfBall.material.wireframe = value);

ballMaterialFolder.add(debugObject, 'ballOpacity', 0.1, 1, 0.01)
    .name('Opacity')
    .onChange(value => golfBall.material.opacity = value);

// CONCEPT: Function Controller (Button)
// ======================================
// When you add a FUNCTION property, lil-gui creates a BUTTON.
// Clicking the button calls the function.
// No onChange needed - the function itself is the action.
//
ballMaterialFolder.add(debugObject, 'updateMaterial').name('🔄 Update Material');

// Transform Controls

// CONCEPT: Direct Property Binding (No onChange Needed)
// ======================================================
// You can bind GUI controls DIRECTLY to Three.js object properties!
// Instead of: debugObject.positionX → onChange → golfBall.position.x
// You can do: golfBall.position.x directly
//
// ADVANTAGES:
// - Simpler code (no onChange needed)
// - GUI automatically reflects changes made in code
// - Two-way binding: GUI ↔ Object property
//
// NOTE: These controllers are stored in variables (posXController, etc.)
// so you can reference them later if needed (e.g., for .listen() method)
//
const posXController = ballTransformFolder.add(golfBall.position, 'x', -5, 5, 0.1)
    .name('X Position');

const posYController = ballTransformFolder.add(golfBall.position, 'y', -5, 5, 0.1)
    .name('Y Position');

const posZController = ballTransformFolder.add(golfBall.position, 'z', -5, 5, 0.1)
    .name('Z Position');

ballTransformFolder.add(debugObject, 'showGolfBall')
    .name('Visible')
    .onChange(value => golfBall.visible = value);

// ----------------------------------------------------------------------------
// C. LIGHTING FOLDER
// ----------------------------------------------------------------------------
const lightingFolder = gui.addFolder('💡 Lighting');

// Ambient Light
const ambientFolder = lightingFolder.addFolder('Ambient Light');
ambientFolder.add(debugObject, 'ambientIntensity', 0, 2, 0.01)
    .name('Intensity')
    .onChange(value => ambientLight.intensity = value);

ambientFolder.addColor(debugObject, 'ambientColor')
    .name('Color')
    .onChange(color => ambientLight.color.set(color));

// Directional Light
const directFolder = lightingFolder.addFolder('Main Light');
directFolder.add(debugObject, 'directIntensity', 0, 5, 0.1)
    .name('Intensity')
    .onChange(value => directionalLight.intensity = value);

directFolder.addColor(debugObject, 'directColor')
    .name('Color')
    .onChange(color => directionalLight.color.set(color));

directFolder.add(directionalLight.position, 'x', -10, 10, 0.1).name('X Position');
directFolder.add(directionalLight.position, 'y', 0, 20, 0.1).name('Y Position');
directFolder.add(directionalLight.position, 'z', -10, 10, 0.1).name('Z Position');
directFolder.add(directionalLight, 'castShadow').name('Cast Shadows');

// Point Light
const pointFolder = lightingFolder.addFolder('Point Light');
pointFolder.add(pointLight, 'intensity', 0, 3, 0.1).name('Intensity');
pointFolder.add(pointLight.position, 'x', -10, 10, 0.1).name('X Position');
pointFolder.add(pointLight.position, 'y', 0, 10, 0.1).name('Y Position');
pointFolder.add(pointLight.position, 'z', -10, 10, 0.1).name('Z Position');

// ----------------------------------------------------------------------------
// D. CAMERA FOLDER
// ----------------------------------------------------------------------------
const cameraFolder = gui.addFolder('📷 Camera');
// CONCEPT: onChange with Multiple Operations
// ===========================================
// Sometimes changing one property requires updating multiple things.
// In this case, changing FOV requires updating the camera AND calling
// updateProjectionMatrix() to apply the change.
//
cameraFolder.add(debugObject, 'cameraFov', 30, 120, 1)
    .name('Field of View')
    .onChange(value => {
        camera.fov = value;
        camera.updateProjectionMatrix();  // Required after changing FOV
    });

cameraFolder.add(debugObject, 'cameraNear', 0.1, 10, 0.1)
    .name('Near Clip')
    .onChange(value => {
        camera.near = value;
        camera.updateProjectionMatrix();
    });

cameraFolder.add(debugObject, 'cameraFar', 100, 2000, 10)
    .name('Far Clip')
    .onChange(value => {
        camera.far = value;
        camera.updateProjectionMatrix();
    });

cameraFolder.add(debugObject, 'autoRotate')
    .name('Auto Rotate')
    .onChange(value => controls.autoRotate = value);

cameraFolder.add(debugObject, 'rotationSpeed', 0.1, 2, 0.1)
    .name('Rotation Speed')
    .onChange(value => controls.autoRotateSpeed = value);

// ----------------------------------------------------------------------------
// E. GHOST OBJECT FOLDER (Demonstrating Bug Scenario)
// ----------------------------------------------------------------------------
const ghostFolder = gui.addFolder('👻 Ghost Object');

// CONCEPT: Separate Action Object Pattern
// ========================================
// Sometimes you want action buttons that don't fit in debugObject.
// Create a separate object with functions, then add them to GUI.
// This keeps your code organized and separates actions from properties.
//
// Create debug object for ghost actions
const ghostActions = {
    summonGhost: function() {
        if (!ghostAdded && ghost) {
            scene.add(ghost);
            ghostAdded = true;
            console.log('👻 Ghost added to scene!');
            updateChecklist();
        } else {
            console.log(ghostAdded ? '👻 Ghost already summoned!' : '👻 No ghost object created!');
        }
    },
    
    banishGhost: function() {
        if (ghostAdded && ghost) {
            scene.remove(ghost);
            ghostAdded = false;
            console.log('👻 Ghost removed from scene!');
            updateChecklist();
        }
    },
    
    toggleGhostVisibility: function() {
        if (ghost) {
            ghost.visible = !ghost.visible;
            console.log(`👻 Ghost visibility: ${ghost.visible ? 'ON' : 'OFF'}`);
        }
    }
};

// CONCEPT: Adding Functions from Any Object
// ==========================================
// You can add functions from ANY object, not just debugObject.
// When you add a function, lil-gui creates a button that calls it when clicked.
//
ghostFolder.add(ghostActions, 'summonGhost').name('✨ Summon Ghost');
ghostFolder.add(ghostActions, 'banishGhost').name('💀 Banish Ghost');
ghostFolder.add(ghostActions, 'toggleGhostVisibility').name('👁️ Toggle Visible');

// CONCEPT: onChange with Safety Checks
// =====================================
// Sometimes the object you're trying to update might not exist yet.
// Always check if the object exists before trying to modify it in onChange.
//
ghostFolder.addColor(debugObject, 'ghostColor')
    .name('Color')
    .onChange(color => {
        if (ghost) ghost.material.color.set(color);  // Safety check
    });

ghostFolder.add(debugObject, 'ghostOpacity', 0.1, 1, 0.01)
    .name('Opacity')
    .onChange(value => {
        if (ghost) ghost.material.opacity = value;  // Safety check
    });

// ----------------------------------------------------------------------------
// F. ANIMATION & PERFORMANCE FOLDER
// ----------------------------------------------------------------------------
const animationFolder = gui.addFolder('🎬 Animation & Performance');

animationFolder.add(debugObject, 'animationSpeed', 0, 2, 0.1)
    .name('Animation Speed');

animationFolder.add(debugObject, 'pulseAnimation')
    .name('Pulse Animation');

animationFolder.add(debugObject, 'rotationAnimation')
    .name('Rotation Animation');

animationFolder.add(debugObject, 'statsEnabled')
    .name('Show Stats');

animationFolder.add(debugObject, 'maxFPS', 30, 144, 1)
    .name('Max FPS')
    .onChange(value => {
        frameInterval = 1000 / value;
    });

// ----------------------------------------------------------------------------
// G. UTILITIES & ACTIONS FOLDER
// ----------------------------------------------------------------------------
const utilsFolder = gui.addFolder('⚙️ Utilities');

utilsFolder.add(debugObject, 'showRandomObjects')
    .name('Show Random Objects')
    .onChange(value => {
        if (value) {
            createRandomObjects(15);
        } else {
            randomObjects.forEach(obj => scene.remove(obj));
            randomObjects.length = 0;
        }
    });

utilsFolder.add(debugObject, 'randomizeScene').name('🎲 Randomize Scene');
utilsFolder.add(debugObject, 'takeScreenshot').name('📸 Take Screenshot');
utilsFolder.add(debugObject, 'resetScene').name('🔄 Reset Scene');

// ----------------------------------------------------------------------------
// H. DEBUG INFO FOLDER (Read-only values)
// ----------------------------------------------------------------------------
const infoFolder = gui.addFolder('📊 Debug Info');

// CONCEPT: Display-Only Information (Read-Only Values)
// =====================================================
// Sometimes you want to SHOW information in the GUI but not let users edit it.
// This is useful for displaying stats, counts, positions, etc.
//
// STRATEGY:
// 1. Create an object with string/number properties
// 2. Update those properties in your code (e.g., in animation loop)
// 3. Use .listen() to make GUI automatically reflect changes
//
// IMPORTANT: lil-gui CANNOT display arrays directly!
// If you try: objectInfo.position = [1, 2, 3] → GUI will fail
// SOLUTION: Convert to string: objectInfo.position = '1, 2, 3'
//
// Object info - using string representations instead of arrays
const objectInfo = {
    totalObjects: '0',           // String, not number (for display)
    golfBallPosition: '0, 0, 0',  // String, not array (arrays don't work!)
    ghostStatus: 'Not in Scene',
    memory: 'N/A'
};

// CONCEPT: updateObjectInfo() - Reactive Update Pattern
// ======================================================
// This function updates the objectInfo properties based on current scene state.
// Call this function regularly (e.g., in animation loop) to keep GUI in sync.
//
// WHY THIS PATTERN?
// - Scene objects change (positions, counts, etc.)
// - GUI needs to show current values
// - We update objectInfo, then .listen() makes GUI reflect the changes
//
function updateObjectInfo() {
    // Update total object count
    objectInfo.totalObjects = scene.children.length.toString();
    
    // Format position as string instead of array (arrays don't work with GUI!)
    const pos = golfBall.position;
    objectInfo.golfBallPosition = `${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}`;
    
    // Update ghost status
    objectInfo.ghostStatus = ghostAdded ? 'In Scene' : 'Not in Scene';
    
    // Update memory usage (if available)
    objectInfo.memory = performance.memory ? 
        `${(performance.memory.usedJSHeapSize / 1048576).toFixed(1)} MB` : 
        'N/A';
}

// CONCEPT: .listen() - Reactive Updates
// =====================================
// .listen() tells the GUI controller to WATCH the property and automatically
// update the display when the property value changes in code.
//
// HOW IT WORKS:
// 1. You update objectInfo.totalObjects in your code
// 2. GUI controller with .listen() detects the change
// 3. GUI display updates automatically (no manual refresh needed)
//
// WITHOUT .listen(): GUI only shows initial value, never updates
// WITH .listen(): GUI stays in sync with property changes
//
// Create info controllers with .listen() for automatic updates
infoFolder.add(objectInfo, 'totalObjects').name('Total Objects').listen();
infoFolder.add(objectInfo, 'golfBallPosition').name('Ball Position').listen();
infoFolder.add(objectInfo, 'ghostStatus').name('Ghost Status').listen();
infoFolder.add(objectInfo, 'memory').name('Memory Usage').listen();

// CONCEPT: Closing Folders
// ========================
// .close() collapses a folder so it starts closed/collapsed.
// This keeps the GUI tidy and lets users expand only what they need.
// Without .close(), all folders start expanded (can be overwhelming).
//
// Close all folders by default
sceneFolder.close();
ballMaterialFolder.close();
ballTransformFolder.close();
lightingFolder.close();
ambientFolder.close();
directFolder.close();
pointFolder.close();
cameraFolder.close();
ghostFolder.close();
animationFolder.close();
utilsFolder.close();

// ============================================================================
// 7. PERFORMANCE MONITORING & STATS
// ============================================================================

let frameCount = 0;
let lastTime = performance.now();
let fps = 0;
let frameInterval = 1000 / 60; // 60 FPS default

function updateStats() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        if (debugObject.statsEnabled) {
            const fpsElement = document.getElementById('fps');
            const objectCountElement = document.getElementById('objectCount');
            const triangleCountElement = document.getElementById('triangleCount');
            
            if (fpsElement) fpsElement.textContent = fps;
            if (objectCountElement) objectCountElement.textContent = scene.children.length;
            
            // Count triangles
            let triangleCount = 0;
            scene.traverse(object => {
                if (object.isMesh && object.geometry) {
                    triangleCount += object.geometry.index ? 
                        object.geometry.index.count / 3 : 
                        object.geometry.attributes.position.count / 3;
                }
            });
            
            if (triangleCountElement) triangleCountElement.textContent = triangleCount;
        }
    }
}

// ============================================================================
// 8. INVISIBLE OBJECT CHECKLIST SYSTEM
// ============================================================================

function updateChecklist() {
    const checklistItems = [
        { 
            name: 'Golf Ball in Scene', 
            check: () => {
                // Check if golfBall exists in scene
                let found = false;
                scene.traverse(obj => {
                    if (obj === golfBall) found = true;
                });
                return found;
            }
        },
        { 
            name: 'Camera Looking at Object', 
            check: () => {
                const cameraDirection = new THREE.Vector3();
                camera.getWorldDirection(cameraDirection);
                const toObject = new THREE.Vector3()
                    .subVectors(golfBall.position, camera.position)
                    .normalize();
                return cameraDirection.dot(toObject) > 0.1;
            }
        },
        { 
            name: 'Golf Ball Not Too Small', 
            check: () => golfBall.scale.x > 0.01 && golfBall.scale.y > 0.01 && golfBall.scale.z > 0.01
        },
        { 
            name: 'Golf Ball Material Has Light', 
            check: () => {
                if (golfBall.material.type !== 'MeshStandardMaterial') return true;
                return ambientLight.intensity > 0 || directionalLight.intensity > 0 || pointLight.intensity > 0;
            }
        },
        { 
            name: 'Ghost in Scene', 
            check: () => ghostAdded
        },
        { 
            name: 'Lights Enabled', 
            check: () => ambientLight.visible && directionalLight.visible && pointLight.visible
        },
        {
            name: 'Ball Visible',
            check: () => golfBall.visible
        }
    ];
    
    const checklistElement = document.getElementById('checklist-items');
    if (checklistElement) {
        const checklistHTML = checklistItems.map(item => {
            const isValid = item.check();
            return `
                <div style="margin: 5px 0; display: flex; align-items: center;">
                    <span style="color: ${isValid ? '#00ff00' : '#ff5555'}; margin-right: 8px;">
                        ${isValid ? '✓' : '✗'}
                    </span>
                    <span style="color: ${isValid ? '#aaffaa' : '#ffaaaa'}">
                        ${item.name}
                    </span>
                </div>
            `;
        }).join('');
        
        checklistElement.innerHTML = checklistHTML;
    }
}

// ============================================================================
// 9. ANIMATION & RENDERING LOOP
// ============================================================================

let time = 0;
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    // Frame rate limiting
    const now = performance.now();
    if (now - lastTime < frameInterval) return;
    
    const delta = clock.getDelta();
    time += delta * debugObject.animationSpeed;
    
    // Update controls
    controls.update();
    
    // Auto rotation
    if (debugObject.autoRotate) {
        golfBall.rotation.y += delta * debugObject.rotationSpeed;
    }
    
    // Pulse animation
    if (debugObject.pulseAnimation) {
        const scale = 1 + Math.sin(time * 2) * 0.1;
        golfBall.scale.setScalar(scale);
    }
    
    // Rotation animation
    if (debugObject.rotationAnimation && !debugObject.autoRotate) {
        golfBall.rotation.x = Math.sin(time) * 0.5;
        golfBall.rotation.z = Math.cos(time) * 0.3;
    }
    
    // Animate ghost if present
    if (ghostAdded && ghost) {
        ghost.rotation.y += delta;
        ghost.position.y = 1 + Math.sin(time * 2) * 0.5;
    }
    
    // Update bounding box helper
    golfBallBBox.setFromObject(golfBall);
    
    // Update stats and checklist
    updateStats();
    updateChecklist();
    
    // CONCEPT: Keeping GUI in Sync
    // ============================
    // Call updateObjectInfo() every frame to update display-only values.
    // This updates objectInfo properties, and controllers with .listen()
    // automatically reflect the changes in the GUI.
    updateObjectInfo();
    
    // Render
    renderer.render(scene, camera);
}

// ============================================================================
// 10. KEYBOARD SHORTCUTS & EVENT HANDLERS
// ============================================================================

let guiVisible = true;

document.addEventListener('keydown', (event) => {
    switch(event.key.toLowerCase()) {
        case 'h':
            guiVisible = !guiVisible;
            gui.domElement.style.display = guiVisible ? 'block' : 'none';
            console.log(`GUI ${guiVisible ? 'shown' : 'hidden'}`);
            break;
            
        case 'd':
            debugObject.showHelpers = !debugObject.showHelpers;
            directionalLightHelper.visible = debugObject.showHelpers;
            pointLightHelper.visible = debugObject.showHelpers;
            cameraHelper.visible = debugObject.showHelpers;
            golfBallBBoxHelper.visible = debugObject.showHelpers;
            console.log(`Debug helpers: ${debugObject.showHelpers ? 'ON' : 'OFF'}`);
            break;
            
        case 'g':
            if (!ghostAdded) {
                ghostActions.summonGhost();
            } else {
                ghostActions.toggleGhostVisibility();
            }
            break;
            
        case 'r':
            debugObject.randomizeScene();
            break;
            
        case 'escape':
            ghostActions.banishGhost();
            break;
            
        case '1':
            camera.position.set(0, 5, 10);
            camera.lookAt(0, 0, 0);
            break;
            
        case '2':
            camera.position.set(10, 5, 0);
            camera.lookAt(0, 0, 0);
            break;
    }
});

// Window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Double-click to focus on golf ball
renderer.domElement.addEventListener('dblclick', () => {
    controls.target.copy(golfBall.position);
    controls.update();
});

// ============================================================================
// 11. INITIALIZATION
// ============================================================================

// Initial setup
updateChecklist();
updateObjectInfo();

// Create instruction element if it doesn't exist
if (!document.getElementById('instruction')) {
    const instruction = document.createElement('div');
    instruction.id = 'instruction';
    instruction.className = 'instruction';
    instruction.innerHTML = `
        Press <kbd>H</kbd> to hide/show GUI | 
        <kbd>D</kbd> to toggle debug mode | 
        <kbd>G</kbd> to summon ghost
    `;
    instruction.style.position = 'absolute';
    instruction.style.bottom = '10px';
    instruction.style.left = '50%';
    instruction.style.transform = 'translateX(-50%)';
    instruction.style.background = 'rgba(0, 0, 0, 0.7)';
    instruction.style.color = 'white';
    instruction.style.padding = '10px 20px';
    instruction.style.borderRadius = '5px';
    instruction.style.textAlign = 'center';
    instruction.style.zIndex = '1000';
    document.body.appendChild(instruction);
}

console.log('🎯 Day 7: Expert Debugging Toolkit Initialized!');
console.log('=== CONTROLS ===');
console.log('H - Hide/Show GUI');
console.log('D - Toggle debug helpers');
console.log('G - Summon/Toggle ghost');
console.log('R - Randomize scene');
console.log('ESC - Banish ghost');
console.log('1, 2 - Camera presets');
console.log('Double-click - Focus on ball');
console.log('=================');

// Start animation
animate();

// Export for console debugging
window.scene = scene;
window.camera = camera;
window.renderer = renderer;
window.gui = gui;
window.debugObject = debugObject;
window.golfBall = golfBall;
window.ghost = ghost;
console.log('💡 Debug: Objects available in console (scene, camera, renderer, gui, debugObject)');