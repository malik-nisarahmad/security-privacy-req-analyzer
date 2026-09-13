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
    <div className="fixed inset-0 z-50 bg-[#332F3A]/40 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="clay-card rounded-[32px] sm:rounded-[40px] max-w-xl w-full p-7 sm:p-8 space-y-6 shadow-[24px_24px_48px_rgba(160,150,180,0.3),-12px_-12px_28px_#ffffff] max-h-[90vh] overflow-y-auto bg-white/95">
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE5F3]">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white flex items-center justify-center shadow-[4px_4px_10px_rgba(139,92,246,0.3)]">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                Specify Security / Privacy Goal
              </h3>
              <p className="text-xs font-medium text-[#635F69]">
                Categorization, Granularity & Subject mapping
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[#635F69] font-bold mb-1.5">
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
                className="w-full px-4 py-2.5 clay-input text-xs font-medium placeholder-[#635F69]"
              />
            </div>
            <div>
              <label className="block text-[#635F69] font-bold mb-1.5">
                Taxonomy Category *
              </label>
              <select
                value={formData.taxonomy}
                onChange={(e) =>
                  setFormData({ ...formData, taxonomy: e.target.value })
                }
                className="w-full px-4 py-2.5 clay-input text-xs font-medium"
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
            <label className="block text-[#635F69] font-bold mb-1.5">
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
              className="w-full px-4 py-2.5 clay-input text-xs font-medium placeholder-[#635F69] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[#635F69] font-bold mb-1.5">
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
                className="w-full px-4 py-2.5 clay-input text-xs font-medium"
              >
                <option value="policy">Policy Level</option>
                <option value="scenario">Scenario Level</option>
              </select>
            </div>
            <div>
              <label className="block text-[#635F69] font-bold mb-1.5">
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
                className="w-full px-4 py-2.5 clay-input text-xs font-medium"
              >
                <option value="observable">Observable</option>
                <option value="unobservable">Unobservable</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[#635F69] font-bold mb-1.5">Actor</label>
              <input
                type="text"
                value={formData.actor}
                onChange={(e) =>
                  setFormData({ ...formData, actor: e.target.value })
                }
                placeholder="e.g. Rogue Administrator"
                className="w-full px-4 py-2.5 clay-input text-xs font-medium placeholder-[#635F69]"
              />
            </div>
            <div>
              <label className="block text-[#635F69] font-bold mb-1.5">
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
                className="w-full px-4 py-2.5 clay-input text-xs font-medium placeholder-[#635F69]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#635F69] font-bold mb-1.5">
              Subject Classifications (Tags)
            </label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-[#EFEBF5] shadow-[inset_2px_2px_5px_#dcd7e7,inset_-2px_-2px_5px_#ffffff] max-h-28 overflow-y-auto">
              {subjectsList.map((sub) => {
                const isSelected = formData.subjects.includes(sub);
                return (
                  <button
                    type="button"
                    key={sub}
                    onClick={() => toggleSubject(sub)}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-bold transition-all ${
                      isSelected
                        ? "clay-btn-primary text-white shadow-[2px_2px_6px_rgba(139,92,246,0.3)]"
                        : "bg-white text-[#635F69] hover:text-[#332F3A] shadow-[2px_2px_4px_rgba(160,150,180,0.1)]"
                    }`}
                  >
                    {sub}
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
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
