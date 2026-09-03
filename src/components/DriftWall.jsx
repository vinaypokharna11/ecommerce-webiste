'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import './DriftWall.css';

/**
 * DriftWall Component from React Bits
 * 3D Perspective moving grid of showcase products
 */
export default function DriftWall({
  items = [],
  columns = 5,
  rowsPerColumn = 4,
  tileWidth = 210,
  tileHeight = 138,
  gap = 16,
  radius = 18,
  tilt = 14,
  turn = -12,
  roll = 1,
  perspective = 1100,
  depth = 100,
  speed = 36,
  direction = 'up',
  variance = 0.4,
  parallax = 0.5,
  lift = 0,
  pauseOnHover = false,
  fade = 0.35,
  dim = 0.92,
  overlayColor = 'transparent',
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const planeRef = useRef(null);
  const colRefs = useRef([]);
  const animFrameId = useRef(null);
  const lastTimeRef = useRef(null);
  const offsetsRef = useRef([]);

  // Distribute items evenly across columns
  const columnData = useMemo(() => {
    if (!items || items.length === 0) return [];
    const cols = [];
    for (let c = 0; c < columns; c++) {
      const colItems = [];
      const totalTiles = rowsPerColumn * 2; // Double for smooth seamless loop without excessive DOM nodes
      for (let r = 0; r < totalTiles; r++) {
        const itemIndex = (c * 2 + r) % items.length;
        colItems.push(items[itemIndex]);
      }
      cols.push(colItems);
    }
    return cols;
  }, [items, columns, rowsPerColumn]);

  // Initial column offsets
  useEffect(() => {
    offsetsRef.current = columnData.map((_, c) => {
      return (c * (tileHeight + gap) * 0.6) % ((tileHeight + gap) * rowsPerColumn);
    });
  }, [columnData, tileHeight, gap, rowsPerColumn]);

  // Continuous smooth requestAnimationFrame drift loop with visibility optimization
  useEffect(() => {
    const loopHeight = (tileHeight + gap) * rowsPerColumn;
    const dirSign = direction === 'up' ? -1 : 1;
    let isVisible = true;

    // Pause animation when hero is not in viewport to guarantee 60 FPS everywhere else
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animFrameId.current) {
          lastTimeRef.current = null;
          animFrameId.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const animate = (timestamp) => {
      if (!isVisible) {
        animFrameId.current = null;
        return;
      }

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      const cols = colRefs.current;
      const offsets = offsetsRef.current;
      const colsLen = columnData.length;

      for (let c = 0; c < colsLen; c++) {
        const colElem = cols[c];
        if (!colElem) continue;

        // Speed variance per column
        const colSpeed = speed * (1 + ((c % 3) - 1) * variance);
        let offset = (offsets[c] || 0) + dirSign * colSpeed * dt;

        // Wrap around seamlessly
        if (offset < -loopHeight) {
          offset += loopHeight;
        } else if (offset > 0) {
          offset -= loopHeight;
        }

        offsets[c] = offset;
        colElem.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      }

      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      observer.disconnect();
      lastTimeRef.current = null;
    };
  }, [columnData, direction, speed, variance, tileHeight, gap, rowsPerColumn]);

  const totalWidth = columns * tileWidth + (columns - 1) * gap;
  const totalHeight = rowsPerColumn * 2 * tileHeight + (rowsPerColumn * 2 - 1) * gap;

  return (
    <div
      ref={containerRef}
      className={`drift-wall ${className}`}
      style={{
        perspective: `${perspective}px`,
        ...style,
      }}
    >
      {/* 3D Transform Plane */}
      <div
        ref={planeRef}
        className="drift-wall__plane"
        style={{
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
          transform: `translate(-50%, -50%) scale(1.15) rotateX(${tilt}deg) rotateY(${turn}deg) rotateZ(${roll}deg) translateZ(-${depth}px)`,
          gap: `${gap}px`,
        }}
      >
        {columnData.map((colItems, c) => (
          <div
            key={`col-${c}`}
            ref={(el) => (colRefs.current[c] = el)}
            className="drift-wall__col"
            style={{
              width: `${tileWidth}px`,
              gap: `${gap}px`,
            }}
          >
            {colItems.map((item, r) => {
              const imageSrc = typeof item.image === 'string' ? item.image : item.image?.src || item.image;
              return (
                <div
                  key={`tile-${c}-${r}`}
                  className="drift-wall__item"
                  style={{
                    width: `${tileWidth}px`,
                    height: `${tileHeight}px`,
                    borderRadius: `${radius}px`,
                  }}
                >
                  <div className="drift-wall__media">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={item.title || 'Product'}
                        loading={r === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : null}
                  </div>

                  {item.title && (
                    <div className="drift-wall__info">
                      <span className="drift-wall__title">{item.title}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Ambient Depth Tint Overlay */}
      {overlayColor !== 'transparent' && (
        <div
          className="drift-wall__overlay"
          style={{ backgroundColor: overlayColor, opacity: fade }}
        />
      )}
    </div>
  );
}
