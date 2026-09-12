"use client";

import React, { useState, useMemo } from "react";
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
  Eye,
  KeyRound,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { calculateFlesch } from "@/lib/flesch";
import type { GoalGranularity, GoalObservability } from "@/types";
import { Sidebar, type WorkspaceTab } from "@/components/Sidebar";
import { CreateGoalModal } from "@/components/CreateGoalModal";
import { CreateScenarioModal } from "@/components/CreateScenarioModal";
import { CreateRequirementModal } from "@/components/CreateRequirementModal";
import { useUserSession } from "@/lib/auth/session";

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
    actor: "Network Attacker / Malicious Insider",
    policy_id: "pol-1",
    granularity: "policy" as GoalGranularity,
    observability: "observable" as GoalObservability,
    occurrences: 4,
    context_info:
      "Enforces TLS 1.3 encryption across all hospital intranet gateways.",
    relevant_legislation: "HIPAA §164.312",
    subjects: ["Health & Medical Data", "Contact Information"],
  },
  {
    id: "g-2",
    goal_id_label: "G-002",
    description:
      "Enforce verifiable parental verification before persisting children profile identifiers.",
    taxonomy: "Choice/Consent",
    actor: "Unverified Youth / Platform Service",
    policy_id: "pol-3",
    granularity: "scenario" as GoalGranularity,
    observability: "observable" as GoalObservability,
    occurrences: 2,
    context_info:
      "Mandatory SMS or Credit Card verification token before account creation.",
    relevant_legislation: "COPPA Section 6502",
    subjects: ["Children Information", "Account Information"],
  },
];

const INITIAL_SCENARIOS = [
  {
    id: "sc-1",
    name: "Adversary Eavesdropping on Unsegmented Clinic Wi-Fi",
    sources: "Rogue Access Point deployed in waiting lounge",
    actors: "External Cyber Attacker",
    events: "Staff tablet sends unencrypted ePHI payload",
    actions: "Packet capture with Promiscuous Mode Wireshark sniffer",
    obstacles: "WPA3 Enterprise Encryption and Certificate Pinning",
    constraints_text: "Session must terminate within 15 seconds of handshake anomaly",
    pre_conditions: "Attacker has RF visibility to clinic Wi-Fi perimeter",
    post_conditions: "Alert logged in SIEM; rogue AP client isolated",
    status: "Mitigated",
    issues: "Legacy IoT blood pressure monitors lack 802.1X supplicant",
    linked_goal_ids: ["g-1"],
    linked_requirement_ids: ["req-1"],
  },
];

const INITIAL_REQUIREMENTS = [
  {
    id: "req-1",
    req_id_label: "R-001",
    description:
      "The system shall encrypt all electronic patient data in transit using TLS 1.3 with AES-256-GCM cipher suites.",
    constraints_text:
      "Handshake latency must not exceed 250ms under peak 500 concurrent connections.",
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
  // Authentic user session (no fake switcher buttons)
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

  // Handlers
  const handleAddGoal = (newGoalData: any) => {
    if (!canEdit) {
      toast.error("Permission denied");
      return;
    }
    const created = { id: `g-${Date.now()}`, ...newGoalData };
    setGoals([created, ...goals]);
    toast.success(`Goal ${created.goal_id_label} created`);
  };

  const handleDeleteGoal = (id: string, label: string) => {
    if (!canEdit) {
      toast.error("Permission denied");
      return;
    }
    setGoals(goals.filter((g) => g.id !== id));
    toast.success(`Goal ${label} deleted`);
  };

  const handleAddScenario = (newScenarioData: any) => {
    if (!canEdit) {
      toast.error("Permission denied");
      return;
    }
    const created = { id: `sc-${Date.now()}`, ...newScenarioData };
    setScenarios([created, ...scenarios]);
    toast.success(`Misuse scenario recorded`);
  };

  const handleAddRequirement = (newReqData: any) => {
    if (!canEdit) {
      toast.error("Permission denied");
      return;
    }
    const created = { id: `req-${Date.now()}`, ...newReqData };
    setRequirements([created, ...requirements]);
    toast.success(`Requirement ${created.req_id_label} added`);
  };

  const toggleScenarioExpanded = (id: string) => {
    setExpandedScenarios((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex">
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
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 border-b border-zinc-850 bg-[#09090b]/80 backdrop-blur-md px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-zinc-400">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-zinc-200 capitalize font-medium">{activeTab}</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative w-52">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 pr-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
              />
              <Search className="h-3 w-3 text-zinc-500 absolute left-2 top-2 pointer-events-none" />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && !isGuest && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h1 className="text-xl font-semibold tracking-tight text-white">
                  Alpha Health Portal
                </h1>
                <p className="text-xs text-zinc-400">
                  Security & privacy requirements baseline (SRS v2.00 compliant).
                </p>
              </div>

              {/* Minimal metrics summary */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-4 rounded-xl border border-zinc-850 bg-[#121215]">
                  <span className="text-[10px] uppercase font-semibold text-zinc-500">
                    Goals
                  </span>
                  <div className="text-2xl font-bold text-white font-mono mt-0.5">
                    {goals.length}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-850 bg-[#121215]">
                  <span className="text-[10px] uppercase font-semibold text-zinc-500">
                    Scenarios
                  </span>
                  <div className="text-2xl font-bold text-white font-mono mt-0.5">
                    {scenarios.length}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-850 bg-[#121215]">
                  <span className="text-[10px] uppercase font-semibold text-zinc-500">
                    Requirements
                  </span>
                  <div className="text-2xl font-bold text-white font-mono mt-0.5">
                    {requirements.length}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-850 bg-[#121215]">
                  <span className="text-[10px] uppercase font-semibold text-zinc-500">
                    Policies
                  </span>
                  <div className="text-2xl font-bold text-white font-mono mt-0.5">
                    {visiblePolicies.length}
                  </div>
                </div>
              </div>

              {/* Quick Jump Links */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => setActiveTab("goals")}
                  className="p-4 rounded-xl border border-zinc-850 bg-[#121215] hover:border-zinc-750 text-left transition-colors"
                >
                  <Target className="h-4 w-4 text-zinc-300 mb-2" />
                  <div className="text-xs font-semibold text-white">Goals Catalog</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Protection and Vulnerability models
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("scenarios")}
                  className="p-4 rounded-xl border border-zinc-850 bg-[#121215] hover:border-zinc-750 text-left transition-colors"
                >
                  <AlertTriangle className="h-4 w-4 text-zinc-300 mb-2" />
                  <div className="text-xs font-semibold text-white">Misuse Scenarios</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    13 threat modeling attributes
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("readability")}
                  className="p-4 rounded-xl border border-zinc-850 bg-[#121215] hover:border-zinc-750 text-left transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-zinc-300 mb-2" />
                  <div className="text-xs font-semibold text-white">Readability Engine</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    FRES & FGL scoring
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GOALS */}
          {activeTab === "goals" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Goals Catalog
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {filteredGoals.length} goals defined in current project
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={taxonomyFilter}
                    onChange={(e) => setTaxonomyFilter(e.target.value)}
                    className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-300 focus:outline-none"
                  >
                    <option value="all">All Goals</option>
                    <option value="Protection">Protection</option>
                    <option value="Vulnerability">Vulnerability</option>
                  </select>

                  {canEdit && (
                    <button
                      onClick={() => setShowGoalModal(true)}
                      className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Goal
                    </button>
                  )}
                </div>
              </div>

              {/* Goal List */}
              <div className="space-y-2.5">
                {filteredGoals.map((g) => (
                  <div
                    key={g.id}
                    className="p-4 rounded-xl border border-zinc-850 bg-[#121215] hover:border-zinc-800 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-semibold text-white">
                          {g.goal_id_label}
                        </span>
                        <span className="text-[11px] px-2 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {g.taxonomy}
                        </span>
                        <span className="text-[10px] text-zinc-500 capitalize">
                          {g.granularity} • {g.observability}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {g.occurrences} occurrence(s)
                        </span>
                        {canEdit && (
                          <button
                            onClick={() => handleDeleteGoal(g.id, g.goal_id_label)}
                            className="text-zinc-600 hover:text-rose-400 p-1 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {g.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-850/60">
                      <span>Actor: {g.actor || "N/A"}</span>
                      <span>Legislation: {g.relevant_legislation || "None"}</span>
                    </div>

                    {g.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {g.subjects.map((sub) => (
                          <span
                            key={sub}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-850 font-mono"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MISUSE SCENARIOS */}
          {activeTab === "scenarios" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Misuse Scenarios
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Threat scenario modeling and linked goals
                  </p>
                </div>

                {canEdit && (
                  <button
                    onClick={() => setShowScenarioModal(true)}
                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Scenario
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {scenarios.map((sc) => {
                  const isExpanded = expandedScenarios[sc.id];
                  return (
                    <div
                      key={sc.id}
                      className="p-4 rounded-xl border border-zinc-850 bg-[#121215] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-white flex items-center">
                            <AlertTriangle className="h-3.5 w-3.5 text-zinc-400 mr-1.5" />
                            {sc.name}
                          </div>
                          <span className="text-[11px] text-zinc-500 font-mono mt-0.5 block">
                            Status: <span className="text-zinc-300">{sc.status}</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                            {sc.linked_goal_ids.length} Linked Goal(s)
                          </span>
                          <button
                            onClick={() => toggleScenarioExpanded(sc.id)}
                            className="p-1 rounded text-zinc-500 hover:text-zinc-300"
                            title={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expandable attributes */}
                      {isExpanded && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] p-3 rounded-lg bg-zinc-900/80 border border-zinc-850">
                          <div>
                            <span className="text-zinc-500 block">Sources:</span>
                            <span className="text-zinc-300">{sc.sources || "—"}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Actors:</span>
                            <span className="text-zinc-300">{sc.actors || "—"}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Events:</span>
                            <span className="text-zinc-300">{sc.events || "—"}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Actions:</span>
                            <span className="text-zinc-300">{sc.actions || "—"}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Obstacles:</span>
                            <span className="text-zinc-300">{sc.obstacles || "—"}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Pre-conditions:</span>
                            <span className="text-zinc-300">{sc.pre_conditions || "—"}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: REQUIREMENTS */}
          {activeTab === "requirements" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Requirements Catalog
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Formal requirements and constraints
                  </p>
                </div>

                {canEdit && (
                  <button
                    onClick={() => setShowReqModal(true)}
                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Requirement
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-zinc-850 bg-[#121215] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-white">
                        {req.req_id_label}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {req.linked_goal_ids.map((gid) => {
                          const matched = goals.find((g) => g.id === gid);
                          return (
                            <span
                              key={gid}
                              className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400"
                            >
                              {matched?.goal_id_label || gid}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {req.description}
                    </p>

                    {req.constraints_text && (
                      <div className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-850/60">
                        <span className="text-zinc-400">Constraint: </span>
                        <span>{req.constraints_text}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: READABILITY */}
          {activeTab === "readability" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Flesch Readability Scoring
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Real-time Flesch Reading Ease (FRES) and Grade Level (FGL) evaluation.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-zinc-850 bg-[#121215]">
                  <span className="text-[10px] uppercase font-semibold text-zinc-500">
                    FRES Reading Ease
                  </span>
                  <div className="text-2xl font-bold text-white font-mono mt-0.5">
                    {readabilityScore.fres}
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    {getReadingEaseInterpretation(readabilityScore.fres).label}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-zinc-850 bg-[#121215]">
                  <span className="text-[10px] uppercase font-semibold text-zinc-500">
                    Grade Level (FGL)
                  </span>
                  <div className="text-2xl font-bold text-white font-mono mt-0.5">
                    Grade {readabilityScore.fgl}
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    {getReadingEaseInterpretation(readabilityScore.fres).desc}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-zinc-850 bg-[#121215]">
                  <span className="text-[10px] uppercase font-semibold text-zinc-500">
                    Corpus Count
                  </span>
                  <div className="text-xs text-zinc-300 font-mono mt-1 space-y-0.5">
                    <div>{readabilityScore.wordCount} words</div>
                    <div>{readabilityScore.sentenceCount} sentences</div>
                    <div>{readabilityScore.syllableCount} syllables</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Policy Document Text</span>
                  <span className="font-mono">{customReadabilityText.length} chars</span>
                </div>

                <textarea
                  rows={6}
                  value={customReadabilityText}
                  onChange={(e) => setCustomReadabilityText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 font-mono"
                  placeholder="Paste policy text..."
                />
              </div>

              {/* Policy Quick Selector */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-300 block">
                  Select Policy to Load:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {visiblePolicies.map((pol) => (
                    <div
                      key={pol.id}
                      onClick={() => {
                        setSelectedReadabilityPolicy(pol.id);
                        setCustomReadabilityText(pol.content);
                        toast.success(`Loaded "${pol.title.split("(")[0]}"`);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer text-xs transition-colors ${
                        selectedReadabilityPolicy === pol.id
                          ? "bg-zinc-850 border-zinc-700 text-white"
                          : "bg-[#121215] border-zinc-850 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <div className="font-medium text-zinc-200 truncate">{pol.title}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        Domain: {pol.domain}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TRACEABILITY MATRIX */}
          {activeTab === "traceability" && !isGuest && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Traceability Matrix
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Goal ↔ Policy occurrence cross-reference table
                </p>
              </div>

              <div className="rounded-xl border border-zinc-850 bg-[#121215] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-850">
                    <tr>
                      <th className="p-3 font-medium">Goal ID</th>
                      <th className="p-3 font-medium">Goal Description</th>
                      {visiblePolicies.map((pol) => (
                        <th key={pol.id} className="p-3 font-medium text-center whitespace-nowrap">
                          {pol.title.split("(")[0]}
                        </th>
                      ))}
                      <th className="p-3 font-medium text-right">Occurrences</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850/80 text-zinc-300">
                    {goals.map((g) => (
                      <tr key={g.id} className="hover:bg-zinc-900/40">
                        <td className="p-3 font-mono font-bold text-zinc-100 whitespace-nowrap">
                          {g.goal_id_label}
                        </td>
                        <td className="p-3 max-w-xs truncate">{g.description}</td>
                        {visiblePolicies.map((pol) => (
                          <td key={pol.id} className="p-3 text-center font-mono">
                            {g.policy_id === pol.id ? (
                              <span className="text-emerald-400 font-semibold">
                                {g.occurrences} hits
                              </span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                        ))}
                        <td className="p-3 text-right font-mono font-semibold text-zinc-200">
                          {g.occurrences}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: TEAM & POLICY ACCESS (Only PM & Admin) */}
          {activeTab === "roles" && canManageAccess && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Team Members & Policy Access Scoping
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Manage member roles and policy visibility for Guest auditors (SRS R1/R7/R8).
                </p>
              </div>

              {/* Policy Visibility List */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-zinc-300">
                  Project Policy Visibility Status
                </h3>
                <div className="space-y-2 text-xs">
                  {policies.map((pol) => (
                    <div
                      key={pol.id}
                      className="p-3.5 rounded-xl border border-zinc-850 bg-[#121215] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-zinc-200">{pol.title}</div>
                        <div className="text-[11px] text-zinc-500">
                          Domain: {pol.domain}
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                          pol.guestAllowed
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}
                      >
                        {pol.guestAllowed ? "Public Access" : "Internal (R7 Restricted)"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SECURITY SPEC (Only Admin) */}
          {activeTab === "security" && isAdmin && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Security Architecture Specifications
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Cryptographic standards and session security (SRS R9 & R10).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-zinc-850 bg-[#121215] space-y-2">
                  <div className="font-semibold text-white flex items-center">
                    <KeyRound className="h-4 w-4 mr-1.5 text-zinc-300" />
                    R9: Password Hashing (Bcrypt)
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    Passwords are salted and hashed using Bcrypt with an adaptive work factor
                    (10+ rounds). Plaintext passwords are never persisted.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-850 bg-[#121215] space-y-2">
                  <div className="font-semibold text-white flex items-center">
                    <Lock className="h-4 w-4 mr-1.5 text-zinc-300" />
                    R10: Session Security (httpOnly)
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    Authentication cookies are flagged httpOnly, SameSite=Lax, and Secure to
                    prevent client-side JavaScript access and XSS token extraction.
                  </p>
                </div>
              </div>
            </div>
          )}
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
