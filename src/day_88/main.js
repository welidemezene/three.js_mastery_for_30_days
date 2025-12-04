import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'lil-gui';

// ============================================
// 1. SCENE SETUP WITH DEBUG GUI
// ============================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(15, 15, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x111111);
document.body.appendChild(renderer.domElement);
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ============================================
// 2. DEBUG OBJECT & GUI CONTROLS
// ============================================
const debugObject = {
    // Dot Product Settings
    detectionThreshold: 0.8,
    showDetectionCone: true,
    coneOpacity: 0.3,
    
    // Movement Settings
    playerSpeed: 1.0,
    playerRadius: 6.0,
    turretScanSpeed: 0.5,
    
    // Cross Product Settings
    showCrossProduct: true,
    showCoordinateAxes: true,
    
    // Visual Settings
    showVectorHelpers: true,
    showAngleDisplay: true,
    
    // Reset Function
    resetScene: function() {
        debugObject.detectionThreshold = 0.8;
        debugObject.playerSpeed = 1.0;
        debugObject.turretScanSpeed = 0.5;
        playerMesh.position.set(0, 0, 6);
        turretGroup.rotation.y = 0;
        updateGUI();
    }
};

const gui = new GUI({ title: '🎯 Dot & Cross Product Visualizer' });

// Add folders for organization
const detectionFolder = gui.addFolder('🔍 Detection Settings');
detectionFolder.add(debugObject, 'detectionThreshold', -1, 1, 0.01)
    .name('Dot Threshold')
    .onChange(updateDetectionCone);
detectionFolder.add(debugObject, 'showDetectionCone').name('Show Cone');
detectionFolder.add(debugObject, 'coneOpacity', 0, 1, 0.1).name('Cone Opacity');

const movementFolder = gui.addFolder('🔄 Movement Settings');
movementFolder.add(debugObject, 'playerSpeed', 0.1, 3, 0.1).name('Player Speed');
movementFolder.add(debugObject, 'playerRadius', 2, 10, 0.5).name('Player Orbit Radius');
movementFolder.add(debugObject, 'turretScanSpeed', 0, 2, 0.1).name('Turret Scan Speed');

const visualFolder = gui.addFolder('👁️ Visual Settings');
visualFolder.add(debugObject, 'showCrossProduct').name('Show Cross Product');
visualFolder.add(debugObject, 'showCoordinateAxes').name('Show Axes');
visualFolder.add(debugObject, 'showVectorHelpers').name('Show Vectors');
visualFolder.add(debugObject, 'showAngleDisplay').name('Show Angle');

gui.add(debugObject, 'resetScene').name('🔄 Reset Scene');

// ============================================
// 3. 3D OBJECTS - ENHANCED WITH VISUALS
// ============================================

// Grid with better visibility
const grid = new THREE.GridHelper(30, 30, 0x444444, 0x222222);
scene.add(grid);

// Coordinate axes (X=Red, Y=Green, Z=Blue)
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Turret Group with enhanced visuals
const turretGroup = new THREE.Group();
turretGroup.position.set(0, 1, 0);
scene.add(turretGroup);

// Turret mesh with wireframe
const turretGeometry = new THREE.BoxGeometry(1, 1, 2);
const turretMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x888888,
    wireframe: false 
});
const turretMesh = new THREE.Mesh(turretGeometry, turretMaterial);
turretMesh.position.y = 0.5;
turretGroup.add(turretMesh);

// Turret wireframe (for better visibility)
const turretWireframe = new THREE.LineSegments(
    new THREE.EdgesGeometry(turretGeometry),
    new THREE.LineBasicMaterial({ color: 0x000000 })
);
turretMesh.add(turretWireframe);

// Forward vector arrow (Yellow)
const forwardArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0.5, 0),
    3,
    0xffff00,
    0.3,
    0.15
);
turretGroup.add(forwardArrow);

// Player mesh
const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const playerMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00,
    wireframe: false 
});
const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(playerMesh);

// Player trail (shows path)
const playerTrail = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 })
);
scene.add(playerTrail);
const trailPoints = [];

// ============================================
// 4. DOT PRODUCT VISUALIZATION
// ============================================

// Detection cone visualization
let detectionCone = null;
function createDetectionCone() {
    const coneGeometry = new THREE.ConeGeometry(1, 3, 32, 1, true);
    const coneMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: debugObject.coneOpacity,
        side: THREE.DoubleSide
    });
    detectionCone = new THREE.Mesh(coneGeometry, coneMaterial);
    detectionCone.rotation.x = -Math.PI / 2;
    detectionCone.position.y = 0.5;
    turretGroup.add(detectionCone);
}

// Line from turret to player
const turretToPlayerLine = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 })
);
scene.add(turretToPlayerLine);

// Dot product visualization sphere (shows value)
const dotSphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
const dotSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const dotSphere = new THREE.Mesh(dotSphereGeometry, dotSphereMaterial);
scene.add(dotSphere);

// Angle arc visualization
const angleArc = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 3 })
);
scene.add(angleArc);

// ============================================
// 5. CROSS PRODUCT VISUALIZATION
// ============================================

// Right vector (from cross product)
const rightArrow = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0.5, 0),
    2,
    0xff0000,
    0.2,
    0.1
);
turretGroup.add(rightArrow);

// Up vector
const upArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0.5, 0),
    2,
    0x00ff00,
    0.2,
    0.1
);
turretGroup.add(upArrow);

// Cross product plane visualization
let crossProductPlane = null;
function createCrossProductPlane() {
    const planeGeometry = new THREE.PlaneGeometry(2, 2);
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x4444ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    crossProductPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    crossProductPlane.position.y = 0.5;
    turretGroup.add(crossProductPlane);
}

// ============================================
// 6. TEXT OVERLAY FOR INFORMATION
// ============================================
const infoDiv = document.createElement('div');
infoDiv.style.position = 'absolute';
infoDiv.style.top = '10px';
infoDiv.style.left = '10px';
infoDiv.style.color = 'white';
infoDiv.style.fontFamily = 'monospace';
infoDiv.style.fontSize = '14px';
infoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
infoDiv.style.padding = '15px';
infoDiv.style.borderRadius = '5px';
infoDiv.style.maxWidth = '300px';
document.body.appendChild(infoDiv);

// ============================================
// 7. MATH VARIABLES & FUNCTIONS
// ============================================
const turretForward = new THREE.Vector3();
const targetDirection = new THREE.Vector3();
const turretRight = new THREE.Vector3();
const turretUp = new THREE.Vector3();
const worldUp = new THREE.Vector3(0, 1, 0);
const clock = new THREE.Clock();

// Vector for angle arc calculation
const arcPoints = [];

function updateDetectionCone() {
    if (detectionCone) {
        // Calculate cone radius based on threshold
        const angle = Math.acos(debugObject.detectionThreshold);
        const radius = Math.tan(angle) * 3; // cone length is 3
        
        // Create new geometry with updated radius
        const newGeometry = new THREE.ConeGeometry(radius, 3, 32, 1, true);
        detectionCone.geometry.dispose();
        detectionCone.geometry = newGeometry;
        
        // Update material opacity
        detectionCone.material.opacity = debugObject.coneOpacity;
        
        detectionCone.visible = debugObject.showDetectionCone;
    }
}

function createAngleArc(turretForward, targetDirection) {
    arcPoints.length = 0;
    
    // Create arc points
    const angle = Math.acos(Math.min(1, Math.max(-1, turretForward.dot(targetDirection))));
    const segments = 32;
    
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * angle;
        
        // Rotate turretForward around axis perpendicular to both vectors
        const axis = new THREE.Vector3().crossVectors(turretForward, targetDirection).normalize();
        const point = turretForward.clone().applyAxisAngle(axis, theta);
        
        // Scale and position
        point.multiplyScalar(2).add(turretGroup.position);
        arcPoints.push(point.x, point.y + 0.5, point.z);
    }
    
    angleArc.geometry.setAttribute('position', new THREE.Float32BufferAttribute(arcPoints, 3));
}

function updateGUI() {
    // Update all GUI controllers
    gui.controllers.forEach(controller => {
        controller.updateDisplay();
    });
}

// ============================================
// 8. INITIALIZATION
// ============================================
createDetectionCone();
createCrossProductPlane();
updateDetectionCone();

// ============================================
// 9. ANIMATION LOOP - ENHANCED WITH ALL VISUALS
// ============================================
function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    
    // ============ PLAYER MOVEMENT ============
    const playerAngle = time * debugObject.playerSpeed;
    playerMesh.position.x = Math.sin(playerAngle) * debugObject.playerRadius;
    playerMesh.position.z = Math.cos(playerAngle) * debugObject.playerRadius;
    
    // Update player trail
    trailPoints.push(playerMesh.position.clone());
    if (trailPoints.length > 50) trailPoints.shift();
    
    const trailGeometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
    playerTrail.geometry.dispose();
    playerTrail.geometry = trailGeometry;
    
    // ============ TURRET SCANNING ============
    turretGroup.rotation.y = Math.sin(time * debugObject.turretScanSpeed) * Math.PI;
    
    // ============ DOT PRODUCT CALCULATION ============
    // 1. Get turret forward direction
    turretGroup.getWorldDirection(turretForward);
    
    // 2. Calculate direction to player
    targetDirection.subVectors(playerMesh.position, turretGroup.position).normalize();
    
    // 3. Calculate dot product
    const dot = turretForward.dot(targetDirection);
    
    // 4. Calculate angle in degrees
    const angleDeg = Math.acos(Math.min(1, Math.max(-1, dot))) * (180 / Math.PI);
    
    // ============ DETECTION LOGIC ============
    if (dot > debugObject.detectionThreshold) {
        // Detected - Red
        turretMesh.material.color.set(0xff0000);
        playerMesh.material.color.set(0xff4444);
    } else{
        // In front but not detected - Orange
        turretMesh.material.color.set(0xff8800);
        playerMesh.material.color.set(0x00ff00);
    // } else {
    //     // Behind - Blue
    //     turretMesh.material.color.set(0x0088ff);
    //     playerMesh.material.color.set(0x00ff00);
    // }
}
    
    // ============ CROSS PRODUCT CALCULATION ============
    // Right = Forward × World Up
    turretRight.crossVectors(turretForward, worldUp).normalize();
    
    // Up = Right × Forward (to ensure orthonormal basis)
    turretUp.crossVectors(turretRight, turretForward).normalize();
    
    // ============ UPDATE VISUALS ============
    
    // Update arrows
    forwardArrow.setDirection(turretForward);
    forwardArrow.setLength(3);
    forwardArrow.visible = debugObject.showVectorHelpers;
    
    rightArrow.setDirection(turretRight);
    rightArrow.visible = debugObject.showCrossProduct && debugObject.showVectorHelpers;
    
    upArrow.setDirection(turretUp);
    upArrow.visible = debugObject.showCrossProduct && debugObject.showVectorHelpers;
    
    // Update turret-to-player line
    const linePoints = [
        turretGroup.position.clone().add(new THREE.Vector3(0, 0.5, 0)),
        playerMesh.position.clone()
    ];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    turretToPlayerLine.geometry.dispose();
    turretToPlayerLine.geometry = lineGeometry;
    turretToPlayerLine.visible = debugObject.showVectorHelpers;
    
    // Update dot sphere (position based on dot value)
    const dotPos = turretGroup.position.clone()
        .add(turretForward.clone().multiplyScalar(dot * 2))
        .add(new THREE.Vector3(0, 3, 0));
    dotSphere.position.copy(dotPos);
    
    // Color dot sphere based on dot value
    const dotColor = new THREE.Color();
    if (dot > 0) {
        dotColor.setRGB(dot, 0, 1 - dot); // Red to Blue
    } else {
        dotColor.setRGB(0, 0, 1 + dot); // Blue to Black
    }
    dotSphere.material.color.copy(dotColor);
    
    // Update angle arc
    if (debugObject.showAngleDisplay) {
        createAngleArc(turretForward, targetDirection);
        angleArc.visible = true;
    } else {
        angleArc.visible = false;
    }
    
    // Update cross product plane
    if (crossProductPlane && debugObject.showCrossProduct) {
        // Align plane with forward and up vectors
        crossProductPlane.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            turretRight
        );
        crossProductPlane.visible = true;
    } else if (crossProductPlane) {
        crossProductPlane.visible = false;
    }
    
    // Update coordinate axes visibility
    axesHelper.visible = debugObject.showCoordinateAxes;
    
    // ============ UPDATE INFO DISPLAY ============
    // infoDiv.innerHTML = `
    //     <strong>🎯 DOT PRODUCT VISUALIZER</strong><br><br>
        
    //     <strong>📐 Dot Product:</strong> ${dot.toFixed(3)}<br>
    //     <strong>📏 Angle:</strong> ${angleDeg.toFixed(1)}°<br>
    //     <strong>🎯 Detection Threshold:</strong> ${debugObject.detectionThreshold.toFixed(2)}<br>
    //     <strong>🎪 Detection Cone Angle:</strong> ${(Math.acos(debugObject.detectionThreshold) * 180 / Math.PI).toFixed(1)}°<br><br>
        
    //     <strong>📊 Vector Information:</strong><br>
    //     Turret Forward: (${turretForward.x.toFixed(2)}, ${turretForward.y.toFixed(2)}, ${turretForward.z.toFixed(2)})<br>
    //     To Player: (${targetDirection.x.toFixed(2)}, ${targetDirection.y.toFixed(2)}, ${targetDirection.z.toFixed(2)})<br><br>
        
    //     <strong>✖️ Cross Product Results:</strong><br>
    //     Right Vector: (${turretRight.x.toFixed(2)}, ${turretRight.y.toFixed(2)}, ${turretRight.z.toFixed(2)})<br>
    //     Up Vector: (${turretUp.x.toFixed(2)}, ${turretUp.y.toFixed(2)}, ${turretUp.z.toFixed(2)})<br><br>
        
    //     <strong>🔑 Key Insights:</strong><br>
    //     • Dot = 1.0 → Perfect alignment (0°)<br>
    //     • Dot = 0.7 → ~45° angle<br>
    //     • Dot = 0.0 → Perpendicular (90°)<br>
    //     • Dot = -1.0 → Opposite (180°)<br>
    //     • Right = Forward × World Up
    // `;
    
    // ============ FINAL RENDER ============
    controls.update();
    renderer.render(scene, camera);
}

// ============================================
// 10. START ANIMATION & EVENT HANDLERS
// ============================================
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Keyboard controls for manual testing
window.addEventListener('keydown', (event) => {
    switch(event.key) {
        case ' ':
            // Space to toggle detection cone
            debugObject.showDetectionCone = !debugObject.showDetectionCone;
            if (detectionCone) detectionCone.visible = debugObject.showDetectionCone;
            updateGUI();
            break;
        case 'ArrowUp':
            debugObject.detectionThreshold += 0.05;
            if (debugObject.detectionThreshold > 1) debugObject.detectionThreshold = 1;
            updateDetectionCone();
            updateGUI();
            break;
        case 'ArrowDown':
            debugObject.detectionThreshold -= 0.05;
            if (debugObject.detectionThreshold < -1) debugObject.detectionThreshold = -1;
            updateDetectionCone();
            updateGUI();
            break;
    }
});

// Mouse click to set player position (for testing)
window.addEventListener('click', (event) => {
    // Convert mouse to normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update player position based on click
    playerMesh.position.x = mouse.x * debugObject.playerRadius;
    playerMesh.position.z = mouse.y * debugObject.playerRadius;
});