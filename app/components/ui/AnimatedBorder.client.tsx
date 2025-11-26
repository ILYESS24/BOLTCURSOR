'use client';

import React, { useEffect } from 'react';
import { classNames } from '~/utils/classNames';

interface AnimatedBorderProps {
  className?: string;
  children: React.ReactNode;
  borderWidth?: number;
  animationDuration?: number;
}

export function AnimatedBorder({
  className,
  children,
  borderWidth = 1,
  animationDuration = 3,
}: AnimatedBorderProps) {
  useEffect(() => {
    // Inject styles if not already present
    if (typeof document !== 'undefined') {
      const styleId = 'animated-border-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .animated-border-container {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: var(--border-width, 1px);
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.1) 0%,
              rgba(255, 255, 255, 0.3) 25%,
              rgba(255, 255, 255, 0.5) 50%,
              rgba(255, 255, 255, 0.3) 75%,
              rgba(255, 255, 255, 0.1) 100%
            );
            background-size: 200% 100%;
            animation: animatedBorderMove var(--animation-duration, 3s) linear infinite;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: xor;
            -webkit-mask-composite: xor;
            pointer-events: none;
            z-index: 0;
          }

          .animated-border-gradient {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background: linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.6) 50%,
              transparent 100%
            );
            background-size: 200% 100%;
            animation: animatedBorderShine calc(var(--animation-duration, 3s) * 2) linear infinite;
            pointer-events: none;
          }

          @keyframes animatedBorderMove {
            0% {
              background-position: 0% 0%;
            }
            100% {
              background-position: 200% 0%;
            }
          }

          @keyframes animatedBorderShine {
            0% {
              background-position: -200% 0%;
            }
            100% {
              background-position: 200% 0%;
            }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <div
      className={classNames('relative', className)}
      style={
        {
          '--border-width': `${borderWidth}px`,
          '--animation-duration': `${animationDuration}s`,
        } as React.CSSProperties
      }
    >
      <div className="animated-border-container">
        <div className="animated-border-gradient" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

