'use client';

import { useState, useRef, useCallback, useId, useEffect } from 'react';
import ContrastText from '../ContrastText/ContrastText';
import styles from './Liquid.module.css';

const BUBBLE_COUNT = 12;
const REPULSE_RANGE = 120;    // px — how close the cursor must be to start pushing
const REPULSE_STRENGTH = 25;  // px — maximum displacement at distance = 0
const INTRO_TIME = 1500;      // ms — how long the intro animation lasts

const Liquid = ({label, light, glow, color, className}: {label?: string, light?: boolean, glow?: boolean, color?: string, className?: string}) => {
  const [wobbling, setWobbling] = useState<Set<number>>(new Set());
  const [intro, setIntro] = useState(true);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const gooeyRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // --- Cursor repulsion ---
  useEffect(() => {
    const gooey = gooeyRef.current;
    if (!gooey) return;
    setTimeout(() => setIntro(false), INTRO_TIME); 

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = gooey.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const bubbles = gooey.children;

        for (let i = 0; i < bubbles.length; i++) {
          const el = bubbles[i] as HTMLElement;
          const bRect = el.getBoundingClientRect();
          const bCenterX = bRect.left + bRect.width / 2 - rect.left;
          const bCenterY = bRect.top + bRect.height / 2 - rect.top;

          const dx = bCenterX - mouseX;
          const dy = bCenterY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);


          if (dist < REPULSE_RANGE && dist > 0) {
            // Quadratic falloff feels more natural than linear
            const t = 1 - dist / REPULSE_RANGE;
            const force = t * t * REPULSE_STRENGTH;
            const angle = Math.atan2(dy, dx);

            // Clamp so bubble stays within parent bounds
            let rx = Math.cos(angle) * force;
            let ry = Math.sin(angle) * force;
            const maxX = rect.width - (bRect.left - rect.left + bRect.width);
            const minX = -(bRect.left - rect.left);
            const maxY = rect.height - (bRect.top - rect.top + bRect.height);
            const minY = -(bRect.top - rect.top);

            rx = Math.max(minX, Math.min(maxX, rx));
            ry = Math.max(minY, Math.min(maxY, ry));

            // Light position clamped to bubble's own bounds
            const lx = Math.max(-bRect.width / 2, Math.min(bRect.width / 2, rx));
            const ly = Math.max(-bRect.height / 2, Math.min(bRect.height / 2, ry));


            el.style.setProperty('--light-x', `${light ? lx : 0}px`);
            el.style.setProperty('--light-y', `${light ? ly : 0}px`);

            el.style.setProperty('--repulse-x', `${rx}px`);
            el.style.setProperty('--repulse-y', `${ry}px`);
          } else {
            el.style.setProperty('--light-x', '0px');
            el.style.setProperty('--light-y', '0px');
            el.style.setProperty('--repulse-x', '0px');
            el.style.setProperty('--repulse-y', '0px');
          }
        }
      });
    };

    const handleMouseLeave = () => {
      cancelAnimationFrame(rafRef.current);
      const bubbles = gooey.children;
      for (let i = 0; i < bubbles.length; i++) {
        const el = bubbles[i] as HTMLElement;
        el.style.setProperty('--repulse-x', '0px');
        el.style.setProperty('--repulse-y', '0px');
      }
    };

    gooey.addEventListener('mousemove', handleMouseMove);
    gooey.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      cancelAnimationFrame(rafRef.current);
      gooey.removeEventListener('mousemove', handleMouseMove);
      gooey.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

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


  const rawId = useId();
  // useId can contain colons which are invalid in SVG id attributes
  const filterId = `gooey-${rawId.replace(/:/g, '')}`;


  return (
    <div className={className ? `${styles.liquid} ${className}` : styles.liquid} style={{ ['--primary-color' as string]: color, ['--intro-time' as string]: `${INTRO_TIME * 0.001}s` }}>
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

      {glow && <div className={styles.glow} />}
      {label && <ContrastText className={styles.text}>{label}</ContrastText>}
      <div ref={gooeyRef} className={styles.gooey} style={{ filter: `url(#${filterId})`}}>
        {Array.from({ length: BUBBLE_COUNT }, (_, index) => (
          <div
            key={index}
            className={`
              ${styles.bubble } 
              ${wobbling.has(index) ? styles.wobble : ''} 
              ${light ? styles.light : ''} 
              ${intro ? styles.intro : ''}
            `}
            onMouseEnter={() => handleBubbleHover(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Liquid;
