"use client";

import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface CreateScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (scenario: any) => void;
  goals: { id: string; goal_id_label: string }[];
}

export function CreateScenarioModal({
  isOpen,
  onClose,
  onAdd,
  goals,
}: CreateScenarioModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    sources: "",
    actors: "",
    events: "",
    actions: "",
    obstacles: "",
    constraints_text: "",
    pre_conditions: "",
    post_conditions: "",
    status: "Active",
    issues: "",
    linked_goal_ids: [] as string[],
    linked_requirement_ids: [] as string[],
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onAdd(formData);
    onClose();
  };

  const toggleGoal = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      linked_goal_ids: prev.linked_goal_ids.includes(id)
        ? prev.linked_goal_ids.filter((g) => g !== id)
        : [...prev.linked_goal_ids, id],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#332F3A]/40 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="clay-card rounded-[32px] sm:rounded-[40px] max-w-2xl w-full p-7 sm:p-8 space-y-5 shadow-[24px_24px_48px_rgba(160,150,180,0.3),-12px_-12px_28px_#ffffff] max-h-[90vh] overflow-y-auto bg-white/95">
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE5F3]">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#FCD34D] to-[#F59E0B] text-white flex items-center justify-center shadow-[4px_4px_10px_rgba(245,158,11,0.3)]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                Author Misuse & Threat Scenario
              </h3>
              <p className="text-xs font-medium text-[#635F69]">
                13 Standardized Scenario Attributes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#635F69] hover:text-[#332F3A] hover:bg-[#EFEBF5] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[#635F69] font-bold mb-1">
              Scenario Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Adversary Eavesdropping on Unsegmented Clinic Wi-Fi"
              className="w-full px-4 py-2.5 clay-input text-xs font-medium placeholder-[#635F69]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#635F69] font-bold mb-1">
                Sources
              </label>
              <input
                type="text"
                value={formData.sources}
                onChange={(e) =>
                  setFormData({ ...formData, sources: e.target.value })
                }
                placeholder="Origin of the threat..."
                className="w-full px-4 py-2.5 clay-input text-xs font-medium placeholder-[#635F69]"
              />
            </div>
            <div>
              <label className="block text-[#635F69] font-bold mb-1">
                Threat Actors
              </label>
              <input
                type="text"
                value={formData.actors}
                onChange={(e) =>
                  setFormData({ ...formData, actors: e.target.value })
                }
                placeholder="e.g. External hacker, contractor"
                className="w-full px-4 py-2.5 clay-input text-xs font-medium placeholder-[#635F69]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#635F69] font-bold mb-1">
                Initiating Events
              </label>
              <input
                type="text"
                value={formData.events}
                onChange={(e) =>
                  setFormData({ ...formData, events: e.target.value })
                }
                placeholder="What starts the attack?"
                className="w-full px-4 py-2.5 clay-input text-xs font-medium placeholder-[#635F69]"
              />
            </div>
            <div>
              <label className="block text-[#635F69] font-bold mb-1">
                Actions Executed
              </label>
              <input
                type="text"
                value={formData.actions}
                onChange={(e) =>
                  setFormData({ ...formData, actions: e.target.value })
                }
                placeholder="Tactics, techniques executed"
                className="w-full px-4 py-2.5 clay-input text-xs font-medium placeholder-[#635F69]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#635F69] font-bold mb-1">
                Defensive Obstacles
              </label>
              <input
                type="text"
                value={formData.obstacles}
                onChange={(e) =>
                  setFormData({ ...formData, obstacles: e.target.value })
                }
                placeholder="Controls or barriers"
                className="w-full px-4 py-2.5 clay-input text-xs font-medium placeholder-[#635F69]"
              />
            </div>
            <div>
              <label className="block text-[#635F69] font-bold mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-2.5 clay-input text-xs font-medium"
              >
                <option value="Active">Active</option>
                <option value="Identified">Identified</option>
                <option value="Mitigated">Mitigated</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#635F69] font-bold mb-1.5">
              Link with Security Goals
            </label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-[#EFEBF5] shadow-[inset_2px_2px_5px_#dcd7e7,inset_-2px_-2px_5px_#ffffff]">
              {goals.map((g) => {
                const isChecked = formData.linked_goal_ids.includes(g.id);
                return (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-bold transition-all ${
                      isChecked
                        ? "clay-btn-primary text-white shadow-[2px_2px_6px_rgba(139,92,246,0.3)]"
                        : "bg-white text-[#635F69] hover:text-[#332F3A] shadow-[2px_2px_4px_rgba(160,150,180,0.1)]"
                    }`}
                  >
                    {g.goal_id_label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[#EAE5F3]">
            <button
              type="button"
              onClick={onClose}
              className="clay-btn-secondary px-5 py-2.5 text-xs font-bold text-[#635F69]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="clay-btn-primary px-6 py-2.5 text-white text-xs font-bold shadow-[6px_6px_14px_rgba(139,92,246,0.3),-2px_-2px_6px_#ffffff]"
            >
              Save Scenario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
