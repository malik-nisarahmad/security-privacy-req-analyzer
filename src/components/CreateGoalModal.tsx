"use client";

import React, { useState } from "react";
import { Target, X } from "lucide-react";
import type { GoalGranularity, GoalObservability } from "@/types";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: any) => void;
  taxonomies: { id: string; parent: string; name: string }[];
  subjectsList: string[];
  policies: { id: string; title: string }[];
}

export function CreateGoalModal({
  isOpen,
  onClose,
  onAdd,
  taxonomies,
  subjectsList,
  policies,
}: CreateGoalModalProps) {
  const [formData, setFormData] = useState({
    goal_id_label: "",
    description: "",
    taxonomy: taxonomies[0]?.name || "Integrity/Security",
    actor: "",
    policy_id: policies[0]?.id || "pol-1",
    granularity: "policy" as GoalGranularity,
    observability: "observable" as GoalObservability,
    occurrences: 1,
    context_info: "",
    relevant_legislation: "",
    subjects: [subjectsList[0] || "Account Information"],
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.goal_id_label.trim() || !formData.description.trim()) {
      return;
    }
    onAdd(formData);
    onClose();
  };

  const toggleSubject = (sub: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(sub)
        ? prev.subjects.filter((s) => s !== sub)
        : [...prev.subjects, sub],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-zinc-800 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-md bg-zinc-800 text-zinc-100 flex items-center justify-center">
              <Target className="h-4 w-4 text-zinc-300" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Specify Security / Privacy Goal
              </h3>
              <p className="text-[11px] text-zinc-400">
                SRS FR-GSM 1–8: Categorization, Granularity & Subjects
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">
                Goal ID Label *
              </label>
              <input
                type="text"
                required
                value={formData.goal_id_label}
                onChange={(e) =>
                  setFormData({ ...formData, goal_id_label: e.target.value })
                }
                placeholder="e.g. G-003"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">
                Taxonomy Category *
              </label>
              <select
                value={formData.taxonomy}
                onChange={(e) =>
                  setFormData({ ...formData, taxonomy: e.target.value })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                {taxonomies.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.parent}: {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">
              Goal Description *
            </label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="State the security or privacy goal clearly..."
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">
                Granularity
              </label>
              <select
                value={formData.granularity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    granularity: e.target.value as GoalGranularity,
                  })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100"
              >
                <option value="policy">Policy Level</option>
                <option value="scenario">Scenario Level</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">
                Observability
              </label>
              <select
                value={formData.observability}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    observability: e.target.value as GoalObservability,
                  })
                }
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100"
              >
                <option value="observable">Observable</option>
                <option value="unobservable">Unobservable</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">Actor</label>
              <input
                type="text"
                value={formData.actor}
                onChange={(e) =>
                  setFormData({ ...formData, actor: e.target.value })
                }
                placeholder="e.g. Rogue Administrator"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">
                Relevant Legislation
              </label>
              <input
                type="text"
                value={formData.relevant_legislation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    relevant_legislation: e.target.value,
                  })
                }
                placeholder="e.g. GDPR Art. 32, HIPAA §164"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">
              Subject Classifications (Tags)
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950 border border-zinc-800/80 rounded-lg max-h-28 overflow-y-auto">
              {subjectsList.map((sub) => {
                const isSelected = formData.subjects.includes(sub);
                return (
                  <button
                    type="button"
                    key={sub}
                    onClick={() => toggleSubject(sub)}
                    className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                      isSelected
                        ? "bg-zinc-100 text-zinc-900 font-medium"
                        : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {sub}
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
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
