import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { classNames } from '~/utils/classNames';

interface BorderBeamProps {
  lightWidth?: number;
  duration?: number;
  lightColor?: string;
  borderWidth?: number;
  className?: string;
  [key: string]: unknown;
}

export function BorderBeam({
  lightWidth = 200,
  duration = 10,
  lightColor = 'rgba(255, 255, 255, 0.5)',
  borderWidth = 1,
  className,
  ...props
}: BorderBeamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current?.parentElement) {
        const parent = containerRef.current.parentElement;
        setDimensions({
          width: parent.offsetWidth,
          height: parent.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { width, height } = dimensions;
  const perimeter = 2 * (width + height);
  const lightSize = lightWidth;

  // Calculate positions for the four corners
  const positions = [
    { x: 0, y: 0 }, // Top-left
    { x: width - lightSize, y: 0 }, // Top-right
    { x: width - lightSize, y: height - lightSize }, // Bottom-right
    { x: 0, y: height - lightSize }, // Bottom-left
  ];

  return (
    <div
      ref={containerRef}
      className={classNames('absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none', className)}
      style={
        {
          '--duration': `${duration}s`,
          '--light-color': lightColor,
        } as CSSProperties
      }
      {...props}
    >
      {width > 0 && height > 0 && (
        <motion.div
          className="absolute"
          style={
            {
              width: `${lightSize}px`,
              height: `${lightSize}px`,
              background: `radial-gradient(ellipse at center, var(--light-color), transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(20px)',
            } as CSSProperties
          }
          animate={{
            x: [positions[0].x, positions[1].x, positions[2].x, positions[3].x, positions[0].x],
            y: [positions[0].y, positions[1].y, positions[2].y, positions[3].y, positions[0].y],
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
        />
      )}
    </div>
  );
}

