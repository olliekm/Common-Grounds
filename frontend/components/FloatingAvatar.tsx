'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy load 3D component
const Avatar3D = dynamic(() => import('./Avatar3D'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-200 rounded-full animate-pulse" />,
});

interface FloatingAvatarProps {
  mode: 'matcha' | 'coffee';
}

export default function FloatingAvatar({ mode }: FloatingAvatarProps) {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setHasAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed z-50"
      initial={{
        top: '50%',
        left: '50%',
        x: '-50%',
        y: '-50%',
        scale: 1.5,
      }}
      animate={{
        top: hasAnimated ? '2rem' : '50%',
        left: hasAnimated ? 'auto' : '50%',
        right: hasAnimated ? '2rem' : 'auto',
        x: hasAnimated ? '0%' : '-50%',
        y: hasAnimated ? '0%' : '-50%',
        scale: hasAnimated ? 1 : 1.5,
      }}
      transition={{
        duration: 1,
        delay: 0.3,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
      style={{
        width: '200px',
        height: '200px',
      }}
    >
      <Avatar3D mode={mode} />
    </motion.div>
  );
}