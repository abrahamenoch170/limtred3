import React from 'react';

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
  ...props 
}) => {
  const baseStyles = "font-sans uppercase tracking-[0.2em] font-bold py-3 px-6 text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed sharp-corners";
  
  const variants = {
    primary: "bg-[#39b54a] text-black hover:bg-[#2ea03f] border border-[#39b54a]",
    secondary: "bg-[#8b5cf6] text-white hover:bg-[#7c3aed] border border-[#8b5cf6]",
    outline: "bg-transparent text-[#39b54a] border border-[#39b54a] hover:bg-[#39b54a]/10",
    ghost: "bg-transparent text-[#666666] hover:text-white border border-transparent",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className} rounded-none`}
      {...props}
    >
      {children}
    </button>
  );
};

// Glint Card: Dark surface, sharp border
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#111111] border border-[#1f1f1f] p-6 rounded-none backdrop-blur-md ${className}`}>
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
