/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Target, 
  Plus, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  Circle, 
  Trash2, 
  Sparkles, 
  Dumbbell, 
  Briefcase, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Goal } from "../types";

interface GoalPlannerProps {
  goals: Goal[];
  onAddGoal: (goalData: { title: string; category: string; targetDate: string }) => Promise<void>;
  onToggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  loading: boolean;
}

export default function GoalPlanner({ goals, onAddGoal, onToggleMilestone, onDeleteGoal, loading }: GoalPlannerProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("learning");
  const [targetDate, setTargetDate] = useState("");
  const [activeGoalId, setActiveGoalId] = useState<string | null>(goals[0]?.id || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    await onAddGoal({ title, category, targetDate });
    setTitle("");
    setCategory("learning");
    setTargetDate("");
    setShowForm(false);
  };

  const selectedGoal = goals.find((g) => g.id === activeGoalId) || goals[0];

  const categoryIcons: Record<string, any> = {
    fitness: Dumbbell,
    business: Briefcase,
    learning: BookOpen,
    other: Target,
  };

  const categoryColors: Record<string, string> = {
    fitness: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    business: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    learning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    other: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  };

  return (
    <div id="goal_planner" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Column: Goal list selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" /> Active Performance Goals
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="p-1 px-2.5 rounded-lg bg-emerald-400 text-slate-950 font-bold hover:bg-emerald-300 text-xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Plan
          </button>
        </div>

        {/* Create goal popup form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/85 space-y-4 shadow-xl"
              onSubmit={handleSubmit}
            >
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">What is your primary milestone?</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Run a 10km metabolic stretch"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="fitness">Physical/Gym</option>
                    <option value="business">Work/Business</option>
                    <option value="learning">Education/Skills</option>
                    <option value="other">General Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Target Date</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-emerald-400 text-slate-950 text-xs font-bold hover:bg-emerald-300 transition-colors flex items-center justify-center gap-1 shadow-lg shadow-emerald-400/5"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                {loading ? "Aura is structuring..." : "Generate AI Milestone Set"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* List of Goals */}
        <div className="space-y-2.5">
          {goals.map((goal) => {
            const Icon = categoryIcons[goal.category] || Target;
            const completedCount = goal.milestones.filter((m) => m.status === "completed").length;
            const colorClass = categoryColors[goal.category] || "text-blue-400 bg-blue-500/10 border-blue-500/20";
            const isSelected = selectedGoal?.id === goal.id;

            return (
              <div
                key={goal.id}
                onClick={() => {
                  setActiveGoalId(goal.id);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                  isSelected 
                    ? "bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/5 text-white" 
                    : "bg-slate-900/40 border-slate-850 hover:border-slate-800 text-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm line-clamp-1">{goal.title}</h4>
                      <span className="text-[9px] text-slate-500 font-mono">Target: {goal.targetDate}</span>
                    </div>
                  </div>
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this goal?")) onDeleteGoal(goal.id);
                    }}
                    className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold">Milestones Completeness</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {completedCount}/{goal.milestones.length} ({Math.round((completedCount/goal.milestones.length)*100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${(completedCount / goal.milestones.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle & Right Column: Select Active Goal details */}
      <div className="md:col-span-2 space-y-6">
        {selectedGoal ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  categoryColors[selectedGoal.category]
                }`}>
                  {selectedGoal.category} roadmap
                </span>
                <h3 className="font-sans text-lg sm:text-xl font-bold text-white mt-1.5">{selectedGoal.title}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Calendar className="w-4 h-4 text-emerald-400" /> Goal Deadline: {selectedGoal.targetDate}
              </div>
            </div>

            {/* Milestones toggles */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Structural Weekly Milestones
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {selectedGoal.milestones.map((m) => {
                  const isDone = m.status === "completed";
                  return (
                    <div
                      key={m.id}
                      onClick={() => onToggleMilestone(selectedGoal.id, m.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 hover:scale-[1.01] ${
                        isDone 
                          ? "bg-emerald-500/5 border-emerald-500/25 text-emerald-300" 
                          : "bg-slate-950/40 border-slate-850 text-slate-400"
                      }`}
                    >
                      <button className="shrink-0 mt-0.5" type="button">
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-500/25" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">
                          Week {m.weekNumber}
                        </div>
                        <h5 className={`font-bold text-xs sm:text-sm ${isDone ? "line-through text-slate-500" : "text-slate-200"}`}>
                          {m.title}
                        </h5>
                        <p className="text-[10px] leading-relaxed text-slate-500 font-medium select-none">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly & Daily Guidelines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Weekly Focus Strategy
                </h4>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-2.5">
                  {selectedGoal.weeklyPlans?.map((plan, i) => (
                    <div key={i} className="flex gap-2.5 items-start text-xs text-slate-300 leading-relaxed font-semibold">
                      <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{plan}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Daily Micro Discipline Targets
                </h4>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-2.5">
                  {selectedGoal.dailyActions?.map((act, i) => (
                    <div key={i} className="flex gap-2.5 items-start text-xs text-slate-300 leading-relaxed font-semibold">
                      <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[280px] rounded-xl border border-dashed border-slate-800 bg-slate-950/20 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <AlertCircle className="w-8 h-8 text-slate-600 mb-2" />
            <span className="text-xs font-semibold uppercase tracking-wider mb-1">No Goal Selected</span>
            <p className="text-[10px] max-w-xs text-slate-500 font-medium">Use the "Plan" button above to launch Aura's generative model and decompose complex outputs.</p>
          </div>
        )}
      </div>
    </div>
  );
}
