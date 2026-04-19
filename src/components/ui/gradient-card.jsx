import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

const GradientCard = ({
  children,
  className = "",
  glowColor = "purple", // "purple" | "emerald" | "blue" | "rose" | "primary"
  onClick,
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const glowColors = {
    purple: {
      glow1: "rgba(172, 92, 255, 0.5)",
      glow2: "rgba(56, 189, 248, 0.5)",
      glow3: "rgba(161, 58, 229, 0.5)",
      border: "rgba(172, 92, 255, 0.6)",
      shadow: "rgba(78, 99, 255, 0.15)",
    },
    emerald: {
      glow1: "rgba(52, 211, 153, 0.5)",
      glow2: "rgba(16, 185, 129, 0.4)",
      glow3: "rgba(5, 150, 105, 0.5)",
      border: "rgba(52, 211, 153, 0.6)",
      shadow: "rgba(16, 185, 129, 0.15)",
    },
    blue: {
      glow1: "rgba(59, 130, 246, 0.5)",
      glow2: "rgba(96, 165, 250, 0.4)",
      glow3: "rgba(37, 99, 235, 0.5)",
      border: "rgba(59, 130, 246, 0.6)",
      shadow: "rgba(59, 130, 246, 0.15)",
    },
    rose: {
      glow1: "rgba(244, 63, 94, 0.5)",
      glow2: "rgba(251, 113, 133, 0.4)",
      glow3: "rgba(225, 29, 72, 0.5)",
      border: "rgba(244, 63, 94, 0.6)",
      shadow: "rgba(244, 63, 94, 0.15)",
    },
    primary: {
      glow1: "rgba(99, 102, 241, 0.6)",
      glow2: "rgba(129, 140, 248, 0.5)",
      glow3: "rgba(79, 70, 229, 0.6)",
      border: "rgba(99, 102, 241, 0.7)",
      shadow: "rgba(99, 102, 241, 0.2)",
    },
  };

  const colors = glowColors[glowColor] || glowColors.purple;

  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = -(y / rect.height) * 4;
      const rotateY = (x / rect.width) * 4;
      setRotation({ x: rotateX, y: rotateY });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative rounded-3xl overflow-hidden ${className}`}
      style={{
        transformStyle: "preserve-3d",
        boxShadow: isHovered
          ? `0 -6px 60px 4px ${colors.shadow}, 0 0 8px 0 rgba(0, 0, 0, 0.3)`
          : `0 -3px 30px 2px ${colors.shadow}, 0 0 4px 0 rgba(0, 0, 0, 0.2)`,
      }}
      animate={{
        y: isHovered ? -3 : 0,
        rotateX: rotation.x,
        rotateY: rotation.y,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      {/* Glass reflection overlay */}
      <motion.div
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, transparent 80%, rgba(255,255,255,0.03) 100%)",
        }}
        animate={{
          opacity: isHovered ? 0.8 : 0.5,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Noise texture */}
      <motion.div
        className="absolute inset-0 opacity-20 mix-blend-overlay z-[1] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Bottom glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2/3 z-[2] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at bottom right, ${colors.glow1} -10%, transparent 70%),
            radial-gradient(ellipse at bottom left, ${colors.glow2} -10%, transparent 70%)
          `,
          filter: "blur(30px)",
        }}
        animate={{
          opacity: isHovered ? 0.7 : 0.5,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Center glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/2 z-[3] pointer-events-none"
        style={{
          background: `radial-gradient(circle at bottom center, ${colors.glow3} -20%, transparent 60%)`,
          filter: "blur(35px)",
        }}
        animate={{
          opacity: isHovered ? 0.6 : 0.4,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Bottom border glow line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[1px] z-[6] pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${colors.border} 50%, transparent 100%)`,
        }}
        animate={{
          opacity: isHovered ? 1 : 0.6,
          boxShadow: isHovered
            ? `0 0 12px 2px ${colors.glow1}, 0 0 20px 4px ${colors.glow3}`
            : `0 0 6px 1px ${colors.glow1}`,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Left edge glow */}
      <motion.div
        className="absolute bottom-0 left-0 h-1/4 w-[1px] z-[6] pointer-events-none rounded-full"
        style={{
          background: `linear-gradient(to top, ${colors.border} 0%, transparent 80%)`,
        }}
        animate={{
          opacity: isHovered ? 0.8 : 0.4,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Right edge glow */}
      <motion.div
        className="absolute bottom-0 right-0 h-1/4 w-[1px] z-[6] pointer-events-none rounded-full"
        style={{
          background: `linear-gradient(to top, ${colors.border} 0%, transparent 80%)`,
        }}
        animate={{
          opacity: isHovered ? 0.8 : 0.4,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Content layer */}
      <div className="relative z-[10]">{children}</div>
    </motion.div>
  );
};

export { GradientCard };
export default GradientCard;
