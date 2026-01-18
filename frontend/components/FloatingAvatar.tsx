'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy load 3D component
const Avatar3D = dynamic(() => import('./Avatar3D'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#e5e7eb',
        borderRadius: '50%'
      }}
    />
  ),
});

interface FloatingAvatarProps {
  mode: 'matcha' | 'coffee';
}

export default function FloatingAvatar({ mode }: FloatingAvatarProps) {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate positions using viewport units
  const startX = 'calc(50vw - 400px)'; // center minus half width
  const startY = 'calc(50vh - 200px)'; // center minus half height
  const endX = 'calc(100vw - 400px)';  // right side with padding
  const endY = '2rem';

  return (
    <motion.div
      style={{
        position: 'absolute',
        zIndex: 9999,
        width: '400px',
        height: '400px',
        pointerEvents: 'none',
      }}
      initial={{
        top: startY,
        left: startX,
        scale: 1.5,
      }}
      animate={{
        top: hasAnimated ? endY : startY,
        left: hasAnimated ? endX : startX,
        scale: hasAnimated ? 1 : 1.5,
      }}
      transition={{
        duration: 1,
        delay: 0.3,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
    >
      <Avatar3D mode={mode} />
    </motion.div>
  );
}