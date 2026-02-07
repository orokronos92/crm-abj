import { useState, useEffect, useRef } from "react";
import {
  Search, FileText, DollarSign, Calendar, ChevronRight,
  Bell, User, Gem, Clock, CheckCircle, AlertCircle,
  XCircle, Send, Phone, MapPin, Star, X, Home,
  BookOpen, CreditCard, MessageSquare, School, Award,
  RefreshCw, TrendingUp, Hash, ClipboardList, FileCheck,
  Download, LogOut, BarChart3, Target
} from "lucide-react";

// ═══════════════════════════════════════════════
// ABJ CRM — Interface Élève
// Académie de Bijouterie Joaillerie
// ═══════════════════════════════════════════════

// ── MOCK : Élève connecté (Inès Garcia) ───────

const CURRENT_ELEVE = {
  id: 1,
  nom: "Garcia",
  prenom: "Inès",
  email: "ines.garcia@gmail.com",
  tel: "06 11 22 33 44",
  numero_dossier: "GAIN03051997",
  formation: "Sertissage N2",
  session: "Janvier 2026",
  formateur: "M. Laurent",
  salle: "Atelier B",
  statut: "EN_FORMATION",
  progression: 68,
  date_debut: "2026-01-13",
  date_fin: "2026-06-30",
  heures_effectuees: 204,
  heures_totales: 300,
  prochaine_eval: "2026-02-15",
  notes_moyennes: 15.2,
  absences: 1,
  retards: 2,
  financement: "OPCO",
  paiement_statut: "A_JOUR",
  evaluations: [
    { id: 1, date: "2026-01-27", type: "Pratique", matiere: "Serti griffe", note: 16, coeff: 3, commentaire: "Très bon travail sur le serti griffe. Maîtrise des proportions et régularité des griffes. Finitions à perfectionner sur les angles.", formateur: "M. Laurent" },
    { id: 2, date: "2026-02-03", type: "Théorique", matiere: "Gemmologie appliquée", note: 14.5, coeff: 2, commentaire: "Connaissances solides en identification des pierres. Quelques hésitations sur les traitements thermiques.", formateur: "M. Laurent" },
    { id: 3, date: "2026-01-20", type: "Pratique", matiere: "Serti clos", note: 15, coeff: 3, commentaire: "Bonne technique de base. La régularité du rebord peut encore être améliorée.", formateur: "M. Laurent" },
    { id: 4, date: "2026-02-10", type: "Pratique", matiere: "Serti rail", note: 15.5, coeff: 3, commentaire: "Progression notable. Alignement précis des pierres. Très prometteur.", formateur: "M. Laurent" },
  ],
  documents: [
    { type: "CV", statut: "VALIDE", date_depot: "2025-11-15" },
    { type: "Lettre de motivation", statut: "VALIDE", date_depot: "2025-11-15" },
    { type: "CNI", statut: "VALIDE", date_depot: "2025-11-20" },
    { type: "Diplômes", statut: "VALIDE", date_depot: "2025-11-22" },
    { type: "Attestation OPCO", statut: "VALIDE", date_depot: "2025-12-10" },
    { type: "Règlement intérieur signé", statut: "VALIDE", date_depot: "2026-01-13" },
    { type: "Fiche de sécurité atelier", statut: "VALIDE", date_depot: "2026-01-13" },
  ],
  planning: [
    { jour: "Lundi", horaire: "9h00 – 12h30", matiere: "Serti griffe (pratique)", salle: "Atelier B" },
    { jour: "Lundi", horaire: "14h00 – 17h30", matiere: "Serti clos (pratique)", salle: "Atelier B" },
    { jour: "Mardi", horaire: "9h00 – 12h30", matiere: "Gemmologie appliquée", salle: "Salle 2" },
    { jour: "Mardi", horaire: "14h00 – 17h30", matiere: "Dessin technique", salle: "Salle 3" },
    { jour: "Mercredi", horaire: "9h00 – 12h30", matiere: "Serti rail (pratique)", salle: "Atelier B" },
    { jour: "Mercredi", horaire: "14h00 – 16h00", matiere: "Travail personnel", salle: "Atelier B" },
    { jour: "Jeudi", horaire: "9h00 – 12h30", matiere: "Serti invisible (pratique)", salle: "Atelier B" },
    { jour: "Jeudi", horaire: "14h00 – 17h30", matiere: "Histoire de la joaillerie", salle: "Salle 1" },
    { jour: "Vendredi", horaire: "9h00 – 12h30", matiere: "Projet atelier", salle: "Atelier B" },
    { jour: "Vendredi", horaire: "14h00 – 16h00", matiere: "Bilan & accompagnement", salle: "Salle 2" },
  ],
  prochains_events: [
    { date: "2026-02-12", label: "Cours — Serti rail (pratique)", type: "cours" },
    { date: "2026-02-13", label: "Cours — Gemmologie appliquée", type: "cours" },
    { date: "2026-02-15", label: "Évaluation pratique — Serti rail", type: "eval" },
    { date: "2026-02-20", label: "Cours — Projet atelier", type: "cours" },
    { date: "2026-03-01", label: "Évaluation théorique — Gemmologie", type: "eval" },
  ],
  historique: [
    "13/01/2026 — Début de formation Sertissage N2",
    "20/01/2026 — Évaluation pratique serti clos : 15/20",
    "27/01/2026 — Évaluation pratique serti griffe : 16/20",
    "03/02/2026 — Évaluation théorique gemmologie : 14.5/20",
    "10/02/2026 — Absence justifiée (rendez-vous médical)",
    "10/02/2026 — Évaluation pratique serti rail : 15.5/20",
  ],
};

// ── DESIGN TOKENS ──────────────────────────────

const c = {
  bg: "#06080E", bgCard: "#0D1117", bgHover: "#161B22", bgAccent: "#12192A",
  border: "#1B2332", borderLight: "#283347",
  text: "#E6EDF3", textSec: "#8B949E", textDim: "#545D68",
  gold: "#D4A853", goldLight: "#E8C97A", goldDark: "#B08826",
  goldBg: "rgba(212,168,83,0.07)", goldBorder: "rgba(212,168,83,0.18)",
  emerald: "#3FB950", emeraldBg: "rgba(63,185,80,0.08)",
  blue: "#58A6FF", blueBg: "rgba(88,166,255,0.08)",
  amber: "#D29922", amberBg: "rgba(210,153,34,0.08)",
  red: "#F85149", redBg: "rgba(248,81,73,0.08)",
  purple: "#BC8CFF", purpleBg: "rgba(188,140,255,0.08)",
  cyan: "#39D2C0", cyanBg: "rgba(57,210,192,0.08)",
};

// ── UTILITIES ──────────────────────────────────

const Badge = ({ children, color = "gold", size = "sm" }) => {
  const map = {
    gold: { bg: c.goldBg, bd: c.goldBorder, tx: c.gold },
    emerald: { bg: c.emeraldBg, bd: "rgba(63,185,80,0.2)", tx: c.emerald },
    blue: { bg: c.blueBg, bd: "rgba(88,166,255,0.2)", tx: c.blue },
    amber: { bg: c.amberBg, bd: "rgba(210,153,34,0.2)", tx: c.amber },
    red: { bg: c.redBg, bd: "rgba(248,81,73,0.2)", tx: c.red },
    purple: { bg: c.purpleBg, bd: "rgba(188,140,255,0.2)", tx: c.purple },
    cyan: { bg: c.cyanBg, bd: "rgba(57,210,192,0.2)", tx: c.cyan },
  };
  const s = map[color] || map.gold;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: size === "sm" ? "2px 8px" : "4px 12px",
      fontSize: size === "sm" ? 10 : 11, fontWeight: 600, letterSpacing: "0.04em",
      borderRadius: 5, background: s.bg, border: `1px solid ${s.bd}`, color: s.tx,
      textTransform: "uppercase", whiteSpace: "nowrap",
    }}>{children}</span>
  );
};

const ProgressRing = ({ pct, size = 48, stroke = 4, color = c.gold }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.bgHover} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color = "gold" }) => {
  const ic = color === "gold" ? c.gold : color === "emerald" ? c.emerald : color === "blue" ? c.blue : color === "amber" ? c.amber : color === "cyan" ? c.cyan : c.purple;
  return (
    <div style={{
      background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10,
      padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -24, right: -24, width: 72, height: 72, background: `radial-gradient(circle,${ic}08 0%,transparent 70%)`, borderRadius: "50%" }} />
      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${ic}12`, border: `1px solid ${ic}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} color={ic} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: c.text, letterSpacing: "-0.02em" }}>{value}</div>
        <div style={{ fontSize: 12, color: c.textSec, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: ic, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
      </div>
    </div>
  );
};

const Avatar = ({ prenom, nom, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: 8, flexShrink: 0,
    background: `linear-gradient(135deg, ${c.blueBg}, ${c.blue}20)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    border: `1px solid rgba(88,166,255,0.2)`, fontSize: size * 0.33, fontWeight: 700, color: c.blue,
  }}>{(prenom || "?")[0]}{(nom || "?")[0]}</div>
);

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: c.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, paddingLeft: 2 }}>{children}</div>
);

const InfoRow = ({ icon: Icon, label, value, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
    <Icon size={14} color={c.textDim} style={{ flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 10, color: c.textDim }}>{label}</div>
      <div style={{ fontSize: 12, color: color || c.text, fontWeight: 500 }}>{value || "—"}</div>
    </div>
  </div>
);

const DetailSection = ({ title, children, icon: Icon }) => (
  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, overflow: "hidden" }}>
    <div style={{ padding: "12px 18px", borderBottom: `1px solid ${c.border}`, background: c.bgAccent, display: "flex", alignItems: "center", gap: 8 }}>
      {Icon && <Icon size={13} color={c.textDim} />}
      <span style={{ fontSize: 11, fontWeight: 700, color: c.textDim, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</span>
    </div>
    <div style={{ padding: "16px 18px" }}>{children}</div>
  </div>
);

// ── SIDEBAR ÉLÈVE ──────────────────────────────

const Sidebar = ({ currentView, onNavigate, collapsed, onToggle }) => {
  const el = CURRENT_ELEVE;
  const navItems = [
    { id: "dashboard", icon: Home, label: "Mon tableau de bord" },
    { id: "evaluations", icon: ClipboardList, label: "Mes évaluations" },
    { id: "planning", icon: Calendar, label: "Mon planning" },
    { id: "documents", icon: FileText, label: "Mes documents" },
  ];

  return (
    <div style={{
      width: collapsed ? 60 : 230, minHeight: "100vh",
      background: c.bgCard, borderRight: `1px solid ${c.border}`,
      display: "flex", flexDirection: "column",
      transition: "width 0.25s ease", overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? "16px 10px" : "16px 16px",
        borderBottom: `1px solid ${c.border}`,
        display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
      }} onClick={onToggle}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: `linear-gradient(135deg, ${c.gold}, ${c.goldDark})`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Gem size={16} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>ABJ</div>
            <div style={{ fontSize: 9, color: c.blue, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Espace Élève</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: "10px 6px", display: "flex", flexDirection: "column", gap: 1 }}>
        {navItems.map(item => {
          const active = currentView === item.id;
          return (
            <div key={item.id} onClick={() => onNavigate(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: collapsed ? "9px 12px" : "9px 10px",
              borderRadius: 7, cursor: "pointer",
              background: active ? c.blueBg : "transparent",
              border: active ? `1px solid rgba(88,166,255,0.2)` : "1px solid transparent",
              color: active ? c.blue : c.textSec,
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = c.bgHover; e.currentTarget.style.color = c.text; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textSec; } }}
            >
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, flex: 1 }}>{item.label}</span>}
            </div>
          );
        })}
      </div>

      {/* User */}
      <div style={{
        padding: collapsed ? "12px 10px" : "12px 16px",
        borderTop: `1px solid ${c.border}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <Avatar prenom={el.prenom} nom={el.nom} size={30} />
        {!collapsed && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.text }}>{el.prenom} {el.nom}</div>
            <div style={{ fontSize: 9, color: c.textDim }}>{el.formation}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── MARJORIE CHAT (MODE ÉLÈVE) ─────────────────

const MarjorieChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "marjorie", text: `Bonjour ${CURRENT_ELEVE.prenom} ! Je suis Marjorie, ton assistante à l'ABJ. N'hésite pas si tu as des questions sur ta formation, tes évaluations ou ton planning !` }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { from: "user", text: input.trim() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const pool = [
        `Ta progression est de ${CURRENT_ELEVE.progression}% sur ta formation ${CURRENT_ELEVE.formation}. Tu avances bien !`,
        `Ta prochaine évaluation est le ${CURRENT_ELEVE.prochaine_eval} — c'est une évaluation pratique sur le serti rail. Prépare bien tes outils !`,
        `Ta moyenne actuelle est de ${CURRENT_ELEVE.notes_moyennes}/20, c'est un bon niveau. Continue comme ça !`,
        "Ton financement OPCO est à jour, aucun reste à charge de ton côté. Tout est en ordre.",
        "Si tu as besoin d'un justificatif d'absence ou d'un document administratif, n'hésite pas à demander au secrétariat ou je peux t'indiquer la marche à suivre.",
        `Tu as effectué ${CURRENT_ELEVE.heures_effectuees}h sur ${CURRENT_ELEVE.heures_totales}h prévues. Il te reste ${CURRENT_ELEVE.heures_totales - CURRENT_ELEVE.heures_effectuees}h à compléter d'ici le ${CURRENT_ELEVE.date_fin}.`,
      ];
      setTyping(false);
      setMessages(prev => [...prev, { from: "marjorie", text: pool[Math.floor(Math.random() * pool.length)] }]);
    }, 1000 + Math.random() * 800);
  };

  if (!open) {
    return (
      <div onClick={() => setOpen(true)} style={{
        position: "fixed", bottom: 20, right: 20, zIndex: 1000,
        width: 52, height: 52, borderRadius: 14, cursor: "pointer",
        background: `linear-gradient(135deg, ${c.gold}, ${c.goldDark})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 24px ${c.gold}30`,
      }}>
        <MessageSquare size={22} color="#fff" />
        <div style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", background: c.emerald, border: `2px solid ${c.bg}` }} />
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 1000,
      width: 380, height: 520, borderRadius: 16, overflow: "hidden",
      background: c.bgCard, border: `1px solid ${c.border}`,
      display: "flex", flexDirection: "column", boxShadow: `0 8px 40px rgba(0,0,0,0.5)`,
    }}>
      <div style={{
        padding: "14px 16px", display: "flex", alignItems: "center", gap: 10,
        background: `linear-gradient(135deg, ${c.goldDark}60, ${c.gold}20)`,
        borderBottom: `1px solid ${c.goldBorder}`,
      }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${c.gold}, ${c.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Gem size={15} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>Marjorie — ABJ</div>
          <div style={{ fontSize: 10, color: c.blue }}>Assistante IA • Mode Élève</div>
        </div>
        <X size={18} color={c.textSec} style={{ cursor: "pointer" }} onClick={() => setOpen(false)} />
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.from === "user" ? "flex-end" : "flex-start", maxWidth: "82%" }}>
            <div style={{
              padding: "10px 14px", borderRadius: 12,
              background: msg.from === "user" ? `${c.blue}18` : c.bgHover,
              border: `1px solid ${msg.from === "user" ? `${c.blue}30` : c.border}`,
              color: c.text, fontSize: 12, lineHeight: 1.5,
              borderBottomRightRadius: msg.from === "user" ? 4 : 12,
              borderBottomLeftRadius: msg.from === "user" ? 12 : 4,
            }}>{msg.text}</div>
          </div>
        ))}
        {typing && (
          <div style={{ alignSelf: "flex-start", padding: "10px 14px", background: c.bgHover, border: `1px solid ${c.border}`, borderRadius: 12, borderBottomLeftRadius: 4 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 1, 2].map(i => (<div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: c.gold, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`, opacity: 0.4 }} />))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "10px 14px", borderTop: `1px solid ${c.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Poser une question à Marjorie..."
          style={{ flex: 1, background: c.bgHover, border: `1px solid ${c.border}`, borderRadius: 8, padding: "9px 12px", color: c.text, fontSize: 12, outline: "none" }} />
        <div onClick={sendMessage} style={{ width: 34, height: 34, borderRadius: 8, cursor: "pointer", background: `linear-gradient(135deg, ${c.gold}, ${c.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Send size={14} color="#fff" />
        </div>
      </div>
    </div>
  );
};

// ── DASHBOARD ÉLÈVE ────────────────────────────

const DashboardView = () => {
  const el = CURRENT_ELEVE;
  const progColor = el.progression >= 70 ? c.emerald : el.progression >= 40 ? c.gold : c.amber;
  const heuresPct = Math.round(el.heures_effectuees / el.heures_totales * 100);
  const joursRestants = Math.ceil((new Date(el.date_fin) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Welcome banner */}
      <div style={{
        background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 12,
        padding: "24px 28px", display: "flex", alignItems: "center", gap: 24,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: `radial-gradient(circle, ${c.blue}06 0%, transparent 70%)`, borderRadius: "50%" }} />
        <Avatar prenom={el.prenom} nom={el.nom} size={60} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: c.text }}>Bonjour {el.prenom} !</div>
          <div style={{ fontSize: 13, color: c.textSec, marginTop: 4 }}>{el.formation} — {el.session} • {el.formateur}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Badge color="emerald" size="md">EN FORMATION</Badge>
            <Badge color={el.paiement_statut === "A_JOUR" ? "emerald" : "red"} size="md">Paiement {el.paiement_statut.replace(/_/g, " ")}</Badge>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <ProgressRing pct={el.progression} size={80} stroke={6} color={progColor} />
          <div style={{ fontSize: 20, fontWeight: 700, color: progColor, marginTop: 4 }}>{el.progression}%</div>
          <div style={{ fontSize: 10, color: c.textDim }}>Progression</div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 12 }}>
        <StatCard icon={Star} label="Moyenne générale" value={`${el.notes_moyennes}/20`} color={el.notes_moyennes >= 14 ? "emerald" : "amber"} />
        <StatCard icon={Clock} label="Heures effectuées" value={`${el.heures_effectuees}h`} sub={`${heuresPct}% — ${el.heures_totales}h total`} color="blue" />
        <StatCard icon={XCircle} label="Absences" value={el.absences} sub={`${el.retards} retard${el.retards > 1 ? "s" : ""}`} color={el.absences > 2 ? "red" : "emerald"} />
        <StatCard icon={Calendar} label="Jours restants" value={joursRestants > 0 ? joursRestants : "—"} sub={`Fin : ${el.date_fin}`} color="purple" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Prochaine évaluation */}
        <DetailSection title="Prochains événements" icon={Calendar}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {el.prochains_events.slice(0, 5).map((ev, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                background: ev.type === "eval" ? c.amberBg : c.bgHover,
                border: `1px solid ${ev.type === "eval" ? "rgba(210,153,34,0.15)" : c.border}`,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: ev.type === "eval" ? c.amber : c.blue,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: c.text, fontWeight: 500 }}>{ev.label}</div>
                  <div style={{ fontSize: 10, color: c.textDim, marginTop: 1 }}>{ev.date}</div>
                </div>
                {ev.type === "eval" && <Badge color="amber" size="sm">Évaluation</Badge>}
              </div>
            ))}
          </div>
        </DetailSection>

        {/* Dernières notes */}
        <DetailSection title="Dernières évaluations" icon={BarChart3}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {el.evaluations.slice(0, 4).map(ev => (
              <div key={ev.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                background: c.bgHover, border: `1px solid ${c.border}`,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                  background: ev.note >= 14 ? c.emeraldBg : ev.note >= 10 ? c.amberBg : c.redBg,
                  border: `1px solid ${ev.note >= 14 ? "rgba(63,185,80,0.2)" : ev.note >= 10 ? "rgba(210,153,34,0.2)" : "rgba(248,81,73,0.2)"}`,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: ev.note >= 14 ? c.emerald : ev.note >= 10 ? c.amber : c.red }}>{ev.note}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: c.text, fontWeight: 500 }}>{ev.matiere}</div>
                  <div style={{ fontSize: 10, color: c.textDim }}>{ev.date} • {ev.type} • coeff {ev.coeff}</div>
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      </div>

      {/* Progression heures bar */}
      <DetailSection title="Avancement des heures" icon={TrendingUp}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: c.textSec }}>{el.heures_effectuees}h effectuées</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: c.blue }}>{el.heures_totales}h prévues</span>
            </div>
            <div style={{ height: 10, background: c.bgHover, borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: `${heuresPct}%`, height: "100%", background: `linear-gradient(90deg, ${c.blue}, ${c.cyan})`, borderRadius: 5, transition: "width 0.6s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: c.textDim, marginTop: 6 }}>
              Il te reste <strong style={{ color: c.text }}>{el.heures_totales - el.heures_effectuees}h</strong> à effectuer avant le {el.date_fin}
            </div>
          </div>
        </div>
      </DetailSection>
    </div>
  );
};

// ── ÉVALUATIONS VIEW ───────────────────────────

const EvaluationsView = () => {
  const el = CURRENT_ELEVE;
  const [expandedId, setExpandedId] = useState(null);

  const notesPratiques = el.evaluations.filter(e => e.type === "Pratique");
  const notesTheoriques = el.evaluations.filter(e => e.type === "Théorique");
  const moyPratique = notesPratiques.length > 0 ? (notesPratiques.reduce((s, e) => s + e.note, 0) / notesPratiques.length).toFixed(1) : "—";
  const moyTheorique = notesTheoriques.length > 0 ? (notesTheoriques.reduce((s, e) => s + e.note, 0) / notesTheoriques.length).toFixed(1) : "—";

  // Weighted average
  const totalCoeff = el.evaluations.reduce((s, e) => s + e.coeff, 0);
  const moyPonderee = totalCoeff > 0 ? (el.evaluations.reduce((s, e) => s + e.note * e.coeff, 0) / totalCoeff).toFixed(1) : "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Moyennes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <StatCard icon={Star} label="Moyenne pondérée" value={`${moyPonderee}/20`} color={parseFloat(moyPonderee) >= 14 ? "emerald" : "amber"} />
        <StatCard icon={Target} label="Moyenne pratique" value={`${moyPratique}/20`} sub={`${notesPratiques.length} évaluations`} color="gold" />
        <StatCard icon={BookOpen} label="Moyenne théorique" value={`${moyTheorique}/20`} sub={`${notesTheoriques.length} évaluations`} color="blue" />
        <StatCard icon={ClipboardList} label="Total évaluations" value={el.evaluations.length} sub={`Prochaine : ${el.prochaine_eval}`} color="purple" />
      </div>

      {/* Liste évaluations */}
      <DetailSection title="Détail des évaluations" icon={BarChart3}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {el.evaluations.map(ev => {
            const expanded = expandedId === ev.id;
            return (
              <div key={ev.id} onClick={() => setExpandedId(expanded ? null : ev.id)} style={{
                background: c.bgHover, borderRadius: 10, border: `1px solid ${expanded ? c.goldBorder : c.border}`,
                cursor: "pointer", transition: "all 0.15s", overflow: "hidden",
              }}>
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
                    background: ev.note >= 14 ? c.emeraldBg : ev.note >= 10 ? c.amberBg : c.redBg,
                    border: `1px solid ${ev.note >= 14 ? "rgba(63,185,80,0.2)" : ev.note >= 10 ? "rgba(210,153,34,0.2)" : "rgba(248,81,73,0.2)"}`,
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: ev.note >= 14 ? c.emerald : ev.note >= 10 ? c.amber : c.red }}>{ev.note}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{ev.matiere}</div>
                    <div style={{ fontSize: 11, color: c.textDim, marginTop: 2 }}>{ev.date} • Coeff {ev.coeff}</div>
                  </div>
                  <Badge color={ev.type === "Pratique" ? "gold" : "blue"} size="md">{ev.type}</Badge>
                  <ChevronRight size={14} color={c.textDim} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                </div>

                {expanded && (
                  <div style={{ padding: "0 16px 14px 16px", borderTop: `1px solid ${c.border}`, marginTop: 0, paddingTop: 12 }}>
                    <div style={{ fontSize: 12, color: c.textSec, lineHeight: 1.7, marginBottom: 8 }}>{ev.commentaire}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Award size={12} color={c.textDim} />
                      <span style={{ fontSize: 11, color: c.textDim }}>Évaluateur : {ev.formateur}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DetailSection>
    </div>
  );
};

// ── PLANNING VIEW ──────────────────────────────

const PlanningView = () => {
  const el = CURRENT_ELEVE;
  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
  const jourColors = { Lundi: c.blue, Mardi: c.purple, Mercredi: c.gold, Jeudi: c.emerald, Vendredi: c.cyan };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Session info */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <StatCard icon={BookOpen} label="Formation" value={el.formation} sub={el.session} color="blue" />
        <StatCard icon={Award} label="Formateur" value={el.formateur} color="purple" />
        <StatCard icon={MapPin} label="Salle principale" value={el.salle} color="gold" />
        <StatCard icon={Calendar} label="Période" value={`${el.date_debut} → ${el.date_fin}`} color="cyan" />
      </div>

      {/* Emploi du temps */}
      <DetailSection title="Emploi du temps hebdomadaire" icon={Calendar}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {jours.map(jour => {
            const creneaux = el.planning.filter(p => p.jour === jour);
            const jc = jourColors[jour] || c.blue;
            return (
              <div key={jour}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: jc, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.text, textTransform: "uppercase", letterSpacing: "0.04em" }}>{jour}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginLeft: 18 }}>
                  {creneaux.map((cr, i) => (
                    <div key={i} style={{
                      background: c.bgHover, border: `1px solid ${c.border}`, borderRadius: 8,
                      padding: "10px 14px", borderLeft: `3px solid ${jc}`,
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: jc, marginBottom: 3 }}>{cr.horaire}</div>
                      <div style={{ fontSize: 12, color: c.text, fontWeight: 500 }}>{cr.matiere}</div>
                      <div style={{ fontSize: 10, color: c.textDim, marginTop: 2 }}>{cr.salle}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DetailSection>

      {/* Prochains events */}
      <DetailSection title="Prochains événements" icon={Bell}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {el.prochains_events.map((ev, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
              background: ev.type === "eval" ? c.amberBg : c.bgHover,
              border: `1px solid ${ev.type === "eval" ? "rgba(210,153,34,0.15)" : c.border}`,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: ev.type === "eval" ? c.amber : c.blue, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: c.text }}>{ev.label}</div>
                <div style={{ fontSize: 10, color: c.textDim }}>{ev.date}</div>
              </div>
              {ev.type === "eval" && <Badge color="amber" size="sm">Éval</Badge>}
            </div>
          ))}
        </div>
      </DetailSection>
    </div>
  );
};

// ── DOCUMENTS VIEW ─────────────────────────────

const DocumentsView = () => {
  const el = CURRENT_ELEVE;
  const docsValides = el.documents.filter(d => d.statut === "VALIDE").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Résumé */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <StatCard icon={FileText} label="Documents déposés" value={el.documents.length} color="blue" />
        <StatCard icon={CheckCircle} label="Documents validés" value={docsValides} sub={docsValides === el.documents.length ? "Tout est en ordre !" : "Documents en attente"} color="emerald" />
        <StatCard icon={Hash} label="N° Dossier" value={el.numero_dossier} color="gold" />
        <StatCard icon={CreditCard} label="Financement" value={el.financement} sub={`Paiement ${el.paiement_statut.replace(/_/g, " ").toLowerCase()}`} color={el.paiement_statut === "A_JOUR" ? "emerald" : "red"} />
      </div>

      {/* Liste documents */}
      <DetailSection title="Mes documents" icon={FileText}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {el.documents.map((doc, i) => {
            const isValid = doc.statut === "VALIDE";
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                borderRadius: 8, background: c.bgHover, border: `1px solid ${c.border}`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                  background: isValid ? c.emeraldBg : c.amberBg,
                  border: `1px solid ${isValid ? "rgba(63,185,80,0.2)" : "rgba(210,153,34,0.2)"}`,
                }}>
                  {isValid ? <CheckCircle size={16} color={c.emerald} /> : <Clock size={16} color={c.amber} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: c.text }}>{doc.type}</div>
                  <div style={{ fontSize: 10, color: c.textDim, marginTop: 1 }}>Déposé le {doc.date_depot}</div>
                </div>
                <Badge color={isValid ? "emerald" : "amber"} size="sm">{doc.statut}</Badge>
              </div>
            );
          })}
        </div>
      </DetailSection>

      {/* Infos administratives */}
      <DetailSection title="Informations administratives" icon={User}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <InfoRow icon={User} label="Nom complet" value={`${el.prenom} ${el.nom}`} />
            <InfoRow icon={Phone} label="Téléphone" value={el.tel} />
            <InfoRow icon={MapPin} label="Email" value={el.email} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <InfoRow icon={Hash} label="N° Dossier" value={el.numero_dossier} />
            <InfoRow icon={CreditCard} label="Financement" value={el.financement} />
            <InfoRow icon={DollarSign} label="Statut paiement" value={el.paiement_statut.replace(/_/g, " ")} color={el.paiement_statut === "A_JOUR" ? c.emerald : c.red} />
          </div>
        </div>
      </DetailSection>
    </div>
  );
};

// ── MAIN APP ───────────────────────────────────

export default function ABJElevePortal() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case "dashboard": return <DashboardView />;
      case "evaluations": return <EvaluationsView />;
      case "planning": return <PlanningView />;
      case "documents": return <DocumentsView />;
      default: return <DashboardView />;
    }
  };

  const titles = {
    dashboard: "Mon tableau de bord",
    evaluations: "Mes évaluations",
    planning: "Mon planning",
    documents: "Mes documents",
  };

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: c.bg, fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      color: c.text,
    }}>
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${c.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${c.borderLight}; }
        input::placeholder { color: ${c.textDim}; }
      `}</style>

      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{
          padding: "14px 28px", borderBottom: `1px solid ${c.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: c.bgCard,
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.text }}>{titles[currentView]}</div>
            <div style={{ fontSize: 11, color: c.textDim, marginTop: 1 }}>Académie de Bijouterie Joaillerie — Espace Élève</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", width: 34, height: 34, borderRadius: 7, cursor: "pointer", background: c.bgHover, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={15} color={c.textSec} />
            </div>
            <Avatar prenom={CURRENT_ELEVE.prenom} nom={CURRENT_ELEVE.nom} size={34} />
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
          {renderView()}
        </div>
      </div>

      <MarjorieChat />
    </div>
  );
}
