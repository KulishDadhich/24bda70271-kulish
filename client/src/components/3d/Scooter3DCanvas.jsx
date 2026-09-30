/**
 * 3D Animated Delivery Scooter Canvas
 * Used on the Live Tracking page to show a futuristic courier scooter in active transit.
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const ScooterModel = ({ isMoving = true }) => {
  const scooterRef = useRef();
  const frontWheelRef = useRef();
  const rearWheelRef = useRef();
  const roadLinesRef = useRef();

  useFrame((state, delta) => {
    // Wheel spin when in motion
    if (isMoving) {
      if (frontWheelRef.current) frontWheelRef.current.rotation.x += delta * 12;
      if (rearWheelRef.current) rearWheelRef.current.rotation.x += delta * 12;

      // Subtle riding vibration/bounce
      if (scooterRef.current) {
        scooterRef.current.position.y = Math.sin(state.clock.elapsedTime * 14) * 0.03;
        scooterRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.02;
      }

      // Moving road streak markers
      if (roadLinesRef.current) {
        roadLinesRef.current.position.x -= delta * 4;
        if (roadLinesRef.current.position.x < -3) {
          roadLinesRef.current.position.x = 3;
        }
      }
    }
  });

  return (
    <group ref={scooterRef} position={[0, 0, 0]} rotation={[0.1, 0.5, 0]}>
      {/* 1. Scooter Main Footboard & Chassis */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[1.6, 0.12, 0.45]} />
        <meshStandardMaterial color="#1a1e29" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Decorative Red Accent Strip */}
      <mesh position={[0, -0.05, 0.23]}>
        <boxGeometry args={[1.5, 0.04, 0.02]} />
        <meshStandardMaterial color="#ff4b1f" emissive="#ff4b1f" emissiveIntensity={0.6} />
      </mesh>

      {/* 2. Front Steering Column & Handlebars */}
      <mesh position={[0.7, 0.55, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.04, 0.05, 1.2, 16]} />
        <meshStandardMaterial color="#333a4d" metalness={0.7} />
      </mesh>

      {/* Handlebar crossbar */}
      <mesh position={[0.82, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.9, 16]} />
        <meshStandardMaterial color="#ff4b1f" roughness={0.3} />
      </mesh>

      {/* Glowing Headlight */}
      <mesh position={[0.88, 1.05, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.5} />
      </mesh>

      {/* 3. Front Wheel Assembly */}
      <group position={[0.92, -0.3, 0]} ref={frontWheelRef}>
        {/* Tire */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.3, 0.09, 16, 32]} />
          <meshStandardMaterial color="#111317" roughness={0.9} />
        </mesh>
        {/* Rim Spokes */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.06, 16]} />
          <meshStandardMaterial color="#ff4b1f" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* 4. Rear Wheel Assembly */}
      <group position={[-0.7, -0.3, 0]} ref={rearWheelRef}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.3, 0.09, 16, 32]} />
          <meshStandardMaterial color="#111317" roughness={0.9} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.06, 16]} />
          <meshStandardMaterial color="#ff4b1f" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* 5. Food Delivery Insulated Cargo Box */}
      <group position={[-0.45, 0.45, 0]}>
        <mesh>
          <boxGeometry args={[0.75, 0.75, 0.65]} />
          <meshStandardMaterial color="#ff4b1f" roughness={0.2} metalness={0.3} />
        </mesh>

        {/* Box Lid Trims */}
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[0.78, 0.06, 0.68]} />
          <meshStandardMaterial color="#111317" roughness={0.4} />
        </mesh>

        {/* Glowing FoodVerse Holographic Logo on Box */}
        <mesh position={[0, 0, 0.33]}>
          <planeGeometry args={[0.45, 0.3]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Speed Dust / Ground Trail Lines */}
      <group ref={roadLinesRef} position={[0, -0.68, 0]}>
        {[-1.5, 0, 1.5, 3].map((x, i) => (
          <mesh key={i} position={[x, 0, (i % 2 ? 0.3 : -0.3)]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.8, 0.04]} />
            <meshBasicMaterial color="#ff7a00" transparent opacity={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export const Scooter3DCanvas = ({ isMoving = true, height = '260px' }) => {
  return (
    <div style={{ height }} className="w-full relative">
      <Canvas
        camera={{ position: [0, 0.5, 3.8], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[4, 6, 4]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-3, 2, -2]} intensity={2.5} color="#ff416c" />
        <pointLight position={[3, -1, 2]} intensity={1.8} color="#00f0ff" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
          <ScooterModel isMoving={isMoving} />
        </Float>

        <Sparkles count={25} scale={4} size={2.5} speed={0.8} color="#ffb703" />

        <ContactShadows
          position={[0, -0.7, 0]}
          opacity={0.6}
          scale={4}
          blur={1.8}
          far={3}
          color="#ff4b1f"
        />
      </Canvas>
    </div>
  );
};

export default Scooter3DCanvas;
