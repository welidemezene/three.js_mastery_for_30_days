import React from 'react'
import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Center, Text, Float } from '@react-three/drei'
import { shaderMaterial } from '@react-three/drei'

// ------------------------------------------------------------------
// 1. DEFINE THE SHADER (The Math)
// ------------------------------------------------------------------

const HoloMaterial = shaderMaterial(
  // A. Uniforms
  {
    uTime: 0,
    uColor: new THREE.Color('#00ff88'),
    uGlitchStrength: 0, // Interactive uniform
  },
  
  // B. Vertex Shader
  `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  // C. Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uGlitchStrength; // 0 to 1
    
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // 1. Fresnel (Edge Glow)
      // View Vector is usually (0,0,1) in view space approximation
      vec3 viewDirection = vec3(0.0, 0.0, 1.0);
      float fresnel = dot(viewDirection, vNormal);
      fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
      fresnel = pow(fresnel, 2.0);

      // 2. Scanlines (Moving up)
      float scan = sin(vPosition.y * 10.0 - uTime * 3.0);
      scan = (scan + 1.0) * 0.5; // normalize 0-1
      scan = pow(scan, 3.0); // sharpen

      // 3. Glitch Effect (Interactive)
      // Add noise when uGlitchStrength is high
      float noise = sin(vPosition.y * 50.0 + uTime * 20.0) * uGlitchStrength;
      
      // 4. Combine
      float alpha = fresnel + scan * 0.5 + noise;
      
      // 5. Final Color
      // Additive blending needs alpha logic
      gl_FragColor = vec4(uColor, alpha);
    }
  `
)

// 2. Register it so React can use it
extend({ HoloMaterial })

// ------------------------------------------------------------------
// 3. THE COMPONENT (The Logic)
// ------------------------------------------------------------------

function ForceField() {
  const ref = useRef()
  const [hovered, setHover] = useState(false)

  useFrame((state, delta) => {
    // 1. Animate Time
    ref.current.uTime += delta
    
    // 2. Animate Glitch (Lerp)
    // If hovered, target 0.5. If not, target 0.
    // '0.1' is the smoothing factor.
    ref.current.uGlitchStrength = THREE.MathUtils.lerp(
        ref.current.uGlitchStrength, 
        hovered ? 1.0 : 0.0, 
        0.1
    )
  })

  return (
    <mesh 
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
    >
      {/* Use a detailed geometry so the vertex shader looks good */}
      <sphereGeometry args={[1.5, 64, 64]} />
      
      {/* Our Custom Shader Tag! */}
      <holoMaterial 
        ref={ref} 
        transparent 
        blending={THREE.AdditiveBlending} // Makes it glow/add light
        depthWrite={false} // Prevents occlusion issues
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ------------------------------------------------------------------
// 4. THE APP
// ------------------------------------------------------------------
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 4] }}>
        
        {/* Background Object to prove transparency */}
        <Float speed={2}>
            <Text fontSize={0.5} color="white" position={[0, 0, -2]}>
                HOVER ME
            </Text>
        </Float>

        <ForceField />

        <OrbitControls />
      </Canvas>
    </div>
  )
}