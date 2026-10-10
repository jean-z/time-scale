// 时间映射回归测试：node tools/test-scale.mjs
// 校准点：
//   生命起源（38 亿年前）≈ 04:00（"凌晨 4 点"）
//   恐龙灭绝（6600 万年前）≈ 23:39-23:40
//   智人走出非洲（30 万年前）≈ 23:59:58
//   80 年 ≈ 0.0015 秒
import { yearsAgoToClock, fmtClock, EVENTS, LIFE, EARTH_YEARS } from '../src/data.js';

let pass = 0, fail = 0;
const check = (name, cond) => { cond ? pass++ : fail++; console.log(`${cond ? '✅' : '❌'} ${name}`); };
const hm = (ma) => { const h = yearsAgoToClock(ma * 1e6); return [Math.floor(h), Math.floor((h % 1) * 60)]; };

check('地球年龄 = 45.4 亿年', EARTH_YEARS === 4.54e9);
check('映射函数：45.4 Ga → 0 点', yearsAgoToClock(EARTH_YEARS) === 0);
check('映射函数：现在 → 24 点', Math.abs(yearsAgoToClock(0) - 24) < 1e-9);

const [lh, lm] = hm(3800);
console.log(`生命起源（38 亿年前）→ ${lh}:${String(lm).padStart(2, '0')}`);
check('生命起源在凌晨 3:50-4:30', lh === 3 && lm >= 50 || lh === 4 && lm <= 30);

const [dh, dm] = hm(66);
console.log(`恐龙灭绝（6600 万年前）→ ${dh}:${String(dm).padStart(2, '0')}`);
check('恐龙灭绝在 23:35-23:45', dh === 23 && dm >= 35 && dm <= 45);

const nowS = yearsAgoToClock(3e5) * 3600;
console.log(`智人走出非洲（30 万年前）→ ${fmtClock(yearsAgoToClock(3e5))}`);
check('智人走出非洲在 23:59:50 之后', nowS > 24 * 3600 - 10);

const civS = yearsAgoToClock(1.2e4) * 3600;   // 1.2 万年文明史
console.log(`文明史（1.2 万年）→ 距 24:00 还差 ${(24 * 3600 - civS).toFixed(3)} 秒`);
check('文明史 < 最后 1 秒', 24 * 3600 - civS < 1);

console.log(`80 年 = ${LIFE.secOfDay.toFixed(5)} 秒`);
check('80 年 ≈ 0.001-0.002 秒', LIFE.secOfDay > 0.001 && LIFE.secOfDay < 0.002);

check('事件表 ≥ 18 个且按时间正序', EVENTS.length >= 18 && EVENTS.every((e, i, a) => i === 0 || a[i - 1].ma > e.ma));
check('每个事件有时代/标题/注释', EVENTS.every((e) => e.era && e.title && e.note));

console.log(`\n${pass} 通过 / ${fail} 失败`);
process.exit(fail ? 1 : 0);
