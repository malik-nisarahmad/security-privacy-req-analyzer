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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-zinc-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-md bg-zinc-800 text-indigo-400 flex items-center justify-center">
              <FileCode2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Specify Security Requirement
              </h3>
              <p className="text-[11px] text-zinc-400">
                SRS FR-SRM 1: Strictly Scoped (No extraneous fields)
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">
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
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">
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
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">
              Constraints Text
            </label>
            <input
              type="text"
              value={formData.constraints_text}
              onChange={(e) =>
                setFormData({ ...formData, constraints_text: e.target.value })
              }
              placeholder="e.g. Handshake latency under 250ms, AES-256 cipher"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">
              Link to Goals
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
              Save Requirement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
