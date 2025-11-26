import React from 'react';
import { classNames } from '~/utils/classNames';

type TColorProp = string | string[];

interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: TColorProp;
  className?: string;
  children: React.ReactNode;
}

/**
 * @name Shine Border
 * @description It is an animated background border effect component with easy to use and configurable props.
 * @param borderRadius defines the radius of the border.
 * @param borderWidth defines the width of the border.
 * @param duration defines the animation duration to be applied on the shining border
 * @param color a string or string array to define border color.
 * @param className defines the class name to be applied to the component
 * @param children contains react node elements.
 */
export function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  color = '#ffffff',
  className,
  children,
}: ShineBorderProps) {
  const colorValue = color instanceof Array ? color.join(',') : color;

  return (
    <div
      style={
        {
          '--border-radius': `${borderRadius}px`,
        } as React.CSSProperties
      }
      className={classNames(
        'relative grid h-full w-full place-items-center rounded-3xl bg-transparent',
        className
      )}
    >
      <div
        style={
          {
            '--border-width': `${borderWidth}px`,
            '--border-radius': `${borderRadius}px`,
            '--shine-pulse-duration': `${duration}s`,
            '--mask-linear-gradient': `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            '--background-radial-gradient': `radial-gradient(transparent,transparent, ${colorValue},transparent,transparent)`,
          } as React.CSSProperties
        }
        className="shine-border-effect"
      />
      <div className="shine-border-wrapper relative w-full h-full">
        {children}
      </div>
    </div>
  );
}

