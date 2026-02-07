import { useState, useEffect, useRef } from "react";
import {
  Search, FileText, DollarSign, Calendar, ChevronRight,
  Bell, User, Gem, Clock, CheckCircle, AlertCircle,
  XCircle, Send, Phone, MapPin, Star, X, Home,
  BookOpen, CreditCard, MessageSquare, School, Award,
  RefreshCw, TrendingUp, Hash, ClipboardList, ChevronLeft,
  BarChart3, Target, Users, PenTool, AlertTriangle,
  Layers, Activity, Eye, Plus
} from "lucide-react";

// ═══════════════════════════════════════════════
// ABJ CRM — Interface Formateur
// Académie de Bijouterie Joaillerie
// ═══════════════════════════════════════════════

// ── MOCK : Formateur connecté (Philippe Laurent) ─

const CURRENT_FORMATEUR = {
  id: 1,
  nom: "Laurent",
  prenom: "Philippe",
  specialite: "Sertissage & Joaillerie",
  email: "p.laurent@abj.fr",
  tel: "06 55 44 33 22",
  salle: "Atelier B / C",
  heures_semaine: 32,
  bio: "20 ans d'expérience en haute joaillerie. Ancien maître artisan chez Cartier. Spécialiste du serti griffe et du serti clos. Formateur certifié depuis 2018.",
};

const MY_SESSIONS = [
  { id: 1, formation: "Sertissage N2", session: "Janvier 2026", salle: "Atelier B", places_total: 8, places_prises: 8, date_debut: "2026-01-13", date_fin: "2026-06-30", statut: "EN_COURS", nb_eleves: 8, heures_totales: 300, heures_effectuees: 204, prochaine_eval: "2026-02-15" },
  { id: 2, formation: "Joaillerie Création", session: "Novembre 2025", salle: "Atelier C", places_total: 8, places_prises: 5, date_debut: "2025-11-04", date_fin: "2026-05-30", statut: "EN_COURS", nb_eleves: 5, heures_totales: 300, heures_effectuees: 135, prochaine_eval: "2026-02-18" },
];

const MY_ELEVES = [
  { id: 1, nom: "Garcia", prenom: "Inès", email: "ines.garcia@gmail.com", tel: "06 11 22 33 44", formation: "Sertissage N2", session: "Janvier 2026", salle: "Atelier B", progression: 68, heures_effectuees: 204, heures_totales: 300, notes_moyennes: 15.2, absences: 1, retards: 2, paiement_statut: "A_JOUR", financement: "OPCO", date_debut: "2026-01-13", date_fin: "2026-06-30",
    evaluations: [
      { id: 1, date: "2026-01-27", type: "Pratique", matiere: "Serti griffe", note: 16, coeff: 3, commentaire: "Très bon travail sur le serti griffe. Maîtrise des proportions et régularité des griffes." },
      { id: 2, date: "2026-02-03", type: "Théorique", matiere: "Gemmologie appliquée", note: 14.5, coeff: 2, commentaire: "Connaissances solides en identification des pierres." },
      { id: 3, date: "2026-01-20", type: "Pratique", matiere: "Serti clos", note: 15, coeff: 3, commentaire: "Bonne technique de base. Régularité du rebord à améliorer." },
      { id: 4, date: "2026-02-10", type: "Pratique", matiere: "Serti rail", note: 15.5, coeff: 3, commentaire: "Progression notable. Alignement précis des pierres." },
    ],
    observations: "Élève très motivée et assidue. Excellente progression depuis le début. Potentiel pour le niveau 3."
  },
  { id: 2, nom: "Morel", prenom: "Lucas", email: "lucas.morel@gmail.com", tel: "07 22 33 44 55", formation: "Sertissage N2", session: "Janvier 2026", salle: "Atelier B", progression: 55, heures_effectuees: 165, heures_totales: 300, notes_moyennes: 13.8, absences: 3, retards: 1, paiement_statut: "A_JOUR", financement: "France Travail", date_debut: "2026-01-13", date_fin: "2026-06-30",
    evaluations: [
      { id: 5, date: "2026-01-27", type: "Pratique", matiere: "Serti griffe", note: 13, coeff: 3, commentaire: "Technique correcte mais manque de précision sur les finitions." },
      { id: 6, date: "2026-02-03", type: "Théorique", matiere: "Gemmologie appliquée", note: 14, coeff: 2, commentaire: "Bon niveau théorique." },
      { id: 7, date: "2026-02-10", type: "Pratique", matiere: "Serti rail", note: 14.5, coeff: 3, commentaire: "En progression. L'alignement s'améliore." },
    ],
    observations: "Élève sérieux. 3 absences à surveiller. Doit travailler la précision en serti griffe."
  },
  { id: 3, nom: "Fontaine", prenom: "Chloé", email: "chloe.fontaine@yahoo.fr", tel: "06 99 88 77 66", formation: "Sertissage N2", session: "Janvier 2026", salle: "Atelier B", progression: 70, heures_effectuees: 210, heures_totales: 300, notes_moyennes: 16.1, absences: 0, retards: 0, paiement_statut: "A_JOUR", financement: "CPF", date_debut: "2026-01-13", date_fin: "2026-06-30",
    evaluations: [
      { id: 8, date: "2026-01-27", type: "Pratique", matiere: "Serti griffe", note: 17, coeff: 3, commentaire: "Excellent travail. Finitions remarquables." },
      { id: 9, date: "2026-02-03", type: "Théorique", matiere: "Gemmologie appliquée", note: 15, coeff: 2, commentaire: "Très bon niveau." },
      { id: 10, date: "2026-02-10", type: "Pratique", matiere: "Serti rail", note: 16.5, coeff: 3, commentaire: "Maîtrise technique impressionnante pour ce niveau." },
    ],
    observations: "Élève brillante. Zéro absence, zéro retard. Recommandée pour concours régional."
  },
  { id: 4, nom: "Barbier", prenom: "Maxime", email: "maxime.barbier@outlook.fr", tel: "06 44 55 66 77", formation: "Sertissage N2", session: "Janvier 2026", salle: "Atelier B", progression: 42, heures_effectuees: 126, heures_totales: 300, notes_moyennes: 11.2, absences: 5, retards: 6, paiement_statut: "RETARD", financement: "auto-financement", date_debut: "2026-01-13", date_fin: "2026-06-30",
    evaluations: [
      { id: 11, date: "2026-01-27", type: "Pratique", matiere: "Serti griffe", note: 10, coeff: 3, commentaire: "Technique insuffisante. Doit revoir les bases du positionnement." },
      { id: 12, date: "2026-02-03", type: "Théorique", matiere: "Gemmologie appliquée", note: 12, coeff: 2, commentaire: "Résultat passable. Lacunes sur la classification des pierres." },
      { id: 13, date: "2026-02-10", type: "Pratique", matiere: "Serti rail", note: 11.5, coeff: 3, commentaire: "Légère amélioration mais reste en dessous du niveau attendu." },
    ],
    observations: "Élève en difficulté. 5 absences et 6 retards. Paiement en retard. Entretien de suivi recommandé. Risque de décrochage."
  },
  { id: 5, nom: "Roux", prenom: "Emma", email: "emma.roux@outlook.fr", tel: "06 33 44 55 66", formation: "Joaillerie Création", session: "Novembre 2025", salle: "Atelier C", progression: 45, heures_effectuees: 135, heures_totales: 300, notes_moyennes: 14.5, absences: 0, retards: 1, paiement_statut: "A_JOUR", financement: "CPF", date_debut: "2025-11-04", date_fin: "2026-05-30",
    evaluations: [
      { id: 14, date: "2025-12-09", type: "Pratique", matiere: "Design joaillier", note: 14, coeff: 3, commentaire: "Bon sens créatif, technique à perfectionner." },
      { id: 15, date: "2026-01-13", type: "Théorique", matiere: "Histoire de la joaillerie", note: 15, coeff: 2, commentaire: "Bonne compréhension du contexte historique." },
    ],
    observations: "Profil créatif intéressant. Bonne progression. Sens esthétique développé."
  },
  { id: 6, nom: "Blanc", prenom: "Léa", email: "lea.blanc@gmail.com", tel: "07 11 22 33 44", formation: "Joaillerie Création", session: "Novembre 2025", salle: "Atelier C", progression: 50, heures_effectuees: 150, heures_totales: 300, notes_moyennes: 15.8, absences: 1, retards: 0, paiement_statut: "A_JOUR", financement: "OPCO", date_debut: "2025-11-04", date_fin: "2026-05-30",
    evaluations: [
      { id: 16, date: "2025-12-09", type: "Pratique", matiere: "Design joaillier", note: 16, coeff: 3, commentaire: "Très beau travail de création. Originale et précise." },
      { id: 17, date: "2026-01-13", type: "Théorique", matiere: "Histoire de la joaillerie", note: 15.5, coeff: 2, commentaire: "Solide culture joaillière." },
    ],
    observations: "Excellente élève. Très investie dans les projets créatifs. Potentiel professionnel fort."
  },
];

const MY_PLANNING = [
  { jour: "Lundi", creneaux: [{ horaire: "9h00 – 12h30", matiere: "Sertissage N2 — Serti griffe (pratique)", salle: "Atelier B", session: "Sertissage N2" }, { horaire: "14h00 – 17h30", matiere: "Sertissage N2 — Serti clos (pratique)", salle: "Atelier B", session: "Sertissage N2" }] },
  { jour: "Mardi", creneaux: [{ horaire: "9h00 – 12h30", matiere: "Joaillerie Création — Atelier design", salle: "Atelier C", session: "Joaillerie Création" }, { horaire: "14h00 – 17h00", matiere: "Joaillerie Création — Technique assemblage", salle: "Atelier C", session: "Joaillerie Création" }] },
  { jour: "Mercredi", creneaux: [{ horaire: "9h00 – 12h30", matiere: "Sertissage N2 — Serti rail (pratique)", salle: "Atelier B", session: "Sertissage N2" }, { horaire: "14h00 – 16h00", matiere: "Sertissage N2 — Accompagnement individuel", salle: "Atelier B", session: "Sertissage N2" }] },
  { jour: "Jeudi", creneaux: [{ horaire: "9h00 – 12h30", matiere: "Sertissage N2 — Serti invisible (pratique)", salle: "Atelier B", session: "Sertissage N2" }, { horaire: "14h00 – 17h30", matiere: "Joaillerie Création — Projet libre", salle: "Atelier C", session: "Joaillerie Création" }] },
  { jour: "Vendredi", creneaux: [{ horaire: "9h00 – 12h30", matiere: "Sertissage N2 — Projet atelier", salle: "Atelier B", session: "Sertissage N2" }, { horaire: "14h00 – 16h00", matiere: "Bilans & préparation évaluations", salle: "Salle 2", session: "Transversal" }] },
];

const UPCOMING_EVALS = [
  { id: 1, date: "2026-02-15", formation: "Sertissage N2", matiere: "Serti rail", type: "Pratique", nb_eleves: 8, salle: "Atelier B" },
  { id: 2, date: "2026-02-18", formation: "Joaillerie Création", matiere: "Design joaillier", type: "Pratique", nb_eleves: 5, salle: "Atelier C" },
  { id: 3, date: "2026-03-01", formation: "Sertissage N2", matiere: "Gemmologie appliquée", type: "Théorique", nb_eleves: 8, salle: "Salle 2" },
  { id: 4, date: "2026-03-10", formation: "Joaillerie Création", matiere: "Histoire & culture", type: "Théorique", nb_eleves: 5, salle: "Salle 1" },
];

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

const ScoreBar = ({ score, height = 4 }) => {
  const col = score >= 80 ? c.emerald : score >= 50 ? c.gold : score >= 30 ? c.amber : c.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height, background: c.bgHover, borderRadius: height / 2, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: col, borderRadius: height / 2 }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: col, minWidth: 28, textAlign: "right" }}>{score}%</span>
    </div>
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

const Avatar = ({ prenom, nom, size = 36, accent }) => {
  const ac = accent || c.purple;
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, flexShrink: 0,
      background: `linear-gradient(135deg, ${ac}15, ${ac}30)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      border: `1px solid ${ac}35`, fontSize: size * 0.33, fontWeight: 700, color: ac,
    }}>{(prenom || "?")[0]}{(nom || "?")[0]}</div>
  );
};

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

const BackButton = ({ onClick, label }) => (
  <div onClick={onClick} style={{
    display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
    padding: "6px 12px", borderRadius: 7, background: c.bgHover, border: `1px solid ${c.border}`,
    marginBottom: 16, transition: "all 0.15s",
  }}
    onMouseEnter={e => { e.currentTarget.style.background = c.bgAccent; e.currentTarget.style.borderColor = c.purpleBg; }}
    onMouseLeave={e => { e.currentTarget.style.background = c.bgHover; e.currentTarget.style.borderColor = c.border; }}
  >
    <ChevronLeft size={14} color={c.purple} />
    <span style={{ fontSize: 12, fontWeight: 500, color: c.textSec }}>{label || "Retour"}</span>
  </div>
);

// ── SIDEBAR FORMATEUR ──────────────────────────

const Sidebar = ({ currentView, onNavigate, collapsed, onToggle }) => {
  const f = CURRENT_FORMATEUR;
  const navItems = [
    { id: "dashboard", icon: Home, label: "Mon tableau de bord" },
    { id: "eleves", icon: Users, label: "Mes élèves", count: MY_ELEVES.length },
    { id: "sessions", icon: Layers, label: "Mes sessions", count: MY_SESSIONS.length },
    { id: "evaluations", icon: ClipboardList, label: "Évaluations" },
    { id: "planning", icon: Calendar, label: "Mon planning" },
  ];

  return (
    <div style={{
      width: collapsed ? 60 : 230, minHeight: "100vh",
      background: c.bgCard, borderRight: `1px solid ${c.border}`,
      display: "flex", flexDirection: "column",
      transition: "width 0.25s ease", overflow: "hidden",
    }}>
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
            <div style={{ fontSize: 9, color: c.purple, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Espace Formateur</div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: "10px 6px", display: "flex", flexDirection: "column", gap: 1 }}>
        {navItems.map(item => {
          const active = currentView === item.id;
          return (
            <div key={item.id} onClick={() => onNavigate(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: collapsed ? "9px 12px" : "9px 10px",
              borderRadius: 7, cursor: "pointer",
              background: active ? c.purpleBg : "transparent",
              border: active ? `1px solid rgba(188,140,255,0.2)` : "1px solid transparent",
              color: active ? c.purple : c.textSec,
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = c.bgHover; e.currentTarget.style.color = c.text; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textSec; } }}
            >
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, flex: 1 }}>{item.label}</span>}
              {!collapsed && item.count > 0 && (
                <span style={{ fontSize: 9, fontWeight: 700, color: active ? c.purple : c.textDim, background: active ? `${c.purple}18` : c.bgHover, padding: "1px 6px", borderRadius: 4 }}>{item.count}</span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ padding: collapsed ? "12px 10px" : "12px 16px", borderTop: `1px solid ${c.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar prenom={f.prenom} nom={f.nom} size={30} />
        {!collapsed && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.text }}>{f.prenom} {f.nom}</div>
            <div style={{ fontSize: 9, color: c.textDim }}>{f.specialite}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── MARJORIE CHAT (MODE FORMATEUR) ─────────────

const MarjorieChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "marjorie", text: `Bonjour ${CURRENT_FORMATEUR.prenom} ! Je suis Marjorie, votre assistante. Je peux vous aider sur le suivi de vos élèves, la préparation des évaluations ou les tâches administratives.` }
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
        "Vous avez 13 élèves actifs sur 2 sessions. La prochaine évaluation est le 15/02 pour le Sertissage N2 (pratique serti rail).",
        "Attention : Maxime Barbier cumule 5 absences et 6 retards avec un paiement en retard. Je recommande un entretien de suivi rapidement.",
        "Chloé Fontaine a les meilleurs résultats de la session Sertissage N2 avec 16.1 de moyenne. Profil à recommander pour le concours régional.",
        "La session Joaillerie Création est à 45% d'avancement. Emma Roux et Léa Blanc progressent bien, pas d'alerte particulière.",
        "Vous avez 32h de cours cette semaine. Vendredi après-midi est réservé aux bilans et préparation d'évaluations.",
        "Lucas Morel a 3 absences ce mois. Ses notes sont correctes (13.8) mais la régularité pose question. Souhaitez-vous que je prépare un courrier de rappel ?",
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
          <div style={{ fontSize: 10, color: c.purple }}>Assistante IA • Mode Formateur</div>
        </div>
        <X size={18} color={c.textSec} style={{ cursor: "pointer" }} onClick={() => setOpen(false)} />
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.from === "user" ? "flex-end" : "flex-start", maxWidth: "82%" }}>
            <div style={{
              padding: "10px 14px", borderRadius: 12,
              background: msg.from === "user" ? `${c.purple}18` : c.bgHover,
              border: `1px solid ${msg.from === "user" ? `${c.purple}30` : c.border}`,
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
          placeholder="Demander à Marjorie..."
          style={{ flex: 1, background: c.bgHover, border: `1px solid ${c.border}`, borderRadius: 8, padding: "9px 12px", color: c.text, fontSize: 12, outline: "none" }} />
        <div onClick={sendMessage} style={{ width: 34, height: 34, borderRadius: 8, cursor: "pointer", background: `linear-gradient(135deg, ${c.gold}, ${c.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Send size={14} color="#fff" />
        </div>
      </div>
    </div>
  );
};

// ── DASHBOARD FORMATEUR ────────────────────────

const DashboardView = () => {
  const f = CURRENT_FORMATEUR;
  const totalEleves = MY_ELEVES.length;
  const moyenneGlobal = (MY_ELEVES.reduce((s, e) => s + e.notes_moyennes, 0) / totalEleves).toFixed(1);
  const elevesAlerte = MY_ELEVES.filter(e => e.absences >= 3 || e.paiement_statut === "RETARD" || e.notes_moyennes < 12);
  const prochaineEval = UPCOMING_EVALS[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Welcome */}
      <div style={{
        background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 12,
        padding: "24px 28px", display: "flex", alignItems: "center", gap: 20,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: `radial-gradient(circle, ${c.purple}06 0%, transparent 70%)`, borderRadius: "50%" }} />
        <div style={{
          width: 56, height: 56, borderRadius: 14, flexShrink: 0,
          background: `linear-gradient(135deg, ${c.purpleBg}, ${c.blueBg})`,
          border: `1px solid rgba(188,140,255,0.2)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Award size={24} color={c.purple} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: c.text }}>Bonjour {f.prenom} !</div>
          <div style={{ fontSize: 13, color: c.textSec, marginTop: 4 }}>{f.specialite} • {f.heures_semaine}h / semaine</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Badge color="purple" size="md">Formateur</Badge>
            <Badge color="blue" size="md">{MY_SESSIONS.length} sessions actives</Badge>
            <Badge color="gold" size="md">{totalEleves} élèves</Badge>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 12 }}>
        <StatCard icon={Users} label="Élèves suivis" value={totalEleves} color="blue" />
        <StatCard icon={Star} label="Moyenne globale" value={`${moyenneGlobal}/20`} color={parseFloat(moyenneGlobal) >= 14 ? "emerald" : "amber"} />
        <StatCard icon={AlertTriangle} label="Élèves en alerte" value={elevesAlerte.length} sub={elevesAlerte.length > 0 ? "Action requise" : "Aucun"} color={elevesAlerte.length > 0 ? "red" : "emerald"} />
        <StatCard icon={ClipboardList} label="Prochaine évaluation" value={prochaineEval?.date || "—"} sub={prochaineEval?.matiere} color="amber" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Alertes élèves */}
        <DetailSection title="Élèves en alerte" icon={AlertTriangle}>
          {elevesAlerte.length === 0 ? (
            <div style={{ fontSize: 12, color: c.emerald, padding: 8, textAlign: "center" }}>Aucune alerte — tout va bien !</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {elevesAlerte.map(el => (
                <div key={el.id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                  background: c.redBg, border: `1px solid rgba(248,81,73,0.15)`,
                }}>
                  <Avatar prenom={el.prenom} nom={el.nom} size={32} accent={c.red} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: c.text }}>{el.prenom} {el.nom}</div>
                    <div style={{ fontSize: 10, color: c.red, marginTop: 2 }}>
                      {el.absences >= 3 && `${el.absences} absences `}
                      {el.retards >= 4 && `• ${el.retards} retards `}
                      {el.paiement_statut === "RETARD" && "• Paiement en retard "}
                      {el.notes_moyennes < 12 && `• Moyenne ${el.notes_moyennes}/20`}
                    </div>
                  </div>
                  <Badge color="red" size="sm">Alerte</Badge>
                </div>
              ))}
            </div>
          )}
        </DetailSection>

        {/* Prochaines évals */}
        <DetailSection title="Prochaines évaluations" icon={ClipboardList}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {UPCOMING_EVALS.slice(0, 4).map(ev => (
              <div key={ev.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                background: c.amberBg, border: `1px solid rgba(210,153,34,0.15)`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.amber, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: c.text }}>{ev.matiere}</div>
                  <div style={{ fontSize: 10, color: c.textDim }}>{ev.date} • {ev.formation} • {ev.nb_eleves} élèves</div>
                </div>
                <Badge color={ev.type === "Pratique" ? "gold" : "blue"} size="sm">{ev.type}</Badge>
              </div>
            ))}
          </div>
        </DetailSection>
      </div>

      {/* Résumé sessions */}
      <DetailSection title="Mes sessions" icon={Layers}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {MY_SESSIONS.map(s => {
            const pct = Math.round(s.heures_effectuees / s.heures_totales * 100);
            return (
              <div key={s.id} style={{ background: c.bgHover, borderRadius: 8, padding: 14, border: `1px solid ${c.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{s.formation}</div>
                    <div style={{ fontSize: 10, color: c.textDim, marginTop: 2 }}>{s.session} • {s.nb_eleves} élèves</div>
                  </div>
                  <Badge color="emerald" size="sm">EN COURS</Badge>
                </div>
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: c.textDim }}>Avancement</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: c.purple }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, background: c.bg, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${c.purple}, ${c.blue})`, borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DetailSection>
    </div>
  );
};

// ── ÉLÈVE DETAIL (FICHE FORMATEUR) ─────────────

const EleveDetail = ({ eleve, onBack }) => {
  const el = eleve;
  const progColor = el.progression >= 70 ? c.emerald : el.progression >= 40 ? c.gold : c.amber;
  const [expandedId, setExpandedId] = useState(null);

  const notesPratiques = el.evaluations.filter(e => e.type === "Pratique");
  const notesTheoriques = el.evaluations.filter(e => e.type === "Théorique");
  const moyP = notesPratiques.length > 0 ? (notesPratiques.reduce((s, e) => s + e.note, 0) / notesPratiques.length).toFixed(1) : "—";
  const moyT = notesTheoriques.length > 0 ? (notesTheoriques.reduce((s, e) => s + e.note, 0) / notesTheoriques.length).toFixed(1) : "—";
  const hasAlert = el.absences >= 3 || el.paiement_statut === "RETARD" || el.notes_moyennes < 12;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BackButton onClick={onBack} label="Retour aux élèves" />

      {/* Header */}
      <div style={{
        background: c.bgCard, border: `1px solid ${hasAlert ? "rgba(248,81,73,0.25)" : c.border}`, borderRadius: 12,
        padding: "24px 28px", display: "flex", alignItems: "center", gap: 20,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: `radial-gradient(circle, ${hasAlert ? c.red : c.emerald}06 0%, transparent 70%)`, borderRadius: "50%" }} />
        <Avatar prenom={el.prenom} nom={el.nom} size={56} accent={hasAlert ? c.red : c.emerald} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: c.text }}>{el.prenom} {el.nom}</div>
          <div style={{ fontSize: 12, color: c.textDim, marginTop: 3 }}>{el.email} • {el.tel}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Badge color="blue" size="md">{el.formation} — {el.session}</Badge>
            <Badge color={el.paiement_statut === "A_JOUR" ? "emerald" : "red"} size="md">Paiement {el.paiement_statut.replace(/_/g, " ")}</Badge>
            {hasAlert && <Badge color="red" size="md">⚠ Alerte</Badge>}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <ProgressRing pct={el.progression} size={72} stroke={5} color={progColor} />
          <div style={{ fontSize: 16, fontWeight: 700, color: progColor, marginTop: 4 }}>{el.progression}%</div>
          <div style={{ fontSize: 10, color: c.textDim }}>Progression</div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
        <StatCard icon={Star} label="Moyenne" value={`${el.notes_moyennes}/20`} color={el.notes_moyennes >= 14 ? "emerald" : el.notes_moyennes >= 10 ? "amber" : "red"} />
        <StatCard icon={Target} label="Moy. pratique" value={`${moyP}/20`} color="gold" />
        <StatCard icon={BookOpen} label="Moy. théorique" value={`${moyT}/20`} color="blue" />
        <StatCard icon={Clock} label="Heures" value={`${el.heures_effectuees}/${el.heures_totales}`} color="cyan" />
        <StatCard icon={XCircle} label="Absences" value={el.absences} color={el.absences >= 3 ? "red" : "emerald"} />
        <StatCard icon={AlertCircle} label="Retards" value={el.retards} color={el.retards >= 4 ? "red" : "blue"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Évaluations */}
        <DetailSection title={`Évaluations (${el.evaluations.length})`} icon={BarChart3}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {el.evaluations.map(ev => {
              const expanded = expandedId === ev.id;
              return (
                <div key={ev.id} onClick={() => setExpandedId(expanded ? null : ev.id)} style={{
                  background: c.bgHover, borderRadius: 8, border: `1px solid ${expanded ? c.goldBorder : c.border}`,
                  cursor: "pointer", overflow: "hidden", transition: "all 0.15s",
                }}>
                  <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
                      background: ev.note >= 14 ? c.emeraldBg : ev.note >= 10 ? c.amberBg : c.redBg,
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: ev.note >= 14 ? c.emerald : ev.note >= 10 ? c.amber : c.red }}>{ev.note}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: c.text }}>{ev.matiere}</div>
                      <div style={{ fontSize: 10, color: c.textDim }}>{ev.date} • coeff {ev.coeff}</div>
                    </div>
                    <Badge color={ev.type === "Pratique" ? "gold" : "blue"} size="sm">{ev.type}</Badge>
                  </div>
                  {expanded && (
                    <div style={{ padding: "0 12px 10px", borderTop: `1px solid ${c.border}`, paddingTop: 8 }}>
                      <div style={{ fontSize: 11, color: c.textSec, lineHeight: 1.6 }}>{ev.commentaire}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DetailSection>

        {/* Infos & observations */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <DetailSection title="Informations" icon={User}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <InfoRow icon={MapPin} label="Salle" value={el.salle} />
              <InfoRow icon={Calendar} label="Période" value={`${el.date_debut} → ${el.date_fin}`} />
              <InfoRow icon={CreditCard} label="Financement" value={el.financement} />
              <InfoRow icon={DollarSign} label="Paiement" value={el.paiement_statut.replace(/_/g, " ")} color={el.paiement_statut === "A_JOUR" ? c.emerald : c.red} />
            </div>
          </DetailSection>

          {/* Observations formateur */}
          <div style={{ background: c.purpleBg, border: `1px solid rgba(188,140,255,0.2)`, borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <PenTool size={13} color={c.purple} />
              <span style={{ fontSize: 11, fontWeight: 700, color: c.purple, textTransform: "uppercase", letterSpacing: "0.06em" }}>Mes observations</span>
            </div>
            <div style={{ fontSize: 12, color: c.textSec, lineHeight: 1.7 }}>{el.observations}</div>
          </div>
        </div>
      </div>

      {/* Progression heures */}
      <DetailSection title="Avancement heures" icon={TrendingUp}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: c.textSec }}>{el.heures_effectuees}h effectuées</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: c.purple }}>{el.heures_totales}h prévues</span>
          </div>
          <div style={{ height: 8, background: c.bgHover, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${Math.round(el.heures_effectuees / el.heures_totales * 100)}%`, height: "100%", background: `linear-gradient(90deg, ${c.purple}, ${c.blue})`, borderRadius: 4 }} />
          </div>
        </div>
      </DetailSection>
    </div>
  );
};

// ── MES ÉLÈVES VIEW ────────────────────────────

const ElevesView = () => {
  const [search, setSearch] = useState("");
  const [filterSession, setFilterSession] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = MY_ELEVES.filter(el => {
    const match = `${el.prenom} ${el.nom} ${el.email} ${el.formation}`.toLowerCase().includes(search.toLowerCase());
    const matchS = filterSession === "all" || el.formation === filterSession;
    return match && matchS;
  });

  if (selected) return <EleveDetail eleve={selected} onBack={() => setSelected(null)} />;

  const sessions = [...new Set(MY_ELEVES.map(e => e.formation))];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 8, padding: "7px 12px" }}>
          <Search size={14} color={c.textDim} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un élève..." style={{ flex: 1, background: "none", border: "none", color: c.text, fontSize: 12, outline: "none" }} />
        </div>
        <button onClick={() => setFilterSession("all")} style={{
          padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600,
          background: filterSession === "all" ? c.purpleBg : c.bgCard,
          color: filterSession === "all" ? c.purple : c.textSec,
          border: `1px solid ${filterSession === "all" ? "rgba(188,140,255,0.2)" : c.border}`,
        }}>Tous</button>
        {sessions.map(s => (
          <button key={s} onClick={() => setFilterSession(s)} style={{
            padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600,
            background: filterSession === s ? c.purpleBg : c.bgCard,
            color: filterSession === s ? c.purple : c.textSec,
            border: `1px solid ${filterSession === s ? "rgba(188,140,255,0.2)" : c.border}`,
          }}>{s}</button>
        ))}
        <Badge color="purple">{filtered.length} élèves</Badge>
      </div>

      <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${c.border}` }}>
              {["Élève", "Formation", "Progression", "Moyenne", "Absences", "Retards", "Paiement", ""].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, color: c.textDim, textTransform: "uppercase", letterSpacing: "0.05em", background: c.bgCard, position: "sticky", top: 0, borderBottom: `1px solid ${c.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(el => {
              const hasAlert = el.absences >= 3 || el.paiement_statut === "RETARD" || el.notes_moyennes < 12;
              return (
                <tr key={el.id} onClick={() => setSelected(el)} style={{
                  borderBottom: `1px solid ${c.border}`, cursor: "pointer",
                  background: hasAlert ? "rgba(248,81,73,0.03)" : "transparent",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = c.bgHover}
                  onMouseLeave={e => e.currentTarget.style.background = hasAlert ? "rgba(248,81,73,0.03)" : "transparent"}
                >
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar prenom={el.prenom} nom={el.nom} size={30} accent={hasAlert ? c.red : c.emerald} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: c.text }}>{el.prenom} {el.nom}</div>
                        <div style={{ fontSize: 10, color: c.textDim }}>{el.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: c.textSec }}>{el.formation}</td>
                  <td style={{ padding: "10px 14px", minWidth: 90 }}><ScoreBar score={el.progression} /></td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: el.notes_moyennes >= 14 ? c.emerald : el.notes_moyennes >= 10 ? c.amber : c.red }}>{el.notes_moyennes}</span>
                    <span style={{ fontSize: 10, color: c.textDim }}>/20</span>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: el.absences >= 3 ? c.red : c.text }}>{el.absences}</span>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: el.retards >= 4 ? c.red : c.text }}>{el.retards}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <Badge color={el.paiement_statut === "A_JOUR" ? "emerald" : "red"} size="sm">{el.paiement_statut.replace(/_/g, " ")}</Badge>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {hasAlert && <AlertTriangle size={14} color={c.red} />}
                    <ChevronRight size={14} color={c.textDim} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── MES SESSIONS VIEW ──────────────────────────

const SessionsView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    {MY_SESSIONS.map(s => {
      const pct = Math.round(s.heures_effectuees / s.heures_totales * 100);
      const eleves = MY_ELEVES.filter(e => e.formation === s.formation);
      const moySession = (eleves.reduce((sum, e) => sum + e.notes_moyennes, 0) / eleves.length).toFixed(1);

      return (
        <div key={s.id} style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: `1px solid ${c.border}`, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: c.text }}>{s.formation}</div>
              <div style={{ fontSize: 12, color: c.textDim, marginTop: 3 }}>{s.session} • {s.salle}</div>
            </div>
            <Badge color="emerald" size="md">EN COURS</Badge>
          </div>

          <div style={{ padding: "16px 22px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
              <div style={{ background: c.bgHover, borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: c.text }}>{s.nb_eleves}</div>
                <div style={{ fontSize: 10, color: c.textDim }}>Élèves</div>
              </div>
              <div style={{ background: c.bgHover, borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: parseFloat(moySession) >= 14 ? c.emerald : c.amber }}>{moySession}/20</div>
                <div style={{ fontSize: 10, color: c.textDim }}>Moyenne session</div>
              </div>
              <div style={{ background: c.bgHover, borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: c.purple }}>{pct}%</div>
                <div style={{ fontSize: 10, color: c.textDim }}>Avancement</div>
              </div>
              <div style={{ background: c.bgHover, borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: c.amber }}>{s.prochaine_eval}</div>
                <div style={{ fontSize: 10, color: c.textDim }}>Prochaine éval</div>
              </div>
            </div>

            <div style={{ marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: c.textDim }}>Heures : {s.heures_effectuees}h / {s.heures_totales}h</span>
              <span style={{ fontSize: 10, color: c.textDim }}>{s.date_debut} → {s.date_fin}</span>
            </div>
            <div style={{ height: 6, background: c.bgHover, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${c.purple}, ${c.blue})`, borderRadius: 3 }} />
            </div>

            {/* Mini liste élèves */}
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {eleves.map(el => {
                const hasAlert = el.absences >= 3 || el.paiement_statut === "RETARD" || el.notes_moyennes < 12;
                return (
                  <div key={el.id} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "5px 10px",
                    borderRadius: 6, background: hasAlert ? c.redBg : c.bgHover,
                    border: `1px solid ${hasAlert ? "rgba(248,81,73,0.15)" : c.border}`,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: el.notes_moyennes >= 14 ? c.emerald : el.notes_moyennes >= 10 ? c.amber : c.red }} />
                    <span style={{ fontSize: 11, color: c.text }}>{el.prenom} {el.nom}</span>
                    <span style={{ fontSize: 10, color: c.textDim }}>{el.notes_moyennes}</span>
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

// ── ÉVALUATIONS VIEW ───────────────────────────

const EvaluationsView = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Upcoming */}
      <DetailSection title="Évaluations à venir" icon={Calendar}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
          {UPCOMING_EVALS.map(ev => (
            <div key={ev.id} style={{
              background: c.bgHover, borderRadius: 8, padding: 14, border: `1px solid ${c.border}`,
              borderLeft: `3px solid ${c.amber}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{ev.matiere}</div>
                  <div style={{ fontSize: 11, color: c.textDim, marginTop: 2 }}>{ev.formation}</div>
                </div>
                <Badge color={ev.type === "Pratique" ? "gold" : "blue"} size="sm">{ev.type}</Badge>
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 11, color: c.textSec }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} />{ev.date}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={11} />{ev.nb_eleves} élèves</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} />{ev.salle}</span>
              </div>
            </div>
          ))}
        </div>
      </DetailSection>

      {/* Résumé notes par élève */}
      <DetailSection title="Notes récentes — tous élèves" icon={BarChart3}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {MY_ELEVES.map(el => (
            <div key={el.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", borderRadius: 7, background: c.bgHover, border: `1px solid ${c.border}` }}>
              <Avatar prenom={el.prenom} nom={el.nom} size={28} accent={el.notes_moyennes >= 14 ? c.emerald : el.notes_moyennes >= 10 ? c.amber : c.red} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: c.text }}>{el.prenom} {el.nom}</div>
                <div style={{ fontSize: 10, color: c.textDim }}>{el.formation}</div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {el.evaluations.slice(-3).map(ev => (
                  <div key={ev.id} style={{
                    width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                    background: ev.note >= 14 ? c.emeraldBg : ev.note >= 10 ? c.amberBg : c.redBg,
                    fontSize: 10, fontWeight: 700, color: ev.note >= 14 ? c.emerald : ev.note >= 10 ? c.amber : c.red,
                  }}>{ev.note}</div>
                ))}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: el.notes_moyennes >= 14 ? c.emerald : el.notes_moyennes >= 10 ? c.amber : c.red, minWidth: 40, textAlign: "right" }}>{el.notes_moyennes}</span>
            </div>
          ))}
        </div>
      </DetailSection>
    </div>
  );
};

// ── PLANNING VIEW ──────────────────────────────

const PlanningView = () => {
  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
  const jourColors = { Lundi: c.blue, Mardi: c.purple, Mercredi: c.gold, Jeudi: c.emerald, Vendredi: c.cyan };
  const sessionColors = { "Sertissage N2": c.gold, "Joaillerie Création": c.purple, "Transversal": c.cyan };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 12 }}>
        <StatCard icon={Clock} label="Heures / semaine" value={`${CURRENT_FORMATEUR.heures_semaine}h`} color="purple" />
        <StatCard icon={Layers} label="Sessions actives" value={MY_SESSIONS.length} color="blue" />
        <StatCard icon={MapPin} label="Salles" value={CURRENT_FORMATEUR.salle} color="gold" />
      </div>

      <DetailSection title="Emploi du temps hebdomadaire" icon={Calendar}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {jours.map(jour => {
            const entry = MY_PLANNING.find(p => p.jour === jour);
            const jc = jourColors[jour];
            return (
              <div key={jour}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: jc }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.text, textTransform: "uppercase", letterSpacing: "0.04em" }}>{jour}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginLeft: 18 }}>
                  {(entry?.creneaux || []).map((cr, i) => {
                    const sc = sessionColors[cr.session] || c.textDim;
                    return (
                      <div key={i} style={{
                        background: c.bgHover, border: `1px solid ${c.border}`, borderRadius: 8,
                        padding: "10px 14px", borderLeft: `3px solid ${sc}`,
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: sc, marginBottom: 3 }}>{cr.horaire}</div>
                        <div style={{ fontSize: 12, color: c.text, fontWeight: 500 }}>{cr.matiere}</div>
                        <div style={{ fontSize: 10, color: c.textDim, marginTop: 2 }}>{cr.salle}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DetailSection>
    </div>
  );
};

// ── MAIN APP ───────────────────────────────────

export default function ABJFormateurPortal() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case "dashboard": return <DashboardView />;
      case "eleves": return <ElevesView />;
      case "sessions": return <SessionsView />;
      case "evaluations": return <EvaluationsView />;
      case "planning": return <PlanningView />;
      default: return <DashboardView />;
    }
  };

  const titles = {
    dashboard: "Mon tableau de bord",
    eleves: "Mes élèves",
    sessions: "Mes sessions",
    evaluations: "Évaluations",
    planning: "Mon planning",
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
        <div style={{
          padding: "14px 28px", borderBottom: `1px solid ${c.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: c.bgCard,
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.text }}>{titles[currentView]}</div>
            <div style={{ fontSize: 11, color: c.textDim, marginTop: 1 }}>Académie de Bijouterie Joaillerie — Espace Formateur</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", width: 34, height: 34, borderRadius: 7, cursor: "pointer", background: c.bgHover, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={15} color={c.textSec} />
            </div>
            <Avatar prenom={CURRENT_FORMATEUR.prenom} nom={CURRENT_FORMATEUR.nom} size={34} />
          </div>
        </div>

        <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
          {renderView()}
        </div>
      </div>

      <MarjorieChat />
    </div>
  );
}
