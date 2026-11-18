const CDN = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/';
export const H = (file, w) =>
  'https://images.higgs.ai/?default=1&output=webp&url=' + encodeURIComponent(CDN + file) + '&w=' + w + '&q=88';

export const FILES = {
  base: 'hf_20261113_132636_5eabfff6-e1ee-4368-b3a9-6582c1f1397b.png',
  t2: 'hf_20261113_132720_0affdcfe-f56e-4943-a986-c2e87f5c57ff.png',
  t3: 'hf_20261113_132720_f30c45fe-a7d7-4392-97f3-de87f324f3b2.png',
  k2: 'hf_20261113_132721_9d39ba54-b830-4e1e-9076-1f45f5be7621.png',
  k3: 'hf_20261113_132720_0986c806-cb61-488a-acf7-daa9d1c32adc.png',
  s2: 'hf_20261113_132720_8c9da93a-bc4f-4496-957c-56cf9ac47131.png',
  s3: 'hf_20261113_132719_dd94cd18-2c72-4272-a4d9-829761077f19.png',
  g2: 'hf_20261113_132721_feb73af1-d27a-4122-848a-727dae3be59f.png',
  g3: 'hf_20261113_132729_883f3a83-2c13-418d-a959-79708075153f.png',
};
export const ROOM = H('hf_20261113_132845_2fe30a71-4937-4877-b8df-92bba80bbabe.png', 1800);

export const STORES = { norra: 'NORRA', lune: 'LUNE&CO', meridian: 'MERIDIAN', ode: 'ODE STUDIO' };
export const STORE_NAME = { norra: 'Norra', lune: 'Lune&Co', meridian: 'Meridian', ode: 'Ode Studio' };
export const CATS = ['t', 'k', 's', 'g'];
export const CAT_NAME = { t: 'Tops', k: 'Bottoms', s: 'Shoes', g: 'Bags', a: 'Accessories' };
export const TABS = [['all', 'All'], ['t', 'Tops'], ['k', 'Bottoms'], ['s', 'Shoes'], ['g', 'Bags'], ['a', 'Accessories']];

export const P = {
  t1: { store: 'norra', name: 'Off-shoulder top', price: 29.9, c: 0, r: 0, tags: ['minimal', 'soft'] },
  t2: { store: 'meridian', name: 'Ribbed turtleneck', price: 34.9, c: 1, r: 0, tags: ['minimal', 'sharp'] },
  t3: { store: 'lune', name: 'Cropped knit cardigan', price: 45.0, c: 2, r: 0, tags: ['romantic', 'wine'] },
  k1: { store: 'meridian', name: 'Pleated mini skirt', price: 49.99, c: 0, r: 1, tags: ['minimal', 'sharp'] },
  k2: { store: 'norra', name: 'Denim mini skirt', price: 39.9, c: 1, r: 1, tags: ['casual'] },
  k3: { store: 'ode', name: 'Bouclé tweed skirt', price: 59.0, c: 2, r: 1, tags: ['romantic', 'soft'] },
  s1: { store: 'norra', name: 'Leather knee boots', price: 129.0, c: 0, r: 2, tags: ['minimal', 'sharp'] },
  s2: { store: 'ode', name: 'Leather sneakers', price: 89.0, c: 1, r: 2, tags: ['casual'] },
  s3: { store: 'lune', name: 'Wine knee boots', price: 139.0, c: 2, r: 2, tags: ['romantic', 'wine'] },
  g1: { store: 'ode', name: 'Buckle shoulder bag', price: 189.0, c: 0, r: 3, tags: ['minimal', 'sharp'] },
  g2: { store: 'lune', name: 'Quilted mini bag', price: 159.0, c: 1, r: 3, tags: ['romantic', 'soft'] },
  g3: { store: 'meridian', name: 'Wine top-handle bag', price: 175.0, c: 2, r: 3, tags: ['romantic', 'wine'] },
};
export const KEYS = Object.keys(P);

export const LOOKS = [
  ['Monochrome minimal', ['t2', 'k1', 's1', 'g1']],
  ['Wine romance', ['t3', 'k3', 's3', 'g3']],
  ['Weekend denim', ['t1', 'k2', 's2', 'g2']],
  ['Soft contrast', ['t2', 'k3', 's3', 'g2']],
  ['Campus cool', ['t3', 'k2', 's2', 'g3']],
];

export const FITS = [
  { label: 'Fits your size', note: 'Size M fits your saved measurements' },
  { label: 'Matches your style', note: 'Based on 4 pieces and your saved styles' },
  { label: 'Complements your body shape', note: 'Mini length + knee height balance your frame' },
];

/* product-sheet crop: tile origins on the 1744x2336 sheet, ch = visible source height */
const TX = [44, 610, 1177];
const TY = [42, 611, 1180, 1749];
export const bgPos = (key, ch) => {
  const p = P[key];
  return `${((TX[p.c] / (1744 - 523)) * 100).toFixed(3)}% ${(((TY[p.r] + (537 - ch) / 2) / (2336 - ch)) * 100).toFixed(3)}%`;
};

export const money = (n) => '$' + n.toFixed(2);
export const totalOf = (look) => CATS.reduce((s, c) => s + P[look[c]].price, 0);

export function scoresOf(look) {
  const n = {};
  CATS.forEach((c) => P[look[c]].tags.forEach((t) => (n[t] = (n[t] || 0) + 1)));
  const top = Math.max(...Object.values(n));
  return [
    100,
    Math.min(99, 56 + 9 * top),
    78 + (look.k === 'k1' ? 14 : look.k === 'k3' ? 10 : 6) + (look.s !== 's2' ? 4 : 0),
  ];
}

export function recsFor(look) {
  const mood = P[look.t].tags[0];
  const cand = KEYS.filter((k) => look[k[0]] !== k);
  return cand
    .filter((k) => P[k].tags.includes(mood))
    .concat(cand.filter((k) => !P[k].tags.includes(mood)))
    .slice(0, 3);
}
