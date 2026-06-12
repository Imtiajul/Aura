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
  AlertCircle,
  Check,
  ListTodo,
  TrendingDown,
  Activity,
  UserCheck,
  Zap
} from "lucide-react";
import { Goal, Task } from "../types";

interface GoalPlannerProps {
  // Goals Roadmap state
  goals: Goal[];
  onAddGoal: (goalData: { title: string; category: string; targetDate: string }) => Promise<void>;
  onToggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  
  // Daily Planner (Todo list) state
  tasks: Task[];
  onAddTask: (title: string, priority: "low" | "medium" | "high") => Promise<void>;
  onToggleTask: (taskId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  
  loading: boolean;
}

export default function GoalPlanner({ 
  goals = [], 
  onAddGoal, 
  onToggleMilestone, 
  onDeleteGoal, 
  tasks = [], 
  onAddTask, 
  onToggleTask, 
  onDeleteTask, 
  loading 
}: GoalPlannerProps) {
  // Tab selector: "daily" (todolist) vs "longterm" (milestones goalplanner)
  const [plannerTab, setPlannerTab] = useState<"daily" | "longterm">("daily");
  
  // Goal creation Form options
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalCategory, setGoalCategory] = useState("learning");
  const [goalTargetDate, setGoalTargetDate] = useState("");
  const [activeGoalId, setActiveGoalId] = useState<string | null>(goals[0]?.id || null);

  // Manual Task creation Form options
  const [manualTaskTitle, setManualTaskTitle] = useState("");
  const [manualTaskPriority, setManualTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [loadingManualTask, setLoadingManualTask] = useState(false);

  // Gemini consultation parameters
  const [userFocus, setUserFocus] = useState("");
  const [consultationResult, setConsultationResult] = useState<{ rationale: string; recommendations: string[]; followUpQuestions?: string[] } | null>(null);
  const [loadingConsultation, setLoadingConsultation] = useState(false);
  const [addedRecommendations, setAddedRecommendations] = useState<Record<string, boolean>>({});

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle) return;
    await onAddGoal({ title: goalTitle, category: goalCategory, targetDate: goalTargetDate });
    setGoalTitle("");
    setGoalCategory("learning");
    setGoalTargetDate("");
    setShowGoalForm(false);
  };

  const handleManualTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTaskTitle.trim() || loadingManualTask) return;
    setLoadingManualTask(true);
    await onAddTask(manualTaskTitle.trim(), manualTaskPriority);
    setManualTaskTitle("");
    setManualTaskPriority("medium");
    setLoadingManualTask(false);
  };

  const handleConsultAura = async () => {
    setLoadingConsultation(true);
    setConsultationResult(null);
    setAddedRecommendations({});
    try {
      const res = await fetch("/api/coaching/plan-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userFocus })
      });
      if (res.ok) {
        const data = await res.json();
        setConsultationResult(data);
      }
    } catch (e) {
      console.error("Failed to fetch plan consultation", e);
    } finally {
      setLoadingConsultation(false);
    }
  };

  const handleAddRecToDaily = async (rec: string) => {
    if (addedRecommendations[rec]) return;
    await onAddTask(rec, "high");
    setAddedRecommendations(prev => ({ ...prev, [rec]: true }));
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

  const getPriorityBadgeColor = (p: string) => {
    if (p === "high") return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    if (p === "medium") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-slate-850 text-slate-400 border-slate-800";
  };

  return (
    <div id="goal_planner_root" className="space-y-6">
      {/* Header Tabs: Daily Tasks vs Strategic Goals */}
      <div className="flex border-b border-slate-800/80 pb-1 gap-2">
        <button
          onClick={() => setPlannerTab("daily")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            plannerTab === "daily" 
              ? "bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/5" 
              : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Daily Performance Action Plan (To-Do)</span>
        </button>
        <button
          onClick={() => setPlannerTab("longterm")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            plannerTab === "longterm" 
              ? "bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/5" 
              : "text-slate-400 hover:text-white hover:bg-slate-900/40"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Strategic Long-term Milestones</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {plannerTab === "daily" ? (
          /* ================== TAB 1: DAILY PLANNINIG (TODO LIST) ================== */
          <motion.div
            key="daily-planner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in"
          >
            {/* Left Column: Manual Action Item Addition & Items list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/25 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-emerald-400" /> Log Daily Performance Task
                </h3>

                <form onSubmit={handleManualTaskSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    value={manualTaskTitle}
                    onChange={(e) => setManualTaskTitle(e.target.value)}
                    placeholder="e.g., Conduct 45-min linear code block for milestones..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                  <div className="flex gap-2">
                    <select
                      value={manualTaskPriority}
                      onChange={(e) => setManualTaskPriority(e.target.value as any)}
                      className="px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 font-bold focus:outline-none focus:border-emerald-500"
                    >
                      <option value="high">🔥 High Priority</option>
                      <option value="medium">⚡ Medium Priority</option>
                      <option value="low">🌱 Low Priority</option>
                    </select>

                    <button
                      type="submit"
                      disabled={loadingManualTask || !manualTaskTitle.trim()}
                      className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-1 shrink-0 disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </form>
              </div>

              {/* Tasks Checklist Grid */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-400" /> Action Checklist ({tasks.filter(t => t.completed).length}/{tasks.length})
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">
                    XP triggers on completion
                  </span>
                </div>

                <div className="space-y-2.5">
                  {tasks.length === 0 ? (
                    <div className="py-12 border border-dashed border-slate-850 rounded-xl text-center text-slate-500 flex flex-col items-center justify-center space-y-1.5">
                      <ListTodo className="w-7 h-7 text-slate-700 animate-pulse" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tactical Sheet Dry</span>
                      <p className="text-[10px] text-slate-500 font-semibold">Consult Aura on the right or manually write tasks above to track progression indices.</p>
                    </div>
                  ) : (
                    tasks.map((task) => {
                      const isDone = task.completed;
                      return (
                        <div
                          key={task.id}
                          onClick={() => onToggleTask(task.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between hover:scale-[1.005] duration-150 ${
                            isDone 
                              ? "bg-emerald-500/5 border-emerald-500/25 text-emerald-300/80" 
                              : "bg-slate-950/40 border-slate-850 hover:border-slate-800 text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-3">
                            <button className="shrink-0 mt-0.5" type="button">
                              {isDone ? (
                                <CheckCircle className="w-4.5 h-4.5 text-emerald-400 fill-emerald-500/10" />
                              ) : (
                                <Circle className="w-4.5 h-4.5 text-slate-600 hover:text-emerald-500" />
                              )}
                            </button>
                            <span className={`text-xs sm:text-sm font-bold truncate ${isDone ? "line-through text-slate-500" : ""}`}>
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            {/* Priority Indicator */}
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider font-mono ${getPriorityBadgeColor(task.priority)}`}>
                              {task.priority}
                            </span>

                            {/* Delete Task Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTask(task.id);
                              }}
                              className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Consult Gemini for Work Plan recommendations list */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/35 space-y-4 shadow-xl">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4.5 h-4.5 text-emerald-400" /> Aura Performance Consult
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    Consult Gemini to evaluate your current long-term roadmaps, fitness goals, and schedule parameters to construct a perfect daily high-performance task block.
                  </p>
                </div>

                {/* Interaction Field with user focus challenges */}
                <div className="space-y-1.5">
                  <label htmlFor="user_focus_field" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
                    Focus Focus Challenge / Custom Goals (Optional)
                  </label>
                  <textarea
                    id="user_focus_field"
                    value={userFocus}
                    onChange={(e) => setUserFocus(e.target.value)}
                    placeholder="e.g., Feeling extremely sluggish today, high priority linear presentation deadline at 5 PM. Build tailored focus blocks..."
                    rows={2}
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-850 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-semibold resize-none"
                  />
                </div>

                <button
                  onClick={handleConsultAura}
                  disabled={loadingConsultation}
                  className="w-full py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingConsultation ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin shrink-0" />
                      <span>Aura is building roadmap parameters...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950 shrink-0" />
                      <span>Consult with Gemini on Plan</span>
                    </>
                  )}
                </button>

                <AnimatePresence mode="wait">
                  {loadingConsultation && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-12 flex flex-col items-center justify-center text-center space-y-2"
                    >
                      <div className="w-9 h-9 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin" />
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">Compiling cognitive profiles</span>
                    </motion.div>
                  )}

                  {consultationResult && !loadingConsultation && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 border-t border-slate-800/80 pt-4"
                    >
                      {/* Rationale feedback */}
                      <div className="p-3.5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-300 text-[11px] leading-relaxed font-bold">
                        "{consultationResult.rationale}"
                      </div>

                      {/* Recommend bullet points */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Recommended Actions</span>
                        
                        <div className="space-y-2">
                          {consultationResult.recommendations.map((rec, i) => {
                            const isAdded = addedRecommendations[rec];
                            return (
                              <div 
                                key={i}
                                className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex items-start justify-between gap-3"
                              >
                                <div className="flex gap-2 min-w-0">
                                  <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  <span className="text-xs text-slate-200 font-semibold leading-relaxed pr-1 whitespace-pre-wrap">{rec}</span>
                                </div>

                                <button
                                  onClick={() => handleAddRecToDaily(rec)}
                                  disabled={isAdded}
                                  className={`px-2 py-1 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all shrink-0 ${
                                    isAdded 
                                      ? "bg-slate-800 text-slate-500 border border-slate-750 cursor-default" 
                                      : "bg-emerald-400 text-slate-950 hover:bg-emerald-300 border border-emerald-400"
                                  }`}
                                >
                                  {isAdded ? (
                                    <span className="flex items-center gap-0.5"><Check className="w-3 h-3" /> Added</span>
                                  ) : (
                                    <span>+ Add</span>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Aura Calibration followUpQuestions section to optimize consulting further */}
                      {consultationResult.followUpQuestions && consultationResult.followUpQuestions.length > 0 && (
                        <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-950/30 space-y-3.5 shadow-xl">
                          <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                              Aura Consulting Calibration Questions
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            {consultationResult.followUpQuestions.map((q, idx) => (
                              <div key={idx} className="space-y-2">
                                <p className="text-xs text-slate-300 font-semibold leading-relaxed">{q}</p>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    id={`q_answer_${idx}`}
                                    placeholder="Type answer here..."
                                    className="flex-1 px-3 py-2 bg-slate-950/90 border border-slate-850 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-medium"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        const inputVal = (e.target as HTMLInputElement).value;
                                        if (inputVal.trim()) {
                                          setUserFocus(prev => {
                                            const addition = `${prev ? prev + "\n" : ""}[Answer to: ${q}] ${inputVal.trim()}`;
                                            return addition;
                                          });
                                          (e.target as HTMLInputElement).value = "";
                                        }
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const inputEl = document.getElementById(`q_answer_${idx}`) as HTMLInputElement;
                                      if (inputEl && inputEl.value.trim()) {
                                        setUserFocus(prev => {
                                          const addition = `${prev ? prev + "\n" : ""}[Answer to: ${q}] ${inputEl.value.trim()}`;
                                          return addition;
                                        });
                                        inputEl.value = "";
                                      }
                                    }}
                                    className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-400 hover:text-slate-950 text-emerald-400 font-bold text-[10px] uppercase tracking-wider transition-all shrink-0"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <p className="text-[9px] font-medium text-slate-500 leading-normal pl-1 border-l border-emerald-500/20">
                            💡 Saving your response adds it to your <strong className="text-slate-400">custom focus field</strong> above. Press the command button <span className="text-emerald-400 font-bold">\"Consult with Gemini on Plan\"</span> again to recalculate your micro-action points!
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ================== TAB 2: LONG TERM PERFORMANCE SPECIFIC MILESTONES ================== */
          <motion.div
            key="longterm-planner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in"
          >
            {/* Left Column: List of long-term goals */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" /> Active Milestones Roadmaps
                </h3>
                <button
                  onClick={() => setShowGoalForm(!showGoalForm)}
                  className="p-1 px-2.5 rounded-lg bg-emerald-400 text-slate-950 font-bold hover:bg-emerald-300 text-xs transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Plan
                </button>
              </div>

              {/* Create goal popup form */}
              <AnimatePresence>
                {showGoalForm && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/85 space-y-4 shadow-xl"
                    onSubmit={handleGoalSubmit}
                  >
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">What is your primary milestone?</label>
                      <input
                        type="text"
                        required
                        value={goalTitle}
                        onChange={(e) => setGoalTitle(e.target.value)}
                        placeholder="e.g., Run a 10km metabolic stretch"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                        <select
                          value={goalCategory}
                          onChange={(e) => setGoalCategory(e.target.value)}
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
                          value={goalTargetDate}
                          onChange={(e) => setGoalTargetDate(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 rounded-lg bg-emerald-400 text-slate-950 text-xs font-bold hover:bg-emerald-300 transition-colors flex items-center justify-center gap-1 shadow-lg shadow-emerald-400/5 hover:scale-[1.01] duration-150"
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      {loading ? "Aura is structuring..." : "Generate AI Milestone Set"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* List of Goals */}
              <div className="space-y-2.5">
                {goals.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-semibold">
                    No active strategic milestones found. Click "Plan" to decompose a new major target.
                  </div>
                ) : (
                  goals.map((g) => {
                    const Icon = categoryIcons[g.category] || Target;
                    const completedCount = g.milestones.filter((m) => m.status === "completed").length;
                    const colorClass = categoryColors[g.category] || "text-blue-400 bg-blue-500/10 border-blue-500/20";
                    const isSelected = selectedGoal?.id === g.id;

                    return (
                      <div
                        key={g.id}
                        onClick={() => setActiveGoalId(g.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] duration-150 ${
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
                              <h4 className="font-bold text-xs sm:text-sm line-clamp-1">{g.title}</h4>
                              <span className="text-[9px] text-slate-500 font-mono">Target: {g.targetDate}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Delete this goal?")) onDeleteGoal(g.id);
                            }}
                            className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3.5 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                            <span>Milestones</span>
                            <span className="font-mono text-emerald-400">
                              {completedCount}/{g.milestones.length} ({Math.round((completedCount/g.milestones.length)*100)}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${(completedCount / g.milestones.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column details of selected Goal */}
            <div className="md:col-span-2 space-y-6">
              {selectedGoal ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-6 space-y-6">
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

                  {/* Milestones check toggles */}
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
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 hover:scale-[1.01] duration-150 ${
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

                  {/* Strategies panels */}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
