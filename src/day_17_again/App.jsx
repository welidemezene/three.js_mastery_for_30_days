import React from 'react'
import { Canvas } from '@react-three/fiber'
import { 
    OrbitControls, 
    Stage, 
    Float, 
    Environment, 
    ContactShadows,
    Text3D,
    Center
} from '@react-three/drei'
import { useControls } from 'leva'

// 1. The Branding Text Component
function BrandText() {
    // LEVA: Allow user to type text and change color in real-time
    const { text, textColor } = useControls('Branding', {
        text: 'FUTURE',
        textColor: '#ff0055'
    })

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Center position={[0, 1.2, 0]}>
                <Text3D 
                    font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
                    height={0.2} 
                    curveSegments={12}
                    bevelEnabled
                    bevelThickness={0.02}
                    bevelSize={0.02}
                    bevelOffset={0}
                    bevelSegments={5}
                >
                    {text}
                    <meshStandardMaterial color={textColor} metalness={0.8} roughness={0.2} />
                </Text3D>
            </Center>
        </Float>
    )
}

// 2. The Hero Product (Abstract Sphere)
function HeroProduct() {
    // LEVA: precise material control
    const { color, roughness, metalness } = useControls('Product Material', {
        color: '#2b2b2b',
        roughness: { value: 0.1, min: 0, max: 1 },
        metalness: { value: 1, min: 0, max: 1 },
    })

    return (
        <Float speed={4} rotationIntensity={1.5} floatIntensity={2}>
            <mesh castShadow receiveShadow>
                {/* Icosahedron looks more "techy" than a simple sphere */}
                <icosahedronGeometry args={[1, 1]} /> 
                <meshStandardMaterial 
                    color={color} 
                    roughness={roughness} 
                    metalness={metalness}
                    envMapIntensity={1.5} 
                />
            </mesh>
        </Float>
    )
}

// 3. The Main Scene
export default function App() {
    // LEVA: Environment Lighting Switcher
    const { envPreset, bg } = useControls('Studio Environment', {
        envPreset: { options: ['city', 'sunset', 'warehouse', 'dawn'] },
        bg: '#111111' // Dark mode background
    })

    return (
        <div style={{ width: '100vw', height: '100vh', background: bg }}>
            <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
                
                {/* DREI: OrbitControls - Auto-rotate makes it look like a showcase */}
                <OrbitControls makeDefault autoRotate autoRotateSpeed={0.8} minPolarAngle={0} maxPolarAngle={Math.PI / 1.8} />

                {/* DREI: Stage - Instant Professional Lighting */}
                <Stage environment={null} intensity={0.5} contactShadow={false}>
                    <HeroProduct />
                    <BrandText />
                </Stage>

                {/* DREI: Environment - The "Vibe" of the scene */}
                <Environment preset={envPreset} background={false} blur={1} />

                {/* DREI: ContactShadows - The "Grounding" glue */}
                <ContactShadows 
                    position={[0, -2, 0]} 
                    opacity={0.6} 
                    scale={10} 
                    blur={2} 
                    far={4} 
                    color="#000000"
                />

            </Canvas>
        </div>
    )
}