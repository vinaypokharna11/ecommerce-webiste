'use client';

import React, { useRef } from 'react';
import { gsap } from 'gsap';

/**
 * TextScatter (React Bits Pro)
 * 
 * Interactive letter scatter effect with physics-based cursor repulsion
 * and elastic return animation.
 * 
 * @param {string} text - The text string to display and scatter
 * @param {string} className - Additional CSS classes
 * @param {string|React.ComponentType} as - Render tag / component (default: 'span')
 * @param {number} velocity - Scatter distance intensity in pixels (default: 200)
 * @param {number} rotation - Max scatter rotation in degrees (default: 90)
 * @param {number} scale - Scale during scatter (default: 1)
 * @param {number} returnAfter - Delay in seconds before elastic return (default: 1)
 * @param {number} duration - Animation duration in seconds (default: 2)
 */
export function TextScatter({
  text = 'Nakoda Imitation',
  className = '',
  as = 'span',
  velocity = 150,
  rotation = 60,
  scale = 1.05,
  returnAfter = 0.8,
  duration = 1.8,
  children,
}) {
  const triggerScatter = (e) => {
    const target = e.currentTarget;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const angle = Math.atan2(centerY - mouseY, centerX - mouseX);
    const randomVelocity = velocity * (0.8 + 0.4 * Math.random());
    const targetX = Math.cos(angle) * randomVelocity;
    const targetY = Math.sin(angle) * randomVelocity;
    const randomRotation = (Math.random() - 0.5) * rotation * 2;

    gsap.to(target, {
      x: targetX,
      y: targetY,
      rotation: randomRotation,
      scale: scale,
      duration: duration,
      ease: 'power4.out',
      overwrite: 'auto',
      onComplete: () => {
        gsap.to(target, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: duration,
          delay: returnAfter,
          ease: 'elastic.out(1, 0.3)',
          overwrite: 'auto',
        });
      },
    });
  };

  const Component = as;
  const contentText = typeof text === 'string' && text.length > 0 ? text : '';

  return (
    <Component className={`text-scatter inline-flex items-center flex-wrap ${className}`}>
      {contentText.split('').map((char, index) => (
        <span
          key={index}
          className="text-scatter__letter inline-block cursor-default select-none transition-colors"
          onMouseEnter={triggerScatter}
          style={{ willChange: 'transform' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
      {children}
    </Component>
  );
}

/**
 * ScatterItem
 * Component to apply the exact same scatter physics to arbitrary elements (like logo emblems).
 */
export function ScatterItem({
  children,
  className = '',
  velocity = 120,
  rotation = 45,
  scale = 1.1,
  returnAfter = 0.8,
  duration = 1.6,
  ...props
}) {
  const handleMouseEnter = (e) => {
    const target = e.currentTarget;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const angle = Math.atan2(centerY - mouseY, centerX - mouseX);
    const randomVelocity = velocity * (0.8 + 0.4 * Math.random());
    const targetX = Math.cos(angle) * randomVelocity;
    const targetY = Math.sin(angle) * randomVelocity;
    const randomRotation = (Math.random() - 0.5) * rotation * 2;

    gsap.to(target, {
      x: targetX,
      y: targetY,
      rotation: randomRotation,
      scale: scale,
      duration: duration,
      ease: 'power4.out',
      overwrite: 'auto',
      onComplete: () => {
        gsap.to(target, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: duration,
          delay: returnAfter,
          ease: 'elastic.out(1, 0.3)',
          overwrite: 'auto',
        });
      },
    });
  };

  return (
    <div
      className={`inline-block cursor-pointer select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      style={{ willChange: 'transform' }}
      {...props}
    >
      {children}
    </div>
  );
}

export default TextScatter;
