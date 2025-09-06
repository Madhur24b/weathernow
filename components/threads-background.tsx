'use client';

import dynamic from 'next/dynamic';

const ClientThreads = dynamic(() => import('./client-threads'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh',
      background: 'rgb(5, 10, 25)' 
    }} />
  )
});

export default function ThreadsBackground() {
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0,
      width: '100vw', 
      height: '100vh',
      background: 'transparent',
      mixBlendMode: 'plus-lighter',
      opacity: 1,
      zIndex: 1,
      pointerEvents: 'none'
    }}>
      <ClientThreads
        color={[0.6, 0.8, 1.0]}
        amplitude={3.0}
        distance={0.8}
        enableMouseInteraction={true}
      />
    </div>
  );
}
