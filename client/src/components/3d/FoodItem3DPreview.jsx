/**
 * Individual Dish 3D Interactive Preview
 * Renders a specific 3D model corresponding to the dish category/model type.
 */

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls, Sparkles } from '@react-three/drei';
import { BurgerModel, PizzaSliceModel, DrinkCupModel, DonutModel, FriesModel } from './Food3DModels';

const ModelRenderer = ({ type = 'burger' }) => {
  switch (type) {
    case 'pizza':
      return <PizzaSliceModel scale={1.2} animate={true} />;
    case 'drink':
      return <DrinkCupModel scale={1.1} animate={true} />;
    case 'donut':
      return <DonutModel scale={1.0} animate={true} />;
    case 'fries':
      return <FriesModel scale={1.1} animate={true} />;
    case 'burger':
    default:
      return <BurgerModel scale={1.2} animate={true} />;
  }
};

export const FoodItem3DPreview = ({ type = 'burger', height = '180px' }) => {
  return (
    <div style={{ height }} className="w-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0.2, 3.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 5, 3]} intensity={2.2} />
        <pointLight position={[-3, 2, -2]} intensity={2.0} color="#ff416c" />
        <pointLight position={[3, -2, 2]} intensity={1.5} color="#ffa500" />

        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
            <ModelRenderer type={type} />
          </Float>
        </Suspense>

        <Sparkles count={15} scale={3} size={2} speed={0.4} color="#ff7a00" opacity={0.6} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={2}
          maxPolarAngle={Math.PI / 2 + 0.3}
          minPolarAngle={Math.PI / 2 - 0.5}
        />
      </Canvas>
    </div>
  );
};

export default FoodItem3DPreview;
