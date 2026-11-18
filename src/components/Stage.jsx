import { useEffect, useRef, useState } from 'react';
import { CATS, CAT_NAME, P, ROOM } from '../data.js';
import { HH, REGION, W, draw, loadAssets } from '../compositor.js';
import { Spark, Thumb } from './ui.jsx';

const S = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
const CAT_ICON = {
  t: <path d="M8.5 4 3 7l2 4 2.5-1.2V20h9V9.800L19 11l2-4-5.5-3a3.500 3.500 0 0 1-7 0z" />,
  k: <path d="M7 5h10l3.500 14h-17zM7 5v2.500h10V5M10 8l-1 11M14 8l1 11" />,
  s: <path d="M8 3h6v8.500l5.500 4a2 2 0 0 1 .8 1.600V20H8zM8 16h6" />,
  g: <path d="M5 9h14l1.500 11h-17zM9 9V7a3 3 0 0 1 6 0v2" />,
};

/* Two stacked canvases; each change is revealed by a 720ms sweep over its region. */
function Model({ look, pulse, onError }) {
  const cOld = useRef(null);
  const cNew = useRef(null);
  const glint = useRef(null);
  const anim = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    loadAssets().then(() => alive && setReady(true), () => alive && onError());
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready) return;
    const o = cOld.current, n = cNew.current, g = glint.current;
    const ctxOld = o.getContext('2d'), ctxNew = n.getContext('2d');
    const reset = () => {
      o.style.clipPath = '';
      n.style.clipPath = '';
      n.style.visibility = 'hidden';
      g.style.opacity = 0;
    };
    /* a change mid-sweep: settle the previous state onto cOld first */
    if (anim.current) {
      cancelAnimationFrame(anim.current.raf);
      draw(ctxOld, anim.current.to);
      reset();
      anim.current = null;
    }
    const cats = pulse.cats;
    if (!cats.length) {
      draw(ctxOld, look);
      return;
    }
    draw(ctxNew, look);
    const y0 = Math.min(...cats.map((c) => REGION[c][0])) * 100;
    const y1 = Math.max(...cats.map((c) => REGION[c][1])) * 100;
    const t0 = performance.now();
    const a = (anim.current = { to: look, raf: 0 });
    n.style.visibility = 'visible';
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 720);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const y = y0 + (y1 - y0) * e;
      n.style.clipPath = `inset(0 0 ${100 - y}% 0)`;
      o.style.clipPath = `inset(${y}% 0 0 0)`;
      g.style.top = y + '%';
      g.style.opacity = Math.sin(Math.PI * p).toFixed(3);
      if (p < 1) a.raf = requestAnimationFrame(step);
      else {
        draw(ctxOld, look);
        reset();
        anim.current = null;
      }
    };
    a.raf = requestAnimationFrame(step);
  }, [pulse, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => anim.current && cancelAnimationFrame(anim.current.raf), []);

  return (
    <>
      <canvas id="cOld" ref={cOld} width={W} height={HH} />
      <canvas id="cNew" ref={cNew} width={W} height={HH} />
      <div id="glint" ref={glint} />
    </>
  );
}

/* Drag to spin the model a full 360° (with a little inertia on release), plus the turntable's dashed ring. */
function useTurntable(figure, body, ring) {
  useEffect(() => {
    const fig = figure.current, el = body.current, rg = ring.current;
    let ry = 0, last = 0, spin = 0, dragging = false, lastX = 0, off = 0, raf;
    const down = (e) => {
      dragging = true;
      lastX = e.clientX;
      spin = 0;
      el.classList.add('drag');
      try { el.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    };
    const move = (e) => {
      if (!dragging) return;
      ry += (e.clientX - lastX) * 0.5;
      lastX = e.clientX;
    };
    const up = () => { dragging = false; el.classList.remove('drag'); };
    const tick = () => {
      if (dragging) spin = ry - last;
      else if (spin !== 0) {
        ry += spin;
        spin *= 0.94;
        if (Math.abs(spin) < 0.02) spin = 0;
      }
      const vel = ry - last;
      last = ry;
      const rad = (ry * Math.PI) / 180;
      fig.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      fig.style.setProperty('--sx', (-Math.sin(rad) * 10).toFixed(2) + 'px');
      fig.style.setProperty('--sw', Math.max(0.4, Math.abs(Math.cos(rad))).toFixed(3));
      off -= 0.12 + vel * 0.8;
      rg.style.strokeDashoffset = off.toFixed(2);
      raf = requestAnimationFrame(tick);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

export default function Stage({ look, pulse, ver, activeCat, canUndo, hlCat, onHover, onCycle, onRailCat, onUndo, onStylist, onToast }) {
  const [ar, setAr] = useState(false);
  const figure = useRef(null);
  const body = useRef(null);
  const ring = useRef(null);
  useTurntable(figure, body, ring);

  return (
    <main id="stage" className={ar ? 'ar' : ''}>
      <div id="ar">
        <img alt="" src={ROOM} />
        <b /><b /><b /><b />
        <div className="scan" />
        <div className="arl"><i />AR preview · your room</div>
      </div>

      <div id="figure" ref={figure}>
        <div id="tt">
          <div className="side" />
          <div className="face" />
          <svg className="ring" viewBox="0 0 393 100" preserveAspectRatio="none">
            <ellipse ref={ring} cx="196.5" cy="50" rx="172" ry="40" pathLength="300" />
          </svg>
          <div className="lbl">
            <svg viewBox="0 0 68 22"><path d="M66 4C48 15 26 18 4 14" /><path d="M10 9 3 14l8 4" /></svg>
            <span>360°</span>
            <svg viewBox="0 0 68 22"><path d="M2 4c18 11 40 14 62 10" /><path d="m58 9 7 5-8 4" /></svg>
          </div>
        </div>
        <div id="shadow" />
        <div id="body" ref={body}>
          <div id="spin">
            <Model look={look} pulse={pulse} onError={() => onToast('Could not load the model photos')} />
          </div>
        </div>
      </div>

      <div id="rail">
        <button className="rb" disabled={!canUndo} onClick={onUndo}>
          <svg {...S}><path d="M9 5 4 10l5 5M4 10h11a5 5 0 0 1 0 10h-2" /></svg>
          <span className="tip">Undo</span>
        </button>
        <button className="rb" onClick={() => onToast('Size M · 165 cm · fit profile saved')}>
          <svg {...S}><circle cx="12" cy="4.500" r="2.200" /><path d="M7 9.500h10M12 9.500V15M12 15l-3 6.500M12 15l3 6.500" /></svg>
          <span className="tip">Body &amp; size</span>
        </button>
        {CATS.map((c) => (
          <button key={c} className={'rb' + (activeCat === c ? ' on' : '')} onClick={() => onRailCat(c)}>
            <svg {...S}>{CAT_ICON[c]}</svg>
            <span className="tip">{CAT_NAME[c]} · {P[look[c]].name}</span>
          </button>
        ))}
        <button className="rb" onClick={onStylist}>
          <Spark />
          <span className="tip">AI stylist · surprise me</span>
        </button>
      </div>

      <div id="strip" onMouseLeave={() => onHover(null)}>
        {CATS.map((c) => (
          <Thumb
            key={c + ver[c]}
            k={look[c]}
            ch={537}
            data-cat={c}
            className={(ver[c] ? 'pop' : '') + (hlCat === c ? ' hl' : '')}
            onMouseEnter={() => onHover(c)}
            onClick={() => onCycle(c)}
          />
        ))}
      </div>

      <div id="mode">
        <i />
        <button className={ar ? '' : 'on'} onClick={() => setAr(false)}>3D</button>
        <button className={ar ? 'on' : ''} onClick={() => setAr(true)}>AR</button>
      </div>
    </main>
  );
}
