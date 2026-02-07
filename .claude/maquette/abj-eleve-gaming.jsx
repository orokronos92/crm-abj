import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// ABJ PORTAIL ÉLÈVE — GAMING / SCI-FI EDITION
// Académie de Bijouterie Joaillerie
// Accent: Cyan néon (#00f0ff) + fond ultra-dark
// ═══════════════════════════════════════════════════════════════

// --- ICONS (Lucide-style inline SVGs) ---
const Icon = ({ d, size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{typeof d === "string" ? <path d={d} /> : d}</svg>
);
const Icons = {
  dashboard: <Icon d={<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>} />,
  notes: <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
  calendar: <Icon d={<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>} />,
  book: <Icon d={<><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>} />,
  chat: <Icon d={<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>} />,
  user: <Icon d={<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>} />,
  bell: <Icon d={<><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>} />,
  chevron: <Icon d="M9 18l6-6-6-6" />,
  star: <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  trophy: <Icon d={<><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></>} />,
  gem: <Icon d={<><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3l1 10"/><path d="M2 9h20"/><path d="M7 3l-1.5 6"/><path d="M17 3l1.5 6"/></>} />,
  clock: <Icon d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />,
  check: <Icon d="M20 6L9 17l-5-5" />,
  alert: <Icon d={<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>} />,
  fire: <Icon d={<><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></>} />,
  zap: <Icon d={<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>} />,
  target: <Icon d={<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>} />,
};

// --- THEME ---
const c = {
  bg: "#080c14",
  bgCard: "#0d1520",
  bgCardHover: "#111d2e",
  bgSurface: "#0a1018",
  accent: "#00f0ff",
  accentDim: "rgba(0,240,255,0.12)",
  accentGlow: "rgba(0,240,255,0.25)",
  accentBright: "#40f8ff",
  gold: "#fbbf24",
  goldDim: "rgba(251,191,36,0.12)",
  green: "#34d399",
  greenDim: "rgba(52,211,153,0.12)",
  red: "#f87171",
  redDim: "rgba(248,113,113,0.12)",
  purple: "#a78bfa",
  purpleDim: "rgba(167,139,250,0.12)",
  border: "rgba(0,240,255,0.08)",
  borderGlow: "rgba(0,240,255,0.2)",
  text: "#e2e8f0",
  textSec: "#64748b",
  textDim: "#475569",
  nav: "#060a10",
};

// --- ANIMATED BACKGROUND GRID ---
const GridBg = () => (
  <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: `linear-gradient(${c.borderGlow} 1px, transparent 1px), linear-gradient(90deg, ${c.borderGlow} 1px, transparent 1px)`,
      backgroundSize: "60px 60px",
      opacity: 0.06,
      animation: "gridScroll 25s linear infinite",
    }} />
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 20% 50%, ${c.accentDim} 0%, transparent 60%)` }} />
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 80% 20%, rgba(167,139,250,0.04) 0%, transparent 50%)` }} />
    <style>{`@keyframes gridScroll { from { transform: translate(0,0); } to { transform: translate(60px,60px); } }`}</style>
  </div>
);

// --- GLOW BORDER CARD ---
const GlowCard = ({ children, style, accent = c.accent, glowIntensity = 0.12, hover = true, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: hovered ? c.bgCardHover : c.bgCard,
        border: `1px solid ${hovered ? accent : c.border}`,
        borderRadius: 10,
        padding: 20,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
        boxShadow: hovered ? `0 0 25px ${accent}22, inset 0 0 30px ${accent}05` : `0 0 0 transparent`,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {/* Top glow line */}
      <div style={{
        position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
        background: `linear-gradient(90deg, transparent, ${accent}${hovered ? "80" : "30"}, transparent)`,
        transition: "all 0.35s ease",
      }} />
      {children}
    </div>
  );
};

// --- NEON PROGRESS BAR ---
const NeonBar = ({ value, max = 100, color = c.accent, height = 6, label }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      {label && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: c.textSec }}>{label}</span>
        <span style={{ fontSize: 11, color, fontFamily: "'Orbitron', monospace", fontWeight: 700 }}>{Math.round(pct)}%</span>
      </div>}
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 99, height, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 99,
          background: `linear-gradient(90deg, ${color}90, ${color})`,
          boxShadow: `0 0 12px ${color}50, 0 0 4px ${color}30`,
          transition: "width 1s cubic-bezier(.4,0,.2,1)",
        }} />
      </div>
    </div>
  );
};

// --- STAT HUD CARD ---
const StatHUD = ({ icon, label, value, sub, accent = c.accent }) => (
  <GlowCard accent={accent} style={{ padding: 16, flex: 1, minWidth: 155 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8,
        background: `${accent}14`, border: `1px solid ${accent}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 10px ${accent}15`,
      }}>
        <div style={{ color: accent }}>{icon}</div>
      </div>
      <span style={{ fontSize: 11, color: c.textSec, textTransform: "uppercase", letterSpacing: 1.2, fontFamily: "'Orbitron', monospace" }}>{label}</span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color: c.text, fontFamily: "'Orbitron', monospace", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: c.textSec, marginTop: 4 }}>{sub}</div>}
  </GlowCard>
);

// --- SCORE BADGE ---
const ScoreBadge = ({ score, size = 28 }) => {
  const col = score >= 16 ? c.green : score >= 12 ? c.accent : score >= 8 ? c.gold : c.red;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: 6,
      background: `${col}18`, border: `1px solid ${col}40`,
      color: col, fontSize: 12, fontWeight: 800,
      fontFamily: "'Orbitron', monospace",
      boxShadow: `0 0 8px ${col}20`,
    }}>{score}</span>
  );
};

// --- MARJORIE CHAT (mini floating) ---
const MarjorieChat = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { from: "bot", text: "Salut ! Je suis Marjorie, ton assistante IA. Comment je peux t'aider aujourd'hui ? 💎" }
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    setMsgs(p => [...p, { from: "user", text: input }]);
    setInput("");
    setTimeout(() => {
      setMsgs(p => [...p, { from: "bot", text: "Je vérifie ton dossier... Tu es bien inscrit(e) en Session Sertissage 2025. Tes prochaines évaluations arrivent dans 12 jours. Besoin d'autre chose ?" }]);
    }, 1200);
  };

  if (!open) return (
    <div onClick={() => setOpen(true)} style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 999,
      width: 56, height: 56, borderRadius: "50%",
      background: `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", boxShadow: `0 0 30px ${c.accent}40, 0 0 60px ${c.accent}15`,
      animation: "chatPulse 2.5s ease-in-out infinite",
    }}>
      <span style={{ fontSize: 24 }}>💎</span>
      <style>{`@keyframes chatPulse { 0%,100% { box-shadow: 0 0 20px ${c.accent}30; } 50% { box-shadow: 0 0 40px ${c.accent}50, 0 0 80px ${c.accent}20; } }`}</style>
    </div>
  );

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 999,
      width: 360, height: 460, borderRadius: 16,
      background: c.bgCard, border: `1px solid ${c.borderGlow}`,
      display: "flex", flexDirection: "column",
      boxShadow: `0 0 40px ${c.accent}15, 0 8px 32px rgba(0,0,0,0.6)`,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: `linear-gradient(90deg, ${c.accent}12, ${c.purple}08)`,
        borderBottom: `1px solid ${c.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>💎</div>
          <div>
            <div style={{ color: c.text, fontWeight: 700, fontSize: 13, fontFamily: "'Orbitron', monospace" }}>MARJORIE</div>
            <div style={{ fontSize: 10, color: c.green }}>● En ligne</div>
          </div>
        </div>
        <div onClick={() => setOpen(false)} style={{ cursor: "pointer", color: c.textSec, fontSize: 18, padding: 4 }}>✕</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%", padding: "10px 14px", borderRadius: 12,
              background: m.from === "user" ? `linear-gradient(135deg, ${c.accent}25, ${c.purple}15)` : "rgba(255,255,255,0.04)",
              border: `1px solid ${m.from === "user" ? c.accent + "30" : c.border}`,
              color: c.text, fontSize: 13, lineHeight: 1.5,
            }}>{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: 12, borderTop: `1px solid ${c.border}`, display: "flex", gap: 8 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Pose ta question..."
          style={{
            flex: 1, background: "rgba(255,255,255,0.04)", border: `1px solid ${c.border}`,
            borderRadius: 8, padding: "8px 12px", color: c.text, fontSize: 13, outline: "none",
          }}
        />
        <button onClick={send} style={{
          background: `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
          border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer",
          color: "#000", fontWeight: 700, fontSize: 13,
        }}>→</button>
      </div>
    </div>
  );
};

// --- ELEVE DATA ---
const ELEVE = {
  prenom: "Léa", nom: "DUMONT", session: "Sertissage Haute Joaillerie", promo: "2025-A",
  numero: "DULE20020315", email: "lea.dumont@email.com", tel: "06 12 34 56 78",
  dateNaissance: "15/03/2002", adresse: "12 rue des Arts, 75003 Paris",
  dateDebut: "06/01/2025", dateFin: "20/12/2025",
  heuresTotal: 1200, heuresFaites: 468, absences: 2, retards: 1,
  moyenneGlobale: 15.2, rang: 3, totalEleves: 14,
};

const MATIERES = [
  { nom: "Sertissage Griffes", coef: 4, notes: [16, 14.5, 17, 15], moy: 15.6, formateur: "M. Blanchard" },
  { nom: "Sertissage Clos", coef: 3, notes: [14, 15, 13.5], moy: 14.2, formateur: "M. Blanchard" },
  { nom: "Dessin Technique", coef: 2, notes: [17, 18, 16.5], moy: 17.2, formateur: "Mme. Roux" },
  { nom: "Histoire Bijouterie", coef: 1, notes: [13, 14], moy: 13.5, formateur: "M. Laurent" },
  { nom: "Gemmologie", coef: 2, notes: [16, 15.5, 14], moy: 15.2, formateur: "Mme. Chen" },
  { nom: "Atelier Pratique", coef: 5, notes: [15, 16, 14.5, 15.5], moy: 15.3, formateur: "M. Blanchard" },
];

const PLANNING = [
  { jour: "Lun", matin: "Sertissage Griffes", apresmidi: "Atelier Pratique", salle: "A1" },
  { jour: "Mar", matin: "Dessin Technique", apresmidi: "Gemmologie", salle: "B2" },
  { jour: "Mer", matin: "Sertissage Clos", apresmidi: "—", salle: "A1" },
  { jour: "Jeu", matin: "Histoire Bijouterie", apresmidi: "Atelier Pratique", salle: "C1" },
  { jour: "Ven", matin: "Atelier Pratique", apresmidi: "Atelier Pratique", salle: "A1" },
];

const EVALUATIONS = [
  { matiere: "Sertissage Griffes", type: "Pratique", date: "17/02/2025", salle: "A1", duree: "3h" },
  { matiere: "Gemmologie", type: "Écrit", date: "21/02/2025", salle: "B2", duree: "2h" },
  { matiere: "Dessin Technique", type: "Projet", date: "28/02/2025", salle: "B2", duree: "4h" },
];

const DOCS = [
  { nom: "Règlement intérieur 2025", type: "PDF", date: "06/01/2025" },
  { nom: "Programme Sertissage HJ", type: "PDF", date: "06/01/2025" },
  { nom: "Livret d'accueil", type: "PDF", date: "06/01/2025" },
  { nom: "Relevé de notes - T1", type: "PDF", date: "31/01/2025" },
  { nom: "Attestation de présence", type: "PDF", date: "15/01/2025" },
];

const ALERTS = [
  { type: "eval", text: "Évaluation Sertissage Griffes dans 12 jours", icon: Icons.target },
  { type: "info", text: "Nouveau document disponible : Relevé T1", icon: Icons.book },
];

// ═══════ NAVIGATION ═══════
const NAV_ITEMS = [
  { id: "dashboard", label: "DASHBOARD", icon: Icons.dashboard },
  { id: "notes", label: "MES NOTES", icon: Icons.notes },
  { id: "planning", label: "PLANNING", icon: Icons.calendar },
  { id: "docs", label: "DOCUMENTS", icon: Icons.book },
  { id: "profil", label: "MON PROFIL", icon: Icons.user },
];

// ═══════ VIEWS ═══════

const DashboardView = () => {
  const progressPct = Math.round((ELEVE.heuresFaites / ELEVE.heuresTotal) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Welcome Banner */}
      <GlowCard accent={c.accent} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          padding: "28px 28px", position: "relative",
          background: `linear-gradient(135deg, ${c.accent}08, ${c.purple}06, transparent)`,
        }}>
          <div style={{
            position: "absolute", top: -40, right: -20, width: 180, height: 180,
            background: `radial-gradient(circle, ${c.accent}08, transparent 70%)`,
            borderRadius: "50%",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 11, color: c.accent, fontFamily: "'Orbitron', monospace", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>
              ● Système Élève Connecté
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: c.text, marginBottom: 4 }}>
              Bienvenue, <span style={{ color: c.accent }}>{ELEVE.prenom}</span>
            </div>
            <div style={{ fontSize: 13, color: c.textSec }}>
              {ELEVE.session} — Promo {ELEVE.promo} — Rang #{ELEVE.rang}/{ELEVE.totalEleves}
            </div>
          </div>
        </div>
      </GlowCard>

      {/* Alerts */}
      {ALERTS.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ALERTS.map((a, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
              background: a.type === "eval" ? c.goldDim : c.accentDim,
              border: `1px solid ${a.type === "eval" ? c.gold + "30" : c.accent + "20"}`,
              borderRadius: 8, fontSize: 13, color: c.text,
            }}>
              <div style={{ color: a.type === "eval" ? c.gold : c.accent }}>{a.icon}</div>
              {a.text}
            </div>
          ))}
        </div>
      )}

      {/* Stats HUD */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatHUD icon={Icons.star} label="MOYENNE" value={ELEVE.moyenneGlobale.toFixed(1)} sub={`Rang #${ELEVE.rang}/${ELEVE.totalEleves}`} accent={c.gold} />
        <StatHUD icon={Icons.clock} label="HEURES" value={ELEVE.heuresFaites} sub={`/ ${ELEVE.heuresTotal}h total`} accent={c.accent} />
        <StatHUD icon={Icons.alert} label="ABSENCES" value={ELEVE.absences} sub={`${ELEVE.retards} retard(s)`} accent={ELEVE.absences > 3 ? c.red : c.green} />
        <StatHUD icon={Icons.target} label="ÉVAL." value={EVALUATIONS.length} sub="à venir" accent={c.purple} />
      </div>

      {/* Progression */}
      <GlowCard accent={c.accent}>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: c.accent, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>
          ◆ Progression Formation
        </div>
        <NeonBar value={ELEVE.heuresFaites} max={ELEVE.heuresTotal} color={c.accent} height={10} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: c.textSec }}>
          <span>{ELEVE.heuresFaites}h effectuées</span>
          <span style={{ color: c.accent, fontFamily: "'Orbitron', monospace", fontWeight: 700 }}>{progressPct}%</span>
          <span>{ELEVE.heuresTotal - ELEVE.heuresFaites}h restantes</span>
        </div>
      </GlowCard>

      {/* Notes aperçu + Planning */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {/* Best/Worst */}
        <GlowCard accent={c.green} style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: c.green, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>
            ◆ Meilleures matières
          </div>
          {[...MATIERES].sort((a, b) => b.moy - a.moy).slice(0, 3).map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? `1px solid ${c.border}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: c.gold, fontSize: 14 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                <span style={{ color: c.text, fontSize: 13 }}>{m.nom}</span>
              </div>
              <ScoreBadge score={m.moy} />
            </div>
          ))}
        </GlowCard>

        {/* Prochaines évals */}
        <GlowCard accent={c.purple} style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: c.purple, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>
            ◆ Prochaines Évaluations
          </div>
          {EVALUATIONS.map((ev, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < EVALUATIONS.length - 1 ? `1px solid ${c.border}` : "none" }}>
              <div>
                <div style={{ color: c.text, fontSize: 13, fontWeight: 600 }}>{ev.matiere}</div>
                <div style={{ color: c.textSec, fontSize: 11 }}>{ev.type} — {ev.duree} — Salle {ev.salle}</div>
              </div>
              <span style={{
                background: c.purpleDim, border: `1px solid ${c.purple}30`, borderRadius: 6,
                padding: "4px 10px", fontSize: 11, color: c.purple, fontFamily: "'Orbitron', monospace", fontWeight: 700,
              }}>{ev.date}</span>
            </div>
          ))}
        </GlowCard>
      </div>
    </div>
  );
};

const NotesView = () => {
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: c.accent, letterSpacing: 2, textTransform: "uppercase" }}>
        ◆ Relevé de Notes — {ELEVE.session}
      </div>
      {MATIERES.map((m, i) => (
        <GlowCard key={i} accent={m.moy >= 16 ? c.green : m.moy >= 12 ? c.accent : c.gold} onClick={() => setExpanded(expanded === i ? null : i)} style={{ cursor: "pointer", padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ color: c.text, fontSize: 14, fontWeight: 700 }}>{m.nom}</span>
                <span style={{ fontSize: 10, color: c.textSec, background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 4 }}>Coef {m.coef}</span>
              </div>
              <div style={{ fontSize: 11, color: c.textSec }}>{m.formateur}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ScoreBadge score={m.moy} size={36} />
              <div style={{ color: c.textDim, transform: expanded === i ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s ease" }}>{Icons.chevron}</div>
            </div>
          </div>
          <NeonBar value={m.moy} max={20} color={m.moy >= 16 ? c.green : m.moy >= 12 ? c.accent : c.gold} height={4} style={{ marginTop: 10 }} />

          {expanded === i && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${c.border}` }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 10, color: c.textSec, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>Détail des notes</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {m.notes.map((n, j) => (
                  <div key={j} style={{
                    background: "rgba(255,255,255,0.03)", border: `1px solid ${c.border}`, borderRadius: 8,
                    padding: "10px 16px", textAlign: "center", minWidth: 70,
                  }}>
                    <div style={{ fontSize: 10, color: c.textSec, marginBottom: 4 }}>Éval {j + 1}</div>
                    <ScoreBadge score={n} size={32} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlowCard>
      ))}

      {/* Summary */}
      <GlowCard accent={c.gold} style={{ background: `linear-gradient(135deg, ${c.bgCard}, ${c.goldDim})` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: c.gold, letterSpacing: 1.5, textTransform: "uppercase" }}>Moyenne Générale</div>
            <div style={{ fontSize: 11, color: c.textSec, marginTop: 4 }}>Coefficients pondérés — Rang #{ELEVE.rang}/{ELEVE.totalEleves}</div>
          </div>
          <div style={{
            fontSize: 36, fontWeight: 900, color: c.gold, fontFamily: "'Orbitron', monospace",
            textShadow: `0 0 20px ${c.gold}40, 0 0 40px ${c.gold}15`,
          }}>
            {ELEVE.moyenneGlobale.toFixed(1)}
          </div>
        </div>
      </GlowCard>
    </div>
  );
};

const PlanningView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: c.accent, letterSpacing: 2, textTransform: "uppercase" }}>
      ◆ Planning Hebdomadaire
    </div>
    {PLANNING.map((p, i) => (
      <GlowCard key={i} accent={c.accent} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex" }}>
          <div style={{
            width: 70, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: `linear-gradient(180deg, ${c.accent}15, ${c.accent}05)`,
            borderRight: `1px solid ${c.border}`, padding: "16px 0",
          }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 16, fontWeight: 900, color: c.accent }}>{p.jour}</div>
            <div style={{ fontSize: 10, color: c.textSec, marginTop: 2 }}>Salle {p.salle}</div>
          </div>
          <div style={{ flex: 1, padding: 16, display: "flex", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: c.textSec, fontFamily: "'Orbitron', monospace", letterSpacing: 1, marginBottom: 4 }}>09:00 — 12:30</div>
              <div style={{ color: c.text, fontSize: 13, fontWeight: 600 }}>{p.matin}</div>
            </div>
            <div style={{ width: 1, background: c.border }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: c.textSec, fontFamily: "'Orbitron', monospace", letterSpacing: 1, marginBottom: 4 }}>14:00 — 17:30</div>
              <div style={{ color: p.apresmidi === "—" ? c.textDim : c.text, fontSize: 13, fontWeight: 600 }}>{p.apresmidi}</div>
            </div>
          </div>
        </div>
      </GlowCard>
    ))}
  </div>
);

const DocsView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: c.accent, letterSpacing: 2, textTransform: "uppercase" }}>
      ◆ Documents & Ressources
    </div>
    {DOCS.map((d, i) => (
      <GlowCard key={i} accent={c.accent} style={{ padding: 14, cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 8,
              background: c.redDim, border: `1px solid ${c.red}25`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 900, color: c.red, fontFamily: "'Orbitron', monospace",
            }}>PDF</div>
            <div>
              <div style={{ color: c.text, fontSize: 13, fontWeight: 600 }}>{d.nom}</div>
              <div style={{ color: c.textSec, fontSize: 11 }}>Ajouté le {d.date}</div>
            </div>
          </div>
          <div style={{
            background: c.accentDim, border: `1px solid ${c.accent}25`, borderRadius: 6,
            padding: "6px 14px", fontSize: 11, color: c.accent, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Orbitron', monospace",
          }}>OUVRIR</div>
        </div>
      </GlowCard>
    ))}
  </div>
);

const ProfilView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: c.accent, letterSpacing: 2, textTransform: "uppercase" }}>
      ◆ Mon Profil
    </div>
    <GlowCard accent={c.accent}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
        <div style={{
          width: 70, height: 70, borderRadius: "50%",
          background: `linear-gradient(135deg, ${c.accent}30, ${c.purple}20)`,
          border: `2px solid ${c.accent}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, fontWeight: 900, color: c.accent, fontFamily: "'Orbitron', monospace",
          boxShadow: `0 0 25px ${c.accent}20`,
        }}>
          {ELEVE.prenom[0]}{ELEVE.nom[0]}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: c.text }}>{ELEVE.prenom} {ELEVE.nom}</div>
          <div style={{ fontSize: 12, color: c.accent, fontFamily: "'Orbitron', monospace" }}>N° {ELEVE.numero}</div>
          <div style={{ fontSize: 12, color: c.textSec, marginTop: 2 }}>{ELEVE.session} — {ELEVE.promo}</div>
        </div>
      </div>

      {[
        { label: "Email", value: ELEVE.email },
        { label: "Téléphone", value: ELEVE.tel },
        { label: "Date de naissance", value: ELEVE.dateNaissance },
        { label: "Adresse", value: ELEVE.adresse },
        { label: "Début formation", value: ELEVE.dateDebut },
        { label: "Fin formation", value: ELEVE.dateFin },
      ].map((f, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${c.border}` }}>
          <span style={{ fontSize: 12, color: c.textSec, fontFamily: "'Orbitron', monospace", letterSpacing: 0.5 }}>{f.label}</span>
          <span style={{ fontSize: 13, color: c.text, fontWeight: 500 }}>{f.value}</span>
        </div>
      ))}
    </GlowCard>
  </div>
);

// ═══════ MAIN APP ═══════
export default function ABJElevePortal() {
  const [view, setView] = useState("dashboard");

  const renderView = () => {
    switch (view) {
      case "dashboard": return <DashboardView />;
      case "notes": return <NotesView />;
      case "planning": return <PlanningView />;
      case "docs": return <DocsView />;
      case "profil": return <ProfilView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: c.bg, color: c.text, fontFamily: "'Segoe UI', -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>
      <GridBg />

      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* SIDEBAR */}
      <div style={{
        width: 220, background: c.nav, borderRight: `1px solid ${c.border}`,
        display: "flex", flexDirection: "column", position: "relative", zIndex: 10,
        boxShadow: `1px 0 20px rgba(0,0,0,0.5)`,
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 18px", borderBottom: `1px solid ${c.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, boxShadow: `0 0 15px ${c.accent}30`,
            }}>💎</div>
            <div>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 12, fontWeight: 900, color: c.accent, letterSpacing: 1 }}>ABJ</div>
              <div style={{ fontSize: 9, color: c.textSec, letterSpacing: 0.5 }}>PORTAIL ÉLÈVE</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(item => {
            const active = view === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setView(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                  background: active ? c.accentDim : "transparent",
                  border: `1px solid ${active ? c.accent + "25" : "transparent"}`,
                  transition: "all 0.2s ease",
                  boxShadow: active ? `0 0 12px ${c.accent}10` : "none",
                }}
              >
                <div style={{ color: active ? c.accent : c.textDim }}>{item.icon}</div>
                <span style={{
                  fontSize: 11, fontWeight: active ? 700 : 500,
                  color: active ? c.accent : c.textSec,
                  fontFamily: "'Orbitron', monospace", letterSpacing: 0.8,
                }}>{item.label}</span>
                {active && <div style={{
                  marginLeft: "auto", width: 4, height: 4, borderRadius: "50%",
                  background: c.accent, boxShadow: `0 0 8px ${c.accent}`,
                }} />}
              </div>
            );
          })}
        </div>

        {/* User card */}
        <div style={{ padding: "14px 14px", borderTop: `1px solid ${c.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: `linear-gradient(135deg, ${c.accent}30, ${c.purple}20)`,
              border: `1px solid ${c.accent}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, color: c.accent, fontFamily: "'Orbitron', monospace",
            }}>LD</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: c.text }}>{ELEVE.prenom} {ELEVE.nom}</div>
              <div style={{ fontSize: 10, color: c.textSec }}>{ELEVE.session.slice(0, 18)}...</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 10 }}>
        {/* Top bar */}
        <div style={{
          height: 56, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid ${c.border}`, background: `${c.nav}cc`, backdropFilter: "blur(12px)",
        }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 12, color: c.textSec, letterSpacing: 1 }}>
            {NAV_ITEMS.find(n => n.id === view)?.label}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              position: "relative", width: 34, height: 34, borderRadius: 8,
              background: "rgba(255,255,255,0.03)", border: `1px solid ${c.border}`,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <div style={{ color: c.textSec }}>{Icons.bell}</div>
              {ALERTS.length > 0 && <div style={{
                position: "absolute", top: -3, right: -3, width: 14, height: 14, borderRadius: "50%",
                background: c.red, fontSize: 9, fontWeight: 800, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{ALERTS.length}</div>}
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
          {renderView()}
        </div>
      </div>

      <MarjorieChat />
    </div>
  );
}
