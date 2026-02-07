import { useState, useEffect, useRef } from "react";
import {
  Search, Users, Mail, FileText, DollarSign, Calendar,
  ChevronRight, ChevronDown, Filter, Bell, Settings,
  User, GraduationCap, Gem, Clock, CheckCircle, AlertCircle,
  XCircle, ArrowUpRight, ArrowDownRight, BarChart3, Eye,
  Send, Phone, MapPin, Star, Layers, Menu, X, Home,
  BookOpen, CreditCard, MessageSquare, Activity, LogOut,
  Plus, MoreVertical, RefreshCw, Download, TrendingUp,
  ChevronUp, Paperclip, Minimize2, Maximize2, UserCheck,
  School, Award, FolderOpen, PenTool, ArrowLeft, ChevronLeft,
  Hash, Target, Briefcase, FileCheck, UserX
} from "lucide-react";

// ═══════════════════════════════════════════════
// ABJ CRM v3 — Académie Bijouterie Joaillerie
// ═══════════════════════════════════════════════

// ── MOCK DATA ──────────────────────────────────

const MOCK_PROSPECTS = [
  { id: "martinclaire", nom: "Martin", prenom: "Claire", email: "claire.martin@outlook.fr", tel: "06 12 34 56 78", formation_souhaitee: "Joaillerie Création", statut: "NOUVEAU", financement: "unknown", source: "formulaire_contact", nb_echanges: 1, dernier_contact: "2026-02-05", date_premier_contact: "2026-02-05", resume_ia: "Souhaite se reconvertir dans la bijouterie, profil motivé" },
  { id: "moreaualex", nom: "Moreau", prenom: "Alexandre", email: "a.moreau@gmail.com", tel: "", formation_souhaitee: "Taille Lapidaire", statut: "NOUVEAU", financement: "unknown", source: "demande_directe", nb_echanges: 0, dernier_contact: "2026-02-05", date_premier_contact: "2026-02-05", resume_ia: "" },
  { id: "duhameltouria", nom: "Duhamel", prenom: "Touria", email: "duhameltouria@gmail.com", tel: "07 65 43 21 00", formation_souhaitee: "Sertissage N1", statut: "EN_ATTENTE_DOSSIER", financement: "OPCO", source: "formulaire_contact", nb_echanges: 2, dernier_contact: "2026-02-03", date_premier_contact: "2026-01-28", resume_ia: "Intéressée par le sertissage, demande financement OPCO" },
];

const MOCK_CANDIDATS = [
  { id: 1, id_prospect: "rebagliatolya", nom: "Rebagliato", prenom: "Lya", email: "rebagliato.lya@gmail.com", tel: "06 78 90 12 34", numero_dossier: "RELY15032001", formation: "CAP ATBJ", session: "Septembre 2026", statut_dossier: "RECU", statut_financement: "EN_ATTENTE", financement: "CPF", montant_total: 8500, montant_pec: 5000, reste_a_charge: 3500, score: 85, nb_echanges: 3, dernier_contact: "2026-02-04", date_candidature: "2026-01-20", documents: [{ type: "CV", statut: "RECU" }, { type: "LM", statut: "RECU" }, { type: "CNI", statut: "MANQUANT" }, { type: "Diplômes", statut: "MANQUANT" }], etapes: { entretien_tel: true, rdv_presentiel: false, test_technique: false, validation_pedagogique: false }, notes_ia: "Profil créatif avec expérience en design graphique. Très motivée pour une reconversion. A mentionné un projet personnel de création de bijoux depuis 2 ans. Points d'attention : documents CNI et diplômes manquants à relancer." },
  { id: 2, id_prospect: "bernardsofia", nom: "Bernard", prenom: "Sofia", email: "sofia.bernard@gmail.com", tel: "06 45 67 89 01", numero_dossier: "BESO05111998", formation: "CAP ATBJ", session: "Septembre 2026", statut_dossier: "COMPLET", statut_financement: "VALIDE", financement: "France Travail", montant_total: 8500, montant_pec: 8500, reste_a_charge: 0, score: 95, nb_echanges: 8, dernier_contact: "2026-02-01", date_candidature: "2026-01-05", documents: [{ type: "CV", statut: "VALIDE" }, { type: "LM", statut: "VALIDE" }, { type: "CNI", statut: "VALIDE" }, { type: "Diplômes", statut: "VALIDE" }], etapes: { entretien_tel: true, rdv_presentiel: true, test_technique: true, validation_pedagogique: true }, notes_ia: "Excellente candidate. Parcours solide, ancienne orfèvre amateur. Dossier complet et financement France Travail validé à 100%. Prête pour intégration en septembre." },
  { id: 3, id_prospect: "petitjulie", nom: "Petit", prenom: "Julie", email: "julie.petit@yahoo.fr", tel: "07 12 34 56 78", numero_dossier: "PEJU22071995", formation: "CAO/DAO", session: "Mars 2026", statut_dossier: "EN_COURS", statut_financement: "EN_ATTENTE", financement: "auto-financement", montant_total: 3200, montant_pec: 0, reste_a_charge: 3200, score: 60, nb_echanges: 4, dernier_contact: "2026-02-02", date_candidature: "2026-01-15", documents: [{ type: "CV", statut: "RECU" }, { type: "LM", statut: "MANQUANT" }, { type: "CNI", statut: "RECU" }, { type: "Diplômes", statut: "MANQUANT" }], etapes: { entretien_tel: true, rdv_presentiel: false, test_technique: false, validation_pedagogique: false }, notes_ia: "Intéressée par la modélisation 3D pour bijouterie. Background en architecture. Auto-financement : reste à charge intégral de 3200€. Relancer pour LM et diplômes, et planifier RDV présentiel." },
  { id: 4, id_prospect: "lefevremarie", nom: "Lefèvre", prenom: "Marie", email: "marie.lefevre@hotmail.fr", tel: "06 98 76 54 32", numero_dossier: "LEMA10091990", formation: "Gemmologie", session: "Septembre 2026", statut_dossier: "RECU", statut_financement: "EN_ATTENTE", financement: "CPF", montant_total: 4800, montant_pec: 3500, reste_a_charge: 1300, score: 75, nb_echanges: 5, dernier_contact: "2026-01-30", date_candidature: "2026-01-12", documents: [{ type: "CV", statut: "VALIDE" }, { type: "LM", statut: "RECU" }, { type: "CNI", statut: "VALIDE" }, { type: "Diplômes", statut: "MANQUANT" }], etapes: { entretien_tel: true, rdv_presentiel: true, test_technique: false, validation_pedagogique: false }, notes_ia: "Passionnée de pierres précieuses. Expérience dans le commerce de luxe. CPF en cours de validation, reste 1300€ à sa charge. Diplômes manquants à relancer. Test technique à planifier." },
  { id: 5, id_prospect: "garciainès", nom: "Garcia", prenom: "Inès", email: "ines.garcia@gmail.com", tel: "06 11 22 33 44", numero_dossier: "GAIN03051997", formation: "Sertissage N2", session: "Janvier 2026", statut_dossier: "COMPLET", statut_financement: "VALIDE", financement: "OPCO", montant_total: 5600, montant_pec: 5600, reste_a_charge: 0, score: 98, nb_echanges: 12, dernier_contact: "2026-01-28", date_candidature: "2025-12-01", documents: [{ type: "CV", statut: "VALIDE" }, { type: "LM", statut: "VALIDE" }, { type: "CNI", statut: "VALIDE" }, { type: "Diplômes", statut: "VALIDE" }], etapes: { entretien_tel: true, rdv_presentiel: true, test_technique: true, validation_pedagogique: true }, notes_ia: "Candidate exceptionnelle, déjà intégrée en formation Sertissage N2. Parcours complet, financement OPCO validé intégralement. Ancienne élève N1 avec excellents résultats." },
];

const MOCK_ELEVES = [
  { id: 1, nom: "Garcia", prenom: "Inès", email: "ines.garcia@gmail.com", tel: "06 11 22 33 44", numero_dossier: "GAIN03051997", formation: "Sertissage N2", session: "Janvier 2026", formateur: "M. Laurent", salle: "Atelier B", statut: "EN_FORMATION", progression: 68, date_debut: "2026-01-13", date_fin: "2026-06-30", heures_effectuees: 204, heures_totales: 300, prochaine_eval: "2026-02-15", notes_moyennes: 15.2, absences: 1, retards: 2, financement: "OPCO", paiement_statut: "A_JOUR", evaluations: [{ date: "2026-01-27", type: "Pratique", note: 16, commentaire: "Très bon travail sur le serti griffe" }, { date: "2026-02-03", type: "Théorique", note: 14.5, commentaire: "Connaissances solides en gemmologie appliquée" }], historique: ["13/01 — Début de formation", "27/01 — Évaluation pratique : 16/20", "03/02 — Évaluation théorique : 14.5/20", "10/02 — Absent (justifié)"] },
  { id: 2, nom: "Dubois", prenom: "Thomas", email: "thomas.dubois@gmail.com", tel: "07 55 66 77 88", numero_dossier: "DUTH12041993", formation: "CAP ATBJ", session: "Septembre 2025", formateur: "Mme. Petit", salle: "Atelier A", statut: "EN_FORMATION", progression: 82, date_debut: "2025-09-15", date_fin: "2026-06-30", heures_effectuees: 574, heures_totales: 700, prochaine_eval: "2026-02-20", notes_moyennes: 16.8, absences: 3, retards: 0, financement: "France Travail", paiement_statut: "A_JOUR", evaluations: [{ date: "2025-12-15", type: "Pratique", note: 17, commentaire: "Excellent travail de soudure et mise en forme" }, { date: "2026-01-20", type: "Théorique", note: 16.5, commentaire: "Très bonnes connaissances métallurgiques" }], historique: ["15/09 — Début de formation CAP", "15/12 — Évaluation pratique : 17/20", "20/01 — Évaluation théorique : 16.5/20", "05/02 — 3 absences cumulées"] },
  { id: 3, nom: "Roux", prenom: "Emma", email: "emma.roux@outlook.fr", tel: "06 33 44 55 66", numero_dossier: "ROEM25081999", formation: "Joaillerie Création", session: "Novembre 2025", formateur: "M. Laurent", salle: "Atelier C", statut: "EN_FORMATION", progression: 45, date_debut: "2025-11-04", date_fin: "2026-05-30", heures_effectuees: 135, heures_totales: 300, prochaine_eval: "2026-02-18", notes_moyennes: 14.5, absences: 0, retards: 1, financement: "CPF", paiement_statut: "A_JOUR", evaluations: [{ date: "2025-12-09", type: "Pratique", note: 14, commentaire: "Bon sens créatif, technique à perfectionner" }, { date: "2026-01-13", type: "Théorique", note: 15, commentaire: "Bonne compréhension du design joaillier" }], historique: ["04/11 — Début de formation", "09/12 — Évaluation pratique : 14/20", "13/01 — Évaluation théorique : 15/20"] },
  { id: 4, nom: "Leroy", prenom: "Camille", email: "camille.leroy@free.fr", tel: "06 77 88 99 00", numero_dossier: "LECA08121996", formation: "CAO/DAO", session: "Janvier 2026", formateur: "M. Nguyen", salle: "Salle Info", statut: "EN_FORMATION", progression: 30, date_debut: "2026-01-06", date_fin: "2026-04-30", heures_effectuees: 48, heures_totales: 160, prochaine_eval: "2026-02-12", notes_moyennes: 13.0, absences: 2, retards: 4, financement: "auto-financement", paiement_statut: "RETARD", evaluations: [{ date: "2026-01-20", type: "Pratique", note: 12, commentaire: "Difficultés sur Rhino3D, accompagnement renforcé" }, { date: "2026-02-03", type: "Théorique", note: 14, commentaire: "Bonne compréhension théorique malgré retards" }], historique: ["06/01 — Début de formation", "20/01 — Évaluation pratique : 12/20", "03/02 — Évaluation théorique : 14/20", "04/02 — 4ème retard signalé", "05/02 — Paiement en retard signalé"] },
];

const MOCK_FORMATEURS = [
  { id: 1, nom: "Laurent", prenom: "Philippe", specialite: "Sertissage & Joaillerie", email: "p.laurent@abj.fr", tel: "06 55 44 33 22", eleves_actifs: 8, sessions: ["Sertissage N2 - Jan 2026", "Joaillerie Création - Nov 2025"], salle: "Atelier B / C", bio: "20 ans d'expérience en haute joaillerie. Ancien maître artisan chez Cartier. Spécialiste du serti griffe et du serti clos. Formateur certifié depuis 2018.", eleves: ["Garcia Inès", "Roux Emma"], prochaines_evaluations: ["15/02 — Sertissage N2 (pratique)", "18/02 — Joaillerie Création (pratique)"], heures_semaine: 32 },
  { id: 2, nom: "Petit", prenom: "Isabelle", specialite: "CAP ATBJ", email: "i.petit@abj.fr", tel: "06 44 55 66 77", eleves_actifs: 12, sessions: ["CAP ATBJ - Sep 2025"], salle: "Atelier A", bio: "Formatrice référente du CAP Art et Techniques de la Bijouterie-Joaillerie. 15 ans d'expérience pédagogique. Jurée aux examens nationaux.", eleves: ["Dubois Thomas", "+11 autres"], prochaines_evaluations: ["20/02 — CAP ATBJ (théorique + pratique)"], heures_semaine: 35 },
  { id: 3, nom: "Nguyen", prenom: "David", specialite: "CAO/DAO 3D", email: "d.nguyen@abj.fr", tel: "07 88 99 00 11", eleves_actifs: 6, sessions: ["CAO/DAO - Jan 2026"], salle: "Salle Info", bio: "Expert en modélisation 3D joaillière (Rhino3D, MatrixGold). Background ingénieur, passionné par l'alliance du numérique et de l'artisanat.", eleves: ["Leroy Camille", "+5 autres"], prochaines_evaluations: ["12/02 — CAO/DAO (pratique Rhino3D)"], heures_semaine: 24 },
];

const MOCK_SESSIONS = [
  { id: 1, formation: "CAP ATBJ", session: "Septembre 2025", formateur: "Mme. Petit", salle: "Atelier A", places_total: 15, places_prises: 12, date_debut: "2025-09-15", date_fin: "2026-06-30", statut: "EN_COURS" },
  { id: 2, formation: "Sertissage N2", session: "Janvier 2026", formateur: "M. Laurent", salle: "Atelier B", places_total: 8, places_prises: 8, date_debut: "2026-01-13", date_fin: "2026-06-30", statut: "EN_COURS" },
  { id: 3, formation: "CAO/DAO", session: "Janvier 2026", formateur: "M. Nguyen", salle: "Salle Info", places_total: 10, places_prises: 6, date_debut: "2026-01-06", date_fin: "2026-04-30", statut: "EN_COURS" },
  { id: 4, formation: "Joaillerie Création", session: "Novembre 2025", formateur: "M. Laurent", salle: "Atelier C", places_total: 8, places_prises: 5, date_debut: "2025-11-04", date_fin: "2026-05-30", statut: "EN_COURS" },
  { id: 5, formation: "CAP ATBJ", session: "Septembre 2026", formateur: "Mme. Petit", salle: "Atelier A", places_total: 15, places_prises: 3, date_debut: "2026-09-14", date_fin: "2027-06-30", statut: "INSCRIPTIONS_OUVERTES" },
  { id: 6, formation: "Sertissage N1", session: "Mars 2026", formateur: "M. Laurent", salle: "Atelier B", places_total: 8, places_prises: 1, date_debut: "2026-03-09", date_fin: "2026-08-30", statut: "INSCRIPTIONS_OUVERTES" },
];

const MOCK_STATS = {
  prospects_total: MOCK_PROSPECTS.length,
  candidats_total: MOCK_CANDIDATS.length,
  eleves_total: MOCK_ELEVES.length,
  dossiers_complets: MOCK_CANDIDATS.filter(c => c.statut_dossier === "COMPLET").length,
  taux_conversion: 62,
  ca_realise: 18600,
  ca_previsionnel: 36100,
  formations_demandees: { "CAP ATBJ": 3, "Sertissage": 2, "CAO/DAO": 2, "Joaillerie": 1, "Gemmologie": 1, "Lapidaire": 1 },
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

const statutColor = (s) => ({ NOUVEAU: "blue", CANDIDAT: "gold", EN_ATTENTE_DOSSIER: "amber", COMPLET: "emerald", RECU: "gold", EN_COURS: "amber", AUCUN: "red", TRAITE: "emerald", ENVOYE: "emerald", BROUILLON_PRET: "amber", EN_FORMATION: "emerald", VALIDE: "emerald", EN_ATTENTE: "amber", MANQUANT: "red", A_JOUR: "emerald", RETARD: "red", INSCRIPTIONS_OUVERTES: "blue" }[s] || "blue");

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
    background: `linear-gradient(135deg, ${c.goldDark}50, ${c.gold}20)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    border: `1px solid ${c.goldBorder}`, fontSize: size * 0.33, fontWeight: 700, color: c.gold,
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

const BackButton = ({ onClick, label }) => (
  <div onClick={onClick} style={{
    display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
    padding: "6px 12px", borderRadius: 7, background: c.bgHover, border: `1px solid ${c.border}`,
    marginBottom: 16, transition: "all 0.15s",
  }}
    onMouseEnter={e => { e.currentTarget.style.background = c.bgAccent; e.currentTarget.style.borderColor = c.goldBorder; }}
    onMouseLeave={e => { e.currentTarget.style.background = c.bgHover; e.currentTarget.style.borderColor = c.border; }}
  >
    <ChevronLeft size={14} color={c.gold} />
    <span style={{ fontSize: 12, fontWeight: 500, color: c.textSec }}>{label || "Retour"}</span>
  </div>
);

const DetailSection = ({ title, children }) => (
  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, overflow: "hidden" }}>
    <div style={{ padding: "12px 18px", borderBottom: `1px solid ${c.border}`, background: c.bgAccent }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: c.textDim, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</span>
    </div>
    <div style={{ padding: "16px 18px" }}>{children}</div>
  </div>
);

// ── SIDEBAR ────────────────────────────────────

const Sidebar = ({ currentView, onNavigate, collapsed, onToggle }) => {
  const navItems = [
    { id: "dashboard", icon: Home, label: "Tableau de bord" },
    { id: "prospects", icon: Users, label: "Prospects", count: MOCK_PROSPECTS.length },
    { id: "candidats", icon: UserCheck, label: "Candidats", count: MOCK_CANDIDATS.length },
    { id: "eleves", icon: School, label: "Élèves", count: MOCK_ELEVES.length },
    { id: "planning", icon: Calendar, label: "Planning & Sessions" },
    { id: "formateurs", icon: Award, label: "Formateurs" },
    { id: "finances", icon: CreditCard, label: "Finances" },
  ];

  return (
    <div style={{
      width: collapsed ? 60 : 220, minHeight: "100vh",
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
            <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>ABJ CRM</div>
            <div style={{ fontSize: 9, color: c.gold, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Joaillerie</div>
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
              background: active ? c.goldBg : "transparent",
              border: active ? `1px solid ${c.goldBorder}` : "1px solid transparent",
              color: active ? c.gold : c.textSec,
              transition: "all 0.15s", position: "relative",
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = c.bgHover; e.currentTarget.style.color = c.text; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textSec; } }}
            >
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, flex: 1 }}>{item.label}</span>}
              {!collapsed && item.count > 0 && (
                <span style={{ fontSize: 9, fontWeight: 700, color: active ? c.gold : c.textDim, background: active ? `${c.gold}18` : c.bgHover, padding: "1px 6px", borderRadius: 4 }}>{item.count}</span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        padding: collapsed ? "12px 10px" : "12px 16px",
        borderTop: `1px solid ${c.border}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7, flexShrink: 0,
          background: `linear-gradient(135deg, ${c.purple}, ${c.blue})`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <User size={12} color="#fff" />
        </div>
        {!collapsed && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.text }}>Admin ABJ</div>
            <div style={{ fontSize: 9, color: c.textDim }}>Direction</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── MARJORIE CHAT ──────────────────────────────

const MarjorieChat = ({ role = "admin" }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "marjorie", text: "Bonjour ! Je suis Marjorie, assistante IA de l'ABJ. Comment puis-je vous aider ?" }
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
        "J'ai vérifié la base : 3 nouveaux prospects cette semaine, dont Claire Martin qui semble très motivée pour la Joaillerie Création.",
        "Le dossier de Lya Rebagliato est en attente de la CNI et des diplômes. Je peux lui envoyer une relance si vous voulez.",
        "Côté finances, 2 dossiers OPCO sont en attente de validation. Le CA prévisionnel est de 36 100€ pour le trimestre.",
        "La session CAP ATBJ de septembre 2026 a déjà 3 inscriptions sur 15 places.",
      ];
      setTyping(false);
      setMessages(prev => [...prev, { from: "marjorie", text: pool[Math.floor(Math.random() * pool.length)] }]);
    }, 1200 + Math.random() * 800);
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
          <div style={{ fontSize: 10, color: c.gold }}>Assistante IA</div>
        </div>
        <X size={18} color={c.textSec} style={{ cursor: "pointer" }} onClick={() => setOpen(false)} />
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.from === "user" ? "flex-end" : "flex-start", maxWidth: "82%" }}>
            <div style={{
              padding: "10px 14px", borderRadius: 12,
              background: msg.from === "user" ? `${c.gold}18` : c.bgHover,
              border: `1px solid ${msg.from === "user" ? `${c.gold}30` : c.border}`,
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
          placeholder="Demander à Marjorie..." style={{ flex: 1, background: c.bgHover, border: `1px solid ${c.border}`, borderRadius: 8, padding: "9px 12px", color: c.text, fontSize: 12, outline: "none" }} />
        <div onClick={sendMessage} style={{ width: 34, height: 34, borderRadius: 8, cursor: "pointer", background: `linear-gradient(135deg, ${c.gold}, ${c.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Send size={14} color="#fff" />
        </div>
      </div>
    </div>
  );
};

// ── DASHBOARD VIEW ─────────────────────────────

const DashboardView = ({ onNavigate }) => {
  const fd = Object.entries(MOCK_STATS.formations_demandees);
  const maxF = Math.max(...fd.map(([, v]) => v));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard icon={Users} label="Prospects" value={MOCK_STATS.prospects_total} sub="+3 cette semaine" color="blue" />
        <StatCard icon={UserCheck} label="Candidats actifs" value={MOCK_STATS.candidats_total} color="gold" />
        <StatCard icon={School} label="Élèves en formation" value={MOCK_STATS.eleves_total} color="emerald" />
        <StatCard icon={CheckCircle} label="Dossiers complets" value={MOCK_STATS.dossiers_complets} color="emerald" />
        <StatCard icon={TrendingUp} label="Taux conversion" value={`${MOCK_STATS.taux_conversion}%`} sub="↑ 8% vs mois dernier" color="gold" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>Derniers prospects</span>
            <span onClick={() => onNavigate("prospects")} style={{ fontSize: 11, color: c.gold, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>Voir tout <ChevronRight size={12} /></span>
          </div>
          {MOCK_PROSPECTS.slice(0, 4).map((p, i) => (
            <div key={p.id} style={{ padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, borderBottom: i < 3 ? `1px solid ${c.border}` : "none" }}>
              <Avatar prenom={p.prenom} nom={p.nom} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: c.text }}>{p.prenom} {p.nom}</div>
                <div style={{ fontSize: 10, color: c.textDim }}>{p.formation_souhaitee}</div>
              </div>
              <Badge color={statutColor(p.statut)} size="sm">{p.statut.replace(/_/g, " ")}</Badge>
            </div>
          ))}
        </div>

        <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>Formations demandées</span>
            <Badge color="gold">{fd.length} formations</Badge>
          </div>
          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
            {fd.map(([name, count]) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: c.text }}>{name}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: c.gold }}>{count}</span>
                </div>
                <div style={{ height: 5, background: c.bgHover, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${(count / maxF) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${c.goldDark}, ${c.gold})`, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <StatCard icon={DollarSign} label="CA réalisé" value={`${MOCK_STATS.ca_realise.toLocaleString("fr")}€`} sub="Encaissé ce trimestre" color="emerald" />
        <StatCard icon={TrendingUp} label="CA prévisionnel" value={`${MOCK_STATS.ca_previsionnel.toLocaleString("fr")}€`} sub="Basé sur dossiers en cours" color="amber" />
      </div>
    </div>
  );
};

// ── PROSPECTS VIEW ─────────────────────────────

const ProspectsView = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = MOCK_PROSPECTS.filter(p =>
    `${p.prenom} ${p.nom} ${p.email} ${p.formation_souhaitee}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", gap: 14, height: "calc(100vh - 130px)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 8, padding: "7px 12px" }}>
            <Search size={14} color={c.textDim} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un prospect..." style={{ flex: 1, background: "none", border: "none", color: c.text, fontSize: 12, outline: "none" }} />
          </div>
          <Badge color="blue">{filtered.length} prospects</Badge>
        </div>

        <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, overflow: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                {["Prospect", "Formation souhaitée", "Statut", "Source", "Échanges", "Dernier contact"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, color: c.textDim, textTransform: "uppercase", letterSpacing: "0.05em", background: c.bgCard, position: "sticky", top: 0, borderBottom: `1px solid ${c.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} onClick={() => setSelected(p)} style={{ borderBottom: `1px solid ${c.border}`, cursor: "pointer", background: selected?.id === p.id ? c.goldBg : "transparent" }}
                  onMouseEnter={e => { if (selected?.id !== p.id) e.currentTarget.style.background = c.bgHover; }}
                  onMouseLeave={e => { if (selected?.id !== p.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar prenom={p.prenom} nom={p.nom} size={30} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: c.text }}>{p.prenom} {p.nom}</div>
                        <div style={{ fontSize: 10, color: c.textDim }}>{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: c.textSec }}>{p.formation_souhaitee}</td>
                  <td style={{ padding: "10px 14px" }}><Badge color={statutColor(p.statut)}>{p.statut.replace(/_/g, " ")}</Badge></td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: c.textDim }}>{p.source.replace(/_/g, " ")}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: c.textSec, textAlign: "center" }}>{p.nb_echanges}</td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: c.textDim }}>{p.dernier_contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div style={{ width: 300, background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, overflow: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: c.text }}>{selected.prenom} {selected.nom}</div>
              <div style={{ fontSize: 11, color: c.textDim, marginTop: 3 }}>{selected.email}</div>
            </div>
            <X size={16} color={c.textDim} style={{ cursor: "pointer" }} onClick={() => setSelected(null)} />
          </div>
          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
            <InfoRow icon={BookOpen} label="Formation souhaitée" value={selected.formation_souhaitee} />
            <InfoRow icon={CreditCard} label="Financement" value={selected.financement} />
            <InfoRow icon={Phone} label="Téléphone" value={selected.tel} />
            <InfoRow icon={MessageSquare} label="Échanges" value={selected.nb_echanges} />
            <InfoRow icon={Clock} label="Premier contact" value={selected.date_premier_contact} />
            {selected.resume_ia && (
              <div style={{ marginTop: 8, padding: 10, background: c.goldBg, border: `1px solid ${c.goldBorder}`, borderRadius: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: c.gold, marginBottom: 4 }}>RÉSUMÉ IA</div>
                <div style={{ fontSize: 11, color: c.textSec, lineHeight: 1.5 }}>{selected.resume_ia}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── CANDIDAT DETAIL (FICHE COMPLÈTE) ──────────

const CandidatDetail = ({ candidat, onBack }) => {
  const ca = candidat;
  const docsValides = ca.documents.filter(d => d.statut === "VALIDE").length;
  const docsTotal = ca.documents.length;
  const etapesDone = Object.values(ca.etapes).filter(Boolean).length;
  const etapesTotal = Object.values(ca.etapes).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BackButton onClick={onBack} label="Retour aux candidats" />

      {/* Header */}
      <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 12, padding: "24px 28px", display: "flex", alignItems: "center", gap: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: `radial-gradient(circle, ${c.gold}08 0%, transparent 70%)`, borderRadius: "50%" }} />
        <Avatar prenom={ca.prenom} nom={ca.nom} size={56} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: c.text }}>{ca.prenom} {ca.nom}</div>
          <div style={{ fontSize: 12, color: c.textDim, marginTop: 3 }}>{ca.email} {ca.tel ? `• ${ca.tel}` : ""}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Badge color={statutColor(ca.statut_dossier)} size="md">{ca.statut_dossier.replace(/_/g, " ")}</Badge>
            <Badge color={statutColor(ca.statut_financement)} size="md">{ca.financement} — {ca.statut_financement.replace(/_/g, " ")}</Badge>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <ProgressRing pct={ca.score} size={72} stroke={5} color={ca.score >= 80 ? c.emerald : ca.score >= 50 ? c.gold : c.red} />
          <div style={{ fontSize: 11, color: c.textDim, marginTop: 4 }}>Score</div>
        </div>
      </div>

      {/* Top metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <StatCard icon={Hash} label="N° Dossier" value={ca.numero_dossier} color="gold" />
        <StatCard icon={BookOpen} label="Formation" value={ca.formation} sub={ca.session} color="blue" />
        <StatCard icon={Calendar} label="Candidature" value={ca.date_candidature} sub={`Dernier contact : ${ca.dernier_contact}`} color="purple" />
        <StatCard icon={MessageSquare} label="Échanges" value={ca.nb_echanges} color="cyan" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Parcours admission */}
        <DetailSection title="Parcours d'admission">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, color: c.textSec, marginBottom: 4 }}>{etapesDone}/{etapesTotal} étapes complétées</div>
            {[
              { key: "entretien_tel", label: "Entretien téléphonique", icon: Phone },
              { key: "rdv_presentiel", label: "RDV présentiel", icon: MapPin },
              { key: "test_technique", label: "Test technique", icon: PenTool },
              { key: "validation_pedagogique", label: "Validation pédagogique", icon: CheckCircle },
            ].map((step, i) => (
              <div key={step.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 7, background: ca.etapes[step.key] ? c.emeraldBg : c.bgHover, border: `1px solid ${ca.etapes[step.key] ? "rgba(63,185,80,0.15)" : c.border}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: ca.etapes[step.key] ? `${c.emerald}20` : `${c.textDim}10` }}>
                  {ca.etapes[step.key] ? <CheckCircle size={14} color={c.emerald} /> : <step.icon size={14} color={c.textDim} />}
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: ca.etapes[step.key] ? c.text : c.textDim }}>{step.label}</span>
                {ca.etapes[step.key] && <span style={{ marginLeft: "auto", fontSize: 10, color: c.emerald, fontWeight: 600 }}>✓</span>}
              </div>
            ))}
          </div>
        </DetailSection>

        {/* Documents */}
        <DetailSection title={`Documents (${docsValides}/${docsTotal} validés)`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ca.documents.map(doc => (
              <div key={doc.type} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 7, background: c.bgHover, border: `1px solid ${c.border}` }}>
                <FileText size={16} color={doc.statut === "VALIDE" ? c.emerald : doc.statut === "MANQUANT" ? c.red : c.gold} />
                <span style={{ flex: 1, fontSize: 12, color: c.text, fontWeight: 500 }}>{doc.type}</span>
                <Badge color={statutColor(doc.statut)} size="sm">{doc.statut}</Badge>
              </div>
            ))}
          </div>
        </DetailSection>
      </div>

      {/* Financier */}
      <DetailSection title="Détail financier">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div style={{ background: c.bgHover, borderRadius: 8, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: c.text }}>{ca.montant_total.toLocaleString("fr")}€</div>
            <div style={{ fontSize: 10, color: c.textDim, marginTop: 3 }}>Total formation</div>
          </div>
          <div style={{ background: c.bgHover, borderRadius: 8, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: c.emerald }}>{ca.montant_pec.toLocaleString("fr")}€</div>
            <div style={{ fontSize: 10, color: c.textDim, marginTop: 3 }}>Prise en charge</div>
          </div>
          <div style={{ background: c.bgHover, borderRadius: 8, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: ca.reste_a_charge > 0 ? c.amber : c.emerald }}>{ca.reste_a_charge.toLocaleString("fr")}€</div>
            <div style={{ fontSize: 10, color: c.textDim, marginTop: 3 }}>Reste à charge</div>
          </div>
        </div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <CreditCard size={14} color={c.textDim} />
          <span style={{ fontSize: 12, color: c.textSec }}>Mode de financement :</span>
          <Badge color="gold" size="md">{ca.financement}</Badge>
        </div>
      </DetailSection>

      {/* Notes IA */}
      {ca.notes_ia && (
        <div style={{ background: c.goldBg, border: `1px solid ${c.goldBorder}`, borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Gem size={14} color={c.gold} />
            <span style={{ fontSize: 11, fontWeight: 700, color: c.gold, textTransform: "uppercase", letterSpacing: "0.06em" }}>Analyse Marjorie</span>
          </div>
          <div style={{ fontSize: 12, color: c.textSec, lineHeight: 1.7 }}>{ca.notes_ia}</div>
        </div>
      )}
    </div>
  );
};

// ── CANDIDATS VIEW ─────────────────────────────

const CandidatsView = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = MOCK_CANDIDATS.filter(ca => {
    const match = `${ca.prenom} ${ca.nom} ${ca.email} ${ca.numero_dossier} ${ca.formation}`.toLowerCase().includes(search.toLowerCase());
    const matchF = filter === "all" || ca.statut_dossier === filter;
    return match && matchF;
  });

  if (selected) return <CandidatDetail candidat={selected} onBack={() => setSelected(null)} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "calc(100vh - 130px)" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 8, padding: "7px 12px" }}>
          <Search size={14} color={c.textDim} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, dossier, formation..." style={{ flex: 1, background: "none", border: "none", color: c.text, fontSize: 12, outline: "none" }} />
        </div>
        {["all", "RECU", "EN_COURS", "COMPLET"].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600,
            background: filter === s ? c.goldBg : c.bgCard,
            color: filter === s ? c.gold : c.textSec,
            border: `1px solid ${filter === s ? c.goldBorder : c.border}`,
          }}>{s === "all" ? "Tous" : s.replace(/_/g, " ")}</button>
        ))}
        <Badge color="gold">{filtered.length} candidats</Badge>
      </div>

      <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, overflow: "auto", flex: 1 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${c.border}` }}>
              {["Candidat", "N° Dossier", "Formation", "Dossier", "Financement", "Score", "Candidature"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, color: c.textDim, textTransform: "uppercase", letterSpacing: "0.05em", background: c.bgCard, position: "sticky", top: 0, borderBottom: `1px solid ${c.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(ca => (
              <tr key={ca.id} onClick={() => setSelected(ca)} style={{ borderBottom: `1px solid ${c.border}`, cursor: "pointer", background: "transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = c.bgHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar prenom={ca.prenom} nom={ca.nom} size={30} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: c.text }}>{ca.prenom} {ca.nom}</div>
                      <div style={{ fontSize: 10, color: c.textDim }}>{ca.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "10px 14px" }}><span style={{ fontSize: 11, fontFamily: "monospace", color: c.gold, background: c.goldBg, padding: "2px 6px", borderRadius: 4 }}>{ca.numero_dossier}</span></td>
                <td style={{ padding: "10px 14px", fontSize: 11, color: c.textSec }}>{ca.formation}</td>
                <td style={{ padding: "10px 14px" }}><Badge color={statutColor(ca.statut_dossier)}>{ca.statut_dossier}</Badge></td>
                <td style={{ padding: "10px 14px" }}><Badge color={statutColor(ca.statut_financement)}>{ca.statut_financement}</Badge></td>
                <td style={{ padding: "10px 14px", minWidth: 90 }}><ScoreBar score={ca.score} /></td>
                <td style={{ padding: "10px 14px", fontSize: 11, color: c.textDim }}>{ca.date_candidature}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── ÉLÈVE DETAIL (FICHE COMPLÈTE) ─────────────

const EleveDetail = ({ eleve, onBack }) => {
  const el = eleve;
  const progColor = el.progression >= 70 ? c.emerald : el.progression >= 40 ? c.gold : c.amber;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BackButton onClick={onBack} label="Retour aux élèves" />

      {/* Header */}
      <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 12, padding: "24px 28px", display: "flex", alignItems: "center", gap: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: `radial-gradient(circle, ${c.emerald}08 0%, transparent 70%)`, borderRadius: "50%" }} />
        <Avatar prenom={el.prenom} nom={el.nom} size={56} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: c.text }}>{el.prenom} {el.nom}</div>
          <div style={{ fontSize: 12, color: c.textDim, marginTop: 3 }}>{el.email} • {el.tel}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Badge color="emerald" size="md">EN FORMATION</Badge>
            <Badge color="blue" size="md">{el.formation} — {el.session}</Badge>
            <Badge color={el.paiement_statut === "A_JOUR" ? "emerald" : "red"} size="md">Paiement {el.paiement_statut.replace(/_/g, " ")}</Badge>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <ProgressRing pct={el.progression} size={80} stroke={6} color={progColor} />
          <div style={{ fontSize: 18, fontWeight: 700, color: progColor, marginTop: 4 }}>{el.progression}%</div>
          <div style={{ fontSize: 10, color: c.textDim }}>Progression</div>
        </div>
      </div>

      {/* Metrics row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <StatCard icon={Star} label="Moyenne générale" value={`${el.notes_moyennes}/20`} color={el.notes_moyennes >= 14 ? "emerald" : "amber"} />
        <StatCard icon={Clock} label="Heures effectuées" value={`${el.heures_effectuees}/${el.heures_totales}`} sub={`${Math.round(el.heures_effectuees / el.heures_totales * 100)}% complété`} color="blue" />
        <StatCard icon={XCircle} label="Absences" value={el.absences} color={el.absences > 2 ? "red" : "emerald"} />
        <StatCard icon={Clock} label="Retards" value={el.retards} color={el.retards > 3 ? "red" : "blue"} />
        <StatCard icon={Calendar} label="Prochaine éval." value={el.prochaine_eval} color="amber" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Informations formation */}
        <DetailSection title="Formation & encadrement">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <InfoRow icon={BookOpen} label="Formation" value={el.formation} />
            <InfoRow icon={Calendar} label="Session" value={el.session} />
            <InfoRow icon={Award} label="Formateur" value={el.formateur} />
            <InfoRow icon={MapPin} label="Salle" value={el.salle} />
            <InfoRow icon={Calendar} label="Début" value={el.date_debut} />
            <InfoRow icon={Calendar} label="Fin prévue" value={el.date_fin} />
            <InfoRow icon={CreditCard} label="Financement" value={el.financement} />
            <InfoRow icon={Hash} label="N° Dossier" value={el.numero_dossier} />
          </div>
        </DetailSection>

        {/* Évaluations */}
        <DetailSection title="Évaluations">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(el.evaluations || []).map((ev, i) => (
              <div key={i} style={{ background: c.bgHover, borderRadius: 8, padding: 12, border: `1px solid ${c.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Badge color={ev.type === "Pratique" ? "gold" : "blue"} size="sm">{ev.type}</Badge>
                    <span style={{ fontSize: 11, color: c.textDim }}>{ev.date}</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: ev.note >= 14 ? c.emerald : ev.note >= 10 ? c.amber : c.red }}>{ev.note}/20</span>
                </div>
                <div style={{ fontSize: 11, color: c.textSec, lineHeight: 1.5 }}>{ev.commentaire}</div>
              </div>
            ))}
            {(!el.evaluations || el.evaluations.length === 0) && (
              <div style={{ fontSize: 12, color: c.textDim, padding: 12, textAlign: "center" }}>Aucune évaluation enregistrée</div>
            )}
          </div>
        </DetailSection>
      </div>

      {/* Historique */}
      <DetailSection title="Historique">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {(el.historique || []).map((event, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "8px 0", borderBottom: i < (el.historique || []).length - 1 ? `1px solid ${c.border}` : "none" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.gold, marginTop: 4, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: c.textSec, lineHeight: 1.5 }}>{event}</span>
            </div>
          ))}
        </div>
      </DetailSection>
    </div>
  );
};

// ── ÉLÈVES VIEW ────────────────────────────────

const ElevesView = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = MOCK_ELEVES.filter(el =>
    `${el.prenom} ${el.nom} ${el.email} ${el.formation}`.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) return <EleveDetail eleve={selected} onBack={() => setSelected(null)} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 8, padding: "7px 12px" }}>
          <Search size={14} color={c.textDim} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un élève..." style={{ flex: 1, background: "none", border: "none", color: c.text, fontSize: 12, outline: "none" }} />
        </div>
        <Badge color="emerald">{filtered.length} élèves en formation</Badge>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {filtered.map(el => (
          <div key={el.id} onClick={() => setSelected(el)} style={{
            background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, padding: 16, cursor: "pointer", transition: "all 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = c.goldBorder}
            onMouseLeave={e => e.currentTarget.style.borderColor = c.border}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Avatar prenom={el.prenom} nom={el.nom} size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{el.prenom} {el.nom}</div>
                <div style={{ fontSize: 10, color: c.textDim }}>{el.formation} • {el.session}</div>
              </div>
              <ProgressRing pct={el.progression} size={40} stroke={3} color={el.progression >= 70 ? c.emerald : el.progression >= 40 ? c.gold : c.amber} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {[
                { val: el.notes_moyennes, label: "Moyenne" },
                { val: el.heures_effectuees, label: "Heures" },
                { val: el.absences, label: "Absences", color: el.absences > 2 ? c.red : c.text },
              ].map(({ val, label, color: col }) => (
                <div key={label} style={{ background: c.bgHover, borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: col || c.text }}>{val}</div>
                  <div style={{ fontSize: 9, color: c.textDim }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: c.textDim }}>Progression</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: c.gold }}>{el.progression}%</span>
              </div>
              <div style={{ height: 4, background: c.bgHover, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${el.progression}%`, height: "100%", background: `linear-gradient(90deg, ${c.goldDark}, ${c.gold})`, borderRadius: 2 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── FORMATEUR DETAIL (FICHE COMPLÈTE) ─────────

const FormateurDetail = ({ formateur, onBack }) => {
  const f = formateur;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BackButton onClick={onBack} label="Retour aux formateurs" />

      {/* Header */}
      <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 12, padding: "24px 28px", display: "flex", alignItems: "center", gap: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: `radial-gradient(circle, ${c.purple}08 0%, transparent 70%)`, borderRadius: "50%" }} />
        <div style={{
          width: 64, height: 64, borderRadius: 14, flexShrink: 0,
          background: `linear-gradient(135deg, ${c.purpleBg}, ${c.blueBg})`,
          border: `1px solid rgba(188,140,255,0.2)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Award size={28} color={c.purple} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: c.text }}>{f.prenom} {f.nom}</div>
          <div style={{ fontSize: 13, color: c.purple, fontWeight: 600, marginTop: 3 }}>{f.specialite}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Badge color="purple" size="md">Formateur</Badge>
            <Badge color="blue" size="md">{f.eleves_actifs} élèves</Badge>
            <Badge color="gold" size="md">{f.heures_semaine}h / semaine</Badge>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <StatCard icon={School} label="Élèves actifs" value={f.eleves_actifs} color="blue" />
        <StatCard icon={Clock} label="Heures / semaine" value={`${f.heures_semaine}h`} color="gold" />
        <StatCard icon={Layers} label="Sessions actives" value={f.sessions.length} color="purple" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Contact & infos */}
        <DetailSection title="Coordonnées">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <InfoRow icon={Mail} label="Email" value={f.email} />
            <InfoRow icon={Phone} label="Téléphone" value={f.tel} />
            <InfoRow icon={MapPin} label="Salle(s)" value={f.salle} />
          </div>
        </DetailSection>

        {/* Sessions */}
        <DetailSection title="Sessions en cours">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {f.sessions.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 7, background: c.bgHover, border: `1px solid ${c.border}` }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.gold, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: c.text, fontWeight: 500 }}>{s}</span>
              </div>
            ))}
          </div>
        </DetailSection>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Élèves */}
        <DetailSection title="Élèves suivis">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(f.eleves || []).map((el, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 7, background: c.bgHover, border: `1px solid ${c.border}` }}>
                <User size={14} color={c.blue} />
                <span style={{ fontSize: 12, color: c.text }}>{el}</span>
              </div>
            ))}
          </div>
        </DetailSection>

        {/* Prochaines évaluations */}
        <DetailSection title="Prochaines évaluations">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(f.prochaines_evaluations || []).map((ev, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 7, background: c.amberBg, border: `1px solid rgba(210,153,34,0.15)` }}>
                <Calendar size={14} color={c.amber} />
                <span style={{ fontSize: 12, color: c.text }}>{ev}</span>
              </div>
            ))}
          </div>
        </DetailSection>
      </div>

      {/* Bio */}
      {f.bio && (
        <DetailSection title="Biographie">
          <div style={{ fontSize: 12, color: c.textSec, lineHeight: 1.7 }}>{f.bio}</div>
        </DetailSection>
      )}
    </div>
  );
};

// ── FORMATEURS VIEW ────────────────────────────

const FormateursView = () => {
  const [selected, setSelected] = useState(null);

  if (selected) return <FormateurDetail formateur={selected} onBack={() => setSelected(null)} />;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
      {MOCK_FORMATEURS.map(f => (
        <div key={f.id} onClick={() => setSelected(f)} style={{
          background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, padding: 18, cursor: "pointer", transition: "all 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = c.goldBorder}
          onMouseLeave={e => e.currentTarget.style.borderColor = c.border}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: `linear-gradient(135deg, ${c.purpleBg}, ${c.blueBg})`,
              border: `1px solid rgba(188,140,255,0.2)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Award size={20} color={c.purple} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{f.prenom} {f.nom}</div>
              <div style={{ fontSize: 11, color: c.purple, fontWeight: 500 }}>{f.specialite}</div>
            </div>
            <ChevronRight size={16} color={c.textDim} style={{ marginLeft: "auto" }} />
          </div>
          <InfoRow icon={Mail} label="Email" value={f.email} />
          <InfoRow icon={Phone} label="Téléphone" value={f.tel} />
          <InfoRow icon={School} label="Élèves actifs" value={f.eleves_actifs} />
          <InfoRow icon={MapPin} label="Salle(s)" value={f.salle} />
          <div style={{ marginTop: 10 }}>
            <SectionTitle>Sessions en cours</SectionTitle>
            {f.sessions.map(s => (
              <div key={s} style={{ fontSize: 11, color: c.textSec, padding: "3px 0", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: c.gold }} />{s}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── PLANNING VIEW ──────────────────────────────

const PlanningView = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
      {MOCK_SESSIONS.map(s => {
        const pct = Math.round((s.places_prises / s.places_total) * 100);
        return (
          <div key={s.id} style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{s.formation}</div>
                <div style={{ fontSize: 11, color: c.textDim, marginTop: 2 }}>{s.session}</div>
              </div>
              <Badge color={statutColor(s.statut)}>{s.statut.replace(/_/g, " ")}</Badge>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <InfoRow icon={Award} label="Formateur" value={s.formateur} />
              <InfoRow icon={MapPin} label="Salle" value={s.salle} />
              <InfoRow icon={Calendar} label="Période" value={`${s.date_debut} → ${s.date_fin}`} />
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: c.textDim }}>Places occupées</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: pct >= 90 ? c.red : pct >= 70 ? c.amber : c.emerald }}>{s.places_prises}/{s.places_total}</span>
              </div>
              <div style={{ height: 5, background: c.bgHover, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: pct >= 90 ? c.red : pct >= 70 ? c.amber : c.emerald, borderRadius: 3 }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ── FINANCES VIEW ──────────────────────────────

const FinancesView = () => {
  const total = MOCK_CANDIDATS.reduce((s, ca) => s + ca.montant_total, 0);
  const pec = MOCK_CANDIDATS.reduce((s, ca) => s + ca.montant_pec, 0);
  const rac = MOCK_CANDIDATS.reduce((s, ca) => s + ca.reste_a_charge, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <StatCard icon={DollarSign} label="Total formations" value={`${total.toLocaleString("fr")}€`} color="gold" />
        <StatCard icon={CheckCircle} label="Prises en charge" value={`${pec.toLocaleString("fr")}€`} color="emerald" />
        <StatCard icon={AlertCircle} label="Reste à charge total" value={`${rac.toLocaleString("fr")}€`} color="amber" />
      </div>

      <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, overflow: "auto" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${c.border}` }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>Détail par candidat</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${c.border}` }}>
              {["Candidat", "Formation", "Financement", "Total", "Prise en charge", "Reste", "Statut"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, color: c.textDim, textTransform: "uppercase", letterSpacing: "0.05em", background: c.bgCard }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_CANDIDATS.map(ca => (
              <tr key={ca.id} style={{ borderBottom: `1px solid ${c.border}` }}>
                <td style={{ padding: "10px 14px", fontSize: 12, color: c.text }}>{ca.prenom} {ca.nom}</td>
                <td style={{ padding: "10px 14px", fontSize: 11, color: c.textSec }}>{ca.formation}</td>
                <td style={{ padding: "10px 14px", fontSize: 11, color: c.textSec }}>{ca.financement}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 600, color: c.text }}>{ca.montant_total.toLocaleString("fr")}€</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: c.emerald }}>{ca.montant_pec.toLocaleString("fr")}€</td>
                <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 600, color: ca.reste_a_charge > 0 ? c.amber : c.emerald }}>{ca.reste_a_charge.toLocaleString("fr")}€</td>
                <td style={{ padding: "10px 14px" }}><Badge color={statutColor(ca.statut_financement)}>{ca.statut_financement}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── MAIN APP ───────────────────────────────────

export default function ABJCrmDashboard() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case "dashboard": return <DashboardView onNavigate={setCurrentView} />;
      case "prospects": return <ProspectsView />;
      case "candidats": return <CandidatsView />;
      case "eleves": return <ElevesView />;
      case "planning": return <PlanningView />;
      case "formateurs": return <FormateursView />;
      case "finances": return <FinancesView />;
      default: return <DashboardView onNavigate={setCurrentView} />;
    }
  };

  const titles = {
    dashboard: "Tableau de bord", prospects: "Prospects", candidats: "Candidats",
    eleves: "Élèves en formation", planning: "Planning & Sessions",
    formateurs: "Formateurs", finances: "Finances",
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
            <div style={{ fontSize: 11, color: c.textDim, marginTop: 1 }}>Académie de Bijouterie Joaillerie — CRM</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", width: 34, height: 34, borderRadius: 7, cursor: "pointer", background: c.bgHover, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={15} color={c.textSec} />
              <div style={{ position: "absolute", top: -2, right: -2, width: 7, height: 7, borderRadius: "50%", background: c.red, border: `2px solid ${c.bgCard}` }} />
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 7, cursor: "pointer", background: c.bgHover, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RefreshCw size={15} color={c.textSec} />
            </div>
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
