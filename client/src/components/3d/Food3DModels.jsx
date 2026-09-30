/**
 * Procedural 3D Food Models
 * 
 * High-performance, lightweight 3D procedural geometries built with Three.js primitives
 * and physically-based materials (PBR) for zero network GLTF loading delay!
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 1. Procedural 3D Burger Model
export const BurgerModel = ({ scale = 1, animate = false }) => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (animate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Top Bun with Sesame Seeds */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[1.05, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#d48c46" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Sesame Seeds */}
      {[-0.4, 0, 0.4].map((x, i) =>
        [-0.3, 0.2].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x + (j % 2 ? 0.15 : -0.1), 0.95 - Math.abs(x) * 0.3, z]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#f7f3e8" roughness={0.3} />
          </mesh>
        ))
      )}

      {/* Sliced Tomatoes */}
      <mesh position={[0.2, 0.45, 0.1]} rotation={[0.05, 0.3, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.08, 24]} />
        <meshStandardMaterial color="#e63946" roughness={0.3} />
      </mesh>

      {/* Melted Cheddar Cheese (Square with drooping corners) */}
      <mesh position={[0, 0.35, 0]} rotation={[0, 0.78, 0]}>
        <boxGeometry args={[1.4, 0.05, 1.4]} />
        <meshStandardMaterial color="#ffb703" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Juicy Beef Patty */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[1.08, 1.05, 0.32, 32]} />
        <meshStandardMaterial color="#4a2511" roughness={0.9} />
      </mesh>

      {/* Fresh Crispy Lettuce (Wavy green ring) */}
      <mesh position={[0, 0.02, 0]} rotation={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.15, 1.12, 0.07, 16]} />
        <meshStandardMaterial color="#55a630" roughness={0.6} />
      </mesh>

      {/* Bottom Bun */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[1.0, 0.95, 0.28, 32]} />
        <meshStandardMaterial color="#d48c46" roughness={0.4} />
      </mesh>
    </group>
  );
};

// 2. Procedural 3D Pizza Slice Model
export const PizzaSliceModel = ({ scale = 1, animate = false }) => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (animate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <group ref={groupRef} scale={scale} rotation={[-0.3, 0, 0.2]}>
      {/* Pizza Base / Cheese (Cylinder wedge slice) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 0.12, 32, 1, false, 0, Math.PI * 0.35]} />
        <meshStandardMaterial color="#ffc300" roughness={0.4} />
      </mesh>

      {/* Crust Rim */}
      <mesh position={[0, 0.06, 0]}>
        <torusGeometry args={[1.38, 0.14, 16, 32, Math.PI * 0.35]} />
        <meshStandardMaterial color="#c67d38" roughness={0.5} />
      </mesh>

      {/* Pepperoni Slices */}
      {[
        [0.6, 0.09, 0.3],
        [0.85, 0.09, 0.65],
        [0.45, 0.09, 0.6],
        [1.0, 0.09, 0.35],
      ].map((pos, idx) => (
        <mesh key={idx} position={pos} rotation={[0, idx * 0.5, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
          <meshStandardMaterial color="#9e2a2b" roughness={0.3} />
        </mesh>
      ))}

      {/* Basil flakes */}
      {[
        [0.75, 0.09, 0.45],
        [0.35, 0.09, 0.3],
      ].map((pos, idx) => (
        <mesh key={`b-${idx}`} position={pos} rotation={[0.1, idx * 1.2, 0.1]}>
          <boxGeometry args={[0.12, 0.02, 0.18]} />
          <meshStandardMaterial color="#38b000" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// 3. Procedural 3D Soda / Boba Cup Model
export const DrinkCupModel = ({ scale = 1, animate = false }) => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (animate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Cup Body */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.7, 0.5, 1.4, 32]} />
        <meshPhysicalMaterial
          color="#ff4b1f"
          roughness={0.15}
          transmission={0.4}
          thickness={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Cup Lid */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.74, 0.74, 0.12, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>

      {/* Slanted Straw */}
      <mesh position={[0.1, 1.5, 0]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.06, 0.06, 0.9, 16]} />
        <meshStandardMaterial color="#ffb703" roughness={0.2} />
      </mesh>

      {/* Floating Ice Cubes */}
      <mesh position={[0, 0.5, 0]} rotation={[0.4, 0.3, 0.2]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.05} transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

// 4. Procedural 3D Glazed Donut Model
export const DonutModel = ({ scale = 1, animate = false }) => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (animate && groupRef.current) {
      groupRef.current.rotation.x += delta * 0.4;
      groupRef.current.rotation.y += delta * 0.7;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Dough Base */}
      <mesh>
        <torusGeometry args={[0.8, 0.4, 24, 48]} />
        <meshStandardMaterial color="#d49b6a" roughness={0.6} />
      </mesh>

      {/* Glossy Pink Strawberry Icing */}
      <mesh position={[0, 0.06, 0]} scale={[1.02, 1.05, 1.02]}>
        <torusGeometry args={[0.8, 0.37, 24, 48, Math.PI * 2]} />
        <meshStandardMaterial color="#ff4d80" roughness={0.15} metalness={0.1} />
      </mesh>

      {/* Rainbow Sprinkles */}
      {[
        [0.6, 0.38, 0.4, '#ffffff', 0.2],
        [-0.5, 0.38, 0.5, '#ffd166', -0.5],
        [0.7, 0.38, -0.3, '#06d6a0', 0.8],
        [-0.6, 0.38, -0.4, '#118ab2', -0.3],
        [0.1, 0.42, 0.8, '#ffffff', 0.6],
        [-0.1, 0.42, -0.8, '#ffd166', 1.1],
      ].map(([x, y, z, col, rot], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, rot, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.16, 8]} />
          <meshStandardMaterial color={col} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
};

// 5. Procedural 3D Golden Fries in Red Carton
export const FriesModel = ({ scale = 1, animate = false }) => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (animate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Red Fries Box Carton */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.9, 0.9, 0.5]} />
        <meshStandardMaterial color="#e63946" roughness={0.3} />
      </mesh>

      {/* Golden Crispy Fry Sticks */}
      {[
        [-0.25, 0.8, -0.08, 0.1, 0.1],
        [-0.1, 0.9, 0.05, -0.15, 0.05],
        [0.05, 0.85, -0.05, 0.05, -0.1],
        [0.2, 0.95, 0.02, 0.2, 0.15],
        [-0.2, 0.75, 0.1, -0.1, -0.15],
        [0.15, 0.78, 0.08, 0.1, 0.1],
      ].map(([x, y, z, rx, rz], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[rx, 0, rz]}>
          <boxGeometry args={[0.1, 0.75, 0.1]} />
          <meshStandardMaterial color="#ffb703" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
};
