'use client';

import { useState, useRef, useCallback, useId } from 'react';
import styles from './Liquid.module.css';

const BUBBLE_COUNT = 8;

const Liquid = () => {
  const [wobbling, setWobbling] = useState<Set<number>>(new Set());
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const handleBubbleHover = useCallback((index: number) => {
    // Clear any existing timer for this bubble so rapid hovers restart the animation
    const existing = timersRef.current.get(index);
    if (existing) clearTimeout(existing);

    setWobbling(prev => new Set(prev).add(index));

    const timer = setTimeout(() => {
      setWobbling(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
      timersRef.current.delete(index);
    }, 500);

    timersRef.current.set(index, timer);
  }, []);

  const onClick = useCallback(() => {
    // Trigger a wobble on all bubbles when the container is clicked
    setWobbling(new Set(Array.from({ length: BUBBLE_COUNT }, (_, i) => i)));
    // Clear all timers to prevent them from removing the wobble prematurely
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  const rawId = useId();
  // useId can contain colons which are invalid in SVG id attributes
  const filterId = `gooey-${rawId.replace(/:/g, '')}`;


  return (
    <div className={styles.liquid}>
      {/* Hidden SVG — defines the metaball filter once per instance */}
      <svg
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        aria-hidden="true"
      >
        <defs>
          <filter
            id={filterId}
            x="-50%" y="-50%"
            width="200%" height="200%"
            colorInterpolationFilters="sRGB"
          >
            {/* Blur spreads alpha across neighbouring pixels */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            {/*
              Threshold the alpha channel: new_A = 20*A - 9
              Pixels above ~45% alpha snap to fully opaque → crisp merged edges
              Pixels below snap to transparent → background shows through cleanly
              RGB channels are passed through unchanged (rows 1–3)
            */}
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 20 -9"
            />
          </filter>
        </defs>
      </svg>

      <div className={styles.glow} />
      <div className={styles.gooey} style={{ filter: `url(#${filterId})` }}>
        {Array.from({ length: BUBBLE_COUNT }, (_, index) => (
          <div
            key={index}
            className={`${styles.bubble} ${wobbling.has(index) ? styles.wobble : ''}`}
            onMouseEnter={() => handleBubbleHover(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Liquid;
