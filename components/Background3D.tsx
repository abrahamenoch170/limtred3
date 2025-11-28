import React, { useEffect, useRef } from 'react';
import { COLORS } from '../constants';

const Background3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // --- PERFORMANCE CONFIGURATION ---
    // Detect mobile to reduce polygon count for "Old Android" compatibility
    const isMobile = window.innerWidth < 768;
    
    const GRID_SIZE = isMobile ? 3 : 6; // Compact grid on mobile
    const CUBE_SIZE = isMobile ? 25 : 35;
    const SPACING = isMobile ? 55 : 85;
    
    // Slow, hypnotic speed to prevent lag and visual noise
    const ROTATION_SPEED = 0.003; 

    let animationFrameId: number;
    let time = 0;

    // Cube Geometry (Vertices relative to center 0,0,0)
    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // Front Z=-1
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]      // Back Z=1
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Front Face
      [4, 5], [5, 6], [6, 7], [7, 4], // Back Face
      [0, 4], [1, 5], [2, 6], [3, 7]  // Connectors
    ];

    const resize = () => {
      // Limit pixel ratio to save GPU
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    const project = (x: number, y: number, z: number, width: number, height: number) => {
      // Perspective Projection
      const fov = 400;
      const scale = fov / (fov + z);
      const px = x * scale + width / 2;
      const py = y * scale + height / 2;
      return [px, py];
    };

    const rotateX = (point: number[], angle: number) => {
      const y = point[1];
      const z = point[2];
      return [
        point[0],
        y * Math.cos(angle) - z * Math.sin(angle),
        y * Math.sin(angle) + z * Math.cos(angle)
      ];
    };

    const rotateY = (point: number[], angle: number) => {
      const x = point[0];
      const z = point[2];
      return [
        x * Math.cos(angle) + z * Math.sin(angle),
        point[1],
        -x * Math.sin(angle) + z * Math.cos(angle)
      ];
    };

    const drawCube = (cx: number, cy: number, gridX: number, gridY: number) => {
      // Unique rotation offset based on grid position for "Alive" feel
      const offsetIndex = gridX * GRID_SIZE + gridY;
      const angleX = time * ROTATION_SPEED + offsetIndex * 0.2;
      const angleY = time * ROTATION_SPEED * 0.8 + offsetIndex * 0.2;

      // Transform Vertices
      const projectedVertices = vertices.map(v => {
        // 1. Scale
        const scaled = [v[0] * CUBE_SIZE, v[1] * CUBE_SIZE, v[2] * CUBE_SIZE];
        // 2. Rotate
        const r1 = rotateX(scaled, angleX);
        const r2 = rotateY(r1, angleY);
        // 3. Translate (Breathing Z-axis movement)
        const waveZ = Math.sin(time * 0.01 + offsetIndex) * 30;
        return project(r2[0] + cx, r2[1] + cy, r2[2] + waveZ, window.innerWidth, window.innerHeight);
      });

      // Draw Edges
      ctx.beginPath();
      
      // --- COLOR LOGIC: Checkerboard Pattern ---
      // Alternates between Glint Green and Hype Purple
      const isAlt = (gridX + gridY) % 2 === 0;
      ctx.strokeStyle = isAlt ? COLORS.green : COLORS.purple;
      
      // Dynamic Opacity: Pulses slightly
      ctx.globalAlpha = isAlt ? 0.25 : 0.15; 
      ctx.lineWidth = 1.2; // Keep lines sharp

      edges.forEach(edge => {
        const p1 = projectedVertices[edge[0]];
        const p2 = projectedVertices[edge[1]];
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
      });
      ctx.stroke();
    };

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      const totalWidth = (GRID_SIZE - 1) * SPACING;
      const totalHeight = (GRID_SIZE - 1) * SPACING;
      const startX = -totalWidth / 2;
      const startY = -totalHeight / 2;

      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const x = startX + i * SPACING;
          const y = startY + j * SPACING;
          // Draw with grid indices to determine color
          drawCube(x, y, i, j);
        }
      }

      time++;
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', resize);
    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ 
        // No mix-blend-mode to ensure colors pop against the void black
        opacity: 1 
      }}
    />
  );
};

export default Background3D;