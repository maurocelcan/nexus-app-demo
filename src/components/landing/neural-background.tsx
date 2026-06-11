"use client";

import { useEffect, useRef } from "react";
import { alpha } from "./landing-style";

const PARTICLE_COUNT = 22;
const MAX_DIST = 155;
const SPEED = 0.28;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  accent: boolean;
}

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const setSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setSize();

    const observer = new ResizeObserver(setSize);
    observer.observe(canvas);

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = SPEED * (0.5 + Math.random() * 0.5);
      return {
        x: canvas.offsetWidth * (0.08 + Math.random() * 0.84),
        y: canvas.offsetHeight * (0.08 + Math.random() * 0.84),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1 + Math.random() * 1.2,
        accent: Math.random() < 0.18,
      };
    });

    let rafId = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0) {
          particle.x = 0;
          particle.vx *= -1;
        }
        if (particle.x > width) {
          particle.x = width;
          particle.vx *= -1;
        }
        if (particle.y < 0) {
          particle.y = 0;
          particle.vy *= -1;
        }
        if (particle.y > height) {
          particle.y = height;
          particle.vy *= -1;
        }
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < MAX_DIST) {
            const opacity = (1 - distance / MAX_DIST) * 0.1;
            context.beginPath();
            context.moveTo(particles[i].x, particles[i].y);
            context.lineTo(particles[j].x, particles[j].y);
            context.strokeStyle = alpha("primary", opacity);
            context.lineWidth = 0.5;
            context.stroke();
          }
        }
      }

      for (const particle of particles) {
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = particle.accent
          ? alpha("accent", 0.32)
          : alpha("primary", 0.38);
        context.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
