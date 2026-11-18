import { useEffect, useRef, useState } from 'react';
import { CATS, FITS, P, STORES, money, recsFor, scoresOf, totalOf } from '../data.js';
import { fly } from '../compositor.js';
import { Count, Spark, Thumb } from './ui.jsx';

const pct = (v) => Math.round(v) + '%';

function ShopTheLook({ look, rows, onToast }) {
  const btn = useRef(null);
  const timers = useRef([]);
  const [sweep, setSweep] = useState(0);
  const [added, setAdded] = useState(false);
  const [badge, setBadge] = useState(false);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const click = () => {
    timers.current.forEach(clearTimeout);
    setSweep((n) => n + 1);
    setAdded(true);
    timers.current = [
      ...CATS.map((c, i) =>
        setTimeout(() => fly(look[c], rows.current.querySelector(`[data-cat=${c}] .pt`), btn.current), i * 70)
      ),
      setTimeout(() => setBadge(true), 500),
      setTimeout(() => setAdded(false), 1800),
    ];
    onToast('4 pieces added · ' + money(totalOf(look)));
  };

  return (
    <button id="buy" ref={btn} key={sweep} className={sweep ? 'sweep' : ''} onClick={click}>
      <span>{added ? 'Added · view bag' : 'Shop the Look'}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
      </svg>
      <span className={'badge' + (badge ? ' on' : '')}>4</span>
    </button>
  );
}

export function LookPanel({ look, ver, hlCat, onHover, onRow, onToast }) {
  const rows = useRef(null);
  const scores = scoresOf(look);
  return (
    <section className="panel look">
      <div className="lh">
        <h2>YOUR LOOK</h2>
        <Count id="total" value={totalOf(look)} fmt={money} />
      </div>
      <div id="rows" ref={rows} onMouseLeave={() => onHover(null)}>
        {CATS.map((c) => {
          const k = look[c], p = P[k];
          return (
            <div
              key={c}
              data-cat={c}
              className={'row' + (hlCat === c ? ' hl' : '')}
              onMouseEnter={() => onHover(c)}
              onClick={() => onRow(c)}
            >
              <Thumb key={ver[c]} k={k} ch={450} className={ver[c] ? 'swap' : ''} />
              <div className="tx">
                <div className="st0">{STORES[p.store]}</div>
                <div className="nm">{p.name}</div>
                <div className="pr">{money(p.price)}</div>
              </div>
              <span className="chev">›</span>
            </div>
          );
        })}
      </div>
      <div className="sf">
        <h4>STYLE &amp; FIT</h4>
        {FITS.map((f, i) => (
          <div key={f.label} className={'fit' + (scores[i] >= 80 ? ' ok' : '')}>
            <span className="ck"><svg viewBox="0 0 24 24"><path d="m5 12.500 4.500 4.500L19 7.500" /></svg></span>
            <span>{f.label}</span>
            <svg className="ic inf" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.500v.1" /></svg>
            <Count className="pc" value={scores[i]} fmt={pct} />
            <span className="bub">{f.note}</span>
          </div>
        ))}
      </div>
      <ShopTheLook look={look} rows={rows} onToast={onToast} />
    </section>
  );
}

export function Recommended({ look, onWear }) {
  const picks = recsFor(look);
  return (
    <section className="panel rec">
      <h3><Spark />Recommended for you</h3>
      <div id="recs" key={picks.join()}>
        {picks.map((k, i) => {
          const p = P[k];
          return (
            <div
              key={k}
              className="rc"
              style={{ animationDelay: i * 35 + 'ms' }}
              onClick={(e) => onWear(k, e.currentTarget.querySelector('.pt'))}
            >
              <Thumb k={k} ch={450} />
              <div className="st0">{STORES[p.store]}</div>
              <div className="nm">{p.name}</div>
              <div className="pr">{money(p.price)}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
