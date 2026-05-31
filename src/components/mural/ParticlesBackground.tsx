'use client';

import { useEffect, useRef } from 'react';

export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let width = 0;
    let height = 0;

    const particles: Array<{ x: number, y: number, vx: number, vy: number, size: number, phase: number, speed: number }> = [];

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Create 20 particles
      particles.length = 0;
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2, // very slow
          vy: -Math.random() * 0.3 - 0.1,  // float upwards slowly
          size: Math.random() * 2 + 1.5,   // 1.5px to 3.5px radius
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.001 + 0.0005 // slow phase change
        });
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        // Move
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.speed;

        // Wrap around screen
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Pulse opacity 0.2 to 0.7
        const opacity = 0.45 + 0.25 * Math.sin(p.phase);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(229, 200, 138, ${opacity})`; // #E5C88A with opacity
        ctx.shadowColor = '#E5C88A';
        ctx.shadowBlur = 10;
        ctx.fill();
      });

      rafId = requestAnimationFrame(render);
    };

    init();
    window.addEventListener('resize', init);
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
