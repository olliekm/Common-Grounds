'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface AnimatedModelProps {
  modelPath: string;
  animationType: 'calm' | 'energetic';
}

function AnimatedModel({ modelPath, animationType }: AnimatedModelProps) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef<THREE.Group>(null);

  // Suppress texture errors by applying fallback materials
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.MeshStandardMaterial;
        // If texture is missing, just use a solid color
        if (!material.map) {
          material.color.set(animationType === 'calm' ? '#9dbbae' : '#B9967C');
        }
      }
    });
  }, [scene, animationType]);

  useFrame((state) => {
    if (modelRef.current) {
      if (animationType === 'calm') {
        modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
        modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      } else {
        modelRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 1.5)) * 0.15;
        modelRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  return <primitive ref={modelRef} object={scene} scale={2} />;
}

interface Avatar3DProps {
  mode: 'matcha' | 'coffee';
}

export default function Avatar3D({ mode }: Avatar3DProps) {
  const modelPath = mode === 'matcha' ? '/glb/matcha.glb' : '/glb/coffee.glb';
  const animationType = mode === 'matcha' ? 'calm' : 'energetic';

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[0, 10, 0]} angle={0.3} intensity={0.5} />

      <AnimatedModel modelPath={modelPath} animationType={animationType} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 2.5}
      />
    </Canvas>
  );
}