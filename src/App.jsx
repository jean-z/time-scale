import { useEffect, useRef } from 'react'
import { EVENTS, LIFE, EARTH_YEARS, yearsAgoToClock, fmtClock } from './data.js'

/* 每个事件的滚动位置（px）：开场屏 100vh + 每事件一屏 */
const INTRO_H = 100;               // vh
const GAP_H = 130;                 // vh（事件间留白，重要事件前更大）

export default function App() {
  const bgRef = useRef(null);
  const clockRef = useRef(null);
  const barRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const onScroll = () => {
      const vh = window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const y = window.scrollY;

      // 进度：忽略开场屏
      const p = Math.max(0, Math.min(1, (y - vh * 0.9) / (total - vh * 1.9)));
      const hour = p * 24;
      if (clockRef.current) clockRef.current.textContent = fmtClock(hour);
      if (barRef.current) barRef.current.style.width = (p * 100).toFixed(2) + '%';

      // 背景：按当前进度在事件色之间插值（简化：取最近已过事件的 bg）
      const passed = EVENTS.filter((_, i) => p >= i / EVENTS.length);
      const cur = passed[passed.length - 1] ?? EVENTS[0];
      if (bgRef.current) {
        bgRef.current.style.background = `linear-gradient(180deg, ${cur.bg} 0%, #01040a 130%)`;
        bgRef.current.style.transition = 'background 1.2s ease';
      }

      // 卡片淡入
      for (const el of cardRefs.current) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.86) el.classList.add('visible');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div id="bg" ref={bgRef} />

      {/* 固定时钟 HUD */}
      <div id="clock-hud">
        <span className="k">地球时间</span>
        <span id="clock" ref={clockRef}>00:00:00</span>
        <div id="clock-bar"><div id="clock-fill" ref={barRef} /></div>
      </div>

      {/* 开场 */}
      <section id="intro">
        <p className="eyebrow">GEOLOGICAL TIME · COMPRESSED</p>
        <h1>如果地球的历史<br />是一天 24 小时</h1>
        <p className="sub">
          46 亿年 → 24 小时。生命出现在 <b>凌晨 4 点</b>，恐龙灭绝于 <b>深夜 23:39</b>，
          而你的一切——发生在最后的 <b>0.02 秒</b>。
        </p>
        <div className="hint">▼ 向下滚动，开始这 24 小时</div>
      </section>

      {/* 时间线 */}
      <div id="timeline">
        <div className="rail" />
        {EVENTS.map((ev, i) => (
          <section
            key={ev.ma}
            className="event"
            style={{ marginTop: i === 0 ? `${GAP_H * 0.6}vh` : `${GAP_H}vh` }}
            ref={(el) => (cardRefs.current[i] = el)}
          >
            <div className="dot" />
            <div className="card">
              <div className="clock-tag">{ev.t ?? fmtClock(yearsAgoToClock(ev.ma * 1e6))}</div>
              <div className="era">{ev.era}</div>
              <h2>{ev.title}</h2>
              <p>{ev.note}</p>
            </div>
          </section>
        ))}
      </div>

      {/* 结尾反转 */}
      <section id="finale">
        <p className="eyebrow">23:59:59.77</p>
        <h1>
          农耕、金字塔、罗马、大唐、
          <br />两次大战、登月、互联网、你
        </h1>
        <p className="big">全部发生在最后 0.2 秒</p>
        <div className="life-box">
          <p>{LIFE.note}</p>
          <p className="life-sec">你的 80 年 ≈ 这一天的 {LIFE.secOfDay.toFixed(4)} 秒</p>
        </div>
        <p className="dim">
          地球不在乎时间，但你在意——这 {LIFE.secOfDay.toFixed(4)} 秒是你的全部，
          用它看了一次星星，就不算浪费。
        </p>
        <button className="btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          ↑ 回到 00:00:00
        </button>
      </section>

      <footer>地质年代与事件时间：USGS/ICS 国际年代地层表公开数据 · 映射：4.54 Ga → 24 h</footer>
    </>
  );
}
