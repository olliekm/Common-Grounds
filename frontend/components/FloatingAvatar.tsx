'use client';

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
  return (
    <div
      style={{
        position: 'absolute',
        width: '180px',
        height: '180px',
        left: '50%',
        transform: 'translateX(-50%)',
        top: '-40px',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <Avatar3D mode={mode} />
    </div>
  );
}