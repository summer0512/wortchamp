'use client';
import { useState, useEffect, useRef } from 'react';

interface ConfettiProps {
  trigger: boolean;
  duration?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
];

export function Confetti({ trigger, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 150; i++) {
      newParticles.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6
      });
    }

    setParticles(newParticles);

    // Animation loop
    let updated = newParticles;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      updated = updated.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.1, // gravity
        rotation: p.rotation + p.rotationSpeed
      })).filter(p => p.y < canvas.height + 50);

      // Draw particles
      updated.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        ctx.restore();
      });

      if (updated.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    // Clean up
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger]);

  useEffect(() => {
    if (!trigger) return;

    const timer = setTimeout(() => {
      setParticles([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [trigger, duration]);

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  );
}