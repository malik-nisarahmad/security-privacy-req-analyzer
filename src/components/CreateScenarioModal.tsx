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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-zinc-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-md bg-zinc-800 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Author Misuse & Threat Scenario
              </h3>
              <p className="text-[11px] text-zinc-400">
                SRS FR-SSM 1: 13 Standardized Scenario Attributes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">
              Scenario Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Adversary Eavesdropping on Unsegmented Clinic Wi-Fi"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Sources
              </label>
              <input
                type="text"
                value={formData.sources}
                onChange={(e) =>
                  setFormData({ ...formData, sources: e.target.value })
                }
                placeholder="e.g. Rogue Access Point in waiting lounge"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Actors
              </label>
              <input
                type="text"
                value={formData.actors}
                onChange={(e) =>
                  setFormData({ ...formData, actors: e.target.value })
                }
                placeholder="e.g. External Threat Actor"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Events
              </label>
              <input
                type="text"
                value={formData.events}
                onChange={(e) =>
                  setFormData({ ...formData, events: e.target.value })
                }
                placeholder="e.g. Tablet transmits ePHI payload"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Actions
              </label>
              <input
                type="text"
                value={formData.actions}
                onChange={(e) =>
                  setFormData({ ...formData, actions: e.target.value })
                }
                placeholder="e.g. Packet sniffing with Wireshark"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Obstacles
              </label>
              <input
                type="text"
                value={formData.obstacles}
                onChange={(e) =>
                  setFormData({ ...formData, obstacles: e.target.value })
                }
                placeholder="e.g. WPA3 Enterprise, Certificate Pinning"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Constraints
              </label>
              <input
                type="text"
                value={formData.constraints_text}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    constraints_text: e.target.value,
                  })
                }
                placeholder="e.g. Session terminates in 15 seconds"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Pre-conditions
              </label>
              <input
                type="text"
                value={formData.pre_conditions}
                onChange={(e) =>
                  setFormData({ ...formData, pre_conditions: e.target.value })
                }
                placeholder="e.g. RF proximity to Wi-Fi perimeter"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Post-conditions
              </label>
              <input
                type="text"
                value={formData.post_conditions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    post_conditions: e.target.value,
                  })
                }
                placeholder="e.g. SIEM alert triggered, client isolated"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100"
              />
            </div>
          </div>

          {/* Link to Goals */}
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">
              Link to Goals (Many-to-Many)
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950 border border-zinc-800/80 rounded-lg">
              {goals.map((g) => {
                const isChecked = formData.linked_goal_ids.includes(g.id);
                return (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`text-[11px] px-2.5 py-1 rounded font-mono transition-colors ${
                      isChecked
                        ? "bg-zinc-100 text-zinc-950 font-bold"
                        : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {g.goal_id_label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold shadow-sm transition-all active:scale-[0.98]"
            >
              Save Scenario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
