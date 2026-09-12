"use client";

import React from "react";
import Link from "next/link";
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
  ExternalLink,
} from "lucide-react";
import type { UserRole } from "@/types";
import type { UserSession } from "@/lib/auth/session";

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
  activeProjectName = "Alpha Health Portal (HIPAA)",
}: SidebarProps) {
  const currentRole = user.role;
  const isGuest = currentRole === "guest";
  const canEdit = currentRole === "admin" || currentRole === "project_manager" || currentRole === "analyst";
  const isAdmin = currentRole === "admin";
  const isPM = currentRole === "project_manager";

  // Filter navigation items strictly based on the user's role
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
      label: "Misuse Scenarios",
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
      label: "Readability (FRES)",
      icon: BookOpen,
      roles: ["admin", "project_manager", "analyst", "guest"],
    },
    {
      id: "traceability" as WorkspaceTab,
      label: "Traceability Matrix",
      icon: Network,
      roles: ["admin", "project_manager", "analyst"],
    },
    {
      id: "roles" as WorkspaceTab,
      label: "Team & Policy Access",
      icon: Users,
      roles: ["admin", "project_manager"],
    },
    {
      id: "security" as WorkspaceTab,
      label: "Security Specification",
      icon: Lock,
      roles: ["admin"],
    },
  ];

  const visibleNavItems = allNavItems.filter((item) =>
    item.roles.includes(currentRole)
  );

  return (
    <aside className="w-60 flex-shrink-0 bg-[#09090b] border-r border-zinc-850 flex flex-col h-screen sticky top-0 text-zinc-300 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-850/80 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="h-6 w-6 rounded-md bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-xs">
            <Shield className="h-3.5 w-3.5 text-zinc-950" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">
            SPRAT
          </span>
        </Link>

        <Link
          href="/"
          className="text-zinc-500 hover:text-zinc-300 p-1 rounded transition-colors"
          title="Home"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Active Project Label */}
      <div className="px-4 py-3 border-b border-zinc-850/60">
        <div className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">
          Project
        </div>
        <div className="text-xs font-medium text-zinc-200 mt-0.5 truncate">
          {activeProjectName}
        </div>
      </div>

      {/* Quick Action Buttons (Only visible to Authoring Roles, NEVER for Guest) */}
      {canEdit && (
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center space-x-1">
            <button
              onClick={onOpenGoalModal}
              className="flex-1 py-1 rounded border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-white flex items-center justify-center space-x-1 transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>Goal</span>
            </button>
            <button
              onClick={onOpenScenarioModal}
              className="flex-1 py-1 rounded border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-white flex items-center justify-center space-x-1 transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>Threat</span>
            </button>
            <button
              onClick={onOpenReqModal}
              className="flex-1 py-1 rounded border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-white flex items-center justify-center space-x-1 transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>Req</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                isActive
                  ? "bg-zinc-800/80 text-zinc-100 font-medium"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon
                  className={`h-3.5 w-3.5 flex-shrink-0 ${
                    isActive ? "text-zinc-100" : "text-zinc-400"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono text-zinc-500">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Authentic User Profile Card (No role-switcher buttons!) */}
      <div className="p-3 border-t border-zinc-850 bg-[#09090b]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-750 flex items-center justify-center font-bold text-xs text-zinc-200 flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-zinc-200 truncate">
                {user.name}
              </div>
              <div className="text-[10px] text-zinc-500 capitalize truncate">
                {user.role.replace("_", " ")}
              </div>
            </div>
          </div>

          <Link
            href="/login"
            className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Sign out / Switch user"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
