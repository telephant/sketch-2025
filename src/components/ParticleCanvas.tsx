'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Particle } from '@/types';

interface ParticleCanvasProps {
  particles: Particle[];
  onComplete?: () => void;
}

export function ParticleCanvas({ particles, onComplete }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let aliveCount = 0;

    particlesRef.current.forEach((particle) => {
      if (particle.life <= 0) return;

      aliveCount++;

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.3; // Gravity
      particle.life -= 1;
      particle.rotation += particle.rotationSpeed;

      // Calculate opacity based on life
      const opacity = Math.max(0, particle.life / particle.maxLife);

      // Draw particle
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity;

      if (particle.emoji) {
        ctx.font = `${particle.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(particle.emoji, 0, 0);
      } else if (particle.color) {
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      }

      ctx.restore();
    });

    if (aliveCount > 0) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }, []);

  useEffect(() => {
    if (particles.length > 0) {
      particlesRef.current = [...particles];
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// Helper function to create explosion particles
export function createExplosionParticles(
  x: number,
  y: number,
  emoji: string,
  count: number = 60
): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 3 + Math.random() * 8;
    const size = 16 + Math.random() * 16;

    particles.push({
      id: i,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5,
      life: 60 + Math.random() * 30,
      maxLife: 90,
      size,
      emoji,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    });
  }

  return particles;
}

// Helper function to create star particles
export function createStarParticles(
  x: number,
  y: number,
  color: string,
  count: number = 40
): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 2 + Math.random() * 4;

    particles.push({
      id: i,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 8,
      life: 80 + Math.random() * 40,
      maxLife: 120,
      size: 4 + Math.random() * 4,
      color,
      rotation: 0,
      rotationSpeed: 0,
    });
  }

  return particles;
}

// Helper function to create coin particles
export function createCoinParticles(
  x: number,
  y: number,
  count: number = 20
): Particle[] {
  const particles: Particle[] = [];
  const coins = ['💰', '🪙', '✨'];

  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
    const speed = 5 + Math.random() * 8;

    particles.push({
      id: i,
      x: x + (Math.random() - 0.5) * 40,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 60 + Math.random() * 30,
      maxLife: 90,
      size: 20 + Math.random() * 12,
      emoji: coins[Math.floor(Math.random() * coins.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 15,
    });
  }

  return particles;
}

// Helper function to create confetti particles
export function createConfettiParticles(
  x: number,
  y: number,
  count: number = 50
): Particle[] {
  const particles: Particle[] = [];
  const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
    const speed = 4 + Math.random() * 8;

    particles.push({
      id: i,
      x: x + (Math.random() - 0.5) * 100,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 80 + Math.random() * 40,
      maxLife: 120,
      size: 8 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 20,
    });
  }

  return particles;
}
