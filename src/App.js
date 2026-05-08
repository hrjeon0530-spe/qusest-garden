import { useState, useEffect, useRef } from "react";

/* ── COLORS ── */
const P = '#7C3AED', PD = '#5B21B6', PM = '#6D28D9', PL = '#EDE9FE', PP = '#F5F3FF';
const G = '#10B981', GD = '#059669', GL = '#D1FAE5';
const BD = 'rgba(124,58,237,0.13)';

/* ── UTILS ── */
const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => new Date().toDateString();
const rn = (s) => ((s * 9301 + 49297) % 233280) / 233280;

const beep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[440, 0], [554, 0.2], [660, 0.4]].forEach(([f, t]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = f; o.type = 'sine';
      g.gain.setValueAtTime(0.25, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.4);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.5);
    });
  } catch (e) {}
};

/* ── THEMES ── */
const THEMES = {
  city:    { n: '도시',     e: '🏙️',  hasDN: true,  kw: ['도시','빌딩','city','urban','밤','타워','골목'] },
  nature:  { n: '자연',     e: '🌿',  hasDN: false, kw: ['자연','공원','들판','풀밭','녹색'] },
  forest:  { n: '숲',       e: '🌲',  hasDN: false, kw: ['숲','나무','밀림','깊은','forest'] },
  spring:  { n: '봄',       e: '🌸',  hasDN: false, kw: ['봄','꽃','flower','따뜻','봄날'] },
  summer:  { n: '여름',     e: '☀️', hasDN: false, kw: ['여름','더위','해변','바다','beach'] },
  autumn:  { n: '가을',     e: '🍂',  hasDN: false, kw: ['가을','단풍','낙엽','수확','선선'] },
  winter:  { n: '겨울',     e: '❄️',  hasDN: false, kw: ['겨울','눈','snow','크리스마스','추위'] },
  space:   { n: '우주',     e: '🌌',  hasDN: false, kw: ['우주','space','별','행성','galaxy','은하'] },
  ocean:   { n: '바다',     e: '🌊',  hasDN: false, kw: ['바다','ocean','sea','파도','산호'] },
  desert:  { n: '사막',     e: '🏜️', hasDN: true,  kw: ['사막','모래','건조','피라미드','낙타'] },
  fantasy: { n: '판타지',   e: '🏰',  hasDN: false, kw: ['판타지','마법','castle','성','드래곤'] },
  sakura:  { n: '벚꽃길',   e: '🌺',  hasDN: false, kw: ['벚꽃','sakura','연분홍'] },
  rain:    { n: '비오는날', e: '🌧️', hasDN: false, kw: ['비','rain','우울','흐린','폭풍'] },
  sunset:  { n: '노을',     e: '🌅',  hasDN: false, kw: ['노을','sunset','저녁','황혼','오렌지'] },
  yard:    { n: '주택마당',  e: '🏡',  hasDN: true,  kw: ['주택','마당','집','yard','house','정원','뜰','한옥','깔끔','주거','동네','골목','마을'] },
  mediter: { n: '지중해',   e: '🏖️', hasDN: false, kw: ['지중해','mediterranean','해안','코발트','테라코타','흰벽','거실','터키블루','에게해','그리스','이탈리아','프로방스','리조트','빌라','해변거실','해안가'] },
};

const matchTheme = (txt) => {
  const t = (txt || '').toLowerCase();
  // Direct aliases before keyword scoring
  if (['지중해','mediterranean','에게해','그리스','이탈리아','프로방스','코발트','흰벽','테라코타'].some(w => t.includes(w))) return 'mediter';
  if (['주택마당','주택','마당','뜰','한옥'].some(w => t.includes(w))) return 'yard';
  if (['우주','은하','행성','로켓','galaxy'].some(w => t.includes(w))) return 'space';
  if (['판타지','드래곤','마법','castle','성'].some(w => t.includes(w))) return 'fantasy';
  if (['벚꽃','sakura','연분홍'].some(w => t.includes(w))) return 'sakura';
  if (['노을','황혼','sunset'].some(w => t.includes(w))) return 'sunset';
  if (['비오는','폭풍','흐린'].some(w => t.includes(w))) return 'rain';
  let best = 'city', best_s = 0;
  Object.entries(THEMES).forEach(([k, v]) => {
    const sc = v.kw.filter(w => t.includes(w)).length;
    if (sc > best_s) { best_s = sc; best = k; }
  });
  return best;
};

/* ── REWARD CATEGORIES ── */
const RCATS = {
  city:    { n: '도시',   c: '#475569', e: '🏙️', items: [{id:'car',e:'🚗',n:'자동차'},{id:'bus',e:'🚌',n:'버스'},{id:'trf',e:'🚦',n:'신호등'},{id:'bld',e:'🏢',n:'빌딩'},{id:'brg',e:'🌉',n:'다리'},{id:'sub',e:'🚇',n:'지하철'},{id:'crn',e:'🏗️',n:'크레인'},{id:'taxi',e:'🚕',n:'택시'}] },
  nature:  { n: '자연',   c: '#16A34A', e: '🌿', items: [{id:'flw',e:'🌺',n:'꽃'},{id:'tre',e:'🌳',n:'나무'},{id:'but',e:'🦋',n:'나비'},{id:'bir',e:'🐦',n:'새'},{id:'bee',e:'🐝',n:'꿀벌'},{id:'rbo',e:'🌈',n:'무지개'},{id:'sun2',e:'☀️',n:'해'},{id:'cld',e:'☁️',n:'구름'}] },
  forest:  { n: '숲',     c: '#15803D', e: '🌲', items: [{id:'msh',e:'🍄',n:'버섯'},{id:'pin',e:'🌲',n:'소나무'},{id:'fox',e:'🦊',n:'여우'},{id:'owl',e:'🦉',n:'부엉이'},{id:'acn',e:'🌰',n:'도토리'},{id:'lef',e:'🍃',n:'잎'},{id:'der',e:'🦌',n:'사슴'},{id:'frn',e:'🌿',n:'양치류'}] },
  spring:  { n: '봄',     c: '#DB2777', e: '🌸', items: [{id:'skr',e:'🌸',n:'벚꽃'},{id:'tlp',e:'🌷',n:'튤립'},{id:'dsy',e:'🌼',n:'데이지'},{id:'bug',e:'🐞',n:'무당벌레'},{id:'chk',e:'🐣',n:'병아리'},{id:'sdl',e:'🌱',n:'새싹'},{id:'kit',e:'🪁',n:'연'},{id:'pch',e:'🍑',n:'복숭아'}] },
  summer:  { n: '여름',   c: '#D97706', e: '☀️', items: [{id:'wml',e:'🍉',n:'수박'},{id:'ice',e:'🍦',n:'아이스크림'},{id:'sfr',e:'🌻',n:'해바라기'},{id:'crb',e:'🦀',n:'게'},{id:'shl',e:'🐚',n:'조개'},{id:'par',e:'⛱️',n:'파라솔'},{id:'fsh',e:'🐠',n:'열대어'},{id:'wav',e:'🌊',n:'파도'}] },
  autumn:  { n: '가을',   c: '#C2410C', e: '🍂', items: [{id:'mpl',e:'🍁',n:'단풍'},{id:'wht',e:'🌾',n:'수확'},{id:'pmp',e:'🎃',n:'호박'},{id:'nut',e:'🌰',n:'밤'},{id:'grp',e:'🍇',n:'포도'},{id:'ms2',e:'🍄',n:'버섯'},{id:'mn2',e:'🌕',n:'보름달'},{id:'wnd',e:'🌬️',n:'바람'}] },
  winter:  { n: '겨울',   c: '#1D4ED8', e: '❄️', items: [{id:'snm',e:'⛄',n:'눈사람'},{id:'flk',e:'❄️',n:'눈송이'},{id:'cco',e:'☕',n:'코코아'},{id:'mtt',e:'🧤',n:'장갑'},{id:'hat',e:'🎩',n:'모자'},{id:'pgn',e:'🐧',n:'펭귄'},{id:'sld',e:'🛷',n:'썰매'},{id:'crs',e:'💎',n:'크리스탈'}] },
  space:   { n: '우주',   c: '#7C3AED', e: '🌌', items: [{id:'plt',e:'🪐',n:'행성'},{id:'rkt',e:'🚀',n:'로켓'},{id:'str',e:'⭐',n:'별'},{id:'mon',e:'🌙',n:'달'},{id:'ufo',e:'🛸',n:'UFO'},{id:'cmt',e:'☄️',n:'혜성'},{id:'ast',e:'👨‍🚀',n:'우주인'},{id:'gal',e:'🌌',n:'은하'}] },
  ocean:   { n: '바다',   c: '#0369A1', e: '🌊', items: [{id:'whl',e:'🐋',n:'고래'},{id:'dlp',e:'🐬',n:'돌고래'},{id:'oct',e:'🐙',n:'문어'},{id:'crl',e:'🪸',n:'산호'},{id:'jly',e:'🪼',n:'해파리'},{id:'anc',e:'⚓',n:'닻'},{id:'shp',e:'⛵',n:'배'},{id:'lth',e:'🏠',n:'등대'}] },
  desert:  { n: '사막',   c: '#B45309', e: '🏜️', items: [{id:'cct',e:'🌵',n:'선인장'},{id:'cml',e:'🐪',n:'낙타'},{id:'scp',e:'🦂',n:'전갈'},{id:'pyr',e:'🏛️',n:'피라미드'},{id:'oas',e:'🌴',n:'오아시스'},{id:'snd',e:'⏳',n:'모래시계'},{id:'lzd',e:'🦎',n:'도마뱀'},{id:'srp',e:'🐍',n:'뱀'}] },
  fantasy: { n: '판타지', c: '#7E22CE', e: '🏰', items: [{id:'cst',e:'🏰',n:'성'},{id:'drg',e:'🐉',n:'드래곤'},{id:'mag',e:'✨',n:'마법'},{id:'bal',e:'🔮',n:'수정구슬'},{id:'crw',e:'👑',n:'왕관'},{id:'swd',e:'⚔️',n:'검'},{id:'uni',e:'🦄',n:'유니콘'},{id:'fry',e:'🧚',n:'요정'}] },
};

const getAllItems = () =>
  Object.entries(RCATS).flatMap(([k, v]) => v.items.map(it => ({ ...it, catKey: k })));

const rndRewardFull = () => {
  const keys = Object.keys(RCATS);
  const k = keys[Math.floor(Math.random() * keys.length)];
  const it = RCATS[k].items[Math.floor(Math.random() * RCATS[k].items.length)];
  return { ...it, catKey: k };
};

/* ── CONFETTI ── */
const CCOLS = ['#7C3AED','#10B981','#F59E0B','#EF4444','#3B82F6','#EC4899','#8B5CF6','#34D399'];

function Confetti({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, []);
  const pieces = Array.from({ length: 70 }, (_, i) => ({
    id: i, color: CCOLS[i % CCOLS.length],
    left: rn(i * 7) * 108 - 3,
    startY: rn(i) > 0.5 ? '-18px' : '108vh',
    dur: (1.5 + rn(i * 2) * 2).toFixed(2) + 's',
    delay: (rn(i * 11) * 0.9).toFixed(2) + 's',
    to: (rn(i) > 0.5 ? 1 : -1) * (44 + rn(i * 3) * 70) + 'vh',
    size: 7 + rn(i * 13) * 10,
    round: rn(i) > 0.5,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 500, overflow: 'hidden', pointerEvents: 'none' }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: p.left + '%', top: p.startY,
          width: p.size, height: p.size, background: p.color,
          borderRadius: p.round ? '50%' : '3px',
          animation: `qgConfetti ${p.dur} ease-out ${p.delay} forwards`,
          '--to': p.to,
        }} />
      ))}
    </div>
  );
}

/* ── SVG BACKGROUNDS ── */
function CityBg({ isDark }) {
  const blds = [[0,85,245],[72,60,318],[134,108,182],[238,72,368],[306,52,272],[352,130,170],[474,68,302],[540,102,248],[638,56,340],[690,124,213],[808,78,290],[882,82,202],[960,60,275]];
  const gy = 490;
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="csky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? '#010915' : '#1565C0'} />
          <stop offset="55%" stopColor={isDark ? '#0A1832' : '#42A5F5'} />
          <stop offset="100%" stopColor={isDark ? '#101E3A' : '#90CAF9'} />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#csky)" />
      {isDark && Array.from({ length: 90 }, (_, i) => (
        <circle key={i} cx={rn(i * 7) * 1024} cy={rn(i * 13) * 390} r={0.4 + rn(i * 3) * 1.4} fill="#FFF" opacity={0.3 + rn(i * 11) * 0.6} />
      ))}
      {isDark && <><circle cx="820" cy="80" r="42" fill="#FFFDE7" opacity=".94" /><circle cx="834" cy="68" r="33" fill="#0A1832" opacity=".28" /></>}
      {!isDark && (
        <>
          <circle cx="900" cy="72" r="54" fill="#FFF176" opacity=".94" />
          {[[130,62,82],[370,45,66],[610,74,78]].map(([cx, cy, sz], i) => (
            <g key={i}>
              <ellipse cx={cx} cy={cy} rx={sz} ry={sz * 0.42} fill="white" opacity=".88" />
              <ellipse cx={cx - sz * 0.35} cy={cy + sz * 0.12} rx={sz * 0.62} ry={sz * 0.35} fill="white" opacity=".88" />
              <ellipse cx={cx + sz * 0.38} cy={cy + sz * 0.08} rx={sz * 0.55} ry={sz * 0.32} fill="white" opacity=".88" />
            </g>
          ))}
        </>
      )}
      {blds.map(([x, w, h], i) => {
        const bc = isDark
          ? ['#0D1829','#0E1B2C','#091523','#0C1A28','#0F1D30'][i % 5]
          : ['#8898AA','#7A8FA5','#95A8B5','#6D8498','#8BADBE'][i % 5];
        const ty = gy - h, wc = Math.max(2, Math.floor(w / 22)), wr = Math.max(2, Math.floor(h / 22));
        return (
          <g key={i}>
            <rect x={x} y={ty} width={w} height={h} fill={bc} />
            {i % 4 === 0 && <rect x={x + w / 2 - 2} y={ty - 14} width={4} height={14} fill={bc} />}
            {Array.from({ length: wr }, (_, r) =>
              Array.from({ length: wc }, (_, c) => {
                const lit = isDark ? rn(i * 17 + r * 7 + c * 3) > 0.36 : true;
                return lit ? (
                  <rect key={`${r}-${c}`}
                    x={x + 7 + c * (w - 14) / wc} y={ty + 9 + r * 21}
                    width={Math.min(9, (w - 18) / wc)} height={7}
                    fill={isDark ? '#FFEDB0' : '#B8CEE0'} opacity={isDark ? 0.88 : 0.52} />
                ) : null;
              })
            )}
          </g>
        );
      })}
      <rect x="0" y={gy} width="1024" height="90" fill={isDark ? '#060606' : '#3D3D3D'} />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={i * 106 + 14} y={gy + 42} width={58} height={5} fill="#F9C74F" opacity=".7" />
      ))}
    </svg>
  );
}

function NatureBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2196F3" /><stop offset="55%" stopColor="#81D4FA" /><stop offset="100%" stopColor="#A5D6A7" />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#nsky)" />
      <circle cx="880" cy="78" r="54" fill="#FFF176" opacity=".94" />
      {[[145,62,82],[380,46,68],[625,76,85]].map(([cx, cy, sz], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={sz} ry={sz * 0.42} fill="white" opacity=".9" />
          <ellipse cx={cx - sz * 0.35} cy={cy + sz * 0.12} rx={sz * 0.62} ry={sz * 0.35} fill="white" opacity=".9" />
          <ellipse cx={cx + sz * 0.38} cy={cy + sz * 0.08} rx={sz * 0.55} ry={sz * 0.32} fill="white" opacity=".9" />
        </g>
      ))}
      <rect x="0" y="468" width="1024" height="112" fill="#66BB6A" />
      <ellipse cx="512" cy="555" rx="640" ry="148" fill="#81C784" />
      {[65,190,348,490,638,800,920].map((x, i) => {
        const h = 88 + (i % 3) * 44;
        return (
          <g key={i}>
            <rect x={x + 7} y={470 - h} width={9} height={h + 22} fill="#5D4037" />
            <ellipse cx={x + 11} cy={470 - h} rx={28} ry={42} fill={['#2E7D32','#388E3C','#43A047'][i % 3]} />
          </g>
        );
      })}
    </svg>
  );
}

function ForestBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B2A1B" /><stop offset="50%" stopColor="#2E4A2E" /><stop offset="100%" stopColor="#1A3A1A" />
        </linearGradient>
        <linearGradient id="ffog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(180,210,180,0)" /><stop offset="100%" stopColor="rgba(180,210,180,.32)" />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#fsky)" />
      {Array.from({ length: 18 }, (_, i) => {
        const x = i * 58 + rn(i * 17) * 16 - 8, h = 175 + rn(i * 13) * 115, w = 34 + rn(i * 7) * 18;
        return (
          <g key={i} opacity=".38">
            <rect x={x + w / 2 - 4} y={510 - h} width={8} height={h} fill="#1A2E1A" />
            <polygon points={`${x + w / 2},${510 - h - 76} ${x},${510 - h + 56} ${x + w},${510 - h + 56}`} fill="#1E3D1E" />
          </g>
        );
      })}
      {[0,128,256,400,558,708,870,980].map((x, i) => {
        const h = 218 + rn(i * 31) * 98, w = 54 + rn(i * 11) * 28;
        return (
          <g key={i}>
            <rect x={x + w / 2 - 6} y={515 - h} width={12} height={h} fill="#2D1B0E" />
            <polygon points={`${x + w / 2},${515 - h - 88} ${x},${515 - h + 76} ${x + w},${515 - h + 76}`} fill="#1B3D1A" />
            <polygon points={`${x + w / 2},${515 - h - 144} ${x + 12},${515 - h + 18} ${x + w - 12},${515 - h + 18}`} fill="#1E4A1E" />
          </g>
        );
      })}
      <rect x="0" y="515" width="1024" height="65" fill="#0F1F0F" />
      <rect x="0" y="452" width="1024" height="118" fill="url(#ffog)" />
    </svg>
  );
}

function SpringBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="spsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF0F5" /><stop offset="50%" stopColor="#FFB7C5" /><stop offset="100%" stopColor="#FF8FAB" />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#spsky)" />
      {Array.from({ length: 30 }, (_, i) => (
        <ellipse key={i} cx={rn(i * 7) * 1024} cy={rn(i * 13) * 420 + 40}
          rx={5 + rn(i * 3) * 7} ry={3 + rn(i * 11) * 4}
          fill="#FFAEC9" opacity={0.4 + rn(i * 17) * 0.5}
          transform={`rotate(${rn(i) * 180} ${rn(i * 7) * 1024} ${rn(i * 13) * 420 + 40})`} />
      ))}
      {[75, 268, 480, 676, 876].map((x, i) => {
        const h = 165 + i * 18;
        return (
          <g key={i}>
            <rect x={x - 5} y={478 - h} width={10} height={h + 18} fill="#5D3A1A" />
            {[[0,-28,58],[-28,8,48],[28,8,52],[-8,48,43],[8,48,38]].map(([dx, dy, r], j) => (
              <ellipse key={j} cx={x + dx} cy={478 - h + dy} rx={r} ry={r * 0.78}
                fill={['#FFB7C5','#FF80A0','#FFC0D0','#FF90B3','#FFAACC'][j]} opacity=".9" />
            ))}
          </g>
        );
      })}
      <rect x="0" y="488" width="1024" height="92" fill="#C8E6C9" />
      <ellipse cx="512" cy="552" rx="620" ry="122" fill="#DCEDC8" />
    </svg>
  );
}

function SummerBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="susky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1565C0" /><stop offset="42%" stopColor="#1E88E5" />
          <stop offset="55%" stopColor="#29B6F6" /><stop offset="100%" stopColor="#006994" />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#susky)" />
      <circle cx="900" cy="74" r="60" fill="#FFF176" opacity=".94" />
      {[375, 405, 432, 458].map((y, i) => (
        <path key={i} d={`M0,${y} Q256,${y - 18} 512,${y} Q768,${y + 18} 1024,${y} L1024,580 L0,580 Z`}
          fill={`rgba(2,136,209,${0.38 + i * 0.14})`} />
      ))}
      <ellipse cx="512" cy="558" rx="720" ry="115" fill="#FFD54F" opacity=".9" />
      <rect x="0" y="510" width="1024" height="70" fill="#FFCA28" />
    </svg>
  );
}

function AutumnBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="ausky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BF360C" /><stop offset="40%" stopColor="#E64A19" />
          <stop offset="80%" stopColor="#FF7043" /><stop offset="100%" stopColor="#FF8A65" />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#ausky)" />
      {Array.from({ length: 34 }, (_, i) => (
        <ellipse key={i} cx={rn(i * 11) * 1024} cy={rn(i * 7) * 490}
          rx={7 + rn(i * 3) * 9} ry={5 + rn(i * 13) * 5}
          fill={['#E65100','#BF360C','#DD2C00','#FF6D00','#D84315'][i % 5]}
          opacity={0.46 + rn(i * 17) * 0.5}
          transform={`rotate(${rn(i) * 360} ${rn(i * 11) * 1024} ${rn(i * 7) * 490})`} />
      ))}
      {[55, 200, 376, 556, 724, 896].map((x, i) => {
        const h = 155 + (i % 3) * 38;
        return (
          <g key={i}>
            <rect x={x - 5} y={482 - h} width={10} height={h + 18} fill="#3E2723" />
            <ellipse cx={x} cy={482 - h} rx={42} ry={54}
              fill={['#E65100','#BF360C','#FF8F00','#DD2C00','#FF6D00','#D84315'][i]} />
          </g>
        );
      })}
      <rect x="0" y="482" width="1024" height="98" fill="#4E342E" />
    </svg>
  );
}

function WinterBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B0BEC5" /><stop offset="50%" stopColor="#CFD8DC" /><stop offset="100%" stopColor="#ECEFF1" />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#wsky)" />
      {Array.from({ length: 48 }, (_, i) => (
        <text key={i} x={rn(i * 11) * 1000} y={rn(i * 7) * 470 + 18}
          fontSize={8 + rn(i * 3) * 14} fill="white" opacity={0.36 + rn(i) * 0.5}>❄</text>
      ))}
      <rect x="0" y="476" width="1024" height="104" fill="white" />
      <ellipse cx="512" cy="472" rx="720" ry="60" fill="white" />
      {[75, 226, 408, 578, 742, 900].map((x, i) => (
        <g key={i}>
          <rect x={x - 4} y={384 - (i % 3) * 18} width={8} height={94} fill="#4E342E" />
          <polygon points={`${x},${304 - (i % 3) * 18} ${x - 38},${412 - (i % 3) * 18} ${x + 38},${412 - (i % 3) * 18}`} fill="#1B5E20" />
          <polygon points={`${x},${344 - (i % 3) * 18} ${x - 30},${435 - (i % 3) * 18} ${x + 30},${435 - (i % 3) * 18}`} fill="#2E7D32" opacity=".9" />
          <polygon points={`${x},${304 - (i % 3) * 18} ${x - 28},${372 - (i % 3) * 18} ${x + 28},${372 - (i % 3) * 18}`} fill="rgba(255,255,255,.58)" />
        </g>
      ))}
      <circle cx="512" cy="474" r="28" fill="white" stroke="#B0BEC5" strokeWidth="1" />
      <circle cx="512" cy="434" r="19" fill="white" stroke="#B0BEC5" strokeWidth="1" />
      <circle cx="506" cy="431" r="2.5" fill="#333" /><circle cx="518" cy="431" r="2.5" fill="#333" />
      <rect x="504" y="413" width="16" height="9" rx="2" fill="#333" />
    </svg>
  );
}

function SpaceBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <radialGradient id="spbg" cx="30%" cy="40%">
          <stop offset="0%" stopColor="#1A0040" /><stop offset="50%" stopColor="#0A0020" /><stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="neb" cx="70%" cy="30%">
          <stop offset="0%" stopColor="rgba(100,0,200,.28)" /><stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#spbg)" />
      <ellipse cx="780" cy="195" rx="300" ry="200" fill="url(#neb)" />
      {Array.from({ length: 120 }, (_, i) => (
        <circle key={i} cx={rn(i * 7) * 1024} cy={rn(i * 13) * 580}
          r={0.3 + rn(i * 3) * 1.7} fill="white" opacity={0.28 + rn(i * 11) * 0.68} />
      ))}
      <circle cx="820" cy="148" r="78" fill="#9C27B0" opacity=".9" />
      <ellipse cx="820" cy="148" rx="122" ry="19" fill="none" stroke="#CE93D8" strokeWidth="11" opacity=".7" />
      <circle cx="655" cy="94" r="18" fill="#9E9E9E" />
      <rect x="0" y="528" width="1024" height="52" fill="#1A1A2E" />
    </svg>
  );
}

function OceanBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="ocsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#006064" /><stop offset="38%" stopColor="#00838F" />
          <stop offset="58%" stopColor="#0097A7" /><stop offset="100%" stopColor="#00BCD4" />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#ocsky)" />
      {[[200,145,'#FF8F00'],[500,298,'#E91E63'],[750,198,'#7B1FA2'],[300,398,'#1565C0'],[650,445,'#00897B']].map(([x, y, c], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={18 + i * 5} ry={9 + i * 3} fill={c} opacity=".82" />
          <polygon points={`${x + 20 + i * 5},${y} ${x + 30 + i * 5},${y - 7} ${x + 30 + i * 5},${y + 7}`} fill={c} opacity=".82" />
        </g>
      ))}
      {[75, 248, 450, 678, 868].map((x, i) => (
        <g key={i}>
          <rect x={x} y={492} width={7} height={74} rx="3.5"
            fill={['#EF5350','#EC407A','#FF7043','#AB47BC','#26C6DA'][i]} opacity=".9" />
          <ellipse cx={x + 3.5} cy={492} rx={19} ry={23}
            fill={['#EF5350','#EC407A','#FF7043','#AB47BC','#26C6DA'][i]} opacity=".9" />
        </g>
      ))}
      <rect x="0" y="535" width="1024" height="45" fill="#004D40" opacity=".8" />
    </svg>
  );
}

function DesertBg({ isDark }) {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? '#1A0500' : '#FF6F00'} />
          <stop offset="50%" stopColor={isDark ? '#2D0D00' : '#FF8F00'} />
          <stop offset="100%" stopColor={isDark ? '#3E1A00' : '#FFB300'} />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#dsky)" />
      {isDark && Array.from({ length: 80 }, (_, i) => (
        <circle key={i} cx={rn(i * 7) * 1024} cy={rn(i * 13) * 400}
          r={0.4 + rn(i * 3) * 1.4} fill="#FFF" opacity={0.28 + rn(i * 11) * 0.58} />
      ))}
      {!isDark && <><circle cx="900" cy="80" r="54" fill="#FF6F00" opacity=".95" /><circle cx="900" cy="80" r="74" fill="#FF8F00" opacity=".26" /></>}
      <ellipse cx="210" cy="518" rx="358" ry="128" fill={isDark ? '#3E1A00' : '#FFA000'} />
      <ellipse cx="820" cy="532" rx="402" ry="118" fill={isDark ? '#2D0D00' : '#FFB300'} opacity=".9" />
      <rect x="0" y="478" width="1024" height="102" fill={isDark ? '#3D1600' : '#FF8F00'} />
      {[120, 348, 578, 780].map((x, i) => (
        <g key={i} fill={isDark ? '#1B5E20' : '#2E7D32'}>
          <rect x={x - 5} y={404} width={10} height={76} rx="5" />
          <rect x={x - 24} y={428} width={21} height={7} rx="3.5" />
          <rect x={x + 3} y={438} width={21} height={7} rx="3.5" />
          <rect x={x - 24} y={414} width={7} height={21} rx="3.5" />
          <rect x={x + 17} y={424} width={7} height={21} rx="3.5" />
        </g>
      ))}
    </svg>
  );
}

function FantasyBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="fanbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A0030" /><stop offset="50%" stopColor="#4A0080" /><stop offset="100%" stopColor="#6A00B0" />
        </linearGradient>
        <radialGradient id="mglow" cx="50%" cy="40%">
          <stop offset="0%" stopColor="rgba(180,0,255,.22)" /><stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#fanbg)" />
      <ellipse cx="512" cy="244" rx="410" ry="278" fill="url(#mglow)" />
      {Array.from({ length: 80 }, (_, i) => (
        <circle key={i} cx={rn(i * 7) * 1024} cy={rn(i * 13) * 450}
          r={0.4 + rn(i * 3) * 1.9}
          fill={['#FFF','#FFD700','#E0B0FF','#B0E0FF'][i % 4]}
          opacity={0.28 + rn(i * 11) * 0.68} />
      ))}
      <circle cx="838" cy="96" r="50" fill="#FFF0E0" />
      <circle cx="852" cy="84" r="38" fill="#1A0030" opacity=".26" />
      <rect x="388" y="316" width="248" height="180" fill="#2D1B45" />
      <rect x="378" y="278" width="52" height="100" fill="#261540" />
      <rect x="594" y="268" width="52" height="110" fill="#261540" />
      <polygon points="378,278 404,236 430,278" fill="#7B1FA2" />
      <polygon points="594,268 620,226 646,268" fill="#7B1FA2" />
      <rect x="448" y="346" width="60" height="80" fill="#1A0A28" />
      {[[404,296,14,19],[610,290,14,19],[456,336,22,28],[530,336,22,28]].map(([x, y, w, h], i) => (
        <ellipse key={i} cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill="#FFD700" opacity=".82" />
      ))}
      <rect x="0" y="492" width="1024" height="88" fill="#0D0020" />
    </svg>
  );
}

function SakuraBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="saksky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCE4EC" /><stop offset="50%" stopColor="#F8BBD0" /><stop offset="100%" stopColor="#F48FB1" />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#saksky)" />
      {Array.from({ length: 40 }, (_, i) => (
        <ellipse key={i} cx={rn(i * 7) * 1024} cy={rn(i * 13) * 418 + 35}
          rx={5 + rn(i * 3) * 6} ry={3 + rn(i * 11) * 3.5}
          fill="#FFAEC9" opacity={0.42 + rn(i * 17) * 0.5}
          transform={`rotate(${rn(i) * 180} ${rn(i * 7) * 1024} ${rn(i * 13) * 418 + 35})`} />
      ))}
      {[75, 265, 480, 678, 876].map((x, i) => {
        const h = 162 + i * 17;
        return (
          <g key={i}>
            <rect x={x - 5} y={470 - h} width={10} height={h + 17} fill="#4E342E" />
            {[[0,-26,56],[-26,7,46],[26,7,50],[-7,46,42],[7,46,37]].map(([dx, dy, r], j) => (
              <ellipse key={j} cx={x + dx} cy={470 - h + dy} rx={r} ry={r * 0.78}
                fill={['#F48FB1','#F06292','#F48FB1','#EC407A','#FFAACC'][j]} opacity=".9" />
            ))}
          </g>
        );
      })}
      <rect x="0" y="478" width="1024" height="102" fill="#E8F5E9" />
      <ellipse cx="512" cy="545" rx="620" ry="118" fill="#DCEDC8" />
    </svg>
  );
}

function RainBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#455A64" /><stop offset="50%" stopColor="#546E7A" /><stop offset="100%" stopColor="#607D8B" />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#rsky)" />
      {[[145,58,118],[390,40,98],[680,70,128],[900,44,88]].map(([cx, cy, sz], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={sz} ry={sz * 0.44} fill="#78909C" opacity=".9" />
          <ellipse cx={cx - sz * 0.35} cy={cy + sz * 0.12} rx={sz * 0.65} ry={sz * 0.38} fill="#78909C" opacity=".9" />
          <ellipse cx={cx + sz * 0.38} cy={cy + sz * 0.08} rx={sz * 0.58} ry={sz * 0.35} fill="#78909C" opacity=".9" />
        </g>
      ))}
      {Array.from({ length: 80 }, (_, i) => (
        <line key={i}
          x1={rn(i * 7) * 1024} y1={rn(i * 13) * 498}
          x2={rn(i * 7) * 1024 - 7} y2={rn(i * 13) * 498 + 19}
          stroke="#B0BEC5" strokeWidth="1.2" opacity={0.36 + rn(i * 3) * 0.46} />
      ))}
      {[0, 118, 238, 378, 498, 650, 790, 906].map((x, i) => (
        <rect key={i} x={x} y={388 - (i % 3) * 38} width={100 + (i % 4) * 14} height={110 + (i % 3) * 38} fill="#263238" opacity=".72" />
      ))}
      <rect x="0" y="490" width="1024" height="90" fill="#37474F" />
    </svg>
  );
}

function SunsetBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="susetsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A237E" /><stop offset="18%" stopColor="#3949AB" />
          <stop offset="42%" stopColor="#E53935" /><stop offset="62%" stopColor="#FF7043" />
          <stop offset="78%" stopColor="#FFB74D" /><stop offset="100%" stopColor="#FFD54F" />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#susetsky)" />
      <circle cx="512" cy="490" r="80" fill="#FFD54F" opacity=".94" />
      <circle cx="512" cy="490" r="106" fill="#FFB74D" opacity=".26" />
      <path d="M0,490 Q256,480 512,490 Q768,500 1024,490 L1024,580 L0,580 Z" fill="#1565C0" opacity=".48" />
      <rect x="0" y="488" width="1024" height="4" fill="#FF8F00" opacity=".56" />
      <polygon points="0,490 148,418 300,458 448,388 512,408 608,368 712,428 858,398 1024,448 1024,490" fill="#1A237E" opacity=".82" />
    </svg>
  );
}

function MediterraneanBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="mdsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1565C0" />
          <stop offset="40%" stopColor="#1E88E5" />
          <stop offset="70%" stopColor="#039BE5" />
          <stop offset="100%" stopColor="#0277BD" />
        </linearGradient>
        <linearGradient id="mdsea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#006994" />
          <stop offset="50%" stopColor="#0288D1" />
          <stop offset="100%" stopColor="#29B6F6" />
        </linearGradient>
        <linearGradient id="mdterr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E64A19" />
          <stop offset="100%" stopColor="#BF360C" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="1024" height="580" fill="url(#mdsky)" />

      {/* Sun */}
      <circle cx="880" cy="80" r="58" fill="#FFF176" opacity=".92" />
      <circle cx="880" cy="80" r="76" fill="#FFF176" opacity=".16" />

      {/* Clouds */}
      {[[140, 55, 78], [440, 38, 60], [700, 60, 72]].map(([cx, cy, sz], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={sz} ry={sz * 0.4} fill="white" opacity=".88" />
          <ellipse cx={cx - sz * 0.35} cy={cy + sz * 0.12} rx={sz * 0.6} ry={sz * 0.32} fill="white" opacity=".88" />
          <ellipse cx={cx + sz * 0.35} cy={cy + sz * 0.08} rx={sz * 0.52} ry={sz * 0.3} fill="white" opacity=".88" />
        </g>
      ))}

      {/* Sea */}
      <rect x="0" y="390" width="1024" height="190" fill="url(#mdsea)" />
      {/* Sea shimmer */}
      {[400, 422, 445, 468, 490].map((y, i) => (
        <path key={i} d={`M0,${y} Q${128 + i * 30},${y - 8} ${256 + i * 20},${y} Q${512},${y + 6} ${768 - i * 20},${y} Q${896 - i * 30},${y - 5} 1024,${y}`}
          fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      ))}

      {/* Cliff / terrace base */}
      <ellipse cx="512" cy="400" rx="700" ry="60" fill="#DEB887" opacity=".9" />
      <rect x="0" y="370" width="1024" height="50" fill="#D2A679" />

      {/* Main white villa - center */}
      {/* Body */}
      <rect x="340" y="210" width="344" height="190" rx="4" fill="#FAFAFA" />
      {/* Terracotta roof */}
      <rect x="328" y="190" width="368" height="30" rx="3" fill="url(#mdterr)" />
      <rect x="328" y="185" width="368" height="12" rx="2" fill="#FF5722" opacity=".7" />
      {/* Roof ridge tiles - detail */}
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={332 + i * 30} y={188} width={28} height={10} rx="5" fill="#E64A19" opacity=".8" />
      ))}

      {/* Windows - villa */}
      {[[370, 230], [450, 230], [540, 230], [620, 230]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width={46} height={58} rx="2" fill="#90CAF9" opacity=".85" />
          <rect x={x} y={y} width={46} height={58} rx="2" fill="none" stroke="#1565C0" strokeWidth="2" />
          <line x1={x + 23} y1={y} x2={x + 23} y2={y + 58} stroke="#1565C0" strokeWidth="1.5" />
          <line x1={x} y1={y + 29} x2={x + 46} y2={y + 29} stroke="#1565C0" strokeWidth="1.5" />
          {/* Blue shutters */}
          <rect x={x - 10} y={y - 2} width={10} height={62} rx="1" fill="#1565C0" opacity=".7" />
          <rect x={x + 46} y={y - 2} width={10} height={62} rx="1" fill="#1565C0" opacity=".7" />
        </g>
      ))}

      {/* Arched door */}
      <rect x="490" y="305" width="44" height="65" rx="22" fill="#1565C0" opacity=".8" />
      <rect x="490" y="330" width="44" height="42" fill="#1565C0" opacity=".8" />
      <circle cx="512" cy="348" r="4" fill="#FFF176" />
      {/* Door step */}
      <rect x="480" y="369" width="64" height="8" rx="3" fill="#D2A679" />

      {/* Terrace / balcony rail */}
      <rect x="340" y="360" width="344" height="14" rx="3" fill="#F5F5F5" />
      {Array.from({ length: 22 }, (_, i) => (
        <rect key={i} x={346 + i * 15} y={361} width={4} height={13} rx="2" fill="#E0E0E0" />
      ))}

      {/* Left wing house */}
      <rect x="100" y="248" width="240" height="152" rx="4" fill="#F5F5F5" />
      <rect x="88" y="228" width="264" height="26" rx="3" fill="url(#mdterr)" />
      {[[115, 265], [185, 265], [255, 265]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width={40} height={50} rx="2" fill="#90CAF9" opacity=".85" />
          <rect x={x} y={y} width={40} height={50} rx="2" fill="none" stroke="#1565C0" strokeWidth="1.5" />
          <rect x={x - 8} y={y - 2} width={8} height={54} rx="1" fill="#1565C0" opacity=".65" />
          <rect x={x + 40} y={y - 2} width={8} height={54} rx="1" fill="#1565C0" opacity=".65" />
        </g>
      ))}
      <rect x="190" y="330" width="40" height="70" rx="20" fill="#1E88E5" opacity=".7" />

      {/* Right wing house */}
      <rect x="684" y="248" width="240" height="152" rx="4" fill="#F5F5F5" />
      <rect x="672" y="228" width="264" height="26" rx="3" fill="url(#mdterr)" />
      {[[700, 265], [770, 265], [840, 265]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width={40} height={50} rx="2" fill="#90CAF9" opacity=".85" />
          <rect x={x} y={y} width={40} height={50} rx="2" fill="none" stroke="#1565C0" strokeWidth="1.5" />
          <rect x={x - 8} y={y - 2} width={8} height={54} rx="1" fill="#1565C0" opacity=".65" />
          <rect x={x + 40} y={y - 2} width={8} height={54} rx="1" fill="#1565C0" opacity=".65" />
        </g>
      ))}

      {/* Cypress trees */}
      {[62, 298, 728, 960].map((x, i) => (
        <g key={i}>
          <rect x={x + 6} y={260} width={8} height={110} fill="#5D4037" />
          <ellipse cx={x + 10} cy={295} rx={16} ry={52} fill="#2E7D32" opacity=".9" />
          <ellipse cx={x + 10} cy={268} rx={11} ry={32} fill="#388E3C" opacity=".85" />
        </g>
      ))}

      {/* Flower pots on terrace */}
      {[[360, 358], [480, 358], [544, 358], [660, 358]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y + 6} width={16} height={12} rx="2" fill="#E64A19" />
          <ellipse cx={x + 8} cy={y + 5} rx={10} ry={7} fill="#E64A19" />
          <circle cx={x + 8} cy={y} r={7} fill={['#FF80AB','#FFF176','#FF80AB','#AED581'][i]} />
        </g>
      ))}

      {/* Cobblestone path */}
      <ellipse cx="512" cy="390" rx="80" ry="18" fill="#C4A882" />
      {[370, 382, 394].map((y, i) => (
        <ellipse key={i} cx={512} cy={y} rx={22 + i * 4} ry={6} fill="#BCA070" opacity=".6" />
      ))}

      {/* Ground / terrace floor */}
      <rect x="0" y="390" width="1024" height="50" fill="#D2A679" opacity=".55" />
      <rect x="0" y="418" width="1024" height="162" fill="url(#mdsea)" />

      {/* Sailboat on sea */}
      <polygon points="820,415 850,385 850,430" fill="white" opacity=".9" />
      <rect x="848" y="385" width="3" height="50" fill="#795548" />
      <rect x="800" y="426" width="55" height="9" rx="4" fill="#795548" />

      {/* Olive trees far left/right */}
      {[18, 990].map((x, i) => (
        <g key={i}>
          <rect x={x} y={300} width={6} height={90} fill="#5D4037" />
          <ellipse cx={x + 3} cy={310} rx={22} ry={28} fill="#558B2F" opacity=".85" />
          <ellipse cx={x + 3} cy={298} rx={15} ry={18} fill="#689F38" opacity=".8" />
        </g>
      ))}
    </svg>
  );
}

function YardBg({ isDark }) {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="ydsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? '#0A0A1A' : '#E3F2FD'} />
          <stop offset="50%" stopColor={isDark ? '#12122A' : '#BBDEFB'} />
          <stop offset="100%" stopColor={isDark ? '#1A1A3A' : '#90CAF9'} />
        </linearGradient>
        <linearGradient id="ydwall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? '#2C2C3E' : '#FAFAFA'} />
          <stop offset="100%" stopColor={isDark ? '#1E1E2E' : '#F0F0F0'} />
        </linearGradient>
        <linearGradient id="ydroof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? '#1A2535' : '#37474F'} />
          <stop offset="100%" stopColor={isDark ? '#0D1620' : '#263238'} />
        </linearGradient>
        <linearGradient id="ydgrass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? '#1A2E1A' : '#66BB6A'} />
          <stop offset="100%" stopColor={isDark ? '#0F1F0F' : '#388E3C'} />
        </linearGradient>
        <linearGradient id="ydpath" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? '#2A2A2A' : '#BDBDBD'} />
          <stop offset="100%" stopColor={isDark ? '#1A1A1A' : '#9E9E9E'} />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect width="1024" height="580" fill="url(#ydsky)" />
      {/* Stars (night) */}
      {isDark && Array.from({ length: 70 }, (_, i) => (
        <circle key={i} cx={rn(i * 7) * 1024} cy={rn(i * 13) * 300}
          r={0.4 + rn(i * 3) * 1.3} fill="white" opacity={0.3 + rn(i * 11) * 0.65} />
      ))}
      {/* Moon (night) */}
      {isDark && <><circle cx="860" cy="70" r="36" fill="#FFFDE7" opacity=".92" /><circle cx="874" cy="60" r="28" fill="#1A1A2E" opacity=".3" /></>}
      {/* Sun (day) */}
      {!isDark && <><circle cx="880" cy="72" r="46" fill="#FFF176" opacity=".9" /><circle cx="880" cy="72" r="62" fill="#FFF176" opacity=".18" /></>}
      {/* Clouds (day) */}
      {!isDark && [[150,55,70],[480,40,58],[740,62,76]].map(([cx, cy, sz], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={sz} ry={sz * 0.42} fill="white" opacity=".9" />
          <ellipse cx={cx - sz * 0.35} cy={cy + sz * 0.12} rx={sz * 0.6} ry={sz * 0.34} fill="white" opacity=".9" />
          <ellipse cx={cx + sz * 0.35} cy={cy + sz * 0.1} rx={sz * 0.52} ry={sz * 0.3} fill="white" opacity=".9" />
        </g>
      ))}
      {/* Background hedge / fence */}
      <rect x="0" y="340" width="1024" height="14" fill={isDark ? '#1A2E1A' : '#4CAF50'} opacity=".7" />
      {Array.from({ length: 28 }, (_, i) => (
        <rect key={i} x={i * 37} y={320} width={24} height={34} rx="12" fill={isDark ? '#1B3A1B' : '#43A047'} opacity=".85" />
      ))}
      {/* Side trees */}
      {[55, 145, 835, 935].map((x, i) => (
        <g key={i}>
          <rect x={x + 8} y={240} width={8} height={100} fill={isDark ? '#1A0E08' : '#5D4037'} />
          <ellipse cx={x + 12} cy={240} rx={28} ry={38} fill={isDark ? '#0D2210' : '#2E7D32'} />
          <ellipse cx={x + 12} cy={222} rx={20} ry={26} fill={isDark ? '#0F2912' : '#388E3C'} opacity=".9" />
        </g>
      ))}
      {/* Main house - center */}
      {/* Roof */}
      <polygon points="292,210 512,100 732,210" fill="url(#ydroof)" />
      <polygon points="292,210 512,100 732,210" fill={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.06)'} />
      {/* Chimney */}
      <rect x="600" y="120" width="28" height="72" fill={isDark ? '#1E2A3A' : '#455A64'} />
      {isDark && <ellipse cx="614" cy="120" rx="6" ry="4" fill="#FF6F00" opacity=".7" />}
      {/* Roof edge trim */}
      <line x1="290" y1="210" x2="734" y2="210" stroke={isDark ? '#2A3A4A' : '#37474F'} strokeWidth="5" />
      {/* House body */}
      <rect x="292" y="208" width="440" height="196" fill="url(#ydwall)" />
      {/* House shadow line */}
      <rect x="292" y="208" width="440" height="4" fill={isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.12)'} />
      {/* Windows - upper row */}
      {[340, 466, 592, 648].map((x, i) => (
        <g key={i}>
          <rect x={x} y={238} width={52} height={62} rx="4" fill={isDark ? '#1A2535' : '#B3E5FC'} />
          <rect x={x} y={238} width={52} height={62} rx="4" fill="none" stroke={isDark ? '#2A3A50' : '#90CAF9'} strokeWidth="2" />
          {/* Window cross */}
          <line x1={x + 26} y1={238} x2={x + 26} y2={300} stroke={isDark ? '#2A3A50' : '#90CAF9'} strokeWidth="1.5" />
          <line x1={x} y1={269} x2={x + 52} y2={269} stroke={isDark ? '#2A3A50' : '#90CAF9'} strokeWidth="1.5" />
          {/* Night light glow */}
          {isDark && <rect x={x} y={238} width={52} height={62} rx="4" fill="#FFF8DC" opacity={0.12 + rn(i * 7) * 0.2} />}
          {isDark && rn(i * 13) > 0.4 && <rect x={x + 2} y={240} width={48} height={58} rx="3" fill="#FFEDB0" opacity="0.18" />}
        </g>
      ))}
      {/* Door */}
      <rect x="476" y="318" width="72" height="86" rx="5" fill={isDark ? '#1A1A2A' : '#795548'} />
      <rect x="476" y="318" width="72" height="86" rx="5" fill="none" stroke={isDark ? '#2A2A3A' : '#5D4037'} strokeWidth="2" />
      <rect x="482" y="318" width="60" height="40" rx="4" fill={isDark ? '#1A2535' : '#B3E5FC'} opacity=".8" />
      <circle cx="540" cy="361" r="4" fill={isDark ? '#C4B5FD' : '#FFC107'} />
      {/* Door steps */}
      <rect x="466" y="400" width="92" height="8" rx="3" fill={isDark ? '#2A2A3A' : '#BDBDBD'} />
      <rect x="460" y="405" width="104" height="8" rx="3" fill={isDark ? '#222232' : '#9E9E9E'} />
      {/* Porch light */}
      <rect x="505" y="314" width="14" height="6" rx="3" fill={isDark ? '#FFEDB0' : '#FFF176'} />
      {isDark && <ellipse cx="512" cy="316" rx="22" ry="14" fill="#FFEDB0" opacity=".18" />}
      {/* Garden path */}
      <ellipse cx="512" cy="495" rx="65" ry="22" fill="url(#ydpath)" />
      <rect x="488" y="411" width="48" height="95" fill="url(#ydpath)" />
      {/* Path stones */}
      {[435, 455, 474, 494, 513].map((y, i) => (
        <ellipse key={i} cx={512 + (i % 2 === 0 ? 0 : 0)} cy={y} rx={20} ry={7} fill={isDark ? '#252535' : '#E0E0E0'} opacity=".7" />
      ))}
      {/* Flower beds left and right of path */}
      {[[350, 430], [370, 445], [330, 450]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={9} fill={['#FF80AB', '#FFD740', '#69F0AE'][i]} opacity=".9" />
          <rect x={x - 2} y={y + 8} width={4} height={14} fill={isDark ? '#1A3A1A' : '#4CAF50'} />
        </g>
      ))}
      {[[660, 432], [680, 448], [644, 452]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={9} fill={['#EA80FC', '#FFAB40', '#80D8FF'][i]} opacity=".9" />
          <rect x={x - 2} y={y + 8} width={4} height={14} fill={isDark ? '#1A3A1A' : '#4CAF50'} />
        </g>
      ))}
      {/* Grass */}
      <rect x="0" y="476" width="1024" height="104" fill="url(#ydgrass)" />
      <ellipse cx="512" cy="476" rx="700" ry="52" fill={isDark ? '#1A2E1A' : '#66BB6A'} />
      {/* Lamppost (night) */}
      {isDark && <>
        <rect x="248" y="370" width="6" height="108" fill="#37474F" />
        <ellipse cx="251" cy="370" rx="14" ry="6" fill="#37474F" />
        <rect x="244" y="360" width="14" height="12" rx="4" fill="#FFEDB0" />
        <ellipse cx="251" cy="370" rx="30" ry="18" fill="#FFEDB0" opacity=".14" />
        <rect x="762" y="370" width="6" height="108" fill="#37474F" />
        <ellipse cx="765" cy="370" rx="14" ry="6" fill="#37474F" />
        <rect x="758" y="360" width="14" height="12" rx="4" fill="#FFEDB0" />
        <ellipse cx="765" cy="370" rx="30" ry="18" fill="#FFEDB0" opacity=".14" />
      </>}
      {/* Mailbox */}
      <rect x="240" y="432" width="30" height="22" rx="4" fill={isDark ? '#1E2A3A' : '#1565C0'} />
      <rect x="240" y="430" width="30" height="7" rx="3" fill={isDark ? '#263545' : '#1976D2'} />
      <rect x="253" y="432" width="5" height="22" fill={isDark ? '#162030' : '#0D47A1'} opacity=".4" />
      <rect x="246" y="454" width="4" height="18" fill={isDark ? '#2A2A3A' : '#9E9E9E'} />
    </svg>
  );
}

function ThemeBg({ themeId, isDark }) {
  const map = {
    city: <CityBg isDark={isDark} />, nature: <NatureBg />, forest: <ForestBg />,
    spring: <SpringBg />, summer: <SummerBg />, autumn: <AutumnBg />, winter: <WinterBg />,
    space: <SpaceBg />, ocean: <OceanBg />, desert: <DesertBg isDark={isDark} />,
    fantasy: <FantasyBg />, sakura: <SakuraBg />, rain: <RainBg />, sunset: <SunsetBg />,
    yard: <YardBg isDark={isDark} />,
    mediter: <MediterraneanBg />,
  };
  return map[themeId] || <NatureBg />;
}

/* ── GLOBAL STYLES ── */
function Styles() {
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body, #root { width: 100%; height: 100%; overflow: hidden; }
      .qg { font-family: 'Nunito', system-ui, sans-serif; color: #1E1B4B; display: flex; flex-direction: column; height: 100vh; width: 100vw; background: #F5F3FF; overflow: hidden; }
      input, button, textarea { font-family: 'Nunito', system-ui, sans-serif; }
      input::placeholder, textarea::placeholder { color: rgba(100,100,100,0.38); }
      input:focus, textarea:focus { outline: none; }
      button { cursor: pointer; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.2); border-radius: 2px; }
      @keyframes qgFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes qgSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      @keyframes qgPop { 0% { transform: scale(0.7); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
      @keyframes qgBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      @keyframes qgConfetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(var(--to)) rotate(540deg); opacity: 0; } }
      @keyframes qgFlash { 0%, 100% { opacity: 1; } 25%, 75% { opacity: 0.06; } 50% { opacity: 0.88; } }
      @keyframes qgCheck { 0% { transform: scale(0) rotate(-45deg); } 70% { transform: scale(1.3) rotate(5deg); } 100% { transform: scale(1) rotate(0); } }
      @keyframes qgSpin { to { transform: rotate(360deg); } }
      .qg-fu { animation: qgFadeUp 0.35s ease both; }
      .qg-pop { animation: qgPop 0.4s cubic-bezier(.34,1.56,.64,1) both; }
      .qg-bi { animation: qgBounce 2.5s ease-in-out infinite; }
      .qg-su { animation: qgSlideUp 0.32s cubic-bezier(.34,1.2,.64,1); }
    `;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

/* ── MODAL WRAPPER ── */
function ModalSheet({ children, onClose }) {
  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'rgba(10,5,30,.56)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="qg-su" style={{ background: 'white', borderRadius: '28px 28px 0 0', width: '100%', padding: '8px 24px 52px', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ width: 44, height: 5, background: BD, borderRadius: 999, margin: '14px auto 22px' }} />
        {children}
      </div>
    </div>
  );
}

function MBtns({ onCancel, onConfirm, lbl = '완료' }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
      <button onClick={onCancel} style={{ flex: 1, padding: 14, borderRadius: 14, border: `2px solid ${BD}`, background: 'none', fontSize: 15, fontWeight: 700, color: '#6B7280' }}>취소</button>
      <button onClick={onConfirm} style={{ flex: 2, padding: 14, borderRadius: 14, border: 'none', background: `linear-gradient(135deg,${P},${G})`, color: 'white', fontSize: 15, fontWeight: 800 }}>{lbl}</button>
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
      {children}
    </div>
  );
}

function FieldInput({ value, onChange, placeholder, type = 'text', mb = 14, rows }) {
  const style = { width: '100%', padding: '11px 13px', border: `2px solid ${BD}`, borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#1E1B4B', marginBottom: mb, background: '#F8F7FF' };
  const handlers = {
    onFocus: e => { e.target.style.border = `2px solid ${P}`; },
    onBlur: e => { e.target.style.border = `2px solid ${BD}`; },
  };
  if (rows) {
    return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...style, resize: 'none', lineHeight: 1.6 }} {...handlers} />;
  }
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type} style={style} {...handlers} />;
}

/* ── AUTH SCREEN ── */
function AuthScreen({ onAuth, accounts, onRegister }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [uname, setUname] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const providers = [
    { label: 'N', bg: '#03C75A', color: 'white', domain: '@naver.com' },
    { label: 'G', bg: 'white', color: '#555', border: '1px solid #ddd', domain: '@gmail.com' },
    { label: 'K', bg: '#FEE500', color: '#3C1E1E', domain: '@kakao.com' },
  ];

  const fillProvider = (domain) => {
    setErr('');
    setEmail(e => e.includes('@') ? e.split('@')[0] + domain : e + domain);
  };

  const submit = () => {
    setErr('');
    if (!email.trim()) { setErr('이메일을 입력해주세요.'); return; }
    if (!pw.trim()) { setErr('비밀번호를 입력해주세요.'); return; }
    if (tab === 'login') {
      const acct = accounts.find(a => a.email === email.trim());
      if (!acct) { setErr('등록되지 않은 이메일이에요. 가입하기 탭에서 회원가입을 해주세요.'); return; }
      if (acct.pw !== pw) { setErr('비밀번호가 올바르지 않아요.'); return; }
      onAuth({ name: acct.name, email: acct.email, nickname: acct.nickname || acct.name });
    } else {
      if (!uname.trim()) { setErr('사용자 이름을 입력해주세요.'); return; }
      if (accounts.find(a => a.email === email.trim())) { setErr('이미 가입된 이메일이에요. 로그인 탭에서 로그인해주세요.'); return; }
      const newAcct = { email: email.trim(), name: uname.trim(), nickname: uname.trim(), pw, avatar: null };
      onRegister(newAcct);
      onAuth({ name: uname.trim(), email: email.trim(), nickname: uname.trim() });
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse 130% 82% at 50% -8%,${PL} 0%,#F5F3FF 60%)`, position: 'relative', overflow: 'hidden', padding: '2rem 1.5rem' }}>
      {['🌸','🌿','⭐','🍄'].map((e, i) => (
        <div key={i} style={{ position: 'absolute', fontSize: 80, opacity: 0.055, userSelect: 'none', pointerEvents: 'none', top: i === 2 ? '18%' : i < 2 ? 'auto' : 'auto', bottom: i === 0 ? '10%' : i === 1 ? '30%' : 'auto', left: i % 2 === 1 ? '-2%' : 'auto', right: i % 2 === 0 && i > 1 ? '-2%' : i === 0 ? '-2%' : 'auto' }}>{e}</div>
      ))}
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="qg-fu" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="qg-bi" style={{ fontSize: 66, marginBottom: 8 }}>🌱</div>
          <div style={{ fontWeight: 900, fontSize: 28, background: `linear-gradient(135deg,${PD},${GD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>Quest Garden</div>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 5, fontWeight: 600 }}>퀘스트를 완료하고 나만의 정원을 꾸며요</p>
        </div>
        <div className="qg-fu" style={{ background: 'white', borderRadius: 24, padding: 26, boxShadow: '0 8px 40px rgba(124,58,237,.13)', border: `1px solid ${BD}`, animationDelay: '.1s' }}>
          <div style={{ display: 'flex', background: PP, borderRadius: 13, padding: 4, marginBottom: 22 }}>
            {[['login','로그인'],['signup','가입하기']].map(([t, lbl]) => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: tab === t ? 'white' : 'transparent', color: tab === t ? P : '#9CA3AF', fontWeight: 800, fontSize: 14, boxShadow: tab === t ? '0 2px 8px rgba(124,58,237,.12)' : 'none', transition: 'all .2s' }}>{lbl}</button>
            ))}
          </div>
          {/* Provider buttons */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#9CA3AF', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>이메일 빠른 선택</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {providers.map(pr => (
                <button key={pr.label} onClick={() => fillProvider(pr.domain)}
                  style={{ flex: 1, padding: '10px', borderRadius: 11, border: pr.border || 'none', background: pr.bg, color: pr.color, fontWeight: 900, fontSize: 16, transition: 'opacity .15s' }}
                  onMouseDown={e => { e.currentTarget.style.opacity = '.8'; }}
                  onMouseUp={e => { e.currentTarget.style.opacity = '1'; }}>
                  {pr.label}
                </button>
              ))}
            </div>
          </div>
          {/* Email */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>✉️</span>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일 주소" type="email"
              style={{ width: '100%', padding: '12px 13px 12px 40px', border: `2px solid ${BD}`, borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#1E1B4B', background: '#F8F7FF' }}
              onFocus={e => { e.target.style.border = `2px solid ${P}`; }} onBlur={e => { e.target.style.border = `2px solid ${BD}`; }} />
          </div>
          {/* Name (signup only) */}
          {tab === 'signup' && (
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>👤</span>
              <input value={uname} onChange={e => setUname(e.target.value)} placeholder="사용자 이름"
                style={{ width: '100%', padding: '12px 13px 12px 40px', border: `2px solid ${BD}`, borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#1E1B4B', background: '#F8F7FF' }}
                onFocus={e => { e.target.style.border = `2px solid ${P}`; }} onBlur={e => { e.target.style.border = `2px solid ${BD}`; }} />
            </div>
          )}
          {/* Password */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔑</span>
            <input value={pw} onChange={e => setPw(e.target.value)} placeholder="비밀번호" type="password"
              onKeyDown={e => e.key === 'Enter' && submit()}
              style={{ width: '100%', padding: '12px 13px 12px 40px', border: `2px solid ${BD}`, borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#1E1B4B', background: '#F8F7FF' }}
              onFocus={e => { e.target.style.border = `2px solid ${P}`; }} onBlur={e => { e.target.style.border = `2px solid ${BD}`; }} />
          </div>
          {err && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#DC2626', fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>{err}</div>}
          <button onClick={submit} style={{ width: '100%', padding: 14, border: 'none', borderRadius: 12, background: `linear-gradient(135deg,${P},${G})`, color: 'white', fontSize: 15, fontWeight: 800, letterSpacing: '0.02em', cursor: 'pointer' }}
            onMouseDown={e => { e.currentTarget.style.opacity = '.8'; }} onMouseUp={e => { e.currentTarget.style.opacity = '1'; }}>
            {tab === 'login' ? '로그인하기 →' : '가입하기 →'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── CREATE PAGE MODAL ── */
function CreatePageModal({ onConfirm, onCancel, isProUser, onNeedPro, onOpenAIChat }) {
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('city');
  const [isDark, setIsDark] = useState(false);
  const [proMode, setProMode] = useState(false);
  const [proDesc, setProDesc] = useState('');
  const [generating, setGenerating] = useState(false);
  const th = THEMES[theme];

  const handlePro = async () => {
    if (!title.trim() || !proDesc.trim()) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1800));
    const det = matchTheme(proDesc + ' ' + title);
    const nd = proDesc.includes('밤') || proDesc.includes('어두') || proDesc.includes('night') || proDesc.includes('야경');
    setGenerating(false);
    onConfirm({ title: title.trim(), theme: det, isDark: nd, elements: [] });
  };

  return (
    <ModalSheet onClose={onCancel}>
      <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 3 }}>새 정원 만들기 🌱</div>
      <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 600, marginBottom: 18 }}>나만의 공간을 꾸며보세요</div>
      <FieldLabel>페이지 제목</FieldLabel>
      <FieldInput value={title} onChange={setTitle} placeholder="예: 나의 도시 정원" />
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <button onClick={() => setProMode(false)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: `2px solid ${!proMode ? P : BD}`, background: !proMode ? PL : '#F8F7FF', color: !proMode ? PD : '#6B7280', fontWeight: 800, fontSize: 13 }}>🎨 직접 선택</button>
        <button
          onClick={() => {
            if (!isProUser) { onNeedPro(); return; }
            onOpenAIChat();
          }}
          style={{ flex: 1, padding: '10px', borderRadius: 12, border: `2px solid ${proMode ? P : BD}`, background: proMode ? PL : '#F8F7FF', color: proMode ? PD : '#6B7280', fontWeight: 800, fontSize: 13, position: 'relative' }}>
          ✨ AI로 만들기
          <span style={{ position: 'absolute', top: -8, right: -8, background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: 'white', fontSize: 9, fontWeight: 900, padding: '2px 6px', borderRadius: 6 }}>PRO</span>
        </button>
      </div>
      {!proMode && (
        <>
          <FieldLabel>테마 선택</FieldLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 16 }}>
            {Object.entries(THEMES).map(([k, v]) => (
              <button key={k} onClick={() => setTheme(k)} style={{ border: `2px solid ${theme === k ? P : BD}`, borderRadius: 11, padding: '7px 3px', background: theme === k ? PL : '#F8F7FF', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'all .15s' }}>
                <span style={{ fontSize: 17 }}>{v.e}</span>
                <span style={{ fontSize: 9, fontWeight: 800, color: theme === k ? PD : '#9CA3AF', textAlign: 'center', lineHeight: 1.2 }}>{v.n}</span>
              </button>
            ))}
          </div>
          {th && th.hasDN && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: PL, borderRadius: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: PD, flex: 1 }}>시간대</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['☀️','낮',false],['🌙','밤',true]].map(([em, lbl, v]) => (
                  <button key={lbl} onClick={() => setIsDark(v)} style={{ padding: '7px 14px', borderRadius: 10, border: `2px solid ${isDark === v ? P : BD}`, background: isDark === v ? P : 'white', color: isDark === v ? 'white' : '#6B7280', fontWeight: 700, fontSize: 13 }}>{em} {lbl}</button>
                ))}
              </div>
            </div>
          )}
          {/* Preview */}
          <div style={{ borderRadius: 14, overflow: 'hidden', height: 130, position: 'relative', marginBottom: 18 }}>
            <ThemeBg themeId={theme} isDark={isDark} />
            <div style={{ position: 'absolute', bottom: 8, left: 10, background: 'rgba(0,0,0,.35)', borderRadius: 8, padding: '4px 10px', color: 'white', fontSize: 13, fontWeight: 700, backdropFilter: 'blur(4px)' }}>
              {th && th.e} {title || (th && th.n)} 미리보기
            </div>
          </div>
        </>
      )}
      {proMode && (
        <>
          <FieldLabel>어떤 정원을 만들고 싶나요?</FieldLabel>
          <FieldInput value={proDesc} onChange={setProDesc} placeholder="예: 조용한 밤 도시, 네온사인이 빛나는 골목... 원하는 분위기를 자유롭게 써주세요" rows={4} mb={12} />
          <div style={{ background: '#FEF9C3', border: '1px solid #FDE047', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#713F12', marginBottom: 16 }}>
            ⚠️ AI는 배경 테마와 시간대만 자동으로 맞춰요. 세부 요소는 직접 추가할 수 있어요.
          </div>
          {generating && (
            <div style={{ textAlign: 'center', padding: '18px 0', color: P, fontWeight: 700 }}>
              <div style={{ width: 26, height: 26, border: `3px solid ${P}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'qgSpin .7s linear infinite', margin: '0 auto 10px' }} />
              AI가 정원을 구상 중이에요...
            </div>
          )}
        </>
      )}
      {!generating && (
        <MBtns onCancel={onCancel} onConfirm={proMode ? handlePro : () => { if (title.trim()) onConfirm({ title: title.trim(), theme, isDark, elements: [] }); }} lbl={proMode ? '✨ AI로 생성' : '완료'} />
      )}
    </ModalSheet>
  );
}

/* ── CREATE QUEST MODAL ── */
function CreateQuestModal({ onConfirm, onCancel, isProUser }) {
  const [todos, setTodos] = useState(['']);
  const [rewards, setRewards] = useState([rndRewardFull()]);
  const [editIdx, setEditIdx] = useState(null);
  const [catFil, setCatFil] = useState(null);

  const add = () => {
    if (todos.length >= 10) return;
    setTodos([...todos, '']);
    setRewards([...rewards, rndRewardFull()]);
  };
  const del = (i) => {
    if (todos.length === 1) return;
    setTodos(todos.filter((_, j) => j !== i));
    setRewards(rewards.filter((_, j) => j !== i));
  };
  const confirm = () => {
    const pairs = todos.map((t, i) => ({ t: t.trim(), r: rewards[i] })).filter(p => p.t);
    if (!pairs.length) return;
    if (isProUser) {
      onConfirm(pairs.map(p => ({ id: uid(), title: p.t, rewardId: p.r.id, rewardCat: p.r.catKey, completed: false, date: today() })));
    } else {
      onConfirm(pairs.map(p => ({ id: uid(), title: p.t, rewardId: null, rewardCat: null, completed: false, date: today() })));
    }
  };

  const allIt = getAllItems();
  const filtered = catFil ? allIt.filter(it => it.catKey === catFil) : allIt;

  return (
    <ModalSheet onClose={onCancel}>
      <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 3 }}>오늘의 할일 ⚔️</div>
      <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 600, marginBottom: 18 }}>
        {isProUser ? '완료하면 정원 요소를 획득해요! (최대 10개)' : '오늘 할일을 입력하세요 (최대 10개)'}
      </div>
      {todos.map((t, i) => (
        <div key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: PM, flexShrink: 0 }}>{i + 1}</div>
            <input value={t} onChange={e => setTodos(todos.map((x, j) => j === i ? e.target.value : x))} placeholder={`할일 ${i + 1}`}
              style={{ flex: 1, padding: '9px 11px', border: `2px solid ${BD}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#1E1B4B' }}
              onFocus={e => { e.target.style.border = `2px solid ${P}`; }} onBlur={e => { e.target.style.border = `2px solid ${BD}`; }} />
            {isProUser && (
              <button onClick={() => setEditIdx(editIdx === i ? null : i)} style={{ background: 'none', border: 'none', fontSize: 19, padding: 4, borderRadius: 8 }}>{rewards[i] ? rewards[i].e : '🎁'}</button>
            )}
            {todos.length > 1 && <button onClick={() => del(i)} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 15, padding: 4 }}>✕</button>}
          </div>
          {isProUser && editIdx === i && (
            <div style={{ background: PL, borderRadius: 13, padding: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 5, overflowX: 'auto', marginBottom: 10, paddingBottom: 3 }}>
                <button onClick={() => setCatFil(null)} style={{ flexShrink: 0, padding: '4px 9px', borderRadius: 20, border: `1.5px solid ${!catFil ? P : BD}`, background: !catFil ? P : 'white', color: !catFil ? 'white' : '#6B7280', fontSize: 11, fontWeight: 800 }}>전체</button>
                {Object.entries(RCATS).map(([k, v]) => (
                  <button key={k} onClick={() => setCatFil(catFil === k ? null : k)} style={{ flexShrink: 0, padding: '4px 9px', borderRadius: 20, border: `1.5px solid ${catFil === k ? v.c : BD}`, background: catFil === k ? v.c : 'white', color: catFil === k ? 'white' : v.c, fontSize: 11, fontWeight: 800 }}>{v.e} {v.n}</button>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {filtered.map(el => {
                  const sel = rewards[i] && rewards[i].id === el.id;
                  return (
                    <button key={el.id} onClick={() => { setRewards(rewards.map((r, j) => j === i ? el : r)); setEditIdx(null); }}
                      style={{ fontSize: 21, padding: 7, borderRadius: 9, border: `2px solid ${sel ? G : BD}`, background: sel ? GL : 'white' }} title={el.n}>
                      {el.e}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
      {todos.length < 10 && (
        <button onClick={add}
          style={{ width: '100%', padding: 10, border: `2px dashed ${BD}`, borderRadius: 11, background: 'none', color: '#9CA3AF', fontSize: 14, fontWeight: 700, marginBottom: 16 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.color = P; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = BD; e.currentTarget.style.color = '#9CA3AF'; }}>
          + 할일 추가 ({todos.length}/10)
        </button>
      )}
      <MBtns onCancel={onCancel} onConfirm={confirm} lbl="퀘스트 시작!" />
    </ModalSheet>
  );
}

/* ── EDIT REWARD MODAL ── */
function EditRewardModal({ quest, onSave, onCancel }) {
  const [sel, setSel] = useState(quest.rewardId);
  const [cat, setCat] = useState(null);
  const items = cat ? getAllItems().filter(it => it.catKey === cat) : getAllItems();
  return (
    <ModalSheet onClose={onCancel}>
      <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 3 }}>보상 요소 변경 ✏️</div>
      <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 600, marginBottom: 14 }}>'{quest.title}'의 보상을 선택하세요</div>
      <div style={{ display: 'flex', gap: 5, overflowX: 'auto', marginBottom: 12, paddingBottom: 3 }}>
        <button onClick={() => setCat(null)} style={{ flexShrink: 0, padding: '4px 9px', borderRadius: 20, border: `1.5px solid ${!cat ? P : BD}`, background: !cat ? P : 'white', color: !cat ? 'white' : '#6B7280', fontSize: 11, fontWeight: 800 }}>전체</button>
        {Object.entries(RCATS).map(([k, v]) => (
          <button key={k} onClick={() => setCat(cat === k ? null : k)} style={{ flexShrink: 0, padding: '4px 9px', borderRadius: 20, border: `1.5px solid ${cat === k ? v.c : BD}`, background: cat === k ? v.c : 'white', color: cat === k ? 'white' : v.c, fontSize: 11, fontWeight: 800 }}>{v.e} {v.n}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 22 }}>
        {items.map(el => (
          <button key={el.id} onClick={() => setSel(el.id)} style={{ fontSize: 21, padding: 7, borderRadius: 9, border: `2px solid ${sel === el.id ? G : BD}`, background: sel === el.id ? GL : '#F8F7FF' }} title={el.n}>{el.e}</button>
        ))}
      </div>
      <MBtns onCancel={onCancel} onConfirm={() => { const found = getAllItems().find(it => it.id === sel); onSave(sel, found ? found.catKey : null); }} />
    </ModalSheet>
  );
}

/* ── GARDEN DETAIL ── */
function GardenDetail({ page, owned, customCategories, onClose, onUpdate }) {
  const [edit, setEdit] = useState(false);
  const [els, setEls] = useState(page.elements || []);
  const [selId, setSelId] = useState(null);
  const [catFil, setCatFil] = useState(null);
  const [isDark, setIsDark] = useState(page.isDark || false);
  const [ctxMenu, setCtxMenu] = useState(null); // { id, x, y }
  const cvRef = useRef(null);
  const drg = useRef(null);
  const th = THEMES[page.theme] || THEMES.nature;

  const save = (newEls, newDark) => {
    onUpdate({ ...page, elements: newEls !== undefined ? newEls : els, isDark: newDark !== undefined ? newDark : isDark });
  };

  const addEl = (el) => {
    const c = cvRef.current, w = c ? c.offsetWidth : 900, h = c ? c.offsetHeight : 500;
    const ne = { id: uid(), emoji: el.e || el.emoji, name: el.n || el.name, catKey: el.catKey, x: 20 + Math.random() * (w - 100), y: 20 + Math.random() * (h - 100), size: 42 };
    const u = [...els, ne];
    setEls(u);
    save(u);
  };

  const onMD = (e, id) => {
    e.preventDefault(); e.stopPropagation(); setSelId(id); setCtxMenu(null);
    const el = els.find(x => x.id === id);
    drg.current = { id, ox: e.clientX - el.x, oy: e.clientY - el.y };
  };
  const onMM = (e) => {
    if (!drg.current) return;
    const { id, ox, oy } = drg.current;
    setEls(prev => prev.map(el => el.id === id ? { ...el, x: e.clientX - ox, y: e.clientY - oy } : el));
  };
  const onMU = () => { if (drg.current) { save(els); drg.current = null; } };
  const onTS = (e, id) => { const t = e.touches[0]; onMD({ clientX: t.clientX, clientY: t.clientY, preventDefault: () => e.preventDefault(), stopPropagation: () => {} }, id); };
  const onTM = (e) => { const t = e.touches[0]; onMM({ clientX: t.clientX, clientY: t.clientY }); };
  const rsz = (id, d) => { const u = els.map(el => el.id === id ? { ...el, size: Math.max(18, Math.min(120, el.size + d)) } : el); setEls(u); save(u); setCtxMenu(null); };
  const delEl = (id) => { const u = els.filter(el => el.id !== id); setEls(u); setSelId(null); setCtxMenu(null); save(u); };
  const toggleDark = () => { const nd = !isDark; setIsDark(nd); save(els, nd); };

  const onRightClick = (e, id) => {
    e.preventDefault(); e.stopPropagation();
    setCtxMenu({ id, x: e.clientX, y: e.clientY });
    setSelId(id);
  };

  const enriched = owned.map(el => {
    const cat = Object.entries(RCATS).find(([, v]) => v.items.find(it => it.id === el.id));
    return { ...el, catKey: cat ? cat[0] : null };
  });
  // Merge standard + custom categories for the panel
  const customCats = (customCategories || []);
  const filtOwned = catFil
    ? (catFil.startsWith('__custom__')
        ? (customCats.find(c => c.key === catFil.replace('__custom__',''))?.items || []).map(it => ({ ...it, emoji: it.e, name: it.n, catKey: catFil }))
        : enriched.filter(el => el.catKey === catFil))
    : [...enriched, ...customCats.flatMap(c => c.items.map(it => ({ ...it, emoji: it.e, name: it.n, catKey: '__custom__' + c.key })))];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 54, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: 'rgba(0,0,0,.28)', backdropFilter: 'blur(12px)', color: 'white', gap: 8 }}>
        <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(255,255,255,.2)', border: 'none', color: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <span style={{ fontWeight: 800, fontSize: 15, flex: 1, textAlign: 'center' }}>{th.e} {page.title}</span>
        {th.hasDN && <button onClick={toggleDark} style={{ padding: '5px 11px', borderRadius: 9, background: 'rgba(255,255,255,.18)', border: 'none', color: 'white', fontSize: 12, fontWeight: 700 }}>{isDark ? '🌙 밤' : '☀️ 낮'}</button>}
        <button onClick={() => { setEdit(!edit); setSelId(null); }} style={{ padding: '6px 13px', borderRadius: 10, background: edit ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.2)', border: 'none', color: edit ? PD : 'white', fontWeight: 700, fontSize: 13 }}>{edit ? '완료' : '✏️ 수정'}</button>
      </div>
      <div ref={cvRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', touchAction: 'none' }}
        onMouseMove={onMM} onMouseUp={onMU} onTouchMove={onTM} onTouchEnd={onMU}
        onClick={() => { setSelId(null); setCtxMenu(null); }}
        onContextMenu={e => e.preventDefault()}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <ThemeBg themeId={page.theme} isDark={isDark} />
        </div>
        {els.map(el => (
          <div key={el.id}
            style={{ position: 'absolute', left: el.x, top: el.y, fontSize: el.size, userSelect: 'none', cursor: 'grab', lineHeight: 1, touchAction: 'none', filter: selId === el.id ? 'drop-shadow(0 0 10px rgba(255,255,255,0.9))' : 'none', zIndex: selId === el.id ? 10 : 1 }}
            onMouseDown={e => onMD(e, el.id)}
            onTouchStart={e => onTS(e, el.id)}
            onContextMenu={e => onRightClick(e, el.id)}>
            {el.emoji}
          </div>
        ))}
        {els.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.72)', pointerEvents: 'none' }}>
            <span style={{ fontSize: 48 }}>🌱</span>
            <p style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>{edit ? '아래 요소를 탭해 추가하세요' : '수정 버튼을 눌러 꾸며보세요'}</p>
          </div>
        )}
        {/* Right-click context menu */}
        {ctxMenu && (
          <div style={{
            position: 'absolute',
            left: Math.min(ctxMenu.x - (cvRef.current?.getBoundingClientRect().left || 0), (cvRef.current?.offsetWidth || 400) - 160),
            top: Math.max(ctxMenu.y - (cvRef.current?.getBoundingClientRect().top || 0) - 10, 10),
            background: 'rgba(15,10,30,0.92)',
            backdropFilter: 'blur(12px)',
            borderRadius: 14, padding: '6px', zIndex: 100,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.12)',
            minWidth: 150,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '4px 10px 8px', fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>요소 편집</div>
            {[
              { icon: '🔍+', label: '크게', action: () => rsz(ctxMenu.id, 12) },
              { icon: '🔍−', label: '작게', action: () => rsz(ctxMenu.id, -12) },
              { icon: '🗑️', label: '삭제', action: () => delEl(ctxMenu.id), danger: true },
            ].map(item => (
              <button key={item.label} onClick={item.action} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', background: 'none', border: 'none',
                color: item.danger ? '#FF6B6B' : 'white',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', borderRadius: 9,
                textAlign: 'left', transition: 'background .12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = item.danger ? 'rgba(255,70,70,0.18)' : 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>{item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {edit && (
        <div style={{ flexShrink: 0, background: 'rgba(10,5,36,.82)', backdropFilter: 'blur(16px)', padding: '11px 16px 18px' }}>
          <div style={{ display: 'flex', gap: 5, overflowX: 'auto', marginBottom: 10, paddingBottom: 3 }}>
            <button onClick={() => setCatFil(null)} style={{ flexShrink: 0, padding: '4px 9px', borderRadius: 20, border: `1.5px solid ${!catFil ? 'white' : BD}`, background: !catFil ? 'white' : 'rgba(255,255,255,.1)', color: !catFil ? PD : 'rgba(255,255,255,.7)', fontSize: 11, fontWeight: 800 }}>전체</button>
            {Object.entries(RCATS).map(([k, v]) => (
              <button key={k} onClick={() => setCatFil(catFil === k ? null : k)} style={{ flexShrink: 0, padding: '4px 9px', borderRadius: 20, border: `1.5px solid ${catFil === k ? v.c : 'rgba(255,255,255,.2)'}`, background: catFil === k ? v.c : 'rgba(255,255,255,.08)', color: catFil === k ? 'white' : 'rgba(255,255,255,.65)', fontSize: 11, fontWeight: 800 }}>{v.e} {v.n}</button>
            ))}
            {customCats.map(c => {
              const key = '__custom__' + c.key;
              return (
                <button key={c.key} onClick={() => setCatFil(catFil === key ? null : key)} style={{ flexShrink: 0, padding: '4px 9px', borderRadius: 20, border: `1.5px solid ${catFil === key ? P : 'rgba(255,255,255,.2)'}`, background: catFil === key ? P : 'rgba(124,58,237,.18)', color: 'white', fontSize: 11, fontWeight: 800 }}>✨ {c.name}</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
            {filtOwned.length === 0
              ? <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>퀘스트를 완료하면 요소를 얻을 수 있어요</p>
              : filtOwned.map((el, i) => (
                <button key={i} onClick={() => addEl(el)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.15)', borderRadius: 13, padding: '9px 11px', flexShrink: 0 }}>
                  <span style={{ fontSize: 24 }}>{el.emoji}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,.65)', fontWeight: 700 }}>{el.name}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── TIMER SCREEN ── */
function TimerScreen({ quest, silentMode, isProUser, onComplete, onBack }) {
  const [phase, setPhase] = useState('input');
  const [mins, setMins] = useState('');
  const [secs, setSecs] = useState('');
  const [total, setTotal] = useState(0);
  const [rem, setRem] = useState(0);
  const [addM, setAddM] = useState('');
  const [addS, setAddS] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [isFlash, setIsFlash] = useState(false);
  const iv = useRef(null);

  const startCD = (s) => {
    clearInterval(iv.current);
    iv.current = setInterval(() => {
      setRem(r => {
        if (r <= 1) {
          clearInterval(iv.current);
          setPhase('done');
          if (silentMode) beep();
          else { setIsFlash(true); setTimeout(() => setIsFlash(false), 3200); }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const start = () => {
    const m = parseInt(mins) || 0, s = parseInt(secs) || 0, tot = m * 60 + s;
    if (tot <= 0) return;
    setTotal(tot); setRem(tot); setPhase('running'); startCD(tot);
  };

  const addTime = () => {
    const m = parseInt(addM) || 0, s = parseInt(addS) || 0, ex = m * 60 + s;
    if (ex <= 0) return;
    setTotal(t => t + ex);
    const nr = rem + ex;
    setRem(nr); setPhase('running'); startCD(nr);
    setShowAdd(false); setAddM(''); setAddS('');
  };

  useEffect(() => () => clearInterval(iv.current), []);

  const mm = String(Math.floor(rem / 60)).padStart(2, '0');
  const ss = String(rem % 60).padStart(2, '0');
  const prog = total > 0 ? (1 - rem / total) : 0;
  const R = 54, circ = 2 * Math.PI * R;
  const el = getAllItems().find(it => it.id === quest.rewardId);

  const numIn = (val, set, ph, max) => (
    <input type="number" min="0" max={max} placeholder={ph} value={val} onChange={e => set(e.target.value)}
      style={{ background: 'rgba(255,255,255,.15)', border: '2px solid rgba(255,255,255,.25)', borderRadius: 13, padding: '12px 0', fontFamily: 'monospace', fontSize: 26, fontWeight: 700, color: 'white', textAlign: 'center', width: 76 }}
      onFocus={e => { e.target.style.border = '2px solid rgba(255,255,255,.72)'; }}
      onBlur={e => { e.target.style.border = '2px solid rgba(255,255,255,.25)'; }} />
  );

  const tb = (label, fn, primary) => (
    <button onClick={fn} style={{ flex: 1, padding: 14, borderRadius: 13, border: primary ? 'none' : '2px solid rgba(255,255,255,.2)', background: primary ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.12)', color: primary ? PD : 'white', fontSize: 15, fontWeight: 800 }}>{label}</button>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: isFlash ? 'rgba(255,238,50,.94)' : 'linear-gradient(160deg,#2D1B69 0%,#0D4F3C 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 28px', color: 'white', animation: isFlash ? 'qgFlash .65s ease 4' : undefined }}>
      <p style={{ fontSize: 15, fontWeight: 700, opacity: 0.75, marginBottom: 6 }}>⚔️ {quest.title}</p>

      {phase === 'input' && (
        <>
          <div style={{ fontFamily: 'monospace', fontSize: 72, fontWeight: 700, letterSpacing: 3, margin: '14px 0', lineHeight: 1 }}>00:00</div>
          <p style={{ fontSize: 14, opacity: 0.65, fontWeight: 600, marginBottom: 18 }}>공부할 시간을 입력하세요</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            {numIn(mins, setMins, '25', 180)}
            <span style={{ fontSize: 19, opacity: 0.7 }}>분</span>
            {numIn(secs, setSecs, '00', 59)}
            <span style={{ fontSize: 19, opacity: 0.7 }}>초</span>
          </div>
          <button onClick={start} style={{ padding: '13px 46px', borderRadius: 15, border: '2px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.18)', color: 'white', fontSize: 16, fontWeight: 800 }}>시작하기 ▶</button>
          <button onClick={onBack} style={{ marginTop: 14, background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 14, fontWeight: 700 }}>← 돌아가기</button>
        </>
      )}

      {(phase === 'running' || phase === 'paused') && (
        <>
          <svg width="132" height="132" style={{ transform: 'rotate(-90deg)', marginBottom: 6 }}>
            <defs>
              <linearGradient id="rg3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#A78BFA" /><stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>
            <circle cx="66" cy="66" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="8" />
            <circle cx="66" cy="66" r={R} fill="none" stroke="url(#rg3)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={circ * prog} style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div style={{ fontFamily: 'monospace', fontSize: 70, fontWeight: 700, letterSpacing: 3, margin: '6px 0 20px', lineHeight: 1 }}>{mm}:{ss}</div>
          <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 310 }}>
            {phase === 'running'
              ? tb('⏸ 일시정지', () => { clearInterval(iv.current); setPhase('paused'); }, false)
              : tb('▶ 재개', () => { setPhase('running'); startCD(rem); }, false)
            }
            {tb('끝내기', () => { clearInterval(iv.current); setPhase('done'); setRem(0); }, true)}
          </div>
        </>
      )}

      {phase === 'done' && (
        <>
          <div className="qg-pop" style={{ fontSize: 54, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>완료!</div>
          <p style={{ fontSize: 14, opacity: 0.72, fontWeight: 600, marginBottom: 22, textAlign: 'center' }}>{quest.title} 퀘스트가 끝났어요</p>
          {/* Pro: reward confirm box / Non-pro: just done button */}
          {isProUser ? (
            <>
              <div style={{ background: 'rgba(255,255,255,.13)', borderRadius: 20, padding: '18px 28px', marginBottom: 22, textAlign: 'center', border: '2px solid rgba(255,255,255,.22)', width: '100%', maxWidth: 320 }}>
                <p style={{ fontSize: 13, opacity: 0.72, fontWeight: 700, marginBottom: 10 }}>보상을 획득하시겠습니까?</p>
                <div style={{ fontSize: 46, marginBottom: 6 }}>{el ? el.e : '🎁'}</div>
                <p style={{ fontWeight: 900, fontSize: 16 }}>{el ? el.n : '보상 요소'}</p>
              </div>
              <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 310, marginBottom: 14 }}>
                {tb('건너뛰기', () => onBack(), false)}
                {tb('획득하기 🎁', () => onComplete(Math.max(0, Math.floor(total / 60))), true)}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 310, marginBottom: 14 }}>
              {tb('완료! ✓', () => onComplete(Math.max(0, Math.floor(total / 60))), true)}
            </div>
          )}
          <button onClick={() => setShowAdd(s => !s)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ 시간 더 추가하기</button>
          {showAdd && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {numIn(addM, setAddM, '10', 180)}
                <span style={{ fontSize: 19, opacity: 0.7 }}>분</span>
                {numIn(addS, setAddS, '00', 59)}
                <span style={{ fontSize: 19, opacity: 0.7 }}>초</span>
              </div>
              <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 310 }}>
                {tb('취소', () => setShowAdd(false), false)}
                {tb('추가', addTime, true)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   STATS SCREEN (홈 탭 – 모든 사용자)
══════════════════════════════════════════ */
function StatsScreen({ quests }) {
  const [view, setView] = useState('month');
  const [selectedDay, setSelectedDay] = useState(null);   // {label, quests[]}
  const [browseYr, setBrowseYr] = useState(new Date().getFullYear());
  const [browseMo, setBrowseMo] = useState(new Date().getMonth());

  const now = new Date();
  const yr = browseYr;
  const mo = browseMo;
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const moNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const fmtMin = m => m >= 60 ? `${Math.floor(m/60)}시간 ${m%60}분` : `${m}분`;

  const parseDate = d => {
    if (!d) return new Date(0);
    const p = new Date(d);
    return isNaN(p.getTime()) ? new Date(0) : p;
  };

  // All completed quests (no pruning — permanent storage)
  const allCompleted = quests.filter(q => q.completed);

  // Monthly
  const moCompleted = allCompleted.filter(q => {
    const d = parseDate(q.date);
    return d.getFullYear() === yr && d.getMonth() === mo;
  });
  const dayCounts = {}, dayMins = {}, dayQuests = {};
  moCompleted.forEach(q => {
    const day = parseDate(q.date).getDate();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
    dayMins[day] = (dayMins[day] || 0) + (q.studyMinutes || 0);
    if (!dayQuests[day]) dayQuests[day] = [];
    dayQuests[day].push(q);
  });

  // Yearly
  const yrCompleted = allCompleted.filter(q => parseDate(q.date).getFullYear() === yr);
  const moCounts = Array(12).fill(0), moMins = Array(12).fill(0), moQuestMap = {};
  yrCompleted.forEach(q => {
    const m = parseDate(q.date).getMonth();
    moCounts[m]++; moMins[m] += (q.studyMinutes || 0);
    if (!moQuestMap[m]) moQuestMap[m] = [];
    moQuestMap[m].push(q);
  });

  const totalMoQ = moCompleted.length;
  const totalMoMin = moCompleted.reduce((s, q) => s + (q.studyMinutes || 0), 0);
  const totalYrQ = yrCompleted.length;
  const totalYrMin = yrCompleted.reduce((s, q) => s + (q.studyMinutes || 0), 0);

  // Clickable BarChart
  function BarChart({ data, labels, onBarClick, height = 110 }) {
    const max = Math.max(...data, 1);
    const n = data.length;
    const w = 560, pad = 3;
    const bw = Math.max(5, (w - pad * (n + 1)) / n);
    const isNowIdx = view === 'month'
      ? (yr === now.getFullYear() && mo === now.getMonth() ? now.getDate() - 1 : -1)
      : (yr === now.getFullYear() ? now.getMonth() : -1);
    return (
      <svg viewBox={`0 0 ${w} ${height + 28}`} width="100%" style={{ display: 'block', cursor: 'pointer' }}>
        {data.map((v, i) => {
          const bh = v > 0 ? Math.max(8, (v / max) * (height - 10)) : 3;
          const x = pad + i * (bw + pad);
          const y = height - bh;
          const isNow = i === isNowIdx;
          const hasSel = selectedDay && (
            view === 'month'
              ? selectedDay.key === `d-${yr}-${mo}-${i + 1}`
              : selectedDay.key === `m-${yr}-${i}`
          );
          return (
            <g key={i} style={{ cursor: v > 0 ? 'pointer' : 'default' }}
              onClick={() => {
                if (v === 0) return;
                if (view === 'month') {
                  const day = i + 1;
                  setSelectedDay({
                    key: `d-${yr}-${mo}-${day}`,
                    label: `${yr}년 ${moNames[mo]} ${day}일`,
                    quests: dayQuests[day] || [],
                    minutes: dayMins[day] || 0,
                  });
                } else {
                  setSelectedDay({
                    key: `m-${yr}-${i}`,
                    label: `${yr}년 ${moNames[i]}`,
                    quests: moQuestMap[i] || [],
                    minutes: moMins[i] || 0,
                  });
                }
              }}>
              {/* hover bg */}
              {v > 0 && <rect x={x - 1} y={0} width={bw + 2} height={height + 24} rx="4" fill="transparent" onMouseEnter={e => e.currentTarget.setAttribute('fill', 'rgba(124,58,237,0.05)')} onMouseLeave={e => e.currentTarget.setAttribute('fill', 'transparent')} />}
              <rect x={x} y={y} width={bw} height={bh} rx="3"
                fill={hasSel ? P : v > 0 ? (isNow ? P : PL) : '#F3F4F6'}
                stroke={hasSel ? PD : isNow && !hasSel ? P : 'none'}
                strokeWidth="1.5" />
              {v > 0 && bh > 18 && (
                <text x={x + bw / 2} y={y + bh / 2 + 4} textAnchor="middle" fontSize="8"
                  fill={hasSel || isNow ? 'white' : '#9CA3AF'} fontFamily="Nunito,sans-serif" fontWeight="800">{v}</text>
              )}
              {labels && labels[i] && (
                <text x={x + bw / 2} y={height + 18} textAnchor="middle" fontSize="8.5"
                  fill={hasSel ? P : isNow ? P : '#9CA3AF'} fontFamily="Nunito,sans-serif"
                  fontWeight={hasSel || isNow ? '800' : '400'}>{labels[i]}</text>
              )}
            </g>
          );
        })}
      </svg>
    );
  }

  const statCard = (icon, label, value) => (
    <div style={{ flex: 1, background: 'white', borderRadius: 16, padding: '14px 12px', border: `1.5px solid ${BD}`, textAlign: 'center' }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: P, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{label}</div>
    </div>
  );

  // Month navigation
  const prevMo = () => {
    if (mo === 0) { setBrowseYr(y => y - 1); setBrowseMo(11); }
    else setBrowseMo(m => m - 1);
    setSelectedDay(null);
  };
  const nextMo = () => {
    const maxMo = yr === now.getFullYear() ? now.getMonth() : 11;
    if (mo >= maxMo && yr >= now.getFullYear()) return;
    if (mo === 11) { setBrowseYr(y => y + 1); setBrowseMo(0); }
    else setBrowseMo(m => m + 1);
    setSelectedDay(null);
  };
  const prevYr = () => { setBrowseYr(y => y - 1); setSelectedDay(null); };
  const nextYr = () => { if (yr < now.getFullYear()) { setBrowseYr(y => y + 1); setSelectedDay(null); } };
  const canNextMo = !(mo >= now.getMonth() && yr >= now.getFullYear());
  const canNextYr = yr < now.getFullYear();

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 90px' }}>
      {/* View toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, background: PP, borderRadius: 12, padding: 3 }}>
        {[['month', '월간'], ['year', '연간']].map(([v, l]) => (
          <button key={v} onClick={() => { setView(v); setSelectedDay(null); }}
            style={{ flex: 1, padding: '8px', borderRadius: 9, border: 'none', background: view === v ? 'white' : 'transparent', color: view === v ? P : '#9CA3AF', fontWeight: 800, fontSize: 13, boxShadow: view === v ? '0 2px 6px rgba(124,58,237,.1)' : 'none', transition: 'all .2s', cursor: 'pointer' }}>{l}</button>
        ))}
      </div>

      {/* Period navigator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
        <button onClick={view === 'month' ? prevMo : prevYr}
          style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${BD}`, background: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>‹</button>
        <span style={{ fontWeight: 900, fontSize: 15, color: '#1E1B4B', minWidth: 110, textAlign: 'center' }}>
          {view === 'month' ? `${yr}년 ${moNames[mo]}` : `${yr}년`}
        </span>
        <button onClick={view === 'month' ? nextMo : nextYr}
          style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${BD}`, background: 'white', fontSize: 16, cursor: (view === 'month' ? canNextMo : canNextYr) ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: (view === 'month' ? canNextMo : canNextYr) ? '#6B7280' : '#D1D5DB' }}>›</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {view === 'month'
          ? <>{statCard('✅', '퀘스트 완료', totalMoQ + '개')}{statCard('⏱', '총 공부 시간', fmtMin(totalMoMin))}{statCard('📅', '완료한 날', Object.keys(dayCounts).length + '일')}</>
          : <>{statCard('✅', '올해 완료', totalYrQ + '개')}{statCard('⏱', '올해 공부', fmtMin(totalYrMin))}{statCard('🔥', '활동 월수', moCounts.filter(c => c > 0).length + '개월')}</>
        }
      </div>

      {/* Quest chart */}
      <div style={{ background: 'white', borderRadius: 18, padding: '16px 14px', border: `1.5px solid ${BD}`, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1E1B4B', marginBottom: 4 }}>
          📊 {view === 'month' ? `${yr}년 ${moNames[mo]} 퀘스트 완료` : `${yr}년 월별 퀘스트 완료`}
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 10 }}>막대를 클릭하면 완료한 할일 목록을 볼 수 있어요</div>
        {view === 'month'
          ? <BarChart data={Array.from({ length: daysInMonth }, (_, i) => dayCounts[i + 1] || 0)} labels={Array.from({ length: daysInMonth }, (_, i) => i + 1)} />
          : <BarChart data={moCounts} labels={moNames} />
        }
      </div>

      {/* Study time chart */}
      <div style={{ background: 'white', borderRadius: 18, padding: '16px 14px', border: `1.5px solid ${BD}`, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1E1B4B', marginBottom: 10 }}>
          ⏱ {view === 'month' ? '일별 공부 시간 (분)' : '월별 공부 시간 (분)'}
        </div>
        {view === 'month'
          ? <BarChart data={Array.from({ length: daysInMonth }, (_, i) => dayMins[i + 1] || 0)} labels={Array.from({ length: daysInMonth }, (_, i) => i + 1)} />
          : <BarChart data={moMins} labels={moNames} />
        }
      </div>

      {/* Clicked day detail panel */}
      {selectedDay && (
        <div style={{ background: 'white', borderRadius: 18, border: `2px solid ${P}`, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ background: `linear-gradient(135deg,${PL},${GL})`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 14, color: PD }}>{selectedDay.label}</div>
              <div style={{ fontSize: 12, color: PM, fontWeight: 600, marginTop: 2 }}>
                완료 {selectedDay.quests.length}개 · {fmtMin(selectedDay.minutes)}
              </div>
            </div>
            <button onClick={() => setSelectedDay(null)}
              style={{ background: 'rgba(124,58,237,.15)', border: 'none', borderRadius: 8, width: 28, height: 28, fontSize: 14, color: PD, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          <div style={{ padding: '10px 16px 14px' }}>
            {selectedDay.quests.length === 0
              ? <div style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600, textAlign: 'center', padding: '12px 0' }}>완료된 퀘스트가 없어요</div>
              : selectedDay.quests.map((q, i) => (
                <div key={q.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < selectedDay.quests.length - 1 ? `1px solid ${BD}` : 'none' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, flexShrink: 0 }}>✓</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1E1B4B' }}>{q.title}</div>
                    {q.studyMinutes > 0 && <div style={{ fontSize: 11, color: GD, fontWeight: 600, marginTop: 1 }}>⏱ {fmtMin(q.studyMinutes)}</div>}
                  </div>
                  {q.rewardId && <span style={{ fontSize: 18 }}>{(() => { const el = (() => { try { return Object.values(typeof RCATS !== 'undefined' ? RCATS : {}).flatMap(v => v.items).find(it => it.id === q.rewardId); } catch { return null; } })(); return el ? el.e : ''; })()}</span>}
                </div>
              ))
            }
          </div>
        </div>
      )}

      {totalMoQ === 0 && view === 'month' && !selectedDay && (
        <div style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF', fontSize: 13, fontWeight: 600 }}>
          {yr === now.getFullYear() && mo === now.getMonth()
            ? '아직 완료한 퀘스트가 없어요.\n퀘스트 탭에서 오늘의 할일을 시작해보세요! ⚔️'
            : `${yr}년 ${moNames[mo]}에는 완료된 퀘스트가 없어요.`}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   GARDEN SCREEN (정원 탭)
══════════════════════════════════════════ */
function GardenScreen({ isProUser, pages, owned, customCategories, onNewPage, onOpenPage, onShowProUpgrade }) {
  if (!isProUser) {
    return (
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'36px 28px',textAlign:'center'}}>
        <div style={{fontSize:64,marginBottom:16}}>🌱</div>
        <h2 style={{fontSize:22,fontWeight:900,color:'#1E1B4B',marginBottom:10}}>나만의 정원을 꾸며보세요</h2>
        <p style={{fontSize:14,color:'#6B7280',fontWeight:600,lineHeight:1.75,marginBottom:28}}>
          퀘스트를 완료해서 보상 요소를 획득하고<br/>테마 배경 위에 자유롭게 배치하는<br/>나만의 특별한 공간을 만들 수 있어요.
        </p>
        <div style={{background:'white',borderRadius:20,padding:'20px',border:`2px solid ${BD}`,width:'100%',maxWidth:340,marginBottom:24}}>
          {[['🎨','14가지 테마 배경 (낮/밤 전환)'],['✨','AI로 나만의 맞춤 테마 생성'],['🏆','퀘스트 완료 시 보상 요소 획득'],['🌸','보상 요소 드래그로 자유 배치']].map(([e,t])=>(
            <div key={t} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderBottom:`1px solid ${BD}`}}>
              <span style={{fontSize:20,flexShrink:0}}>{e}</span>
              <span style={{fontSize:13,fontWeight:700,color:'#1E1B4B',textAlign:'left'}}>{t}</span>
              <span style={{marginLeft:'auto',color:G,fontSize:14}}>✓</span>
            </div>
          ))}
          <div style={{display:'flex',alignItems:'center',gap:12,padding:'9px 0'}}>
            <span style={{fontSize:20,flexShrink:0}}>💬</span>
            <span style={{fontSize:13,fontWeight:700,color:'#1E1B4B',textAlign:'left'}}>AI와 대화로 정원 기획</span>
            <span style={{marginLeft:'auto',color:G,fontSize:14}}>✓</span>
          </div>
        </div>
        <button onClick={onShowProUpgrade} style={{width:'100%',maxWidth:340,padding:'15px',borderRadius:16,border:'none',background:`linear-gradient(135deg,${P},${G})`,color:'white',fontSize:16,fontWeight:900,boxShadow:'0 6px 24px rgba(124,58,237,.35)'}}>
          ✨ Pro로 업그레이드
        </button>
        <p style={{fontSize:11,color:'#9CA3AF',marginTop:12,fontWeight:600}}>월 ₩9,900 · 언제든 해지 가능</p>
      </div>
    );
  }

  return (
    <div style={{flex:1,overflowY:'auto',padding:'18px 18px 90px'}}>
      {pages.length===0 ? (
        <div style={{textAlign:'center',padding:'72px 24px'}}>
          <div style={{fontSize:56,marginBottom:14}}>🌱</div>
          <p style={{fontSize:15,color:'#6B7280',lineHeight:1.75,fontWeight:600}}>아직 정원이 없어요.<br/>우하단 <strong style={{color:P}}>+</strong> 버튼으로 첫 정원을 만들어요!</p>
        </div>
      ) : (
        <>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9CA3AF',marginBottom:12}}>나의 정원 ({pages.length})</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:14,marginBottom:28}}>
            {pages.map((p,i)=>{
              const th=THEMES[p.theme]||THEMES.nature;
              return(
                <div key={p.id} style={{borderRadius:20,overflow:'hidden',aspectRatio:'16/9',cursor:'pointer',position:'relative',boxShadow:'0 4px 18px rgba(124,58,237,.1)',border:'2px solid rgba(255,255,255,.5)'}}
                  onClick={()=>onOpenPage(p.id)}>
                  <div style={{position:'absolute',inset:0}}><ThemeBg themeId={p.theme} isDark={p.isDark}/></div>
                  {(p.elements||[]).slice(0,10).map(el=>(
                    <div key={el.id} style={{position:'absolute',left:`${Math.max(4,Math.min(80,(el.x||0)/12))}%`,top:`${Math.max(4,Math.min(68,(el.y||0)/7))}%`,fontSize:Math.max(13,Math.min(22,(el.size||36)*.48)),pointerEvents:'none',userSelect:'none',lineHeight:1}}>{el.emoji}</div>
                  ))}
                  <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(to top,rgba(0,0,0,.56),transparent)',padding:'22px 10px 10px',color:'white',fontSize:13,fontWeight:800,textShadow:'0 1px 4px rgba(0,0,0,.3)'}}>{th.e} {p.title}{p.isDark&&th.hasDN?' 🌙':''}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {owned.length>0&&(
        <>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:'0.08em',textTransform:'uppercase',color:'#9CA3AF',marginBottom:12}}>획득한 요소 컬렉션 ({owned.length}개)</div>
          {Object.entries(RCATS).map(([k,v])=>{
            const its=owned.filter(el=>el.catKey===k);
            if(!its.length)return null;
            return(
              <div key={k} style={{marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:800,color:v.c,marginBottom:8,display:'flex',alignItems:'center',gap:6}}>{v.e} {v.n}<span style={{background:v.c,color:'white',borderRadius:20,padding:'1px 8px',fontSize:10,fontWeight:900}}>{its.length}</span></div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {its.map((el,i)=>(<div key={i} title={el.name} style={{fontSize:22,background:'white',borderRadius:10,padding:6,border:`1.5px solid ${BD}`,lineHeight:1}}>{el.emoji}</div>))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   HOME SCREEN (legacy - kept for reference)
══════════════════════════════════════════ */
function HomeScreen({ pages, owned }) {
  return <StatsScreen quests={[]} />;
}

/* ══════════════════════════════════════════
   QUEST SCREEN
══════════════════════════════════════════ */
function QuestScreen({ quests, silent, isProUser, onToggleSilent, onOpenTimer, onEditReward }) {
  const tQ = quests.filter(q => q.date === today());
  const done = tQ.filter(q => q.completed).length;
  const allDone = tQ.length > 0 && done === tQ.length;
  const [catFil, setCatFil] = useState(null);
  const filtered = catFil ? tQ.filter(q => q.rewardCat === catFil) : tQ;
  const usedCats = [...new Set(tQ.map(q => q.rewardCat).filter(Boolean))];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px 90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 900 }}>오늘의 퀘스트 ⚔️</h2>
          <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 600, marginTop: 2 }}>{done}/{tQ.length} 완료{tQ.length === 0 ? ' · 할일을 추가해요' : ''}</p>
        </div>
        <button onClick={onToggleSilent} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 999, border: `1.5px solid ${silent ? P : G}`, background: silent ? PL : GL, color: silent ? PD : GD, fontSize: 12, fontWeight: 800 }}>{silent ? '🔔 알람' : '🔕 무음'}</button>
      </div>
      {tQ.length > 0 && (
        <>
          <div style={{ background: '#EDE9FE', borderRadius: 999, height: 6, marginBottom: 14, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg,${P},${G})`, width: `${tQ.length > 0 ? (done / tQ.length) * 100 : 0}%`, transition: 'width .5s ease' }} />
          </div>
          {isProUser && usedCats.length > 1 && (
            <div style={{ display: 'flex', gap: 5, overflowX: 'auto', marginBottom: 14, paddingBottom: 2 }}>
              <button onClick={() => setCatFil(null)} style={{ flexShrink: 0, padding: '4px 9px', borderRadius: 20, border: `1.5px solid ${!catFil ? P : BD}`, background: !catFil ? P : 'white', color: !catFil ? 'white' : '#6B7280', fontSize: 11, fontWeight: 800 }}>전체</button>
              {usedCats.map(k => {
                const v = RCATS[k];
                return v ? (
                  <button key={k} onClick={() => setCatFil(catFil === k ? null : k)} style={{ flexShrink: 0, padding: '4px 9px', borderRadius: 20, border: `1.5px solid ${catFil === k ? v.c : BD}`, background: catFil === k ? v.c : 'white', color: catFil === k ? 'white' : v.c, fontSize: 11, fontWeight: 800 }}>{v.e} {v.n}</button>
                ) : null;
              })}
            </div>
          )}
        </>
      )}
      {tQ.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '72px 24px' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>⚔️</div>
          <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.75, fontWeight: 600 }}>오늘의 퀘스트가 없어요.<br />우하단 <strong style={{ color: P }}>+</strong> 버튼으로 시작하세요!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map((q, i) => {
            const el = getAllItems().find(it => it.id === q.rewardId);
            const cat = q.rewardCat ? RCATS[q.rewardCat] : null;
            return (
              <div key={q.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', border: `1.5px solid ${BD}`, borderRadius: 16, padding: '13px 12px', cursor: q.completed ? 'default' : 'pointer', opacity: q.completed ? 0.62 : 1 }}>
                  <div onClick={() => !q.completed && onOpenTimer(q)}
                    style={{ width: 30, height: 30, borderRadius: '50%', border: `2.5px solid ${q.completed ? G : P}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: q.completed ? 'white' : P, background: q.completed ? G : PL, transition: 'all .3s' }}>
                    {q.completed ? '✓' : i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }} onClick={() => !q.completed && onOpenTimer(q)}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1E1B4B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: q.completed ? 'line-through' : 'none' }}>{q.title}</div>
                    {/* Pro: show reward badge. Non-pro: show study time if completed */}
                    {isProUser && el && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3, background: cat ? `${cat.c}18` : GL, borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700, color: cat ? cat.c : GD }}>{el.e} {el.n}</div>
                    )}
                    {!isProUser && q.completed && q.studyMinutes > 0 && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3, background: GL, borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700, color: GD }}>⏱ {q.studyMinutes}분 공부</div>
                    )}
                  </div>
                  {isProUser && !q.completed && <button onClick={() => onEditReward(q)} style={{ background: 'none', border: 'none', fontSize: 15, padding: 6, borderRadius: 8, color: '#9CA3AF' }}>✏️</button>}
                </div>
                {i < filtered.length - 1 && <div style={{ width: 2, height: 11, background: BD, marginLeft: 21 }} />}
              </div>
            );
          })}
        </div>
      )}
      {allDone && (
        <div style={{ marginTop: 20, background: `linear-gradient(135deg,${PL},${GL})`, borderRadius: 20, padding: 24, textAlign: 'center', border: `2px solid rgba(124,58,237,.15)` }}>
          <div style={{ fontSize: 46, marginBottom: 8 }}>🏆</div>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: PD }}>모든 퀘스트 완료!</h3>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4, fontWeight: 600 }}>{isProUser ? '획득한 요소로 정원을 꾸며보세요 🌸' : '오늘도 수고했어요! 내일도 파이팅 💪'}</p>
        </div>
      )}
    </div>
  );
}


/* ══════════════════════════════════════════
   APP ROOT
══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   PROFILE PAGE
══════════════════════════════════════════ */
function ProfilePage({ user, isProUser, quests, onBack, onUpdate, onLogout, onShowProUpgrade }) {
  const [editNick, setEditNick] = useState(false);
  const [nick, setNick] = useState(user.nickname || user.name);
  const [changePw, setChangePw] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPw2, setNewPw2] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwOk, setPwOk] = useState(false);
  const fileRef = useRef(null);

  const totalMin = quests.filter(q => q.completed).reduce((s, q) => s + (q.studyMinutes || 0), 0);
  const totalQ = quests.filter(q => q.completed).length;
  const fmtMin = m => m >= 60 ? `${Math.floor(m/60)}시간 ${m%60}분` : `${m}분`;

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdate({ avatar: ev.target.result });
    reader.readAsDataURL(file);
  };

  const saveNick = () => {
    if (nick.trim()) onUpdate({ nickname: nick.trim() });
    setEditNick(false);
  };

  const savePw = () => {
    setPwMsg(''); setPwOk(false);
    if (!oldPw) { setPwMsg('현재 비밀번호를 입력해주세요.'); return; }
    if (newPw.length < 4) { setPwMsg('새 비밀번호는 4자 이상이어야 해요.'); return; }
    if (newPw !== newPw2) { setPwMsg('새 비밀번호가 일치하지 않아요.'); return; }
    onUpdate({ pw: newPw });
    setPwOk(true);
    setPwMsg('비밀번호가 변경됐어요!');
    setOldPw(''); setNewPw(''); setNewPw2('');
    setTimeout(() => setChangePw(false), 1500);
  };

  const row = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${BD}` }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#6B7280' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#1E1B4B' }}>{value}</span>
    </div>
  );

  const inp = (val, set, ph, type='text') => (
    <input value={val} onChange={e => set(e.target.value)} placeholder={ph} type={type}
      style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${BD}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#1E1B4B', background: '#F8F7FF', marginBottom: 8 }}
      onFocus={e => e.target.style.border=`1.5px solid ${P}`}
      onBlur={e => e.target.style.border=`1.5px solid ${BD}`}/>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 300, background: '#F5F3FF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 16px', background: 'white', borderBottom: `1.5px solid ${BD}`, gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 18, color: '#6B7280', cursor: 'pointer', padding: '4px 6px' }}>←</button>
        <span style={{ fontWeight: 900, fontSize: 15, color: '#1E1B4B', flex: 1 }}>프로필</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 48px' }}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: `linear-gradient(135deg,${PL},${GL})`, border: `3px solid ${P}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {user.avatar
                ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="프로필"/>
                : <span style={{ fontSize: 40 }}>👤</span>}
            </div>
            <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: P, border: '2px solid white', color: 'white', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>📷</button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }}/>
          </div>
          {/* Nickname edit */}
          {editNick ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input value={nick} onChange={e => setNick(e.target.value)} autoFocus
                style={{ padding: '7px 12px', border: `2px solid ${P}`, borderRadius: 10, fontSize: 15, fontWeight: 700, color: '#1E1B4B', textAlign: 'center' }}
                onKeyDown={e => e.key === 'Enter' && saveNick()}/>
              <button onClick={saveNick} style={{ padding: '7px 14px', borderRadius: 10, border: 'none', background: P, color: 'white', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>저장</button>
              <button onClick={() => setEditNick(false)} style={{ padding: '7px 12px', borderRadius: 10, border: `1.5px solid ${BD}`, background: 'none', fontWeight: 700, fontSize: 13, color: '#6B7280', cursor: 'pointer' }}>취소</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#1E1B4B' }}>{user.nickname || user.name}</span>
              <button onClick={() => setEditNick(true)} style={{ background: PL, border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 800, color: PD, cursor: 'pointer' }}>수정</button>
            </div>
          )}
          {isProUser && <span style={{ marginTop: 6, fontSize: 10, fontWeight: 900, background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: 'white', padding: '2px 8px', borderRadius: 6 }}>PRO</span>}
        </div>

        {/* Stats summary */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[['✅', '완료 퀘스트', totalQ + '개'], ['⏱', '총 공부 시간', fmtMin(totalMin)]].map(([ic, lb, val]) => (
            <div key={lb} style={{ flex: 1, background: 'white', borderRadius: 14, padding: '12px', border: `1.5px solid ${BD}`, textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{ic}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: P }}>{val}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>{lb}</div>
            </div>
          ))}
        </div>

        {/* Account info */}
        <div style={{ background: 'white', borderRadius: 16, border: `1.5px solid ${BD}`, padding: '0 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '12px 0 4px' }}>계정 정보</div>
          {row('이름', user.name)}
          {row('닉네임', user.nickname || user.name)}
          {row('이메일', user.email)}
          {row('플랜', isProUser ? '✨ Pro' : '무료')}
        </div>

        {/* Change password */}
        <div style={{ background: 'white', borderRadius: 16, border: `1.5px solid ${BD}`, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: changePw ? 12 : 0 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#1E1B4B' }}>🔑 비밀번호 변경</span>
            <button onClick={() => { setChangePw(c => !c); setPwMsg(''); setPwOk(false); }} style={{ background: changePw ? '#F3F4F6' : PL, border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 800, color: changePw ? '#6B7280' : PD, cursor: 'pointer' }}>{changePw ? '접기' : '변경'}</button>
          </div>
          {changePw && (
            <div>
              {inp(oldPw, setOldPw, '현재 비밀번호', 'password')}
              {inp(newPw, setNewPw, '새 비밀번호 (4자 이상)', 'password')}
              {inp(newPw2, setNewPw2, '새 비밀번호 확인', 'password')}
              {pwMsg && <div style={{ fontSize: 12, fontWeight: 700, color: pwOk ? GD : '#DC2626', marginBottom: 8, textAlign: 'center' }}>{pwMsg}</div>}
              <button onClick={savePw} style={{ width: '100%', padding: '11px', borderRadius: 11, border: 'none', background: `linear-gradient(135deg,${P},${G})`, color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>변경 완료</button>
            </div>
          )}
        </div>

        {/* Pro upgrade */}
        {!isProUser && (
          <button onClick={onShowProUpgrade} style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: 'white', fontSize: 14, fontWeight: 900, marginBottom: 12, cursor: 'pointer' }}>✨ Pro로 업그레이드</button>
        )}

        {/* Logout */}
        <button onClick={onLogout} style={{ width: '100%', padding: '13px', borderRadius: 14, border: `1.5px solid #FECACA`, background: '#FEF2F2', color: '#DC2626', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>로그아웃</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   GARDEN FAB (정원 탭 + 버튼 메뉴)
══════════════════════════════════════════ */
function GardenFab({ onTheme, onAI }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'absolute', right: 24, bottom: 24, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
      {open && (
        <>
          {/* Backdrop */}
          <div style={{ position: 'fixed', inset: 0, zIndex: -1 }} onClick={() => setOpen(false)} />
          {/* Option: AI 대화 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, animation: 'qgFadeUp .2s ease' }}>
            <span style={{ background: 'white', borderRadius: 12, padding: '6px 14px', fontSize: 13, fontWeight: 800, color: '#1E1B4B', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', whiteSpace: 'nowrap' }}>💬 AI와 대화하기</span>
            <button onClick={() => { setOpen(false); onAI(); }} style={{ width: 46, height: 46, borderRadius: 15, background: `linear-gradient(135deg,${P},#A78BFA)`, border: 'none', color: 'white', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(124,58,237,.4)', cursor: 'pointer' }}>✨</button>
          </div>
          {/* Option: 테마 선택 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, animation: 'qgFadeUp .2s ease .05s both' }}>
            <span style={{ background: 'white', borderRadius: 12, padding: '6px 14px', fontSize: 13, fontWeight: 800, color: '#1E1B4B', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', whiteSpace: 'nowrap' }}>🎨 정원 테마 선택</span>
            <button onClick={() => { setOpen(false); onTheme(); }} style={{ width: 46, height: 46, borderRadius: 15, background: `linear-gradient(135deg,${G},#34D399)`, border: 'none', color: 'white', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(16,185,129,.4)', cursor: 'pointer' }}>🌿</button>
          </div>
        </>
      )}
      {/* Main FAB */}
      <button onClick={() => setOpen(o => !o)}
        style={{ width: 56, height: 56, borderRadius: 18, background: `linear-gradient(145deg,${P},${G})`, border: 'none', color: 'white', fontSize: open ? 24 : 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px rgba(124,58,237,.45)', cursor: 'pointer', transition: 'transform .2s, font-size .2s', transform: open ? 'rotate(45deg)' : 'none' }}
        onMouseDown={e => { e.currentTarget.style.transform = open ? 'rotate(45deg) scale(0.91)' : 'scale(0.91)'; }}
        onMouseUp={e => { e.currentTarget.style.transform = open ? 'rotate(45deg)' : 'none'; }}>
        +
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════
   PRO UPGRADE PAGE
══════════════════════════════════════════ */
function ProUpgradePage({ onBack, onUpgrade, userName }) {
  const [sel, setSel] = useState('annual');
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [cardInfo, setCardInfo] = useState({ cardNum: '', cardName: '', expiry: '', cvc: '' });
  const [payErr, setPayErr] = useState('');

  const plans = {
    monthly: { label: '월간', price: '₩9,900', sub: '/월', badge: null },
    annual:  { label: '연간', price: '₩79,900', sub: '/년', badge: '17% 절약' },
  };

  const handlePay = async () => {
    setPayErr('');
    const num = cardInfo.cardNum.replace(/\s/g,'');
    if (num.length !== 16) { setPayErr('카드 번호 16자리를 입력해주세요.'); return; }
    if (!cardInfo.cardName.trim()) { setPayErr('카드 소유자 이름을 입력해주세요.'); return; }
    if (cardInfo.expiry.length < 5) { setPayErr('유효기간을 MM/YY 형식으로 입력해주세요.'); return; }
    if (cardInfo.cvc.length < 3) { setPayErr('CVC 3자리를 입력해주세요.'); return; }
    setPaying(true);
    await new Promise(r => setTimeout(r, 2200));
    setPaying(false);
    setDone(true);
    await new Promise(r => setTimeout(r, 1200));
    onUpgrade();
  };

  const perks = [
    { icon: '🌿', title: '정원 만들기', desc: '테마 배경 위에 보상 요소를 자유롭게 배치' },
    { icon: '✨', title: 'AI 정원 기획', desc: 'AI와 대화해 나만의 맞춤 테마를 생성' },
    { icon: '🏆', title: '퀘스트 보상 요소', desc: '완료 시 정원에 배치할 요소 획득' },
    { icon: '🎨', title: '14가지 테마', desc: '낮/밤 전환이 가능한 다양한 배경' },
    { icon: '⭐', title: '희귀 요소', desc: 'Pro 전용 희귀 꾸미기 요소 해금' },
    { icon: '💬', title: 'AI 채팅 기록', desc: 'AI와 대화 내용 무제한 저장' },
  ];

  if (done) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 300, background: `linear-gradient(160deg,${PD},${GD})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div style={{ fontSize: 72, marginBottom: 16, animation: 'qgPop .5s ease' }}>🎉</div>
        <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Pro 가입 완료!</div>
        <p style={{ fontSize: 15, opacity: 0.8, fontWeight: 600 }}>이제 정원을 만들어보세요 🌿</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 300, background: '#F5F3FF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 18px', background: 'white', borderBottom: `1.5px solid ${BD}`, gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 18, color: '#6B7280', padding: '4px 6px', cursor: 'pointer' }}>←</button>
        <div style={{ fontWeight: 900, fontSize: 15, background: `linear-gradient(135deg,${PD},${GD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Quest Garden Pro</div>
        <span style={{ fontSize: 9, fontWeight: 900, background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: 'white', padding: '2px 6px', borderRadius: 5 }}>PRO</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>✨</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1E1B4B', marginBottom: 6 }}>Quest Garden Pro</h1>
          <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 600, lineHeight: 1.7 }}>{userName}님만의 정원을 만드는<br/>가장 특별한 경험</p>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {Object.entries(plans).map(([k, v]) => (
            <button key={k} onClick={() => setSel(k)} style={{ flex: 1, padding: '14px 10px', borderRadius: 16, border: `2px solid ${sel===k?P:BD}`, background: sel===k?PL:'white', position: 'relative', cursor: 'pointer' }}>
              {v.badge && <span style={{ position: 'absolute', top: -9, right: 8, background: G, color: 'white', fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 20 }}>{v.badge}</span>}
              <div style={{ fontWeight: 800, fontSize: 13, color: sel===k?PD:'#6B7280', marginBottom: 4 }}>{v.label}</div>
              <div style={{ fontWeight: 900, fontSize: 19, color: sel===k?P:'#1E1B4B' }}>{v.price}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>{v.sub}</div>
            </button>
          ))}
        </div>
        <div style={{ background: 'white', borderRadius: 16, border: `1.5px solid ${BD}`, padding: '6px 0', marginBottom: 20 }}>
          {perks.map((pk, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: i < perks.length-1 ? `1px solid ${BD}` : 'none' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{pk.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#1E1B4B', marginBottom: 1 }}>{pk.title}</div>
                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>{pk.desc}</div>
              </div>
              <span style={{ color: G, fontSize: 14 }}>✓</span>
            </div>
          ))}
        </div>
        {/* Card payment form */}
        <div style={{ background: 'white', borderRadius: 16, border: `1.5px solid ${BD}`, padding: '16px', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>💳 카드 정보 입력</div>
          {[
            { label: '카드 번호', ph: '0000 0000 0000 0000', key: 'cardNum', maxLen: 19,
              fmt: v => v.replace(/\D/g,'').slice(0,16).replace(/(\d{4})(?=\d)/g,'$1 ').trim() },
            { label: '카드 소유자 이름', ph: '홍길동', key: 'cardName', maxLen: 30, fmt: v => v },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 4 }}>{f.label}</div>
              <input value={cardInfo[f.key]} onChange={e => setCardInfo(c => ({...c, [f.key]: f.fmt(e.target.value)}))}
                placeholder={f.ph} maxLength={f.maxLen}
                style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${BD}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#1E1B4B', background: '#F8F7FF' }}
                onFocus={e => e.target.style.border=`1.5px solid ${P}`}
                onBlur={e => e.target.style.border=`1.5px solid ${BD}`}/>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: '유효기간', ph: 'MM/YY', key: 'expiry', maxLen: 5,
                fmt: v => { const d=v.replace(/\D/g,'').slice(0,4); return d.length>2?d.slice(0,2)+'/'+d.slice(2):d; } },
              { label: 'CVC', ph: '000', key: 'cvc', maxLen: 3, fmt: v => v.replace(/\D/g,'').slice(0,3) },
            ].map(f => (
              <div key={f.key} style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 4 }}>{f.label}</div>
                <input value={cardInfo[f.key]} onChange={e => setCardInfo(c => ({...c, [f.key]: f.fmt(e.target.value)}))}
                  placeholder={f.ph} maxLength={f.maxLen}
                  style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${BD}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#1E1B4B', background: '#F8F7FF' }}
                  onFocus={e => e.target.style.border=`1.5px solid ${P}`}
                  onBlur={e => e.target.style.border=`1.5px solid ${BD}`}/>
              </div>
            ))}
          </div>
          {payErr && <div style={{ marginTop: 10, fontSize: 12, color: '#DC2626', fontWeight: 700, textAlign: 'center' }}>{payErr}</div>}
        </div>
        <button onClick={handlePay} disabled={paying} style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', background: paying ? '#9CA3AF' : `linear-gradient(135deg,${P},${G})`, color: 'white', fontSize: 15, fontWeight: 900, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: paying ? 'default' : 'pointer' }}>
          {paying ? (
            <><div style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'qgSpin .7s linear infinite' }} />결제 처리 중...</>
          ) : `💳 ${plans[sel].price} 결제하기`}
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>언제든 해지 가능 · 자동 갱신 · 부가세 포함</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   AI CHAT PAGE
══════════════════════════════════════════ */
function AIChatPage({ onBack, onCreatePage, onDeletePages, pages }) {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sideOpen, setSideOpen] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [confirmCard, setConfirmCard] = useState(null);
  const [apiKey, setApiKey] = useState(() => { try { return localStorage.getItem('qg_apikey') || ''; } catch { return ''; } });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const msgEnd = useRef(null);

  const activeSess = sessions.find(s => s.id === activeId);
  const msgs = activeSess ? activeSess.msgs : [];

  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, loading]);

  const saveKey = () => {
    const k = keyDraft.trim();
    setApiKey(k);
    try { localStorage.setItem('qg_apikey', k); } catch {}
    setShowKeyInput(false);
    setKeyDraft('');
  };

  const SYSTEM = `당신은 Quest Garden 앱의 AI 정원 기획 도우미입니다. 다음 단계로 대화를 진행하세요:
1단계: 테마, 분위기, 계절, 시간대(낮/밤) 파악
2단계: "이 테마에 어울리는 특별한 요소들이 있을까요? 예를 들어 [예시 2~3개]를 추가할 수 있어요!"
3단계: 원하는 요소 파악
4단계: 충분히 이해했을 때 반드시 이 형식으로:
"✅ 완벽히 이해했습니다! 이제 [테마이름] 테마와 맞춤 요소들을 생성할까요?\n[생성확인]테마이름|낮/밤|카테고리:요소/이모지:요소2/이모지2,카테고리2:요소3/이모지3"

테마 매핑: 지중해/해안/거실→mediter, 주택/마당→yard, 우주/행성→space, 판타지→fantasy, 벚꽃→sakura, 노을→sunset, 비→rain
규칙: 카테고리 1~3개, 각 2~4요소, 실제 유니코드 이모지, 한국어로 친근하게, [생성확인]은 한 번만`;

  const updateSession = (id, patch) => setSessions(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));

  const startNew = () => {
    const id = uid();
    const initMsg = { role: 'assistant', content: '안녕하세요! 🌱 어떤 정원을 만들고 싶으신가요? 원하는 분위기나 계절, 느낌을 자유롭게 말씀해주세요.' };
    setSessions(prev => [{ id, title: '새 대화', date: '방금', preview: '', msgs: [initMsg], createdPageIds: [], customElems: [] }, ...prev]);
    setActiveId(id);
    setConfirmCard(null);
  };

  useEffect(() => { startNew(); }, []);

  const sendMsg = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!apiKey) { setShowKeyInput(true); return; }
    setInput(''); setConfirmCard(null);
    const prevMsgs = activeSess ? activeSess.msgs : [];
    const newMsgs = [...prevMsgs, { role: 'user', content: text }];
    const title = prevMsgs.length <= 1 ? text.slice(0, 20) + (text.length > 20 ? '...' : '') : activeSess.title;
    updateSession(activeId, { msgs: newMsgs, title, preview: text, date: '방금' });
    setLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1200, system: SYSTEM, messages: newMsgs.map(m => ({ role: m.role, content: m.content })) }),
      });
      if (res.status === 401) {
        updateSession(activeId, { msgs: [...newMsgs, { role: 'assistant', content: '🔑 API 키가 올바르지 않아요. 오른쪽 상단 🔑 버튼으로 키를 다시 입력해주세요.' }] });
        setApiKey('');
        try { localStorage.removeItem('qg_apikey'); } catch {}
        setLoading(false);
        return;
      }
      const data = await res.json();
      const reply = data.content?.[0]?.text || '죄송해요, 잠시 후 다시 시도해주세요.';
      const sigMatch = reply.match(/\[생성확인\]([^|]+)\|([^|]+)\|(.+)/s);
      const cleanReply = reply.replace(/\[생성확인\][^\n]*/g, '').trim();
      updateSession(activeId, { msgs: [...newMsgs, { role: 'assistant', content: cleanReply || reply }], preview: text, date: '방금' });
      if (sigMatch) {
        const cats = [];
        sigMatch[3].trim().split(',').forEach(catPart => {
          const [catName, ...items] = catPart.split(':');
          if (!catName || !items.length) return;
          const parsedItems = items.map(item => { const [n, e] = item.split('/'); return { id: uid(), n: (n||'요소').trim(), e: (e||'🌿').trim() }; });
          if (parsedItems.length) cats.push({ key: uid(), name: catName.trim(), items: parsedItems });
        });
        setConfirmCard({ themeKey: matchTheme(sigMatch[1].trim()), isDark: sigMatch[2].trim()==='밤', title: sigMatch[1].trim(), categories: cats, sessionId: activeId });
      }
    } catch (e) {
      updateSession(activeId, { msgs: [...newMsgs, { role: 'assistant', content: '네트워크 오류가 발생했어요. 인터넷 연결을 확인해주세요.' }] });
    }
    setLoading(false);
  };

  const handleConfirm = () => {
    if (!confirmCard) return;
    const pageId = uid();
    onCreatePage({ id: pageId, title: confirmCard.title, theme: confirmCard.themeKey, isDark: confirmCard.isDark, elements: [] }, confirmCard.categories, activeId);
    updateSession(activeId, { createdPageIds: [...(activeSess?.createdPageIds||[]), pageId], customElems: confirmCard.categories });
    setConfirmCard(null);
    updateSession(activeId, { msgs: [...msgs, { role: 'assistant', content: `🎉 "${confirmCard.title}" 테마가 생성됐어요! 정원 탭에서 확인해보세요.` }] });
  };

  const confirmDelete = () => {
    if (!deleteModal) return;
    onDeletePages(deleteModal.createdPageIds || []);
    setSessions(prev => prev.filter(s => s.id !== deleteModal.id));
    if (activeId === deleteModal.id) { const rem = sessions.filter(s => s.id !== deleteModal.id); if (rem.length) setActiveId(rem[0].id); else startNew(); }
    setDeleteModal(null);
  };

  const saveEdit = (id) => { if (editTitle.trim()) updateSession(id, { title: editTitle.trim() }); setEditingId(null); };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 300, display: 'flex', flexDirection: 'column', background: '#F5F3FF' }}>
      <div style={{ height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 12px', background: 'white', borderBottom: `1.5px solid ${BD}`, gap: 8 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 18, color: '#6B7280', padding: '4px 6px', cursor: 'pointer' }}>←</button>
        <button onClick={() => setSideOpen(s => !s)} style={{ background: sideOpen?PL:'none', border: `1.5px solid ${sideOpen?P:BD}`, borderRadius: 8, padding: '4px 8px', fontSize: 13, color: sideOpen?PD:'#6B7280', fontWeight: 700, cursor: 'pointer' }}>☰</button>
        <div style={{ flex: 1, fontWeight: 900, fontSize: 14, color: '#1E1B4B' }}>✨ AI 정원 기획</div>
        <span style={{ fontSize: 9, fontWeight: 900, background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: 'white', padding: '2px 6px', borderRadius: 5 }}>PRO</span>
        {/* API Key button */}
        <button onClick={() => { setKeyDraft(apiKey); setShowKeyInput(true); }}
          title={apiKey ? 'API 키 설정됨 (클릭해서 변경)' : 'API 키 입력 필요'}
          style={{ padding: '4px 8px', borderRadius: 8, border: `1.5px solid ${apiKey ? G : '#FECACA'}`, background: apiKey ? GL : '#FEF2F2', color: apiKey ? GD : '#DC2626', fontSize: 11, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          🔑 {apiKey ? '키 설정됨' : '키 필요'}
        </button>
        <button onClick={startNew} style={{ background: PL, border: `1.5px solid ${P}`, borderRadius: 9, padding: '5px 10px', fontSize: 11, fontWeight: 800, color: PD, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ 새 대화</button>
      </div>

      {/* API Key input modal */}
      {showKeyInput && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 400, background: 'rgba(10,5,30,.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 24, width: '100%', maxWidth: 380, boxShadow: '0 8px 32px rgba(0,0,0,.2)' }}>
            <div style={{ fontWeight: 900, fontSize: 17, color: '#1E1B4B', marginBottom: 6 }}>🔑 Anthropic API 키 입력</div>
            <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, lineHeight: 1.7, marginBottom: 16 }}>
              크롬에서 AI 채팅을 사용하려면 Anthropic API 키가 필요해요.<br/>
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
                style={{ color: P, fontWeight: 800 }}>console.anthropic.com</a> 에서 무료로 키를 발급받을 수 있어요.
            </p>
            <div style={{ background: '#FEF9C3', border: '1px solid #FDE047', borderRadius: 10, padding: '8px 12px', fontSize: 11, color: '#713F12', fontWeight: 700, marginBottom: 14 }}>
              ⚠️ API 키는 이 기기에만 저장되며 외부로 전송되지 않아요.
            </div>
            <input
              value={keyDraft}
              onChange={e => setKeyDraft(e.target.value)}
              placeholder="sk-ant-api03-..."
              autoFocus
              style={{ width: '100%', padding: '11px 13px', border: `2px solid ${BD}`, borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#1E1B4B', background: '#F8F7FF', marginBottom: 14, fontFamily: 'monospace' }}
              onFocus={e => e.target.style.border = `2px solid ${P}`}
              onBlur={e => e.target.style.border = `2px solid ${BD}`}
              onKeyDown={e => e.key === 'Enter' && saveKey()}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowKeyInput(false)} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1.5px solid ${BD}`, background: 'none', fontSize: 14, fontWeight: 700, color: '#6B7280', cursor: 'pointer' }}>취소</button>
              {apiKey && <button onClick={() => { setApiKey(''); try { localStorage.removeItem('qg_apikey'); } catch {} setShowKeyInput(false); }} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1.5px solid #FECACA', background: '#FEF2F2', fontSize: 13, fontWeight: 700, color: '#DC2626', cursor: 'pointer' }}>키 삭제</button>}
              <button onClick={saveKey} disabled={!keyDraft.trim()} style={{ flex: 2, padding: 12, borderRadius: 12, border: 'none', background: keyDraft.trim() ? `linear-gradient(135deg,${P},${G})` : '#E5E7EB', color: 'white', fontSize: 14, fontWeight: 800, cursor: keyDraft.trim() ? 'pointer' : 'default' }}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* No API key banner */}
      {!apiKey && !showKeyInput && (
        <div style={{ background: '#FEF2F2', borderBottom: '1px solid #FECACA', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 13 }}>🔑</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', flex: 1 }}>API 키를 입력하면 크롬에서도 AI와 대화할 수 있어요.</span>
          <button onClick={() => { setKeyDraft(''); setShowKeyInput(true); }} style={{ padding: '4px 12px', borderRadius: 8, border: 'none', background: '#DC2626', color: 'white', fontSize: 11, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>입력하기</button>
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {sideOpen && (
          <div style={{ width: 200, flexShrink: 0, background: 'white', borderRight: `1.5px solid ${BD}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 12px 6px', fontSize: 10, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em' }}>대화 기록</div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {sessions.length === 0 && <div style={{ padding: '20px 12px', textAlign: 'center', color: '#9CA3AF', fontSize: 12, fontWeight: 600 }}>아직 대화가 없어요</div>}
              {sessions.map(s => (
                <div key={s.id} onClick={() => { setActiveId(s.id); setConfirmCard(null); }}
                  style={{ padding: '10px 12px', background: activeId===s.id?PL:'none', borderLeft: activeId===s.id?`3px solid ${P}`:'3px solid transparent', cursor: 'pointer', position: 'relative' }}>
                  {editingId===s.id ? (
                    <input autoFocus value={editTitle} onChange={e=>setEditTitle(e.target.value)}
                      onBlur={()=>saveEdit(s.id)} onKeyDown={e=>{if(e.key==='Enter')saveEdit(s.id);e.stopPropagation();}} onClick={e=>e.stopPropagation()}
                      style={{ width:'100%',padding:'2px 6px',border:`1.5px solid ${P}`,borderRadius:6,fontSize:12,fontWeight:700,color:PD }}/>
                  ) : (
                    <div style={{ fontWeight:700,fontSize:12,color:activeId===s.id?PD:'#1E1B4B',marginBottom:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',paddingRight:40 }}>{s.title}</div>
                  )}
                  <div style={{ fontSize:10,color:'#9CA3AF',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{s.preview}</div>
                  <div style={{ fontSize:9,color:'#C4B5FD',marginTop:2,fontWeight:600 }}>{s.date}</div>
                  <div style={{ position:'absolute',top:10,right:8,display:'flex',gap:2 }}>
                    <button onClick={e=>{e.stopPropagation();setEditingId(s.id);setEditTitle(s.title);}} style={{ background:'none',border:'none',fontSize:11,padding:'2px 3px',color:'#9CA3AF',cursor:'pointer' }}>✏️</button>
                    <button onClick={e=>{e.stopPropagation();setDeleteModal(s);}} style={{ background:'none',border:'none',fontSize:11,padding:'2px 3px',color:'#9CA3AF',cursor:'pointer' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden' }}>
          <div style={{ flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:12 }}>
            {msgs.map((m,i) => (
              <div key={i} style={{ display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',alignItems:'flex-end',gap:8 }}>
                {m.role==='assistant' && <div style={{ width:30,height:30,borderRadius:'50%',background:`linear-gradient(135deg,${P},${G})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0 }}>🌱</div>}
                <div style={{ maxWidth:'74%',padding:'10px 14px',borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',background:m.role==='user'?`linear-gradient(135deg,${P},${PM})`:'white',color:m.role==='user'?'white':'#1E1B4B',fontSize:13,fontWeight:600,lineHeight:1.65,boxShadow:'0 2px 8px rgba(124,58,237,.08)',border:m.role==='assistant'?`1.5px solid ${BD}`:'none',whiteSpace:'pre-wrap',wordBreak:'break-word' }}>
                  {m.content}
                </div>
              </div>
            ))}
            {confirmCard && (
              <div style={{ display:'flex',justifyContent:'flex-start',alignItems:'flex-end',gap:8 }}>
                <div style={{ width:30,height:30,borderRadius:'50%',background:`linear-gradient(135deg,${P},${G})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0 }}>🌱</div>
                <div style={{ maxWidth:'82%',background:'white',border:`2px solid ${P}`,borderRadius:'16px 16px 16px 4px',overflow:'hidden',boxShadow:'0 4px 18px rgba(124,58,237,.15)' }}>
                  <div style={{ background:`linear-gradient(135deg,${PL},${GL})`,padding:'12px 16px',borderBottom:`1.5px solid ${BD}` }}>
                    <div style={{ fontWeight:900,fontSize:14,color:PD,marginBottom:3 }}>✅ 완벽히 이해했습니다!</div>
                    <div style={{ fontSize:12,color:PM,fontWeight:700 }}>이제 테마와 요소를 생성할까요?</div>
                  </div>
                  <div style={{ padding:'10px 14px' }}>
                    <div style={{ fontSize:11,fontWeight:700,color:'#1E1B4B',marginBottom:6 }}>🎨 테마: <strong style={{color:PD}}>{confirmCard.title}</strong> {confirmCard.isDark?'🌙 밤':'☀️ 낮'}</div>
                    {confirmCard.categories.map((cat,ci) => (
                      <div key={ci} style={{ marginBottom:6 }}>
                        <div style={{ fontSize:10,fontWeight:800,color:P,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:3 }}>{cat.name}</div>
                        <div style={{ display:'flex',flexWrap:'wrap',gap:4 }}>
                          {cat.items.map((it,ii) => <span key={ii} style={{ fontSize:11,background:PL,color:PD,borderRadius:8,padding:'2px 8px',fontWeight:700 }}>{it.e} {it.n}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex',gap:8,padding:'0 14px 14px' }}>
                    <button onClick={()=>setConfirmCard(null)} style={{ flex:1,padding:'9px',borderRadius:10,border:`1.5px solid ${BD}`,background:'none',fontSize:13,fontWeight:700,color:'#6B7280',cursor:'pointer' }}>취소</button>
                    <button onClick={handleConfirm} style={{ flex:2,padding:'9px',borderRadius:10,border:'none',background:`linear-gradient(135deg,${P},${G})`,color:'white',fontSize:13,fontWeight:800,cursor:'pointer' }}>✨ 확인 · 생성하기</button>
                  </div>
                </div>
              </div>
            )}
            {loading && (
              <div style={{ display:'flex',alignItems:'flex-end',gap:8 }}>
                <div style={{ width:30,height:30,borderRadius:'50%',background:`linear-gradient(135deg,${P},${G})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>🌱</div>
                <div style={{ padding:'11px 16px',borderRadius:'16px 16px 16px 4px',background:'white',border:`1.5px solid ${BD}`,display:'flex',gap:5,alignItems:'center' }}>
                  {[0,.18,.36].map((d,i) => <div key={i} style={{ width:6,height:6,borderRadius:'50%',background:P,animation:`qgBounce 1s ease-in-out ${d}s infinite` }}/>)}
                </div>
              </div>
            )}
            <div ref={msgEnd}/>
          </div>
          <div style={{ flexShrink:0,padding:'10px 12px',background:'white',borderTop:`1.5px solid ${BD}`,display:'flex',gap:8,alignItems:'flex-end' }}>
            <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="원하는 정원을 자유롭게 설명해보세요..." rows={1}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();}}}
              style={{ flex:1,padding:'9px 12px',border:`2px solid ${BD}`,borderRadius:12,fontSize:12,fontWeight:600,color:'#1E1B4B',resize:'none',lineHeight:1.5,maxHeight:100,background:'#F8F7FF',transition:'border .2s' }}
              onFocus={e=>{e.target.style.border=`2px solid ${P}`;}} onBlur={e=>{e.target.style.border=`2px solid ${BD}`;}}/>
            <button onClick={sendMsg} disabled={loading||!input.trim()} style={{ width:40,height:40,borderRadius:12,border:'none',background:input.trim()&&!loading?`linear-gradient(135deg,${P},${G})`:'#E5E7EB',color:'white',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,cursor:input.trim()&&!loading?'pointer':'default' }}>↑</button>
          </div>
        </div>
      </div>
      {deleteModal && (
        <div style={{ position:'absolute',inset:0,zIndex:400,background:'rgba(10,5,30,.56)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
          <div style={{ background:'white',borderRadius:20,padding:24,width:'100%',maxWidth:320,boxShadow:'0 8px 32px rgba(0,0,0,.2)' }}>
            <div style={{ fontSize:36,marginBottom:12,textAlign:'center' }}>⚠️</div>
            <div style={{ fontWeight:900,fontSize:16,color:'#1E1B4B',marginBottom:8,textAlign:'center' }}>대화를 삭제할까요?</div>
            {(deleteModal.createdPageIds||[]).length>0 && <div style={{ background:'#FEF2F2',border:'1.5px solid #FECACA',borderRadius:12,padding:'10px 14px',marginBottom:16,fontSize:12,color:'#DC2626',fontWeight:700,textAlign:'center' }}>🗑️ 이 대화에서 만든 정원 {deleteModal.createdPageIds.length}개도 함께 삭제됩니다.</div>}
            <div style={{ display:'flex',gap:10,marginTop:(deleteModal.createdPageIds||[]).length>0?0:16 }}>
              <button onClick={()=>setDeleteModal(null)} style={{ flex:1,padding:12,borderRadius:12,border:`1.5px solid ${BD}`,background:'none',fontSize:14,fontWeight:700,color:'#6B7280',cursor:'pointer' }}>취소</button>
              <button onClick={confirmDelete} style={{ flex:1,padding:12,borderRadius:12,border:'none',background:'#EF4444',color:'white',fontSize:14,fontWeight:800,cursor:'pointer' }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  // Persistent accounts (simulated DB in memory)
  const [accounts, setAccounts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qg_accounts') || '[]'); } catch { return []; }
  });
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qg_user') || 'null'); } catch { return null; }
  });
  const [isProUser, setIsProUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qg_pro') || 'false'); } catch { return false; }
  });
  const [tab, setTab] = useState('home');
  const [pages, setPages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qg_pages') || '[]'); } catch { return []; }
  });
  const [quests, setQuests] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qg_quests') || '[]'); } catch { return []; }
  });
  const [owned, setOwned] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qg_owned') || '[]'); } catch { return []; }
  });
  const [silent, setSilent] = useState(true);
  const [createPage, setCreatePage] = useState(false);
  const [createQuest, setCreateQuest] = useState(false);
  const [activeGarden, setActiveGarden] = useState(null);
  const [activeTimer, setActiveTimer] = useState(null);
  const [editReward, setEditReward] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [showProUpgrade, setShowProUpgrade] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  const prevDone = useRef(false);

  // Persist to localStorage
  useEffect(() => { try { localStorage.setItem('qg_accounts', JSON.stringify(accounts)); } catch {} }, [accounts]);
  useEffect(() => { try { localStorage.setItem('qg_user', JSON.stringify(user)); } catch {} }, [user]);
  useEffect(() => { try { localStorage.setItem('qg_pro', JSON.stringify(isProUser)); } catch {} }, [isProUser]);
  useEffect(() => { try { localStorage.setItem('qg_pages', JSON.stringify(pages)); } catch {} }, [pages]);
  useEffect(() => {
    try {
      // Save all quests permanently — no pruning
      localStorage.setItem('qg_quests', JSON.stringify(quests));
    } catch (e) {
      // If storage is full, keep only completed ones (they're the history)
      try {
        const onlyCompleted = quests.filter(q => q.completed);
        const todayPending = quests.filter(q => !q.completed && q.date === today());
        localStorage.setItem('qg_quests', JSON.stringify([...onlyCompleted, ...todayPending]));
      } catch {}
    }
  }, [quests]);
  useEffect(() => { try { localStorage.setItem('qg_owned', JSON.stringify(owned)); } catch {} }, [owned]);

  const todayQ = quests.filter(q => q.date === today());
  const allDone = todayQ.length > 0 && todayQ.every(q => q.completed);
  useEffect(() => {
    if (allDone && !prevDone.current) setConfetti(true);
    prevDone.current = allDone;
  }, [allDone]);

  const completeQuest = (id, studyMinutes = 0) => {
    const q = quests.find(q => q.id === id);
    if (!q || q.completed) return;
    if (isProUser) {
      const el = getAllItems().find(it => it.id === q.rewardId);
      if (el) setOwned(p => [...p, { ...el, emoji: el.e, name: el.n, catKey: q.rewardCat || el.catKey }]);
    }
    setQuests(p => p.map(qItem => qItem.id === id ? { ...qItem, completed: true, studyMinutes } : qItem));
  };

  const updateUserProfile = (patch) => {
    const updated = { ...user, ...patch };
    setUser(updated);
    setAccounts(prev => prev.map(a => a.email === user.email ? { ...a, ...patch } : a));
  };

  const undoneQ = todayQ.filter(q => !q.completed).length;
  const pageObj = pages.find(p => p.id === activeGarden);
  const pagesWithCb = pages.map(p => ({ ...p, _onOpen: () => setActiveGarden(p.id) }));

  if (!user) {
    return (
      <div className="qg">
        <Styles />
        <AuthScreen
          accounts={accounts}
          onRegister={acct => setAccounts(prev => [...prev, acct])}
          onAuth={u => setUser(u)} />
      </div>
    );
  }

  const tabs = [
    { id: 'home',   icon: '📊', label: '홈' },
    { id: 'quest',  icon: '⚔️', label: '퀘스트' },
    { id: 'garden', icon: '🌿', label: '정원' },
  ];

  return (
    <div className="qg">
      <Styles />
      {/* Header */}
      <div style={{ height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', background: 'white', borderBottom: `1.5px solid ${BD}`, zIndex: 10, position: 'relative', gap: 8 }}>
        <div style={{ fontWeight: 900, fontSize: 14, background: `linear-gradient(135deg,${PD},${GD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', flexShrink: 0 }}>🌱 Quest Garden</div>
        <div style={{ display: 'flex', gap: 2, background: PP, borderRadius: 10, padding: '2px' }}>
          {tabs.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 11px', borderRadius: 8, border: 'none', background: tab === id ? 'white' : 'transparent', color: tab === id ? P : '#9CA3AF', fontWeight: 800, fontSize: 11, boxShadow: tab === id ? '0 2px 6px rgba(124,58,237,.1)' : 'none', transition: 'all .2s', position: 'relative', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 12 }}>{icon}</span>{label}
              {id === 'quest' && undoneQ > 0 && <div style={{ position: 'absolute', top: 3, right: 3, width: 6, height: 6, borderRadius: '50%', background: G, border: '2px solid white' }} />}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {isProUser
            ? <span style={{ fontSize: 9, fontWeight: 900, background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: 'white', padding: '2px 6px', borderRadius: 5 }}>PRO</span>
            : <button onClick={() => setShowProUpgrade(true)} style={{ fontSize: 10, fontWeight: 900, background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: 'white', padding: '4px 8px', borderRadius: 7, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>✨ PRO</button>
          }
          <button onClick={() => setShowProfile(true)} style={{ fontSize: 12, fontWeight: 800, color: PM, background: PL, padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>{user.avatar ? <img src={user.avatar} style={{width:20,height:20,borderRadius:'50%',objectFit:'cover'}} alt=''/> : <span style={{fontSize:16}}>👤</span>}{user.nickname || user.name}</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {tab === 'home' && <StatsScreen quests={quests} />}
        {tab === 'quest' && (
          <QuestScreen quests={quests} silent={silent} isProUser={isProUser}
            onToggleSilent={() => setSilent(s => !s)}
            onOpenTimer={q => setActiveTimer(q)}
            onEditReward={q => setEditReward(q)} />
        )}
        {tab === 'garden' && (
          <GardenScreen isProUser={isProUser} pages={pagesWithCb} owned={owned} customCategories={customCategories}
            onNewPage={() => setCreatePage(true)}
            onOpenPage={id => setActiveGarden(id)}
            onShowProUpgrade={() => setShowProUpgrade(true)} />
        )}

        {/* FAB – context-aware */}
        {tab === 'quest' && (
          <button
            onClick={() => setCreateQuest(true)}
            style={{ position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 18, background: `linear-gradient(145deg,${P},${G})`, border: 'none', color: 'white', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px rgba(124,58,237,.45)', zIndex: 15, cursor: 'pointer' }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.91)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
            +
          </button>
        )}
        {tab === 'garden' && isProUser && (
          <GardenFab
            onTheme={() => setCreatePage(true)}
            onAI={() => setShowAIChat(true)} />
        )}

        {/* Modals */}
        {createPage && (
          <CreatePageModal isProUser={isProUser}
            onNeedPro={() => { setCreatePage(false); setShowProUpgrade(true); }}
            onOpenAIChat={() => { setCreatePage(false); setShowAIChat(true); }}
            onConfirm={p => { setPages(prev => [...prev, { id: uid(), ...p }]); setCreatePage(false); }}
            onCancel={() => setCreatePage(false)} />
        )}
        {createQuest && (
          <CreateQuestModal isProUser={isProUser}
            onConfirm={nQ => { setQuests(p => [...p.filter(q => !(q.date === today() && !q.completed)), ...nQ]); setCreateQuest(false); }}
            onCancel={() => setCreateQuest(false)} />
        )}
        {editReward && isProUser && (
          <EditRewardModal quest={editReward}
            onSave={(id, catKey) => { setQuests(p => p.map(q => q.id === editReward.id ? { ...q, rewardId: id, rewardCat: catKey } : q)); setEditReward(null); }}
            onCancel={() => setEditReward(null)} />
        )}

        {/* Overlays */}
        {pageObj && (
          <GardenDetail page={pageObj} owned={owned} customCategories={customCategories}
            onClose={() => setActiveGarden(null)}
            onUpdate={u => setPages(p => p.map(x => x.id === u.id ? u : x))} />
        )}
        {activeTimer && (
          <TimerScreen quest={activeTimer} silentMode={silent} isProUser={isProUser}
            onComplete={(mins) => { completeQuest(activeTimer.id, mins); setActiveTimer(null); }}
            onBack={() => setActiveTimer(null)} />
        )}
        {confetti && <Confetti onDone={() => setConfetti(false)} />}

        {/* Profile Page */}
        {showProfile && (
          <ProfilePage
            user={user}
            isProUser={isProUser}
            quests={quests}
            onBack={() => setShowProfile(false)}
            onUpdate={updateUserProfile}
            onLogout={() => { setUser(null); setShowProfile(false); }}
            onShowProUpgrade={() => { setShowProfile(false); setShowProUpgrade(true); }} />
        )}

        {/* Pro Upgrade Overlay */}
        {showProUpgrade && (
          <ProUpgradePage
            userName={user.name}
            onBack={() => setShowProUpgrade(false)}
            onUpgrade={() => { setIsProUser(true); setShowProUpgrade(false); }}
          />
        )}

        {/* AI Chat Overlay */}
        {showAIChat && (
          <AIChatPage
            pages={pages}
            onBack={() => setShowAIChat(false)}
            onCreatePage={(p, cats) => {
              setPages(prev => [...prev, { id: p.id, ...p }]);
              if (cats && cats.length) setCustomCategories(prev => [...prev, ...cats]);
            }}
            onDeletePages={(ids) => {
              setPages(prev => prev.filter(p => !ids.includes(p.id)));
            }}
          />
        )}
      </div>
    </div>
  );
}