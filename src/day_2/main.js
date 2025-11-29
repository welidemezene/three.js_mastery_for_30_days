import * as THREE from 'three';

// 1. SETUP
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = 0;
document.body.appendChild(renderer.domElement);

// GRID
const gridHelper = new THREE.GridHelper(40, 40);
scene.add(gridHelper);

// 2. OBJECTS
// TARGET (Blue Sphere)
const targetMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.5),
    new THREE.MeshBasicMaterial({ color: 0x0000ff })
);
scene.add(targetMesh);

// ENEMY (Red Cube)
const enemyMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
enemyMesh.position.set(-30, 0, -20);
scene.add(enemyMesh);

// 3. STOP BUBBLE (Distance Visualization)
const stopBubble = new THREE.Mesh(
    new THREE.SphereGeometry(4, 32, 32), // Radius=4 (same as stop distance)
    new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.25,
        wireframe: true
    })
);
scene.add(stopBubble);

// 4. VECTOR VARIABLES
const targetPosition = new THREE.Vector3();
const enemyPosition = new THREE.Vector3();
const direction = new THREE.Vector3();

const clock = new THREE.Clock();

// 5. ANIMATION LOOP
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // MOVE TARGET IN A CIRCLE
    targetMesh.position.x = Math.sin(elapsedTime) * 5;
    targetMesh.position.z = Math.cos(elapsedTime) * 5;

    // MOVE STOP BUBBLE WITH TARGET
    stopBubble.position.copy(targetMesh.position);

    // ----------------------------
    // HOMING MISSILE LOGIC
    // ----------------------------

    // 1. Copy positions
    targetPosition.copy(targetMesh.position);
    enemyPosition.copy(enemyMesh.position);

    // 2. Find direction (Target − Enemy)
    direction.subVectors(targetPosition, enemyPosition);

    // 3. Distance BEFORE normalizing
    const distance = direction.length();

    // 4. Move enemy ONLY IF outside the bubble
    if (distance > 4) {
        direction.normalize();
        enemyMesh.position.add(direction.multiplyScalar(0.05));
        
    }
    enemyMesh.lookAt(targetMesh.position);

    renderer.render(scene, camera);
}

animate();
