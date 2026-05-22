import { useState, useEffect, useRef } from "react";

/* ── COLORS ── */
const P = '#7C3AED', PD = '#5B21B6', PM = '#6D28D9', PL = '#EDE9FE', PP = '#F5F3FF';
const G = '#10B981', GD = '#059669', GL = '#D1FAE5';
const BD = 'rgba(124,58,237,0.13)';

/* ── Supabase 연결 ── */
const SB_URL = 'https://gzusdoyfjjgarjxescog.supabase.co';
const SB_KEY = 'sb_publishable_3ZsSoIoB-PZeLYGAZNWGrw_cGCXpkOt';
const sbFetch = (path, options = {}) => fetch(SB_URL + path, {
  ...options,
  headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', ...(options.headers || {}) }
});

const track = (eventName, params = {}) => {
  try {
    const logs = JSON.parse(localStorage.getItem('qg_event_logs') || '[]');
    logs.push({ event: eventName, params, time: Date.now() });
    if (logs.length > 500) logs.splice(0, logs.length - 500);
    localStorage.setItem('qg_event_logs', JSON.stringify(logs));
    sbFetch('/rest/v1/qg_events', {
      method: 'POST',
      headers: { 'Prefer': 'return=minimal' },
      body: JSON.stringify({ event_name: eventName, params })
    }).catch(() => {});
  } catch (e) {}
};

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
        const bc = isDark ? ['#0D1829','#0E1B2C','#091523','#0C1A28','#0F1D30'][i % 5] : ['#8898AA','#7A8FA5','#95A8B5','#6D8498','#8BADBE'][i % 5];
        const ty = gy - h, wc = Math.max(2, Math.floor(w / 22)), wr = Math.max(2, Math.floor(h / 22));
        return (
          <g key={i}>
            <rect x={x} y={ty} width={w} height={h} fill={bc} />
            {i % 4 === 0 && <rect x={x + w / 2 - 2} y={ty - 14} width={4} height={14} fill={bc} />}
            {Array.from({ length: wr }, (_, r) =>
              Array.from({ length: wc }, (_, c) => {
                const lit = isDark ? rn(i * 17 + r * 7 + c * 3) > 0.36 : true;
                return lit ? (
                  <rect key={`${r}-${c}`} x={x + 7 + c * (w - 14) / wc} y={ty + 9 + r * 21}
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
      </defs>
      <rect width="1024" height="580" fill="url(#spbg)" />
      {Array.from({ length: 120 }, (_, i) => (
        <circle key={i} cx={rn(i * 7) * 1024} cy={rn(i * 13) * 580}
          r={0.3 + rn(i * 3) * 1.7} fill="white" opacity={0.28 + rn(i * 11) * 0.68} />
      ))}
      <circle cx="820" cy="148" r="78" fill="#9C27B0" opacity=".9" />
      <ellipse cx="820" cy="148" rx="122" ry="19" fill="none" stroke="#CE93D8" strokeWidth="11" opacity=".7" />
      <rect x="0" y="528" width="1024" height="52" fill="#1A1A2E" />
    </svg>
  );
}

function OceanBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="ocsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#006064" /><stop offset="100%" stopColor="#00BCD4" />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#ocsky)" />
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
          <stop offset="100%" stopColor={isDark ? '#3E1A00' : '#FFB300'} />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#dsky)" />
      <rect x="0" y="478" width="1024" height="102" fill={isDark ? '#3D1600' : '#FF8F00'} />
    </svg>
  );
}

function FantasyBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="fanbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A0030" /><stop offset="100%" stopColor="#6A00B0" />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#fanbg)" />
      {Array.from({ length: 80 }, (_, i) => (
        <circle key={i} cx={rn(i * 7) * 1024} cy={rn(i * 13) * 450}
          r={0.4 + rn(i * 3) * 1.9} fill={['#FFF','#FFD700','#E0B0FF','#B0E0FF'][i % 4]}
          opacity={0.28 + rn(i * 11) * 0.68} />
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
          <stop offset="0%" stopColor="#FCE4EC" /><stop offset="100%" stopColor="#F48FB1" />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#saksky)" />
      <rect x="0" y="478" width="1024" height="102" fill="#E8F5E9" />
    </svg>
  );
}

function RainBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#455A64" /><stop offset="100%" stopColor="#607D8B" />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#rsky)" />
      {Array.from({ length: 80 }, (_, i) => (
        <line key={i} x1={rn(i * 7) * 1024} y1={rn(i * 13) * 498}
          x2={rn(i * 7) * 1024 - 7} y2={rn(i * 13) * 498 + 19}
          stroke="#B0BEC5" strokeWidth="1.2" opacity={0.36 + rn(i * 3) * 0.46} />
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
          <stop offset="0%" stopColor="#1A237E" /><stop offset="42%" stopColor="#E53935" />
          <stop offset="78%" stopColor="#FFB74D" /><stop offset="100%" stopColor="#FFD54F" />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#susetsky)" />
      <circle cx="512" cy="490" r="80" fill="#FFD54F" opacity=".94" />
      <polygon points="0,490 148,418 300,458 448,388 512,408 608,368 712,428 858,398 1024,448 1024,490" fill="#1A237E" opacity=".82" />
    </svg>
  );
}

function MediterraneanBg() {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="mdsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1565C0" /><stop offset="100%" stopColor="#0277BD" />
        </linearGradient>
        <linearGradient id="mdsea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#006994" /><stop offset="100%" stopColor="#29B6F6" />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#mdsky)" />
      <circle cx="880" cy="80" r="58" fill="#FFF176" opacity=".92" />
      <rect x="0" y="390" width="1024" height="190" fill="url(#mdsea)" />
      <rect x="340" y="208" width="440" height="196" rx="4" fill="#FAFAFA" />
      <rect x="328" y="190" width="368" height="30" rx="3" fill="#E64A19" />
    </svg>
  );
}

function YardBg({ isDark }) {
  return (
    <svg viewBox="0 0 1024 580" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="ydsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? '#0A0A1A' : '#E3F2FD'} />
          <stop offset="100%" stopColor={isDark ? '#1A1A3A' : '#90CAF9'} />
        </linearGradient>
        <linearGradient id="ydgrass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? '#1A2E1A' : '#66BB6A'} />
          <stop offset="100%" stopColor={isDark ? '#0F1F0F' : '#388E3C'} />
        </linearGradient>
      </defs>
      <rect width="1024" height="580" fill="url(#ydsky)" />
      <rect x="292" y="208" width="440" height="196" fill={isDark ? '#2C2C3E' : '#FAFAFA'} />
      <polygon points="292,210 512,100 732,210" fill={isDark ? '#1A2535' : '#37474F'} />
      <rect x="0" y="476" width="1024" height="104" fill="url(#ydgrass)" />
    </svg>
  );
}

function ThemeBg({ themeId, isDark }) {
  const map = {
    city: <CityBg isDark={isDark} />, nature: <NatureBg />, forest: <ForestBg />,
    spring: <SpringBg />, summer: <SummerBg />, autumn: <AutumnBg />, winter: <WinterBg />,
    space: <SpaceBg />, ocean: <OceanBg />, desert: <DesertBg isDark={isDark} />,
    fantasy: <FantasyBg />, sakura: <SakuraBg />, rain: <RainBg />, sunset: <SunsetBg />,
    yard: <YardBg isDark={isDark} />, mediter: <MediterraneanBg />,
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
  return <div style={{ fontSize: 12, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>{children}</div>;
}

function FieldInput({ value, onChange, placeholder, type = 'text', mb = 14, rows }) {
  const style = { width: '100%', padding: '11px 13px', border: `2px solid ${BD}`, borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#1E1B4B', marginBottom: mb, background: '#F8F7FF' };
  const handlers = {
    onFocus: e => { e.target.style.border = `2px solid ${P}`; },
    onBlur: e => { e.target.style.border = `2px solid ${BD}`; },
  };
  if (rows) return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...style, resize: 'none', lineHeight: 1.6 }} {...handlers} />;
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type} style={style} {...handlers} />;
}

/* ── AUTH SCREEN ── */
function AuthScreen({ onAuth, accounts, onRegister }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [uname, setUname] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    setErr('');
    if (!email.trim()) { setErr('이메일을 입력해주세요.'); return; }
    if (!pw.trim()) { setErr('비밀번호를 입력해주세요.'); return; }
    if (tab === 'login') {
      const acct = accounts.find(a => a.email === email.trim());
      if (!acct) { setErr('등록되지 않은 이메일이에요.'); return; }
      if (acct.pw !== pw) { setErr('비밀번호가 올바르지 않아요.'); return; }
      track('login', { method: 'email' });
      onAuth({ name: acct.name, email: acct.email, nickname: acct.nickname || acct.name });
    } else {
      if (!uname.trim()) { setErr('사용자 이름을 입력해주세요.'); return; }
      if (accounts.find(a => a.email === email.trim())) { setErr('이미 가입된 이메일이에요.'); return; }
      const newAcct = { email: email.trim(), name: uname.trim(), nickname: uname.trim(), pw, avatar: null };
      track('sign_up', { method: 'email' });
      onRegister(newAcct);
      onAuth({ name: uname.trim(), email: email.trim(), nickname: uname.trim() });
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse 130% 82% at 50% -8%,${PL} 0%,#F5F3FF 60%)`, position: 'relative', overflow: 'hidden', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="qg-fu" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="qg-bi" style={{ fontSize: 66, marginBottom: 8 }}>🌱</div>
          <div style={{ fontWeight: 900, fontSize: 28, background: `linear-gradient(135deg,${PD},${GD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Quest Garden</div>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 5, fontWeight: 600 }}>퀘스트를 완료하고 나만의 정원을 꾸며요</p>
        </div>
        <div className="qg-fu" style={{ background: 'white', borderRadius: 24, padding: 26, boxShadow: '0 8px 40px rgba(124,58,237,.13)', border: `1px solid ${BD}`, animationDelay: '.1s' }}>
          <div style={{ display: 'flex', background: PP, borderRadius: 13, padding: 4, marginBottom: 22 }}>
            {[['login','로그인'],['signup','가입하기']].map(([t, lbl]) => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: tab === t ? 'white' : 'transparent', color: tab === t ? P : '#9CA3AF', fontWeight: 800, fontSize: 14, boxShadow: tab === t ? '0 2px 8px rgba(124,58,237,.12)' : 'none', transition: 'all .2s' }}>{lbl}</button>
            ))}
          </div>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>✉️</span>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일 주소" type="email"
              style={{ width: '100%', padding: '12px 13px 12px 40px', border: `2px solid ${BD}`, borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#1E1B4B', background: '#F8F7FF' }}
              onFocus={e => { e.target.style.border = `2px solid ${P}`; }} onBlur={e => { e.target.style.border = `2px solid ${BD}`; }} />
          </div>
          {tab === 'signup' && (
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>👤</span>
              <input value={uname} onChange={e => setUname(e.target.value)} placeholder="사용자 이름"
                style={{ width: '100%', padding: '12px 13px 12px 40px', border: `2px solid ${BD}`, borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#1E1B4B', background: '#F8F7FF' }}
                onFocus={e => { e.target.style.border = `2px solid ${P}`; }} onBlur={e => { e.target.style.border = `2px solid ${BD}`; }} />
            </div>
          )}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔑</span>
            <input value={pw} onChange={e => setPw(e.target.value)} placeholder="비밀번호" type="password"
              onKeyDown={e => e.key === 'Enter' && submit()}
              style={{ width: '100%', padding: '12px 13px 12px 40px', border: `2px solid ${BD}`, borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#1E1B4B', background: '#F8F7FF' }}
              onFocus={e => { e.target.style.border = `2px solid ${P}`; }} onBlur={e => { e.target.style.border = `2px solid ${BD}`; }} />
          </div>
          {err && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#DC2626', fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>{err}</div>}
          <button onClick={submit} style={{ width: '100%', padding: 14, border: 'none', borderRadius: 12, background: `linear-gradient(135deg,${P},${G})`, color: 'white', fontSize: 15, fontWeight: 800 }}>
            {tab === 'login' ? '로그인하기 →' : '가입하기 →'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── CREATE PAGE MODAL ── */
function CreatePageModal({ onConfirm, onCancel, isProUser, onNeedPro }) {
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('city');
  const [isDark, setIsDark] = useState(false);
  const th = THEMES[theme];

  return (
    <ModalSheet onClose={onCancel}>
      <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 3 }}>새 정원 만들기 🌱</div>
      <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 600, marginBottom: 18 }}>나만의 공간을 꾸며보세요</div>
      <FieldLabel>페이지 제목</FieldLabel>
      <FieldInput value={title} onChange={setTitle} placeholder="예: 나의 도시 정원" />
      <FieldLabel>테마 선택</FieldLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 16 }}>
        {Object.entries(THEMES).map(([k, v]) => (
          <button key={k} onClick={() => setTheme(k)} style={{ border: `2px solid ${theme === k ? P : BD}`, borderRadius: 11, padding: '7px 3px', background: theme === k ? PL : '#F8F7FF', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
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
      <div style={{ borderRadius: 14, overflow: 'hidden', height: 130, position: 'relative', marginBottom: 18 }}>
        <ThemeBg themeId={theme} isDark={isDark} />
        <div style={{ position: 'absolute', bottom: 8, left: 10, background: 'rgba(0,0,0,.35)', borderRadius: 8, padding: '4px 10px', color: 'white', fontSize: 13, fontWeight: 700, backdropFilter: 'blur(4px)' }}>
          {th && th.e} {title || (th && th.n)} 미리보기
        </div>
      </div>
      <MBtns onCancel={onCancel} onConfirm={() => { if (title.trim()) onConfirm({ title: title.trim(), theme, isDark, elements: [] }); }} />
    </ModalSheet>
  );
}

/* ── CREATE QUEST MODAL ── */
function CreateQuestModal({ onConfirm, onCancel, isProUser, routines, onSaveRoutine }) {
  const [todos, setTodos] = useState(['']);
  const [rewards, setRewards] = useState([rndRewardFull()]);
  const [editIdx, setEditIdx] = useState(null);
  const [catFil, setCatFil] = useState(null);
  const [showRoutines, setShowRoutines] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [savingRoutine, setSavingRoutine] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const add = () => { if (todos.length >= 10) return; setTodos([...todos, '']); setRewards([...rewards, rndRewardFull()]); };
  const del = (i) => { if (todos.length === 1) return; setTodos(todos.filter((_, j) => j !== i)); setRewards(rewards.filter((_, j) => j !== i)); };
  const confirm = () => {
    const pairs = todos.map((t, i) => ({ t: t.trim(), r: rewards[i] })).filter(p => p.t);
    if (!pairs.length) return;
    if (isProUser) {
      onConfirm(pairs.map(p => ({ id: uid(), title: p.t, rewardId: p.r.id, rewardCat: p.r.catKey, completed: false, date: today() })));
    } else {
      onConfirm(pairs.map(p => ({ id: uid(), title: p.t, rewardId: null, rewardCat: null, completed: false, date: today() })));
    }
  };
  const loadRoutine = (r) => {
    setTodos(r.todos);
    setRewards(r.rewards ? r.rewards.map(rw => rw || rndRewardFull()) : r.todos.map(() => rndRewardFull()));
    setShowRoutines(false);
  };
  const saveAsRoutine = () => {
    const validTodos = todos.filter(t => t.trim());
    if (!validTodos.length || !routineName.trim()) return;
    onSaveRoutine({ id: uid(), name: routineName.trim(), todos: validTodos, rewards });
    setRoutineName(''); setSavingRoutine(false);
  };
  const deleteRoutine = (id) => {
    onSaveRoutine({ __delete: true, id });
    setDeleteConfirmId(null);
  };

  const allIt = getAllItems();
  const filtered = catFil ? allIt.filter(it => it.catKey === catFil) : allIt;
  const hasRoutines = (routines || []).length > 0;

  return (
    <ModalSheet onClose={onCancel}>
      {/* 헤더 영역 — 제목 + 내 루틴 버튼 나란히 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontWeight: 900, fontSize: 20 }}>오늘의 할일 ⚔️</div>
        {hasRoutines && (
          <button
            onClick={() => { setShowRoutines(s => !s); setSavingRoutine(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 13px', borderRadius: 20,
              border: `2px solid ${showRoutines ? P : BD}`,
              background: showRoutines ? P : 'white',
              color: showRoutines ? 'white' : PD,
              fontSize: 12, fontWeight: 800, cursor: 'pointer',
              transition: 'all .18s',
              boxShadow: showRoutines ? '0 2px 10px rgba(124,58,237,.25)' : 'none',
            }}>
            📋 내 루틴
            <span style={{
              background: showRoutines ? 'rgba(255,255,255,.28)' : PL,
              color: showRoutines ? 'white' : PD,
              borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 900,
            }}>{(routines||[]).length}</span>
          </button>
        )}
      </div>
      <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 600, marginBottom: 14 }}>
        {isProUser ? '완료하면 정원 요소를 획득해요! (최대 10개)' : '오늘 할일을 입력하세요 (최대 10개)'}
      </div>

      {/* 내 루틴 드롭다운 */}
      {showRoutines && hasRoutines && (
        <div style={{ background: PP, border: `1.5px solid ${BD}`, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '10px 14px 6px', fontSize: 10, fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>저장된 루틴</div>
          {(routines||[]).map((r, idx) => (
            <div key={r.id} style={{ padding: '10px 14px', background: 'white', borderTop: idx === 0 ? 'none' : `1px solid ${BD}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* 루틴 아이콘 */}
              <div style={{ width: 36, height: 36, borderRadius: 11, background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📋</div>
              {/* 루틴 정보 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1E1B4B', marginBottom: 2 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.todos.slice(0,3).join(' · ')}{r.todos.length > 3 ? ` 외 ${r.todos.length - 3}개` : ''}
                </div>
              </div>
              {/* 할일 개수 뱃지 */}
              <span style={{ fontSize: 10, fontWeight: 900, background: PL, color: PD, borderRadius: 20, padding: '3px 8px', flexShrink: 0 }}>{r.todos.length}개</span>
              {/* 불러오기 버튼 */}
              <button onClick={() => loadRoutine(r)}
                style={{ padding: '6px 13px', borderRadius: 9, border: 'none', background: `linear-gradient(135deg,${P},${PM})`, color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>
                불러오기
              </button>
              {/* 삭제 버튼 */}
              {deleteConfirmId === r.id ? (
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => deleteRoutine(r.id)} style={{ padding: '5px 10px', borderRadius: 8, border: 'none', background: '#EF4444', color: 'white', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>삭제</button>
                  <button onClick={() => setDeleteConfirmId(null)} style={{ padding: '5px 8px', borderRadius: 8, border: `1px solid ${BD}`, background: 'none', color: '#6B7280', fontSize: 11, cursor: 'pointer' }}>취소</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirmId(r.id)} style={{ background: 'none', border: 'none', color: '#D1D5DB', fontSize: 15, cursor: 'pointer', padding: '2px 4px', flexShrink: 0 }} title="삭제">🗑️</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 루틴 저장 토글 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={() => { setSavingRoutine(s => !s); setShowRoutines(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 20, border: `1.5px solid ${savingRoutine ? G : BD}`, background: savingRoutine ? GL : 'white', color: savingRoutine ? GD : '#9CA3AF', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
          💾 루틴으로 저장
        </button>
      </div>

      {savingRoutine && (
        <div style={{ background: '#F0FDF4', border: `1.5px solid ${G}`, borderRadius: 12, padding: 12, marginBottom: 14, display: 'flex', gap: 8 }}>
          <input value={routineName} onChange={e => setRoutineName(e.target.value)} placeholder="루틴 이름 (예: 수능 루틴)"
            style={{ flex: 1, padding: '8px 11px', border: `1.5px solid ${G}`, borderRadius: 9, fontSize: 13, fontWeight: 600, color: '#1E1B4B' }}
            onKeyDown={e => e.key === 'Enter' && saveAsRoutine()}/>
          <button onClick={saveAsRoutine} style={{ padding: '8px 14px', borderRadius: 9, border: 'none', background: G, color: 'white', fontSize: 13, fontWeight: 800 }}>저장</button>
          <button onClick={() => setSavingRoutine(false)} style={{ padding: '8px 10px', borderRadius: 9, border: `1.5px solid ${BD}`, background: 'none', fontSize: 13, color: '#6B7280' }}>✕</button>
        </div>
      )}
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
          style={{ width: '100%', padding: 10, border: `2px dashed ${BD}`, borderRadius: 11, background: 'none', color: '#9CA3AF', fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
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
function GardenDetail({ page, owned, customCategories, onClose, onUpdate, onDelete }) {
  const [edit, setEdit] = useState(false);
  const [els, setEls] = useState(page.elements || []);
  const [selId, setSelId] = useState(null);
  const [catFil, setCatFil] = useState(null);
  const [isDark, setIsDark] = useState(page.isDark || false);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [sizePickerEl, setSizePickerEl] = useState(null);
  const [pickerSize, setPickerSize] = useState(42);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const cvRef = useRef(null);
  const drg = useRef(null);
  const th = THEMES[page.theme] || THEMES.nature;

  const save = (newEls, newDark) => {
    onUpdate({ ...page, elements: newEls !== undefined ? newEls : els, isDark: newDark !== undefined ? newDark : isDark });
  };

  const addEl = (el) => { setPickerSize(42); setSizePickerEl(el); };

  const confirmAddEl = () => {
    const c = cvRef.current, w = c ? c.offsetWidth : 900, h = c ? c.offsetHeight : 500;
    const el = sizePickerEl;
    const ne = { id: uid(), emoji: el.e || el.emoji, name: el.n || el.name, catKey: el.catKey, x: 20 + Math.random() * (w - 120), y: 20 + Math.random() * (h - 120), size: pickerSize };
    const u = [...els, ne];
    setEls(u); save(u); setSizePickerEl(null);
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
  const onRightClick = (e, id) => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ id, x: e.clientX, y: e.clientY }); setSelId(id); };

  const enriched = owned.map(el => {
    const cat = Object.entries(RCATS).find(([, v]) => v.items.find(it => it.id === el.id));
    return { ...el, catKey: cat ? cat[0] : null };
  });
  const customCats = (customCategories || []);
  const filtOwned = catFil
    ? (catFil.startsWith('__custom__')
        ? (customCats.find(c => c.key === catFil.replace('__custom__',''))?.items || []).map(it => ({ ...it, emoji: it.e, name: it.n, catKey: catFil }))
        : enriched.filter(el => el.catKey === catFil))
    : [...enriched, ...customCats.flatMap(c => c.items.map(it => ({ ...it, emoji: it.e, name: it.n, catKey: '__custom__' + c.key })))];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 54, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: 'rgba(0,0,0,.28)', backdropFilter: 'blur(12px)', color: 'white', gap: 8 }}>
        <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(255,255,255,.2)', border: 'none', color: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>←</button>
        <span style={{ fontWeight: 800, fontSize: 15, flex: 1, textAlign: 'center' }}>{th.e} {page.title}</span>
        {th.hasDN && <button onClick={toggleDark} style={{ padding: '5px 11px', borderRadius: 9, background: 'rgba(255,255,255,.18)', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{isDark ? '🌙 밤' : '☀️ 낮'}</button>}
        <button onClick={() => { setEdit(!edit); setSelId(null); }} style={{ padding: '6px 13px', borderRadius: 10, background: edit ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.2)', border: 'none', color: edit ? PD : 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{edit ? '완료' : '✏️ 수정'}</button>
        <button onClick={() => setShowDeleteConfirm(true)} style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(239,68,68,.25)', border: '1px solid rgba(239,68,68,.4)', color: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>🗑️</button>
      </div>
      <div ref={cvRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', touchAction: 'none' }}
        onMouseMove={onMM} onMouseUp={onMU} onTouchMove={onTM} onTouchEnd={onMU}
        onClick={() => { setSelId(null); setCtxMenu(null); }}
        onContextMenu={e => e.preventDefault()}>
        <div style={{ position: 'absolute', inset: 0 }}><ThemeBg themeId={page.theme} isDark={isDark} /></div>
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
        {ctxMenu && (
          <div style={{ position: 'absolute', left: Math.min(ctxMenu.x - (cvRef.current?.getBoundingClientRect().left || 0), (cvRef.current?.offsetWidth || 400) - 160), top: Math.max(ctxMenu.y - (cvRef.current?.getBoundingClientRect().top || 0) - 10, 10), background: 'rgba(15,10,30,0.92)', backdropFilter: 'blur(12px)', borderRadius: 14, padding: '6px', zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', minWidth: 150 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '4px 10px 8px', fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>요소 편집</div>
            {[{ icon: '🔍+', label: '크게', action: () => rsz(ctxMenu.id, 12) }, { icon: '🔍−', label: '작게', action: () => rsz(ctxMenu.id, -12) }, { icon: '🗑️', label: '삭제', action: () => delEl(ctxMenu.id), danger: true }].map(item => (
              <button key={item.label} onClick={item.action} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'none', border: 'none', color: item.danger ? '#FF6B6B' : 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', borderRadius: 9, textAlign: 'left' }}
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
      {sizePickerEl && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'rgba(10,5,30,.65)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: 480, background: 'white', borderRadius: '24px 24px 0 0', padding: '24px 24px 40px' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E5E7EB', margin: '0 auto 20px' }} />
            <div style={{ fontWeight: 900, fontSize: 17, color: '#1E1B4B', marginBottom: 4, textAlign: 'center' }}>크기 조정</div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 96, marginBottom: 18 }}>
              <span style={{ fontSize: pickerSize, lineHeight: 1, transition: 'font-size .18s' }}>{sizePickerEl.e || sizePickerEl.emoji}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, justifyContent: 'center' }}>
              {[{ label: 'S', size: 24 }, { label: 'M', size: 42 }, { label: 'L', size: 64 }, { label: 'XL', size: 90 }].map(({ label, size }) => (
                <button key={label} onClick={() => setPickerSize(size)}
                  style={{ width: 60, height: 60, borderRadius: 16, border: `2px solid ${pickerSize === size ? P : BD}`, background: pickerSize === size ? PL : 'white', color: pickerSize === size ? PD : '#6B7280', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}>
                  {label}<br/><span style={{ fontSize: 9 }}>{size}px</span>
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 24, padding: '0 4px' }}>
              <input type="range" min="18" max="120" value={pickerSize} onChange={e => setPickerSize(Number(e.target.value))} style={{ width: '100%', accentColor: P, cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginTop: 4 }}>
                <span>작게</span><span style={{ fontWeight: 900, color: PD }}>{pickerSize}px</span><span>크게</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSizePickerEl(null)} style={{ flex: 1, padding: '13px', borderRadius: 14, border: `1.5px solid ${BD}`, background: 'none', fontSize: 14, fontWeight: 700, color: '#6B7280', cursor: 'pointer' }}>취소</button>
              <button onClick={confirmAddEl} style={{ flex: 2, padding: '13px', borderRadius: 14, border: 'none', background: `linear-gradient(135deg,${P},${G})`, color: 'white', fontSize: 14, fontWeight: 900, cursor: 'pointer' }}>✅ 이 크기로 배치하기</button>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'rgba(10,5,30,.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 22, padding: 28, width: '100%', maxWidth: 340 }}>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 14 }}>🗑️</div>
            <div style={{ fontWeight: 900, fontSize: 18, color: '#1E1B4B', textAlign: 'center', marginBottom: 10 }}>정원을 삭제할까요?</div>
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '8px 14px', marginBottom: 22, fontSize: 12, color: '#DC2626', fontWeight: 700, textAlign: 'center' }}>이 작업은 되돌릴 수 없어요.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: 13, borderRadius: 12, border: `1.5px solid ${BD}`, background: 'none', fontSize: 14, fontWeight: 700, color: '#6B7280', cursor: 'pointer' }}>취소</button>
              <button onClick={() => { setShowDeleteConfirm(false); onDelete(page.id); onClose(); }} style={{ flex: 1, padding: 13, borderRadius: 12, border: 'none', background: '#EF4444', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>삭제하기</button>
            </div>
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
  const endTimeRef = useRef(null);
  const iv = useRef(null);
  const doneRef = useRef(false);

  const tick = () => {
    if (!endTimeRef.current) return;
    const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
    setRem(left);
    if (left <= 0 && !doneRef.current) {
      doneRef.current = true;
      clearInterval(iv.current);
      setPhase('done');
      if (silentMode) beep();
      else { setIsFlash(true); setTimeout(() => setIsFlash(false), 3200); }
    }
  };

  const startCD = (seconds) => {
    clearInterval(iv.current);
    doneRef.current = false;
    endTimeRef.current = Date.now() + seconds * 1000;
    setRem(seconds);
    iv.current = setInterval(tick, 300);
  };

  useEffect(() => {
    const onVis = () => { if (!document.hidden && phase === 'running') tick(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [phase]);

  const start = () => {
    const m = parseInt(mins) || 0, s = parseInt(secs) || 0, tot = m * 60 + s;
    if (tot <= 0) return;
    track('timer_start', { duration_minutes: Math.round(tot / 60), quest_title: quest.title });
    setTotal(tot); setPhase('running'); startCD(tot);
  };

  const addTime = () => {
    const m = parseInt(addM) || 0, s = parseInt(addS) || 0, ex = m * 60 + s;
    if (ex <= 0) return;
    setTotal(t => t + ex);
    const nr = rem + ex;
    doneRef.current = false;
    setPhase('running'); startCD(nr);
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
            {numIn(mins, setMins, '25', 180)}<span style={{ fontSize: 19, opacity: 0.7 }}>분</span>
            {numIn(secs, setSecs, '00', 59)}<span style={{ fontSize: 19, opacity: 0.7 }}>초</span>
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
              : tb('▶ 재개', () => { setPhase('running'); startCD(rem); }, true)}
          </div>
        </>
      )}
      {phase === 'done' && (
        <>
          <div className="qg-pop" style={{ fontSize: 54, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>완료!</div>
          <p style={{ fontSize: 14, opacity: 0.72, fontWeight: 600, marginBottom: 22, textAlign: 'center' }}>{quest.title} 퀘스트가 끝났어요</p>
          {isProUser ? (
            <>
              <div style={{ background: 'rgba(255,255,255,.13)', borderRadius: 20, padding: '18px 28px', marginBottom: 22, textAlign: 'center', border: '2px solid rgba(255,255,255,.22)', width: '100%', maxWidth: 320 }}>
                <p style={{ fontSize: 13, opacity: 0.72, fontWeight: 700, marginBottom: 10 }}>보상을 획득하시겠습니까?</p>
                <div style={{ fontSize: 46, marginBottom: 6 }}>{el ? el.e : '🎁'}</div>
                <p style={{ fontWeight: 900, fontSize: 16 }}>{el ? el.n : '보상 요소'}</p>
              </div>
              <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 310, marginBottom: 14 }}>
                {tb('건너뛰기', () => onBack(), false)}
                {tb('획득하기 🎁', () => { track('timer_complete', { quest_title: quest.title, minutes: Math.floor(total/60), reward_obtained: true }); onComplete(Math.max(0, Math.floor(total / 60))); }, true)}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 310, marginBottom: 14 }}>
              {tb('완료! ✓', () => { track('timer_complete', { quest_title: quest.title, minutes: Math.floor(total/60), reward_obtained: false }); onComplete(Math.max(0, Math.floor(total / 60))); }, true)}
            </div>
          )}
          <button onClick={() => setShowAdd(s => !s)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ 시간 더 추가하기</button>
          {showAdd && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {numIn(addM, setAddM, '10', 180)}<span style={{ fontSize: 19, opacity: 0.7 }}>분</span>
                {numIn(addS, setAddS, '00', 59)}<span style={{ fontSize: 19, opacity: 0.7 }}>초</span>
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

/* ── STATS SCREEN ── */
function StatsScreen({ quests }) {
  const [view, setView] = useState('month');
  const [selectedDay, setSelectedDay] = useState(null);
  const [browseYr, setBrowseYr] = useState(new Date().getFullYear());
  const [browseMo, setBrowseMo] = useState(new Date().getMonth());

  const now = new Date();
  const yr = browseYr, mo = browseMo;
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const moNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const fmtMin = m => m >= 60 ? `${Math.floor(m/60)}시간 ${m%60}분` : `${m}분`;

  const parseDate = d => { if (!d) return new Date(0); const p = new Date(d); return isNaN(p.getTime()) ? new Date(0) : p; };
  const allCompleted = quests.filter(q => q.completed);
  const moCompleted = allCompleted.filter(q => { const d = parseDate(q.date); return d.getFullYear() === yr && d.getMonth() === mo; });
  const dayCounts = {}, dayMins = {}, dayQuests = {};
  moCompleted.forEach(q => { const day = parseDate(q.date).getDate(); dayCounts[day] = (dayCounts[day] || 0) + 1; dayMins[day] = (dayMins[day] || 0) + (q.studyMinutes || 0); if (!dayQuests[day]) dayQuests[day] = []; dayQuests[day].push(q); });
  const yrCompleted = allCompleted.filter(q => parseDate(q.date).getFullYear() === yr);
  const moCounts = Array(12).fill(0), moMins = Array(12).fill(0), moQuestMap = {};
  yrCompleted.forEach(q => { const m = parseDate(q.date).getMonth(); moCounts[m]++; moMins[m] += (q.studyMinutes || 0); if (!moQuestMap[m]) moQuestMap[m] = []; moQuestMap[m].push(q); });

  const totalMoQ = moCompleted.length, totalMoMin = moCompleted.reduce((s, q) => s + (q.studyMinutes || 0), 0);
  const totalYrQ = yrCompleted.length, totalYrMin = yrCompleted.reduce((s, q) => s + (q.studyMinutes || 0), 0);

  function BarChart({ data, labels, height = 110 }) {
    const max = Math.max(...data, 1), n = data.length, w = 560, pad = 3;
    const bw = Math.max(5, (w - pad * (n + 1)) / n);
    const isNowIdx = view === 'month' ? (yr === now.getFullYear() && mo === now.getMonth() ? now.getDate() - 1 : -1) : (yr === now.getFullYear() ? now.getMonth() : -1);
    return (
      <svg viewBox={`0 0 ${w} ${height + 28}`} width="100%" style={{ display: 'block', cursor: 'pointer' }}>
        {data.map((v, i) => {
          const bh = v > 0 ? Math.max(8, (v / max) * (height - 10)) : 3;
          const x = pad + i * (bw + pad);
          const y = height - bh;
          const isNow = i === isNowIdx;
          const hasSel = selectedDay && (view === 'month' ? selectedDay.key === `d-${yr}-${mo}-${i + 1}` : selectedDay.key === `m-${yr}-${i}`);
          return (
            <g key={i} style={{ cursor: v > 0 ? 'pointer' : 'default' }}
              onClick={() => {
                if (v === 0) return;
                if (view === 'month') { const day = i + 1; setSelectedDay({ key: `d-${yr}-${mo}-${day}`, label: `${yr}년 ${moNames[mo]} ${day}일`, quests: dayQuests[day] || [], minutes: dayMins[day] || 0 }); }
                else { setSelectedDay({ key: `m-${yr}-${i}`, label: `${yr}년 ${moNames[i]}`, quests: moQuestMap[i] || [], minutes: moMins[i] || 0 }); }
              }}>
              <rect x={x} y={y} width={bw} height={bh} rx="3" fill={hasSel ? P : v > 0 ? (isNow ? P : PL) : '#F3F4F6'} stroke={hasSel ? PD : isNow && !hasSel ? P : 'none'} strokeWidth="1.5" />
              {v > 0 && bh > 18 && <text x={x + bw / 2} y={y + bh / 2 + 4} textAnchor="middle" fontSize="8" fill={hasSel || isNow ? 'white' : '#9CA3AF'} fontFamily="Nunito,sans-serif" fontWeight="800">{v}</text>}
              {labels && labels[i] && <text x={x + bw / 2} y={height + 18} textAnchor="middle" fontSize="8.5" fill={hasSel ? P : isNow ? P : '#9CA3AF'} fontFamily="Nunito,sans-serif" fontWeight={hasSel || isNow ? '800' : '400'}>{labels[i]}</text>}
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

  const prevMo = () => { if (mo === 0) { setBrowseYr(y => y - 1); setBrowseMo(11); } else setBrowseMo(m => m - 1); setSelectedDay(null); };
  const nextMo = () => { const maxMo = yr === now.getFullYear() ? now.getMonth() : 11; if (mo >= maxMo && yr >= now.getFullYear()) return; if (mo === 11) { setBrowseYr(y => y + 1); setBrowseMo(0); } else setBrowseMo(m => m + 1); setSelectedDay(null); };
  const prevYr = () => { setBrowseYr(y => y - 1); setSelectedDay(null); };
  const nextYr = () => { if (yr < now.getFullYear()) { setBrowseYr(y => y + 1); setSelectedDay(null); } };
  const canNextMo = !(mo >= now.getMonth() && yr >= now.getFullYear()), canNextYr = yr < now.getFullYear();

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 90px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, background: PP, borderRadius: 12, padding: 3 }}>
        {[['month', '월간'], ['year', '연간']].map(([v, l]) => (
          <button key={v} onClick={() => { setView(v); setSelectedDay(null); }}
            style={{ flex: 1, padding: '8px', borderRadius: 9, border: 'none', background: view === v ? 'white' : 'transparent', color: view === v ? P : '#9CA3AF', fontWeight: 800, fontSize: 13, boxShadow: view === v ? '0 2px 6px rgba(124,58,237,.1)' : 'none', transition: 'all .2s', cursor: 'pointer' }}>{l}</button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
        <button onClick={view === 'month' ? prevMo : prevYr} style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${BD}`, background: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>‹</button>
        <span style={{ fontWeight: 900, fontSize: 15, color: '#1E1B4B', minWidth: 110, textAlign: 'center' }}>{view === 'month' ? `${yr}년 ${moNames[mo]}` : `${yr}년`}</span>
        <button onClick={view === 'month' ? nextMo : nextYr} style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${BD}`, background: 'white', fontSize: 16, cursor: (view === 'month' ? canNextMo : canNextYr) ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: (view === 'month' ? canNextMo : canNextYr) ? '#6B7280' : '#D1D5DB' }}>›</button>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {view === 'month'
          ? <>{statCard('✅', '퀘스트 완료', totalMoQ + '개')}{statCard('⏱', '총 공부 시간', fmtMin(totalMoMin))}{statCard('📅', '완료한 날', Object.keys(dayCounts).length + '일')}</>
          : <>{statCard('✅', '올해 완료', totalYrQ + '개')}{statCard('⏱', '올해 공부', fmtMin(totalYrMin))}{statCard('🔥', '활동 월수', moCounts.filter(c => c > 0).length + '개월')}</>}
      </div>
      <div style={{ background: 'white', borderRadius: 18, padding: '16px 14px', border: `1.5px solid ${BD}`, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1E1B4B', marginBottom: 4 }}>📊 {view === 'month' ? `${yr}년 ${moNames[mo]} 퀘스트 완료` : `${yr}년 월별 퀘스트 완료`}</div>
        <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 10 }}>막대를 클릭하면 완료한 할일 목록을 볼 수 있어요</div>
        {view === 'month'
          ? <BarChart data={Array.from({ length: daysInMonth }, (_, i) => dayCounts[i + 1] || 0)} labels={Array.from({ length: daysInMonth }, (_, i) => i + 1)} />
          : <BarChart data={moCounts} labels={moNames} />}
      </div>
      <div style={{ background: 'white', borderRadius: 18, padding: '16px 14px', border: `1.5px solid ${BD}`, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1E1B4B', marginBottom: 10 }}>⏱ {view === 'month' ? '일별 공부 시간 (분)' : '월별 공부 시간 (분)'}</div>
        {view === 'month'
          ? <BarChart data={Array.from({ length: daysInMonth }, (_, i) => dayMins[i + 1] || 0)} labels={Array.from({ length: daysInMonth }, (_, i) => i + 1)} />
          : <BarChart data={moMins} labels={moNames} />}
      </div>
      {selectedDay && (
        <div style={{ background: 'white', borderRadius: 18, border: `2px solid ${P}`, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ background: `linear-gradient(135deg,${PL},${GL})`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 14, color: PD }}>{selectedDay.label}</div>
              <div style={{ fontSize: 12, color: PM, fontWeight: 600, marginTop: 2 }}>완료 {selectedDay.quests.length}개 · {fmtMin(selectedDay.minutes)}</div>
            </div>
            <button onClick={() => setSelectedDay(null)} style={{ background: 'rgba(124,58,237,.15)', border: 'none', borderRadius: 8, width: 28, height: 28, fontSize: 14, color: PD, cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ padding: '10px 16px 14px' }}>
            {selectedDay.quests.map((q, i) => (
              <div key={q.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < selectedDay.quests.length - 1 ? `1px solid ${BD}` : 'none' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, flexShrink: 0 }}>✓</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1E1B4B' }}>{q.title}</div>
                  {q.studyMinutes > 0 && <div style={{ fontSize: 11, color: GD, fontWeight: 600, marginTop: 1 }}>⏱ {fmtMin(q.studyMinutes)}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── GARDEN SCREEN ── */
function GardenScreen({ isProUser, pages, owned, customCategories, onNewPage, onOpenPage, onShowProUpgrade }) {
  if (!isProUser) {
    return (
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'36px 28px',textAlign:'center'}}>
        <div style={{fontSize:64,marginBottom:16}}>🌱</div>
        <h2 style={{fontSize:22,fontWeight:900,color:'#1E1B4B',marginBottom:10}}>나만의 정원을 꾸며보세요</h2>
        <p style={{fontSize:14,color:'#6B7280',fontWeight:600,lineHeight:1.75,marginBottom:28}}>퀘스트를 완료해서 보상 요소를 획득하고<br/>테마 배경 위에 자유롭게 배치하는<br/>나만의 특별한 공간을 만들 수 있어요.</p>
        <button onClick={onShowProUpgrade} style={{width:'100%',maxWidth:340,padding:'15px',borderRadius:16,border:'none',background:`linear-gradient(135deg,${P},${G})`,color:'white',fontSize:16,fontWeight:900,boxShadow:'0 6px 24px rgba(124,58,237,.35)'}}>✨ Pro로 업그레이드</button>
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
                <div key={p.id} style={{borderRadius:20,overflow:'hidden',aspectRatio:'16/9',cursor:'pointer',position:'relative',boxShadow:'0 4px 18px rgba(124,58,237,.1)',border:'2px solid rgba(255,255,255,.5)'}} onClick={()=>onOpenPage(p.id)}>
                  <div style={{position:'absolute',inset:0}}><ThemeBg themeId={p.theme} isDark={p.isDark}/></div>
                  {(p.elements||[]).slice(0,10).map(el=>(<div key={el.id} style={{position:'absolute',left:`${Math.max(4,Math.min(80,(el.x||0)/12))}%`,top:`${Math.max(4,Math.min(68,(el.y||0)/7))}%`,fontSize:Math.max(13,Math.min(22,(el.size||36)*.48)),pointerEvents:'none',userSelect:'none',lineHeight:1}}>{el.emoji}</div>))}
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

/* ── QUEST SCREEN ── */
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
              {usedCats.map(k => { const v = RCATS[k]; return v ? (<button key={k} onClick={() => setCatFil(catFil === k ? null : k)} style={{ flexShrink: 0, padding: '4px 9px', borderRadius: 20, border: `1.5px solid ${catFil === k ? v.c : BD}`, background: catFil === k ? v.c : 'white', color: catFil === k ? 'white' : v.c, fontSize: 11, fontWeight: 800 }}>{v.e} {v.n}</button>) : null; })}
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
                  <div onClick={() => !q.completed && onOpenTimer(q)} style={{ width: 30, height: 30, borderRadius: '50%', border: `2.5px solid ${q.completed ? G : P}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: q.completed ? 'white' : P, background: q.completed ? G : PL, transition: 'all .3s' }}>
                    {q.completed ? '✓' : i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }} onClick={() => !q.completed && onOpenTimer(q)}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1E1B4B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: q.completed ? 'line-through' : 'none' }}>{q.title}</div>
                    {isProUser && el && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3, background: cat ? `${cat.c}18` : GL, borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700, color: cat ? cat.c : GD }}>{el.e} {el.n}</div>}
                    {!isProUser && q.completed && q.studyMinutes > 0 && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3, background: GL, borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700, color: GD }}>⏱ {q.studyMinutes}분 공부</div>}
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

/* ── PROFILE PAGE ── */
function ProfilePage({ user, isProUser, quests, onBack, onUpdate, onLogout, onShowProUpgrade, onDeleteAccount }) {
  const [editNick, setEditNick] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [nick, setNick] = useState(user.nickname || user.name);
  const fileRef = useRef(null);

  const totalMin = quests.filter(q => q.completed).reduce((s, q) => s + (q.studyMinutes || 0), 0);
  const totalQ = quests.filter(q => q.completed).length;
  const fmtMin = m => m >= 60 ? `${Math.floor(m/60)}시간 ${m%60}분` : `${m}분`;

  const handleAvatar = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdate({ avatar: ev.target.result });
    reader.readAsDataURL(file);
  };

  const saveNick = () => { if (nick.trim()) onUpdate({ nickname: nick.trim() }); setEditNick(false); };

  const row = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${BD}` }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#6B7280' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#1E1B4B' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 300, background: '#F5F3FF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 16px', background: 'white', borderBottom: `1.5px solid ${BD}`, gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 18, color: '#6B7280', cursor: 'pointer', padding: '4px 6px' }}>←</button>
        <span style={{ fontWeight: 900, fontSize: 15, color: '#1E1B4B', flex: 1 }}>프로필</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 48px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: `linear-gradient(135deg,${PL},${GL})`, border: `3px solid ${P}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {user.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="프로필"/> : <span style={{ fontSize: 40 }}>👤</span>}
            </div>
            <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: P, border: '2px solid white', color: 'white', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>📷</button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }}/>
          </div>
          {editNick ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input value={nick} onChange={e => setNick(e.target.value)} autoFocus style={{ padding: '7px 12px', border: `2px solid ${P}`, borderRadius: 10, fontSize: 15, fontWeight: 700, color: '#1E1B4B', textAlign: 'center' }} onKeyDown={e => e.key === 'Enter' && saveNick()}/>
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
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[['✅', '완료 퀘스트', totalQ + '개'], ['⏱', '총 공부 시간', fmtMin(totalMin)]].map(([ic, lb, val]) => (
            <div key={lb} style={{ flex: 1, background: 'white', borderRadius: 14, padding: '12px', border: `1.5px solid ${BD}`, textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{ic}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: P }}>{val}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>{lb}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'white', borderRadius: 16, border: `1.5px solid ${BD}`, padding: '0 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '12px 0 4px' }}>계정 정보</div>
          {row('이름', user.name)}
          {row('닉네임', user.nickname || user.name)}
          {row('이메일', user.email)}
          {row('플랜', isProUser ? '✨ Pro' : '무료')}
        </div>
        {!isProUser && <button onClick={onShowProUpgrade} style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: 'white', fontSize: 14, fontWeight: 900, marginBottom: 12, cursor: 'pointer' }}>✨ Pro로 업그레이드</button>}
        <button onClick={onLogout} style={{ width: '100%', padding: '13px', borderRadius: 14, border: `1.5px solid #FECACA`, background: '#FEF2F2', color: '#DC2626', fontSize: 14, fontWeight: 800, cursor: 'pointer', marginBottom: 10 }}>로그아웃</button>
        <button onClick={() => setShowDeleteConfirm(true)} style={{ width: '100%', padding: '13px', borderRadius: 14, border: `1.5px solid #FECACA`, background: 'white', color: '#9CA3AF', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>회원 탈퇴</button>
        {showDeleteConfirm && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 500, background: 'rgba(10,5,30,.62)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: 24, width: '100%', maxWidth: 320 }}>
              <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>⚠️</div>
              <div style={{ fontWeight: 900, fontSize: 16, color: '#1E1B4B', textAlign: 'center', marginBottom: 8 }}>정말 탈퇴하시겠어요?</div>
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '8px 12px', marginBottom: 18, fontSize: 12, color: '#DC2626', fontWeight: 700, textAlign: 'center' }}>모든 데이터가 영구 삭제됩니다.</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1.5px solid ${BD}`, background: 'none', fontSize: 14, fontWeight: 700, color: '#6B7280', cursor: 'pointer' }}>취소</button>
                <button onClick={() => { onDeleteAccount(); }} style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#EF4444', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>탈퇴하기</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ONBOARDING MODAL ── */
function OnboardingModal({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: '👋', title: 'Quest Garden에 오신 걸 환영해요!', desc: '매일 할일을 퀘스트로 등록하고 완료하면서 나만의 공부 루틴을 만들어요.', color: PL, textColor: PD },
    { icon: '⚔️', title: '퀘스트로 할일 관리', desc: '퀘스트 탭에서 + 버튼을 눌러 오늘 할일을 입력하세요. 자주 쓰는 루틴은 저장해두면 다음날 바로 불러올 수 있어요!', color: '#EDE9FE', textColor: PD },
    { icon: '⏱', title: '타이머로 집중 공부', desc: '퀘스트를 탭하면 타이머가 시작돼요. 탭을 바꿔도 타이머는 계속 돌아가요. 공부 시간이 자동으로 기록됩니다.', color: GL, textColor: GD },
    { icon: '📊', title: '홈에서 성장 확인', desc: '홈 화면에서 월별·연간 공부 그래프를 볼 수 있어요. 막대를 클릭하면 그날 완료한 할일 목록도 확인할 수 있어요!', color: '#FEF9C3', textColor: '#713F12' },
    { icon: '🌿', title: '정원으로 성취감을 (Pro)', desc: 'Pro 가입 후 퀘스트를 완료하면 보상 요소를 획득해요. 14가지 테마 배경 위에 자유롭게 배치해 나만의 정원을 꾸며보세요.', color: PL, textColor: PD },
  ];
  const s = steps[step], isLast = step === steps.length - 1;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 500, background: 'rgba(10,5,30,.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 24, width: '100%', maxWidth: 400, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,.25)' }}>
        <div style={{ background: s.color, padding: '36px 24px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{s.icon}</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: s.textColor, lineHeight: 1.3 }}>{s.title}</div>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>
          <p style={{ fontSize: 14, color: '#374151', fontWeight: 600, lineHeight: 1.7, marginBottom: 24, textAlign: 'center' }}>{s.desc}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            {steps.map((_, i) => (<div key={i} style={{ width: i === step ? 20 : 8, height: 8, borderRadius: 4, background: i === step ? P : '#E5E7EB', transition: 'all .3s' }} />))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: `1.5px solid ${BD}`, background: 'none', fontSize: 14, fontWeight: 700, color: '#6B7280', cursor: 'pointer' }}>이전</button>}
            <button onClick={() => isLast ? onDone() : setStep(s => s + 1)} style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${P},${G})`, color: 'white', fontSize: 14, fontWeight: 900, cursor: 'pointer' }}>
              {isLast ? '시작하기 🚀' : '다음 →'}
            </button>
          </div>
          {!isLast && <button onClick={onDone} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: '#9CA3AF', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>건너뛰기</button>}
        </div>
      </div>
    </div>
  );
}

/* ── NOTIFICATION PANEL ── */
function NotifPanel({ notifEnabled, setNotifEnabled, notifTime, setNotifTime, onClose }) {
  const reqPermission = async () => {
    if (!('Notification' in window)) { alert('이 브라우저는 알림을 지원하지 않아요.'); return; }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') { setNotifEnabled(true); new Notification('🌱 Quest Garden', { body: '알림이 설정됐어요!' }); }
    else alert('알림 권한이 거부됐어요.');
  };
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 400, background: 'rgba(10,5,30,.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 }}>
        <div style={{ fontWeight: 900, fontSize: 17, color: '#1E1B4B', marginBottom: 6 }}>🔔 퀘스트 리마인더</div>
        <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 600, lineHeight: 1.65, marginBottom: 20 }}>설정한 시간에 오늘 퀘스트 진행 상황을 알려드려요.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${BD}`, marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1E1B4B' }}>알림 켜기</span>
          <button onClick={() => { if (!notifEnabled) reqPermission(); else setNotifEnabled(false); }}
            style={{ width: 48, height: 26, borderRadius: 13, border: 'none', background: notifEnabled ? P : '#D1D5DB', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: notifEnabled ? 25 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
          </button>
        </div>
        {notifEnabled && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 8 }}>알림 시간</div>
            <input type="time" value={notifTime} onChange={e => setNotifTime(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${P}`, borderRadius: 12, fontSize: 16, fontWeight: 700, color: PD, background: PL }} />
          </div>
        )}
        <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${P},${G})`, color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>확인</button>
      </div>
    </div>
  );
}

/* ── PRO UPGRADE PAGE ── */
function ProUpgradePage({ onBack, onUpgrade, userName }) {
  const [sel, setSel] = useState('annual');
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const plans = { monthly: { label: '월간', price: '₩9,900', sub: '/월', badge: null }, annual: { label: '연간', price: '₩79,900', sub: '/년', badge: '17% 절약' } };
  const perks = [
    { icon: '🌿', title: '정원 만들기', desc: '테마 배경 위에 보상 요소를 자유롭게 배치' },
    { icon: '🏆', title: '퀘스트 보상 요소', desc: '완료 시 정원에 배치할 요소 획득' },
    { icon: '🎨', title: '14가지 테마', desc: '낮/밤 전환이 가능한 다양한 배경' },
    { icon: '⭐', title: '희귀 요소', desc: 'Pro 전용 희귀 꾸미기 요소 해금' },
  ];

  const handlePay = async () => {
    setPaying(true);
    await new Promise(r => setTimeout(r, 2200));
    setPaying(false); setDone(true);
    await new Promise(r => setTimeout(r, 1200));
    track('pro_upgrade_completed', { plan: sel });
    onUpgrade();
  };

  if (done) return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 300, background: `linear-gradient(160deg,${PD},${GD})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <div style={{ fontSize: 72, marginBottom: 16, animation: 'qgPop .5s ease' }}>🎉</div>
      <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Pro 가입 완료!</div>
      <p style={{ fontSize: 15, opacity: 0.8, fontWeight: 600 }}>이제 정원을 만들어보세요 🌿</p>
    </div>
  );

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
        <button onClick={handlePay} disabled={paying} style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', background: paying ? '#9CA3AF' : `linear-gradient(135deg,${P},${G})`, color: 'white', fontSize: 15, fontWeight: 900, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: paying ? 'default' : 'pointer' }}>
          {paying ? <><div style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'qgSpin .7s linear infinite' }} />결제 처리 중...</> : `💳 ${plans[sel].price} 결제하기`}
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>언제든 해지 가능 · 자동 갱신 · 부가세 포함</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════ */
const ADMIN_EMAIL = 'hrjeon0530@gmail.com';
const G_COLOR = '#10B981';

function AdminDashboard({ accounts, quests, pages, onLogout }) {
  const [selTab, setSelTab] = useState('overview');
  const [sbLogs, setSbLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await sbFetch('/rest/v1/qg_events?select=*&order=created_at.desc&limit=500');
      const data = await res.json();
      if (Array.isArray(data)) { setSbLogs(data); setLastRefresh(new Date()); }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); const iv = setInterval(fetchLogs, 30000); return () => clearInterval(iv); }, []);

  const totalUsers = accounts.length, proUsers = accounts.filter(a => a.isPro).length;
  const totalQuests = quests.length, completedQuests = quests.filter(q => q.completed).length;
  const completionRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;
  const totalStudyMin = quests.filter(q => q.completed).reduce((s, q) => s + (q.studyMinutes || 0), 0);
  const fmtMin = m => m >= 60 ? `${Math.floor(m/60)}시간 ${m%60}분` : `${m}분`;

  const logs = sbLogs.map(row => ({ event: row.event_name, params: row.params || {}, time: new Date(row.created_at).getTime() }));
  const eventCounts = logs.reduce((acc, e) => { acc[e.event] = (acc[e.event] || 0) + 1; return acc; }, {});
  const tabClicks = logs.filter(e => e.event === 'tab_switch').reduce((acc, e) => { const t = e.params?.tab_name || 'unknown'; acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  const todayStr = new Date().toDateString();
  const todayLogins = logs.filter(e => e.event === 'login' && new Date(e.time).toDateString() === todayStr).length;

  const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); const ds = d.toDateString(); return { label: `${d.getMonth() + 1}/${d.getDate()}`, count: quests.filter(q => q.completed && new Date(q.date).toDateString() === ds).length }; });
  const maxCount = Math.max(...last7.map(d => d.count), 1);

  const card = (icon, label, value, sub, color = P) => (
    <div style={{ flex: 1, minWidth: 140, background: 'white', borderRadius: 16, padding: '16px 14px', border: `1.5px solid ${BD}`, textAlign: 'center' }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3, fontWeight: 600 }}>{sub}</div>}
    </div>
  );

  const tabs = [{ id: 'overview', label: '📊 개요' }, { id: 'users', label: '👤 유저' }, { id: 'behavior', label: '🖱️ 행동' }, { id: 'logs', label: '📋 로그' }];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F5F3FF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 54, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 20px', background: `linear-gradient(135deg,${PD},${GD})`, gap: 12 }}>
        <div style={{ fontSize: 20 }}>🛡️</div>
        <div style={{ flex: 1, fontWeight: 900, fontSize: 15, color: 'white' }}>Quest Garden 관리자</div>
        {lastRefresh && <span style={{ fontSize: 10, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>{lastRefresh.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} 기준</span>}
        <button onClick={fetchLogs} disabled={loading} style={{ padding: '5px 12px', borderRadius: 9, border: '1.5px solid rgba(255,255,255,.4)', background: 'none', color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>{loading ? '⏳' : '🔄 새로고침'}</button>
        <button onClick={onLogout} style={{ padding: '5px 12px', borderRadius: 9, border: '1.5px solid rgba(255,255,255,.4)', background: 'none', color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>로그아웃</button>
      </div>
      <div style={{ display: 'flex', background: 'white', borderBottom: `1.5px solid ${BD}`, flexShrink: 0 }}>
        {tabs.map(t => (<button key={t.id} onClick={() => setSelTab(t.id)} style={{ flex: 1, padding: '11px 0', border: 'none', background: 'none', fontWeight: 800, fontSize: 12, color: selTab === t.id ? P : '#9CA3AF', borderBottom: selTab === t.id ? `2.5px solid ${P}` : '2.5px solid transparent', cursor: 'pointer' }}>{t.label}</button>))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 40px' }}>
        {selTab === 'overview' && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {card('👥', '총 가입자', totalUsers + '명', null, P)}
              {card('✨', 'Pro 유저', proUsers + '명', `전환율 ${totalUsers > 0 ? Math.round(proUsers / totalUsers * 100) : 0}%`, G_COLOR)}
              {card('🌿', '총 정원', pages.length + '개', null, '#06B6D4')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
              {card('✅', '완료 퀘스트', completedQuests + '개', `완료율 ${completionRate}%`, G_COLOR)}
              {card('⏱', '총 공부 시간', fmtMin(totalStudyMin), null, '#F59E0B')}
              {card('🔑', '오늘 로그인', todayLogins + '명', null, P)}
            </div>
            <div style={{ background: 'white', borderRadius: 18, padding: '18px 16px', border: `1.5px solid ${BD}` }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1E1B4B', marginBottom: 16 }}>📈 최근 7일 퀘스트 완료</div>
              <svg viewBox="0 0 420 100" width="100%" style={{ display: 'block' }}>
                {last7.map((d, i) => { const bh = d.count > 0 ? Math.max(8, (d.count / maxCount) * 72) : 3; const x = 10 + i * 58; return (<g key={i}><rect x={x} y={80 - bh} width={38} height={bh} rx="5" fill={d.count > 0 ? PL : '#F3F4F6'} stroke={d.count > 0 ? P : '#E5E7EB'} strokeWidth="1.5" />{d.count > 0 && <text x={x + 19} y={80 - bh - 5} textAnchor="middle" fontSize="10" fill={PD} fontWeight="800">{d.count}</text>}<text x={x + 19} y={96} textAnchor="middle" fontSize="9" fill="#9CA3AF">{d.label}</text></g>); })}
              </svg>
            </div>
          </>
        )}
        {selTab === 'users' && (
          <>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>가입자 목록</div>
            {accounts.map((a, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 14, padding: '14px 16px', border: `1.5px solid ${BD}`, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: a.isPro ? `linear-gradient(135deg,${P},${G_COLOR})` : PL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {a.avatar ? <img src={a.avatar} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} alt="" /> : '👤'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#1E1B4B' }}>{a.nickname || a.name}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>{a.email}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 6, background: a.isPro ? 'linear-gradient(135deg,#F59E0B,#EF4444)' : '#F3F4F6', color: a.isPro ? 'white' : '#9CA3AF' }}>{a.isPro ? 'PRO' : '무료'}</span>
              </div>
            ))}
          </>
        )}
        {selTab === 'behavior' && (
          <>
            <div style={{ background: 'white', borderRadius: 16, padding: '16px', border: `1.5px solid ${BD}`, marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1E1B4B', marginBottom: 14 }}>🖱️ 탭 클릭 횟수</div>
              {Object.keys(tabClicks).length === 0 ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>아직 데이터가 없어요</p> : Object.entries(tabClicks).map(([tab, cnt]) => {
                const total = Object.values(tabClicks).reduce((a, b) => a + b, 0), pct = Math.round((cnt / total) * 100);
                return (<div key={tab} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{tab}</span><span style={{ fontSize: 13, fontWeight: 800, color: P }}>{cnt}회 ({pct}%)</span></div>
                  <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}><div style={{ height: '100%', width: pct + '%', background: `linear-gradient(90deg,${P},${G_COLOR})`, borderRadius: 4 }} /></div>
                </div>);
              })}
            </div>
          </>
        )}
        {selTab === 'logs' && (
          <>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>이벤트 로그 ({logs.length}개)</div>
            {[...logs].reverse().slice(0, 100).map((log, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 12, padding: '10px 14px', border: `1.5px solid ${BD}`, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: P, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#1E1B4B' }}>{log.event}</div>
                  {log.params && Object.keys(log.params).length > 0 && <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, marginTop: 2 }}>{Object.entries(log.params).filter(([k]) => k !== 'app').map(([k, v]) => `${k}: ${v}`).join(' · ')}</div>}
                </div>
                <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, flexShrink: 0 }}>{new Date(log.time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   APP ROOT
══════════════════════════════════════════ */
export default function App() {
  const [accounts, setAccounts] = useState(() => { try { return JSON.parse(localStorage.getItem('qg_accounts') || '[]'); } catch { return []; } });
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('qg_user') || 'null'); } catch { return null; } });
  const [isProUser, setIsProUser] = useState(() => { try { return JSON.parse(localStorage.getItem('qg_pro') || 'false'); } catch { return false; } });
  const [tab, setTab] = useState('home');
  const [pages, setPages] = useState(() => { try { return JSON.parse(localStorage.getItem('qg_pages') || '[]'); } catch { return []; } });
  const [quests, setQuests] = useState(() => { try { return JSON.parse(localStorage.getItem('qg_quests') || '[]'); } catch { return []; } });
  const [owned, setOwned] = useState(() => { try { return JSON.parse(localStorage.getItem('qg_owned') || '[]'); } catch { return []; } });
  const [silent, setSilent] = useState(true);
  const [routines, setRoutines] = useState(() => { try { return JSON.parse(localStorage.getItem('qg_routines') || '[]'); } catch { return []; } });
  const [notifTime, setNotifTime] = useState(() => { try { return localStorage.getItem('qg_notif_time') || '20:00'; } catch { return '20:00'; } });
  const [notifEnabled, setNotifEnabled] = useState(() => { try { return JSON.parse(localStorage.getItem('qg_notif_on') || 'false'); } catch { return false; } });
  const [onboarded, setOnboarded] = useState(() => { try { return JSON.parse(localStorage.getItem('qg_onboarded') || 'false'); } catch { return false; } });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showBanner, setShowBanner] = useState(() => { try { return JSON.parse(localStorage.getItem('qg_banner') || 'true'); } catch { return true; } });
  const [demoMode, setDemoMode] = useState(false);
  const [createPage, setCreatePage] = useState(false);
  const [createQuest, setCreateQuest] = useState(false);
  const [activeGarden, setActiveGarden] = useState(null);
  const [activeTimer, setActiveTimer] = useState(null);
  const [editReward, setEditReward] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [showProUpgrade, setShowProUpgrade] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  const prevDone = useRef(false);

  useEffect(() => { try { localStorage.setItem('qg_accounts', JSON.stringify(accounts)); } catch {} }, [accounts]);
  useEffect(() => { try { localStorage.setItem('qg_user', JSON.stringify(user)); } catch {} }, [user]);
  useEffect(() => { try { localStorage.setItem('qg_pro', JSON.stringify(isProUser)); } catch {} }, [isProUser]);
  useEffect(() => { try { localStorage.setItem('qg_pages', JSON.stringify(pages)); } catch {} }, [pages]);
  useEffect(() => { try { localStorage.setItem('qg_quests', JSON.stringify(quests)); } catch {} }, [quests]);
  useEffect(() => { try { localStorage.setItem('qg_owned', JSON.stringify(owned)); } catch {} }, [owned]);
  useEffect(() => { try { localStorage.setItem('qg_routines', JSON.stringify(routines)); } catch {} }, [routines]);
  useEffect(() => { try { localStorage.setItem('qg_notif_time', notifTime); } catch {} }, [notifTime]);
  useEffect(() => { try { localStorage.setItem('qg_notif_on', JSON.stringify(notifEnabled)); } catch {} }, [notifEnabled]);
  useEffect(() => { if (user && !onboarded) setShowOnboarding(true); }, [user]);

  const todayQ = quests.filter(q => q.date === today());
  const allDone = todayQ.length > 0 && todayQ.every(q => q.completed);
  useEffect(() => { if (allDone && !prevDone.current) setConfetti(true); prevDone.current = allDone; }, [allDone]);

  const completeQuest = (id, studyMinutes = 0) => {
    const q = quests.find(q => q.id === id);
    if (!q || q.completed) return;
    if (isProUser) { const el = getAllItems().find(it => it.id === q.rewardId); if (el) setOwned(p => [...p, { ...el, emoji: el.e, name: el.n, catKey: q.rewardCat || el.catKey }]); }
    setQuests(p => p.map(qItem => qItem.id === id ? { ...qItem, completed: true, studyMinutes } : qItem));
  };

  const updateUserProfile = (patch) => {
    const updated = { ...user, ...patch };
    setUser(updated);
    setAccounts(prev => prev.map(a => a.email === user.email ? { ...a, ...patch } : a));
  };

  const undoneQ = todayQ.filter(q => !q.completed).length;
  const pageObj = pages.find(p => p.id === activeGarden);

  if (!user) {
    return (
      <div className="qg">
        <Styles />
        <AuthScreen accounts={accounts} onRegister={acct => setAccounts(prev => [...prev, acct])} onAuth={u => setUser(u)} />
      </div>
    );
  }

  if (user.email === ADMIN_EMAIL) {
    return (
      <div className="qg">
        <Styles />
        <AdminDashboard accounts={accounts} quests={quests} pages={pages} onLogout={() => { setUser(null); try { localStorage.removeItem('qg_user'); } catch {} }} />
      </div>
    );
  }

  const tabs = [{ id: 'home', icon: '📊', label: '홈' }, { id: 'quest', icon: '⚔️', label: '퀘스트' }, { id: 'garden', icon: '🌿', label: '정원' }];

  return (
    <div className="qg">
      <Styles />
      <div style={{ height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', background: 'white', borderBottom: `1.5px solid ${BD}`, zIndex: 10, position: 'relative', gap: 8 }}>
        <div style={{ fontWeight: 900, fontSize: 14, background: `linear-gradient(135deg,${PD},${GD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', flexShrink: 0 }}>🌱 Quest Garden</div>
        <div style={{ display: 'flex', gap: 2, background: PP, borderRadius: 10, padding: '2px' }}>
          {tabs.map(({ id, icon, label }) => (
            <button key={id} onClick={() => { setTab(id); track('tab_switch', { tab_name: id }); }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 11px', borderRadius: 8, border: 'none', background: tab === id ? 'white' : 'transparent', color: tab === id ? P : '#9CA3AF', fontWeight: 800, fontSize: 11, boxShadow: tab === id ? '0 2px 6px rgba(124,58,237,.1)' : 'none', transition: 'all .2s', position: 'relative', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 12 }}>{icon}</span>{label}
              {id === 'quest' && undoneQ > 0 && <div style={{ position: 'absolute', top: 3, right: 3, width: 6, height: 6, borderRadius: '50%', background: G, border: '2px solid white' }} />}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button onClick={() => setShowNotif(true)} style={{ width: 30, height: 30, borderRadius: 9, border: `1.5px solid ${notifEnabled ? P : BD}`, background: notifEnabled ? PL : 'white', color: notifEnabled ? PD : '#9CA3AF', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>🔔</button>
          {!isProUser && <button onClick={() => { setDemoMode(true); setIsProUser(true); }} title="Pro 기능 테스트" style={{ width: 30, height: 30, borderRadius: 9, border: '1.5px solid #FDE047', background: '#FEF9C3', color: '#713F12', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>🧪</button>}
          {isProUser
            ? <span style={{ fontSize: 9, fontWeight: 900, background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: 'white', padding: '2px 6px', borderRadius: 5 }}>PRO</span>
            : <button onClick={() => setShowProUpgrade(true)} style={{ fontSize: 10, fontWeight: 900, background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: 'white', padding: '4px 8px', borderRadius: 7, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>✨ PRO</button>}
          <button onClick={() => setShowProfile(true)} style={{ fontSize: 12, fontWeight: 800, color: PM, background: PL, padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            {user.avatar ? <img src={user.avatar} style={{width:20,height:20,borderRadius:'50%',objectFit:'cover'}} alt=''/> : <span style={{fontSize:16}}>👤</span>}
            {user.nickname || user.name}
          </button>
        </div>
      </div>
      {showBanner && (
        <div style={{ flexShrink: 0, background: `linear-gradient(135deg,${P},${G})`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>✨</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>Pro: 정원 기획 + 테마 14종 + 퀘스트 보상!</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', marginLeft: 8, fontWeight: 600 }}>월 ₩9,900</span>
          </div>
          {!isProUser && <button onClick={() => setShowProUpgrade(true)} style={{ padding: '5px 13px', borderRadius: 20, border: '1.5px solid white', background: 'rgba(255,255,255,.18)', color: 'white', fontSize: 11, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>시작하기</button>}
          <button onClick={() => { setShowBanner(false); try { localStorage.setItem('qg_banner','false'); } catch {} }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', fontSize: 18, cursor: 'pointer', padding: '0 2px', lineHeight: 1, flexShrink: 0 }}>✕</button>
        </div>
      )}
      {demoMode && (
        <div style={{ flexShrink: 0, background: '#FEF9C3', borderBottom: '1.5px solid #FDE047', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13 }}>🧪</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#713F12', flex: 1 }}>Pro 테스트 모드 — 실제 결제 없이 Pro 기능 체험 중</span>
          <button onClick={() => { setDemoMode(false); setIsProUser(false); }} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #FDE047', background: 'white', color: '#713F12', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>종료</button>
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {tab === 'home' && <StatsScreen quests={quests} />}
        {tab === 'quest' && (
          <QuestScreen quests={quests} silent={silent} isProUser={isProUser}
            onToggleSilent={() => setSilent(s => !s)}
            onOpenTimer={q => setActiveTimer(q)}
            onEditReward={q => setEditReward(q)} />
        )}
        {tab === 'garden' && (
          <GardenScreen isProUser={isProUser} pages={pages} owned={owned} customCategories={customCategories}
            onNewPage={() => setCreatePage(true)}
            onOpenPage={id => setActiveGarden(id)}
            onShowProUpgrade={() => setShowProUpgrade(true)} />
        )}
        {tab === 'quest' && (
          <button onClick={() => setCreateQuest(true)}
            style={{ position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 18, background: `linear-gradient(145deg,${P},${G})`, border: 'none', color: 'white', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px rgba(124,58,237,.45)', zIndex: 15, cursor: 'pointer' }}>+</button>
        )}
        {tab === 'garden' && isProUser && (
          <button onClick={() => setCreatePage(true)}
            style={{ position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 18, background: `linear-gradient(145deg,${P},${G})`, border: 'none', color: 'white', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px rgba(124,58,237,.45)', zIndex: 15, cursor: 'pointer' }}>+</button>
        )}
        {createPage && (
          <CreatePageModal isProUser={isProUser}
            onNeedPro={() => { setCreatePage(false); setShowProUpgrade(true); }}
            onConfirm={p => { track('garden_created', { theme: p.theme }); setPages(prev => [...prev, { id: uid(), ...p }]); setCreatePage(false); }}
            onCancel={() => setCreatePage(false)} />
        )}
        {createQuest && (
          <CreateQuestModal isProUser={isProUser} routines={routines}
            onSaveRoutine={r => { if (r.__delete) { setRoutines(prev => prev.filter(x => x.id !== r.id)); return; } track('routine_saved', { todo_count: r.todos.length }); setRoutines(prev => [...prev.filter(x => x.id !== r.id), r]); }}
            onConfirm={nQ => { track('quest_created', { quest_count: nQ.length }); setQuests(p => [...p.filter(q => !(q.date === today() && !q.completed)), ...nQ]); setCreateQuest(false); }}
            onCancel={() => setCreateQuest(false)} />
        )}
        {editReward && isProUser && (
          <EditRewardModal quest={editReward}
            onSave={(id, catKey) => { setQuests(p => p.map(q => q.id === editReward.id ? { ...q, rewardId: id, rewardCat: catKey } : q)); setEditReward(null); }}
            onCancel={() => setEditReward(null)} />
        )}
        {pageObj && (
          <GardenDetail page={pageObj} owned={owned} customCategories={customCategories}
            onClose={() => setActiveGarden(null)}
            onUpdate={u => setPages(p => p.map(x => x.id === u.id ? u : x))}
            onDelete={id => { setPages(p => p.filter(x => x.id !== id)); setActiveGarden(null); }} />
        )}
        {activeTimer && (
          <TimerScreen quest={activeTimer} silentMode={silent} isProUser={isProUser}
            onComplete={(mins) => { completeQuest(activeTimer.id, mins); setActiveTimer(null); }}
            onBack={() => setActiveTimer(null)} />
        )}
        {confetti && <Confetti onDone={() => setConfetti(false)} />}
        {showOnboarding && (
          <OnboardingModal onDone={() => { track('onboarding_complete'); setShowOnboarding(false); setOnboarded(true); try { localStorage.setItem('qg_onboarded', 'true'); } catch {} }} />
        )}
        {showNotif && <NotifPanel notifEnabled={notifEnabled} setNotifEnabled={setNotifEnabled} notifTime={notifTime} setNotifTime={setNotifTime} onClose={() => setShowNotif(false)} />}
        {showProfile && (
          <ProfilePage user={user} isProUser={isProUser} quests={quests}
            onBack={() => setShowProfile(false)}
            onUpdate={updateUserProfile}
            onLogout={() => { setUser(null); setShowProfile(false); }}
            onShowProUpgrade={() => { setShowProfile(false); setShowProUpgrade(true); }}
            onDeleteAccount={() => {
              try { ['qg_accounts','qg_user','qg_pro','qg_pages','qg_quests','qg_owned','qg_routines','qg_notif_on','qg_notif_time','qg_onboarded'].forEach(k => localStorage.removeItem(k)); } catch {}
              setUser(null); setAccounts([]); setQuests([]); setPages([]); setOwned([]); setIsProUser(false); setShowProfile(false);
            }} />
        )}
        {showProUpgrade && (
          <ProUpgradePage userName={user.name} onBack={() => setShowProUpgrade(false)} onUpgrade={() => { setIsProUser(true); setShowProUpgrade(false); }} />
        )}
      </div>
    </div>
  );
}