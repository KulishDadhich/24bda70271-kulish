/**
 * Interactive 3D Hero Section Scene
 * 
 * Features:
 * - Floating 3D Burger, Pizza, Drink Cup, Donut & Fries
 * - Real-time smooth mouse parallax lerping
 * - Drei Sparkles and ambient lighting
 * - Zero external asset downloads needed (Procedural & ultra-fast)
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { BurgerModel, PizzaSliceModel, DrinkCupModel, DonutModel, FriesModel } from './Food3DModels';

const InteractiveScene = () => {
  const groupRef = useRef();

  // Mouse Parallax smooth damping
  useFrame(state => {
    if (!groupRef.current) return;
    const { x, y } = state.pointer; // normalized [-1, 1]
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.45, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.35, 0.05);
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* 1. Central Hero Burger */}
      <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.2}>
        <group position={[0, 0.2, 0.5]} rotation={[0.2, -0.4, 0]}>
          <BurgerModel scale={1.25} animate={false} />
        </group>
      </Float>

      {/* 2. Floating Woodfired Pizza Slice (Right) */}
      <Float speed={3.2} rotationIntensity={1.0} floatIntensity={1.8}>
        <group position={[2.2, 0.8, -0.2]} rotation={[-0.3, 0.6, 0.2]}>
          <PizzaSliceModel scale={1.1} animate={false} />
        </group>
      </Float>

      {/* 3. Glowing Soda Cup (Left) */}
      <Float speed={2.8} rotationIntensity={0.8} floatIntensity={1.4}>
        <group position={[-2.1, 0.4, 0]} rotation={[0.15, 0.5, -0.2]}>
          <DrinkCupModel scale={1.0} animate={false} />
        </group>
      </Float>

      {/* 4. Glazed Pink Donut (Top Right Hover) */}
      <Float speed={3.5} rotationIntensity={1.4} floatIntensity={2.0}>
        <group position={[1.6, 2.0, -1.0]} rotation={[0.5, 0.2, 0.3]}>
          <DonutModel scale={0.75} animate={true} />
        </group>
      </Float>

      {/* 5. Crispy Fries Carton (Top Left) */}
      <Float speed={2.2} rotationIntensity={0.7} floatIntensity={1.5}>
        <group position={[-1.7, 1.8, -0.8]} rotation={[-0.2, -0.4, -0.15]}>
          <FriesModel scale={0.8} animate={false} />
        </group>
      </Float>

      {/* Glowing Energy Sparkles */}
      <Sparkles
        count={50}
        scale={6}
        size={3.5}
        speed={0.6}
        opacity={0.7}
        color="#ff7a00"
      />
      <Sparkles
        count={30}
        scale={5}
        size={2.5}
        speed={0.4}
        opacity={0.5}
        color="#ff416c"
      />

      {/* Soft Contact Floor Shadows */}
      <ContactShadows
        position={[0, -1.8, 0]}
        opacity={0.65}
        scale={8}
        blur={2.5}
        far={4}
        color="#ff4b1f"
      />
    </group>
  );
};

export const Hero3DCanvas = () => {
  return (
    <div className="w-full h-full min-h-[420px] md:min-h-[520px] relative pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0.5, 5.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 8, 5]} intensity={2.2} color="#ffffff" />
        <pointLight position={[-4, 3, -2]} intensity={2.5} color="#ff416c" />
        <pointLight position={[4, -2, 2]} intensity={2.0} color="#ffa500" />
        <spotLight
          position={[0, 6, 3]}
          angle={0.6}
          penumbra={0.8}
          intensity={2.8}
          color="#ffffff"
          castShadow
        />

        <InteractiveScene />
      </Canvas>
    </div>
  );
};

export default Hero3DCanvas;
