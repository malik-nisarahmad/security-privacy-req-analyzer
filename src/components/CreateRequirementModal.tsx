"use client";

import React, { useState } from "react";
import { FileCode2, X } from "lucide-react";

interface CreateRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (req: any) => void;
  goals: { id: string; goal_id_label: string }[];
}

export function CreateRequirementModal({
  isOpen,
  onClose,
  onAdd,
  goals,
}: CreateRequirementModalProps) {
  const [formData, setFormData] = useState({
    req_id_label: "",
    description: "",
    constraints_text: "",
    linked_goal_ids: [] as string[],
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.req_id_label.trim() || !formData.description.trim()) return;
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
      <div className="clay-card rounded-[32px] sm:rounded-[40px] max-w-lg w-full p-7 sm:p-8 space-y-5 shadow-[24px_24px_48px_rgba(160,150,180,0.3),-12px_-12px_28px_#ffffff] max-h-[90vh] overflow-y-auto bg-white/95">
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE5F3]">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] text-white flex items-center justify-center shadow-[4px_4px_10px_rgba(14,165,233,0.3)]">
              <FileCode2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#332F3A]" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
                Specify Security Requirement
              </h3>
              <p className="text-xs font-medium text-[#635F69]">
                Formal specification & constraints
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
          <div>
            <label className="block text-[#635F69] font-bold mb-1.5">
              Requirement ID Label *
            </label>
            <input
              type="text"
              required
              value={formData.req_id_label}
              onChange={(e) =>
                setFormData({ ...formData, req_id_label: e.target.value })
              }
              placeholder="e.g. R-003"
              className="w-full px-4 py-2.5 clay-input text-xs font-medium placeholder-[#635F69]"
            />
          </div>

          <div>
            <label className="block text-[#635F69] font-bold mb-1.5">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="The system shall enforce TLS 1.3 encryption across..."
              className="w-full px-4 py-2.5 clay-input text-xs font-medium placeholder-[#635F69] resize-none"
            />
          </div>

          <div>
            <label className="block text-[#635F69] font-bold mb-1.5">
              Constraints Text
            </label>
            <input
              type="text"
              value={formData.constraints_text}
              onChange={(e) =>
                setFormData({ ...formData, constraints_text: e.target.value })
              }
              placeholder="e.g. Handshake latency under 250ms, AES-256 cipher"
              className="w-full px-4 py-2.5 clay-input text-xs font-medium placeholder-[#635F69]"
            />
          </div>

          <div>
            <label className="block text-[#635F69] font-bold mb-1.5">
              Link to Goals
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
              Save Requirement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
