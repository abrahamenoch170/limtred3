import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../../services/soundService';

// Glint Button: Sharp corners, bold borders, uppercase text
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  onClick,
  onMouseEnter,
  ...props 
}) => {
  const baseStyles = "font-sans uppercase tracking-[0.2em] font-bold py-3 px-6 text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed sharp-corners";
  
  const variants = {
    primary: "bg-[#39b54a] text-black hover:bg-[#2ea03f] border border-[#39b54a]",
    secondary: "bg-[#8b5cf6] text-white hover:bg-[#7c3aed] border border-[#8b5cf6]",
    outline: "bg-transparent text-[#39b54a] border border-[#39b54a] hover:bg-[#39b54a]/10",
    ghost: "bg-transparent text-[#666666] hover:text-white border border-transparent",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      playSound('click');
      if (onClick) onClick(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      playSound('hover');
      if (onMouseEnter) onMouseEnter(e);
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className} rounded-none`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </button>
  );
};

// Glitch Button for High Impact Actions
export const GlitchButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, onClick, className, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
      setIsHovered(true);
      playSound('hover');
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      playSound('deploy');
      if (onClick) onClick(e);
  };

  return (
    <button
      className={`relative group font-mono font-bold uppercase tracking-widest px-8 py-4 bg-transparent border border-[#39b54a] text-[#39b54a] overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      {...props}
    >
      {/* Background Fill Animation */}
      <div className="absolute inset-0 bg-[#39b54a] translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out" />
      
      {/* Main Text */}
      <span className="relative z-10 group-hover:text-black transition-colors duration-200 flex items-center justify-center gap-2">
        {children}
      </span>

      {/* Glitch Shadows (Only visible on hover) */}
      <motion.span
        className="absolute top-0 left-0 z-0 opacity-0 text-[#39b54a] font-bold uppercase tracking-widest px-8 py-4 w-full h-full flex items-center justify-center gap-2 select-none pointer-events-none mix-blend-difference"
        animate={isHovered ? { 
          opacity: [0, 0.8, 0],
          x: [0, -2, 2, -1, 0],
          y: [0, 1, -1, 0]
        } : {}}
        transition={{ repeat: Infinity, duration: 0.2 }}
      >
        {children}
      </motion.span>
    </button>
  );
};

// Glint Card: Dark surface, sharp border
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => {
  return (
    <div 
        className={`bg-[#111111] border border-[#1f1f1f] p-6 rounded-none backdrop-blur-md ${className}`}
        onClick={onClick}
    >
      {children}
    </div>
  );
};

// Glint Input: Transparent, border-bottom
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <input 
      className={`w-full bg-transparent border-b-2 border-[#1f1f1f] focus:border-[#39b54a] text-white font-mono py-4 px-2 outline-none transition-colors rounded-none placeholder-[#666666] ${className}`}
      {...props}
    />
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'text-[#39b54a]' }) => (
  <span className={`font-mono text-xs border border-[#1f1f1f] bg-[#0c0c0c] px-2 py-1 ${color} rounded-none`}>
    {children}
  </span>
);