import React from 'react'
import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  useCursor, 
  MeshPortalMaterial, 
  CameraControls, 
  Environment, 
  Text, 
  RoundedBox,
  Float 
} from '@react-three/drei'
import { useControls } from 'leva'
import { easing } from 'maath' // 'npm install maath' if you don't have it, or use standard lerp

// 1. THE PORTAL CARD
function PortalCard({ children, ...props }) {
  const meshRef = useRef()
  const portalMaterial = useRef()
  const [active, setActive] = useState(false)
  
  // Change cursor on hover
  useCursor(active)

  useFrame((state, delta) => {
    // A. Smooth Opacity Fade (Blend)
    // When active, the portal takes over the screen (blend = 1)
    // When inactive, it sits inside the frame (blend = 0)
    const targetBlend = active ? 1 : 0
    easing.damp(portalMaterial.current, 'blend', targetBlend, 0.2, delta)

    // B. Open/Close Logic
    if (active) {
        // If active, reset camera to look around inside
        // (CameraControls logic usually handles this, but we can animate properties here)
    }
  })

  return (
    <group {...props}>
      <RoundedBox 
        args={[3, 4, 0.1]} 
        radius={0.1}
        onDoubleClick={() => setActive(!active)}
      >
        {/* THE FRAME MATERIAL */}
        <meshStandardMaterial color="#111" metalness={1} roughness={0.2} />
        
        {/* THE PORTAL (The Magic Window) */}
        <MeshPortalMaterial 
            ref={portalMaterial} 
            side={THREE.DoubleSide}
            blend={0} // Start inside the frame
        >
            {/* EVERYTHING HERE IS INSIDE THE OTHER DIMENSION */}
            <ambientLight intensity={1} />
            <Environment preset="sunset" />
            
            {children}
            
            <mesh>
                <sphereGeometry args={[10, 64, 64]} />
                <meshStandardMaterial map={null} color="white" side={THREE.BackSide} />
            </mesh>
        </MeshPortalMaterial>
      </RoundedBox>
    </group>
  )
}

// 2. THE WORLD INSIDE THE PORTAL
function InsideWorld() {
    return (
        <group>
            <Text 
                font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff" 
                color="white" 
                fontSize={0.6} 
                position={[0, 1.5, 0]}
                anchorX="center"
            >
                DIMENSION A
            </Text>

            <Float speed={4} rotationIntensity={2}>
                <mesh>
                    <icosahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color="hotpink" roughness={0.1} metalness={1} />
                </mesh>
            </Float>

            {/* Background particles inside the portal */}
            {Array.from({ length: 20 }).map((_, i) => (
                <mesh key={i} position={[
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10 - 5
                ]}>
                    <sphereGeometry args={[0.1]} />
                    <meshBasicMaterial color="cyan" />
                </mesh>
            ))}
        </group>
    )
}

// 3. THE APP
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#e0e0e0' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 35 }}>
        
        <color attach="background" args={['#e0e0e0']} />
        
        {/* Scene outside the portal */}
        <ambientLight intensity={0.5} />
        <Environment preset="city" />

        <PortalCard>
            <InsideWorld />
        </PortalCard>

        {/* Text outside */}
        <Text 
            font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff" 
            color="#333" 
            fontSize={0.3} 
            position={[0, -2.5, 0]}
        >
            DOUBLE CLICK TO ENTER
        </Text>

        <CameraControls makeDefault />
      </Canvas>
    </div>
  )
}