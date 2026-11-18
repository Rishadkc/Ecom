import { forwardRef, useLayoutEffect, useRef } from 'react';
import { bgPos } from '../data.js';

const VARIANT = { 400: 'pt', 450: 'pt lk', 537: 'pt st' };

/* Product thumbnail: the product sheet cropped with CSS. ch = visible source height. */
export const Thumb = forwardRef(function Thumb({ k, ch = 400, className = '', ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={`${VARIANT[ch]} ${className}`.trim()}
      style={{ backgroundPosition: bgPos(k, ch) }}
      {...rest}
    />
  );
});

/* Number that counts to its new value over 600ms (ease-out cubic). */
export function Count({ value, fmt, ...rest }) {
  const el = useRef(null);
  const shown = useRef(value);
  useLayoutEffect(() => {
    const from = shown.current;
    shown.current = value;
    if (from === value) {
      el.current.textContent = fmt(value);
      return;
    }
    const t0 = performance.now();
    let raf;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 600);
      el.current.textContent = fmt(from + (value - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      if (el.current) el.current.textContent = fmt(value);
    };
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span ref={el} {...rest} />;
}

export const Spark = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" />
  </svg>
);

export const Heart = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.600-7 10-7 10z" />
  </svg>
);
