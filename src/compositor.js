import { FILES, H, bgPos } from './data.js';
import { MASKS } from './masks.js';

export const W = 1000;
export const HH = 1506;
/* sweep region per category, as fractions of the figure height */
export const REGION = { t: [0.07, 0.53], k: [0.32, 0.57], s: [0.53, 1], g: [0.45, 0.75] };

const IMG = {};
const MSK = {};
let off, octx, loading;

const load = (src, cors) =>
  new Promise((res, rej) => {
    const i = new Image();
    if (cors) i.crossOrigin = 'anonymous';
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

/* Load the nine model photos and eight masks once; resolves when all are ready. */
export function loadAssets() {
  if (!loading) {
    off = document.createElement('canvas');
    off.width = W;
    off.height = HH;
    octx = off.getContext('2d');
    loading = Promise.all([
      ...Object.keys(FILES).map((k) => load(H(FILES[k], 1000), true).then((i) => (IMG[k] = i))),
      ...Object.keys(MASKS).map((k) => load(MASKS[k]).then((i) => (MSK[k] = i))),
    ]);
  }
  return loading;
}

/* Base photo, then each non-base piece as an exact soft replacement through its mask. */
export function draw(ctx, look) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, W, HH);
  ctx.drawImage(IMG.base, 0, 0, W, HH);
  for (const cat of ['s', 'k', 't', 'g']) {
    const key = look[cat];
    if (key.endsWith('1')) continue;
    octx.globalCompositeOperation = 'source-over';
    octx.clearRect(0, 0, W, HH);
    octx.drawImage(MSK[key], 0, 0, W, HH);
    octx.globalCompositeOperation = 'source-in';
    octx.drawImage(IMG[key], 0, 0, W, HH);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(MSK[key], 0, 0, W, HH);
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(off, 0, 0);
  }
  ctx.globalCompositeOperation = 'source-over';
}

/* Fly a product thumbnail from one element to another. */
export function fly(key, fromEl, toEl) {
  if (!fromEl || !toEl || !fromEl.isConnected) return;
  const a = fromEl.getBoundingClientRect();
  const b = toEl.getBoundingClientRect();
  if (!a.width || !b.width) return;
  const f = document.createElement('div');
  f.className = 'pt st fly';
  Object.assign(f.style, {
    backgroundPosition: bgPos(key, 537),
    aspectRatio: 'auto',
    left: a.left + 'px',
    top: a.top + 'px',
    width: a.width + 'px',
    height: a.height + 'px',
  });
  document.body.appendChild(f);
  f.getBoundingClientRect();
  Object.assign(f.style, {
    left: b.left + 'px',
    top: b.top + 'px',
    width: b.width + 'px',
    height: b.height + 'px',
    opacity: 0.35,
  });
  setTimeout(() => f.remove(), 620);
}
