import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════
   WORKSPACE TYPE CONFIG
══════════════════════════════════════════════════════════ */
const WS = {
  personal: {
    label:'Workly', icon:'🌿', c:'#4F46E5', l:'#EEF2FF', d:'#3730A3', m:'#E0E7FF',
    tagline:'나만의 스마트 워크스페이스',
    perks:['✅ 할일 관리','📅 캘린더','🔥 습관 트래커','🎯 목표 관리'],
    nav:[
      { id:'home',  e:'🏠', n:'홈' },
      { id:'todo',  e:'✅', n:'할일' },
      { id:'cal',   e:'📅', n:'캘린더' },
      { id:'exam',  e:'📋', n:'시험' },
      { id:'jour',  e:'📖', n:'일기' },
    ],
  },
};
// 통합 단일 앱 — wsType 무관하게 항상 personal 사용
const getWS = () => WS.personal;

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
  const [nick, setNick] = useState(user.name || '');
  return (
    <div style={{ minHeight:'100vh',background:'#FAFAFA',display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
      <div style={{ width:'100%',maxWidth:480 }} className="fu">
        <div style={{ textAlign:'center',marginBottom:36 }}>
          <div style={{ fontSize:56,marginBottom:14 }}>👋</div>
          <h2 style={{ fontSize:28,fontWeight:900,color:'#111827',marginBottom:8 }}>반가워요, {user.name}님!</h2>
          <p style={{ fontSize:14,color:'#6B7280',lineHeight:1.6 }}>Workly에서 사용할 닉네임을 설정해주세요.</p>
        </div>
        <div style={{ background:'white',borderRadius:20,padding:28,boxShadow:'0 4px 24px rgba(0,0,0,.06)',border:'1px solid #F3F4F6' }}>
          <Field value={nick} onChange={setNick} label="닉네임" placeholder="예: 수현, 길동" hint="언제든지 프로필에서 바꿀 수 있어요" />
          <button onClick={() => { if(nick.trim()) onDone({ nickname:nick.trim(), wsType:'personal' }); }}
            disabled={!nick.trim()}
            style={{ width:'100%',padding:'13px',borderRadius:12,border:'none',background:nick.trim() ? 'linear-gradient(135deg,#4F46E5,#2563EB)':'#E5E7EB',color:'white',fontSize:15,fontWeight:700,cursor:nick.trim() ? 'pointer':'default' }}>
            시작하기 🚀
          </button>
        </div>
      </div>
    </div>
  );
}


function HomeScreen({ user, todos, events, setScreen }) {
  const cfg = WS.personal;
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
  const cfg = WS.personal;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', priority: 'medium', dueDate: '', category: '', notes: '' });
  const [filter, setFilter] = useState('all');
  const [editTodo, setEditTodo] = useState(null); // 더블클릭 수정용

  const CATS = ['업무', '학교', '개인', '쇼핑', '건강', '기타'];

  const add = () => {
    if (!form.title.trim()) return;
    setTodos(p => [...p, { id: uid(), ...form, title: form.title.trim(), status: 'todo', createdAt: new Date().toISOString() }]);
    setForm({ title: '', priority: 'medium', dueDate: '', category: '', notes: '' });
    setShowModal(false);
  };

  const saveEdit = () => {
    if (!editTodo || !editTodo.title.trim()) return;
    setTodos(p => p.map(t => t.id === editTodo.id ? { ...t, ...editTodo } : t));
    setEditTodo(null);
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

  // 라디오 버튼 컴포넌트
  const PriorityRadio = ({ value, onChange }) => (
    <div style={{ display:'flex', gap:8 }}>
      {Object.entries(PRIO).map(([k, v]) => (
        <label key={k} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', padding:'7px 14px', borderRadius:10, border:'2px solid '+(value===k?v.c:'#E5E7EB'), background:value===k?v.bg:'white', transition:'all .15s' }}>
          <input type="radio" name="priority" value={k} checked={value===k} onChange={()=>onChange(k)} style={{ display:'none' }}/>
          <span style={{ fontSize:13, fontWeight:700, color:value===k?v.c:'#6B7280' }}>{v.l}</span>
        </label>
      ))}
    </div>
  );

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
                      onClick={() => cycle(t.id)} onDoubleClick={() => setEditTodo({...t})}>
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
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:8,textTransform:'uppercase',letterSpacing:'.04em' }}>우선순위</div>
            <PriorityRadio value={form.priority} onChange={v=>setForm(p=>({...p,priority:v}))}/>
          </div>
          <Field value={form.dueDate} onChange={v => setForm(p => ({ ...p, dueDate: v }))} label="마감일" type="date" />
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:8,textTransform:'uppercase',letterSpacing:'.04em' }}>카테고리</div>
            <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
              {CATS.map(cat=>(
                <button key={cat} onClick={()=>setForm(p=>({...p,category:cat}))} style={{ padding:'6px 12px',borderRadius:99,border:'2px solid '+(form.category===cat?cfg.c:'#E5E7EB'),background:form.category===cat?cfg.l:'white',color:form.category===cat?cfg.c:'#6B7280',fontSize:13,fontWeight:700,cursor:'pointer' }}>{cat}</button>
              ))}
            </div>
          </div>
          <Field value={form.notes} onChange={v => setForm(p => ({ ...p, notes: v }))} label="메모" placeholder="추가 설명 (선택)" rows={2} />
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Btn onClick={() => setShowModal(false)} outline color="#6B7280" style={{ flex: 1 }}>취소</Btn>
            <Btn onClick={add} bg={cfg.c} style={{ flex: 2 }}>추가하기</Btn>
          </div>
        </Modal>
      )}

      {/* 더블클릭 수정 모달 */}
      {editTodo && (
        <Modal title="할일 수정 ✏️" onClose={()=>setEditTodo(null)}>
          <Field value={editTodo.title} onChange={v=>setEditTodo(p=>({...p,title:v}))} label="제목" required/>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:8,textTransform:'uppercase',letterSpacing:'.04em' }}>우선순위</div>
            <PriorityRadio value={editTodo.priority||'medium'} onChange={v=>setEditTodo(p=>({...p,priority:v}))}/>
          </div>
          <Field value={editTodo.dueDate||''} onChange={v=>setEditTodo(p=>({...p,dueDate:v}))} label="마감일" type="date"/>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:8,textTransform:'uppercase',letterSpacing:'.04em' }}>카테고리</div>
            <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
              {CATS.map(cat=>(
                <button key={cat} onClick={()=>setEditTodo(p=>({...p,category:cat}))} style={{ padding:'6px 12px',borderRadius:99,border:'2px solid '+((editTodo.category||'')=== cat?cfg.c:'#E5E7EB'),background:(editTodo.category||'')=== cat?cfg.l:'white',color:(editTodo.category||'')=== cat?cfg.c:'#6B7280',fontSize:13,fontWeight:700,cursor:'pointer' }}>{cat}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:8,textTransform:'uppercase',letterSpacing:'.04em' }}>상태</div>
            <div style={{ display:'flex',gap:8 }}>
              {Object.entries(STAT).map(([k,v])=>(
                <button key={k} onClick={()=>setEditTodo(p=>({...p,status:k}))} style={{ flex:1,padding:'8px',borderRadius:10,border:'2px solid '+(editTodo.status===k?v.c:'#E5E7EB'),background:editTodo.status===k?v.bg:'white',color:editTodo.status===k?v.c:'#6B7280',fontSize:12,fontWeight:700,cursor:'pointer' }}>{v.icon} {v.l}</button>
              ))}
            </div>
          </div>
          <Field value={editTodo.notes||''} onChange={v=>setEditTodo(p=>({...p,notes:v}))} label="메모" rows={2}/>
          <div style={{ display:'flex',gap:8,marginTop:4 }}>
            <Btn onClick={()=>setEditTodo(null)} outline color="#6B7280" style={{ flex:1 }}>취소</Btn>
            <Btn onClick={()=>{del(editTodo.id);setEditTodo(null);}} outline color="#EF4444" style={{ flex:1 }}>삭제</Btn>
            <Btn onClick={saveEdit} bg={cfg.c} style={{ flex:2 }}>저장</Btn>
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
  const cfg = WS.personal;
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
  const cfg = WS.personal;
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
  const cfg = WS.personal;
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
  const cfg = WS.personal;
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
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
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
        const file = new File([blob], '회의녹음_' + dateStr + '.' + (mimeType.includes('ogg') ? 'ogg':'webm'), { type: mimeType || 'audio/webm' });
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
          model:'claude-sonnet-4-6',
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

      <button onClick={analyzeWithAI} disabled={aiLoading||(!aiText.trim()&&!audioFile)} style={{ width:'100%',padding:'13px',borderRadius:12,border:'none',background:aiLoading||(!aiText.trim()&&!audioFile) ? '#E5E7EB':'linear-gradient(135deg,'+cfg.c+','+cfg.d+')',color:'white',fontSize:15,fontWeight:800,cursor:aiLoading ? 'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:20 }}>
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
  const cfg = WS.personal;
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
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [selId, setSelId] = useState(null);
  const [entryTitle, setEntryTitle] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  const [startPos, setStartPos] = useState(null);
  const [savedImageData, setSavedImageData] = useState(null);

  // 도구
  const [tool, setTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(6);
  const [brushStyle, setBrushStyle] = useState('round');
  const [color, setColor] = useState('#1a1a1a');
  const [shapeType, setShapeType] = useState('rect');

  // 텍스트 도구
  const [textSize, setTextSize] = useState(20);
  const [textBold, setTextBold] = useState(false);
  const [textFont, setTextFont] = useState('sans-serif');
  const [pendingText, setPendingText] = useState('');
  const [textClickPos, setTextClickPos] = useState(null);
  const [showTextPanel, setShowTextPanel] = useState(false);

  const PALETTE = ['#1a1a1a','#EF4444','#F97316','#EAB308','#22C55E','#3B82F6','#8B5CF6','#EC4899','#06B6D4','#ffffff','#aaaaaa','#6B4C2A'];

  useEffect(function() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (selId) {
      var entry = journals.find(function(j) { return j.id === selId; });
      if (entry && entry.canvasData) {
        var img = new Image();
        img.onload = function() { ctx.drawImage(img, 0, 0); };
        img.src = entry.canvasData;
      }
    }
  }, [selId]);

  var getPos = function(e) {
    var canvas = canvasRef.current;
    var rect = canvas.getBoundingClientRect();
    var sx = canvas.width / rect.width;
    var sy = canvas.height / rect.height;
    return { x:(e.clientX-rect.left)*sx, y:(e.clientY-rect.top)*sy };
  };

  var autoSave = function() {
    if (!selId || !canvasRef.current) return;
    var data = canvasRef.current.toDataURL('image/jpeg', 0.75);
    setJournals(function(p) { return p.map(function(j) { return j.id===selId ? {...j,canvasData:data} : j; }); });
  };

  var startDraw = function(e) {
    var pos = getPos(e);
    if (tool==='text') {
      setTextClickPos(pos);
      setShowTextPanel(true);
      setPendingText('');
      return;
    }
    setIsDrawing(true);
    setLastPos(pos);
    setStartPos(pos);
    if (tool==='shape') {
      var ctx = canvasRef.current.getContext('2d');
      setSavedImageData(ctx.getImageData(0,0,canvasRef.current.width,canvasRef.current.height));
    }
    if (tool==='brush') {
      var ctx2 = canvasRef.current.getContext('2d');
      ctx2.beginPath();
      ctx2.arc(pos.x,pos.y,brushSize/2,0,Math.PI*2);
      ctx2.fillStyle = color;
      ctx2.fill();
    }
  };

  var doDraw = function(e) {
    if (!isDrawing) return;
    var canvas = canvasRef.current;
    var ctx = canvas.getContext('2d');
    var pos = getPos(e);
    if (tool==='brush'||tool==='eraser') {
      ctx.beginPath();
      ctx.moveTo(lastPos.x,lastPos.y);
      ctx.lineTo(pos.x,pos.y);
      ctx.strokeStyle = tool==='eraser' ? '#FFFFFF' : color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = brushStyle==='square' ? 'square' : 'round';
      ctx.lineJoin = 'round';
      if (brushStyle==='chalk') { ctx.globalAlpha=0.55+Math.random()*0.45; }
      else if (brushStyle==='watercolor') { ctx.globalAlpha=0.25; ctx.lineWidth=brushSize*2.5; }
      else { ctx.globalAlpha=1; }
      ctx.stroke();
      ctx.globalAlpha=1;
    } else if (tool==='shape') {
      if (savedImageData) ctx.putImageData(savedImageData,0,0);
      ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=brushSize; ctx.lineCap='round';
      var w=pos.x-startPos.x, h=pos.y-startPos.y;
      ctx.beginPath();
      if (shapeType==='rect') {
        ctx.strokeRect(startPos.x,startPos.y,w,h);
      } else if (shapeType==='circle') {
        var rx=Math.abs(w)/2,ry=Math.abs(h)/2,cx=startPos.x+w/2,cy=startPos.y+h/2;
        ctx.ellipse(cx,cy,Math.max(rx,1),Math.max(ry,1),0,0,Math.PI*2); ctx.stroke();
      } else if (shapeType==='line') {
        ctx.moveTo(startPos.x,startPos.y); ctx.lineTo(pos.x,pos.y); ctx.stroke();
      } else if (shapeType==='arrow') {
        ctx.moveTo(startPos.x,startPos.y); ctx.lineTo(pos.x,pos.y); ctx.stroke();
        var ang=Math.atan2(pos.y-startPos.y,pos.x-startPos.x), hs=brushSize*4;
        ctx.beginPath();
        ctx.moveTo(pos.x,pos.y);
        ctx.lineTo(pos.x-hs*Math.cos(ang-0.45),pos.y-hs*Math.sin(ang-0.45));
        ctx.lineTo(pos.x-hs*Math.cos(ang+0.45),pos.y-hs*Math.sin(ang+0.45));
        ctx.closePath(); ctx.fill();
      }
    }
    setLastPos(pos);
  };

  var endDraw = function() {
    if (isDrawing) { setIsDrawing(false); setSavedImageData(null); autoSave(); }
  };

  var placeText = function() {
    if (!pendingText.trim()||!textClickPos) return;
    var ctx = canvasRef.current.getContext('2d');
    ctx.font=(textBold?'bold ':'')+textSize+'px '+textFont;
    ctx.fillStyle=color;
    ctx.fillText(pendingText, textClickPos.x, textClickPos.y);
    setShowTextPanel(false); setPendingText(''); setTextClickPos(null);
    autoSave();
  };

  var clearCanvas = function() {
    var canvas=canvasRef.current; var ctx=canvas.getContext('2d');
    ctx.fillStyle='#FFFFFF'; ctx.fillRect(0,0,canvas.width,canvas.height);
    autoSave();
  };

  var handleImageUpload = function(e) {
    var file=e.target.files[0]; if(!file) return;
    var reader=new FileReader();
    reader.onload=function(ev){
      var img=new Image();
      img.onload=function(){
        var canvas=canvasRef.current, ctx=canvas.getContext('2d');
        var mw=canvas.width*0.65, mh=canvas.height*0.65;
        var w=img.width, h=img.height;
        if(w>mw){h=h*mw/w;w=mw;} if(h>mh){w=w*mh/h;h=mh;}
        ctx.drawImage(img,30,30,w,h);
        autoSave();
      };
      img.src=ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value='';
  };

  var newEntry = function() {
    var id=uid(), today=tod();
    var entry={id,title:'일기 '+today,date:today,canvasData:null};
    setJournals(function(p){return [entry,...p];});
    setSelId(id); setEntryTitle(entry.title);
  };

  var deleteEntry = function(id) {
    setJournals(function(p){return p.filter(function(j){return j.id!==id;});});
    if(selId===id){setSelId(null);setEntryTitle('');}
  };

  var saveTitle = function() {
    if (!selId) return;
    setJournals(function(p){return p.map(function(j){return j.id===selId?{...j,title:entryTitle}:j;});});
  };

  var TOOLS = [
    {id:'brush',icon:'✏️',label:'붓'},
    {id:'eraser',icon:'◻️',label:'지우개'},
    {id:'text',icon:'T',label:'텍스트'},
    {id:'shape',icon:'△',label:'도형'},
  ];

  return (
    <div style={{height:'100%',display:'flex',overflow:'hidden'}}>
      {/* 왼쪽 목록 */}
      <div style={{width:240,flexShrink:0,borderRight:'1px solid #F3F4F6',display:'flex',flexDirection:'column',background:'white'}}>
        <div style={{padding:'12px',borderBottom:'1px solid #F3F4F6'}}>
          <button onClick={newEntry} style={{width:'100%',padding:'10px',borderRadius:11,border:'none',background:cfg.c,color:'white',fontSize:14,fontWeight:700,cursor:'pointer'}}>+ 새 일기</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'8px'}}>
          {journals.length===0&&<div style={{textAlign:'center',padding:40,color:'#D1D5DB',fontSize:13}}>아직 일기가 없어요</div>}
          {journals.map(function(j){
            return (
              <div key={j.id} onClick={function(){setSelId(j.id);setEntryTitle(j.title);}}
                style={{borderRadius:12,padding:'10px 12px',marginBottom:4,cursor:'pointer',background:selId===j.id?cfg.l:'transparent',border:'1.5px solid '+(selId===j.id?cfg.c:'transparent'),display:'flex',alignItems:'center',gap:8}}>
                {j.canvasData&&<div style={{width:36,height:36,borderRadius:6,overflow:'hidden',flexShrink:0,border:'1px solid #E5E7EB'}}><img src={j.canvasData} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/></div>}
                <div style={{flex:1,overflow:'hidden'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#111827',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{j.title}</div>
                  <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>{fmtFull(j.date)}</div>
                </div>
                <button onClick={function(e){e.stopPropagation();deleteEntry(j.id);}} style={{background:'none',border:'none',color:'#D1D5DB',cursor:'pointer',fontSize:13,padding:2,flexShrink:0}}>✕</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 오른쪽 그림판 */}
      {!selId ? (
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16,color:'#D1D5DB'}}>
          <div style={{fontSize:52}}>🎨</div>
          <div style={{fontSize:16,fontWeight:700}}>일기를 선택하거나 새로 만드세요</div>
        </div>
      ) : (
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {/* 제목 */}
          <div style={{padding:'10px 16px',borderBottom:'1px solid #F3F4F6',background:'white',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
            <input value={entryTitle} onChange={function(e){setEntryTitle(e.target.value);}} onBlur={saveTitle} style={{flex:1,fontSize:16,fontWeight:800,border:'none',outline:'none',color:'#111827',background:'transparent'}}/>
            <span style={{fontSize:12,color:'#9CA3AF'}}>{journals.find(function(j){return j.id===selId;})?journals.find(function(j){return j.id===selId;}).date:''}</span>
          </div>

          {/* 툴바 */}
          <div style={{background:'white',borderBottom:'1px solid #F3F4F6',padding:'7px 12px',display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',flexShrink:0}}>
            {/* 도구 */}
            <div style={{display:'flex',gap:3,background:'#F3F4F6',borderRadius:10,padding:3}}>
              {TOOLS.map(function(t){
                return <button key={t.id} onClick={function(){setTool(t.id);setShowTextPanel(false);}} title={t.label} style={{padding:'5px 10px',borderRadius:7,border:'none',background:tool===t.id?'white':'transparent',color:tool===t.id?cfg.c:'#6B7280',fontSize:14,fontWeight:800,cursor:'pointer',boxShadow:tool===t.id?'0 1px 4px rgba(0,0,0,.1)':'none'}}>{t.icon}</button>;
              })}
            </div>

            {/* 이미지 업로드 */}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}}/>
            <button onClick={function(){if(fileInputRef.current)fileInputRef.current.click();}} title="이미지 삽입" style={{padding:'5px 10px',borderRadius:8,border:'1px solid #E5E7EB',background:'white',cursor:'pointer',fontSize:14}}>🖼️</button>

            <div style={{width:1,height:24,background:'#E5E7EB',flexShrink:0}}/>

            {/* 크기 */}
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <span style={{fontSize:11,color:'#6B7280',fontWeight:600,whiteSpace:'nowrap'}}>크기</span>
              <input type="range" min={tool==='text'?8:1} max={tool==='text'?72:50}
                value={tool==='text'?textSize:brushSize}
                onChange={function(e){tool==='text'?setTextSize(Number(e.target.value)):setBrushSize(Number(e.target.value));}}
                style={{width:60}}/>
              <span style={{fontSize:11,color:'#374151',fontWeight:700,minWidth:18}}>{tool==='text'?textSize:brushSize}</span>
            </div>

            {/* 붓 스타일 */}
            {tool==='brush'&&(
              <div style={{display:'flex',gap:3,background:'#F3F4F6',borderRadius:8,padding:2}}>
                {[['round','●'],['square','■'],['chalk','〰'],['watercolor','≈']].map(function(s){
                  return <button key={s[0]} onClick={function(){setBrushStyle(s[0]);}} style={{padding:'3px 8px',borderRadius:6,border:'none',background:brushStyle===s[0]?'white':'transparent',color:brushStyle===s[0]?cfg.c:'#9CA3AF',fontSize:12,fontWeight:700,cursor:'pointer',boxShadow:brushStyle===s[0]?'0 1px 3px rgba(0,0,0,.1)':'none'}}>{s[1]}</button>;
                })}
              </div>
            )}

            {/* 도형 타입 */}
            {tool==='shape'&&(
              <div style={{display:'flex',gap:3,background:'#F3F4F6',borderRadius:8,padding:2}}>
                {[['rect','□'],['circle','○'],['line','—'],['arrow','→']].map(function(s){
                  return <button key={s[0]} onClick={function(){setShapeType(s[0]);}} style={{padding:'3px 9px',borderRadius:6,border:'none',background:shapeType===s[0]?'white':'transparent',color:shapeType===s[0]?cfg.c:'#9CA3AF',fontSize:14,fontWeight:800,cursor:'pointer',boxShadow:shapeType===s[0]?'0 1px 3px rgba(0,0,0,.1)':'none'}}>{s[1]}</button>;
                })}
              </div>
            )}

            {/* 텍스트 옵션 */}
            {tool==='text'&&(
              <>
                <button onClick={function(){setTextBold(function(p){return !p;});}} style={{padding:'4px 10px',borderRadius:8,border:'1.5px solid '+(textBold?cfg.c:'#E5E7EB'),background:textBold?cfg.l:'white',color:textBold?cfg.c:'#374151',fontSize:13,fontWeight:900,cursor:'pointer'}}>B</button>
                <select value={textFont} onChange={function(e){setTextFont(e.target.value);}} style={{padding:'4px 8px',borderRadius:8,border:'1px solid #E5E7EB',fontSize:12}}>
                  <option value="sans-serif">고딕</option>
                  <option value="serif">바탕</option>
                  <option value="monospace">코드체</option>
                  <option value="Georgia">Georgia</option>
                  <option value="cursive">필기체</option>
                </select>
              </>
            )}

            <div style={{width:1,height:24,background:'#E5E7EB',flexShrink:0}}/>

            {/* 색상 팔레트 */}
            <div style={{display:'flex',gap:4,alignItems:'center',flexWrap:'wrap'}}>
              {PALETTE.map(function(c){
                return <button key={c} onClick={function(){setColor(c);}} style={{width:22,height:22,borderRadius:'50%',background:c,border:'2.5px solid '+(color===c?cfg.c:'#E5E7EB'),cursor:'pointer',flexShrink:0,boxShadow:color===c?'0 0 0 2px '+cfg.l:'none'}}/>;
              })}
              <input type="color" value={color} onChange={function(e){setColor(e.target.value);}} style={{width:22,height:22,border:'2px solid #E5E7EB',borderRadius:'50%',cursor:'pointer',padding:0,flexShrink:0}}/>
            </div>

            <div style={{marginLeft:'auto'}}>
              <button onClick={clearCanvas} style={{padding:'5px 12px',borderRadius:8,border:'1.5px solid #FECACA',background:'#FEF2F2',color:'#EF4444',fontSize:12,fontWeight:700,cursor:'pointer'}}>전체 지우기</button>
            </div>
          </div>

          {/* 텍스트 입력 패널 */}
          {showTextPanel&&(
            <div className="fu" style={{background:'#EEF2FF',borderBottom:'1px solid '+cfg.m,padding:'8px 14px',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
              <span style={{fontSize:12,fontWeight:700,color:cfg.d,whiteSpace:'nowrap'}}>📝 텍스트 입력 후 캔버스에 클릭</span>
              <input autoFocus value={pendingText} onChange={function(e){setPendingText(e.target.value);}} onKeyDown={function(e){if(e.key==='Enter')placeText();if(e.key==='Escape')setShowTextPanel(false);}} placeholder="입력 후 Enter 또는 캔버스 클릭" style={{flex:1,padding:'6px 12px',fontSize:14,border:'1.5px solid '+cfg.c,borderRadius:9,fontFamily:textFont,fontWeight:textBold?'bold':'normal',color:color}}/>
              <Btn onClick={placeText} bg={cfg.c} sm>배치</Btn>
              <Btn onClick={function(){setShowTextPanel(false);}} outline color="#9CA3AF" sm>취소</Btn>
            </div>
          )}

          {/* 캔버스 */}
          <div style={{flex:1,overflow:'hidden',background:'#F1F5F9',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
            <div style={{boxShadow:'0 8px 32px rgba(0,0,0,.15)',borderRadius:4}}>
              <canvas ref={canvasRef} width={900} height={560}
                style={{display:'block',cursor:tool==='eraser'?'cell':tool==='text'?'text':'crosshair',maxWidth:'calc(100vw - 320px)',maxHeight:'calc(100vh - 240px)',background:'white'}}
                onMouseDown={startDraw} onMouseMove={doDraw} onMouseUp={endDraw} onMouseLeave={endDraw}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ══════ EXAM SCREEN ══════ */
const SPACE_TYPE_PRESETS = ['개인', '프로젝트', '회사', '마케팅', '스터디', '동아리', '가족', '팀'];
const SPACE_TYPE_ICONS = { '개인':'✨', '프로젝트':'📊', '회사':'💼', '마케팅':'📢', '스터디':'📚', '동아리':'🎭', '가족':'🏠', '팀':'👥' };
const genInviteCode = function() { return Math.random().toString(36).slice(2,8).toUpperCase(); };

function ExamScreen({ exams, setExams }) {
  const cfg = WS.personal;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject:'', date:'', type:'중간고사', memo:'' });
  const addExam = () => {
    if (!form.subject.trim()||!form.date) return;
    setExams(p=>[...p,{id:uid(),...form,subject:form.subject.trim(),createdAt:new Date().toISOString()}].sort((a,b)=>a.date.localeCompare(b.date)));
    setForm({subject:'',date:'',type:'중간고사',memo:''}); setShowForm(false);
  };
  const getDday = d=>{var t=new Date();t.setHours(0,0,0,0);return Math.ceil((new Date(d+'T00:00:00')-t)/86400000);};
  const ddayColor=d=>d<=0?'#DC2626':d<=3?'#D97706':d<=7?'#2563EB':'#059669';
  const ddayBg=d=>d<=0?'#FEF2F2':d<=3?'#FFFBEB':d<=7?'#EFF6FF':'#ECFDF5';
  const ddayLabel=d=>d<0?'D+'+Math.abs(d):d===0 ? 'D-Day!':'D-'+d;
  const typeColors={'중간고사':'#7C3AED','기말고사':'#DC2626','모의고사':'#2563EB','수행평가':'#059669','쪽지시험':'#D97706'};
  return (
    <div style={{padding:'24px',height:'100%',overflowY:'auto'}}>
      <div className="fu" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div><div style={{fontSize:20,fontWeight:900,color:'#111827'}}>📋 시험 관리</div><div style={{fontSize:13,color:'#6B7280',marginTop:2}}>시험 날짜를 등록하면 D-day가 상단에 표시돼요</div></div>
        <button onClick={()=>setShowForm(p=>!p)} style={{padding:'9px 16px',borderRadius:10,border:'none',background:cfg.c,color:'white',fontSize:13,fontWeight:700,cursor:'pointer'}}>+ 시험 추가</button>
      </div>
      {showForm&&(
        <div className="fu" style={{background:'white',borderRadius:16,padding:'18px',border:'1.5px solid '+cfg.m,marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:800,color:'#111827',marginBottom:14}}>새 시험 등록</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Field value={form.subject} onChange={v=>setForm(p=>({...p,subject:v}))} label="과목" placeholder="예: 수학, 영어" required/>
            <Select label="유형" value={form.type} onChange={v=>setForm(p=>({...p,type:v}))} options={['중간고사','기말고사','모의고사','수행평가','쪽지시험'].map(v=>({value:v,label:v}))}/>
          </div>
          <Field value={form.date} onChange={v=>setForm(p=>({...p,date:v}))} label="시험 날짜" type="date" required/>
          <Field value={form.memo} onChange={v=>setForm(p=>({...p,memo:v}))} label="메모" placeholder="시험 범위 등 (선택)"/>
          <div style={{display:'flex',gap:8}}>
            <Btn onClick={()=>setShowForm(false)} outline color="#6B7280" style={{flex:1}}>취소</Btn>
            <Btn onClick={addExam} bg={cfg.c} disabled={!form.subject.trim()||!form.date} style={{flex:2}}>등록하기</Btn>
          </div>
        </div>
      )}
      {exams.length===0&&<Empty icon="📋" title="등록된 시험이 없어요" desc="시험을 추가하면 D-day가 상단 오른쪽에 항상 표시돼요"/>}
      {exams.map(e=>{
        const d=getDday(e.date);
        return (
          <div key={e.id} className="fu" style={{background:'white',borderRadius:16,padding:'18px 20px',border:'1px solid #F3F4F6',marginBottom:12,display:'flex',alignItems:'center',gap:16,opacity:d<-1?0.6:1,boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
            <div style={{width:70,height:70,borderRadius:16,background:ddayBg(d),display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <div style={{fontSize:20,fontWeight:900,color:ddayColor(d)}}>{ddayLabel(d)}</div>
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                <span style={{fontSize:16,fontWeight:900,color:'#111827'}}>{e.subject}</span>
                <span style={{fontSize:11,fontWeight:700,color:typeColors[e.type]||cfg.c,background:'#F3F4F6',padding:'2px 8px',borderRadius:99}}>{e.type}</span>
              </div>
              <div style={{fontSize:13,color:'#6B7280'}}>📅 {e.date}{d===0 ? ' · 오늘!':''}</div>
              {e.memo&&<div style={{fontSize:12,color:'#9CA3AF',marginTop:4}}>{e.memo}</div>}
            </div>
            <button onClick={()=>setExams(p=>p.filter(x=>x.id!==e.id))} style={{background:'none',border:'none',color:'#D1D5DB',cursor:'pointer',fontSize:16}}>✕</button>
          </div>
        );
      })}
    </div>
  );
}

/* ══════ HABITS SCREEN ══════ */
function HabitsScreen({ habits, setHabits }) {
  const cfg=WS.personal;
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({name:'',icon:'🔥'});
  const todayKey=tod();
  const ICONS=['🔥','💪','📚','🏃','🧘','💧','🥗','😴','🎸','✍️','🌿','☀️','🎯','🎨','🏊','🚴'];
  const addHabit=()=>{
    if(!form.name.trim()) return;
    setHabits(p=>[...p,{id:uid(),name:form.name.trim(),icon:form.icon,log:{},createdAt:new Date().toISOString()}]);
    setForm({name:'',icon:'🔥'}); setShowForm(false);
  };
  const toggleDay=(id,key)=>setHabits(p=>p.map(h=>h.id!==id?h:{...h,log:{...h.log,[key]:!h.log[key]}}));
  const getStreak=h=>{let s=0,d=new Date();while(h.log&&h.log[d.toISOString().split('T')[0]]){s++;d.setDate(d.getDate()-1);}return s;};
  const last7=()=>{const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(d.toISOString().split('T')[0]);}return days;};
  const days=last7();
  const dayLabels=['일','월','화','수','목','금','토'];
  return (
    <div style={{padding:'24px',height:'100%',overflowY:'auto'}}>
      <div className="fu" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div><div style={{fontSize:20,fontWeight:900,color:'#111827'}}>🔥 습관 트래커</div><div style={{fontSize:13,color:'#6B7280',marginTop:2}}>매일 쌓아가는 나만의 루틴</div></div>
        <button onClick={()=>setShowForm(p=>!p)} style={{padding:'9px 16px',borderRadius:10,border:'none',background:cfg.c,color:'white',fontSize:13,fontWeight:700,cursor:'pointer'}}>+ 습관 추가</button>
      </div>
      {showForm&&(
        <div className="fu" style={{background:'white',borderRadius:16,padding:'18px',border:'1.5px solid '+cfg.m,marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:800,color:'#111827',marginBottom:12}}>새 습관 만들기</div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:8}}>아이콘</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {ICONS.map(ic=><button key={ic} onClick={()=>setForm(p=>({...p,icon:ic}))} style={{width:36,height:36,borderRadius:9,border:'2px solid '+(form.icon===ic?cfg.c:'#E5E7EB'),background:form.icon===ic?cfg.l:'white',fontSize:18,cursor:'pointer'}}>{ic}</button>)}
            </div>
          </div>
          <Field value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} label="습관 이름" placeholder="예: 매일 운동하기" required/>
          <div style={{display:'flex',gap:8}}>
            <Btn onClick={()=>setShowForm(false)} outline color="#6B7280" style={{flex:1}}>취소</Btn>
            <Btn onClick={addHabit} bg={cfg.c} disabled={!form.name.trim()} style={{flex:2}}>추가하기</Btn>
          </div>
        </div>
      )}
      {habits.length===0&&<Empty icon="🔥" title="습관이 없어요" desc="작은 습관이 큰 변화를 만들어요!"/>}
      {habits.map(h=>{
        const streak=getStreak(h);
        const todayDone=!!(h.log&&h.log[todayKey]);
        return (
          <div key={h.id} className="fu" style={{background:'white',borderRadius:18,padding:'18px 20px',border:'1px solid #F3F4F6',marginBottom:14,boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:48,height:48,borderRadius:14,background:cfg.l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{h.icon}</div>
                <div>
                  <div style={{fontSize:16,fontWeight:800,color:'#111827'}}>{h.name}</div>
                  {streak>0&&<div style={{fontSize:12,fontWeight:700,color:'#D97706',marginTop:2}}>🔥 {streak}일 연속 달성 중!</div>}
                </div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <button onClick={()=>toggleDay(h.id,todayKey)} style={{padding:'9px 18px',borderRadius:99,border:'none',background:todayDone?cfg.c:cfg.l,color:todayDone?'white':cfg.d,fontSize:13,fontWeight:800,cursor:'pointer'}}>{todayDone ? '✓ 완료':'오늘 체크'}</button>
                <button onClick={()=>setHabits(p=>p.filter(x=>x.id!==h.id))} style={{background:'none',border:'none',color:'#D1D5DB',cursor:'pointer',fontSize:14}}>✕</button>
              </div>
            </div>
            <div style={{display:'flex',gap:6}}>
              {days.map((day,i)=>{
                const done=!!(h.log&&h.log[day]);
                const isToday=day===todayKey;
                const dow=new Date(day+'T00:00:00').getDay();
                return (
                  <div key={day} style={{flex:1,textAlign:'center'}}>
                    <div style={{fontSize:10,fontWeight:600,color:isToday?cfg.c:'#9CA3AF',marginBottom:4}}>{dayLabels[dow]}</div>
                    <button onClick={()=>toggleDay(h.id,day)} style={{width:'100%',aspectRatio:'1',borderRadius:8,border:'none',background:done?cfg.c:isToday?cfg.l:'#F3F4F6',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>
                      {done&&<span style={{color:'white',fontWeight:900}}>✓</span>}
                    </button>
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

/* ══════ NOTIF SCREEN ══════ */
function NotifScreen({ user, spaces, setSpaces, notifs, setNotifs }) {
  const cfg=WS.personal;
  const [codeModal,setCodeModal]=useState(null);
  const [codeInput,setCodeInput]=useState('');
  const [codeError,setCodeError]=useState('');
  const [codeSuccess,setCodeSuccess]=useState(false);

  const acceptInvite=(notif)=>{
    const updated=spaces.map(s=>{
      if(s.id!==notif.spaceId) return s;
      if(s.members&&s.members.find(m=>m.id===user.id)) return s;
      return{...s,members:[...(s.members||[]),{id:user.id,name:user.nickname||user.name,role:'member'}]};
    });
    setSpaces(updated); sv('wl_spaces',updated);
    setNotifs(notifs.map(n=>n.id===notif.id?{...n,status:'accepted',read:true}:n));
  };

  const rejectInvite=(notif)=>setNotifs(notifs.map(n=>n.id===notif.id?{...n,status:'rejected',read:true}:n));

  const submitCode=()=>{
    if(!codeModal) return;
    const space=spaces.find(s=>s.id===codeModal.spaceId);
    if(!space){setCodeError('워크스페이스를 찾을 수 없어요.'); return;}
    if(codeInput.trim().toUpperCase()===(space.inviteCode||'').toUpperCase()){
      const updated=spaces.map(s=>{
        if(s.id!==space.id) return s;
        if(s.members&&s.members.find(m=>m.id===user.id)) return s;
        return{...s,members:[...(s.members||[]),{id:user.id,name:user.nickname||user.name,role:'member'}]};
      });
      setSpaces(updated); sv('wl_spaces',updated);
      setNotifs(notifs.map(n=>n.id===codeModal.id?{...n,status:'accepted',read:true}:n));
      setCodeSuccess(true);
      setTimeout(()=>{setCodeModal(null);setCodeSuccess(false);},1800);
    } else {
      setCodeError('코드가 일치하지 않아요. 다시 확인해주세요.');
    }
  };

  const sorted=[...notifs].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  const unread=sorted.filter(n=>!n.read).length;

  if(sorted.length===0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}><Empty icon="🔔" title="알림이 없어요" desc="초대나 활동 알림이 여기 표시돼요"/></div>;

  return (
    <div style={{padding:'24px',height:'100%',overflowY:'auto'}}>
      <div className="fu" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div><div style={{fontSize:20,fontWeight:900,color:'#111827'}}>🔔 알림</div>{unread>0&&<div style={{fontSize:13,color:cfg.c,fontWeight:700,marginTop:2}}>읽지 않은 알림 {unread}개</div>}</div>
        {unread>0&&<button onClick={()=>setNotifs(notifs.map(n=>({...n,read:true})))} style={{padding:'7px 12px',borderRadius:8,border:'1.5px solid #E5E7EB',background:'white',color:'#6B7280',fontSize:12,fontWeight:600,cursor:'pointer'}}>전체 읽음</button>}
      </div>
      {sorted.map(notif=>{
        const isPending=notif.status==='pending';
        const isAccepted=notif.status==='accepted';
        return (
          <div key={notif.id} className="fu" style={{background:notif.read ? 'white':cfg.l,border:'1.5px solid '+(notif.read ? '#F3F4F6':cfg.m),borderRadius:16,padding:'16px',marginBottom:12}}>
            <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
              <div style={{width:44,height:44,borderRadius:13,background:'linear-gradient(135deg,'+cfg.c+','+cfg.d+')',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>👥</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:800,color:'#111827',marginBottom:3,lineHeight:1.5}}>
                  <span style={{color:cfg.c}}>{notif.fromName}</span>님이 <span style={{fontWeight:900}}>'{notif.spaceName}'</span>에 당신을 초대했습니다.
                </div>
                {notif.message&&<div style={{fontSize:13,color:'#6B7280',marginBottom:8,background:'#F9FAFB',borderRadius:8,padding:'8px 10px'}}>"{notif.message}"</div>}
                <div style={{fontSize:11,color:'#9CA3AF',marginBottom:isPending?12:0}}>{fmtFull((notif.createdAt||'').split('T')[0]||'')}</div>
                {isPending&&(
                  notif.requiresCode ? (
                    <button onClick={e=>{e.stopPropagation();setCodeModal(notif);setCodeInput('');setCodeError('');setCodeSuccess(false);}} style={{width:'100%',padding:'10px',borderRadius:10,border:'none',background:'linear-gradient(135deg,'+cfg.c+','+cfg.d+')',color:'white',fontSize:13,fontWeight:800,cursor:'pointer'}}>🔑 초대 코드 입력하고 참여하기</button>
                  ) : (
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={e=>{e.stopPropagation();rejectInvite(notif);}} style={{flex:1,padding:'9px',borderRadius:10,border:'1.5px solid #E5E7EB',background:'white',color:'#6B7280',fontSize:13,fontWeight:700,cursor:'pointer'}}>거절</button>
                      <button onClick={e=>{e.stopPropagation();acceptInvite(notif);}} style={{flex:2,padding:'9px',borderRadius:10,border:'none',background:'linear-gradient(135deg,'+cfg.c+','+cfg.d+')',color:'white',fontSize:13,fontWeight:800,cursor:'pointer'}}>✓ 수락하기</button>
                    </div>
                  )
                )}
                {isAccepted&&<div style={{fontSize:13,fontWeight:700,color:'#059669',background:'#ECFDF5',borderRadius:8,padding:'8px 12px'}}>✓ 수락됨 — 워크스페이스에 참여했어요!</div>}
                {notif.status==='rejected'&&<div style={{fontSize:13,fontWeight:600,color:'#9CA3AF',background:'#F9FAFB',borderRadius:8,padding:'8px 12px'}}>거절됨</div>}
              </div>
              {!notif.read&&<div style={{width:8,height:8,borderRadius:'50%',background:cfg.c,flexShrink:0,marginTop:4}}/>}
            </div>
          </div>
        );
      })}

      {codeModal&&(
        <div style={{position:'fixed',inset:0,zIndex:990,background:'rgba(0,0,0,.5)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}
          onClick={e=>{if(e.target===e.currentTarget)setCodeModal(null);}}>
          <div className="fu" style={{background:'white',borderRadius:20,padding:'28px',width:'100%',maxWidth:380,boxShadow:'0 24px 64px rgba(0,0,0,.2)'}}>
            {codeSuccess ? (
              <div style={{textAlign:'center',padding:'16px 0'}}>
                <div style={{fontSize:52,marginBottom:12}}>🎉</div>
                <div style={{fontSize:18,fontWeight:900,color:'#059669'}}>참여 완료!</div>
              </div>
            ) : (
              <>
                <div style={{textAlign:'center',marginBottom:20}}>
                  <div style={{fontSize:36,marginBottom:10}}>🔑</div>
                  <div style={{fontSize:18,fontWeight:900,color:'#111827',marginBottom:6}}>초대 코드를 입력하세요!</div>
                  <div style={{fontSize:13,color:'#6B7280',lineHeight:1.6}}><span style={{color:cfg.c,fontWeight:700}}>{codeModal.fromName}</span>님이 <span style={{fontWeight:700}}>'{codeModal.spaceName}'</span>에 초대했어요.</div>
                </div>
                <input value={codeInput} onChange={e=>{setCodeInput(e.target.value.toUpperCase());setCodeError('');}} placeholder="예: ABC123" maxLength={6} onKeyDown={e=>{if(e.key==='Enter')submitCode();}}
                  style={{width:'100%',padding:'14px',fontSize:24,fontWeight:900,letterSpacing:8,textAlign:'center',border:'2px solid '+(codeError?'#EF4444':codeInput?cfg.c:'#E5E7EB'),borderRadius:12,fontFamily:'monospace',marginBottom:10,color:'#111827'}}/>
                {codeError&&<div style={{fontSize:13,color:'#EF4444',textAlign:'center',marginBottom:10,fontWeight:600}}>{codeError}</div>}
                <div style={{display:'flex',gap:10}}>
                  <button onClick={()=>setCodeModal(null)} style={{flex:1,padding:'12px',borderRadius:11,border:'1.5px solid #E5E7EB',background:'white',color:'#6B7280',fontSize:14,fontWeight:600,cursor:'pointer'}}>취소</button>
                  <button onClick={submitCode} disabled={codeInput.length!==6} style={{flex:2,padding:'12px',borderRadius:11,border:'none',background:codeInput.length===6 ? 'linear-gradient(135deg,'+cfg.c+','+cfg.d+')':'#E5E7EB',color:'white',fontSize:14,fontWeight:800,cursor:codeInput.length===6 ? 'pointer':'default'}}>참여하기</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════ COMMENT COMPONENTS ══════ */
function CommentText({ text, members }) {
  const parts = text.split(/(@\S+)/g);
  return <span>{parts.map((p,i)=>{const m=members&&members.find(mb=>('@'+mb.name)===p);return m?<span key={i} style={{color:WS.personal.c,fontWeight:700}}>{p}</span>:<span key={i}>{p}</span>;})}</span>;
}
function CommentInput({ onSubmit, members, placeholder='댓글 입력...', accentColor }) {
  const [v,setV]=useState('');
  const [showMention,setShowMention]=useState(false);
  const [mentionQ,setMentionQ]=useState('');
  const ref=useRef(null);
  const c=accentColor||WS.personal.c;
  const handleChange=e=>{
    const val=e.target.value; setV(val);
    const atIdx=val.lastIndexOf('@');
    if(atIdx!==-1&&atIdx===val.length-1){setShowMention(true);setMentionQ('');}
    else if(atIdx!==-1&&val.slice(atIdx+1).match(/^\w*$/)){setShowMention(true);setMentionQ(val.slice(atIdx+1));}
    else setShowMention(false);
  };
  const insertMention=name=>{
    const atIdx=v.lastIndexOf('@');
    setV(v.slice(0,atIdx)+'@'+name+' ');
    setShowMention(false);
    if(ref.current) ref.current.focus();
  };
  const filteredMembers=(members||[]).filter(m=>m.name.toLowerCase().includes(mentionQ.toLowerCase()));
  return (
    <div style={{position:'relative'}}>
      {showMention&&filteredMembers.length>0&&(
        <div style={{position:'absolute',bottom:'100%',left:0,background:'white',borderRadius:10,boxShadow:'0 4px 16px rgba(0,0,0,.12)',border:'1px solid #E5E7EB',zIndex:100,minWidth:160}}>
          {filteredMembers.map(m=><button key={m.id} onClick={()=>insertMention(m.name)} style={{display:'block',width:'100%',padding:'8px 14px',border:'none',background:'none',textAlign:'left',cursor:'pointer',fontSize:13,fontWeight:700,color:'#374151'}}>{m.name}</button>)}
        </div>
      )}
      <div style={{display:'flex',gap:8}}>
        <input ref={ref} value={v} onChange={handleChange} placeholder={placeholder} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&v.trim()){e.preventDefault();onSubmit(v.trim());setV('');setShowMention(false);}}}
          style={{flex:1,padding:'9px 12px',fontSize:13,border:'1.5px solid #E5E7EB',borderRadius:10,fontFamily:'inherit'}}/>
        <button onClick={()=>{if(v.trim()){onSubmit(v.trim());setV('');setShowMention(false);}}} style={{padding:'9px 16px',borderRadius:10,border:'none',background:c,color:'white',fontSize:13,fontWeight:700,cursor:'pointer'}}>전송</button>
      </div>
    </div>
  );
}
function CommentSection({ comments, members, user, onAddComment, onAddReply, onDelete, accentColor }) {
  const [replyTo,setReplyTo]=useState(null);
  const c=accentColor||WS.personal.c;
  return (
    <div>
      {comments.length===0&&<div style={{textAlign:'center',padding:'20px',color:'#D1D5DB',fontSize:13}}>첫 번째 댓글을 남겨보세요!</div>}
      {comments.map(cm=>(
        <div key={cm.id} style={{marginBottom:16}}>
          <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
            <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,'+c+',#2563EB)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:13,fontWeight:900,flexShrink:0}}>{(cm.authorName||'?')[0]}</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                <span style={{fontSize:13,fontWeight:700,color:'#111827'}}>{cm.authorName}</span>
                <span style={{fontSize:11,color:'#9CA3AF'}}>{fmtFull((cm.createdAt||'').split('T')[0])}</span>
              </div>
              <div style={{fontSize:14,color:'#374151',lineHeight:1.6,background:'#F9FAFB',borderRadius:'0 12px 12px 12px',padding:'10px 13px'}}>
                <CommentText text={cm.text} members={members}/>
              </div>
              <div style={{display:'flex',gap:12,marginTop:6}}>
                <button onClick={()=>setReplyTo(replyTo===cm.id?null:cm.id)} style={{background:'none',border:'none',fontSize:12,color:c,fontWeight:700,cursor:'pointer'}}>↩ 답글</button>
                {cm.authorId===user.id&&<button onClick={()=>onDelete(cm.id)} style={{background:'none',border:'none',fontSize:12,color:'#9CA3AF',cursor:'pointer'}}>삭제</button>}
              </div>
              {(cm.replies||[]).map(r=>(
                <div key={r.id} style={{display:'flex',gap:8,marginTop:8,marginLeft:14}}>
                  <div style={{width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,'+c+',#7C3AED)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:11,fontWeight:900,flexShrink:0}}>{(r.authorName||'?')[0]}</div>
                  <div>
                    <span style={{fontSize:12,fontWeight:700,color:'#374151',marginRight:6}}>{r.authorName}</span>
                    <span style={{fontSize:13,color:'#374151'}}><CommentText text={r.text} members={members}/></span>
                  </div>
                </div>
              ))}
              {replyTo===cm.id&&(
                <div style={{marginTop:10,marginLeft:14}}>
                  <CommentInput onSubmit={text=>{onAddReply(cm.id,text);setReplyTo(null);}} members={members} placeholder={'@'+cm.authorName+'에게 답글...'} accentColor={c}/>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <div style={{marginTop:16}}>
        <CommentInput onSubmit={text=>onAddComment(text)} members={members} accentColor={c}/>
      </div>
    </div>
  );
}

/* ══════ WORKSPACE SCREEN ══════ */
function WorkspaceScreen({ user, accounts, spaces, setSpaces }) {
  const cfg=WS.personal;
  const [view,setView]=useState('list');
  const [selSpace,setSelSpace]=useState(null);
  const [form,setForm]=useState({name:'',description:'',type:'개인'});
  const [customType,setCustomType]=useState('');
  const [invEmail,setInvEmail]=useState('');
  const [invResult,setInvResult]=useState(null);
  const [showMsgInput,setShowMsgInput]=useState(false);
  const [invMsg,setInvMsg]=useState('');
  const [invSent,setInvSent]=useState(false);
  const [searching,setSearching]=useState(false);
  const [codeCopied,setCodeCopied]=useState(false);
  const [tab,setTab]=useState('members');
  const [showTodoForm,setShowTodoForm]=useState(false);
  const [todoForm,setTodoForm]=useState({title:'',priority:'medium',dueDate:'',assigneeId:''});
  const [showEventForm,setShowEventForm]=useState(false);
  const [eventForm,setEventForm]=useState({title:'',date:tod(),time:'',color:'#4F46E5'});
  const [commentModal,setCommentModal]=useState(null);

  const updateSpace=(updated)=>{const all=spaces.map(s=>s.id===updated.id?updated:s);setSpaces(all);sv('wl_spaces',all);setSelSpace(updated);};

  const createSpace=()=>{
    if(!form.name.trim()) return;
    const spaceType=customType.trim()||form.type;
    const code=genInviteCode();
    const space={id:uid(),name:form.name.trim(),description:form.description,type:spaceType,ownerId:user.id,members:[{id:user.id,name:user.nickname||user.name,role:'owner'}],todos:[],events:[],comments:[],inviteCode:code,createdAt:new Date().toISOString()};
    const updated=[...spaces,space];
    setSpaces(updated);sv('wl_spaces',updated);
    setForm({name:'',description:'',type:'개인'});setCustomType('');
    setSelSpace(space);setTab('members');setView('detail');
  };

  const searchEmail=async()=>{
    if(!invEmail.trim()) return;
    setSearching(true);setInvResult(null);setShowMsgInput(false);setInvMsg('');
    await new Promise(r=>setTimeout(r,400));
    setSearching(false);
    const allAccounts=ld('wl_accounts',[]);
    const found=allAccounts.find(a=>a.email&&a.email.toLowerCase()===invEmail.trim().toLowerCase()&&a.id!==user.id);
    const space=spaces.find(s=>s.id===selSpace.id)||selSpace;
    if(found&&space.members&&space.members.find(m=>m.id===found.id)){setInvResult('already_member');}
    else if(found){setInvResult(found);}
    else {
      setInvResult('not_found');
      const pendingKey='wl_pending_'+invEmail.trim().toLowerCase();
      const existing=ld(pendingKey,[]);
      if(!existing.find(p=>p.spaceId===space.id)){
        sv(pendingKey,[...existing,{id:uid(),spaceId:space.id,spaceName:space.name,inviteCode:space.inviteCode||genInviteCode(),fromId:user.id,fromName:user.nickname||user.name,email:invEmail.trim().toLowerCase(),sentAt:new Date().toISOString()}]);
      }
    }
  };

  const sendInvite=()=>{
    if(!invResult||invResult==='not_found'||invResult==='already_member') return;
    const space=spaces.find(s=>s.id===selSpace.id)||selSpace;
    const notif={id:uid(),type:'invite',fromId:user.id,fromName:user.nickname||user.name,spaceId:space.id,spaceName:space.name,inviteCode:space.inviteCode,requiresCode:false,message:invMsg.trim(),status:'pending',read:false,createdAt:new Date().toISOString()};
    sv('wl_notifs_'+invResult.id,[...ld('wl_notifs_'+invResult.id,[]),notif]);
    setInvSent(true);setInvEmail('');setInvResult(null);setShowMsgInput(false);setInvMsg('');
    setTimeout(()=>setInvSent(false),3500);
  };

  const copyCode=(code)=>{try{navigator.clipboard.writeText(code);}catch(e){}setCodeCopied(true);setTimeout(()=>setCodeCopied(false),2000);};
  const addTodo=()=>{
    if(!todoForm.title.trim()) return;
    const space=spaces.find(s=>s.id===selSpace.id)||selSpace;
    const assignee=space.members&&space.members.find(m=>m.id===todoForm.assigneeId);
    const todo={id:uid(),title:todoForm.title.trim(),status:'todo',priority:todoForm.priority,dueDate:todoForm.dueDate,assigneeId:todoForm.assigneeId,assigneeName:assignee&&assignee.name||'',createdByName:user.nickname||user.name,createdAt:new Date().toISOString()};
    updateSpace({...space,todos:[...(space.todos||[]),todo]});
    setTodoForm({title:'',priority:'medium',dueDate:'',assigneeId:''});setShowTodoForm(false);
  };
  const cycleTodo=(id)=>{const s=spaces.find(x=>x.id===selSpace.id)||selSpace;const order=['todo','progress','done'];updateSpace({...s,todos:(s.todos||[]).map(t=>t.id===id?{...t,status:order[(order.indexOf(t.status)+1)%order.length]}:t)});};
  const delTodo=(id)=>{const s=spaces.find(x=>x.id===selSpace.id)||selSpace;updateSpace({...s,todos:(s.todos||[]).filter(t=>t.id!==id)});};
  const addEvent=()=>{
    if(!eventForm.title.trim()) return;
    const space=spaces.find(s=>s.id===selSpace.id)||selSpace;
    const ev={id:uid(),...eventForm,title:eventForm.title.trim(),createdByName:user.nickname||user.name,createdAt:new Date().toISOString()};
    updateSpace({...space,events:[...(space.events||[]),ev].sort((a,b)=>a.date.localeCompare(b.date))});
    setEventForm({title:'',date:tod(),time:'',color:'#4F46E5'});setShowEventForm(false);
  };
  const delEvent=(id)=>{const s=spaces.find(x=>x.id===selSpace.id)||selSpace;updateSpace({...s,events:(s.events||[]).filter(e=>e.id!==id)});};
  const addComment=(text,linkedId,linkedType,linkedTitle)=>{const space=spaces.find(s=>s.id===selSpace.id)||selSpace;const c={id:uid(),linkedId,linkedType,linkedTitle,authorId:user.id,authorName:user.nickname||user.name,text,replies:[],createdAt:new Date().toISOString()};updateSpace({...space,comments:[...(space.comments||[]),c]});};
  const addReply=(commentId,text)=>{const space=spaces.find(s=>s.id===selSpace.id)||selSpace;const r={id:uid(),authorId:user.id,authorName:user.nickname||user.name,text,createdAt:new Date().toISOString()};updateSpace({...space,comments:(space.comments||[]).map(c=>c.id===commentId?{...c,replies:[...(c.replies||[]),r]}:c)});};
  const delComment=(id)=>{const s=spaces.find(x=>x.id===selSpace.id)||selSpace;updateSpace({...s,comments:(s.comments||[]).filter(c=>c.id!==id)});};

  const mySpaces=spaces.filter(s=>s.members&&s.members.find(m=>m.id===user.id));
  const EV_COLORS=['#4F46E5','#059669','#D97706','#DC2626','#0891B2','#BE185D'];
  const COLS=['todo','progress','done'];
  const TABS=[{id:'members',label:'👥 멤버'},{id:'todo',label:'✅ 할일'},{id:'cal',label:'📅 캘린더'},{id:'comments',label:'💬 댓글'}];

  if(view==='detail'&&selSpace){
    const space=spaces.find(s=>s.id===selSpace.id)||selSpace;
    const spaceIcon=SPACE_TYPE_ICONS[space.type]||'📁';
    const isOwner=space.ownerId===user.id;
    const members=space.members||[];
    const todos=space.todos||[];
    const events=space.events||[];
    const comments=space.comments||[];
    return (
      <div style={{height:'100%',display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{padding:'14px 20px',borderBottom:'1px solid #F3F4F6',flexShrink:0,display:'flex',alignItems:'center',gap:12,background:'white'}}>
          <button onClick={()=>{setView('list');setInvResult(null);setInvEmail('');}} style={{width:34,height:34,borderRadius:10,border:'1.5px solid #E5E7EB',background:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>←</button>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:20}}>{spaceIcon}</span>
              <div style={{fontSize:17,fontWeight:900,color:'#111827'}}>{space.name}</div>
              <span style={{fontSize:11,fontWeight:700,color:cfg.d,background:cfg.l,padding:'2px 8px',borderRadius:99}}>{space.type}</span>
            </div>
            <div style={{fontSize:12,color:'#9CA3AF',marginTop:2}}>{members.length}명 참여 중</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:5,background:'#ECFDF5',borderRadius:99,padding:'4px 10px'}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#059669',animation:'pulse 1.5s ease-in-out infinite'}}/>
            <span style={{fontSize:11,fontWeight:700,color:'#059669'}}>실시간 동기화 중</span>
          </div>
        </div>
        <div style={{display:'flex',borderBottom:'1px solid #F3F4F6',background:'white',flexShrink:0,padding:'0 16px',overflowX:'auto'}}>
          {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'11px 13px',border:'none',background:'none',fontWeight:tab===t.id?800:600,fontSize:13,color:tab===t.id?cfg.c:'#6B7280',borderBottom:'2.5px solid '+(tab===t.id?cfg.c:'transparent'),cursor:'pointer',whiteSpace:'nowrap'}}>{t.label}</button>)}
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'20px'}}>
          {tab==='members'&&(
            <div>
              <div style={{background:'white',borderRadius:14,padding:'16px',border:'1px solid #F3F4F6',marginBottom:16}}>
                <div style={{fontSize:14,fontWeight:800,color:'#111827',marginBottom:14}}>멤버 ({members.length}명)</div>
                {members.map(m=>(
                  <div key={m.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid #F9FAFB'}}>
                    <div style={{width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,'+cfg.c+','+cfg.d+')',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:15,fontWeight:900,flexShrink:0}}>{(m.name||'?')[0]}</div>
                    <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:'#111827'}}>{m.name}</div></div>
                    <Badge color={m.role==='owner'?cfg.d:'#6B7280'} bg={m.role==='owner'?cfg.l:'#F3F4F6'}>{m.role==='owner' ? '관리자':'멤버'}</Badge>
                  </div>
                ))}
              </div>
              {space.inviteCode&&(
                <div style={{background:'linear-gradient(135deg,'+cfg.l+',white)',borderRadius:14,padding:'16px',border:'1.5px solid '+cfg.m,marginBottom:16}}>
                  <div style={{fontSize:13,fontWeight:800,color:cfg.d,marginBottom:10}}>🔑 초대 코드</div>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{flex:1,fontSize:28,fontWeight:900,letterSpacing:6,color:cfg.c,fontFamily:'monospace'}}>{space.inviteCode}</div>
                    <button onClick={()=>copyCode(space.inviteCode)} style={{padding:'8px 16px',borderRadius:10,border:'none',background:codeCopied?'#059669':cfg.c,color:'white',fontSize:13,fontWeight:700,cursor:'pointer'}}>{codeCopied ? '✓ 복사됨':'복사'}</button>
                  </div>
                  <div style={{fontSize:12,color:cfg.d,marginTop:8}}>친구에게 이 코드를 알려주면 워크스페이스에 참여할 수 있어요</div>
                </div>
              )}
              {isOwner&&(
                <div style={{background:'white',borderRadius:14,padding:'18px',border:'1px solid #F3F4F6'}}>
                  <div style={{fontSize:14,fontWeight:800,color:'#111827',marginBottom:14}}>👋 친구 초대하기</div>
                  {invSent&&<div className="pp" style={{background:'#ECFDF5',border:'1.5px solid #A7F3D0',borderRadius:10,padding:'10px 14px',fontSize:13,fontWeight:700,color:'#059669',marginBottom:12}}>✉️ 초대 전송 완료!</div>}
                  <div style={{display:'flex',gap:8,marginBottom:10}}>
                    <input value={invEmail} onChange={e=>{setInvEmail(e.target.value);setInvResult(null);}} placeholder="친구 이메일 입력" onKeyDown={e=>{if(e.key==='Enter')searchEmail();}} style={{flex:1,padding:'10px 13px',fontSize:13,border:'1.5px solid #E5E7EB',borderRadius:10,fontFamily:'inherit'}}/>
                    <button onClick={searchEmail} disabled={!invEmail.trim()||searching} style={{padding:'10px 16px',borderRadius:10,border:'none',background:invEmail.trim()?cfg.c:'#E5E7EB',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',minWidth:64,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {searching ? <div style={{width:13,height:13,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin .6s linear infinite'}}/> : '검색'}
                    </button>
                  </div>
                  {invResult==='not_found'&&(
                    <div className="fu">
                      <div style={{background:'#FEF2F2',border:'1.5px solid #FECACA',borderRadius:10,padding:'12px 14px',marginBottom:12}}>
                        <div style={{fontSize:13,fontWeight:700,color:'#DC2626',marginBottom:4}}>❌ 등록된 이메일이 없어요</div>
                        <div style={{fontSize:12,color:'#6B7280'}}>코드를 보내 친구와 함께 작업하세요!</div>
                      </div>
                      {space.inviteCode&&<div style={{background:'#F0FDF4',border:'1.5px solid #BBF7D0',borderRadius:10,padding:'14px'}}>
                        <div style={{fontSize:12,fontWeight:700,color:'#059669',marginBottom:8}}>📨 친구에게 이 코드를 보내주세요</div>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                          <div style={{fontSize:24,fontWeight:900,letterSpacing:4,color:'#059669',fontFamily:'monospace',flex:1}}>{space.inviteCode}</div>
                          <button onClick={()=>copyCode(space.inviteCode)} style={{padding:'7px 14px',borderRadius:9,border:'none',background:codeCopied?'#059669':'#22C55E',color:'white',fontSize:12,fontWeight:700,cursor:'pointer'}}>{codeCopied ? '✓ 복사됨':'코드 복사'}</button>
                        </div>
                        <div style={{fontSize:12,color:'#6B7280',lineHeight:1.6}}>친구가 Workly에 가입하면 알림함에서 초대를 확인할 수 있어요!</div>
                      </div>}
                    </div>
                  )}
                  {invResult==='already_member'&&<div className="fu" style={{background:'#FFFBEB',border:'1.5px solid #FDE68A',borderRadius:10,padding:'10px 14px',fontSize:13,fontWeight:700,color:'#D97706'}}>ℹ️ 이미 멤버예요.</div>}
                  {invResult&&invResult!=='not_found'&&invResult!=='already_member'&&(
                    <div className="fu" style={{background:'#F9FAFB',border:'1.5px solid #E5E7EB',borderRadius:12,overflow:'hidden'}}>
                      <div style={{padding:'14px',display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,'+cfg.c+','+cfg.d+')',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:19,fontWeight:900,flexShrink:0}}>{(invResult.nickname||invResult.name||'?')[0]}</div>
                        <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:'#111827'}}>{invResult.nickname||invResult.name}</div><div style={{fontSize:12,color:'#9CA3AF'}}>{invResult.email}</div></div>
                        {!showMsgInput&&<button onClick={()=>setShowMsgInput(true)} style={{padding:'8px 14px',borderRadius:99,border:'none',background:cfg.c,color:'white',fontSize:13,fontWeight:700,cursor:'pointer'}}>초대</button>}
                      </div>
                      {showMsgInput&&<div style={{padding:'0 14px 14px',borderTop:'1px solid #F3F4F6'}}>
                        <textarea value={invMsg} onChange={e=>setInvMsg(e.target.value)} placeholder="초대 메시지 (선택)" rows={2} style={{width:'100%',padding:'10px',fontSize:13,border:'1.5px solid #E5E7EB',borderRadius:9,resize:'none',fontFamily:'inherit',marginTop:12,marginBottom:10}}/>
                        <div style={{display:'flex',gap:8}}>
                          <button onClick={()=>setShowMsgInput(false)} style={{flex:1,padding:'9px',borderRadius:9,border:'1.5px solid #E5E7EB',background:'white',color:'#6B7280',fontSize:13,fontWeight:600,cursor:'pointer'}}>취소</button>
                          <button onClick={sendInvite} style={{flex:2,padding:'9px',borderRadius:9,border:'none',background:cfg.c,color:'white',fontSize:13,fontWeight:700,cursor:'pointer'}}>✉️ 초대 보내기</button>
                        </div>
                      </div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {tab==='todo'&&(
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <div style={{fontSize:14,fontWeight:800,color:'#111827'}}>공유 할일</div>
                <button onClick={()=>setShowTodoForm(p=>!p)} style={{padding:'8px 14px',borderRadius:9,border:'none',background:cfg.c,color:'white',fontSize:13,fontWeight:700,cursor:'pointer'}}>+ 추가</button>
              </div>
              {showTodoForm&&(
                <div className="fu" style={{background:'white',borderRadius:14,padding:'16px',border:'1.5px solid '+cfg.m,marginBottom:16}}>
                  <Field value={todoForm.title} onChange={v=>setTodoForm(p=>({...p,title:v}))} label="할일 제목" placeholder="할일을 입력하세요" required/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <Select label="우선순위" value={todoForm.priority} onChange={v=>setTodoForm(p=>({...p,priority:v}))} options={Object.entries(PRIO).map(([k,v])=>({value:k,label:v.l}))}/>
                    <Field value={todoForm.dueDate} onChange={v=>setTodoForm(p=>({...p,dueDate:v}))} label="마감일" type="date"/>
                  </div>
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:5}}>담당자</div>
                    <select value={todoForm.assigneeId} onChange={e=>setTodoForm(p=>({...p,assigneeId:e.target.value}))} style={{width:'100%',padding:'10px 13px',fontSize:14,border:'1.5px solid #E5E7EB',borderRadius:10,background:'white'}}>
                      <option value="">담당자 없음</option>
                      {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div style={{display:'flex',gap:8}}><Btn onClick={()=>setShowTodoForm(false)} outline color="#6B7280" style={{flex:1}}>취소</Btn><Btn onClick={addTodo} bg={cfg.c} disabled={!todoForm.title.trim()} style={{flex:2}}>추가</Btn></div>
                </div>
              )}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                {COLS.map(col=>{
                  const colTodos=todos.filter(t=>t.status===col);
                  const S=STAT[col];
                  return (
                    <div key={col}>
                      <div style={{display:'flex',alignItems:'center',gap:6,padding:'7px 10px',background:S.bg,borderRadius:9,marginBottom:10}}>
                        <span style={{fontSize:12}}>{S.icon}</span><span style={{fontSize:12,fontWeight:800,color:S.c}}>{S.l}</span>
                        <span style={{marginLeft:'auto',fontSize:11,fontWeight:700,color:S.c,background:'white',borderRadius:99,padding:'1px 6px'}}>{colTodos.length}</span>
                      </div>
                      {colTodos.length===0&&<div style={{textAlign:'center',padding:'20px 8px',color:'#D1D5DB',fontSize:12}}>없음</div>}
                      {colTodos.map(t=>(
                        <div key={t.id} style={{background:'white',borderRadius:12,padding:'12px',border:'1px solid #F3F4F6',marginBottom:8}}>
                          <div style={{display:'flex',justifyContent:'space-between',gap:6,marginBottom:8}}>
                            <div style={{fontSize:13,fontWeight:700,color:'#111827',lineHeight:1.4}}>{t.title}</div>
                            <button onClick={()=>delTodo(t.id)} style={{background:'none',border:'none',color:'#D1D5DB',cursor:'pointer',fontSize:12,flexShrink:0}}>✕</button>
                          </div>
                          <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:8}}>
                            <Badge color={PRIO[t.priority]&&PRIO[t.priority].c} bg={PRIO[t.priority]&&PRIO[t.priority].bg}>{PRIO[t.priority]&&PRIO[t.priority].l}</Badge>
                            {t.dueDate&&<Badge color="#6B7280" bg="#F9FAFB">{'📅 '+fmtD(t.dueDate)}</Badge>}
                            {t.assigneeName&&<Badge color={cfg.d} bg={cfg.l}>{'👤 '+t.assigneeName}</Badge>}
                          </div>
                          <div style={{display:'flex',gap:6}}>
                            <button onClick={()=>cycleTodo(t.id)} style={{flex:1,padding:'5px 8px',borderRadius:7,border:'1px solid '+cfg.m,background:cfg.l,color:cfg.d,fontSize:11,fontWeight:700,cursor:'pointer'}}>상태 변경</button>
                            <button onClick={()=>setCommentModal({id:t.id,type:'todo',title:t.title})} style={{padding:'5px 10px',borderRadius:7,border:'1px solid #E5E7EB',background:'white',color:'#6B7280',fontSize:11,fontWeight:700,cursor:'pointer'}}>{'💬 '+(comments.filter(c=>c.linkedId===t.id).length||'')}</button>
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
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <div style={{fontSize:14,fontWeight:800,color:'#111827'}}>공유 일정</div>
                <button onClick={()=>setShowEventForm(p=>!p)} style={{padding:'8px 14px',borderRadius:9,border:'none',background:cfg.c,color:'white',fontSize:13,fontWeight:700,cursor:'pointer'}}>+ 추가</button>
              </div>
              {showEventForm&&(
                <div className="fu" style={{background:'white',borderRadius:14,padding:'16px',border:'1.5px solid '+cfg.m,marginBottom:16}}>
                  <Field value={eventForm.title} onChange={v=>setEventForm(p=>({...p,title:v}))} label="일정 제목" placeholder="일정 제목 입력" required/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <Field value={eventForm.date} onChange={v=>setEventForm(p=>({...p,date:v}))} label="날짜" type="date"/>
                    <Field value={eventForm.time} onChange={v=>setEventForm(p=>({...p,time:v}))} label="시간" placeholder="14:00"/>
                  </div>
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:6}}>색상</div>
                    <div style={{display:'flex',gap:8}}>{EV_COLORS.map(c=><button key={c} onClick={()=>setEventForm(p=>({...p,color:c}))} style={{width:26,height:26,borderRadius:'50%',background:c,border:'3px solid '+(eventForm.color===c?'#111827':'transparent'),cursor:'pointer'}}/>)}</div>
                  </div>
                  <div style={{display:'flex',gap:8}}><Btn onClick={()=>setShowEventForm(false)} outline color="#6B7280" style={{flex:1}}>취소</Btn><Btn onClick={addEvent} bg={cfg.c} disabled={!eventForm.title.trim()} style={{flex:2}}>추가</Btn></div>
                </div>
              )}
              {events.length===0&&<Empty icon="📅" title="일정이 없어요" desc="+ 추가 버튼으로 팀 일정을 추가하세요"/>}
              {events.map(ev=>(
                <div key={ev.id} style={{background:'white',borderRadius:13,padding:'14px 16px',border:'1px solid #F3F4F6',marginBottom:10,display:'flex',gap:12,alignItems:'center'}}>
                  <div style={{width:4,alignSelf:'stretch',borderRadius:2,background:ev.color||cfg.c,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:'#111827',marginBottom:4}}>{ev.title}</div>
                    <div style={{fontSize:12,color:'#6B7280'}}>{'📅 '+fmtFull(ev.date)+(ev.time ? ' · '+ev.time:'')}</div>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>setCommentModal({id:ev.id,type:'event',title:ev.title})} style={{padding:'6px 10px',borderRadius:8,border:'1px solid #E5E7EB',background:'white',color:'#6B7280',fontSize:12,fontWeight:700,cursor:'pointer'}}>{'💬 '+(comments.filter(c=>c.linkedId===ev.id).length||'댓글')}</button>
                    <button onClick={()=>delEvent(ev.id)} style={{padding:'6px 8px',borderRadius:8,border:'1px solid #FECACA',background:'#FEF2F2',color:'#EF4444',fontSize:12,cursor:'pointer'}}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab==='comments'&&(
            <div>
              <div style={{fontSize:14,fontWeight:800,color:'#111827',marginBottom:16}}>전체 댓글</div>
              <CommentSection comments={comments} members={members} user={user} onAddComment={addComment} onAddReply={addReply} onDelete={delComment} accentColor={cfg.c}/>
            </div>
          )}
        </div>
        {commentModal&&(
          <div style={{position:'fixed',inset:0,zIndex:900,background:'rgba(0,0,0,.4)',backdropFilter:'blur(4px)',display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={e=>{if(e.target===e.currentTarget)setCommentModal(null);}}>
            <div className="fu" style={{background:'white',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:640,maxHeight:'75vh',display:'flex',flexDirection:'column'}}>
              <div style={{padding:'16px 20px',borderBottom:'1px solid #F3F4F6',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
                <div><div style={{fontSize:11,fontWeight:700,color:'#9CA3AF',marginBottom:2}}>{commentModal.type==='todo' ? '✅ 할일':'📅 일정'}에 댓글</div><div style={{fontSize:15,fontWeight:800,color:'#111827'}}>{commentModal.title}</div></div>
                <button onClick={()=>setCommentModal(null)} style={{width:30,height:30,borderRadius:8,border:'none',background:'#F9FAFB',color:'#6B7280',fontSize:14,cursor:'pointer'}}>✕</button>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>
                <CommentSection comments={comments.filter(c=>c.linkedId===commentModal.id)} members={members} user={user} onAddComment={text=>addComment(text,commentModal.id,commentModal.type,commentModal.title)} onAddReply={addReply} onDelete={delComment} accentColor={cfg.c}/>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{padding:'24px',height:'100%',overflowY:'auto'}}>
      <div className="fu" style={{marginBottom:24}}>
        <div style={{fontSize:20,fontWeight:900,color:'#111827'}}>👥 협업 워크스페이스</div>
        <div style={{fontSize:13,color:'#6B7280',marginTop:2}}>팀원들과 함께 작업하는 공간이에요</div>
      </div>
      {view!=='create'&&(
        <button onClick={()=>setView('create')} style={{width:'100%',padding:'20px',borderRadius:16,border:'2px dashed '+cfg.c,background:cfg.l,cursor:'pointer',marginBottom:20,display:'flex',alignItems:'center',gap:14,textAlign:'left'}}>
          <div style={{width:48,height:48,borderRadius:14,background:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,boxShadow:'0 2px 8px rgba(0,0,0,.08)'}}>＋</div>
          <div><div style={{fontSize:15,fontWeight:800,color:cfg.c}}>새 워크스페이스 만들기</div><div style={{fontSize:12,color:cfg.d,marginTop:3}}>유형을 직접 만들고 이메일로 멤버를 초대해요</div></div>
        </button>
      )}
      {view==='create'&&(
        <div className="fu" style={{background:'white',borderRadius:16,padding:'20px',border:'1px solid #F3F4F6',marginBottom:20}}>
          <div style={{fontSize:15,fontWeight:800,color:'#111827',marginBottom:16}}>새 워크스페이스 만들기</div>
          <Field value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} label="이름" placeholder="예: 우리 팀 프로젝트" required/>
          <Field value={form.description} onChange={v=>setForm(p=>({...p,description:v}))} label="설명" placeholder="설명 (선택)" rows={2}/>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:8,textTransform:'uppercase',letterSpacing:'.04em'}}>유형 <span style={{color:'#EF4444'}}>*</span></div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:10}}>
              {SPACE_TYPE_PRESETS.map(t=>{
                const isSelected=(customType===''&&form.type===t)||customType===t;
                return <button key={t} onClick={()=>{setForm(p=>({...p,type:t}));setCustomType('');}} style={{padding:'7px 14px',borderRadius:99,border:'2px solid '+(isSelected?cfg.c:'#E5E7EB'),background:isSelected?cfg.l:'white',color:isSelected?cfg.c:'#6B7280',fontSize:13,fontWeight:700,cursor:'pointer'}}>{(SPACE_TYPE_ICONS[t]||'📁')+' '+t}</button>;
              })}
            </div>
            <input value={customType} onChange={e=>setCustomType(e.target.value)} placeholder="또는 직접 입력 (예: 독서모임, 스타트업...)" style={{width:'100%',padding:'10px 13px',fontSize:13,border:'1.5px solid '+(customType?cfg.c:'#E5E7EB'),borderRadius:10,fontFamily:'inherit'}}/>
            {customType&&<div style={{fontSize:12,color:cfg.d,marginTop:4}}>유형: <strong>'{customType}'</strong>으로 만들어요</div>}
          </div>
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={()=>setView('list')} outline color="#6B7280" style={{flex:1}}>취소</Btn>
            <Btn onClick={createSpace} bg={cfg.c} disabled={!form.name.trim()} style={{flex:2}}>만들기 🚀</Btn>
          </div>
        </div>
      )}
      {mySpaces.length>0&&(
        <>
          <div style={{fontSize:12,fontWeight:800,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:12}}>내 워크스페이스</div>
          {mySpaces.map(s=>{
            const spaceIcon=SPACE_TYPE_ICONS[s.type]||'📁';
            return (
              <div key={s.id} style={{background:'white',borderRadius:14,padding:'16px 18px',border:'1px solid #F3F4F6',cursor:'pointer',display:'flex',alignItems:'center',gap:14,marginBottom:10,boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}
                onClick={()=>{setSelSpace(s);setTab('members');setView('detail');setInvResult(null);setInvEmail('');}}>
                <div style={{width:46,height:46,borderRadius:13,background:cfg.l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{spaceIcon}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                    <div style={{fontSize:15,fontWeight:800,color:'#111827'}}>{s.name}</div>
                    <span style={{fontSize:11,fontWeight:700,color:cfg.d,background:cfg.l,padding:'1px 7px',borderRadius:99}}>{s.type}</span>
                  </div>
                  <div style={{fontSize:12,color:'#9CA3AF',display:'flex',gap:10}}>
                    <span>{'👥 '+(s.members&&s.members.length||1)+'명'}</span>
                    <span>{'✅ '+((s.todos||[]).filter(t=>t.status!=='done').length)+'개 진행중'}</span>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <button onClick={e=>{e.stopPropagation();if(window.confirm(s.name+' 워크스페이스를 삭제할까요?')){const upd=spaces.filter(x=>x.id!==s.id);setSpaces(upd);sv('wl_spaces',upd);}}} style={{padding:'6px 10px',borderRadius:8,border:'1px solid #FECACA',background:'#FEF2F2',color:'#EF4444',fontSize:12,fontWeight:700,cursor:'pointer'}}>삭제</button>
                  <span style={{fontSize:16,color:'#D1D5DB'}}>›</span>
                </div>
              </div>
            );
          })}
        </>
      )}
      {mySpaces.length===0&&view!=='create'&&<Empty icon="👥" title="참여 중인 워크스페이스가 없어요" desc="새 워크스페이스를 만들거나 초대를 기다려보세요"/>}
    </div>
  );
}

/* ══════ PRO UPGRADE SCREEN ══════ */
function ProUpgradeScreen({ user, onUpgrade, onBack }) {
  const cfg=WS.personal;
  const [plan,setPlan]=useState('monthly');
  const [processing,setProcessing]=useState(false);
  const [done,setDone]=useState(false);
  const PRICE={monthly:{label:'월간',price:'₩9,900',note:'매월 결제'},annual:{label:'연간',price:'₩79,900',note:'월 ₩6,658 · 2개월 무료'}};
  const handleBuy=async()=>{
    setProcessing(true);
    await new Promise(r=>setTimeout(r,1800));
    setProcessing(false); setDone(true);
    setTimeout(onUpgrade,1500);
  };
  if(done) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}><div style={{fontSize:64}}>🎉</div><div style={{fontSize:24,fontWeight:900,color:cfg.c}}>Pro 시작!</div><div style={{fontSize:14,color:'#6B7280'}}>이제 모든 기능을 사용할 수 있어요</div></div>;
  return (
    <div style={{height:'100%',overflowY:'auto',padding:'32px 24px'}}>
      <button onClick={onBack} style={{background:'none',border:'none',color:'#6B7280',fontSize:14,cursor:'pointer',marginBottom:24}}>← 뒤로</button>
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{fontSize:48,marginBottom:12}}>⚡️</div>
        <div style={{fontSize:28,fontWeight:900,color:'#111827',marginBottom:8}}>Workly Pro</div>
        <div style={{fontSize:15,color:'#6B7280'}}>모든 기능을 제한 없이 사용하세요</div>
      </div>
      <div style={{display:'flex',gap:12,marginBottom:28}}>
        {Object.entries(PRICE).map(([k,v])=>(
          <button key={k} onClick={()=>setPlan(k)} style={{flex:1,padding:'16px',borderRadius:14,border:'2px solid '+(plan===k?cfg.c:'#E5E7EB'),background:plan===k?cfg.l:'white',cursor:'pointer',textAlign:'center'}}>
            <div style={{fontSize:14,fontWeight:800,color:plan===k?cfg.c:'#374151',marginBottom:4}}>{v.label}</div>
            <div style={{fontSize:22,fontWeight:900,color:plan===k?cfg.c:'#111827'}}>{v.price}</div>
            <div style={{fontSize:11,color:plan===k?cfg.d:'#9CA3AF',marginTop:4}}>{v.note}</div>
          </button>
        ))}
      </div>
      <button onClick={handleBuy} disabled={processing} style={{width:'100%',padding:'16px',borderRadius:14,border:'none',background:'linear-gradient(135deg,'+cfg.c+','+cfg.d+')',color:'white',fontSize:16,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
        {processing ? <><div style={{width:18,height:18,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>처리 중...</>:'결제하기 →'}
      </button>
    </div>
  );
}

/* ══════ PROFILE SCREEN ══════ */
function ProfileScreen({ user, onUpdate, onLogout, onDeleteAccount, onShowPro, isProUser }) {
  const cfg=WS.personal;
  const [editNick,setEditNick]=useState(false);
  const [nick,setNick]=useState(user.nickname||user.name||'');
  const fileRef=useRef(null);
  const handleImgChange=e=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>onUpdate({avatar:ev.target.result});
    reader.readAsDataURL(file);
    e.target.value='';
  };
  const saveNick=()=>{if(nick.trim()&&nick.trim()!==user.nickname){onUpdate({nickname:nick.trim()});}setEditNick(false);};
  const INFO=[['이름',user.name],['이메일',user.email],['플랜',isProUser ? '⚡️ Pro':'무료'],['가입일',fmtFull((user.createdAt||'').split('T')[0]||'')]];
  return (
    <div style={{padding:'32px 24px',height:'100%',overflowY:'auto'}}>
      <div className="fu" style={{textAlign:'center',marginBottom:32}}>
        <div style={{position:'relative',display:'inline-block',marginBottom:16}}>
          <div style={{width:88,height:88,borderRadius:'50%',background:'linear-gradient(135deg,'+cfg.c+','+cfg.d+')',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,color:'white',fontWeight:900,margin:'0 auto',overflow:'hidden'}}>
            {user.avatar ? <img src={user.avatar} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : (user.nickname||user.name||'?')[0]}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImgChange} style={{display:'none'}}/>
          <button onClick={()=>{if(fileRef.current)fileRef.current.click();}} style={{position:'absolute',bottom:0,right:0,width:28,height:28,borderRadius:'50%',background:cfg.c,border:'2px solid white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:13}}>📷</button>
        </div>
        {editNick ? (
          <div style={{display:'flex',gap:8,justifyContent:'center'}}>
            <input value={nick} onChange={e=>setNick(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveNick()} style={{padding:'8px 12px',fontSize:18,fontWeight:800,border:'2px solid '+cfg.c,borderRadius:10,textAlign:'center',width:160}} autoFocus/>
            <button onClick={saveNick} style={{padding:'8px 14px',borderRadius:10,border:'none',background:cfg.c,color:'white',fontWeight:700,cursor:'pointer'}}>저장</button>
          </div>
        ) : (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <div style={{fontSize:22,fontWeight:900,color:'#111827'}}>{user.nickname||user.name}</div>
            <button onClick={()=>setEditNick(true)} style={{background:'none',border:'none',color:'#9CA3AF',cursor:'pointer',fontSize:14}}>✏️</button>
          </div>
        )}
        {!isProUser&&<button onClick={onShowPro} style={{marginTop:12,padding:'8px 20px',borderRadius:99,border:'none',background:'linear-gradient(135deg,#F59E0B,#D97706)',color:'white',fontSize:13,fontWeight:700,cursor:'pointer'}}>⚡️ Pro 업그레이드</button>}
      </div>
      <div style={{background:'white',borderRadius:16,border:'1px solid #F3F4F6',overflow:'hidden',marginBottom:16}}>
        {INFO.map(([label,val],i)=>(
          <div key={label} style={{display:'flex',padding:'14px 18px',borderBottom:i<INFO.length-1 ? '1px solid #F9FAFB':'none'}}>
            <div style={{fontSize:13,fontWeight:600,color:'#9CA3AF',width:80,flexShrink:0}}>{label}</div>
            <div style={{fontSize:14,fontWeight:700,color:'#111827'}}>{val||'-'}</div>
          </div>
        ))}
      </div>
      <button onClick={onLogout} style={{width:'100%',padding:'13px',borderRadius:12,border:'1.5px solid #E5E7EB',background:'white',color:'#374151',fontSize:14,fontWeight:700,cursor:'pointer',marginBottom:10}}>로그아웃</button>
      <button onClick={()=>{if(window.confirm('정말 탈퇴하시겠어요? 모든 데이터가 삭제돼요.'))onDeleteAccount();}} style={{width:'100%',padding:'13px',borderRadius:12,border:'1.5px solid #FECACA',background:'#FEF2F2',color:'#EF4444',fontSize:14,fontWeight:700,cursor:'pointer'}}>회원 탈퇴</button>
    </div>
  );
}


function SearchOverlay({ todos, events, goals, habits, exams, journals, onClose, onNavigate }) {
  const cfg = WS.personal;
  const [q, setQ] = useState('');
  const inputRef = useRef(null);

  useEffect(function() {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  var results = [];
  if (q.trim().length > 0) {
    var kw = q.trim().toLowerCase();

    todos.forEach(function(t) {
      if (t.title.toLowerCase().includes(kw) || (t.notes && t.notes.toLowerCase().includes(kw))) {
        results.push({ type:'todo', icon:'✅', label:t.title, sub:t.status==='done' ? '완료' : t.dueDate ? '마감 '+t.dueDate : '할일', screen:'todo', item:t });
      }
    });
    events.forEach(function(e) {
      if (e.title.toLowerCase().includes(kw)) {
        results.push({ type:'event', icon:'📅', label:e.title, sub:e.date+(e.time ? ' '+e.time : ''), screen:'cal', item:e });
      }
    });
    exams.forEach(function(e) {
      if (e.subject.toLowerCase().includes(kw) || (e.memo && e.memo.toLowerCase().includes(kw))) {
        var d = Math.ceil((new Date(e.date+'T00:00:00')-new Date().setHours(0,0,0,0))/86400000);
        results.push({ type:'exam', icon:'📋', label:e.subject, sub:e.type+' · '+(d>=0 ? 'D-'+d : '종료'), screen:'exam', item:e });
      }
    });
    goals.forEach(function(g) {
      if (g.title.toLowerCase().includes(kw)) {
        results.push({ type:'goal', icon:'🎯', label:g.title, sub:'진행률 '+g.progress+'%', screen:'goals', item:g });
      }
    });
    habits.forEach(function(h) {
      if (h.name.toLowerCase().includes(kw)) {
        results.push({ type:'habit', icon:h.icon||'🔥', label:h.name, sub:'습관', screen:'habits', item:h });
      }
    });
    journals.forEach(function(j) {
      if (j.title.toLowerCase().includes(kw) || (j.content && j.content.toLowerCase().includes(kw))) {
        results.push({ type:'jour', icon:'📖', label:j.title, sub:j.date, screen:'jour', item:j });
      }
    });
  }

  var TYPE_LABELS = { todo:'할일', event:'일정', exam:'시험', goal:'목표', habit:'습관', jour:'일기' };
  var TYPE_COLORS = { todo:'#2563EB', event:'#059669', exam:'#DC2626', goal:'#7C3AED', habit:'#D97706', jour:'#0891B2' };

  return (
    <div onClick={function(e){if(e.target===e.currentTarget)onClose();}} style={{ position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,.5)',backdropFilter:'blur(4px)',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'60px 20px 20px' }}>
      <div className="pp" style={{ background:'white',borderRadius:20,width:'100%',maxWidth:580,boxShadow:'0 24px 64px rgba(0,0,0,.2)',overflow:'hidden' }}>
        {/* 검색창 */}
        <div style={{ display:'flex',alignItems:'center',gap:12,padding:'16px 18px',borderBottom:'1px solid #F3F4F6' }}>
          <span style={{ fontSize:18,color:'#9CA3AF' }}>🔍</span>
          <input
            ref={inputRef}
            value={q}
            onChange={function(e){setQ(e.target.value);}}
            placeholder="할일, 일정, 목표, 시험, 습관, 일기 검색..."
            style={{ flex:1,fontSize:16,border:'none',outline:'none',fontFamily:'inherit',color:'#111827' }}
          />
          {q && <button onClick={function(){setQ('');inputRef.current&&inputRef.current.focus();}} style={{ background:'none',border:'none',color:'#9CA3AF',cursor:'pointer',fontSize:18 }}>✕</button>}
          <button onClick={onClose} style={{ background:'#F3F4F6',border:'none',borderRadius:8,padding:'5px 10px',fontSize:12,color:'#6B7280',cursor:'pointer' }}>ESC</button>
        </div>

        {/* 결과 */}
        <div style={{ maxHeight:400,overflowY:'auto' }}>
          {q.trim().length === 0 && (
            <div style={{ padding:'40px 20px',textAlign:'center',color:'#9CA3AF' }}>
              <div style={{ fontSize:32,marginBottom:10 }}>🔍</div>
              <div style={{ fontSize:14,fontWeight:600 }}>검색어를 입력하세요</div>
              <div style={{ fontSize:12,marginTop:6 }}>할일, 일정, 목표, 시험, 습관, 일기를 한번에 검색해요</div>
            </div>
          )}
          {q.trim().length > 0 && results.length === 0 && (
            <div style={{ padding:'40px 20px',textAlign:'center',color:'#9CA3AF' }}>
              <div style={{ fontSize:32,marginBottom:10 }}>😅</div>
              <div style={{ fontSize:14,fontWeight:600 }}>"{q}"에 대한 결과가 없어요</div>
            </div>
          )}
          {results.map(function(r, i) {
            return (
              <button key={i} onClick={function(){onNavigate(r.screen);onClose();}}
                style={{ width:'100%',padding:'12px 18px',border:'none',background:'none',display:'flex',alignItems:'center',gap:12,cursor:'pointer',textAlign:'left',borderBottom:'1px solid #F9FAFB' }}
                onMouseEnter={function(e){e.currentTarget.style.background='#F9FAFB';}}
                onMouseLeave={function(e){e.currentTarget.style.background='none';}}>
                <div style={{ width:36,height:36,borderRadius:10,background:(TYPE_COLORS[r.type]||cfg.c)+'18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>
                  {r.icon}
                </div>
                <div style={{ flex:1,overflow:'hidden' }}>
                  <div style={{ fontSize:14,fontWeight:700,color:'#111827',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize:12,color:'#9CA3AF',marginTop:2 }}>{r.sub}</div>
                </div>
                <span style={{ fontSize:11,fontWeight:700,color:TYPE_COLORS[r.type]||cfg.c,background:(TYPE_COLORS[r.type]||cfg.c)+'18',padding:'3px 8px',borderRadius:99,flexShrink:0 }}>
                  {TYPE_LABELS[r.type]||r.type}
                </span>
              </button>
            );
          })}
          {results.length > 0 && (
            <div style={{ padding:'10px 18px',fontSize:11,color:'#9CA3AF',textAlign:'right' }}>
              {results.length}개 결과
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AIChatScreen({ user, todos, events, goals, habits, grades, journals, timeLogs, spaces }) {
  const cfg = WS.personal;
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
        model: 'claude-sonnet-4-6',
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
    school:   ['오늘 할일 정리해줘', '이번 주 시험 준비 계획 짜줘', '집중해야 할 과제가 뭐야 ? ', '성적 올리는 방법 알려줘'],
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
              <button key={t.id} onClick={() => setSelTheme(t.id)} style={{ padding:'14px 10px',borderRadius:16,border:`2.5px solid ${active?((t.preview&&t.preview[2])||'#2563EB'):'transparent'}`,background:t.sidebarBg,cursor:'pointer',textAlign:'center',boxShadow:active ? '0 4px 16px rgba(0,0,0,.12)':'0 2px 6px rgba(0,0,0,.06)',transition:'all .2s',position:'relative' }}>
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
              <button key={s.id} onClick={() => setSelIcons(s.id)} style={{ padding:'16px 10px',borderRadius:16,border:`2.5px solid ${active ? '#2563EB':'#F3F4F6'}`,background:active ? '#EFF6FF':'white',cursor:'pointer',textAlign:'center',transition:'all .2s',boxShadow:active ? '0 4px 12px rgba(37,99,235,.15)':'none' }}>
                <div style={{ fontSize:26,marginBottom:6 }}>{s.preview}</div>
                <div style={{ fontSize:13,fontWeight:700,color:active ? '#2563EB':'#374151' }}>{s.name}</div>
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
  const cfg = WS.personal;
  const [screen, setScreen] = useState('home');
  const [showPro, setShowPro] = useState(false);
  const [showProGate, setShowProGate] = useState(false); // 무료 유저가 협업 클릭 시
  const [showSearch, setShowSearch] = useState(false);
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
  const [exams, setExamsRaw] = useState(() => ld(`wl_exams_${user.id}`, []));

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
  const setExams = (v) => { const val=typeof v==='function'?v(exams):v; setExamsRaw(val); sv(`wl_exams_${user.id}`,val); };
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

  // 3) 폴링 백업 (1초): 협업 실시간 동기화
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifsRaw(ld('wl_notifs_' + user.id, []));
      setSpacesRaw(ld('wl_spaces', []));
    }, 1000);
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
      case 'todo':     return <TodoScreen todos={todos} setTodos={setTodos} wsType='personal' />;
      case 'exam':     return <ExamScreen exams={exams} setExams={setExams} />;
      case 'cal':      return <CalendarScreen events={events} setEvents={setEvents} wsType={user.wsType} />;
      case 'jour':     return <JournalScreen journals={journals} setJournals={setJournals} />;
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
    <div style={{ display:'flex',height:'100vh',background:DK.pageBg||'#F8FAFC',transition:'background .3s,color .3s' }}>
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
                display:'flex',alignItems:'center',gap:10,padding:sidebarOpen ? '10px 12px':'10px',borderRadius:10,border:'none',
                background:active?(themeObj.navActiveBg||cfg.l):'transparent',
                color:active?(themeObj.navTextActive||cfg.c):isLocked?(themeObj.navTextColor||'#9CA3AF'):(themeObj.navTextColor||'#6B7280'),
                fontWeight:active?800:600,fontSize:14,cursor:'pointer',transition:'all .12s',whiteSpace:'nowrap',
                justifyContent:sidebarOpen ? 'flex-start':'center',position:'relative',
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
            <button onClick={() => setShowPro(true)} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,border:'none',background:isDark ? '#2D2200':'#FFFBEB',color:'#D97706',fontWeight:700,fontSize:13,cursor:'pointer',marginTop:8 }}>
              <span style={{ fontSize:17 }}>⚡️</span>Pro 업그레이드
            </button>
          )}
        </nav>
        {/* 사이드바 접기 */}
        <button onClick={() => setSidebarOpen(s=>!s)} style={{ padding:'14px',border:'none',background:'none',color:'#9CA3AF',cursor:'pointer',fontSize:18,borderTop:'1px solid #F9FAFB',display:'flex',alignItems:'center',justifyContent:sidebarOpen ? 'flex-end':'center',gap:8 }}>
          {sidebarOpen ? '☰':'☰'}
        </button>
      </div>

      {/* ── 메인 콘텐츠 ── */}
      <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:DK.pageBg||themeObj.pageBg }}>
        {/* 탑바 */}
        <div style={{ height:52,flexShrink:0,background:DK.headerBg||themeObj.cardBg||'white',borderBottom:'1px solid '+(DK.headerBorder||themeObj.sidebarBorder||'#F3F4F6'),display:'flex',alignItems:'center',padding:'0 20px',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10,flex:1,overflow:'hidden' }}>
            <div style={{ fontSize:13,fontWeight:600,color:DK.textSecondary||'#9CA3AF',flexShrink:0 }}>
              {(navItems.find(n=>n.id===screen)||{n:'홈'}).n}
            </div>
            {/* D-day 배지 + 오늘 이벤트 배지 */}
            <div style={{ display:'flex',gap:5,overflow:'hidden' }}>
              {exams.filter(e=>{
                var t=new Date();t.setHours(0,0,0,0);
                return t<=new Date(e.date+'T00:00:00');
              }).map(e=>{
                var t=new Date();t.setHours(0,0,0,0);
                var d=Math.ceil((new Date(e.date+'T00:00:00')-t)/ 86400000);
                return <span key={e.id} onClick={()=>setScreen('exam')} style={{ flexShrink:0,fontSize:11,fontWeight:800,color:d===0 ? '#DC2626':d<=3 ? '#D97706':'#4F46E5',background:d===0 ? '#FEF2F2':d<=3 ? '#FFFBEB':'#EEF2FF',padding:'3px 9px',borderRadius:99,cursor:'pointer',whiteSpace:'nowrap' }}>
                  📋 {e.subject} {d===0 ? 'D-Day!' : 'D-'+d}
                </span>;
              })}
              {events.filter(ev=>ev.date===new Date().toISOString().split('T')[0]).map(ev=>(
                <span key={ev.id} onClick={()=>setScreen('cal')} style={{ flexShrink:0,fontSize:11,fontWeight:700,color:'white',background:ev.color||cfg.c,padding:'3px 9px',borderRadius:99,cursor:'pointer',whiteSpace:'nowrap',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis' }}>
                  📅 {ev.title}{ev.time ? ' '+ev.time : ''}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            {isProUser&&<Badge color={cfg.d} bg={cfg.l}>✨ Pro</Badge>}
            {/* 검색 버튼 */}
            <button onClick={function(){setShowSearch(true);}} title="전체 검색" style={{ width:36,height:36,borderRadius:10,border:'1.5px solid '+(DK.headerBorder||'#F3F4F6'),background:DK.headerBg||'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17 }}>
              🔍
            </button>
            {/* 다크모드 토글 */}
            <button onClick={()=>updateUser({darkMode:!isDark})} title={isDark ? '라이트 모드':'다크 모드'} style={{ width:36,height:36,borderRadius:10,border:'1.5px solid '+(DK.headerBorder||'#F3F4F6'),background:isDark ? '#334155':'#F9FAFB',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,transition:'all .2s' }}>
              {isDark ? '☀️':'🌙'}
            </button>
            {/* 알림 벨 버튼 */}
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

      {/* ── Pro 게이트 모달 ── */}
      {showProGate&&(
        <ProGateModal
          onClose={() => setShowProGate(false)}
          onUpgrade={() => { setShowProGate(false); setShowPro(true); }}
        />
      )}
      {/* ── 전체 검색 오버레이 ── */}
      {showSearch&&(
        <SearchOverlay
          todos={todos} events={events} goals={goals}
          habits={habits} exams={exams} journals={journals}
          onClose={() => setShowSearch(false)}
          onNavigate={(screen) => setScreen(screen)}
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

  // pending invite 확인 (로그인/가입 시)
  const checkPendingInvites = (userId, userEmail, userName) => {
    const key = 'wl_pending_' + userEmail.toLowerCase();
    const pending = ld(key, []);
    if (!pending.length) return;
    const existing = ld('wl_notifs_' + userId, []);
    const newNotifs = pending.map(p => ({
      id: uid(), type: 'invite',
      fromId: p.fromId, fromName: p.fromName,
      spaceId: p.spaceId, spaceName: p.spaceName,
      inviteCode: p.inviteCode, requiresCode: true,
      status: 'pending', read: false,
      createdAt: p.sentAt || new Date().toISOString(),
    }));
    sv('wl_notifs_' + userId, [...existing, ...newNotifs]);
    try { localStorage.removeItem(key); } catch {}
  };

  const handleAuth = (acct) => {
    setUser(acct);
    setAccounts(prev => {
      const exists = prev.find(a => a.id === acct.id);
      if (exists) return prev.map(a => a.id === acct.id ? acct : a);
      return [...prev, acct];
    });
    checkPendingInvites(acct.id, acct.email, acct.nickname||acct.name);
  };

  const handleRegister = (acct) => setAccounts(prev => [...prev, acct]);

  const handleOnboardingDone = ({ nickname, wsType }) => {
    const updated = { ...user, nickname, wsType };
    setUser(updated);
    setAccounts(prev => prev.map(a => a.id === user.id ? { ...a, nickname, wsType } : a));
    checkPendingInvites(user.id, user.email, nickname||user.name);
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