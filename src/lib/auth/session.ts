"use client";

import { useState, useEffect } from "react";
import type { UserRole } from "@/types";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const PRESET_USERS: Record<string, UserSession> = {
  pm: {
    id: "usr-pm",
    name: "Sarah Chen",
    email: "pm@sprat.org",
    role: "project_manager",
  },
  analyst: {
    id: "usr-analyst",
    name: "David Kim",
    email: "analyst@sprat.org",
    role: "analyst",
  },
  admin: {
    id: "usr-admin",
    name: "Elena Rostova",
    email: "admin@sprat.org",
    role: "admin",
  },
  guest: {
    id: "usr-guest",
    name: "Auditor Guest",
    email: "guest@sprat.org",
    role: "guest",
  },
};

const SESSION_STORAGE_KEY = "sprat_active_user";

export function getStoredSession(): UserSession {
  if (typeof window === "undefined") {
    return PRESET_USERS.pm;
  }
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // fallback
  }
  return PRESET_USERS.pm;
}

export function setStoredSession(user: UserSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // fallback
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // fallback
  }
}

export function useUserSession() {
  const [session, setSession] = useState<UserSession>(PRESET_USERS.pm);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSession(getStoredSession());
    setIsLoaded(true);
  }, []);

  const loginAs = (userKey: keyof typeof PRESET_USERS | UserSession) => {
    const user = typeof userKey === "string" ? PRESET_USERS[userKey] : userKey;
    if (user) {
      setStoredSession(user);
      setSession(user);
    }
  };

  const logout = () => {
    setStoredSession(PRESET_USERS.guest);
    setSession(PRESET_USERS.guest);
  };

  return { session, isLoaded, loginAs, logout };
}
