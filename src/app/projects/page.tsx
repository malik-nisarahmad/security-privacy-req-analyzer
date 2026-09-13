"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  AlertTriangle,
  FileCode2,
  BookOpen,
  Network,
  Users,
  Lock,
  Plus,
  Trash2,
  Search,
  KeyRound,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { calculateFlesch } from "@/lib/flesch";
import type { GoalGranularity, GoalObservability } from "@/types";
import { Sidebar, type WorkspaceTab } from "@/components/Sidebar";
import { CreateGoalModal } from "@/components/CreateGoalModal";
import { CreateScenarioModal } from "@/components/CreateScenarioModal";
import { CreateRequirementModal } from "@/components/CreateRequirementModal";
import { useUserSession } from "@/lib/auth/session";

/* ─── Animation variants ─── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

// Seed Data
const INITIAL_TAXONOMY = [
  { id: "tax-1", parent: "Protection", name: "Notice/Awareness" },
  { id: "tax-2", parent: "Protection", name: "Choice/Consent" },
  { id: "tax-3", parent: "Protection", name: "Access/Participation" },
  { id: "tax-4", parent: "Protection", name: "Integrity/Security" },
  { id: "tax-5", parent: "Protection", name: "Enforcement/Redress" },
  { id: "tax-6", parent: "Vulnerability", name: "Information Monitoring" },
  { id: "tax-7", parent: "Vulnerability", name: "Information Aggregation" },
  { id: "tax-8", parent: "Vulnerability", name: "Unauthorized Transfer" },
];

const INITIAL_SUBJECTS = [
  "Account Information",
  "Biometric Data",
  "Business Aggregation",
  "Children Information",
  "Contact Information",
  "Credit Card Information",
  "Health & Medical Data",
  "Location Data",
  "Login Credentials",
  "Social Security Number",
];

const INITIAL_POLICIES = [
  {
    id: "pol-1",
    title: "Healthcare Patient Confidentiality Policy (HIPAA v2.1)",
    domain: "Healthcare",
    content:
      "All medical personnel and authorized administrative staff must ensure the absolute confidentiality and secure encryption of electronic protected health information (ePHI). Data transfers across external networks must utilize high-grade TLS 1.3 cryptographic protocols with mandatory multi-factor authentication. Any unauthorized disclosure or security incident requires immediate containment and notification within twenty-four hours to the designated Privacy Officer.",
    guestAllowed: true,
  },
  {
    id: "pol-2",
    title: "Payment Processing & Cardholder Data Standard (PCI-DSS)",
    domain: "Financial",
    content:
      "Primary account numbers (PAN) must be rendered unreadable anywhere they are stored, using strong one-way hash algorithms with secret keying. Access to system components holding cryptographic keys is restricted strictly to least-privilege operations.",
    guestAllowed: false,
  },
  {
    id: "pol-3",
    title: "Children's Online Privacy & Consent Protocol (COPPA)",
    domain: "Consumer Privacy",
    content:
      "Explicit verifiable parental consent is strictly mandated prior to collecting, utilizing, or transmitting any personal identifiers pertaining to minors below thirteen years of age. Clear mechanisms for immediate data erasure must be presented at all times.",
    guestAllowed: false,
  },
];

const INITIAL_GOALS = [
  {
    id: "g-1",
    goal_id_label: "G-001",
    description:
      "Prevent unauthorized interception and exfiltration of electronic patient health records during network transmission.",
    taxonomy: "Integrity/Security",
    granularity: "policy_level" as GoalGranularity,
    observability: "observable" as GoalObservability,
    actor: "Network Attacker",
    action: "Intercepts unencrypted network packets",
    relevant_legislation: "HIPAA §164.312",
    policy_id: "pol-1",
    subjects: ["Health & Medical Data"],
    occurrences: 4,
  },
  {
    id: "g-2",
    goal_id_label: "G-002",
    description:
      "Render primary cardholder account numbers unreadable across all persistent database clusters.",
    taxonomy: "Integrity/Security",
    granularity: "operational_level" as GoalGranularity,
    observability: "observable" as GoalObservability,
    actor: "Database Administrator",
    action: "Applies salted cryptographic hash before persistence",
    relevant_legislation: "PCI-DSS Requirement 3",
    policy_id: "pol-2",
    subjects: ["Credit Card Information"],
    occurrences: 2,
  },
  {
    id: "g-3",
    goal_id_label: "G-003",
    description:
      "Obtain verifiable consent from legal guardians prior to indexing or analyzing minor account telemetry.",
    taxonomy: "Choice/Consent",
    granularity: "policy_level" as GoalGranularity,
    observability: "observable" as GoalObservability,
    actor: "Consent Verification Engine",
    action: "Prompts guardian identity check challenge",
    relevant_legislation: "COPPA §312.5",
    policy_id: "pol-3",
    subjects: ["Children Information", "Account Information"],
    occurrences: 3,
  },
];

const INITIAL_SCENARIOS = [
  {
    id: "sc-1",
    name: "Clinic Wi-Fi Eavesdropping & Packet Sniffing",
    sources: "Rogue Wi-Fi Access Point deployed near outpatient waiting area",
    actors: "External Threat Actor / Unauthenticated attacker",
    actions: "Promiscuous mode packet inspection targeting port 443 telemetry",
    events: "Staff member connects hospital tablet to unverified SSID",
    obstacles: "WPA3 Enterprise Encryption & mandatory device certificate pinning",
    pre_conditions: "Hospital device Wi-Fi auto-join enabled for open networks",
    post_conditions: "TLS alert triggered; network interface locked down by EDR",
    status: "Mitigated",
    linked_goal_ids: ["g-1"],
  },
  {
    id: "sc-2",
    name: "Insider Direct Database SQL Dumping",
    sources: "Staging database backup file left on internal file share",
    actors: "Disgruntled IT Operations contractor",
    actions: "Executes unencrypted mysqldump on replica database",
    events: "Backup automation script failed to wipe temporary staging export",
    obstacles: "Transparent Data Encryption (TDE) & Key Management Service isolation",
    pre_conditions: "Contractor assigned read access to backup storage bucket",
    post_conditions: "Export fails to decrypt outside designated KMS enclave",
    status: "Identified",
    linked_goal_ids: ["g-2"],
  },
];

const INITIAL_REQUIREMENTS = [
  {
    id: "req-1",
    req_id_label: "R-001",
    description:
      "The system shall mandate TLS 1.3 encryption across all public network endpoints handling protected health information.",
    constraints_text: "Cipher suites must exclude RSA key exchange and CBC ciphers.",
    linked_goal_ids: ["g-1"],
  },
  {
    id: "req-2",
    req_id_label: "R-002",
    description:
      "The authentication engine shall mandate multi-factor challenge for all administrative role elevations.",
    constraints_text: "TOTP tokens must expire strictly after 30 seconds.",
    linked_goal_ids: ["g-1", "g-2"],
  },
];

function getReadingEaseInterpretation(fres: number): {
  label: string;
  desc: string;
} {
  if (fres >= 90) return { label: "Very Easy", desc: "5th grade level" };
  if (fres >= 80) return { label: "Easy", desc: "6th grade English" };
  if (fres >= 70) return { label: "Fairly Easy", desc: "7th grade level" };
  if (fres >= 60)
    return { label: "Standard / Plain English", desc: "8th to 9th grade" };
  if (fres >= 50) return { label: "Fairly Difficult", desc: "High school level" };
  if (fres >= 30) return { label: "Difficult", desc: "College level" };
  return { label: "Very Difficult", desc: "Legal / Academic" };
}

export default function WorkspacePage() {
  const { session } = useUserSession();
  const currentRole = session.role;

  const [activeTab, setActiveTab] = useState<WorkspaceTab>(
    currentRole === "guest" ? "goals" : "overview"
  );

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [taxonomyFilter, setTaxonomyFilter] = useState<string>("all");

  // State collections
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [scenarios, setScenarios] = useState(INITIAL_SCENARIOS);
  const [requirements, setRequirements] = useState(INITIAL_REQUIREMENTS);
  const [policies, setPolicies] = useState(INITIAL_POLICIES);

  // Expanded scenarios
  const [expandedScenarios, setExpandedScenarios] = useState<Record<string, boolean>>({
    "sc-1": false,
  });

  // Readability Tool State (R5)
  const [customReadabilityText, setCustomReadabilityText] = useState(
    INITIAL_POLICIES[0].content
  );
  const [selectedReadabilityPolicy, setSelectedReadabilityPolicy] =
    useState<string>("pol-1");

  // Modals state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [showReqModal, setShowReqModal] = useState(false);

  // Flesch score
  const readabilityScore = useMemo(() => {
    return calculateFlesch(customReadabilityText || "");
  }, [customReadabilityText]);

  // Guest restriction on confidential policies (R7)
  const visiblePolicies = useMemo(() => {
    if (currentRole === "guest") {
      return policies.filter((p) => p.guestAllowed);
    }
    return policies;
  }, [policies, currentRole]);

  // Strict permission guards
  const isGuest = currentRole === "guest";
  const canEdit =
    currentRole === "admin" ||
    currentRole === "project_manager" ||
    currentRole === "analyst";
  const canManageAccess =
    currentRole === "admin" || currentRole === "project_manager";
  const isAdmin = currentRole === "admin";

  // Filtered goals
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        g.goal_id_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTaxonomy =
        taxonomyFilter === "all" ||
        (taxonomyFilter === "Protection" &&
          [
            "Notice/Awareness",
            "Choice/Consent",
            "Access/Participation",
            "Integrity/Security",
            "Enforcement/Redress",
          ].includes(g.taxonomy)) ||
        (taxonomyFilter === "Vulnerability" &&
          [
            "Information Monitoring",
            "Information Aggregation",
            "Unauthorized Transfer",
          ].includes(g.taxonomy));

      return matchesSearch && matchesTaxonomy;
    });
  }, [goals, searchQuery, taxonomyFilter]);

  const toggleScenarioExpanded = (id: string) => {
    setExpandedScenarios((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddGoal = (newGoal: any) => {
    setGoals((prev) => [newGoal, ...prev]);
    toast.success(`Created Goal ${newGoal.goal_id_label}`);
  };

  const handleDeleteGoal = (id: string, label: string) => {
    if (!canEdit) return;
    setGoals((prev) => prev.filter((g) => g.id !== id));
    toast.success(`Deleted Goal ${label}`);
  };

  const handleAddScenario = (newScenario: any) => {
    setScenarios((prev) => [newScenario, ...prev]);
    toast.success(`Created Threat Scenario "${newScenario.name}"`);
  };

  const handleAddRequirement = (newReq: any) => {
    setRequirements((prev) => [newReq, ...prev]);
    toast.success(`Created Requirement ${newReq.req_id_label}`);
  };

  return (
    <div className="min-h-screen bg-[#F4F1FA] text-[#332F3A] flex relative overflow-hidden select-none">
      {/* ── Floating 3D Blobs in Workspace Background ── */}
      <div className="clay-blob-1 opacity-50" />
      <div className="clay-blob-2 opacity-50" />

      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={session}
        goalCount={goals.length}
        scenarioCount={scenarios.length}
        reqCount={requirements.length}
        onOpenGoalModal={() => setShowGoalModal(true)}
        onOpenScenarioModal={() => setShowScenarioModal(true)}
        onOpenReqModal={() => setShowReqModal(true)}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 border-b border-white/80 bg-white/75 backdrop-blur-xl px-6 h-14 flex items-center justify-between shadow-[0_4px_16px_rgba(160,150,180,0.08)]">
          <div className="flex items-center gap-2 text-xs font-bold" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
            <span className="text-[#635F69]">Workspace</span>
            <span className="text-[#A78BFA]">/</span>
            <span className="text-[#7C3AED] capitalize font-extrabold">{activeTab}</span>
          </div>

          <div className="relative w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search goals, threats..."
              className="w-full pl-8 pr-3 py-1.5 clay-input text-xs font-medium placeholder-[#635F69]"
            />
            <Search className="h-3.5 w-3.5 text-[#635F69] absolute left-2.5 top-2 pointer-events-none" />
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 max-w-5xl w-full mx-auto">
          <AnimatePresence mode="wait">
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && !isGuest && (
              <motion.div
                key="overview"
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                <motion.div variants={fadeUp} className="space-y-1">
                  <h1 className="text-2xl font-black tracking-tight text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                    Alpha Health Portal
                  </h1>
                  <p className="text-xs font-medium text-[#635F69]">
                    Security & privacy requirements engineering baseline
                  </p>
                </motion.div>

                {/* Tactile Metric Cards */}
                <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="clay-card-compact p-5 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C3AED]">
                      Goals
                    </span>
                    <div className="text-3xl font-black text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                      {goals.length}
                    </div>
                    <span className="text-[11px] font-medium text-[#635F69] block">
                      Protection & vulnerability
                    </span>
                  </div>

                  <div className="clay-card-compact p-5 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#F59E0B]">
                      Threats
                    </span>
                    <div className="text-3xl font-black text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                      {scenarios.length}
                    </div>
                    <span className="text-[11px] font-medium text-[#635F69] block">
                      Misuse scenarios
                    </span>
                  </div>

                  <div className="clay-card-compact p-5 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#0EA5E9]">
                      Requirements
                    </span>
                    <div className="text-3xl font-black text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                      {requirements.length}
                    </div>
                    <span className="text-[11px] font-medium text-[#635F69] block">
                      Formal constraints
                    </span>
                  </div>

                  <div className="clay-card-compact p-5 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#10B981]">
                      Policies
                    </span>
                    <div className="text-3xl font-black text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                      {visiblePolicies.length}
                    </div>
                    <span className="text-[11px] font-medium text-[#635F69] block">
                      Compliance docs
                    </span>
                  </div>
                </motion.div>

                {/* Quick Jump Clay Cards */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { tab: "goals" as WorkspaceTab, icon: Target, label: "Goals Catalog", desc: "Protection & vulnerability models", color: "from-[#A78BFA] to-[#7C3AED]" },
                    { tab: "scenarios" as WorkspaceTab, icon: AlertTriangle, label: "Threat Scenarios", desc: "Misuse case modeling", color: "from-[#FCD34D] to-[#F59E0B]" },
                    { tab: "readability" as WorkspaceTab, icon: BookOpen, label: "Readability Engine", desc: "FRES & FGL scoring", color: "from-[#38BDF8] to-[#0EA5E9]" },
                  ].map((item) => (
                    <button
                      key={item.tab}
                      onClick={() => setActiveTab(item.tab)}
                      className="group clay-card-compact p-5 text-left cursor-pointer transition-all hover:-translate-y-1"
                    >
                      <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-3 shadow-[3px_3px_8px_rgba(160,150,180,0.2)]`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="text-sm font-extrabold text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                        {item.label}
                      </div>
                      <div className="text-xs font-medium text-[#635F69] mt-1">
                        {item.desc}
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-[#A78BFA] mt-3 group-hover:text-[#7C3AED] transition-colors" />
                    </button>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* TAB 2: GOALS */}
            {activeTab === "goals" && (
              <motion.div
                key="goals"
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-5"
              >
                <motion.div variants={fadeUp} className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                      Goals
                    </h2>
                    <p className="text-xs font-medium text-[#635F69]">
                      {filteredGoals.length} defined
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={taxonomyFilter}
                      onChange={(e) => setTaxonomyFilter(e.target.value)}
                      className="px-3 py-1.5 clay-input text-xs font-bold text-[#332F3A] focus:outline-none"
                    >
                      <option value="all">All Goals</option>
                      <option value="Protection">Protection</option>
                      <option value="Vulnerability">Vulnerability</option>
                    </select>

                    {canEdit && (
                      <button
                        onClick={() => setShowGoalModal(true)}
                        className="clay-btn-primary inline-flex items-center px-4 py-2 text-white text-xs font-bold shadow-[6px_6px_14px_rgba(139,92,246,0.3),-3px_-3px_8px_#ffffff]"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Goal
                      </button>
                    )}
                  </div>
                </motion.div>

                {/* Goal List */}
                <div className="space-y-3">
                  {filteredGoals.map((g) => (
                    <motion.div
                      key={g.id}
                      variants={fadeUp}
                      className="clay-card-compact p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-black text-[#7C3AED] px-2 py-0.5 rounded-lg bg-[#EFEBF5]">
                            {g.goal_id_label}
                          </span>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white text-[#332F3A] shadow-[2px_2px_5px_rgba(160,150,180,0.15)]">
                            {g.taxonomy}
                          </span>
                          <span className="text-[10px] text-[#635F69] font-bold font-mono capitalize">
                            {g.granularity} · {g.observability}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#635F69] font-bold font-mono">
                            {g.occurrences} occ.
                          </span>
                          {canEdit && (
                            <button
                              onClick={() => handleDeleteGoal(g.id, g.goal_id_label)}
                              className="text-[#635F69] hover:text-[#DC2626] p-1.5 rounded-xl hover:bg-[#FEE2E2] transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-[#332F3A] leading-relaxed font-medium">
                        {g.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] font-bold text-[#635F69] pt-2 border-t border-[#EAE5F3]">
                        <span>Actor: {g.actor || "N/A"}</span>
                        <span className="font-mono text-[#7C3AED]">{g.relevant_legislation || "—"}</span>
                      </div>

                      {g.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {g.subjects.map((sub) => (
                            <span
                              key={sub}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFEBF5] text-[#635F69]"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 3: MISUSE SCENARIOS */}
            {activeTab === "scenarios" && (
              <motion.div
                key="scenarios"
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-5"
              >
                <motion.div variants={fadeUp} className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                      Threat Scenarios
                    </h2>
                    <p className="text-xs font-medium text-[#635F69]">
                      Misuse case modeling
                    </p>
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => setShowScenarioModal(true)}
                      className="clay-btn-primary inline-flex items-center px-4 py-2 text-white text-xs font-bold shadow-[6px_6px_14px_rgba(139,92,246,0.3),-3px_-3px_8px_#ffffff]"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Scenario
                    </button>
                  )}
                </motion.div>

                <div className="space-y-3">
                  {scenarios.map((sc) => {
                    const isExpanded = expandedScenarios[sc.id];
                    return (
                      <motion.div
                        key={sc.id}
                        variants={fadeUp}
                        className="clay-card-compact p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-extrabold text-[#332F3A] flex items-center gap-2" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                              <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
                              {sc.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  sc.status === "Mitigated"
                                    ? "bg-[#10B981]/15 text-[#10B981]"
                                    : "bg-[#F59E0B]/15 text-[#F59E0B]"
                                }`}
                              >
                                {sc.status}
                              </span>
                              <span className="text-[10px] text-[#635F69] font-bold font-mono">
                                {sc.linked_goal_ids.length} linked goal(s)
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleScenarioExpanded(sc.id)}
                            className="p-2 rounded-xl text-[#635F69] hover:text-[#332F3A] hover:bg-[#EFEBF5] transition-all"
                            title={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {/* Expandable attributes */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="overflow-hidden pt-2"
                            >
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#EFEBF5] shadow-[inset_2px_2px_5px_#dcd7e7,inset_-2px_-2px_5px_#ffffff]">
                                {[
                                  { label: "Sources", value: sc.sources },
                                  { label: "Actors", value: sc.actors },
                                  { label: "Events", value: sc.events },
                                  { label: "Actions", value: sc.actions },
                                  { label: "Obstacles", value: sc.obstacles },
                                  { label: "Pre-conditions", value: sc.pre_conditions },
                                ].map((attr) => (
                                  <div key={attr.label} className="text-xs">
                                    <span className="text-[#635F69] block font-bold text-[10px] uppercase tracking-wider">{attr.label}</span>
                                    <span className="text-[#332F3A] mt-0.5 block font-medium">{attr.value || "—"}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB 4: REQUIREMENTS */}
            {activeTab === "requirements" && (
              <motion.div
                key="requirements"
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-5"
              >
                <motion.div variants={fadeUp} className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                      Requirements
                    </h2>
                    <p className="text-xs font-medium text-[#635F69]">
                      Formal constraints & specifications
                    </p>
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => setShowReqModal(true)}
                      className="clay-btn-primary inline-flex items-center px-4 py-2 text-white text-xs font-bold shadow-[6px_6px_14px_rgba(139,92,246,0.3),-3px_-3px_8px_#ffffff]"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Requirement
                    </button>
                  )}
                </motion.div>

                <div className="space-y-3">
                  {requirements.map((req) => (
                    <motion.div
                      key={req.id}
                      variants={fadeUp}
                      className="clay-card-compact p-5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-[#7C3AED] px-2 py-0.5 rounded-lg bg-[#EFEBF5]">
                          {req.req_id_label}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {req.linked_goal_ids.map((gid) => {
                            const matched = goals.find((g) => g.id === gid);
                            return (
                              <span
                                key={gid}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#332F3A] shadow-[2px_2px_4px_rgba(160,150,180,0.15)]"
                              >
                                {matched?.goal_id_label || gid}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <p className="text-xs text-[#332F3A] leading-relaxed font-medium">
                        {req.description}
                      </p>

                      {req.constraints_text && (
                        <div className="text-xs font-medium text-[#635F69] pt-2 border-t border-[#EAE5F3]">
                          <span className="font-bold text-[#332F3A]">Constraint: </span>
                          <span>{req.constraints_text}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 5: READABILITY */}
            {activeTab === "readability" && (
              <motion.div
                key="readability"
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-5"
              >
                <motion.div variants={fadeUp}>
                  <h2 className="text-xl font-black tracking-tight text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                    Readability Scoring
                  </h2>
                  <p className="text-xs font-medium text-[#635F69] mt-0.5">
                    Flesch Reading Ease & Grade Level
                  </p>
                </motion.div>

                <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="clay-card-compact p-5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C3AED]">
                      FRES Score
                    </span>
                    <div className="text-3xl font-black text-[#7C3AED] mt-1" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                      {readabilityScore.fres}
                    </div>
                    <span className="text-xs font-bold text-[#332F3A] mt-1 block">
                      {getReadingEaseInterpretation(readabilityScore.fres).label}
                    </span>
                  </div>

                  <div className="clay-card-compact p-5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#0EA5E9]">
                      Grade Level
                    </span>
                    <div className="text-3xl font-black text-[#332F3A] mt-1" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                      Grade {readabilityScore.fgl}
                    </div>
                    <span className="text-xs font-bold text-[#635F69] mt-1 block">
                      {getReadingEaseInterpretation(readabilityScore.fres).desc}
                    </span>
                  </div>

                  <div className="clay-card-compact p-5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#10B981]">
                      Corpus Stats
                    </span>
                    <div className="text-xs text-[#332F3A] font-bold mt-2 space-y-1">
                      <div>{readabilityScore.wordCount} words</div>
                      <div>{readabilityScore.sentenceCount} sentences</div>
                      <div>{readabilityScore.syllableCount} syllables</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#635F69]">
                    <span>Policy document text</span>
                    <span className="font-mono">{customReadabilityText.length} chars</span>
                  </div>

                  <textarea
                    rows={6}
                    value={customReadabilityText}
                    onChange={(e) => setCustomReadabilityText(e.target.value)}
                    className="w-full p-4 rounded-2xl clay-input text-xs text-[#332F3A] placeholder-[#635F69] focus:outline-none font-medium leading-relaxed resize-none"
                    placeholder="Paste policy text..."
                  />
                </motion.div>

                {/* Policy Quick Selector */}
                <motion.div variants={fadeUp} className="space-y-2.5">
                  <span className="text-xs font-bold text-[#635F69] block">
                    Load a policy:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {visiblePolicies.map((pol) => (
                      <button
                        key={pol.id}
                        onClick={() => {
                          setSelectedReadabilityPolicy(pol.id);
                          setCustomReadabilityText(pol.content);
                          toast.success(`Loaded "${pol.title.split("(")[0]}"`);
                        }}
                        className={`clay-card-compact p-4 text-left cursor-pointer transition-all ${
                          selectedReadabilityPolicy === pol.id
                            ? "!border-[#7C3AED] shadow-[8px_8px_18px_rgba(124,58,237,0.18)]"
                            : "hover:-translate-y-0.5"
                        }`}
                      >
                        <div className="text-xs font-bold text-[#332F3A] truncate" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                          {pol.title}
                        </div>
                        <div className="text-[10px] text-[#7C3AED] mt-1 font-bold">
                          {pol.domain}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* TAB 6: TRACEABILITY MATRIX */}
            {activeTab === "traceability" && !isGuest && (
              <motion.div
                key="traceability"
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-5"
              >
                <motion.div variants={fadeUp}>
                  <h2 className="text-xl font-black tracking-tight text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                    Traceability Matrix
                  </h2>
                  <p className="text-xs font-medium text-[#635F69] mt-0.5">
                    Goal ↔ Policy cross-reference
                  </p>
                </motion.div>

                <motion.div variants={fadeUp} className="clay-card-compact overflow-x-auto p-4">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[#635F69] border-b border-[#EAE5F3] font-bold">
                      <tr>
                        <th className="p-3">Goal</th>
                        <th className="p-3">Description</th>
                        {visiblePolicies.map((pol) => (
                          <th key={pol.id} className="p-3 text-center whitespace-nowrap">
                            {pol.title.split("(")[0]}
                          </th>
                        ))}
                        <th className="p-3 text-right">Hits</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE5F3] text-[#332F3A]">
                      {goals.map((g) => (
                        <tr key={g.id} className="hover:bg-white/60 transition-colors">
                          <td className="p-3 font-mono font-black text-[#7C3AED] whitespace-nowrap">
                            {g.goal_id_label}
                          </td>
                          <td className="p-3 max-w-xs truncate font-medium">{g.description}</td>
                          {visiblePolicies.map((pol) => (
                            <td key={pol.id} className="p-3 text-center font-mono font-bold">
                              {g.policy_id === pol.id ? (
                                <span className="text-[#7C3AED]">
                                  {g.occurrences}
                                </span>
                              ) : (
                                <span className="text-[#A78BFA]/40">—</span>
                              )}
                            </td>
                          ))}
                          <td className="p-3 text-right font-mono font-black text-[#332F3A]">
                            {g.occurrences}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              </motion.div>
            )}

            {/* TAB 7: TEAM & POLICY ACCESS (Only PM & Admin) */}
            {activeTab === "roles" && canManageAccess && (
              <motion.div
                key="roles"
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-5"
              >
                <motion.div variants={fadeUp}>
                  <h2 className="text-xl font-black tracking-tight text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                    Access Control
                  </h2>
                  <p className="text-xs font-medium text-[#635F69] mt-0.5">
                    Policy visibility & member scoping
                  </p>
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-3">
                  {policies.map((pol) => (
                    <div
                      key={pol.id}
                      className="clay-card-compact p-5 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                          {pol.title}
                        </div>
                        <div className="text-[10px] text-[#635F69] font-bold mt-1">
                          {pol.domain}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                          pol.guestAllowed
                            ? "bg-[#10B981]/15 text-[#10B981]"
                            : "bg-[#7C3AED]/15 text-[#7C3AED]"
                        }`}
                      >
                        {pol.guestAllowed ? "Public" : "Restricted"}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* TAB 8: SECURITY SPEC (Only Admin) */}
            {activeTab === "security" && isAdmin && (
              <motion.div
                key="security"
                variants={stagger}
                initial="hidden"
                animate="show"
                className="space-y-5"
              >
                <motion.div variants={fadeUp}>
                  <h2 className="text-xl font-black tracking-tight text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                    Security Specifications
                  </h2>
                  <p className="text-xs font-medium text-[#635F69] mt-0.5">
                    Cryptographic & session standards
                  </p>
                </motion.div>

                <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="clay-card-compact p-6 space-y-2">
                    <div className="text-sm font-extrabold text-[#332F3A] flex items-center gap-2" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                      <KeyRound className="h-4 w-4 text-[#7C3AED]" />
                      R9: Bcrypt Hashing
                    </div>
                    <p className="text-xs text-[#635F69] leading-relaxed font-medium">
                      Passwords salted with Bcrypt (10+ rounds). Plaintext never persisted in database records.
                    </p>
                  </div>

                  <div className="clay-card-compact p-6 space-y-2">
                    <div className="text-sm font-extrabold text-[#332F3A] flex items-center gap-2" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                      <Lock className="h-4 w-4 text-[#10B981]" />
                      R10: Session Security
                    </div>
                    <p className="text-xs text-[#635F69] leading-relaxed font-medium">
                      httpOnly, SameSite=Lax, Secure cookies prevent client-side JavaScript from extracting sessions.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* MODALS */}
      <CreateGoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onAdd={handleAddGoal}
        taxonomies={INITIAL_TAXONOMY}
        subjectsList={INITIAL_SUBJECTS}
        policies={policies}
      />

      <CreateScenarioModal
        isOpen={showScenarioModal}
        onClose={() => setShowScenarioModal(false)}
        onAdd={handleAddScenario}
        goals={goals}
      />

      <CreateRequirementModal
        isOpen={showReqModal}
        onClose={() => setShowReqModal(false)}
        onAdd={handleAddRequirement}
        goals={goals}
      />
    </div>
  );
}
