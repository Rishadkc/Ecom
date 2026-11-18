import { useEffect, useRef, useState } from 'react';
import { CATS, LOOKS, P } from './data.js';
import { fly } from './compositor.js';
import Shop from './components/Shop.jsx';
import Stage from './components/Stage.jsx';
import { LookPanel, Recommended } from './components/LookPanel.jsx';

const START = { t: 't1', k: 'k1', s: 's1', g: 'g1' };
const NO_FILTER = { cat: 'all', store: null, saved: false, q: '' };

export default function App() {
  const [look, setLook] = useState(START);
  const [history, setHistory] = useState([]);
  /* pulse: which categories just changed (drives the sweep); ver: per-category change counter (replays thumbnail animations) */
  const [pulse, setPulse] = useState({ cats: [], n: 0 });
  const [ver, setVer] = useState({ t: 0, k: 0, s: 0, g: 0 });
  const [saved, setSaved] = useState(() => new Set(['k2']));
  const [filter, setFilter] = useState(NO_FILTER);
  const [hover, setHover] = useState({ row: null, strip: null });
  const [toast, setToast] = useState({ msg: '', on: false });

  /* refs mirror state so timed stylist steps always act on the latest look */
  const lookRef = useRef(look);
  const histRef = useRef(history);
  const toastT = useRef(0);
  const stylistT = useRef([]);
  const lookIdx = useRef(0);

  useEffect(() => () => {
    clearTimeout(toastT.current);
    stylistT.current.forEach(clearTimeout);
  }, []);

  const say = (msg) => {
    setToast({ msg, on: true });
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast((t) => ({ ...t, on: false })), 1800);
  };

  const commit = (next, hist, cats) => {
    lookRef.current = next;
    histRef.current = hist;
    setLook(next);
    setHistory(hist);
    setVer((v) => {
      const o = { ...v };
      cats.forEach((c) => o[c]++);
      return o;
    });
    setPulse((p) => ({ cats, n: p.n + 1 }));
  };

  const wear = (key, fromEl, quiet) => {
    const c = key[0];
    const cur = lookRef.current;
    if (cur[c] === key) return;
    if (fromEl) fly(key, fromEl, document.querySelector(`#strip [data-cat=${c}]`));
    commit({ ...cur, [c]: key }, [...histRef.current, cur], [c]);
    if (!quiet) say('Trying on · ' + P[key].name);
  };

  const cycle = (c) => wear(c + ((+lookRef.current[c][1] % 3) + 1));

  const clearStylist = () => {
    stylistT.current.forEach(clearTimeout);
    stylistT.current = [];
  };

  const undo = () => {
    const hist = histRef.current;
    if (!hist.length) return;
    clearStylist();
    const prev = hist[hist.length - 1];
    commit(prev, hist.slice(0, -1), CATS.filter((c) => prev[c] !== lookRef.current[c]));
  };

  const stylist = () => {
    clearStylist();
    const [name, pieces] = LOOKS[lookIdx.current++ % LOOKS.length];
    say('AI stylist · ' + name);
    stylistT.current = pieces
      .filter((k) => lookRef.current[k[0]] !== k)
      .map((k, i) => setTimeout(() => wear(k, null, true), i * 520));
  };

  const toggleSave = (k) =>
    setSaved((s) => {
      const n = new Set(s);
      if (!n.delete(k)) n.add(k);
      return n;
    });

  /* cycling from a rail button or look row also points the shop at that category */
  const cycleAndFilter = (c) => {
    cycle(c);
    setFilter((f) => ({ ...f, cat: c }));
  };

  return (
    <>
      <div id="app">
        <Shop
          filter={filter}
          setFilter={setFilter}
          look={look}
          saved={saved}
          onToggleSave={toggleSave}
          onWear={wear}
          onHome={() => setFilter(NO_FILTER)}
          onStylist={stylist}
        />
        <Stage
          look={look}
          pulse={pulse}
          ver={ver}
          activeCat={filter.cat}
          canUndo={history.length > 0}
          hlCat={hover.strip}
          onHover={(c) => setHover((h) => ({ ...h, row: c }))}
          onCycle={cycle}
          onRailCat={cycleAndFilter}
          onUndo={undo}
          onStylist={stylist}
          onToast={say}
        />
        <aside id="right">
          <LookPanel
            look={look}
            ver={ver}
            hlCat={hover.row}
            onHover={(c) => setHover((h) => ({ ...h, strip: c }))}
            onRow={cycleAndFilter}
            onToast={say}
          />
          <Recommended look={look} onWear={wear} />
        </aside>
      </div>
      <div id="toast" className={toast.on ? 'on' : ''}>{toast.msg}</div>
    </>
  );
}
