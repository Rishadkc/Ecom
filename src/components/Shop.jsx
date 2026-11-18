import { useEffect, useLayoutEffect, useRef } from 'react';
import { CAT_NAME, KEYS, P, STORES, STORE_NAME, TABS, money } from '../data.js';
import { Heart, Thumb } from './ui.jsx';

const STORE_TILES = [
  ['norra', <span className="w-norra">NORRA</span>],
  ['lune', <span className="w-lune">Lune&amp;Co</span>],
  ['meridian', <span className="w-meridian">MERIDIAN</span>],
  ['ode', <span className="w-ode">ODE<br />STUDIO</span>],
];

const NAV = [
  ['home', 'Home', <path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" />],
  ['explore', 'Explore', <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>],
  ['outfits', 'Outfits', <path d="M12 8a2 2 0 1 1 2-2M12 8v2l9 6.5a1 1 0 0 1-.6 1.8H3.6a1 1 0 0 1-.6-1.8L12 10" />],
  ['saved', 'Saved', <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.600-7 10-7 10z" />],
  ['profile', 'Profile', <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.600-6.500 8-6.500s8 2.500 8 6.500" /></>],
];

function CategoryTabs({ cat, onCat }) {
  const nav = useRef(null);
  const bar = useRef(null);
  const place = () => {
    const b = nav.current.querySelector('button.on');
    if (!b) return;
    bar.current.style.left = b.offsetLeft + 'px';
    bar.current.style.width = b.offsetWidth + 'px';
  };
  useLayoutEffect(place, [cat]);
  useEffect(() => {
    window.addEventListener('resize', place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener('resize', place);
  }, []);
  return (
    <nav className="tabs" ref={nav}>
      {TABS.map(([c, label]) => (
        <button key={c} className={c === cat ? 'on' : ''} onClick={() => onCat(c)}>{label}</button>
      ))}
      <i className="bar" ref={bar} />
    </nav>
  );
}

export default function Shop({ filter, setFilter, look, saved, onToggleSave, onWear, onHome, onStylist }) {
  const q = filter.q.trim().toLowerCase();
  const list = KEYS.filter((k) => {
    const p = P[k];
    if (filter.cat !== 'all' && k[0] !== filter.cat) return false;
    if (filter.store && p.store !== filter.store) return false;
    if (filter.saved && !saved.has(k)) return false;
    if (q) {
      const hay = `${p.name} ${STORES[p.store]} ${STORE_NAME[p.store]} ${CAT_NAME[k[0]]} ${p.tags.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const title = filter.saved ? 'Saved pieces' : filter.store ? `${STORE_NAME[filter.store]} picks` : 'Popular in your style';
  const set = (patch) => setFilter((f) => ({ ...f, ...patch }));
  const tab = filter.saved ? 'saved' : 'explore';
  const onNav = (t) => {
    if (t === 'home') onHome();
    else if (t === 'explore') set({ saved: false });
    else if (t === 'saved') set({ saved: true });
    else if (t === 'outfits') onStylist();
  };
  /* cards re-enter (staggered fade-up) only when the filtered set changes */
  const gridKey = list.join();

  return (
    <aside id="left">
      <div className="top">
        <div className="logo">MAISON EDIT</div>
        <button className="burger" aria-label="Menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 7h18M3 12h18M3 17h18" />
          </svg>
        </button>
      </div>
      <section className="panel shop">
        <label className="search">
          <svg className="ic" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /></svg>
          <input
            type="search"
            placeholder="Search for products, brands or styles..."
            autoComplete="off"
            value={filter.q}
            onChange={(e) => set({ q: e.target.value })}
          />
        </label>
        <CategoryTabs cat={filter.cat} onCat={(c) => set({ cat: c })} />
        <div className="scroll">
          <div className="hd"><h3>Shop by Store</h3><a onClick={() => set({ store: null })}>See all</a></div>
          <div className="stores">
            {STORE_TILES.map(([s, mark]) => (
              <button
                key={s}
                className={'store' + (filter.store === s ? ' on' : '')}
                onClick={() => set({ store: filter.store === s ? null : s })}
              >
                {mark}
              </button>
            ))}
          </div>
          <div className="hd"><h3>{title}</h3><span>{list.length} {list.length === 1 ? 'item' : 'items'}</span></div>
          <div className="grid" key={gridKey}>
            {list.map((k, i) => {
              const p = P[k];
              return (
                <div
                  key={k}
                  className={'card' + (look[k[0]] === k ? ' worn' : '')}
                  style={{ animationDelay: i * 35 + 'ms' }}
                  onClick={(e) => onWear(k, e.currentTarget.querySelector('.pt'))}
                >
                  <div className="ph">
                    <Thumb k={k} ch={400} />
                    <button
                      className={'heart' + (saved.has(k) ? ' on' : '')}
                      aria-label="Save"
                      onClick={(e) => { e.stopPropagation(); onToggleSave(k); }}
                    >
                      <Heart />
                    </button>
                    <span className="tag">WEARING</span>
                    <span className="chip">Try on</span>
                  </div>
                  <div className="st0">{STORES[p.store]}</div>
                  <div className="nm">{p.name}</div>
                  <div className="pr">{money(p.price)}</div>
                </div>
              );
            })}
          </div>
        </div>
        <nav className="tabbar">
          {NAV.map(([t, label, icon]) => (
            <button key={t} className={t === tab ? 'on' : ''} onClick={() => onNav(t)}>
              <svg className="ic" viewBox="0 0 24 24">{icon}</svg>
              {label}
            </button>
          ))}
        </nav>
      </section>
    </aside>
  );
}
