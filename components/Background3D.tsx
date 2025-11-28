import React, { useEffect, useRef } from 'react';

const Background3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Performance configuration
    // We limit max cubes on mobile to ensure it runs smooth on old Androids
    const isMobile = window.innerWidth < 768;
    const GRID_SIZE = isMobile ? 3 : 5; // 3x3 on mobile, 5x5 on desktop
    const CUBE_SIZE = isMobile ? 30 : 40;
    const SPACING = isMobile ? 60 : 80;
    const ROTATION_SPEED = 0.005; // Slow, hypnotic movement

    let animationFrameId: number;
    let time = 0;

    // Cube vertices relative to center (Size 1)
    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // Front face
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]      // Back face
    ];

    // Edges connecting vertices
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Front face
      [4, 5], [5, 6], [6, 7], [7, 4], // Back face
      [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting lines
    ];

    const resize = () => {
      // Handle High DPI displays but cap pixel ratio to 2 for performance
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    const project = (x: number, y: number, z: number, width: number, height: number) => {
      // Simple weak perspective projection
      const scale = 300 / (300 + z);
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

    const drawCube = (cx: number, cy: number, offsetTime: number) => {
      // Individual cube rotation
      const angleX = time * ROTATION_SPEED + offsetTime * 0.5;
      const angleY = time * ROTATION_SPEED * 0.5 + offsetTime * 0.5;

      // Calculate projected vertices
      const projected = vertices.map(v => {
        // Scale first
        const scaled = [v[0] * CUBE_SIZE, v[1] * CUBE_SIZE, v[2] * CUBE_SIZE];
        // Rotate
        const r1 = rotateX(scaled, angleX);
        const r2 = rotateY(r1, angleY);
        // Translate to grid position
        // We add a slight Z-wave based on time for "breathing" effect
        const z = r2[2] + Math.sin(time * 0.002 + offsetTime) * 20;
        return project(r2[0] + cx, r2[1] + cy, z, window.innerWidth, window.innerHeight);
      });

      // Draw edges
      ctx.beginPath();
      // Style: "Glint" green/white mix, very low opacity
      ctx.strokeStyle = `rgba(57, 181, 74, ${0.1 + Math.sin(time * 0.01 + offsetTime) * 0.05})`; 
      ctx.lineWidth = 1;

      edges.forEach(edge => {
        const p1 = projected[edge[0]];
        const p2 = projected[edge[1]];
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
      });
      ctx.stroke();
    };

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Fade out effect for "trails" or just clear
      ctx.clearRect(0, 0, width, height);

      // Grid offsets to center
      const offsetX = (GRID_SIZE - 1) * SPACING / 2;
      const offsetY = (GRID_SIZE - 1) * SPACING / 2;

      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          // Center the grid 
          const x = (i * SPACING) - offsetX;
          const y = (j * SPACING) - offsetY;
          
          // Use indices for unique rotation offsets
          drawCube(x, y, i * j + i);
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
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default Background3D;