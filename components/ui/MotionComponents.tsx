import React from 'react';
import { motion, Variants } from 'framer-motion';

// --- Text Reveal Animation ---
// Splits text into words/characters and staggers them in
interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

export const TextReveal: React.FC<TextRevealProps> = ({ 
  text, 
  className = "", 
  delay = 0,
  duration = 0.5 
}) => {
  // Split by words
  const words = text.split(" ");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: duration,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: duration,
      },
    },
  };

  return (
    <motion.h1
      className={`flex flex-wrap overflow-hidden ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index} className="mr-[0.25em]">
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
};

// --- Scroll Fade Up ---
// Elements slide up when they enter the viewport
interface ScrollFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
}

export const ScrollFade: React.FC<ScrollFadeProps> = ({ 
  children, 
  className = "", 
  delay = 0,
  threshold = 0.2
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{ duration: 0.8, delay: delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
};

// --- Stagger Container ---
// Useful for grids (like features or launchpad items)
export const StaggerContainer: React.FC<{ children: React.ReactNode, className?: string, delay?: number }> = ({ 
  children, 
  className = "",
  delay = 0
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay
      }
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  };

  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
};