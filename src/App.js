import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════
   WORKSPACE TYPE CONFIG
══════════════════════════════════════════════════════════ */
const WS = {
  school: {
    label: '학교', icon: '🎓', c: '#2563EB', l: '#EFF6FF', d: '#1D4ED8', m: '#DBEAFE',
    tagline: '과제, 노트, 일정을 한 곳에서',
    perks: ['📚 과제 트래커', '📝 수업 노트', '📅 시험 캘린더', '🏆 성적 관리'],
    nav: [
      { id:'home',    e:'🏠', n:'홈' },
      { id:'todo',    e:'✅', n:'할일' },
      { id:'cal',     e:'📅', n:'캘린더' },
      { id:'assign',  e:'📚', n:'과제' },
      { id:'grades',  e:'🏆', n:'성적' },
      { id:'attend',  e:'📋', n:'출석' },
    ],
  },
  company: {
    label: '회사', icon: '💼', c: '#0F766E', l: '#F0FDFA', d: '#0D5C56', m: '#CCFBF1',
    tagline: '업무, 회의, 프로젝트를 효율적으로',
    perks: ['✅ 업무 관리', '🤖 AI 회의 요약', '⏱️ 타임트래커', '📊 주간 리포트'],
    nav: [
      { id:'home',      e:'🏠', n:'홈' },
      { id:'todo',      e:'✅', n:'업무' },
      { id:'cal',       e:'📅', n:'일정' },
      { id:'meetings',  e:'🤖', n:'AI 회의' },
      { id:'timetrack', e:'⏱️', n:'타임트래커' },
      { id:'projects',  e:'📊', n:'프로젝트' },
    ],
  },
  personal: {
    label: '개인', icon: '✨', c: '#7C3AED', l: '#F5F3FF', d: '#5B21B6', m: '#EDE9FE',
    tagline: '목표, 습관, 일상을 체계적으로',
    perks: ['🔥 습관 스트릭', '🎯 목표 트래커', '📖 개인 일기', '📅 일정 관리'],
    nav: [
      { id:'home',   e:'🏠', n:'홈' },
      { id:'todo',   e:'✅', n:'할일' },
      { id:'cal',    e:'📅', n:'캘린더' },
      { id:'habits', e:'🔥', n:'습관' },
      { id:'goals',  e:'🎯', n:'목표' },
      { id:'jour',   e:'📖', n:'일기' },
    ],
  },
};

const PRIO = {
  high:   { l:'높음', c:'#DC2626', bg:'#FEF2F2', border:'#FECACA' },
  medium: { l:'중간', c:'#D97706', bg:'#FFFBEB', border:'#FDE68A' },
  low:    { l:'낮음', c:'#059669', bg:'#ECFDF5', border:'#A7F3D0' },
};

const STAT = {
  todo:     { l:'할일',  c:'#6B7280', bg:'#F9FAFB', icon:'○' },
  progress: { l:'진행중', c:'#2563EB', bg:'#EFF6FF', icon:'◐' },
  done:     { l:'완료',  c:'#059669', bg:'#ECFDF5', icon:'●' },
};

const MOOD = ['😞','😕','😐','😊','😄'];

/* ══════════════════════════════════════════════════════════
   THEMES — 이미지의 뽀용한 파스텔 색감 기반 7가지 테마
══════════════════════════════════════════════════════════ */
const THEMES = {
  default: {
    id:'default', name:'기본', emoji:'⚪', desc:'깔끔한 화이트',
    sidebarBg:'#FFFFFF', sidebarBorder:'#F3F4F6',
    navActiveBg:null, // wsType 색상 사용
    pageBg:'#F8FAFC',
    cardBg:'#FFFFFF', cardBorder:'#F3F4F6',
    navTextColor:'#6B7280', navTextActive:null,
    preview:['#FFFFFF','#F3F4F6','#E5E7EB'],
  },
  bbosung: {
    id:'bbosung', name:'뽀송이', emoji:'🌸', desc:'달콤한 코튼캔디 핑크',
    sidebarBg:'#FFF0F6', sidebarBorder:'#FFD6E8',
    navActiveBg:'#FFD6E8',
    pageBg:'#FFF5FA',
    cardBg:'#FFFFFF', cardBorder:'#FFE4EF',
    navTextColor:'#C47BA0', navTextActive:'#A8517A',
    preview:['#FFF0F6','#FFD6E8','#F8A8C4'],
  },
  mintChoco: {
    id:'mintChoco', name:'민트초코', emoji:'🍃', desc:'상쾌한 민트 파스텔',
    sidebarBg:'#F0FAF5', sidebarBorder:'#C4E8D4',
    navActiveBg:'#C4E8D4',
    pageBg:'#F5FBF7',
    cardBg:'#FFFFFF', cardBorder:'#D4EFE0',
    navTextColor:'#5C9B78', navTextActive:'#3A7A58',
    preview:['#F0FAF5','#C4E8D4','#8BCCA8'],
  },
  butterLemon: {
    id:'butterLemon', name:'버터레몬', emoji:'🌼', desc:'따뜻한 버터 옐로우',
    sidebarBg:'#FFFEF0', sidebarBorder:'#FFF0B3',
    navActiveBg:'#FFF0B3',
    pageBg:'#FFFEF5',
    cardBg:'#FFFFFF', cardBorder:'#FFF5C0',
    navTextColor:'#B89A2C', navTextActive:'#8C7520',
    preview:['#FFFEF0','#FFF0B3','#F5D65C'],
  },
  lavender: {
    id:'lavender', name:'라벤더', emoji:'💜', desc:'몽환적인 소프트 퍼플',
    sidebarBg:'#F5F0FF', sidebarBorder:'#DDD0FF',
    navActiveBg:'#DDD0FF',
    pageBg:'#FAF7FF',
    cardBg:'#FFFFFF', cardBorder:'#E8DCFF',
    navTextColor:'#8B6DC4', navTextActive:'#6B4DA8',
    preview:['#F5F0FF','#DDD0FF','#BBA8F0'],
  },
  rosePink: {
    id:'rosePink', name:'로즈쿼츠', emoji:'🌷', desc:'부드러운 더스티 로즈',
    sidebarBg:'#FAF0F4', sidebarBorder:'#F0C8D8',
    navActiveBg:'#F0C8D8',
    pageBg:'#FDF5F8',
    cardBg:'#FFFFFF', cardBorder:'#F5D4E4',
    navTextColor:'#C4788C', navTextActive:'#A05A70',
    preview:['#FAF0F4','#F0C8D8','#E8A0B4'],
  },
  powderBlue: {
    id:'powderBlue', name:'파우더블루', emoji:'💙', desc:'시원한 파우더 블루',
    sidebarBg:'#F0F5FF', sidebarBorder:'#C8D8F0',
    navActiveBg:'#C8D8F0',
    pageBg:'#F5F8FF',
    cardBg:'#FFFFFF', cardBorder:'#D4E0F5',
    navTextColor:'#5A88C4', navTextActive:'#3A68A8',
    preview:['#F0F5FF','#C8D8F0','#90B4E0'],
  },
  peachCream: {
    id:'peachCream', name:'피치크림', emoji:'🍑', desc:'복숭아빛 크리미 톤',
    sidebarBg:'#FFF3EE', sidebarBorder:'#FFD4BE',
    navActiveBg:'#FFD4BE',
    pageBg:'#FFF8F5',
    cardBg:'#FFFFFF', cardBorder:'#FFE0D0',
    navTextColor:'#C4784A', navTextActive:'#A05830',
    preview:['#FFF3EE','#FFD4BE','#F5B090'],
  },
};

/* ══════════════════════════════════════════════════════════
   ICON SETS — 사이드바 네비게이션 아이콘 스타일
══════════════════════════════════════════════════════════ */
const ICON_SETS = {
  default: {
    id:'default', name:'기본', preview:'🏠',
    home:'🏠', todo:'✅', cal:'📅', assign:'📚', notes:'📝',
    meetings:'🎙️', projects:'📊', goals:'🎯', jour:'📖',
    workspace:'👥', notif:'🔔', template:'🎨', profile:'👤',
  },
  star: {
    id:'star', name:'별빛', preview:'⭐',
    home:'⭐', todo:'✨', cal:'🌙', assign:'📖', notes:'💫',
    meetings:'🌟', projects:'🪄', goals:'🌠', jour:'✨',
    workspace:'💫', notif:'🔔', template:'✨', profile:'🌟',
  },
  flower: {
    id:'flower', name:'꽃밭', preview:'🌸',
    home:'🌸', todo:'🌷', cal:'🌼', assign:'🌺', notes:'🌻',
    meetings:'🌹', projects:'💐', goals:'🌿', jour:'🍀',
    workspace:'🌱', notif:'🔔', template:'🎀', profile:'🌸',
  },
  minimal: {
    id:'minimal', name:'미니멀', preview:'○',
    home:'◎', todo:'□', cal:'△', assign:'◇', notes:'○',
    meetings:'▷', projects:'▣', goals:'◉', jour:'◈',
    workspace:'▣', notif:'●', template:'◈', profile:'○',
  },
};

/* ══════════════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════════════ */
const uid = () => Math.random().toString(36).slice(2, 9);
const tod = () => new Date().toISOString().split('T')[0];
const gc = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const ld = (k, d) => { try { const v = localStorage.getItem(k); return JSON.parse(v !== null ? v : JSON.stringify(d)); } catch { return d; } };
const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const moNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const dayNames = ['일','월','화','수','목','금','토'];
const fmtD = (d) => { if (!d) return ''; const dt = new Date(d + 'T00:00:00'); return `${dt.getMonth()+1}/${dt.getDate()}(${dayNames[dt.getDay()]})`; };
const fmtFull = (d) => { if (!d) return ''; const dt = new Date(d + 'T00:00:00'); return `${dt.getFullYear()}년 ${dt.getMonth()+1}월 ${dt.getDate()}일`; };
const dimMo = (y, m) => new Date(y, m + 1, 0).getDate();
const firstDay = (y, m) => new Date(y, m, 1).getDay();
const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
};

/* ══════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════ */
function Styles({ isDark }) {
  useEffect(() => {
    const el = document.createElement('style');
    el.id = 'wl-base';
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      html,body,#root{width:100%;height:100%;overflow:hidden;}
      body{font-family:'Nunito',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
      button,input,textarea,select{font-family:inherit;}
      input:focus,textarea:focus,select:focus{outline:none;}
      ::-webkit-scrollbar{width:5px;height:5px;}
      ::-webkit-scrollbar-track{background:transparent;}
      ::-webkit-scrollbar-thumb{background:#E5E7EB;border-radius:99px;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
      @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
      @keyframes pop{0%{transform:scale(.8);opacity:0;}70%{transform:scale(1.05);}100%{transform:scale(1);opacity:1;}}
      @keyframes spin{to{transform:rotate(360deg);}}
      @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.7;transform:scale(1.15);}}
      @keyframes slideRight{from{transform:translateX(-110%);}to{transform:translateX(0);}}
      .fu{animation:fadeUp .35s ease both;}
      .fi{animation:fadeIn .25s ease both;}
      .pp{animation:pop .38s cubic-bezier(.34,1.56,.64,1) both;}
      .sr{animation:slideRight .3s cubic-bezier(.34,1.2,.64,1);}
    `;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  useEffect(() => {
    let dark = document.getElementById('wl-dark');
    if (!dark) { dark = document.createElement('style'); dark.id = 'wl-dark'; document.head.appendChild(dark); }
    dark.textContent = isDark ? `
      [data-wl-dark] input, [data-wl-dark] textarea, [data-wl-dark] select {
        background: #1E293B !important; color: #E2E8F0 !important; border-color: #334155 !important;
      }
      [data-wl-dark] input::placeholder, [data-wl-dark] textarea::placeholder { color: #64748B !important; }
      [data-wl-dark] ::-webkit-scrollbar-thumb { background: #475569; }
    ` : '';
  }, [isDark]);

  return null;
}

/* ══════════════════════════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════════════════════════ */
function Btn({ children, onClick, color = '#111827', bg, outline, sm, full, disabled, style: s = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: sm ? '7px 14px' : '10px 20px',
      fontSize: sm ? 12 : 14, fontWeight: 700, borderRadius: sm ? 8 : 11,
      background: outline ? 'transparent' : (bg || color),
      color: outline ? color : 'white',
      border: outline ? `1.5px solid ${color}` : 'none',
      width: full ? '100%' : 'auto',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      opacity: disabled ? 0.45 : 1, cursor: disabled ? 'default' : 'pointer',
      transition: 'opacity .15s, transform .1s',
      ...s,
    }}
    onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(.97)'; }}
    onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
      {children}
    </button>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', rows, required, hint }) {
  const [foc, setFoc] = useState(false);
  const base = {
    width: '100%', padding: rows ? '10px 13px' : '10px 13px',
    fontSize: 14, fontWeight: 500, border: `1.5px solid ${foc ? '#6366F1' : '#E5E7EB'}`,
    borderRadius: 10, background: 'white', color: '#1F2937',
    transition: 'border-color .2s', boxShadow: foc ? '0 0 0 3px rgba(99,102,241,.1)' : 'none',
  };
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}{required && <span style={{ color: '#EF4444' }}> *</span>}</div>}
      {rows
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
            style={{ ...base, resize: 'none', lineHeight: 1.65 }}
            onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
            style={base}
            onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} />}
      {hint && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '10px 13px', fontSize: 14, fontWeight: 500, border: '1.5px solid #E5E7EB', borderRadius: 10, background: 'white', color: '#1F2937' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Modal({ title, onClose, children, width = 460 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pp" style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>{title}</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#F9FAFB', color: '#6B7280', fontSize: 14, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: '20px 22px' }}>{children}</div>
      </div>
    </div>
  );
}

function Empty({ icon, title, desc }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 6 }}>{title}</div>
      {desc && <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.65 }}>{desc}</p>}
    </div>
  );
}

function Badge({ children, color = '#6B7280', bg = '#F3F4F6' }) {
  return <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: 99, whiteSpace: 'nowrap' }}>{children}</span>;
}

/* ══════════════════════════════════════════════════════════
   PRO GATE MODAL — 무료 유저가 협업 기능 클릭 시 표시
══════════════════════════════════════════════════════════ */
function ProGateModal({ onClose, onUpgrade }) {
  return (
    <div style={{ position:'fixed',inset:0,zIndex:950,background:'rgba(0,0,0,.5)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}
      onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="pp" style={{ background:'white',borderRadius:24,width:'100%',maxWidth:360,padding:'36px 28px',boxShadow:'0 24px 64px rgba(0,0,0,.2)',textAlign:'center' }}>
        <div style={{ width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,#FFF3E0,#FFFDE7)',border:'2px solid #FDE68A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,margin:'0 auto 20px' }}>⚡️</div>
        <h2 style={{ fontSize:20,fontWeight:900,color:'#111827',marginBottom:10 }}>유료 기능이에요!</h2>
        <p style={{ fontSize:14,color:'#6B7280',lineHeight:1.75,marginBottom:28 }}>
          협업 워크스페이스는 Pro 플랜에서만<br/>사용할 수 있는 기능이에요.<br/>
          <span style={{ color:'#2563EB',fontWeight:700 }}>유료로 가입하고 더 많은 기능을 사용해 보세요!</span>
        </p>
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          <button onClick={onUpgrade} style={{ padding:'13px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#1E1B4B,#2563EB)',color:'white',fontSize:14,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
            ✨ Pro 시작하기
          </button>
          <button onClick={onClose} style={{ padding:'11px',borderRadius:12,border:'1.5px solid #E5E7EB',background:'white',color:'#9CA3AF',fontSize:13,fontWeight:600,cursor:'pointer' }}>
            나중에
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   AUTH SCREEN
══════════════════════════════════════════════════════════ */
function AuthScreen({ accounts, onAuth, onRegister }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const [signupToast, setSignupToast] = useState(false);

  const submit = async () => {
    setErr('');
    if (!email.includes('@')) { setErr('올바른 이메일 주소를 입력해주세요.'); return; }
    if (pw.length < 6) { setErr('비밀번호는 6자 이상이어야 해요.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    if (mode === 'login') {
      const acct = accounts.find(a => a.email === email.trim());
      if (!acct) { setErr('등록되지 않은 이메일이에요.'); return; }
      if (acct.pw !== pw) { setErr('비밀번호가 올바르지 않아요.'); return; }
      onAuth(acct);
    } else {
      if (!name.trim()) { setErr('이름을 입력해주세요.'); return; }
      if (accounts.find(a => a.email === email.trim())) { setErr('이미 가입된 이메일이에요.'); return; }
      const acct = { id: uid(), email: email.trim(), pw, name: name.trim(), nickname: '', wsType: '', isPro: false, avatar: null, createdAt: new Date().toISOString() };
      onRegister(acct);
      // ── 가입 환영 메일 발송 ──
      // EmailJS 연동: https://www.emailjs.com 에서 계정 생성 후 아래 값을 교체하세요
      // public/index.html의 <head>에 아래 스크립트 추가 필요:
      // <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
      // <script>emailjs.init("YOUR_PUBLIC_KEY")</script>
      try {
        if (window.emailjs) {
          await window.emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
            to_email: email.trim(),
            to_name: name.trim(),
            message: `안녕하세요 ${name.trim()}님, Workly에 가입해주셔서 감사해요! 🌿`,
          });
        }
      } catch(e) { /* EmailJS 미설정 시 무시 */ }
      setSignupToast(true);
      await new Promise(r => setTimeout(r, 2000));
      setSignupToast(false);
      onAuth(acct);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FAFAFA' }}>
      {/* Left panel */}
      <div style={{ width: '45%', background: 'linear-gradient(160deg, #1E1B4B 0%, #312E81 50%, #1E40AF 100%)', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(99,102,241,.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,.2) 0%, transparent 50%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌿</div>
            <div style={{ fontWeight: 900, fontSize: 22, color: 'white', letterSpacing: '-.5px' }}>Workly</div>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: 'white', lineHeight: 1.25, marginBottom: 20, letterSpacing: '-.5px' }}>
            모두를 위한<br />스마트한<br />워크스페이스
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', lineHeight: 1.7, marginBottom: 40 }}>
            학교, 회사, 개인 — 어떤 용도에도<br />최적화된 협업 공간을 경험하세요.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['📚 학교 — 과제, 노트, 일정 관리', '💼 회사 — 업무, 회의, 프로젝트', '✨ 개인 — 목표, 습관, 일기'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,.85)', fontSize: 14, fontWeight: 600 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA', flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {signupToast && (
            <div className="pp" style={{ background:'#ECFDF5',border:'1.5px solid #A7F3D0',borderRadius:14,padding:'14px 18px',marginBottom:20,display:'flex',alignItems:'center',gap:12 }}>
              <span style={{ fontSize:22 }}>📧</span>
              <div>
                <div style={{ fontSize:14,fontWeight:800,color:'#059669' }}>가입을 환영해요!</div>
                <div style={{ fontSize:12,color:'#6B7280',marginTop:2 }}>{email}로 가입 확인 메일이 전송되었어요.</div>
              </div>
            </div>
          )}
          <div className="fu" style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', marginBottom: 6 }}>
              {mode === 'login' ? '다시 오셨군요! 👋' : '시작해볼까요! 🚀'}
            </h1>
            <p style={{ fontSize: 14, color: '#6B7280' }}>
              {mode === 'login' ? '워크스페이스로 돌아가세요.' : '무료로 나만의 워크스페이스를 만들어요.'}
            </p>
          </div>

          <div className="fu" style={{ animationDelay: '.05s' }}>
            {/* Social login (decorative) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[{ label: 'Google', color: '#EA4335', icon: 'G' }, { label: 'Naver', color: '#03C75A', icon: 'N' }].map(({ label, color, icon }) => (
                <button key={label} title="준비 중" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'not-allowed', opacity: 0.55 }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: 'white' }}>{icon}</span>
                  {label}로 계속
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
              <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>이메일로 계속</span>
              <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
            </div>

            {mode === 'signup' && <Field value={name} onChange={setName} label="이름" placeholder="홍길동" required />}
            <Field value={email} onChange={setEmail} label="이메일" placeholder="name@gmail.com" type="email" required />
            <Field value={pw} onChange={setPw} label="비밀번호" placeholder={mode === 'signup' ? '6자 이상 입력' : '비밀번호 입력'} type="password" required
              hint={mode === 'signup' ? '영문, 숫자를 조합하면 더 안전해요' : undefined} />

            {err && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '9px 12px', fontSize: 12, color: '#DC2626', fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>{err}</div>}

            <button onClick={submit} disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #1E1B4B, #2563EB)', color: 'white',
              fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: loading ? 0.75 : 1,
            }}>
              {loading ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> 잠시만요...</> : (mode === 'login' ? '로그인' : '무료로 시작하기 →')}
            </button>

            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>{mode === 'login' ? '처음이신가요? ' : '이미 계정이 있으신가요? '}</span>
              <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErr(''); }} style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 800, color: '#2563EB', textDecoration: 'underline', cursor: 'pointer' }}>
                {mode === 'login' ? '가입하기' : '로그인'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ONBOARDING
══════════════════════════════════════════════════════════ */
function OnboardingScreen({ user, onDone }) {
  const [step, setStep] = useState(0);
  const [nick, setNick] = useState(user.name || '');
  const [wsType, setWsType] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 540 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 40, justifyContent: 'center' }}>
          {[0, 1].map(i => (
            <div key={i} style={{ height: 4, width: step >= i ? 56 : 28, borderRadius: 2, background: step >= i ? '#2563EB' : '#E5E7EB', transition: 'all .35s' }} />
          ))}
        </div>

        {step === 0 && (
          <div className="fu">
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}>👋</div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 8 }}>반가워요, {user.name}님!</h2>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>워크스페이스에서 사용할 닉네임을 설정해주세요.<br />다른 멤버들에게 이 이름으로 표시됩니다.</p>
            </div>
            <div style={{ background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,.06)', border: '1px solid #F3F4F6' }}>
              <Field value={nick} onChange={setNick} label="닉네임" placeholder="예: 개발자 길동, 디자이너 수현" hint="나중에 프로필에서 변경할 수 있어요" />
              <Btn onClick={() => { if (nick.trim()) setStep(1); }} disabled={!nick.trim()} full bg="#2563EB" style={{ padding: '13px', borderRadius: 12, fontSize: 15 }}>다음 →</Btn>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="fu">
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: '#111827', marginBottom: 8 }}>어떤 용도로 사용하실 건가요?</h2>
              <p style={{ fontSize: 14, color: '#6B7280' }}>선택에 따라 최적화된 기능을 제공해드려요</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {Object.entries(WS).map(([k, v]) => (
                <button key={k} onClick={() => setWsType(k)} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderRadius: 16, textAlign: 'left',
                  border: `2px solid ${wsType === k ? v.c : '#E5E7EB'}`,
                  background: wsType === k ? v.l : 'white', cursor: 'pointer', transition: 'all .15s',
                }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: wsType === k ? v.c : v.l, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{v.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 3 }}>{v.label}용</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{v.tagline}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {v.perks.slice(0, 2).map(p => <Badge key={p} color={v.d} bg={v.l}>{p}</Badge>)}
                    </div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${wsType === k ? v.c : '#D1D5DB'}`, background: wsType === k ? v.c : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {wsType === k && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                  </div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn onClick={() => setStep(0)} outline color="#6B7280" style={{ flex: 1, padding: '12px', borderRadius: 12 }}>← 이전</Btn>
              <button onClick={() => { if (wsType) onDone({ nickname: nick.trim(), wsType }); }} disabled={!wsType}
                style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: wsType ? (WS[wsType]&&WS[wsType].c) : '#9CA3AF', color: 'white', fontSize: 15, fontWeight: 700, cursor: wsType ? 'pointer' : 'default', opacity: wsType ? 1 : 0.5 }}>
                시작하기 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   HOME SCREEN
══════════════════════════════════════════════════════════ */
function HomeScreen({ user, todos, events, setScreen }) {
  const cfg = WS[user.wsType] || WS.personal;
  const todayTodos = todos.filter(t => t.dueDate === tod() && t.status !== 'done');
  const todayEvents = events.filter(e => e.date === tod());
  const done = todos.filter(t => t.status === 'done').length;
  const total = todos.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '안녕하세요' : '수고하셨어요';

  return (
    <div style={{ padding: '28px', overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div className="fu" style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#111827', marginBottom: 4 }}>{greeting}, {user.nickname || user.name}님! {cfg.icon}</div>
        <div style={{ fontSize: 14, color: '#6B7280' }}>{fmtFull(tod())} · {cfg.label}용 워크스페이스</div>
      </div>

      {/* Stats cards */}
      <div className="fu" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24, animationDelay: '.05s' }}>
        {[
          { label: '전체 할일', value: total + '개', icon: '📋', color: cfg.c },
          { label: '완료', value: done + '개', icon: '✅', color: '#059669' },
          { label: '완료율', value: pct + '%', icon: '📈', color: '#D97706' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{ background: 'white', borderRadius: 16, padding: '18px 16px', border: '1px solid #F3F4F6', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="fu" style={{ background: 'white', borderRadius: 16, padding: '18px 20px', border: '1px solid #F3F4F6', marginBottom: 20, animationDelay: '.1s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>전체 진행률</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: cfg.c }}>{pct}%</div>
        </div>
        <div style={{ height: 8, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${cfg.c}, ${cfg.d})`, borderRadius: 99, transition: 'width 1s ease' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Today's todos */}
        <div className="fu" style={{ background: 'white', borderRadius: 16, padding: '18px', border: '1px solid #F3F4F6', animationDelay: '.12s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>오늘 할일</div>
            <button onClick={() => setScreen('todo')} style={{ fontSize: 11, color: cfg.c, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>전체 →</button>
          </div>
          {todayTodos.length === 0
            ? <div style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '16px 0' }}>오늘 할일이 없어요 🎉</div>
            : todayTodos.slice(0, 4).map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F9FAFB' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIO[t.priority]&&PRIO[t.priority].c || '#6B7280', flexShrink: 0 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
              </div>
            ))
          }
        </div>

        {/* Today's events */}
        <div className="fu" style={{ background: 'white', borderRadius: 16, padding: '18px', border: '1px solid #F3F4F6', animationDelay: '.15s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>오늘 일정</div>
            <button onClick={() => setScreen('cal')} style={{ fontSize: 11, color: cfg.c, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>캘린더 →</button>
          </div>
          {todayEvents.length === 0
            ? <div style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '16px 0' }}>오늘 일정이 없어요</div>
            : todayEvents.slice(0, 4).map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F9FAFB' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.color || cfg.c, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{e.title}</div>
                  {e.time && <div style={{ fontSize: 11, color: '#9CA3AF' }}>{e.time}</div>}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TODO SCREEN
══════════════════════════════════════════════════════════ */
function TodoScreen({ todos, setTodos, wsType }) {
  const cfg = WS[wsType] || WS.personal;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', priority: 'medium', dueDate: '', category: '', notes: '' });
  const [filter, setFilter] = useState('all');

  const add = () => {
    if (!form.title.trim()) return;
    setTodos(p => [...p, { id: uid(), ...form, title: form.title.trim(), status: 'todo', createdAt: new Date().toISOString() }]);
    setForm({ title: '', priority: 'medium', dueDate: '', category: '', notes: '' });
    setShowModal(false);
  };

  const cycle = (id) => {
    setTodos(p => p.map(t => {
      if (t.id !== id) return t;
      const order = ['todo', 'progress', 'done'];
      const next = order[(order.indexOf(t.status) + 1) % order.length];
      return { ...t, status: next };
    }));
  };

  const del = (id) => setTodos(p => p.filter(t => t.id !== id));

  const filtered = filter === 'all' ? todos : todos.filter(t => t.status === filter);
  const cols = ['todo', 'progress', 'done'];

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>
            {wsType === 'company' ? '업무 관리' : '할일 관리'} ✅
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{todos.length}개 항목 · {todos.filter(t => t.status === 'done').length}개 완료</div>
        </div>
        <Btn onClick={() => setShowModal(true)} bg={cfg.c} style={{ padding: '10px 18px', borderRadius: 11 }}>+ 추가</Btn>
      </div>

      {/* Filter tabs */}
      <div className="fu" style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#F9FAFB', borderRadius: 11, padding: 4, animationDelay: '.05s' }}>
        {[{ k: 'all', l: '전체' }, ...cols.map(k => ({ k, l: STAT[k].l }))].map(({ k, l }) => (
          <button key={k} onClick={() => setFilter(k)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: filter === k ? 'white' : 'transparent', color: filter === k ? cfg.c : '#6B7280', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: filter === k ? '0 1px 4px rgba(0,0,0,.08)' : 'none', transition: 'all .15s' }}>{l}</button>
        ))}
      </div>

      {/* Kanban columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, flex: 1, overflow: 'auto', minHeight: 0 }}>
        {cols.map(col => {
          const items = filtered.filter(t => t.status === col);
          const s = STAT[col];
          return (
            <div key={col} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px 12px', background: s.bg, borderRadius: 10 }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: s.c }}>{s.l}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: s.c, background: 'white', borderRadius: 99, padding: '1px 8px' }}>{items.length}</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.length === 0
                  ? <div style={{ textAlign: 'center', padding: '32px 12px', color: '#D1D5DB', fontSize: 13, fontWeight: 600 }}>없음</div>
                  : items.map(t => (
                    <div key={t.id} style={{ background: 'white', borderRadius: 13, padding: '14px', border: '1px solid #F3F4F6', boxShadow: '0 2px 6px rgba(0,0,0,.04)', cursor: 'pointer' }}
                      onClick={() => cycle(t.id)}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.4, textDecoration: t.status === 'done' ? 'line-through' : 'none', opacity: t.status === 'done' ? 0.55 : 1 }}>{t.title}</div>
                        <button onClick={e => { e.stopPropagation(); del(t.id); }} style={{ background: 'none', border: 'none', color: '#D1D5DB', fontSize: 13, flexShrink: 0, cursor: 'pointer' }}>✕</button>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <Badge color={PRIO[t.priority]&&PRIO[t.priority].c} bg={PRIO[t.priority]&&PRIO[t.priority].bg}>{PRIO[t.priority]&&PRIO[t.priority].l}</Badge>
                        {t.dueDate && <Badge color="#6B7280" bg="#F9FAFB">📅 {fmtD(t.dueDate)}</Badge>}
                        {t.category && <Badge color={cfg.d} bg={cfg.l}>{t.category}</Badge>}
                      </div>
                      {t.notes && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8, lineHeight: 1.5 }}>{t.notes}</div>}
                      <div style={{ fontSize: 11, color: '#D1D5DB', marginTop: 8, fontWeight: 600 }}>탭해서 상태 변경</div>
                    </div>
                  ))
                }
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal title={wsType === 'company' ? '업무 추가' : '할일 추가'} onClose={() => setShowModal(false)}>
          <Field value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} label="제목" placeholder="할일을 입력하세요" required />
          <Select label="우선순위" value={form.priority} onChange={v => setForm(p => ({ ...p, priority: v }))}
            options={Object.entries(PRIO).map(([k, v]) => ({ value: k, label: v.l }))} />
          <Field value={form.dueDate} onChange={v => setForm(p => ({ ...p, dueDate: v }))} label="마감일" type="date" />
          <Field value={form.category} onChange={v => setForm(p => ({ ...p, category: v }))} label={wsType === 'school' ? '과목' : wsType === 'company' ? '프로젝트' : '카테고리'} placeholder="선택 사항" />
          <Field value={form.notes} onChange={v => setForm(p => ({ ...p, notes: v }))} label="메모" placeholder="추가 설명 (선택)" rows={3} />
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Btn onClick={() => setShowModal(false)} outline color="#6B7280" style={{ flex: 1 }}>취소</Btn>
            <Btn onClick={add} bg={cfg.c} style={{ flex: 2 }}>추가하기</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CALENDAR SCREEN
══════════════════════════════════════════════════════════ */
function CalendarScreen({ events, setEvents, wsType }) {
  const cfg = WS[wsType] || WS.personal;
  const now = new Date();
  const [yr, setYr] = useState(now.getFullYear());
  const [mo, setMo] = useState(now.getMonth());
  const [selDay, setSelDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', time: '', color: cfg.c, notes: '' });

  const days = dimMo(yr, mo);
  const first = firstDay(yr, mo);
  const todayDate = tod();
  const COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2', '#BE185D'];

  const eventsForDay = (d) => {
    const ds = `${yr}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return events.filter(e => e.date === ds);
  };

  const addEvent = () => {
    if (!form.title.trim() || !selDay) return;
    const ds = `${yr}-${String(mo + 1).padStart(2, '0')}-${String(selDay).padStart(2, '0')}`;
    setEvents(p => [...p, { id: uid(), ...form, title: form.title.trim(), date: ds }]);
    setForm({ title: '', time: '', color: cfg.c, notes: '' });
    setShowModal(false);
  };

  const del = (id) => setEvents(p => p.filter(e => e.id !== id));

  const selDate = selDay ? `${yr}-${String(mo + 1).padStart(2, '0')}-${String(selDay).padStart(2, '0')}` : null;
  const selEvents = selDay ? eventsForDay(selDay) : [];

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>📅 {moNames[mo]} {yr}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { if (mo === 0) { setYr(y => y - 1); setMo(11); } else setMo(m => m - 1); }} style={{ width: 34, height: 34, borderRadius: 9, border: '1.5px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <button onClick={() => { if (mo === 11) { setYr(y => y + 1); setMo(0); } else setMo(m => m + 1); }} style={{ width: 34, height: 34, borderRadius: 9, border: '1.5px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, flex: 1, minHeight: 0 }}>
        {/* Calendar grid */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 8 }}>
            {dayNames.map((d, i) => <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: i === 0 ? '#EF4444' : i === 6 ? '#2563EB' : '#9CA3AF', padding: '6px 0' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {Array(first).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: days }, (_, i) => {
              const d = i + 1;
              const ds = `${yr}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const isToday = ds === todayDate;
              const isSel = d === selDay;
              const dayEvts = eventsForDay(d);
              return (
                <div key={d} onClick={() => setSelDay(d)} style={{
                  minHeight: 72, borderRadius: 11, padding: '8px 6px', cursor: 'pointer',
                  background: isSel ? cfg.l : isToday ? '#F0F4FF' : 'white',
                  border: `1.5px solid ${isSel ? cfg.c : isToday ? cfg.m : '#F3F4F6'}`,
                  transition: 'all .15s',
                }}>
                  <div style={{ fontSize: 13, fontWeight: isSel || isToday ? 800 : 500, color: isSel ? cfg.c : isToday ? cfg.d : '#374151', marginBottom: 4 }}>{d}</div>
                  {dayEvts.slice(0, 3).map(e => (
                    <div key={e.id} style={{ fontSize: 10, fontWeight: 600, color: 'white', background: e.color || cfg.c, borderRadius: 4, padding: '1px 5px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                  ))}
                  {dayEvts.length > 3 && <div style={{ fontSize: 10, color: '#9CA3AF' }}>+{dayEvts.length - 3}개</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ background: 'white', borderRadius: 16, padding: '18px', border: '1px solid #F3F4F6', overflowY: 'auto' }}>
          {selDay ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>{fmtFull(selDate)}</div>
                <Btn onClick={() => setShowModal(true)} bg={cfg.c} sm>+ 추가</Btn>
              </div>
              {selEvents.length === 0
                ? <Empty icon="📅" title="일정 없음" desc="+ 추가 버튼으로 일정을 추가하세요" />
                : selEvents.map(e => (
                  <div key={e.id} style={{ borderLeft: `3px solid ${e.color || cfg.c}`, padding: '10px 12px', background: '#FAFAFA', borderRadius: '0 10px 10px 0', marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{e.title}</div>
                      <button onClick={() => del(e.id)} style={{ background: 'none', border: 'none', color: '#D1D5DB', cursor: 'pointer', fontSize: 12 }}>✕</button>
                    </div>
                    {e.time && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>🕐 {e.time}</div>}
                    {e.notes && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 5 }}>{e.notes}</div>}
                  </div>
                ))
              }
            </>
          ) : (
            <Empty icon="👆" title="날짜를 선택하세요" desc="날짜를 클릭해서 일정을 확인하고 추가하세요" />
          )}
        </div>
      </div>

      {showModal && (
        <Modal title="일정 추가" onClose={() => setShowModal(false)}>
          <Field value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} label="제목" placeholder="일정 제목 입력" required />
          <Field value={form.time} onChange={v => setForm(p => ({ ...p, time: v }))} label="시간" placeholder="예: 14:00" />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>색상</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map(c => <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #111827' : '3px solid transparent', cursor: 'pointer' }} />)}
            </div>
          </div>
          <Field value={form.notes} onChange={v => setForm(p => ({ ...p, notes: v }))} label="메모" placeholder="선택 사항" rows={2} />
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={() => setShowModal(false)} outline color="#6B7280" style={{ flex: 1 }}>취소</Btn>
            <Btn onClick={addEvent} bg={cfg.c} style={{ flex: 2 }}>추가하기</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ASSIGNMENTS SCREEN (School)
══════════════════════════════════════════════════════════ */
function AssignmentsScreen({ assigns, setAssigns }) {
  const cfg = WS.school;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subject: '', title: '', dueDate: '', status: 'not_started', description: '', priority: 'medium' });

  const ASTATS = {
    not_started: { l: '미시작', c: '#6B7280', bg: '#F9FAFB' },
    in_progress: { l: '진행중', c: '#2563EB', bg: '#EFF6FF' },
    submitted: { l: '제출완료', c: '#059669', bg: '#ECFDF5' },
    graded: { l: '채점완료', c: '#7C3AED', bg: '#F5F3FF' },
  };

  const add = () => {
    if (!form.title.trim()) return;
    setAssigns(p => [...p, { id: uid(), ...form, title: form.title.trim() }]);
    setForm({ subject: '', title: '', dueDate: '', status: 'not_started', description: '', priority: 'medium' });
    setShowModal(false);
  };

  const del = (id) => setAssigns(p => p.filter(a => a.id !== id));
  const upd = (id, key, val) => setAssigns(p => p.map(a => a.id === id ? { ...a, [key]: val } : a));

  const subjects = [...new Set(assigns.map(a => a.subject).filter(Boolean))];

  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>📚 과제 관리</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{assigns.length}개 과제</div>
        </div>
        <Btn onClick={() => setShowModal(true)} bg={cfg.c}>+ 과제 추가</Btn>
      </div>

      {assigns.length === 0
        ? <Empty icon="📚" title="과제가 없어요" desc="+ 과제 추가 버튼으로 과제를 등록하세요" />
        : assigns.map(a => (
          <div key={a.id} className="fu" style={{ background: 'white', borderRadius: 14, padding: '16px', border: '1px solid #F3F4F6', marginBottom: 12, boxShadow: '0 2px 6px rgba(0,0,0,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                {a.subject && <div style={{ fontSize: 11, fontWeight: 800, color: cfg.c, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>{a.subject}</div>}
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', textDecoration: a.status === 'graded' ? 'line-through' : 'none', opacity: a.status === 'graded' ? 0.6 : 1 }}>{a.title}</div>
                {a.description && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 5, lineHeight: 1.5 }}>{a.description}</div>}
              </div>
              <button onClick={() => del(a.id)} style={{ background: 'none', border: 'none', color: '#D1D5DB', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {a.dueDate && <Badge color="#6B7280" bg="#F9FAFB">📅 {fmtD(a.dueDate)}</Badge>}
              <Badge color={PRIO[a.priority]&&PRIO[a.priority].c} bg={PRIO[a.priority]&&PRIO[a.priority].bg}>{PRIO[a.priority]&&PRIO[a.priority].l}</Badge>
              <select value={a.status} onChange={e => upd(a.id, 'status', e.target.value)}
                style={{ fontSize: 11, fontWeight: 700, color: ASTATS[a.status]&&ASTATS[a.status].c, background: ASTATS[a.status]&&ASTATS[a.status].bg, border: 'none', borderRadius: 99, padding: '2px 8px', cursor: 'pointer' }}>
                {Object.entries(ASTATS).map(([k, v]) => <option key={k} value={k}>{v.l}</option>)}
              </select>
            </div>
          </div>
        ))
      }

      {showModal && (
        <Modal title="과제 추가" onClose={() => setShowModal(false)}>
          <Field value={form.subject} onChange={v => setForm(p => ({ ...p, subject: v }))} label="과목" placeholder="예: 수학, 영어, 국어" />
          <Field value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} label="과제명" placeholder="과제 제목 입력" required />
          <Field value={form.dueDate} onChange={v => setForm(p => ({ ...p, dueDate: v }))} label="마감일" type="date" />
          <Select label="우선순위" value={form.priority} onChange={v => setForm(p => ({ ...p, priority: v }))}
            options={Object.entries(PRIO).map(([k, v]) => ({ value: k, label: v.l }))} />
          <Field value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} label="설명" placeholder="과제 설명, 제출 방법 등" rows={3} />
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={() => setShowModal(false)} outline color="#6B7280" style={{ flex: 1 }}>취소</Btn>
            <Btn onClick={add} bg={cfg.c} style={{ flex: 2 }}>추가하기</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   NOTES SCREEN (School)
══════════════════════════════════════════════════════════ */
function NotesScreen({ notes, setNotes }) {
  const cfg = WS.school;
  const [showModal, setShowModal] = useState(false);
  const [selNote, setSelNote] = useState(null);
  const [form, setForm] = useState({ subject: '', title: '', content: '' });
  const [filter, setFilter] = useState('전체');

  const add = () => {
    if (!form.title.trim()) return;
    setNotes(p => [...p, { id: uid(), ...form, date: tod() }]);
    setForm({ subject: '', title: '', content: '' });
    setShowModal(false);
  };

  const del = (id) => { setNotes(p => p.filter(n => n.id !== id)); if (selNote&&selNote.id === id) setSelNote(null); };

  const subjects = ['전체', ...new Set(notes.map(n => n.subject).filter(Boolean))];
  const filtered = filter === '전체' ? notes : notes.filter(n => n.subject === filter);

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>📝 수업 노트</div>
        <Btn onClick={() => setShowModal(true)} bg={cfg.c}>+ 노트 추가</Btn>
      </div>
      {/* Subject filter */}
      <div className="fu" style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 2, animationDelay: '.05s' }}>
        {subjects.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 99, border: `1.5px solid ${filter === s ? cfg.c : '#E5E7EB'}`, background: filter === s ? cfg.l : 'white', color: filter === s ? cfg.d : '#6B7280', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{s}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Note list */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0
            ? <Empty icon="📝" title="노트가 없어요" desc="노트를 추가해보세요" />
            : filtered.map(n => (
              <div key={n.id} onClick={() => setSelNote(n)} style={{
                background: selNote&&selNote.id === n.id ? cfg.l : 'white', border: `1.5px solid ${selNote&&selNote.id === n.id ? cfg.c : '#F3F4F6'}`,
                borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all .12s',
              }}>
                {n.subject && <div style={{ fontSize: 10, fontWeight: 800, color: cfg.c, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>{n.subject}</div>}
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{n.title}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{fmtFull(n.date)}</div>
              </div>
            ))
          }
        </div>
        {/* Note content */}
        <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1px solid #F3F4F6', overflowY: 'auto' }}>
          {selNote ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  {selNote.subject && <div style={{ fontSize: 11, fontWeight: 800, color: cfg.c, textTransform: 'uppercase', marginBottom: 6 }}>{selNote.subject}</div>}
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>{selNote.title}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{fmtFull(selNote.date)}</div>
                </div>
                <button onClick={() => del(selNote.id)} style={{ background: '#FEF2F2', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#EF4444', fontWeight: 700, cursor: 'pointer' }}>삭제</button>
              </div>
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{selNote.content || '(내용 없음)'}</div>
            </>
          ) : <Empty icon="📖" title="노트를 선택하세요" desc="왼쪽에서 노트를 선택하면 내용이 표시됩니다" />}
        </div>
      </div>
      {showModal && (
        <Modal title="노트 추가" onClose={() => setShowModal(false)}>
          <Field value={form.subject} onChange={v => setForm(p => ({ ...p, subject: v }))} label="과목" placeholder="예: 수학, 영어" />
          <Field value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} label="제목" placeholder="노트 제목" required />
          <Field value={form.content} onChange={v => setForm(p => ({ ...p, content: v }))} label="내용" placeholder="수업 내용을 입력하세요..." rows={8} />
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={() => setShowModal(false)} outline color="#6B7280" style={{ flex: 1 }}>취소</Btn>
            <Btn onClick={add} bg={cfg.c} style={{ flex: 2 }}>저장하기</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MEETINGS SCREEN (Company)
══════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════
   MEETINGS SCREEN (Company) — AI 회의 요약 + 할일 추출
══════════════════════════════════════════════════════════ */
function MeetingsScreen({ meetings, setMeetings, todos, setTodos }) {
  const cfg = WS.company;
  const [mode, setMode] = useState('list'); // 'list' | 'ai' | 'manual'
  const [sel, setSel] = useState(null);

  // AI 분석 상태
  const [aiText, setAiText] = useState('');
  const [aiTitle, setAiTitle] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const fileRef = useRef(null);

  // 🎙️ 실시간 녹음 상태
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [recTranscript, setRecTranscript] = useState('');
  const [recInterim, setRecInterim] = useState('');
  const [recError, setRecError] = useState('');
  const mediaRecRef = useRef(null);
  const speechRecRef = useRef(null);
  const recTimerRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    setRecError('');

    // 브라우저 지원 확인
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setRecError('이 브라우저는 녹음을 지원하지 않아요. Chrome 또는 Edge를 사용해주세요.');
      return;
    }

    // HTTPS 확인
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setRecError('녹음 기능은 HTTPS 환경에서만 작동해요. (배포된 주소에서 사용해주세요)');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      // MediaRecorder
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'audio/ogg';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = '';

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        const dateStr = new Date().toLocaleDateString('ko-KR', {month:'2-digit',day:'2-digit'}).replace(/\./g,'').replace(' ','');
        const file = new File([blob], '회의녹음_' + dateStr + '.' + (mimeType.includes('ogg')?'ogg':'webm'), { type: mimeType || 'audio/webm' });
        setAudioFile(file);
        if (!aiTitle) setAiTitle('회의 녹음 ' + new Date().toLocaleDateString('ko-KR'));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start(1000);
      mediaRecRef.current = mr;

      // Web Speech API
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const sr = new SR();
        sr.lang = 'ko-KR';
        sr.continuous = true;
        sr.interimResults = true;
        let finalText = '';
        sr.onresult = (e) => {
          let interim = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' ';
            else interim += e.results[i][0].transcript;
          }
          setRecTranscript(finalText);
          setRecInterim(interim);
          setAiText(finalText);
        };
        sr.onerror = (e) => {
          if (e.error === 'no-speech') return;
          if (e.error === 'not-allowed') setRecError('마이크 권한이 거부됐어요. 브라우저 설정에서 허용해주세요.');
        };
        sr.onend = () => { if (recording) { try { sr.start(); } catch(e) {} } };
        sr.start();
        speechRecRef.current = sr;
      } else {
        setRecError('이 브라우저는 실시간 자막을 지원하지 않아요. 녹음은 계속 진행돼요. (Chrome 권장)');
      }

      setRecSeconds(0);
      setRecTranscript('');
      setRecInterim('');
      recTimerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
      setRecording(true);

    } catch(e) {
      console.error('녹음 오류:', e);
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setRecError('마이크 권한이 거부됐어요. 주소창 왼쪽 🔒 아이콘을 클릭해서 마이크를 허용해주세요.');
      } else if (e.name === 'NotFoundError') {
        setRecError('마이크를 찾을 수 없어요. 마이크가 연결되어 있는지 확인해주세요.');
      } else {
        setRecError('녹음을 시작할 수 없어요: ' + e.message);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecRef.current) {
      try { mediaRecRef.current.stop(); } catch(e) {}
      mediaRecRef.current = null;
    }
    if (speechRecRef.current) {
      try { speechRecRef.current.abort(); } catch(e) {}
      speechRecRef.current = null;
    }
    if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
    setRecording(false);
    setRecInterim('');
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => () => {
    if (mediaRecRef.current) mediaRecRef.current.stop();
    if (speechRecRef.current) speechRecRef.current.stop();
    if (recTimerRef.current) clearInterval(recTimerRef.current);
  }, []);

  const fmtRecTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // 수동 회의록 상태
  const [form, setForm] = useState({ title:'',date:tod(),time:'',attendees:'',agenda:'',actionItems:'' });

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAudioFile(file);
    setAiTitle(file.name.replace(/\.[^.]+$/, ''));
  };

  const analyzeWithAI = async () => {
    const inputText = aiText.trim();
    if (!inputText && !audioFile) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const prompt = inputText
        ? `다음 회의 내용을 분석해서 아래 형식의 JSON으로만 응답해주세요 (한국어로):

회의 내용:
${inputText}

응답 형식 (JSON만, 마크다운 없이):
{"summary":"3-4문장 요약","decisions":["주요 결정사항1","결정사항2"],"todos":["할일1","할일2","할일3"],"keywords":["키워드1","키워드2","키워드3"],"duration":"예상 회의시간 (예: 약 30분)"}`
        : `회의 파일명: ${audioFile.name}
이 회의 파일을 분석한 샘플 요약을 JSON으로 생성해주세요 (실제 음성 파일은 텍스트로 변환 후 분석이 필요합니다):
{"summary":"음성 파일이 업로드되었습니다. 회의 내용을 텍스트로 입력하시면 AI가 자동으로 분석합니다.","decisions":["텍스트 입력창에 회의 내용을 붙여넣어 주세요"],"todos":["회의 내용 텍스트 변환 후 재분석"],"keywords":["회의","분석","할일"],"duration":"분석 대기 중"}`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:1000,
          messages:[{ role:'user', content:prompt }]
        })
      });
      const data = await res.json();
      const raw = data.content[0].text;
      const cleaned = raw.replace(/```json|```/g,'').trim();
      const parsed = JSON.parse(cleaned);
      setAiResult(parsed);
    } catch(e) {
      setAiResult({ summary:'분석 중 오류가 발생했어요. 회의 내용을 텍스트로 입력해보세요.', decisions:[], todos:[], keywords:[], duration:'알 수 없음' });
    }
    setAiLoading(false);
  };

  const saveMeetingFromAI = () => {
    if (!aiResult) return;
    const m = {
      id:uid(), title:aiTitle||'AI 회의 요약 '+new Date().toLocaleDateString('ko-KR'),
      date:tod(), time:'', attendees:[],
      agenda:aiText, actionItems:aiResult.todos.join('\n'),
      aiSummary:aiResult.summary, aiDecisions:aiResult.decisions, aiKeywords:aiResult.keywords,
      isAI:true
    };
    setMeetings(p=>[m,...p]);
    // 할일도 자동 추가
    if (setTodos && aiResult.todos.length > 0) {
      const newTodos = aiResult.todos.map(t=>({ id:uid(), title:t, status:'todo', priority:'medium', dueDate:'', category:'회의', notes:'AI 회의 요약에서 추출', createdAt:new Date().toISOString() }));
      setTodos(p=>[...p, ...newTodos]);
    }
    setAiResult(null); setAiText(''); setAiTitle(''); setAudioFile(null); setMode('list');
  };

  const addManual = () => {
    if (!form.title.trim()) return;
    setMeetings(p=>[...p, { id:uid(), ...form, title:form.title.trim(), attendees:form.attendees.split(',').map(s=>s.trim()).filter(Boolean), isAI:false }]);
    setForm({ title:'',date:tod(),time:'',attendees:'',agenda:'',actionItems:'' });
    setMode('list');
  };

  const del = (id) => { setMeetings(p=>p.filter(m=>m.id!==id)); if(sel && sel.id===id) setSel(null); };

  if (mode==='ai') return (
    <div style={{ padding:'24px',height:'100%',overflowY:'auto' }}>
      <div className="fu" style={{ display:'flex',alignItems:'center',gap:12,marginBottom:24 }}>
        <button onClick={()=>{setMode('list');setAiResult(null);setAiText('');setAudioFile(null);}} style={{ width:34,height:34,borderRadius:10,border:'1.5px solid #E5E7EB',background:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>←</button>
        <div>
          <div style={{ fontSize:18,fontWeight:900,color:'#111827' }}>🤖 AI 회의 분석</div>
          <div style={{ fontSize:12,color:'#9CA3AF' }}>음성 업로드 또는 텍스트 입력 → 자동 요약 + 할일 추출</div>
        </div>
      </div>

      {/* 🎙️ 실시간 녹음 섹션 */}
      <div style={{ background:'white',borderRadius:16,padding:'18px',border:'1.5px solid '+(recording?cfg.c:'#F3F4F6'),marginBottom:16,transition:'border-color .3s' }}>
        <div style={{ fontSize:14,fontWeight:800,color:'#111827',marginBottom:12 }}>🎙️ 실시간 녹음</div>

        {!recording ? (
          <>
            {recError && (
              <div className="fu" style={{ background:'#FEF2F2',border:'1.5px solid #FECACA',borderRadius:12,padding:'12px 16px',marginBottom:12,fontSize:13,fontWeight:600,color:'#DC2626',lineHeight:1.6 }}>
                ⚠️ {recError}
              </div>
            )}
            <button onClick={startRecording} style={{ width:'100%',padding:'20px',borderRadius:14,border:'2px dashed '+cfg.c,background:cfg.l,cursor:'pointer',textAlign:'center' }}>
              <div style={{ fontSize:36,marginBottom:8 }}>🎙️</div>
              <div style={{ fontSize:15,fontWeight:800,color:cfg.c }}>녹음 시작하기</div>
              <div style={{ fontSize:12,color:cfg.d,marginTop:4 }}>클릭하면 마이크 권한을 요청해요 · 말하는 내용이 자동으로 텍스트로 변환돼요</div>
              <div style={{ fontSize:11,color:'#9CA3AF',marginTop:6 }}>🌐 Chrome / Edge 권장</div>
            </button>
          </>
        ) : (
          <div>
            {/* 녹음 중 UI */}
            <div style={{ display:'flex',alignItems:'center',gap:16,background:cfg.l,borderRadius:14,padding:'16px 20px',marginBottom:14 }}>
              <div style={{ width:44,height:44,borderRadius:'50%',background:cfg.c,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,animation:'pulse 1.2s ease-in-out infinite' }}>
                <div style={{ width:14,height:14,borderRadius:'50%',background:'white' }}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14,fontWeight:800,color:cfg.c }}>녹음 중...</div>
                <div style={{ fontSize:22,fontWeight:900,color:'#111827',fontVariantNumeric:'tabular-nums' }}>{fmtRecTime(recSeconds)}</div>
              </div>
              <button onClick={stopRecording} style={{ padding:'10px 20px',borderRadius:10,border:'none',background:'#EF4444',color:'white',fontSize:14,fontWeight:800,cursor:'pointer' }}>■ 정지</button>
            </div>

            {/* 실시간 자막 */}
            <div style={{ background:'#F9FAFB',borderRadius:12,padding:'14px',minHeight:80,border:'1px solid #E5E7EB' }}>
              <div style={{ fontSize:11,fontWeight:700,color:'#9CA3AF',marginBottom:8 }}>실시간 자막</div>
              <div style={{ fontSize:14,color:'#374151',lineHeight:1.75 }}>
                {recTranscript && <span>{recTranscript}</span>}
                {recInterim && <span style={{ color:'#9CA3AF',fontStyle:'italic' }}>{recInterim}</span>}
                {!recTranscript && !recInterim && (
                  <span style={{ color:'#D1D5DB' }}>말씀하시면 여기에 실시간으로 표시돼요...</span>
                )}
              </div>
            </div>
            <div style={{ fontSize:11,color:'#9CA3AF',marginTop:8 }}>
              💡 Chrome/Edge에서 가장 잘 작동해요 · Web Speech API 사용 중
            </div>
          </div>
        )}
      </div>

      {/* 음성 파일 업로드 */}
      <div style={{ background:'white',borderRadius:16,padding:'18px',border:'1px solid #F3F4F6',marginBottom:16 }}>
        <div style={{ fontSize:14,fontWeight:800,color:'#111827',marginBottom:12 }}>📁 기존 녹음 파일 업로드</div>
        <input ref={fileRef} type="file" accept="audio/*,video/*" onChange={handleAudioUpload} style={{ display:'none' }}/>
        {audioFile ? (
          <div style={{ display:'flex',alignItems:'center',gap:12,background:'#F0FDFA',borderRadius:12,padding:'12px 16px',border:'1.5px solid '+cfg.m }}>
            <span style={{ fontSize:24 }}>🎙️</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13,fontWeight:700,color:'#111827' }}>{audioFile.name}</div>
              <div style={{ fontSize:12,color:'#6B7280' }}>{(audioFile.size/1024/1024).toFixed(1)} MB</div>
              <audio src={URL.createObjectURL(audioFile)} controls style={{ width:'100%',marginTop:8,height:32 }}/>
            </div>
            <button onClick={()=>{setAudioFile(null);setAiTitle('');}} style={{ background:'none',border:'none',color:'#9CA3AF',cursor:'pointer',fontSize:16 }}>✕</button>
          </div>
        ) : (
          <button onClick={()=>fileRef.current && fileRef.current.click()} style={{ width:'100%',padding:'20px',borderRadius:12,border:'2px dashed #E5E7EB',background:'#FAFAFA',cursor:'pointer',textAlign:'center' }}>
            <div style={{ fontSize:32,marginBottom:8 }}>🎙️</div>
            <div style={{ fontSize:14,fontWeight:700,color:'#374151' }}>클릭해서 녹음 파일 선택</div>
            <div style={{ fontSize:12,color:'#9CA3AF',marginTop:4 }}>MP3, M4A, WAV 등 지원 · 갤러리/파일에서 선택 가능</div>
          </button>
        )}
        {audioFile&&(
          <div style={{ marginTop:10,background:'#FFFBEB',borderRadius:9,padding:'10px 14px',fontSize:12,color:'#92400E',lineHeight:1.6 }}>
            💡 <strong>음성→텍스트 자동변환</strong>은 AssemblyAI API 연동이 필요해요.<br/>
            아래 텍스트 입력창에 회의 내용을 직접 붙여넣으면 바로 AI 분석이 가능해요!
          </div>
        )}
      </div>

      {/* 회의 제목 */}
      <Field value={aiTitle} onChange={setAiTitle} label="회의 제목" placeholder="예: 마케팅 전략 회의"/>

      {/* 텍스트 입력 */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:6,textTransform:'uppercase',letterSpacing:'.04em' }}>회의 내용 텍스트 <span style={{ color:'#9CA3AF',fontWeight:500 }}>(음성 파일이 없으면 필수)</span></div>
        <textarea value={aiText} onChange={e=>setAiText(e.target.value)} rows={8}
          placeholder={'회의 내용을 여기에 입력하거나 붙여넣어 주세요.\n\n예시:\n- 음악회 준비 일정: 오후 2시~오후 6시\n- 담당자: 홍길동 (무대), 이수현 (음향)\n- 예산: 50만원 승인됨\n- 다음 회의: 다음주 월요일 10시'}
          style={{ width:'100%',padding:'12px',fontSize:13,border:'1.5px solid #E5E7EB',borderRadius:12,resize:'none',fontFamily:'inherit',lineHeight:1.65 }}/>
      </div>

      {/* 녹음 완료 후 메시지 */}
      {!recording && audioFile && audioFile.name.includes('녹음_') && (
        <div className="fu" style={{ background:'#ECFDF5',border:'1.5px solid #A7F3D0',borderRadius:12,padding:'12px 16px',marginBottom:12,display:'flex',alignItems:'center',gap:10 }}>
          <span style={{ fontSize:18 }}>✅</span>
          <div>
            <div style={{ fontSize:13,fontWeight:700,color:'#059669' }}>녹음 완료! 자막이 아래 텍스트 입력창에 자동으로 채워졌어요.</div>
            <div style={{ fontSize:12,color:'#6B7280',marginTop:2 }}>내용을 확인하고 AI 분석을 시작하세요.</div>
          </div>
        </div>
      )}

      <button onClick={analyzeWithAI} disabled={aiLoading||(!aiText.trim()&&!audioFile)} style={{ width:'100%',padding:'13px',borderRadius:12,border:'none',background:aiLoading||(!aiText.trim()&&!audioFile)?'#E5E7EB':'linear-gradient(135deg,'+cfg.c+','+cfg.d+')',color:'white',fontSize:15,fontWeight:800,cursor:aiLoading?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:20 }}>
        {aiLoading?<><div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin .7s linear infinite' }}/>분석 중...</>:'🤖 AI 분석 시작'}
      </button>

      {/* AI 결과 */}
      {aiResult&&(
        <div className="fu" style={{ background:'white',borderRadius:18,border:'1.5px solid '+cfg.m,overflow:'hidden' }}>
          <div style={{ background:'linear-gradient(135deg,'+cfg.c+','+cfg.d+')',padding:'16px 20px' }}>
            <div style={{ fontSize:15,fontWeight:900,color:'white' }}>🤖 AI 분석 결과</div>
            {aiResult.duration&&<div style={{ fontSize:12,color:'rgba(255,255,255,.8)',marginTop:2 }}>⏱️ {aiResult.duration}</div>}
          </div>
          <div style={{ padding:'20px' }}>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12,fontWeight:800,color:cfg.c,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8 }}>📋 회의 요약</div>
              <div style={{ fontSize:14,color:'#374151',lineHeight:1.75,background:'#F0FDFA',borderRadius:10,padding:'12px 14px' }}>{aiResult.summary}</div>
            </div>
            {aiResult.decisions&&aiResult.decisions.length>0&&(
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12,fontWeight:800,color:'#7C3AED',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8 }}>✅ 주요 결정사항</div>
                {aiResult.decisions.map((d,i)=>(
                  <div key={i} style={{ display:'flex',gap:10,alignItems:'flex-start',marginBottom:6 }}>
                    <div style={{ width:20,height:20,borderRadius:'50%',background:'#EDE9FE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#7C3AED',flexShrink:0 }}>{i+1}</div>
                    <div style={{ fontSize:13,color:'#374151',lineHeight:1.5 }}>{d}</div>
                  </div>
                ))}
              </div>
            )}
            {aiResult.todos&&aiResult.todos.length>0&&(
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12,fontWeight:800,color:'#059669',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8 }}>📌 추출된 할일 ({aiResult.todos.length}개)</div>
                {aiResult.todos.map((t,i)=>(
                  <div key={i} style={{ display:'flex',gap:10,alignItems:'center',background:'#ECFDF5',borderRadius:9,padding:'9px 12px',marginBottom:6 }}>
                    <span style={{ fontSize:14 }}>□</span>
                    <span style={{ fontSize:13,fontWeight:600,color:'#065F46' }}>{t}</span>
                  </div>
                ))}
              </div>
            )}
            {aiResult.keywords&&aiResult.keywords.length>0&&(
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:12,fontWeight:800,color:'#9CA3AF',marginBottom:8 }}>🏷️ 키워드</div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
                  {aiResult.keywords.map((k,i)=><span key={i} style={{ background:cfg.l,color:cfg.d,fontSize:12,fontWeight:700,padding:'4px 10px',borderRadius:99 }}>#{k}</span>)}
                </div>
              </div>
            )}
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={()=>setAiResult(null)} style={{ flex:1,padding:'11px',borderRadius:11,border:'1.5px solid #E5E7EB',background:'white',color:'#6B7280',fontSize:13,fontWeight:600,cursor:'pointer' }}>다시 분석</button>
              <button onClick={saveMeetingFromAI} style={{ flex:2,padding:'11px',borderRadius:11,border:'none',background:'linear-gradient(135deg,'+cfg.c+','+cfg.d+')',color:'white',fontSize:13,fontWeight:800,cursor:'pointer' }}>💾 저장 + 할일 자동 추가</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (mode==='manual') return (
    <div style={{ padding:'24px',height:'100%',overflowY:'auto' }}>
      <div className="fu" style={{ display:'flex',alignItems:'center',gap:12,marginBottom:20 }}>
        <button onClick={()=>setMode('list')} style={{ width:34,height:34,borderRadius:10,border:'1.5px solid #E5E7EB',background:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>←</button>
        <div style={{ fontSize:17,fontWeight:900,color:'#111827' }}>📝 회의록 직접 작성</div>
      </div>
      <Field value={form.title} onChange={v=>setForm(p=>({...p,title:v}))} label="회의 제목" placeholder="회의 제목 입력" required/>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
        <Field value={form.date} onChange={v=>setForm(p=>({...p,date:v}))} label="날짜" type="date"/>
        <Field value={form.time} onChange={v=>setForm(p=>({...p,time:v}))} label="시간" placeholder="14:00"/>
      </div>
      <Field value={form.attendees} onChange={v=>setForm(p=>({...p,attendees:v}))} label="참석자" placeholder="쉼표로 구분"/>
      <Field value={form.agenda} onChange={v=>setForm(p=>({...p,agenda:v}))} label="안건" placeholder="회의 안건" rows={3}/>
      <Field value={form.actionItems} onChange={v=>setForm(p=>({...p,actionItems:v}))} label="액션 아이템" placeholder="결정된 실행 항목" rows={3}/>
      <div style={{ display:'flex',gap:10 }}>
        <Btn onClick={()=>setMode('list')} outline color="#6B7280" style={{ flex:1 }}>취소</Btn>
        <Btn onClick={addManual} bg={cfg.c} style={{ flex:2 }}>저장하기</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ padding:'24px',height:'100%',display:'flex',flexDirection:'column' }}>
      <div className="fu" style={{ marginBottom:20 }}>
        <div style={{ fontSize:20,fontWeight:900,color:'#111827' }}>🤖 AI 회의 관리</div>
        <div style={{ fontSize:13,color:'#6B7280',marginTop:2 }}>음성이나 텍스트로 회의를 기록하면 AI가 요약해드려요</div>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20 }}>
        <button onClick={()=>setMode('ai')} style={{ padding:'20px',borderRadius:16,border:'2px solid '+cfg.c,background:cfg.l,cursor:'pointer',textAlign:'left' }}>
          <div style={{ fontSize:28,marginBottom:8 }}>🤖</div>
          <div style={{ fontSize:14,fontWeight:800,color:cfg.c }}>AI 자동 분석</div>
          <div style={{ fontSize:12,color:cfg.d,marginTop:4 }}>음성/텍스트 → 요약 + 할일 자동 추출</div>
        </button>
        <button onClick={()=>setMode('manual')} style={{ padding:'20px',borderRadius:16,border:'2px solid #E5E7EB',background:'white',cursor:'pointer',textAlign:'left' }}>
          <div style={{ fontSize:28,marginBottom:8 }}>📝</div>
          <div style={{ fontSize:14,fontWeight:800,color:'#374151' }}>직접 작성</div>
          <div style={{ fontSize:12,color:'#6B7280',marginTop:4 }}>회의록을 직접 입력해요</div>
        </button>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'260px 1fr',gap:16,flex:1,minHeight:0 }}>
        <div style={{ overflowY:'auto',display:'flex',flexDirection:'column',gap:8 }}>
          {meetings.length===0&&<Empty icon="🎙️" title="회의록이 없어요" desc="위에서 회의를 분석하거나 직접 작성해보세요"/>}
          {meetings.map(m=>(
            <div key={m.id} onClick={()=>setSel(m)} style={{ background:sel&&sel.id===m.id?cfg.l:'white',border:'1.5px solid '+(sel&&sel.id===m.id?cfg.c:'#F3F4F6'),borderRadius:12,padding:'12px 14px',cursor:'pointer',transition:'all .12s' }}>
              {m.isAI&&<div style={{ fontSize:10,fontWeight:800,color:cfg.c,marginBottom:3 }}>🤖 AI 분석</div>}
              <div style={{ fontSize:13,fontWeight:700,color:'#111827',marginBottom:3 }}>{m.title}</div>
              <div style={{ fontSize:11,color:'#9CA3AF' }}>📅 {fmtD(m.date)}{m.time&&' · '+m.time}</div>
            </div>
          ))}
        </div>
        <div style={{ background:'white',borderRadius:16,padding:'20px',border:'1px solid #F3F4F6',overflowY:'auto' }}>
          {sel ? (
            <>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:16 }}>
                <div>
                  {sel.isAI&&<div style={{ fontSize:11,fontWeight:800,color:cfg.c,marginBottom:4 }}>🤖 AI 분석 결과</div>}
                  <div style={{ fontSize:18,fontWeight:900,color:'#111827' }}>{sel.title}</div>
                  <div style={{ fontSize:12,color:'#9CA3AF',marginTop:3 }}>📅 {fmtFull(sel.date)}{sel.time&&' · '+sel.time}</div>
                </div>
                <button onClick={()=>del(sel.id)} style={{ background:'#FEF2F2',border:'none',borderRadius:8,padding:'6px 12px',fontSize:12,color:'#EF4444',fontWeight:700,cursor:'pointer' }}>삭제</button>
              </div>
              {sel.aiSummary&&<div style={{ background:'#F0FDFA',borderRadius:10,padding:'12px',marginBottom:14 }}><div style={{ fontSize:11,fontWeight:800,color:cfg.c,marginBottom:6 }}>📋 AI 요약</div><div style={{ fontSize:13,color:'#374151',lineHeight:1.7 }}>{sel.aiSummary}</div></div>}
              {sel.aiDecisions&&sel.aiDecisions.length>0&&<div style={{ marginBottom:14 }}><div style={{ fontSize:11,fontWeight:800,color:'#7C3AED',marginBottom:6 }}>✅ 결정사항</div>{sel.aiDecisions.map((d,i)=><div key={i} style={{ fontSize:13,color:'#374151',marginBottom:4 }}>• {d}</div>)}</div>}
              {sel.actionItems&&<div style={{ marginBottom:14 }}><div style={{ fontSize:11,fontWeight:800,color:'#059669',marginBottom:6 }}>📌 액션 아이템</div><div style={{ fontSize:13,color:'#374151',whiteSpace:'pre-wrap',lineHeight:1.7 }}>{sel.actionItems}</div></div>}
              {sel.agenda&&!sel.aiSummary&&<div><div style={{ fontSize:11,fontWeight:800,color:cfg.c,marginBottom:6 }}>안건</div><div style={{ fontSize:13,color:'#374151',whiteSpace:'pre-wrap',lineHeight:1.7 }}>{sel.agenda}</div></div>}
            </>
          ) : <Empty icon="📋" title="회의를 선택하세요" desc="왼쪽 목록에서 회의를 선택하면 내용이 표시됩니다"/>}
        </div>
      </div>
    </div>
  );
}


function ProjectsScreen({ projects, setProjects }) {
  const cfg = WS.company;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', status: 'planning', dueDate: '' });

  const PSTATS = {
    planning:   { l: '기획중', c: '#6B7280', bg: '#F9FAFB' },
    in_progress:{ l: '진행중', c: '#2563EB', bg: '#EFF6FF' },
    review:     { l: '검토중', c: '#D97706', bg: '#FFFBEB' },
    done:       { l: '완료',   c: '#059669', bg: '#ECFDF5' },
  };

  const add = () => {
    if (!form.title.trim()) return;
    setProjects(p => [...p, { id: uid(), ...form, title: form.title.trim(), tasks: [] }]);
    setForm({ title: '', description: '', status: 'planning', dueDate: '' });
    setShowModal(false);
  };

  const del = (id) => setProjects(p => p.filter(pr => pr.id !== id));
  const updStatus = (id, status) => setProjects(p => p.map(pr => pr.id === id ? { ...pr, status } : pr));

  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>📊 프로젝트</div>
        <Btn onClick={() => setShowModal(true)} bg={cfg.c}>+ 프로젝트</Btn>
      </div>
      {projects.length === 0
        ? <Empty icon="📊" title="프로젝트가 없어요" desc="새 프로젝트를 시작해보세요" />
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {projects.map(pr => (
            <div key={pr.id} style={{ background: 'white', borderRadius: 16, padding: '18px', border: '1px solid #F3F4F6', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>{pr.title}</div>
                <button onClick={() => del(pr.id)} style={{ background: 'none', border: 'none', color: '#D1D5DB', cursor: 'pointer', fontSize: 13 }}>✕</button>
              </div>
              {pr.description && <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12, lineHeight: 1.5 }}>{pr.description}</div>}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {pr.dueDate && <Badge color="#6B7280" bg="#F9FAFB">📅 {fmtD(pr.dueDate)}</Badge>}
                <select value={pr.status} onChange={e => updStatus(pr.id, e.target.value)}
                  style={{ fontSize: 11, fontWeight: 700, color: PSTATS[pr.status]&&PSTATS[pr.status].c, background: PSTATS[pr.status]&&PSTATS[pr.status].bg, border: 'none', borderRadius: 99, padding: '3px 10px', cursor: 'pointer' }}>
                  {Object.entries(PSTATS).map(([k, v]) => <option key={k} value={k}>{v.l}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      }
      {showModal && (
        <Modal title="프로젝트 추가" onClose={() => setShowModal(false)}>
          <Field value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} label="프로젝트명" placeholder="프로젝트 이름 입력" required />
          <Field value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} label="설명" placeholder="프로젝트 설명" rows={3} />
          <Field value={form.dueDate} onChange={v => setForm(p => ({ ...p, dueDate: v }))} label="마감일" type="date" />
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={() => setShowModal(false)} outline color="#6B7280" style={{ flex: 1 }}>취소</Btn>
            <Btn onClick={add} bg={cfg.c} style={{ flex: 2 }}>추가하기</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   GOALS SCREEN (Personal)
══════════════════════════════════════════════════════════ */
function GoalsScreen({ goals, setGoals }) {
  const cfg = WS.personal;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', targetDate: '', description: '' });

  const add = () => {
    if (!form.title.trim()) return;
    setGoals(p => [...p, { id: uid(), ...form, title: form.title.trim(), progress: 0 }]);
    setForm({ title: '', category: '', targetDate: '', description: '' });
    setShowModal(false);
  };

  const del = (id) => setGoals(p => p.filter(g => g.id !== id));
  const updProg = (id, v) => setGoals(p => p.map(g => g.id === id ? { ...g, progress: Math.max(0, Math.min(100, v)) } : g));

  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>🎯 목표 관리</div>
        <Btn onClick={() => setShowModal(true)} bg={cfg.c}>+ 목표 추가</Btn>
      </div>
      {goals.length === 0
        ? <Empty icon="🎯" title="목표가 없어요" desc="이루고 싶은 목표를 추가해보세요" />
        : goals.map(g => (
          <div key={g.id} className="fu" style={{ background: 'white', borderRadius: 14, padding: '18px', border: '1px solid #F3F4F6', marginBottom: 14, boxShadow: '0 2px 6px rgba(0,0,0,.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                {g.category && <div style={{ fontSize: 11, fontWeight: 800, color: cfg.c, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>{g.category}</div>}
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>{g.title}</div>
                {g.description && <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{g.description}</div>}
              </div>
              <button onClick={() => del(g.id)} style={{ background: 'none', border: 'none', color: '#D1D5DB', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>✕</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ flex: 1, height: 8, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${g.progress}%`, background: `linear-gradient(90deg, ${cfg.c}, ${cfg.d})`, borderRadius: 99, transition: 'width .3s' }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: cfg.c, minWidth: 40 }}>{g.progress}%</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {g.targetDate && <Badge color="#6B7280" bg="#F9FAFB">📅 {fmtD(g.targetDate)}</Badge>}
              <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                {[-10, -5, +5, +10].map(d => (
                  <button key={d} onClick={() => updProg(g.id, g.progress + d)} style={{ padding: '4px 8px', borderRadius: 6, border: `1.5px solid ${d < 0 ? '#E5E7EB' : cfg.m}`, background: d < 0 ? 'white' : cfg.l, color: d < 0 ? '#6B7280' : cfg.d, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    {d > 0 ? `+${d}` : d}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))
      }
      {showModal && (
        <Modal title="목표 추가" onClose={() => setShowModal(false)}>
          <Field value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} label="목표" placeholder="이루고 싶은 목표를 입력하세요" required />
          <Field value={form.category} onChange={v => setForm(p => ({ ...p, category: v }))} label="카테고리" placeholder="예: 건강, 공부, 취미" />
          <Field value={form.targetDate} onChange={v => setForm(p => ({ ...p, targetDate: v }))} label="목표 날짜" type="date" />
          <Field value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} label="설명" placeholder="목표에 대한 설명" rows={3} />
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={() => setShowModal(false)} outline color="#6B7280" style={{ flex: 1 }}>취소</Btn>
            <Btn onClick={add} bg={cfg.c} style={{ flex: 2 }}>추가하기</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   JOURNAL SCREEN (Personal)
══════════════════════════════════════════════════════════ */
function JournalScreen({ journals, setJournals }) {
  const cfg = WS.personal;
  const [showModal, setShowModal] = useState(false);
  const [sel, setSel] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', mood: 3, date: tod() });

  const add = () => {
    if (!form.content.trim()) return;
    const entry = { id: uid(), ...form, title: form.title || `${fmtFull(form.date)} 일기`, date: form.date };
    setJournals(p => [entry, ...p]);
    setForm({ title: '', content: '', mood: 3, date: tod() });
    setShowModal(false);
    setSel(entry);
  };

  const del = (id) => { setJournals(p => p.filter(j => j.id !== id)); if (sel&&sel.id === id) setSel(null); };

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="fu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>📖 개인 일기</div>
        <Btn onClick={() => setShowModal(true)} bg={cfg.c}>+ 일기 쓰기</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, flex: 1, minHeight: 0 }}>
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {journals.length === 0
            ? <Empty icon="📖" title="일기가 없어요" desc="오늘의 일기를 써보세요" />
            : journals.map(j => (
              <div key={j.id} onClick={() => setSel(j)} style={{ background: sel&&sel.id === j.id ? cfg.l : 'white', border: `1.5px solid ${sel&&sel.id === j.id ? cfg.c : '#F3F4F6'}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all .12s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{j.title}</div>
                  <span style={{ fontSize: 16 }}>{MOOD[j.mood - 1]}</span>
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{fmtFull(j.date)}</div>
              </div>
            ))
          }
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1px solid #F3F4F6', overflowY: 'auto' }}>
          {sel ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 28 }}>{MOOD[sel.mood - 1]}</span>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>{sel.title}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{fmtFull(sel.date)}</div>
                </div>
                <button onClick={() => del(sel.id)} style={{ background: '#FEF2F2', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#EF4444', fontWeight: 700, cursor: 'pointer' }}>삭제</button>
              </div>
              <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{sel.content}</div>
            </>
          ) : <Empty icon="📝" title="일기를 선택하세요" desc="왼쪽에서 일기를 선택하면 내용이 표시됩니다" />}
        </div>
      </div>
      {showModal && (
        <Modal title="일기 쓰기" onClose={() => setShowModal(false)}>
          <Field value={form.date} onChange={v => setForm(p => ({ ...p, date: v }))} label="날짜" type="date" />
          <Field value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} label="제목" placeholder="제목 (비우면 날짜로 자동 설정)" />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>오늘의 기분</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {MOOD.map((m, i) => (
                <button key={i} onClick={() => setForm(p => ({ ...p, mood: i + 1 }))} style={{ fontSize: 26, background: form.mood === i + 1 ? cfg.l : 'white', border: `2px solid ${form.mood === i + 1 ? cfg.c : '#F3F4F6'}`, borderRadius: 12, padding: '8px', cursor: 'pointer', transition: 'all .15s' }}>{m}</button>
              ))}
            </div>
          </div>
          <Field value={form.content} onChange={v => setForm(p => ({ ...p, content: v }))} label="내용" placeholder="오늘 어땠나요?" rows={7} />
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={() => setShowModal(false)} outline color="#6B7280" style={{ flex: 1 }}>취소</Btn>
            <Btn onClick={add} bg={cfg.c} style={{ flex: 2 }}>저장하기</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   HABITS SCREEN (Personal) — 습관 트래커 + 스트릭
══════════════════════════════════════════════════════════ */
function HabitsScreen({ habits, setHabits }) {
  const cfg = WS.personal;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', icon:'🔥', frequency:'daily', target:1 });
  const todayKey = tod();
  const ICONS = ['🔥','💪','📚','🏃','🧘','💧','🥗','😴','🎸','✍️','🌿','☀️'];

  const addHabit = () => {
    if (!form.name.trim()) return;
    setHabits(p => [...p, { id:uid(), name:form.name.trim(), icon:form.icon, frequency:form.frequency, target:form.target, log:{}, createdAt:new Date().toISOString() }]);
    setForm({ name:'', icon:'🔥', frequency:'daily', target:1 });
    setShowForm(false);
  };

  const toggleDay = (id, key) => {
    setHabits(p => p.map(h => {
      if (h.id !== id) return h;
      const log = { ...h.log };
      log[key] = !log[key];
      return { ...h, log };
    }));
  };

  const getStreak = (habit) => {
    let streak = 0;
    let d = new Date();
    while (true) {
      const key = d.toISOString().split('T')[0];
      if (!habit.log[key]) break;
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  };

  const getLast7 = () => {
    const days = [];
    for (let i=6; i>=0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7 = getLast7();
  const dayLabels = ['일','월','화','수','목','금','토'];

  return (
    <div style={{ padding:'24px',height:'100%',overflowY:'auto' }}>
      <div className="fu" style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20,fontWeight:900,color:'#111827' }}>🔥 습관 트래커</div>
          <div style={{ fontSize:13,color:'#6B7280',marginTop:2 }}>매일 쌓아가는 나만의 루틴</div>
        </div>
        <button onClick={()=>setShowForm(p=>!p)} style={{ padding:'9px 16px',borderRadius:10,border:'none',background:cfg.c,color:'white',fontSize:13,fontWeight:700,cursor:'pointer' }}>+ 습관 추가</button>
      </div>

      {showForm&&(
        <div className="fu" style={{ background:'white',borderRadius:16,padding:'18px',border:'1.5px solid '+cfg.m,marginBottom:20 }}>
          <div style={{ fontSize:14,fontWeight:800,color:'#111827',marginBottom:14 }}>새 습관 만들기</div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:6,textTransform:'uppercase',letterSpacing:'.04em' }}>아이콘</div>
            <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
              {ICONS.map(ic=><button key={ic} onClick={()=>setForm(p=>({...p,icon:ic}))} style={{ width:38,height:38,borderRadius:10,border:'2px solid '+(form.icon===ic?cfg.c:'#E5E7EB'),background:form.icon===ic?cfg.l:'white',fontSize:20,cursor:'pointer' }}>{ic}</button>)}
            </div>
          </div>
          <Field value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} label="습관 이름" placeholder="예: 매일 운동하기, 물 2L 마시기" required/>
          <div style={{ display:'flex',gap:8 }}>
            <Btn onClick={()=>setShowForm(false)} outline color="#6B7280" style={{ flex:1 }}>취소</Btn>
            <Btn onClick={addHabit} bg={cfg.c} disabled={!form.name.trim()} style={{ flex:2 }}>추가하기</Btn>
          </div>
        </div>
      )}

      {habits.length===0&&<Empty icon="🔥" title="습관이 없어요" desc="작은 습관이 큰 변화를 만들어요. 첫 번째 습관을 추가해보세요!"/>}

      {habits.map(h=>{
        const streak = getStreak(h);
        const todayDone = !!h.log[todayKey];
        return (
          <div key={h.id} className="fu" style={{ background:'white',borderRadius:18,padding:'18px 20px',border:'1px solid #F3F4F6',marginBottom:14,boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
              <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                <div style={{ width:48,height:48,borderRadius:14,background:cfg.l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24 }}>{h.icon}</div>
                <div>
                  <div style={{ fontSize:16,fontWeight:800,color:'#111827' }}>{h.name}</div>
                  {streak>0&&<div style={{ fontSize:12,fontWeight:700,color:'#D97706',marginTop:2 }}>🔥 {streak}일 연속 달성 중!</div>}
                </div>
              </div>
              <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                <button onClick={()=>toggleDay(h.id, todayKey)} style={{ padding:'9px 18px',borderRadius:99,border:'none',background:todayDone?cfg.c:cfg.l,color:todayDone?'white':cfg.d,fontSize:13,fontWeight:800,cursor:'pointer',transition:'all .2s' }}>
                  {todayDone?'✓ 완료':'오늘 체크'}
                </button>
                <button onClick={()=>setHabits(p=>p.filter(x=>x.id!==h.id))} style={{ background:'none',border:'none',color:'#D1D5DB',cursor:'pointer',fontSize:14 }}>✕</button>
              </div>
            </div>
            {/* 최근 7일 그래프 */}
            <div>
              <div style={{ fontSize:11,fontWeight:700,color:'#9CA3AF',marginBottom:8 }}>최근 7일</div>
              <div style={{ display:'flex',gap:6 }}>
                {last7.map((day,i)=>{
                  const done = !!h.log[day];
                  const isToday = day===todayKey;
                  const dow = new Date(day+'T00:00:00').getDay();
                  return (
                    <div key={day} style={{ flex:1,textAlign:'center' }}>
                      <div style={{ fontSize:10,fontWeight:600,color:isToday?cfg.c:'#9CA3AF',marginBottom:4 }}>{dayLabels[dow]}</div>
                      <button onClick={()=>toggleDay(h.id,day)} style={{ width:'100%',aspectRatio:'1',borderRadius:8,border:'none',background:done?cfg.c:isToday?cfg.l:'#F3F4F6',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,transition:'all .15s' }}>
                        {done&&<span style={{ color:'white',fontWeight:900 }}>✓</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   GRADES SCREEN (School) — 성적 트래커
══════════════════════════════════════════════════════════ */
function GradesScreen({ grades, setGrades }) {
  const cfg = WS.school;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject:'', exam:'', score:'', maxScore:'100', date:tod() });
  const [showExam, setShowExam] = useState(false);
  const [examForm, setExamForm] = useState({ subject:'', name:'', date:'', type:'중간고사' });
  const [exams, setExams] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wl_exams_user')||'[]'); } catch { return []; }
  });

  const saveExams = (v) => { setExams(v); try { localStorage.setItem('wl_exams_user', JSON.stringify(v)); } catch {} };

  const addGrade = () => {
    if (!form.subject.trim()||!form.score) return;
    const pct = Math.round((Number(form.score)/Number(form.maxScore||100))*100);
    setGrades(p=>[...p, { id:uid(), ...form, score:Number(form.score), maxScore:Number(form.maxScore||100), pct }]);
    setForm({ subject:'', exam:'', score:'', maxScore:'100', date:tod() });
    setShowForm(false);
  };

  const addExam = () => {
    if (!examForm.subject.trim()||!examForm.date) return;
    const diff = Math.ceil((new Date(examForm.date+' 00:00:00')-new Date())/(1000*60*60*24));
    saveExams([...exams, { id:uid(), ...examForm, dday:diff }]);
    setExamForm({ subject:'', name:'', date:'', type:'중간고사' });
    setShowExam(false);
  };

  // 과목별 평균
  const subjectMap = {};
  grades.forEach(g => {
    if (!subjectMap[g.subject]) subjectMap[g.subject] = [];
    subjectMap[g.subject].push(g.pct);
  });
  const subjects = Object.entries(subjectMap).map(([s,pcts])=>({ subject:s, avg:Math.round(pcts.reduce((a,b)=>a+b,0)/pcts.length), count:pcts.length }));
  const totalAvg = subjects.length ? Math.round(subjects.reduce((a,b)=>a+b.avg,0)/subjects.length) : null;

  const getGrade = (pct) => pct>=90?{l:'A+',c:'#059669'}:pct>=80?{l:'B+',c:'#2563EB'}:pct>=70?{l:'C+',c:'#D97706'}:pct>=60?{l:'D',c:'#DC2626'}:{l:'F',c:'#6B7280'};
  const ddayColor = (d) => d<=3?'#DC2626':d<=7?'#D97706':'#059669';

  return (
    <div style={{ padding:'24px',height:'100%',overflowY:'auto' }}>
      <div className="fu" style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div style={{ fontSize:20,fontWeight:900,color:'#111827' }}>🏆 성적 & 시험 관리</div>
        <div style={{ display:'flex',gap:8 }}>
          <button onClick={()=>setShowExam(p=>!p)} style={{ padding:'8px 12px',borderRadius:9,border:'1.5px solid '+cfg.c,background:'white',color:cfg.c,fontSize:12,fontWeight:700,cursor:'pointer' }}>📅 시험 등록</button>
          <button onClick={()=>setShowForm(p=>!p)} style={{ padding:'8px 12px',borderRadius:9,border:'none',background:cfg.c,color:'white',fontSize:12,fontWeight:700,cursor:'pointer' }}>+ 성적 입력</button>
        </div>
      </div>

      {/* 시험 D-day */}
      {exams.length>0&&(
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12,fontWeight:800,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:10 }}>시험 D-day</div>
          <div style={{ display:'flex',gap:10,overflowX:'auto',paddingBottom:4 }}>
            {exams.sort((a,b)=>new Date(a.date)-new Date(b.date)).map(e=>{
              const diff = Math.ceil((new Date(e.date+' 00:00:00')-new Date())/(1000*60*60*24));
              const past = diff < 0;
              return (
                <div key={e.id} style={{ background:'white',borderRadius:16,padding:'14px 16px',border:'1.5px solid '+(past?'#F3F4F6':'#E5E7EB'),flexShrink:0,minWidth:130,position:'relative' }}>
                  <button onClick={()=>saveExams(exams.filter(x=>x.id!==e.id))} style={{ position:'absolute',top:6,right:8,background:'none',border:'none',color:'#D1D5DB',cursor:'pointer',fontSize:11 }}>✕</button>
                  <div style={{ fontSize:11,fontWeight:700,color:'#9CA3AF',marginBottom:4 }}>{e.type}</div>
                  <div style={{ fontSize:14,fontWeight:800,color:'#111827',marginBottom:6 }}>{e.subject}</div>
                  <div style={{ fontSize:24,fontWeight:900,color:past?'#9CA3AF':ddayColor(diff) }}>
                    {past?'종료':`D-${diff}`}
                  </div>
                  <div style={{ fontSize:11,color:'#9CA3AF',marginTop:4 }}>{e.date}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showExam&&(
        <div className="fu" style={{ background:'white',borderRadius:14,padding:'16px',border:'1.5px solid '+cfg.m,marginBottom:16 }}>
          <div style={{ fontSize:14,fontWeight:800,color:'#111827',marginBottom:12 }}>시험 등록</div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
            <Field value={examForm.subject} onChange={v=>setExamForm(p=>({...p,subject:v}))} label="과목" placeholder="예: 수학"/>
            <Select label="유형" value={examForm.type} onChange={v=>setExamForm(p=>({...p,type:v}))} options={['중간고사','기말고사','쪽지시험','수행평가','모의고사'].map(v=>({value:v,label:v}))}/>
          </div>
          <Field value={examForm.date} onChange={v=>setExamForm(p=>({...p,date:v}))} label="시험 날짜" type="date" required/>
          <div style={{ display:'flex',gap:8 }}>
            <Btn onClick={()=>setShowExam(false)} outline color="#6B7280" style={{ flex:1 }}>취소</Btn>
            <Btn onClick={addExam} bg={cfg.c} disabled={!examForm.subject.trim()||!examForm.date} style={{ flex:2 }}>등록</Btn>
          </div>
        </div>
      )}

      {showForm&&(
        <div className="fu" style={{ background:'white',borderRadius:14,padding:'16px',border:'1.5px solid '+cfg.m,marginBottom:16 }}>
          <div style={{ fontSize:14,fontWeight:800,color:'#111827',marginBottom:12 }}>성적 입력</div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
            <Field value={form.subject} onChange={v=>setForm(p=>({...p,subject:v}))} label="과목" placeholder="예: 수학"/>
            <Field value={form.exam} onChange={v=>setForm(p=>({...p,exam:v}))} label="시험명" placeholder="예: 1차 중간고사"/>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10 }}>
            <Field value={form.score} onChange={v=>setForm(p=>({...p,score:v}))} label="점수" placeholder="85" type="number"/>
            <Field value={form.maxScore} onChange={v=>setForm(p=>({...p,maxScore:v}))} label="만점" placeholder="100" type="number"/>
            <Field value={form.date} onChange={v=>setForm(p=>({...p,date:v}))} label="날짜" type="date"/>
          </div>
          <div style={{ display:'flex',gap:8 }}>
            <Btn onClick={()=>setShowForm(false)} outline color="#6B7280" style={{ flex:1 }}>취소</Btn>
            <Btn onClick={addGrade} bg={cfg.c} disabled={!form.subject.trim()||!form.score} style={{ flex:2 }}>입력</Btn>
          </div>
        </div>
      )}

      {/* 과목 평균 요약 */}
      {subjects.length>0&&(
        <div style={{ background:'white',borderRadius:16,padding:'18px',border:'1px solid #F3F4F6',marginBottom:16 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
            <div style={{ fontSize:14,fontWeight:800,color:'#111827' }}>과목별 평균</div>
            {totalAvg!==null&&<div style={{ fontSize:20,fontWeight:900,color:getGrade(totalAvg).c }}>전체 {totalAvg}점 ({getGrade(totalAvg).l})</div>}
          </div>
          {subjects.map(s=>{
            const g = getGrade(s.avg);
            return (
              <div key={s.subject} style={{ marginBottom:12 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5 }}>
                  <div style={{ fontSize:13,fontWeight:700,color:'#374151' }}>{s.subject}</div>
                  <div style={{ fontSize:13,fontWeight:800,color:g.c }}>{s.avg}점 ({g.l})</div>
                </div>
                <div style={{ height:8,background:'#F3F4F6',borderRadius:99,overflow:'hidden' }}>
                  <div style={{ height:'100%',width:s.avg+'%',background:'linear-gradient(90deg,'+cfg.c+','+cfg.d+')',borderRadius:99,transition:'width .5s' }}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 성적 기록 */}
      {grades.length===0&&subjects.length===0&&<Empty icon="🏆" title="성적이 없어요" desc="성적을 입력하고 과목별 분석을 확인해보세요"/>}
      {grades.length>0&&(
        <div>
          <div style={{ fontSize:12,fontWeight:800,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:10 }}>성적 기록</div>
          {[...grades].reverse().map(g=>{
            const gr = getGrade(g.pct);
            return (
              <div key={g.id} style={{ background:'white',borderRadius:12,padding:'13px 16px',border:'1px solid #F3F4F6',marginBottom:8,display:'flex',alignItems:'center',gap:12 }}>
                <div style={{ width:44,height:44,borderRadius:12,background:cfg.l,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <span style={{ fontSize:18,fontWeight:900,color:gr.c }}>{gr.l}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:'#111827' }}>{g.subject} {g.exam&&'— '+g.exam}</div>
                  <div style={{ fontSize:12,color:'#9CA3AF',marginTop:2 }}>📅 {fmtFull(g.date)}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:20,fontWeight:900,color:gr.c }}>{g.score}</div>
                  <div style={{ fontSize:11,color:'#9CA3AF' }}>/{g.maxScore} ({g.pct}%)</div>
                </div>
                <button onClick={()=>setGrades(p=>p.filter(x=>x.id!==g.id))} style={{ background:'none',border:'none',color:'#D1D5DB',cursor:'pointer',fontSize:13 }}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ATTENDANCE SCREEN (School) — 출석 체크
══════════════════════════════════════════════════════════ */
function AttendanceScreen({ attend, setAttend }) {
  const cfg = WS.school;
  const [subjects, setSubjects] = useState(() => { try { return JSON.parse(localStorage.getItem('wl_attend_subjects')||'[]'); } catch { return []; } });
  const [showAdd, setShowAdd] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const todayKey = tod();
  const dayNames2 = ['일','월','화','수','목','금','토'];

  const saveSubjects = (v) => { setSubjects(v); try { localStorage.setItem('wl_attend_subjects', JSON.stringify(v)); } catch {} };

  const getLast14 = () => {
    const days = [];
    for (let i=13; i>=0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const toggleAttend = (subject, day, status) => {
    const key = subject+'|'+day;
    setAttend(p => {
      const next = {...p};
      if (next[key]===status) delete next[key];
      else next[key] = status;
      return next;
    });
  };

  const getStats = (subject) => {
    const days = getLast14();
    let present=0, absent=0, late=0;
    days.forEach(d => {
      const v = attend[subject+'|'+d];
      if (v==='O') present++;
      else if (v==='X') absent++;
      else if (v==='△') late++;
    });
    return { present, absent, late, total:days.length };
  };

  const last14 = getLast14();

  return (
    <div style={{ padding:'24px',height:'100%',overflowY:'auto' }}>
      <div className="fu" style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20,fontWeight:900,color:'#111827' }}>📋 출석 체크</div>
          <div style={{ fontSize:13,color:'#6B7280',marginTop:2 }}>O 출석 · X 결석 · △ 지각</div>
        </div>
        <button onClick={()=>setShowAdd(p=>!p)} style={{ padding:'8px 14px',borderRadius:9,border:'none',background:cfg.c,color:'white',fontSize:13,fontWeight:700,cursor:'pointer' }}>+ 과목 추가</button>
      </div>

      {showAdd&&(
        <div className="fu" style={{ background:'white',borderRadius:12,padding:'14px',border:'1.5px solid '+cfg.m,marginBottom:16,display:'flex',gap:8 }}>
          <input value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="과목명 입력 (예: 수학)" onKeyDown={e=>e.key==='Enter'&&newSubject.trim()&&(saveSubjects([...subjects,newSubject.trim()]),setNewSubject(''),setShowAdd(false))} style={{ flex:1,padding:'9px 12px',fontSize:14,border:'1.5px solid #E5E7EB',borderRadius:9,fontFamily:'inherit' }}/>
          <Btn onClick={()=>{if(newSubject.trim()){saveSubjects([...subjects,newSubject.trim()]);setNewSubject('');setShowAdd(false);}}} bg={cfg.c} sm>추가</Btn>
        </div>
      )}

      {subjects.length===0&&<Empty icon="📋" title="과목이 없어요" desc="과목을 추가하고 출석을 체크해보세요"/>}

      {subjects.map(subject=>{
        const stats = getStats(subject);
        const rate = Math.round((stats.present/(stats.present+stats.absent+stats.late||1))*100);
        return (
          <div key={subject} style={{ background:'white',borderRadius:16,padding:'18px',border:'1px solid #F3F4F6',marginBottom:16,boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
              <div style={{ fontSize:15,fontWeight:800,color:'#111827' }}>{subject}</div>
              <div style={{ display:'flex',gap:10,alignItems:'center' }}>
                <span style={{ fontSize:12,fontWeight:700,color:'#059669' }}>출{stats.present}</span>
                <span style={{ fontSize:12,fontWeight:700,color:'#DC2626' }}>결{stats.absent}</span>
                <span style={{ fontSize:12,fontWeight:700,color:'#D97706' }}>지{stats.late}</span>
                <span style={{ fontSize:13,fontWeight:800,color:rate>=90?'#059669':rate>=80?'#2563EB':'#DC2626' }}>{rate}%</span>
                <button onClick={()=>saveSubjects(subjects.filter(s=>s!==subject))} style={{ background:'none',border:'none',color:'#D1D5DB',cursor:'pointer',fontSize:13 }}>✕</button>
              </div>
            </div>
            <div style={{ display:'flex',gap:4,overflowX:'auto' }}>
              {last14.map(day=>{
                const v = attend[subject+'|'+day];
                const isToday = day===todayKey;
                const dow = new Date(day+'T00:00:00').getDay();
                return (
                  <div key={day} style={{ flexShrink:0,textAlign:'center',minWidth:32 }}>
                    <div style={{ fontSize:9,color:isToday?cfg.c:'#9CA3AF',marginBottom:3,fontWeight:600 }}>{dayNames2[dow]}</div>
                    <div style={{ display:'flex',flexDirection:'column',gap:2 }}>
                      {['O','△','X'].map(s=>(
                        <button key={s} onClick={()=>toggleAttend(subject,day,s)} style={{ width:30,height:20,borderRadius:5,border:'none',background:v===s?(s==='O'?'#059669':s==='X'?'#DC2626':'#D97706'):(isToday?cfg.l:'#F3F4F6'),color:v===s?'white':(isToday?cfg.c:'#9CA3AF'),fontSize:10,fontWeight:700,cursor:'pointer' }}>{s}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TIME TRACKER SCREEN (Company) — 업무 시간 기록
══════════════════════════════════════════════════════════ */
function TimeTrackerScreen({ timeLogs, setTimeLogs }) {
  const cfg = WS.company;
  const [running, setRunning] = useState(null); // { taskName, startTime }
  const [elapsed, setElapsed] = useState(0);
  const [taskName, setTaskName] = useState('');
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now()-running.startTime)/1000)), 1000);
    return () => clearInterval(iv);
  }, [running]);

  const startTimer = () => {
    if (!taskName.trim()) return;
    setRunning({ taskName:taskName.trim(), startTime:Date.now() });
    setElapsed(0);
  };

  const stopTimer = () => {
    if (!running) return;
    const duration = Math.floor((Date.now()-running.startTime)/1000);
    if (duration > 5) {
      setTimeLogs(p=>[...p, { id:uid(), task:running.taskName, duration, date:todayKey, startTime:new Date(running.startTime).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}), createdAt:new Date().toISOString() }]);
    }
    setRunning(null); setElapsed(0); setTaskName('');
  };

  const todayKey = tod();
  const fmt = (s) => { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60; return h>0?`${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`:`${m}:${String(sec).padStart(2,'0')}`; };
  const fmtH = (s) => { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60); return h>0?`${h}시간 ${m}분`:`${m}분`; };

  const todayLogs = timeLogs.filter(l=>l.date===todayKey);
  const todayTotal = todayLogs.reduce((a,b)=>a+b.duration,0);

  // 주간 리포트
  const weekDays = [];
  for (let i=6;i>=0;i--) { const d=new Date();d.setDate(d.getDate()-i);weekDays.push(d.toISOString().split('T')[0]); }
  const weekData = weekDays.map(d=>({ date:d, total:timeLogs.filter(l=>l.date===d).reduce((a,b)=>a+b.duration,0) }));
  const maxWeek = Math.max(...weekData.map(d=>d.total), 1);
  const dayLabels3 = ['일','월','화','수','목','금','토'];

  return (
    <div style={{ padding:'24px',height:'100%',overflowY:'auto' }}>
      <div className="fu" style={{ marginBottom:20 }}>
        <div style={{ fontSize:20,fontWeight:900,color:'#111827' }}>⏱️ 타임트래커</div>
        <div style={{ fontSize:13,color:'#6B7280',marginTop:2 }}>업무 시간을 기록하고 분석해요</div>
      </div>

      {/* 타이머 */}
      <div className="fu" style={{ background:'white',borderRadius:18,padding:'24px',border:'1px solid #F3F4F6',marginBottom:20,textAlign:'center',boxShadow:'0 4px 16px rgba(0,0,0,.06)' }}>
        {running ? (
          <>
            <div style={{ fontSize:13,fontWeight:700,color:'#9CA3AF',marginBottom:6 }}>기록 중</div>
            <div style={{ fontSize:14,fontWeight:800,color:cfg.c,marginBottom:12,background:cfg.l,padding:'6px 16px',borderRadius:99,display:'inline-block' }}>{running.taskName}</div>
            <div style={{ fontSize:52,fontWeight:900,color:'#111827',fontVariantNumeric:'tabular-nums',letterSpacing:-2,marginBottom:20 }}>{fmt(elapsed)}</div>
            <button onClick={stopTimer} style={{ padding:'12px 32px',borderRadius:12,border:'none',background:'#EF4444',color:'white',fontSize:15,fontWeight:800,cursor:'pointer' }}>■ 정지</button>
          </>
        ) : (
          <>
            <div style={{ fontSize:52,fontWeight:900,color:'#D1D5DB',marginBottom:16 }}>00:00</div>
            <div style={{ display:'flex',gap:8,maxWidth:360,margin:'0 auto' }}>
              <input value={taskName} onChange={e=>setTaskName(e.target.value)} placeholder="업무 이름 입력" onKeyDown={e=>e.key==='Enter'&&startTimer()} style={{ flex:1,padding:'11px 14px',fontSize:14,border:'1.5px solid #E5E7EB',borderRadius:11,fontFamily:'inherit' }}/>
              <button onClick={startTimer} disabled={!taskName.trim()} style={{ padding:'11px 24px',borderRadius:11,border:'none',background:taskName.trim()?cfg.c:'#E5E7EB',color:'white',fontSize:14,fontWeight:700,cursor:taskName.trim()?'pointer':'default' }}>▶ 시작</button>
            </div>
          </>
        )}
      </div>

      {/* 오늘 합계 + 주간 그래프 */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 2fr',gap:16,marginBottom:20 }}>
        <div style={{ background:'white',borderRadius:16,padding:'18px',border:'1px solid #F3F4F6',textAlign:'center' }}>
          <div style={{ fontSize:12,fontWeight:700,color:'#9CA3AF',marginBottom:6 }}>오늘 총 업무</div>
          <div style={{ fontSize:28,fontWeight:900,color:cfg.c }}>{fmtH(todayTotal)}</div>
          <div style={{ fontSize:12,color:'#9CA3AF',marginTop:4 }}>{todayLogs.length}개 업무</div>
        </div>
        <div style={{ background:'white',borderRadius:16,padding:'18px',border:'1px solid #F3F4F6' }}>
          <div style={{ fontSize:12,fontWeight:700,color:'#9CA3AF',marginBottom:10 }}>이번 주</div>
          <div style={{ display:'flex',gap:4,alignItems:'flex-end',height:60 }}>
            {weekData.map((d,i)=>{
              const isToday = d.date===todayKey;
              const h = d.total>0 ? Math.max(4, Math.round((d.total/maxWeek)*56)) : 2;
              const dow = new Date(d.date+'T00:00:00').getDay();
              return (
                <div key={d.date} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4 }}>
                  <div title={fmtH(d.total)} style={{ width:'100%',height:h,borderRadius:4,background:isToday?cfg.c:d.total>0?cfg.m:'#F3F4F6',transition:'height .3s' }}/>
                  <div style={{ fontSize:9,color:isToday?cfg.c:'#9CA3AF',fontWeight:isToday?800:500 }}>{dayLabels3[dow]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 오늘 기록 */}
      {todayLogs.length>0&&(
        <div>
          <div style={{ fontSize:12,fontWeight:800,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:10 }}>오늘 기록</div>
          {[...todayLogs].reverse().map(l=>(
            <div key={l.id} style={{ background:'white',borderRadius:12,padding:'13px 16px',border:'1px solid #F3F4F6',marginBottom:8,display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:40,height:40,borderRadius:11,background:cfg.l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>⏱️</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14,fontWeight:700,color:'#111827' }}>{l.task}</div>
                <div style={{ fontSize:12,color:'#9CA3AF',marginTop:2 }}>시작: {l.startTime}</div>
              </div>
              <div style={{ fontSize:16,fontWeight:900,color:cfg.c }}>{fmtH(l.duration)}</div>
              <button onClick={()=>setTimeLogs(p=>p.filter(x=>x.id!==l.id))} style={{ background:'none',border:'none',color:'#D1D5DB',cursor:'pointer',fontSize:13 }}>✕</button>
            </div>
          ))}
        </div>
      )}
      {timeLogs.length===0&&<Empty icon="⏱️" title="기록된 업무가 없어요" desc="업무 이름을 입력하고 타이머를 시작해보세요"/>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   NOTIF SCREEN — 알림함 (워크스페이스 초대 수락/거절)
══════════════════════════════════════════════════════════ */
function NotifScreen({ user, spaces, setSpaces, notifs, setNotifs }) {
  const acceptInvite = (notif) => {
    const updated = spaces.map(s => {
      if (s.id !== notif.spaceId) return s;
      if (s.members.find(m => m.id === user.id)) return s;
      return { ...s, members: [...s.members, { id: user.id, name: user.nickname || user.name, role: 'member' }] };
    });
    setSpaces(updated);
    sv('wl_spaces', updated);
    const upd = notifs.map(n => n.id === notif.id ? { ...n, status: 'accepted', read: true } : n);
    setNotifs(upd);
    sv(`wl_notifs_${user.id}`, upd);
  };

  const declineInvite = (notif) => {
    const upd = notifs.map(n => n.id === notif.id ? { ...n, status: 'declined', read: true } : n);
    setNotifs(upd);
    sv(`wl_notifs_${user.id}`, upd);
  };

  const pending = notifs.filter(n => n.status === 'pending');
  const handled = notifs.filter(n => n.status !== 'pending');

  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      <div className="fu" style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>🔔 알림함</div>
        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>워크스페이스 초대 알림이 여기 표시돼요</div>
      </div>

      {notifs.length === 0 && <Empty icon="🔔" title="아직 알림이 없어요" desc="누군가 워크스페이스에 초대하면 여기서 확인할 수 있어요" />}

      {pending.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>새 초대 {pending.length}건</div>
          {pending.map(n => (
            <div key={n.id} className="fu" style={{ background: 'white', borderRadius: 18, padding: '20px', border: '1.5px solid #E0E7FF', marginBottom: 14, boxShadow: '0 4px 16px rgba(99,102,241,.1)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 900, flexShrink: 0 }}>
                  {(n.fromName || '?')[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 5 }}>
                    <span style={{ color: '#4F46E5', fontWeight: 900 }}>{n.fromName}</span>님이 워크스페이스로 초대했어요
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F0F4FF', borderRadius: 8, padding: '4px 10px', marginBottom: 8 }}>
                    <span style={{ fontSize: 15 }}>{WS[n.spaceType]&&WS[n.spaceType].icon || '📁'}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#3730A3' }}>{n.spaceName}</span>
                  </div>
                  {n.message && (
                    <div style={{ fontSize: 13, color: '#6B7280', background: '#F9FAFB', borderRadius: 10, padding: '10px 14px', lineHeight: 1.6, borderLeft: '3px solid #C7D2FE' }}>
                      "{n.message}"
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>{timeAgo(n.createdAt)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => declineInvite(n)} style={{ flex: 1, padding: '11px', borderRadius: 11, border: '1.5px solid #E5E7EB', background: 'white', color: '#6B7280', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>거절하기</button>
                <button onClick={() => acceptInvite(n)} style={{ flex: 2, padding: '11px', borderRadius: 11, border: 'none', background: 'linear-gradient(135deg,#4F46E5,#2563EB)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  ✓ 수락하고 참여하기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {handled.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>지난 알림</div>
          {handled.map(n => (
            <div key={n.id} style={{ background: '#F9FAFB', borderRadius: 14, padding: '14px 16px', border: '1px solid #F3F4F6', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#9CA3AF', flexShrink: 0 }}>{(n.fromName||'?')[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>
                    <span style={{ color:'#6B7280',fontWeight:700 }}>{n.fromName}</span>님의 <span style={{ color:'#6B7280',fontWeight:700 }}>{n.spaceName}</span> 초대
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: n.status==='accepted'?'#059669':'#EF4444', background: n.status==='accepted'?'#ECFDF5':'#FEF2F2', padding: '3px 10px', borderRadius: 99, flexShrink: 0 }}>
                  {n.status === 'accepted' ? '✓ 수락됨' : '✕ 거절됨'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   COMMENT TEXT / INPUT / SECTION
══════════════════════════════════════════════════════════ */
function CommentText({ text }) {
  const parts = text.split(/(@\S+)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('@')
          ? <span key={i} style={{ color:'#4F46E5',fontWeight:800,background:'#EEF2FF',borderRadius:4,padding:'0 4px' }}>{part}</span>
          : part
      )}
    </span>
  );
}

function CommentInput({ members, onSubmit, placeholder, accentColor }) {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const handleChange = (val) => {
    setText(val);
    const lastWord = val.split(/\s/).pop() || '';
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      const q = lastWord.slice(1).toLowerCase();
      setSuggestions(members.filter(m => m.name.toLowerCase().includes(q)));
    } else { setSuggestions([]); }
  };
  const insertMention = (m) => {
    const words = text.split(/\s/);
    words[words.length - 1] = '@' + m.name;
    setText(words.join(' ') + ' ');
    setSuggestions([]);
  };
  const submit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim()); setText(''); setSuggestions([]);
  };
  return (
    <div style={{ position:'relative' }}>
      {suggestions.length > 0 && (
        <div className="fu" style={{ position:'absolute',bottom:'100%',left:0,right:0,background:'white',border:'1.5px solid #E5E7EB',borderRadius:12,boxShadow:'0 4px 16px rgba(0,0,0,.1)',marginBottom:6,overflow:'hidden',zIndex:10 }}>
          {suggestions.map(m => (
            <button key={m.id} onClick={() => insertMention(m)} style={{ width:'100%',padding:'9px 14px',border:'none',background:'none',display:'flex',alignItems:'center',gap:10,cursor:'pointer',textAlign:'left' }}>
              <div style={{ width:26,height:26,borderRadius:'50%',background:accentColor||'#6366F1',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:11,fontWeight:800,flexShrink:0 }}>{m.name[0]}</div>
              <span style={{ fontSize:13,fontWeight:700,color:'#374151' }}>@{m.name}</span>
            </button>
          ))}
        </div>
      )}
      <div style={{ display:'flex',gap:8 }}>
        <textarea value={text} onChange={e=>handleChange(e.target.value)}
          placeholder={placeholder||'댓글 입력... (@이름 멘션, Shift+Enter 줄바꿈)'}
          rows={2}
          style={{ flex:1,padding:'10px 13px',fontSize:13,border:'1.5px solid #E5E7EB',borderRadius:11,resize:'none',fontFamily:'inherit',lineHeight:1.5 }}
          onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit();} }} />
        <button onClick={submit} disabled={!text.trim()} style={{ padding:'10px 16px',borderRadius:11,border:'none',background:text.trim()?(accentColor||'#4F46E5'):'#E5E7EB',color:'white',fontSize:13,fontWeight:700,cursor:text.trim()?'pointer':'default',flexShrink:0,alignSelf:'flex-end' }}>전송</button>
      </div>
    </div>
  );
}

function CommentSection({ comments, members, user, onAddComment, onAddReply, onDelete, accentColor }) {
  const [replyTo, setReplyTo] = useState(null);
  const [expanded, setExpanded] = useState({});
  const toggleExpand = (id) => setExpanded(p=>({...p,[id]:!p[id]}));
  return (
    <div>
      {comments.length===0&&<div style={{ textAlign:'center',padding:'24px 0',color:'#9CA3AF',fontSize:13 }}>아직 댓글이 없어요 💬</div>}
      {comments.map(c=>(
        <div key={c.id} className="fu" style={{ marginBottom:16 }}>
          {c.linkedTitle&&<div style={{ fontSize:11,fontWeight:700,color:'#9CA3AF',marginBottom:6 }}>{c.linkedType==='todo'?'✅':'📅'} {c.linkedTitle}에 댓글</div>}
          <div style={{ display:'flex',gap:10,alignItems:'flex-start' }}>
            <div style={{ width:34,height:34,borderRadius:'50%',background:accentColor||'#6366F1',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:14,fontWeight:900,flexShrink:0 }}>{(c.authorName||'?')[0]}</div>
            <div style={{ flex:1 }}>
              <div style={{ background:'white',border:'1px solid #F3F4F6',borderRadius:'0 14px 14px 14px',padding:'12px 14px',boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5 }}>
                  <span style={{ fontSize:13,fontWeight:800,color:'#111827' }}>{c.authorName}</span>
                  <span style={{ fontSize:11,color:'#9CA3AF' }}>{timeAgo(c.createdAt)}</span>
                </div>
                <div style={{ fontSize:14,color:'#374151',lineHeight:1.65 }}><CommentText text={c.text}/></div>
              </div>
              <div style={{ display:'flex',gap:12,marginTop:6,paddingLeft:4 }}>
                <button onClick={()=>setReplyTo(replyTo===c.id?null:c.id)} style={{ background:'none',border:'none',fontSize:12,fontWeight:700,color:'#6B7280',cursor:'pointer' }}>↩ 답글</button>
                {c.replies&&c.replies.length>0&&<button onClick={()=>toggleExpand(c.id)} style={{ background:'none',border:'none',fontSize:12,fontWeight:700,color:accentColor||'#4F46E5',cursor:'pointer' }}>{expanded[c.id]?'▲ 접기':'▼ 답글 '+c.replies.length+'개'}</button>}
                {c.authorId===user.id&&<button onClick={()=>onDelete(c.id)} style={{ background:'none',border:'none',fontSize:12,fontWeight:700,color:'#EF4444',cursor:'pointer' }}>삭제</button>}
              </div>
              {expanded[c.id]&&c.replies&&c.replies.map(r=>(
                <div key={r.id} style={{ display:'flex',gap:8,alignItems:'flex-start',marginTop:8,marginLeft:16 }}>
                  <div style={{ width:28,height:28,borderRadius:'50%',background:'#E5E7EB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#6B7280',flexShrink:0 }}>{(r.authorName||'?')[0]}</div>
                  <div style={{ flex:1,background:'#F9FAFB',border:'1px solid #F3F4F6',borderRadius:'0 10px 10px 10px',padding:'9px 12px' }}>
                    <div style={{ display:'flex',justifyContent:'space-between',marginBottom:3 }}>
                      <span style={{ fontSize:12,fontWeight:800,color:'#374151' }}>{r.authorName}</span>
                      <span style={{ fontSize:11,color:'#9CA3AF' }}>{timeAgo(r.createdAt)}</span>
                    </div>
                    <div style={{ fontSize:13,color:'#374151',lineHeight:1.6 }}><CommentText text={r.text}/></div>
                  </div>
                </div>
              ))}
              {replyTo===c.id&&(
                <div className="fu" style={{ marginTop:10,marginLeft:16 }}>
                  <CommentInput members={members} accentColor={accentColor} placeholder={'@'+c.authorName+'에게 답글...'}
                    onSubmit={(text)=>{onAddReply(c.id,text);setReplyTo(null);}}/>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <div style={{ marginTop:16,borderTop:'1px solid #F3F4F6',paddingTop:16 }}>
        <CommentInput members={members} accentColor={accentColor} onSubmit={(text)=>onAddComment(text,null,null,null)}/>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   WORKSPACE SCREEN (Pro — 공유 할일/캘린더/댓글 포함)
══════════════════════════════════════════════════════════ */
function WorkspaceScreen({ user, accounts, spaces, setSpaces }) {
  const cfg = WS[user.wsType] || WS.personal;
  const [view, setView] = useState('list');
  const [selSpace, setSelSpace] = useState(null);
  const [form, setForm] = useState({ name:'', description:'', type:user.wsType });
  const [invEmail, setInvEmail] = useState('');
  const [invResult, setInvResult] = useState(null);
  const [showMsgInput, setShowMsgInput] = useState(false);
  const [invMsg, setInvMsg] = useState('');
  const [invSent, setInvSent] = useState(false);
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState('members');
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [todoForm, setTodoForm] = useState({ title:'', priority:'medium', dueDate:'', assigneeId:'' });
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ title:'', date:tod(), time:'', color:'#4F46E5' });
  const [commentModal, setCommentModal] = useState(null);

  const updateSpace = (updated) => {
    const all = spaces.map(s => s.id===updated.id ? updated : s);
    setSpaces(all); sv('wl_spaces', all); setSelSpace(updated);
  };

  const createSpace = () => {
    if (!form.name.trim()) return;
    const space = { id:uid(), name:form.name.trim(), description:form.description, type:form.type, ownerId:user.id, members:[{ id:user.id, name:user.nickname||user.name, role:'owner' }], todos:[], events:[], comments:[], createdAt:new Date().toISOString() };
    const updated = [...spaces, space];
    setSpaces(updated); sv('wl_spaces', updated);
    setForm({ name:'', description:'', type:user.wsType });
    setSelSpace(space); setTab('members'); setView('detail');
  };

  const searchEmail = async () => {
    if (!invEmail.trim()) return;
    setSearching(true); setInvResult(null); setShowMsgInput(false); setInvMsg('');
    await new Promise(r => setTimeout(r, 400));
    setSearching(false);
    const found = accounts.find(a => a.email.toLowerCase()===invEmail.trim().toLowerCase()&&a.id!==user.id);
    const space = spaces.find(s=>s.id===selSpace&&selSpace.id);
    if (found && space&&space.members.find(m=>m.id===found.id)) setInvResult('already_member');
    else setInvResult(found||'not_found');
  };

  const sendInvite = () => {
    if (!invResult||invResult==='not_found'||invResult==='already_member') return;
    const space = spaces.find(s=>s.id===selSpace.id)||selSpace;
    const notif = { id:uid(), type:'invite', fromId:user.id, fromName:user.nickname||user.name, spaceId:space.id, spaceName:space.name, spaceType:space.type, message:invMsg.trim(), status:'pending', read:false, createdAt:new Date().toISOString() };
    sv('wl_notifs_'+invResult.id, [...ld('wl_notifs_'+invResult.id,[]), notif]);
    setInvSent(true); setInvEmail(''); setInvResult(null); setShowMsgInput(false); setInvMsg('');
    setTimeout(()=>setInvSent(false), 3500);
  };

  const addTodo = () => {
    if (!todoForm.title.trim()) return;
    const space = spaces.find(s=>s.id===selSpace.id)||selSpace;
    const assignee = space.members.find(m=>m.id===todoForm.assigneeId);
    const todo = { id:uid(), title:todoForm.title.trim(), status:'todo', priority:todoForm.priority, dueDate:todoForm.dueDate, assigneeId:todoForm.assigneeId, assigneeName:assignee&&assignee.name||'', createdByName:user.nickname||user.name, createdAt:new Date().toISOString() };
    updateSpace({ ...space, todos:[...(space.todos||[]), todo] });
    setTodoForm({ title:'', priority:'medium', dueDate:'', assigneeId:'' }); setShowTodoForm(false);
  };
  const cycleTodo = (id) => {
    const space = spaces.find(s=>s.id===selSpace.id)||selSpace;
    const order = ['todo','progress','done'];
    updateSpace({ ...space, todos:(space.todos||[]).map(t=>t.id===id?{...t,status:order[(order.indexOf(t.status)+1)%order.length]}:t) });
  };
  const delTodo = (id) => { const s=spaces.find(x=>x.id===selSpace.id)||selSpace; updateSpace({...s,todos:(s.todos||[]).filter(t=>t.id!==id)}); };

  const addEvent = () => {
    if (!eventForm.title.trim()) return;
    const space = spaces.find(s=>s.id===selSpace.id)||selSpace;
    const ev = { id:uid(), ...eventForm, title:eventForm.title.trim(), createdByName:user.nickname||user.name, createdAt:new Date().toISOString() };
    updateSpace({ ...space, events:[...(space.events||[]), ev].sort((a,b)=>a.date.localeCompare(b.date)) });
    setEventForm({ title:'', date:tod(), time:'', color:'#4F46E5' }); setShowEventForm(false);
  };
  const delEvent = (id) => { const s=spaces.find(x=>x.id===selSpace.id)||selSpace; updateSpace({...s,events:(s.events||[]).filter(e=>e.id!==id)}); };

  const addComment = (text, linkedId, linkedType, linkedTitle) => {
    const space = spaces.find(s=>s.id===selSpace.id)||selSpace;
    const c = { id:uid(), linkedId, linkedType, linkedTitle, authorId:user.id, authorName:user.nickname||user.name, text, replies:[], createdAt:new Date().toISOString() };
    updateSpace({ ...space, comments:[...(space.comments||[]), c] });
  };
  const addReply = (commentId, text) => {
    const space = spaces.find(s=>s.id===selSpace.id)||selSpace;
    const r = { id:uid(), authorId:user.id, authorName:user.nickname||user.name, text, createdAt:new Date().toISOString() };
    updateSpace({ ...space, comments:(space.comments||[]).map(c=>c.id===commentId?{...c,replies:[...(c.replies||[]),r]}:c) });
  };
  const delComment = (id) => { const s=spaces.find(x=>x.id===selSpace.id)||selSpace; updateSpace({...s,comments:(s.comments||[]).filter(c=>c.id!==id)}); };

  const mySpaces = spaces.filter(s=>s.members&&s.members.find(m=>m.id===user.id));

  if (view==='detail'&&selSpace) {
    const space = spaces.find(s=>s.id===selSpace.id)||selSpace;
    const wCfg = WS[space.type]||WS.personal;
    const isOwner = space.ownerId===user.id;
    const members = space.members||[];
    const todos = space.todos||[];
    const events = space.events||[];
    const comments = space.comments||[];
    const EV_COLORS = ['#4F46E5','#059669','#D97706','#DC2626','#0891B2','#BE185D'];
    const COLS = ['todo','progress','done'];
    const TABS = [
      { id:'members', label:'👥 멤버', count:members.length },
      { id:'todo', label:'✅ 할일', count:todos.filter(t=>t.status!=='done').length||0 },
      { id:'cal', label:'📅 캘린더', count:events.length||0 },
      { id:'comments', label:'💬 댓글', count:comments.length||0 },
    ];
    return (
      <div style={{ height:'100%',display:'flex',flexDirection:'column',overflow:'hidden' }}>
        <div style={{ padding:'14px 20px',borderBottom:'1px solid #F3F4F6',flexShrink:0,display:'flex',alignItems:'center',gap:12,background:'white' }}>
          <button onClick={()=>{setView('list');setInvResult(null);setInvEmail('');}} style={{ width:34,height:34,borderRadius:10,border:'1.5px solid #E5E7EB',background:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>←</button>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:17,fontWeight:900,color:'#111827' }}>{space.name}</div>
            <div style={{ fontSize:12,color:'#9CA3AF' }}>{wCfg.icon} {wCfg.label}용 · {members.length}명</div>
          </div>
        </div>
        <div style={{ display:'flex',borderBottom:'1px solid #F3F4F6',background:'white',flexShrink:0,padding:'0 16px',overflowX:'auto' }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:'11px 13px',border:'none',background:'none',fontWeight:tab===t.id?800:600,fontSize:13,color:tab===t.id?wCfg.c:'#6B7280',borderBottom:'2.5px solid '+(tab===t.id?wCfg.c:'transparent'),cursor:'pointer',display:'flex',alignItems:'center',gap:5,whiteSpace:'nowrap' }}>
              {t.label}
              {t.count>0&&<span style={{ fontSize:11,fontWeight:800,background:tab===t.id?wCfg.l:'#F3F4F6',color:tab===t.id?wCfg.c:'#9CA3AF',borderRadius:99,padding:'1px 6px' }}>{t.count}</span>}
            </button>
          ))}
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'20px' }}>
          {tab==='members'&&(
            <div>
              <div style={{ background:'white',borderRadius:14,padding:'16px',border:'1px solid #F3F4F6',marginBottom:16 }}>
                <div style={{ fontSize:14,fontWeight:800,color:'#111827',marginBottom:14 }}>멤버 ({members.length}명)</div>
                {members.map(m=>(
                  <div key={m.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid #F9FAFB' }}>
                    <div style={{ width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,'+wCfg.c+','+wCfg.d+')',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:15,fontWeight:900,flexShrink:0 }}>{(m.name||'?')[0]}</div>
                    <div style={{ flex:1 }}><div style={{ fontSize:14,fontWeight:700,color:'#111827' }}>{m.name}</div></div>
                    <Badge color={m.role==='owner'?wCfg.d:'#6B7280'} bg={m.role==='owner'?wCfg.l:'#F3F4F6'}>{m.role==='owner'?'관리자':'멤버'}</Badge>
                  </div>
                ))}
              </div>
              {isOwner&&(
                <div style={{ background:'white',borderRadius:14,padding:'18px',border:'1px solid #F3F4F6' }}>
                  <div style={{ fontSize:14,fontWeight:800,color:'#111827',marginBottom:4 }}>📧 이메일로 초대</div>
                  <div style={{ fontSize:12,color:'#9CA3AF',marginBottom:14 }}>Workly 가입된 이메일로만 초대 가능해요</div>
                  {invSent&&<div className="pp" style={{ background:'#ECFDF5',border:'1.5px solid #A7F3D0',borderRadius:10,padding:'10px 14px',fontSize:13,fontWeight:700,color:'#059669',marginBottom:12 }}>✉️ 초대 전송됨!</div>}
                  <div style={{ display:'flex',gap:8,marginBottom:10 }}>
                    <input value={invEmail} onChange={e=>{setInvEmail(e.target.value);setInvResult(null);}} placeholder="이메일 주소" onKeyDown={e=>e.key==='Enter'&&searchEmail()} style={{ flex:1,padding:'10px 13px',fontSize:13,border:'1.5px solid #E5E7EB',borderRadius:10,fontFamily:'inherit' }}/>
                    <button onClick={searchEmail} disabled={!invEmail.trim()||searching} style={{ padding:'10px 16px',borderRadius:10,border:'none',background:invEmail.trim()?wCfg.c:'#E5E7EB',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',minWidth:64,display:'flex',alignItems:'center',justifyContent:'center' }}>
                      {searching?<div style={{ width:13,height:13,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin .6s linear infinite' }}/>:'검색'}
                    </button>
                  </div>
                  {invResult==='not_found'&&<div className="fu" style={{ background:'#FEF2F2',border:'1.5px solid #FECACA',borderRadius:10,padding:'10px 14px',fontSize:13,fontWeight:700,color:'#DC2626' }}>❌ 등록된 이메일이 없습니다.</div>}
                  {invResult==='already_member'&&<div className="fu" style={{ background:'#FFFBEB',border:'1.5px solid #FDE68A',borderRadius:10,padding:'10px 14px',fontSize:13,fontWeight:700,color:'#D97706' }}>ℹ️ 이미 멤버예요.</div>}
                  {invResult&&invResult!=='not_found'&&invResult!=='already_member'&&(
                    <div className="fu" style={{ background:'#F9FAFB',border:'1.5px solid #E5E7EB',borderRadius:12,overflow:'hidden' }}>
                      <div style={{ padding:'14px',display:'flex',alignItems:'center',gap:12 }}>
                        <div style={{ width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,'+wCfg.c+','+wCfg.d+')',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:19,fontWeight:900,flexShrink:0 }}>{(invResult.nickname||invResult.name||'?')[0]}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14,fontWeight:800,color:'#111827' }}>{invResult.nickname||invResult.name}</div>
                          <div style={{ fontSize:12,color:'#9CA3AF' }}>{invResult.email}</div>
                        </div>
                        {!showMsgInput&&<button onClick={()=>setShowMsgInput(true)} style={{ padding:'8px 14px',borderRadius:99,border:'none',background:wCfg.c,color:'white',fontSize:13,fontWeight:700,cursor:'pointer' }}>초대</button>}
                      </div>
                      {showMsgInput&&(
                        <div style={{ padding:'0 14px 14px',borderTop:'1px solid #F3F4F6' }}>
                          <textarea value={invMsg} onChange={e=>setInvMsg(e.target.value)} placeholder="초대 메시지 (선택)" rows={2} style={{ width:'100%',padding:'10px',fontSize:13,border:'1.5px solid #E5E7EB',borderRadius:9,resize:'none',fontFamily:'inherit',marginTop:12,marginBottom:10 }}/>
                          <div style={{ display:'flex',gap:8 }}>
                            <button onClick={()=>setShowMsgInput(false)} style={{ flex:1,padding:'9px',borderRadius:9,border:'1.5px solid #E5E7EB',background:'white',color:'#6B7280',fontSize:13,fontWeight:600,cursor:'pointer' }}>취소</button>
                            <button onClick={sendInvite} style={{ flex:2,padding:'9px',borderRadius:9,border:'none',background:wCfg.c,color:'white',fontSize:13,fontWeight:700,cursor:'pointer' }}>✉️ 초대 보내기</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {tab==='todo'&&(
            <div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
                <div style={{ fontSize:14,fontWeight:800,color:'#111827' }}>공유 할일</div>
                <button onClick={()=>setShowTodoForm(p=>!p)} style={{ padding:'8px 14px',borderRadius:9,border:'none',background:wCfg.c,color:'white',fontSize:13,fontWeight:700,cursor:'pointer' }}>+ 추가</button>
              </div>
              {showTodoForm&&(
                <div className="fu" style={{ background:'white',borderRadius:14,padding:'16px',border:'1.5px solid '+wCfg.m,marginBottom:16 }}>
                  <Field value={todoForm.title} onChange={v=>setTodoForm(p=>({...p,title:v}))} label="할일 제목" placeholder="할일을 입력하세요" required/>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                    <Select label="우선순위" value={todoForm.priority} onChange={v=>setTodoForm(p=>({...p,priority:v}))} options={Object.entries(PRIO).map(([k,v])=>({value:k,label:v.l}))}/>
                    <Field value={todoForm.dueDate} onChange={v=>setTodoForm(p=>({...p,dueDate:v}))} label="마감일" type="date"/>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:5,textTransform:'uppercase',letterSpacing:'.04em' }}>담당자</div>
                    <select value={todoForm.assigneeId} onChange={e=>setTodoForm(p=>({...p,assigneeId:e.target.value}))} style={{ width:'100%',padding:'10px 13px',fontSize:14,border:'1.5px solid #E5E7EB',borderRadius:10,background:'white' }}>
                      <option value="">담당자 없음</option>
                      {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display:'flex',gap:8 }}>
                    <Btn onClick={()=>setShowTodoForm(false)} outline color="#6B7280" style={{ flex:1 }}>취소</Btn>
                    <Btn onClick={addTodo} bg={wCfg.c} disabled={!todoForm.title.trim()} style={{ flex:2 }}>추가</Btn>
                  </div>
                </div>
              )}
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12 }}>
                {COLS.map(col=>{
                  const colTodos = todos.filter(t=>t.status===col);
                  const S = STAT[col];
                  return (
                    <div key={col}>
                      <div style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 10px',background:S.bg,borderRadius:9,marginBottom:10 }}>
                        <span style={{ fontSize:12 }}>{S.icon}</span>
                        <span style={{ fontSize:12,fontWeight:800,color:S.c }}>{S.l}</span>
                        <span style={{ marginLeft:'auto',fontSize:11,fontWeight:700,color:S.c,background:'white',borderRadius:99,padding:'1px 6px' }}>{colTodos.length}</span>
                      </div>
                      {colTodos.length===0&&<div style={{ textAlign:'center',padding:'20px 8px',color:'#D1D5DB',fontSize:12 }}>없음</div>}
                      {colTodos.map(t=>(
                        <div key={t.id} style={{ background:'white',borderRadius:12,padding:'12px',border:'1px solid #F3F4F6',marginBottom:8,boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
                          <div style={{ display:'flex',justifyContent:'space-between',gap:6,marginBottom:8 }}>
                            <div style={{ fontSize:13,fontWeight:700,color:'#111827',lineHeight:1.4,textDecoration:t.status==='done'?'line-through':'none',opacity:t.status==='done'?0.6:1 }}>{t.title}</div>
                            <button onClick={()=>delTodo(t.id)} style={{ background:'none',border:'none',color:'#D1D5DB',cursor:'pointer',fontSize:12,flexShrink:0 }}>✕</button>
                          </div>
                          <div style={{ display:'flex',gap:4,flexWrap:'wrap',marginBottom:8 }}>
                            <Badge color={PRIO[t.priority]&&PRIO[t.priority].c} bg={PRIO[t.priority]&&PRIO[t.priority].bg}>{PRIO[t.priority]&&PRIO[t.priority].l}</Badge>
                            {t.dueDate&&<Badge color="#6B7280" bg="#F9FAFB">📅 {fmtD(t.dueDate)}</Badge>}
                            {t.assigneeName&&<Badge color={wCfg.d} bg={wCfg.l}>👤 {t.assigneeName}</Badge>}
                          </div>
                          <div style={{ display:'flex',gap:6 }}>
                            <button onClick={()=>cycleTodo(t.id)} style={{ flex:1,padding:'5px 8px',borderRadius:7,border:'1px solid '+wCfg.m,background:wCfg.l,color:wCfg.d,fontSize:11,fontWeight:700,cursor:'pointer' }}>상태 변경</button>
                            <button onClick={()=>setCommentModal({id:t.id,type:'todo',title:t.title})} style={{ padding:'5px 10px',borderRadius:7,border:'1px solid #E5E7EB',background:'white',color:'#6B7280',fontSize:11,fontWeight:700,cursor:'pointer' }}>
                              {'💬 '+(comments.filter(c=>c.linkedId===t.id).length||'')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {tab==='cal'&&(
            <div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
                <div style={{ fontSize:14,fontWeight:800,color:'#111827' }}>공유 일정</div>
                <button onClick={()=>setShowEventForm(p=>!p)} style={{ padding:'8px 14px',borderRadius:9,border:'none',background:wCfg.c,color:'white',fontSize:13,fontWeight:700,cursor:'pointer' }}>+ 추가</button>
              </div>
              {showEventForm&&(
                <div className="fu" style={{ background:'white',borderRadius:14,padding:'16px',border:'1.5px solid '+wCfg.m,marginBottom:16 }}>
                  <Field value={eventForm.title} onChange={v=>setEventForm(p=>({...p,title:v}))} label="일정 제목" placeholder="일정 제목 입력" required/>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                    <Field value={eventForm.date} onChange={v=>setEventForm(p=>({...p,date:v}))} label="날짜" type="date"/>
                    <Field value={eventForm.time} onChange={v=>setEventForm(p=>({...p,time:v}))} label="시간" placeholder="14:00"/>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:6,textTransform:'uppercase',letterSpacing:'.04em' }}>색상</div>
                    <div style={{ display:'flex',gap:8 }}>
                      {EV_COLORS.map(c=><button key={c} onClick={()=>setEventForm(p=>({...p,color:c}))} style={{ width:26,height:26,borderRadius:'50%',background:c,border:eventForm.color===c?'3px solid #111827':'3px solid transparent',cursor:'pointer' }}/>)}
                    </div>
                  </div>
                  <div style={{ display:'flex',gap:8 }}>
                    <Btn onClick={()=>setShowEventForm(false)} outline color="#6B7280" style={{ flex:1 }}>취소</Btn>
                    <Btn onClick={addEvent} bg={wCfg.c} disabled={!eventForm.title.trim()} style={{ flex:2 }}>추가</Btn>
                  </div>
                </div>
              )}
              {events.length===0&&<Empty icon="📅" title="일정이 없어요" desc="+ 추가 버튼으로 팀 일정을 추가하세요"/>}
              {events.map(ev=>(
                <div key={ev.id} style={{ background:'white',borderRadius:13,padding:'14px 16px',border:'1px solid #F3F4F6',marginBottom:10,display:'flex',gap:12,alignItems:'center' }}>
                  <div style={{ width:4,alignSelf:'stretch',borderRadius:2,background:ev.color||wCfg.c,flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14,fontWeight:700,color:'#111827',marginBottom:4 }}>{ev.title}</div>
                    <div style={{ fontSize:12,color:'#6B7280' }}>{'📅 '+fmtFull(ev.date)+(ev.time?' · 🕐 '+ev.time:'')}</div>
                    <div style={{ fontSize:11,color:'#9CA3AF',marginTop:2 }}>등록: {ev.createdByName}</div>
                  </div>
                  <div style={{ display:'flex',gap:6 }}>
                    <button onClick={()=>setCommentModal({id:ev.id,type:'event',title:ev.title})} style={{ padding:'6px 10px',borderRadius:8,border:'1px solid #E5E7EB',background:'white',color:'#6B7280',fontSize:12,fontWeight:700,cursor:'pointer' }}>
                      {'💬 '+(comments.filter(c=>c.linkedId===ev.id).length||'댓글')}
                    </button>
                    <button onClick={()=>delEvent(ev.id)} style={{ padding:'6px 8px',borderRadius:8,border:'1px solid #FECACA',background:'#FEF2F2',color:'#EF4444',fontSize:12,cursor:'pointer' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab==='comments'&&(
            <div>
              <div style={{ fontSize:14,fontWeight:800,color:'#111827',marginBottom:16 }}>전체 댓글</div>
              <CommentSection comments={comments} members={members} user={user} onAddComment={addComment} onAddReply={addReply} onDelete={delComment} accentColor={wCfg.c}/>
            </div>
          )}
        </div>
        {commentModal&&(
          <div style={{ position:'fixed',inset:0,zIndex:900,background:'rgba(0,0,0,.4)',backdropFilter:'blur(4px)',display:'flex',alignItems:'flex-end',justifyContent:'center' }}
            onClick={e=>e.target===e.currentTarget&&setCommentModal(null)}>
            <div className="fu" style={{ background:'white',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:640,maxHeight:'75vh',display:'flex',flexDirection:'column',boxShadow:'0 -8px 40px rgba(0,0,0,.15)' }}>
              <div style={{ padding:'16px 20px',borderBottom:'1px solid #F3F4F6',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0 }}>
                <div>
                  <div style={{ fontSize:11,fontWeight:700,color:'#9CA3AF',marginBottom:2 }}>{commentModal.type==='todo'?'✅ 할일':'📅 일정'}에 댓글</div>
                  <div style={{ fontSize:15,fontWeight:800,color:'#111827' }}>{commentModal.title}</div>
                </div>
                <button onClick={()=>setCommentModal(null)} style={{ width:30,height:30,borderRadius:8,border:'none',background:'#F9FAFB',color:'#6B7280',fontSize:14,cursor:'pointer' }}>✕</button>
              </div>
              <div style={{ flex:1,overflowY:'auto',padding:'16px 20px' }}>
                <CommentSection
                  comments={comments.filter(c=>c.linkedId===commentModal.id)}
                  members={members} user={user}
                  onAddComment={(text)=>addComment(text,commentModal.id,commentModal.type,commentModal.title)}
                  onAddReply={addReply} onDelete={delComment} accentColor={wCfg.c}/>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding:'24px',height:'100%',overflowY:'auto' }}>
      <div className="fu" style={{ marginBottom:24 }}>
        <div style={{ fontSize:20,fontWeight:900,color:'#111827' }}>👥 협업 워크스페이스</div>
        <div style={{ fontSize:13,color:'#6B7280',marginTop:2 }}>팀원들과 함께 작업하는 공간이에요</div>
      </div>
      {view!=='create'&&(
        <button onClick={()=>setView('create')} style={{ width:'100%',padding:'20px',borderRadius:16,border:'2px dashed '+cfg.c,background:cfg.l,cursor:'pointer',marginBottom:20,display:'flex',alignItems:'center',gap:14,textAlign:'left' }}>
          <div style={{ width:48,height:48,borderRadius:14,background:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,boxShadow:'0 2px 8px rgba(0,0,0,.08)' }}>＋</div>
          <div>
            <div style={{ fontSize:15,fontWeight:800,color:cfg.c }}>새 워크스페이스 만들기</div>
            <div style={{ fontSize:12,color:cfg.d,marginTop:3 }}>팀을 만들고 이메일로 멤버를 초대해요</div>
          </div>
        </button>
      )}
      {view==='create'&&(
        <div className="fu" style={{ background:'white',borderRadius:16,padding:'20px',border:'1px solid #F3F4F6',marginBottom:20 }}>
          <div style={{ fontSize:15,fontWeight:800,color:'#111827',marginBottom:16 }}>새 워크스페이스 만들기</div>
          <Field value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} label="이름" placeholder="예: 3학년 2반, 마케팅팀" required/>
          <Field value={form.description} onChange={v=>setForm(p=>({...p,description:v}))} label="설명" placeholder="설명 (선택)" rows={2}/>
          <Select label="유형" value={form.type} onChange={v=>setForm(p=>({...p,type:v}))} options={Object.entries(WS).map(([k,v])=>({value:k,label:v.icon+' '+v.label+'용'}))}/>
          <div style={{ display:'flex',gap:10 }}>
            <Btn onClick={()=>setView('list')} outline color="#6B7280" style={{ flex:1 }}>취소</Btn>
            <Btn onClick={createSpace} bg={cfg.c} disabled={!form.name.trim()} style={{ flex:2 }}>만들기</Btn>
          </div>
        </div>
      )}
      {mySpaces.length>0&&(
        <>
          <div style={{ fontSize:12,fontWeight:800,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:12 }}>내 워크스페이스</div>
          {mySpaces.map(s=>{
            const wCfg=WS[s.type]||WS.personal;
            return (
              <div key={s.id} onClick={()=>{setSelSpace(s);setTab('members');setView('detail');setInvResult(null);setInvEmail('');}}
                style={{ background:'white',borderRadius:14,padding:'16px 18px',border:'1px solid #F3F4F6',cursor:'pointer',display:'flex',alignItems:'center',gap:14,marginBottom:10,boxShadow:'0 2px 8px rgba(0,0,0,.04)',transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.08)';e.currentTarget.style.transform='translateY(-1px)';}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,.04)';e.currentTarget.style.transform='translateY(0)';}}>
                <div style={{ width:46,height:46,borderRadius:13,background:wCfg.l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>{wCfg.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15,fontWeight:800,color:'#111827',marginBottom:3 }}>{s.name}</div>
                  <div style={{ fontSize:12,color:'#9CA3AF',display:'flex',gap:10 }}>
                    <span>{'👥 '+(s.members&&s.members.length||1)+'명'}</span>
                    <span>{'✅ '+((s.todos||[]).filter(t=>t.status!=='done').length)+'개 진행중'}</span>
                    {(s.comments||[]).length>0&&<span>{'💬 '+(s.comments||[]).length}</span>}
                  </div>
                </div>
                <span style={{ fontSize:16,color:'#D1D5DB' }}>›</span>
              </div>
            );
          })}
        </>
      )}
      {mySpaces.length===0&&view!=='create'&&<Empty icon="👥" title="참여 중인 워크스페이스가 없어요" desc="새 워크스페이스를 만들거나 초대를 기다려보세요"/>}
    </div>
  );
}
/* ══════════════════════════════════════════════════════════
   PRO UPGRADE SCREEN
══════════════════════════════════════════════════════════ */
function ProUpgradeScreen({ user, onUpgrade, onBack }) {
  const cfg = WS[user.wsType] || WS.personal;
  const [plan, setPlan] = useState('annual');
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  const PLANS = {
    monthly: { l: '월간', price: '₩9,900', sub: '/월', save: null },
    annual:  { l: '연간', price: '₩79,900', sub: '/년', save: '17% 절약' },
  };

  const pay = async () => {
    setPaying(true);
    await new Promise(r => setTimeout(r, 2000));
    setPaying(false); setDone(true);
    await new Promise(r => setTimeout(r, 1200));
    onUpgrade();
  };

  const PERKS = [
    { icon: '👥', title: '협업 워크스페이스', desc: '팀원들과 함께 작업하는 공간 생성' },
    { icon: '🔗', title: '초대 코드 발급', desc: '링크나 코드로 멤버를 초대' },
    { icon: '📊', title: '공유 할일 & 캘린더', desc: '팀과 함께 할일과 일정 관리' },
    { icon: '♾️', title: '무제한 워크스페이스', desc: '원하는 만큼 공간 생성 가능' },
  ];

  if (done) return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${cfg.c}, ${cfg.d})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <div style={{ fontSize: 72, marginBottom: 16, animation: 'pop .5s ease' }}>🎉</div>
      <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Pro 가입 완료!</div>
      <p style={{ fontSize: 15, opacity: 0.85 }}>이제 팀과 함께 작업해보세요 👥</p>
    </div>
  );

  return (
    <div style={{ height: '100%', background: '#FAFAFA', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 20px', background: 'white', borderBottom: '1px solid #F3F4F6', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 18, color: '#6B7280', cursor: 'pointer' }}>←</button>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>Pro 업그레이드</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>⚡️</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#111827', marginBottom: 6 }}>Workly Pro</h2>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>{user.nickname}님의 팀과 함께하는<br />스마트한 협업 경험</p>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {Object.entries(PLANS).map(([k, v]) => (
            <button key={k} onClick={() => setPlan(k)} style={{ flex: 1, padding: '14px 10px', borderRadius: 14, border: `2px solid ${plan === k ? cfg.c : '#E5E7EB'}`, background: plan === k ? cfg.l : 'white', position: 'relative', cursor: 'pointer', textAlign: 'center' }}>
              {v.save && <span style={{ position: 'absolute', top: -10, right: 8, background: '#059669', color: 'white', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99 }}>{v.save}</span>}
              <div style={{ fontSize: 13, fontWeight: 700, color: plan === k ? cfg.d : '#6B7280', marginBottom: 3 }}>{v.l}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: plan === k ? cfg.c : '#111827' }}>{v.price}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>{v.sub}</div>
            </button>
          ))}
        </div>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F3F4F6', overflow: 'hidden', marginBottom: 20 }}>
          {PERKS.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < PERKS.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{p.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 1 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>{p.desc}</div>
              </div>
              <span style={{ color: '#059669', fontSize: 14 }}>✓</span>
            </div>
          ))}
        </div>
        <button onClick={pay} disabled={paying} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: paying ? '#9CA3AF' : `linear-gradient(135deg, ${cfg.c}, ${cfg.d})`, color: 'white', fontSize: 15, fontWeight: 700, cursor: paying ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {paying ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> 처리 중...</> : `💳 ${PLANS[plan].price} 결제하기`}
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 10 }}>언제든 해지 가능 · 부가세 포함</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PROFILE SCREEN
══════════════════════════════════════════════════════════ */
function ProfileScreen({ user, onUpdate, onLogout, onDeleteAccount, onShowPro, isProUser }) {
  const cfg = WS[user.wsType] || WS.personal;
  const [editNick, setEditNick] = useState(false);
  const [nick, setNick] = useState(user.nickname || user.name);
  const [showDel, setShowDel] = useState(false);
  const fileRef = useRef(null);

  const handleAvatar = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onUpdate({ avatar: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      <div className="fu" style={{ fontSize: 20, fontWeight: 900, color: '#111827', marginBottom: 24 }}>프로필 설정</div>
      {/* Avatar + name */}
      <div className="fu" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28, animationDelay: '.05s' }}>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: `linear-gradient(135deg, ${cfg.c}, ${cfg.d})`, border: `3px solid ${cfg.c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {user.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ fontSize: 36, color: 'white', fontWeight: 900 }}>{(user.nickname || user.name || '?')[0]}</span>}
          </div>
          <button onClick={() => { if(fileRef.current) fileRef.current.click(); }} style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: '#111827', border: '2px solid white', color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷</button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
        </div>
        {editNick ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={nick} onChange={e => setNick(e.target.value)} autoFocus style={{ padding: '8px 12px', border: `2px solid ${cfg.c}`, borderRadius: 10, fontSize: 16, fontWeight: 700, textAlign: 'center' }} onKeyDown={e => e.key === 'Enter' && (() => { if (nick.trim()) onUpdate({ nickname: nick.trim() }); setEditNick(false); })()} />
            <Btn onClick={() => { if (nick.trim()) onUpdate({ nickname: nick.trim() }); setEditNick(false); }} bg={cfg.c} sm>저장</Btn>
            <Btn onClick={() => setEditNick(false)} outline color="#6B7280" sm>취소</Btn>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>{user.nickname || user.name}</span>
            <button onClick={() => setEditNick(true)} style={{ background: cfg.l, border: 'none', borderRadius: 7, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: cfg.d, cursor: 'pointer' }}>수정</button>
          </div>
        )}
        {isProUser && <Badge color="#D97706" bg="#FFFBEB" style={{ marginTop: 6 }}>✨ Pro</Badge>}
      </div>

      {/* Info */}
      <div className="fu" style={{ background: 'white', borderRadius: 16, border: '1px solid #F3F4F6', padding: '0 18px', marginBottom: 16, animationDelay: '.08s' }}>
        {[['이름', user.name], ['이메일', user.email], ['닉네임', user.nickname || user.name], ['워크스페이스 유형', `${WS[user.wsType]&&WS[user.wsType].icon} ${WS[user.wsType]&&WS[user.wsType].label}용`], ['플랜', isProUser ? '✨ Pro' : '무료']].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid #F9FAFB' }}>
            <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>{l}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{v}</span>
          </div>
        ))}
      </div>

      {!isProUser && (
        <button onClick={onShowPro} style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #D97706, #DC2626)', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer', marginBottom: 12 }}>⚡️ Pro로 업그레이드</button>
      )}
      <button onClick={onLogout} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>로그아웃</button>
      <button onClick={() => setShowDel(true)} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid #F3F4F6', background: 'white', color: '#9CA3AF', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>회원 탈퇴</button>

      {showDel && (
        <Modal title="정말 탈퇴하시겠어요?" onClose={() => setShowDel(false)} width={360}>
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#DC2626', fontWeight: 600, textAlign: 'center' }}>모든 데이터가 영구 삭제됩니다.</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={() => setShowDel(false)} outline color="#6B7280" style={{ flex: 1 }}>취소</Btn>
            <Btn onClick={onDeleteAccount} bg="#EF4444" style={{ flex: 1 }}>탈퇴하기</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   AI CHAT SCREEN — Workly 전용 AI 어시스턴트
   사용자의 실제 데이터(할일/목표/습관/성적 등)를 알고 대화
══════════════════════════════════════════════════════════ */
function AIChatScreen({ user, todos, events, goals, habits, grades, journals, timeLogs, spaces }) {
  const cfg = WS[user.wsType] || WS.personal;
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: '안녕하세요, ' + (user.nickname || user.name) + '님! 👋 저는 Workly AI예요.\n\n지금 등록된 할일 ' + todos.length + '개, 일정 ' + events.length + '개를 알고 있어요. 무엇이든 물어보세요!',
    id: 'welcome',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContext = () => {
    const wsLabel = user.wsType === 'school' ? '학교' : user.wsType === 'company' ? '회사' : '개인';
    const todoDone = todos.filter(function(t) { return t.status === 'done'; }).length;
    const todoActive = todos.filter(function(t) { return t.status !== 'done'; });
    const todayKey = new Date().toISOString().split('T')[0];
    const todayEvents = events.filter(function(e) { return e.date === todayKey; });
    const todayHabits = habits ? habits.filter(function(h) { return h.log && h.log[todayKey]; }) : [];

    var lines = [];
    lines.push('[사용자 정보]');
    lines.push('이름: ' + (user.nickname || user.name));
    lines.push('워크스페이스: ' + wsLabel + '용');
    lines.push('오늘: ' + new Date().toLocaleDateString('ko-KR'));
    lines.push('');
    lines.push('[할일 현황]');
    lines.push('전체: ' + todos.length + '개 (완료: ' + todoDone + '개, 미완료: ' + todoActive.length + '개)');

    if (todoActive.length > 0) {
      lines.push('미완료 할일:');
      todoActive.slice(0, 8).forEach(function(t) {
        var p = t.priority === 'high' ? '높음' : t.priority === 'low' ? '낮음' : '중간';
        var due = t.dueDate ? ' (마감: ' + t.dueDate + ')' : '';
        lines.push('- [' + p + '] ' + t.title + due);
      });
    }

    if (todayEvents.length > 0) {
      lines.push('');
      lines.push('[오늘 일정]');
      todayEvents.forEach(function(e) {
        lines.push('- ' + e.title + (e.time ? ' ' + e.time : ''));
      });
    }

    if (goals && goals.length > 0) {
      lines.push('');
      lines.push('[목표 현황]');
      goals.slice(0, 5).forEach(function(g) {
        lines.push('- ' + g.title + ': ' + g.progress + '%');
      });
    }

    if (habits && habits.length > 0) {
      lines.push('');
      lines.push('[습관 트래커]');
      lines.push('오늘 완료: ' + todayHabits.length + '/' + habits.length + '개');
      habits.slice(0, 5).forEach(function(h) {
        var streak = 0;
        var d = new Date();
        while (h.log && h.log[d.toISOString().split('T')[0]]) {
          streak++;
          d.setDate(d.getDate() - 1);
        }
        lines.push('- ' + (h.icon || '') + ' ' + h.name + ': ' + streak + '일 연속');
      });
    }

    if (user.wsType === 'school' && grades && grades.length > 0) {
      var avg = Math.round(grades.reduce(function(a, b) { return a + b.pct; }, 0) / grades.length);
      lines.push('');
      lines.push('[성적] 평균: ' + avg + '점 (' + grades.length + '개 기록)');
    }

    if (user.wsType === 'company' && timeLogs && timeLogs.length > 0) {
      var todayTime = timeLogs.filter(function(l) { return l.date === todayKey; }).reduce(function(a, b) { return a + b.duration; }, 0);
      lines.push('');
      lines.push('[업무 시간] 오늘: ' + Math.floor(todayTime / 3600) + '시간 ' + Math.floor((todayTime % 3600) / 60) + '분');
    }

    return lines.join('\n');
  };

  const sendMessage = function(text) {
    var userText = (text || input).trim();
    if (!userText) return;
    setInput('');
    var userMsg = { role: 'user', content: userText, id: uid() };
    var newMessages = messages.concat([userMsg]);
    setMessages(newMessages);
    setLoading(true);

    var context = buildContext();
    var systemPrompt = '당신은 Workly의 AI 어시스턴트예요. 사용자의 생산성을 돕는 친절한 조수예요.\n\n'
      + '사용자 실제 데이터:\n' + context + '\n\n'
      + '규칙:\n'
      + '- 한국어로 답변\n'
      + '- 사용자 데이터를 활용해서 구체적 조언\n'
      + '- 짧고 명확하게\n'
      + '- 이모지 적절히 사용\n'
      + '- 동기부여와 응원 포함';

    var apiMessages = newMessages
      .filter(function(m) { return m.id !== 'welcome'; })
      .map(function(m) { return { role: m.role, content: m.content }; });

    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: systemPrompt,
        messages: apiMessages,
      })
    }).then(function(res) {
      return res.json();
    }).then(function(data) {
      var reply = data.content && data.content[0] ? data.content[0].text : '죄송해요, 잠시 후 다시 시도해주세요.';
      setMessages(function(p) { return p.concat([{ role: 'assistant', content: reply, id: uid() }]); });
      setLoading(false);
      setTimeout(function() { if (inputRef.current) inputRef.current.focus(); }, 100);
    }).catch(function() {
      setMessages(function(p) { return p.concat([{ role: 'assistant', content: '연결에 문제가 생겼어요. 잠시 후 다시 시도해주세요. 🙏', id: uid() }]); });
      setLoading(false);
    });
  };

  var quickActions = {
    school:   ['오늘 할일 정리해줘', '이번 주 시험 준비 계획 짜줘', '집중해야 할 과제가 뭐야?', '성적 올리는 방법 알려줘'],
    company:  ['오늘 업무 우선순위 정해줘', '이번 주 진행 상황 요약해줘', '할일 중 급한 것만 골라줘', '업무 효율 높이는 방법'],
    personal: ['오늘 할일 정리해줘', '목표 달성률 분석해줘', '습관 유지 팁 알려줘', '이번 주 잘한 점 알려줘'],
  };
  var actions = quickActions[user.wsType] || quickActions.personal;

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* 헤더 */}
      <div style={{ padding:'16px 20px', borderBottom:'1px solid #F3F4F6', flexShrink:0, background:'white', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,'+cfg.c+','+cfg.d+')', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🤖</div>
          <div>
            <div style={{ fontSize:16, fontWeight:900, color:'#111827' }}>Workly AI</div>
            <div style={{ fontSize:11, color:'#9CA3AF' }}>나의 데이터를 알고 있는 AI 어시스턴트</div>
          </div>
        </div>
        <button onClick={function() { setMessages([{ role:'assistant', content:'대화를 초기화했어요. 무엇을 도와드릴까요? 😊', id:uid() }]); }} style={{ padding:'6px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', background:'white', color:'#6B7280', fontSize:12, fontWeight:600, cursor:'pointer' }}>
          🔄 초기화
        </button>
      </div>

      {/* 메시지 영역 */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 20px 0', display:'flex', flexDirection:'column', gap:12 }}>
        {messages.length <= 1 && (
          <div className="fu" style={{ marginBottom:8 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#9CA3AF', marginBottom:10 }}>💡 빠른 질문</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {actions.map(function(a, i) {
                return (
                  <button key={i} onClick={function() { sendMessage(a); }}
                    style={{ padding:'8px 14px', borderRadius:99, border:'1.5px solid '+cfg.m, background:cfg.l, color:cfg.d, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {messages.map(function(msg) {
          return (
            <div key={msg.id} style={{ display:'flex', gap:10, alignItems:'flex-start', flexDirection: msg.role==='user' ? 'row-reverse' : 'row' }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background: msg.role==='user' ? cfg.c : 'linear-gradient(135deg,#6366F1,#2563EB)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:900, color:'white', flexShrink:0 }}>
                {msg.role==='user' ? (user.nickname||user.name||'?')[0] : '🤖'}
              </div>
              <div style={{ maxWidth:'75%', background: msg.role==='user' ? cfg.c : 'white', color: msg.role==='user' ? 'white' : '#111827', borderRadius: msg.role==='user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px', padding:'12px 16px', fontSize:14, lineHeight:1.75, boxShadow:'0 2px 8px rgba(0,0,0,.06)', border: msg.role==='user' ? 'none' : '1px solid #F3F4F6', whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                {msg.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="fu" style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#6366F1,#2563EB)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🤖</div>
            <div style={{ background:'white', border:'1px solid #F3F4F6', borderRadius:'4px 16px 16px 16px', padding:'14px 18px', boxShadow:'0 2px 8px rgba(0,0,0,.06)' }}>
              <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                {[0,1,2].map(function(i) {
                  return <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:cfg.c, animation:'pulse 1.2s ease-in-out '+((i*0.2)+'s')+' infinite' }}/>;
                })}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} style={{ height:1 }}/>
      </div>

      {/* 입력창 */}
      <div style={{ padding:'14px 20px 20px', flexShrink:0, background:'white', borderTop:'1px solid #F3F4F6' }}>
        <div style={{ display:'flex', gap:10, alignItems:'flex-end', background:'#F9FAFB', borderRadius:16, padding:'10px 14px', border:'1.5px solid #E5E7EB' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={function(e) { setInput(e.target.value); }}
            placeholder="메시지 입력... (Enter 전송, Shift+Enter 줄바꿈)"
            rows={1}
            style={{ flex:1, background:'none', border:'none', resize:'none', fontSize:14, lineHeight:1.55, fontFamily:'inherit', color:'#1F2937', maxHeight:120, overflowY:'auto' }}
            onKeyDown={function(e) {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!loading && input.trim()) sendMessage();
              }
            }}
          />
          <button
            onClick={function() { if (!loading && input.trim()) sendMessage(); }}
            disabled={loading || !input.trim()}
            style={{ width:38, height:38, borderRadius:11, border:'none', background: input.trim() && !loading ? cfg.c : '#E5E7EB', color:'white', fontSize:17, cursor: input.trim() && !loading ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            ↑
          </button>
        </div>
        <div style={{ fontSize:11, color:'#9CA3AF', textAlign:'center', marginTop:8 }}>
          {'AI가 내 할일 ' + todos.length + '개, 일정 ' + events.length + '개를 알고 있어요'}
        </div>
      </div>
    </div>
  );
}


function TemplateScreen({ user, onUpdate }) {
  const currentTheme = user.theme || 'default';
  const currentIconSet = user.iconSet || 'default';
  const [selTheme, setSelTheme] = useState(currentTheme);
  const [selIcons, setSelIcons] = useState(currentIconSet);
  const [saved, setSaved] = useState(false);

  const apply = () => {
    onUpdate({ theme: selTheme, iconSet: selIcons });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const themeObj = THEMES[selTheme] || THEMES.default;

  return (
    <div style={{ padding:'24px',height:'100%',overflowY:'auto' }}>
      <div className="fu" style={{ marginBottom:24 }}>
        <div style={{ fontSize:20,fontWeight:900,color:'#111827' }}>🎨 테마 설정</div>
        <div style={{ fontSize:13,color:'#6B7280',marginTop:2 }}>앱의 배경색과 아이콘 스타일을 바꿔보세요</div>
      </div>

      {/* 저장 완료 토스트 */}
      {saved && (
        <div className="pp" style={{ background:'#ECFDF5',border:'1.5px solid #A7F3D0',borderRadius:12,padding:'12px 18px',marginBottom:20,display:'flex',alignItems:'center',gap:10 }}>
          <span style={{ fontSize:18 }}>✨</span>
          <span style={{ fontSize:13,fontWeight:700,color:'#059669' }}>테마가 적용되었어요!</span>
        </div>
      )}

      {/* 미리보기 */}
      <div style={{ background:'white',borderRadius:18,border:'1.5px solid #F3F4F6',overflow:'hidden',marginBottom:24,boxShadow:'0 4px 16px rgba(0,0,0,.06)' }}>
        <div style={{ fontSize:12,fontWeight:700,color:'#9CA3AF',padding:'14px 18px 10px',textTransform:'uppercase',letterSpacing:'.05em' }}>미리보기</div>
        <div style={{ display:'flex',height:140,borderTop:'1px solid #F3F4F6' }}>
          {/* Mini sidebar */}
          <div style={{ width:72,background:themeObj.sidebarBg,borderRight:`1px solid ${themeObj.sidebarBorder}`,display:'flex',flexDirection:'column',alignItems:'center',gap:8,paddingTop:12,flexShrink:0 }}>
            {['home','todo','cal'].map(id => {
              const iconSet = ICON_SETS[selIcons] || ICON_SETS.default;
              return (
                <div key={id} style={{ width:36,height:36,borderRadius:9,background:id==='home'?(themeObj.navActiveBg||'#EFF6FF'):'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>
                  {iconSet[id]}
                </div>
              );
            })}
          </div>
          {/* Mini main */}
          <div style={{ flex:1,background:themeObj.pageBg,padding:'14px 16px',display:'flex',flexDirection:'column',gap:8 }}>
            <div style={{ height:12,borderRadius:6,background:'rgba(0,0,0,.08)',width:'40%' }}/>
            {[1,2,3].map(i=>(
              <div key={i} style={{ background:themeObj.cardBg,border:`1px solid ${themeObj.cardBorder}`,borderRadius:8,padding:'8px 10px',display:'flex',gap:8,alignItems:'center' }}>
                <div style={{ width:8,height:8,borderRadius:'50%',background:(themeObj.preview&&themeObj.preview[2])||'#E5E7EB',flexShrink:0 }}/>
                <div style={{ height:8,borderRadius:4,background:'rgba(0,0,0,.08)',flex:1 }}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 테마 색상 선택 */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:14,fontWeight:800,color:'#111827',marginBottom:14 }}>🌈 색상 테마</div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12 }}>
          {Object.values(THEMES).map(t => {
            const active = selTheme === t.id;
            return (
              <button key={t.id} onClick={() => setSelTheme(t.id)} style={{ padding:'14px 10px',borderRadius:16,border:`2.5px solid ${active?((t.preview&&t.preview[2])||'#2563EB'):'transparent'}`,background:t.sidebarBg,cursor:'pointer',textAlign:'center',boxShadow:active?'0 4px 16px rgba(0,0,0,.12)':'0 2px 6px rgba(0,0,0,.06)',transition:'all .2s',position:'relative' }}>
                {active&&<div style={{ position:'absolute',top:-6,right:-6,width:18,height:18,borderRadius:'50%',background:'#111827',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:9,fontWeight:900 }}>✓</div>}
                {/* 색상 팔레트 미리보기 */}
                <div style={{ display:'flex',gap:4,justifyContent:'center',marginBottom:8 }}>
                  {t.preview.map((c,i)=><div key={i} style={{ width:14,height:14,borderRadius:'50%',background:c,border:'1.5px solid rgba(0,0,0,.08)' }}/>)}
                </div>
                <div style={{ fontSize:14,fontWeight:active?900:700,color:'#111827' }}>{t.emoji}</div>
                <div style={{ fontSize:11,fontWeight:700,color:'#374151',marginTop:3 }}>{t.name}</div>
                <div style={{ fontSize:10,color:'#9CA3AF',marginTop:2,lineHeight:1.3 }}>{t.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 아이콘 스타일 선택 */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:14,fontWeight:800,color:'#111827',marginBottom:14 }}>✨ 아이콘 스타일</div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12 }}>
          {Object.values(ICON_SETS).map(s => {
            const active = selIcons === s.id;
            return (
              <button key={s.id} onClick={() => setSelIcons(s.id)} style={{ padding:'16px 10px',borderRadius:16,border:`2.5px solid ${active?'#2563EB':'#F3F4F6'}`,background:active?'#EFF6FF':'white',cursor:'pointer',textAlign:'center',transition:'all .2s',boxShadow:active?'0 4px 12px rgba(37,99,235,.15)':'none' }}>
                <div style={{ fontSize:26,marginBottom:6 }}>{s.preview}</div>
                <div style={{ fontSize:13,fontWeight:700,color:active?'#2563EB':'#374151' }}>{s.name}</div>
                {/* 아이콘 샘플 */}
                <div style={{ display:'flex',gap:4,justifyContent:'center',marginTop:8 }}>
                  {['home','todo','cal'].map(id=><span key={id} style={{ fontSize:14 }}>{s[id]}</span>)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 적용 버튼 */}
      <button onClick={apply} style={{ width:'100%',padding:'14px',borderRadius:14,border:'none',background:'linear-gradient(135deg,#1E1B4B,#2563EB)',color:'white',fontSize:15,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
        🎨 이 테마로 적용하기
      </button>
      <p style={{ textAlign:'center',fontSize:12,color:'#9CA3AF',marginTop:10 }}>언제든지 다시 변경할 수 있어요</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN APP LAYOUT
══════════════════════════════════════════════════════════ */
function MainApp({ user, setUser, accounts, setAccounts }) {
  const cfg = WS[user.wsType] || WS.personal;
  const [screen, setScreen] = useState('home');
  const [showPro, setShowPro] = useState(false);
  const [showProGate, setShowProGate] = useState(false); // 무료 유저가 협업 클릭 시
  const [isProUser, setIsProUser] = useState(user.isPro || false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data
  const [todos, setTodosRaw] = useState(() => ld(`wl_todos_${user.id}`, []));
  const [events, setEventsRaw] = useState(() => ld(`wl_events_${user.id}`, []));
  const [assigns, setAssignsRaw] = useState(() => ld(`wl_assigns_${user.id}`, []));
  const [notes, setNotesRaw] = useState(() => ld(`wl_notes_${user.id}`, []));
  const [meetings, setMeetingsRaw] = useState(() => ld(`wl_meetings_${user.id}`, []));
  const [projects, setProjectsRaw] = useState(() => ld(`wl_projects_${user.id}`, []));
  const [goals, setGoalsRaw] = useState(() => ld(`wl_goals_${user.id}`, []));
  const [journals, setJournalsRaw] = useState(() => ld(`wl_journals_${user.id}`, []));
  const [spaces, setSpacesRaw] = useState(() => ld('wl_spaces', []));
  const [habits, setHabitsRaw] = useState(() => ld(`wl_habits_${user.id}`, []));
  const [grades, setGradesRaw] = useState(() => ld(`wl_grades_${user.id}`, []));
  const [attend, setAttendRaw] = useState(() => ld(`wl_attend_${user.id}`, {}));
  const [timeLogs, setTimeLogsRaw] = useState(() => ld(`wl_time_${user.id}`, []));
  // 이 유저에게 온 알림 (초대 등)
  const [notifs, setNotifsRaw] = useState(() => ld(`wl_notifs_${user.id}`, []));

  const setTodos = (v) => { setTodosRaw(v); sv(`wl_todos_${user.id}`, typeof v==='function'?v(todos):v); };
  const setEvents = (v) => { setEventsRaw(v); sv(`wl_events_${user.id}`, typeof v==='function'?v(events):v); };
  const setAssigns = (v) => { setAssignsRaw(v); sv(`wl_assigns_${user.id}`, typeof v==='function'?v(assigns):v); };
  const setNotes = (v) => { setNotesRaw(v); sv(`wl_notes_${user.id}`, typeof v==='function'?v(notes):v); };
  const setMeetings = (v) => { setMeetingsRaw(v); sv(`wl_meetings_${user.id}`, typeof v==='function'?v(meetings):v); };
  const setProjects = (v) => { setProjectsRaw(v); sv(`wl_projects_${user.id}`, typeof v==='function'?v(projects):v); };
  const setGoals = (v) => { setGoalsRaw(v); sv(`wl_goals_${user.id}`, typeof v==='function'?v(goals):v); };
  const setJournals = (v) => { setJournalsRaw(v); sv(`wl_journals_${user.id}`, typeof v==='function'?v(journals):v); };
  const setHabits = (v) => { const val=typeof v==='function'?v(habits):v; setHabitsRaw(val); sv(`wl_habits_${user.id}`,val); };
  const setGrades = (v) => { const val=typeof v==='function'?v(grades):v; setGradesRaw(val); sv(`wl_grades_${user.id}`,val); };
  const setAttend = (v) => { const val=typeof v==='function'?v(attend):v; setAttendRaw(val); sv(`wl_attend_${user.id}`,val); };
  const setTimeLogs = (v) => { const val=typeof v==='function'?v(timeLogs):v; setTimeLogsRaw(val); sv(`wl_time_${user.id}`,val); };
  const setSpaces = (v) => {
    const val = typeof v==='function'?v(spaces):v;
    setSpacesRaw(val);
    sv('wl_spaces', val);
    if (window.__worklyBC) window.__worklyBC.postMessage('spaces');
  };
  const setNotifs = (v) => {
    const val=typeof v==='function'?v(notifs):v;
    setNotifsRaw(val);
    sv('wl_notifs_'+user.id, val);
    if (window.__worklyBC) window.__worklyBC.postMessage('notif_'+user.id);
  };

  // ── 실시간 동기화 ──
  // 1) storage 이벤트: 다른 탭에서 localStorage 변경 시 즉시 반영
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'wl_spaces') setSpacesRaw(ld('wl_spaces', []));
      if (e.key === 'wl_notifs_' + user.id) setNotifsRaw(ld('wl_notifs_' + user.id, []));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user.id]);

  // 2) BroadcastChannel: 같은 브라우저 내 즉각 메시지 전달
  useEffect(() => {
    if (!('BroadcastChannel' in window)) return;
    const bc = new BroadcastChannel('workly_sync');
    window.__worklyBC = bc;
    bc.onmessage = (e) => {
      if (e.data === 'spaces') setSpacesRaw(ld('wl_spaces', []));
      if (e.data === 'notif_' + user.id) setNotifsRaw(ld('wl_notifs_' + user.id, []));
    };
    return () => { bc.close(); delete window.__worklyBC; };
  }, [user.id]);

  // 3) 폴링 백업 (3초): BroadcastChannel 미지원 환경용
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifsRaw(ld('wl_notifs_' + user.id, []));
      setSpacesRaw(ld('wl_spaces', []));
    }, 3000);
    return () => clearInterval(interval);
  }, [user.id]);

  // 미읽은 알림 수
  const unreadCount = notifs.filter(n => n.status === 'pending' && !n.read).length;

  // 다크모드
  const isDark = user.darkMode || false;

  // 다크모드 색상 오버라이드
  const DK = isDark ? {
    pageBg:       '#0F172A',
    sidebarBg:    '#1E293B',
    sidebarBorder:'#334155',
    navActiveBg:  '#334155',
    navTextColor: '#94A3B8',
    navTextActive:'#E2E8F0',
    cardBg:       '#1E293B',
    cardBorder:   '#334155',
    headerBg:     '#1E293B',
    headerBorder: '#334155',
    textPrimary:  '#F1F5F9',
    textSecondary:'#94A3B8',
  } : {
    pageBg: null, sidebarBg: null, sidebarBorder: null, navActiveBg: null,
    navTextColor: null, navTextActive: null, cardBg: null, cardBorder: null,
    headerBg: 'white', headerBorder: '#F3F4F6', textPrimary: '#111827', textSecondary: '#6B7280',
  };

  const updateUser = (patch) => {
    const updated = { ...user, ...patch };
    setUser(updated);
    setAccounts(prev => prev.map(a => a.id === user.id ? { ...a, ...patch } : a));
  };

  const logout = () => { setUser(null); try { localStorage.removeItem('wl_user'); } catch {} };
  const deleteAccount = () => {
    ['todos','events','assigns','notes','meetings','projects','goals','journals'].forEach(k => { try { localStorage.removeItem(`wl_${k}_${user.id}`); } catch {} });
    setAccounts(prev => prev.filter(a => a.id !== user.id));
    setUser(null);
  };

  // 테마 & 아이콘셋 적용
  const themeObj = THEMES[user.theme || 'default'] || THEMES.default;
  const iconSet  = ICON_SETS[user.iconSet || 'default'] || ICON_SETS.default;

  // 네비게이션 (아이콘셋 반영)
  const navItems = [
    ...cfg.nav.map(item => ({ ...item, e: iconSet[item.id] || item.e })),
    { id:'ai',        e: '🤖',                        n:'AI' },
    { id:'workspace', e: iconSet.workspace || '👥', n:'협업' },
    { id:'notif',     e: iconSet.notif || '🔔',    n:'알림' },
    { id:'template',  e: iconSet.template || '🎨', n:'테마' },
    { id:'profile',   e: iconSet.profile || '👤',  n:'프로필' },
  ];

  const handleNavClick = (id) => {
    // 무료 유저가 협업 탭 클릭 → Pro 게이트 모달
    if (id === 'workspace' && !isProUser) {
      setShowProGate(true);
      return;
    }
    // 알림 탭 진입 시 전부 읽음 처리
    if (id === 'notif') {
      const upd = notifs.map(n => ({ ...n, read: true }));
      setNotifsRaw(upd);
      sv(`wl_notifs_${user.id}`, upd);
    }
    setScreen(id);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'home':     return <HomeScreen user={user} todos={todos} events={events} setScreen={setScreen} />;
      case 'todo':     return <TodoScreen todos={todos} setTodos={setTodos} wsType={user.wsType} />;
      case 'cal':      return <CalendarScreen events={events} setEvents={setEvents} wsType={user.wsType} />;
      case 'assign':   return <AssignmentsScreen assigns={assigns} setAssigns={setAssigns} />;
      case 'notes':    return <NotesScreen notes={notes} setNotes={setNotes} />;
      case 'meetings': return <MeetingsScreen meetings={meetings} setMeetings={setMeetings} todos={todos} setTodos={setTodos} />;
      case 'projects': return <ProjectsScreen projects={projects} setProjects={setProjects} />;
      case 'goals':    return <GoalsScreen goals={goals} setGoals={setGoals} />;
      case 'jour':     return <JournalScreen journals={journals} setJournals={setJournals} />;
      case 'habits':   return <HabitsScreen habits={habits} setHabits={setHabits} />;
      case 'grades':   return <GradesScreen grades={grades} setGrades={setGrades} />;
      case 'attend':   return <AttendanceScreen attend={attend} setAttend={setAttend} />;
      case 'timetrack':return <TimeTrackerScreen timeLogs={timeLogs} setTimeLogs={setTimeLogs} />;
      case 'workspace':return <WorkspaceScreen user={user} accounts={accounts} spaces={spaces} setSpaces={setSpaces} />;
      case 'notif':    return <NotifScreen user={user} spaces={spaces} setSpaces={setSpaces} notifs={notifs} setNotifs={setNotifs} />;
      case 'ai':       return <AIChatScreen user={user} todos={todos} events={events} goals={goals} habits={habits} grades={grades} journals={journals} timeLogs={timeLogs} spaces={spaces} />;
      case 'template': return <TemplateScreen user={user} onUpdate={updateUser} />;
      case 'profile':  return <ProfileScreen user={user} onUpdate={updateUser} onLogout={logout} onDeleteAccount={deleteAccount} onShowPro={() => setShowPro(true)} isProUser={isProUser} />;
      default:         return <HomeScreen user={user} todos={todos} events={events} setScreen={setScreen} />;
    }
  };

  if (showPro) return <ProUpgradeScreen user={user} onUpgrade={() => { setIsProUser(true); updateUser({isPro:true}); setShowPro(false); }} onBack={() => setShowPro(false)} />;

  return (
    <div data-wl-dark={isDark?'true':'false'} style={{ display:'flex',height:'100vh',background:DK.pageBg||'#F8FAFC',transition:'background .3s,color .3s' }}>
      {/* ── 사이드바 ── */}
      <div className="sr" style={{ width:sidebarOpen?220:64,flexShrink:0,background:DK.sidebarBg||themeObj.sidebarBg,borderRight:'1px solid '+(DK.sidebarBorder||themeObj.sidebarBorder),display:'flex',flexDirection:'column',transition:'width .25s',overflow:'hidden' }}>
        {/* 로고 */}
        <div style={{ padding:'18px 16px',display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid #F9FAFB',flexShrink:0 }}>
          <div style={{ width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${cfg.c},${cfg.d})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0 }}>🌿</div>
          {sidebarOpen&&<div style={{ fontWeight:900,fontSize:17,color:DK.textPrimary||'#111827',whiteSpace:'nowrap' }}>Workly</div>}
        </div>
        {/* 워크스페이스 유형 뱃지 */}
        {sidebarOpen&&(
          <div style={{ padding:'10px 14px',background:DK.navActiveBg||themeObj.navActiveBg||cfg.l,margin:'12px 10px',borderRadius:10,border:'1px solid '+(DK.sidebarBorder||themeObj.sidebarBorder) }}>
            <div style={{ fontSize:10,fontWeight:800,color:DK.navTextActive||themeObj.navTextActive||cfg.d,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:2 }}>{cfg.icon} {cfg.label}용 워크스페이스</div>
            <div style={{ fontSize:12,fontWeight:600,color:themeObj.navTextColor||cfg.c,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user.nickname||user.name}</div>
          </div>
        )}
        {/* 네비게이션 */}
        <nav style={{ flex:1,padding:'8px 8px',display:'flex',flexDirection:'column',gap:2,overflowY:'auto' }}>
          {navItems.map(({ id, e, n }) => {
            const active = screen === id;
            const isLocked = id === 'workspace' && !isProUser;
            return (
              <button key={id} onClick={() => handleNavClick(id)} title={n} style={{
                display:'flex',alignItems:'center',gap:10,padding:sidebarOpen?'10px 12px':'10px',borderRadius:10,border:'none',
                background:active?(themeObj.navActiveBg||cfg.l):'transparent',
                color:active?(themeObj.navTextActive||cfg.c):isLocked?(themeObj.navTextColor||'#9CA3AF'):(themeObj.navTextColor||'#6B7280'),
                fontWeight:active?800:600,fontSize:14,cursor:'pointer',transition:'all .12s',whiteSpace:'nowrap',
                justifyContent:sidebarOpen?'flex-start':'center',position:'relative',
              }}>
                <span style={{ fontSize:17,flexShrink:0 }}>{e}</span>
                {sidebarOpen&&n}
                {/* 자물쇠 아이콘 (협업 - 비Pro 유저) */}
                {sidebarOpen&&isLocked&&<span style={{ marginLeft:'auto',fontSize:12 }}>🔒</span>}
                {/* 알림 미읽음 뱃지 */}
                {id==='notif'&&unreadCount>0&&(
                  <span style={{
                    position:'absolute',top:6,
                    left:sidebarOpen?undefined:4,right:sidebarOpen?10:undefined,
                    minWidth:18,height:18,borderRadius:99,background:'#EF4444',color:'white',
                    fontSize:10,fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 4px'
                  }}>{unreadCount}</span>
                )}
              </button>
            );
          })}
          {!isProUser&&sidebarOpen&&(
            <button onClick={() => setShowPro(true)} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,border:'none',background:isDark?'#2D2200':'#FFFBEB',color:'#D97706',fontWeight:700,fontSize:13,cursor:'pointer',marginTop:8 }}>
              <span style={{ fontSize:17 }}>⚡️</span>Pro 업그레이드
            </button>
          )}
        </nav>
        {/* 사이드바 접기 */}
        <button onClick={() => setSidebarOpen(s=>!s)} style={{ padding:'14px',border:'none',background:'none',color:'#9CA3AF',cursor:'pointer',fontSize:16,borderTop:'1px solid #F9FAFB',display:'flex',alignItems:'center',justifyContent:sidebarOpen?'flex-end':'center',gap:8 }}>
          {sidebarOpen?'←':'→'}
        </button>
      </div>

      {/* ── 메인 콘텐츠 ── */}
      <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:DK.pageBg||themeObj.pageBg }}>
        {/* 탑바 */}
        <div style={{ height:52,flexShrink:0,background:DK.headerBg||themeObj.cardBg||'white',borderBottom:'1px solid '+(DK.headerBorder||themeObj.sidebarBorder||'#F3F4F6'),display:'flex',alignItems:'center',padding:'0 20px',justifyContent:'space-between' }}>
          <div style={{ fontSize:13,fontWeight:600,color:DK.textSecondary||'#9CA3AF' }}>
            {(navItems.find(n=>n.id===screen)||{n:'홈'}).n}
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            {isProUser&&<Badge color={cfg.d} bg={cfg.l}>✨ Pro</Badge>}
            {/* 다크모드 토글 */}
            <button onClick={()=>updateUser({darkMode:!isDark})} title={isDark?'라이트 모드':'다크 모드'} style={{ width:36,height:36,borderRadius:10,border:'1.5px solid '+(DK.headerBorder||'#F3F4F6'),background:isDark?'#334155':'#F9FAFB',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,transition:'all .2s' }}>
              {isDark?'☀️':'🌙'}
            </button>
            {/* 알림 벨 버튼 */}}
            <button onClick={() => handleNavClick('notif')} title="알림함" style={{ position:'relative',width:36,height:36,borderRadius:10,border:`1.5px solid ${screen==='notif'?cfg.c:'#F3F4F6'}`,background:screen==='notif'?cfg.l:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17 }}>
              🔔
              {unreadCount>0&&(
                <span style={{ position:'absolute',top:-5,right:-5,minWidth:18,height:18,borderRadius:99,background:'#EF4444',color:'white',fontSize:10,fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 4px',boxShadow:'0 2px 4px rgba(0,0,0,.2)' }}>{unreadCount}</span>
              )}
            </button>
            {/* 프로필 버튼 */}
            <button onClick={() => setScreen('profile')} style={{ display:'flex',alignItems:'center',gap:8,background:'#F9FAFB',border:'none',borderRadius:99,padding:'6px 12px',cursor:'pointer' }}>
              <div style={{ width:22,height:22,borderRadius:'50%',background:`linear-gradient(135deg,${cfg.c},${cfg.d})`,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:11,fontWeight:900,overflow:'hidden',flexShrink:0 }}>
                {user.avatar?<img src={user.avatar} style={{ width:'100%',height:'100%',objectFit:'cover' }} alt=""/>:(user.nickname||user.name||'?')[0]}
              </div>
              <span style={{ fontSize:13,fontWeight:700,color:'#374151' }}>{user.nickname||user.name}</span>
            </button>
          </div>
        </div>
        {/* 페이지 콘텐츠 */}
        <div style={{ flex:1,overflow:'hidden' }}>
          {renderScreen()}
        </div>
      </div>

      {/* ── Pro 게이트 모달 (무료 유저가 협업 탭 클릭 시) ── */}
      {showProGate&&(
        <ProGateModal
          onClose={() => setShowProGate(false)}
          onUpgrade={() => { setShowProGate(false); setShowPro(true); }}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   APP ROOT
══════════════════════════════════════════════════════════ */
export default function App() {
  const [accounts, setAccountsRaw] = useState(() => ld('wl_accounts', []));
  const [user, setUserRaw] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('wl_user') || 'null');
      if (!saved) return null;
      const acct = ld('wl_accounts', []).find(a => a.id === saved.id);
      return acct || null;
    } catch { return null; }
  });

  const setAccounts = (v) => {
    const val = typeof v === 'function' ? v(accounts) : v;
    setAccountsRaw(val);
    sv('wl_accounts', val);
  };

  const setUser = (v) => {
    setUserRaw(v);
    try { if (v) localStorage.setItem('wl_user', JSON.stringify({ id: v.id })); else localStorage.removeItem('wl_user'); } catch {}
  };

  const handleAuth = (acct) => {
    setUser(acct);
    setAccounts(prev => {
      const exists = prev.find(a => a.id === acct.id);
      if (exists) return prev.map(a => a.id === acct.id ? acct : a);
      return [...prev, acct];
    });
  };

  const handleRegister = (acct) => setAccounts(prev => [...prev, acct]);

  const handleOnboardingDone = ({ nickname, wsType }) => {
    const updated = { ...user, nickname, wsType };
    setUser(updated);
    setAccounts(prev => prev.map(a => a.id === user.id ? { ...a, nickname, wsType } : a));
  };

  // Needs onboarding?
  const needsOnboarding = user && (!user.wsType || !user.nickname);

  return (
    <>
      <Styles isDark={user&&user.darkMode || false} />
      {!user && <AuthScreen accounts={accounts} onAuth={handleAuth} onRegister={handleRegister} />}
      {user && needsOnboarding && <OnboardingScreen user={user} onDone={handleOnboardingDone} />}
      {user && !needsOnboarding && <MainApp user={user} setUser={setUser} accounts={accounts} setAccounts={setAccounts} />}
    </>
  );
}
