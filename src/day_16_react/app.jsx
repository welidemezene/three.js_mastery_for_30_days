import React from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  Text, 
  Float, 
  Environment, 
  MeshTransmissionMaterial, 
  RoundedBox,
  ContactShadows 
} from '@react-three/drei'
import { useControls } from 'leva'

// 1. THE GLASS CARD COMPONENT
function GlassCard() {
  const config = useControls('Glass Physics', {
    thickness: { value: 3, min: 0, max: 20 },
    roughness: { value: 0, min: 0, max: 1 },
    transmission: { value: 1, min: 0, max: 1 },
    ior: { value: 1.2, min: 0, max: 3 },
    chromaticAberration: { value: 0.02, min: 0, max: 1 },
    backside: { value: true },
  })

  return (
    <Float floatIntensity={2} speed={2} rotationIntensity={1}>
      <RoundedBox args={[3, 2, 0.2]} radius={0.1}> 
        <MeshTransmissionMaterial 
          {...config} 
          background={new THREE.Color('#000')}
          resolution={1024} 
          samples={16}
          distortion={0.25}
          color="#fff"
        />
      </RoundedBox>

      <group position={[0, 0, -1]}>
         {/* FIX: Using reliable Google Static WOFF file */}
         <Text 
            font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
            fontSize={0.8} 
            color="white" 
            anchorX="center" 
            anchorY="middle"
            position={[0, 0.2, 0]}
         >
            R3F
         </Text>
         <Text 
            font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
            fontSize={0.2} 
            color="#aaa" 
            position={[0, -0.4, 0]}
            letterSpacing={0.1}
         >
            DAY 16: PRO MODE
         </Text>
      </group>
    </Float>
  )
}
// 2. THE MAIN APP
export default function App() {
  return (
    <div style={{ background: '#111', width: '100vw', height: '100vh' }}>
      
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        
        {/* LIGHTING & ENV */}
        <color attach="background" args={['#111']} />
        
        {/* Environment map reflects off the glass */}
        <Environment preset="city" blur={1} />
        
        {/* SCENE OBJECTS */}
        <GlassCard />

        {/* SHADOWS */}
        {/* ContactShadows is faster and looks softer than standard shadows */}
        <ContactShadows 
           position={[0, -2, 0]} 
           opacity={0.5} 
           scale={10} 
           blur={2.5} 
           far={4}
           color="#000000" 
        />
        
        {/* CONTROLS */}
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.7} />
        
      </Canvas>
    </div>
  )
}