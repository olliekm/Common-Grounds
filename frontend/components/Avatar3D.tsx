'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';
import { Bounds } from '@react-three/drei';

interface AnimatedModelProps {
  modelPath: string;
  animationType: 'calm' | 'energetic';
}

function AnimatedModel({ modelPath, animationType }) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        // Kill realism
        child.material.metalness = 0.5;
        child.material.roughness = 1;

        // Force brightness
        child.material.color.multiplyScalar(1);

        // Emissive boost (THIS IS THE KEY)
        child.material.emissive = child.material.color.clone();
        child.material.emissiveIntensity = 0.2;

        child.material.needsUpdate = true;
      }
    });
  }, [scene]);

  console.log(scene);

  useFrame((state) => {
    if (!modelRef.current) return;

    if (animationType === 'calm') {
      modelRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
      modelRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    } else {
      modelRef.current.position.y =
        Math.abs(Math.sin(state.clock.elapsedTime * 1.5)) * 0.15;
      modelRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <Bounds fit clip observe margin={3}>
          <primitive ref={modelRef} object={scene} scale={0.1} />
    </Bounds>
  );
}

interface Avatar3DProps {
  mode: 'matcha';
}

export default function Avatar3D({ mode }: Avatar3DProps) {
  const modelPath = '/glb/matcha/matcha.glb';
  const animationType = mode === 'matcha' ? 'calm' : 'energetic';

  return (
  <Canvas
    camera={{
      fov: 45,
      near: 0.1,
      far: 1000,
    }}
      style={{ width: '100%', height: '100%' }}
    gl={{ alpha: true }}
    onCreated={({ gl }) => {
      gl.setClearColor(0x000000, 0); // transparent
    }}
  >
{/* Base fill — removes darkness completely */}
<ambientLight intensity={2.5} />

{/* Front key light — main visibility */}
<directionalLight
  position={[0, 0, 10]}
  intensity={2.2}
/>

{/* Top fill — prevents top shadowing */}
<directionalLight
  position={[0, 10, 0]}
  intensity={1.5}
/>

{/* Side fills — kill edge shadows */}
<directionalLight
  position={[10, 0, 0]}
  intensity={1.2}
/>

<directionalLight
  position={[-10, 0, 0]}
  intensity={1.2}
/>

      <Suspense fallback={null}>
        <AnimatedModel modelPath={modelPath} animationType={animationType} />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
      />
    </Canvas>
  );
}