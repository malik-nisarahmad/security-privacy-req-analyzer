"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  Layers,
  Target,
  AlertTriangle,
  FileCode2,
  BookOpen,
  Network,
  Users,
  Lock,
  Plus,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/types";
import {
  type UserSession,
  clearStoredSession,
  PRESET_USERS,
  setStoredSession,
} from "@/lib/auth/session";

export type WorkspaceTab =
  | "overview"
  | "goals"
  | "scenarios"
  | "requirements"
  | "readability"
  | "traceability"
  | "roles"
  | "security";

interface SidebarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  user: UserSession;
  goalCount: number;
  scenarioCount: number;
  reqCount: number;
  onOpenGoalModal: () => void;
  onOpenScenarioModal: () => void;
  onOpenReqModal: () => void;
  activeProjectName?: string;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  user,
  goalCount,
  scenarioCount,
  reqCount,
  onOpenGoalModal,
  onOpenScenarioModal,
  onOpenReqModal,
  activeProjectName = "Alpha Health Portal",
}: SidebarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Offline fallback
    }
    clearStoredSession();
    setStoredSession(PRESET_USERS.guest);
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  const currentRole = user.role;
  const canEdit =
    currentRole === "admin" ||
    currentRole === "project_manager" ||
    currentRole === "analyst";

  const allNavItems = [
    {
      id: "overview" as WorkspaceTab,
      label: "Overview",
      icon: Layers,
      roles: ["admin", "project_manager", "analyst"],
    },
    {
      id: "goals" as WorkspaceTab,
      label: "Goals",
      icon: Target,
      badge: `${goalCount}`,
      roles: ["admin", "project_manager", "analyst", "guest"],
    },
    {
      id: "scenarios" as WorkspaceTab,
      label: "Threats",
      icon: AlertTriangle,
      badge: `${scenarioCount}`,
      roles: ["admin", "project_manager", "analyst", "guest"],
    },
    {
      id: "requirements" as WorkspaceTab,
      label: "Requirements",
      icon: FileCode2,
      badge: `${reqCount}`,
      roles: ["admin", "project_manager", "analyst", "guest"],
    },
    {
      id: "readability" as WorkspaceTab,
      label: "Readability",
      icon: BookOpen,
      roles: ["admin", "project_manager", "analyst", "guest"],
    },
    {
      id: "traceability" as WorkspaceTab,
      label: "Traceability",
      icon: Network,
      roles: ["admin", "project_manager", "analyst"],
    },
    {
      id: "roles" as WorkspaceTab,
      label: "Access Control",
      icon: Users,
      roles: ["admin", "project_manager"],
    },
    {
      id: "security" as WorkspaceTab,
      label: "Security Specs",
      icon: Lock,
      roles: ["admin"],
    },
  ];

  const visibleNavItems = allNavItems.filter((item) =>
    item.roles.includes(currentRole)
  );

  return (
    <aside className="w-[260px] flex-shrink-0 bg-white/80 backdrop-blur-2xl border-r border-white/90 shadow-[10px_0_30px_rgba(160,150,180,0.12)] flex flex-col h-screen sticky top-0 text-[#332F3A] select-none z-20">
      {/* ── Brand ── */}
      <div className="px-6 py-5 flex items-center space-x-3">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-[4px_4px_10px_rgba(139,92,246,0.3),-2px_-2px_6px_#ffffff]">
            <Shield className="h-4 w-4" />
          </div>
          <span
            className="font-extrabold text-base tracking-tight text-[#332F3A]"
            style={{ fontFamily: "var(--font-nunito), sans-serif" }}
          >
            SPRAT
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFEBF5] text-[#7C3AED]">
            2.0
          </span>
        </Link>
      </div>

      {/* ── Project Context ── */}
      <div className="px-5 pb-4">
        <div className="px-3.5 py-2.5 rounded-2xl bg-[#EFEBF5] border border-white/60 shadow-[inset_2px_2px_5px_#dcd7e7,inset_-2px_-2px_5px_#ffffff]">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#7C3AED]">
            Workspace
          </div>
          <div
            className="text-xs font-bold text-[#332F3A] mt-0.5 truncate"
            style={{ fontFamily: "var(--font-nunito), sans-serif" }}
          >
            {activeProjectName}
          </div>
        </div>
      </div>

      {/* ── Quick Actions (Authoring Roles Only) ── */}
      {canEdit && (
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2">
            {[
              { label: "Goal", onClick: onOpenGoalModal },
              { label: "Threat", onClick: onOpenScenarioModal },
              { label: "Req", onClick: onOpenReqModal },
            ].map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="flex-1 py-1.5 rounded-xl bg-white border border-white/90 text-xs font-bold text-[#635F69] hover:text-[#7C3AED] flex items-center justify-center gap-1 shadow-[3px_3px_8px_rgba(160,150,180,0.15),-2px_-2px_6px_#ffffff] hover:-translate-y-0.5 active:scale-95 transition-all"
                style={{ fontFamily: "var(--font-nunito), sans-serif" }}
              >
                <Plus className="h-3 w-3 text-[#7C3AED]" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Separator ── */}
      <div className="mx-6 h-px bg-[#EAE5F3]" />

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3.5 py-3 space-y-1.5 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white text-[#7C3AED] shadow-[6px_6px_14px_rgba(160,150,180,0.18),-4px_-4px_10px_#ffffff] font-bold"
                  : "text-[#635F69] hover:text-[#332F3A] hover:bg-white/50"
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`h-4 w-4 flex-shrink-0 ${
                    isActive ? "text-[#7C3AED]" : "text-[#635F69]"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-[#EFEBF5] text-[#7C3AED] shadow-[inset_1px_1px_2px_#dcd7e7]"
                      : "bg-[#EAE5F3]/70 text-[#635F69]"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Separator ── */}
      <div className="mx-6 h-px bg-[#EAE5F3]" />

      {/* ── User Profile Card & Real Logout Action ── */}
      <div className="p-4">
        <div className="flex items-center justify-between bg-white/70 rounded-2xl p-2.5 border border-white/80 shadow-[4px_4px_10px_rgba(160,150,180,0.1),-3px_-3px_8px_#ffffff]">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Clay Avatar */}
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white flex items-center justify-center font-extrabold text-xs shadow-[3px_3px_8px_rgba(139,92,246,0.28),-2px_-2px_5px_#ffffff] flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#332F3A] truncate leading-tight">
                {user.name}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                <span className="text-[10px] text-[#635F69] capitalize leading-tight">
                  {user.role.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-2 rounded-xl text-[#635F69] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-all disabled:opacity-50"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
