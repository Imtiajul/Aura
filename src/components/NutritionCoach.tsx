/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Apple, 
  Sparkles, 
  Camera, 
  ChevronRight, 
  Trash2, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Compass,
  FileText,
  UtensilsCrossed,
  Droplet
} from "lucide-react";
import { MealPlanDay, FoodLog } from "../types";

interface NutritionCoachProps {
  mealPlan: MealPlanDay[];
  foodLogs: FoodLog[];
  onGeneratePlan: (days: number, pref: string, goal: string) => Promise<void>;
  onLogFoodImage: (base64Image: string) => Promise<void>;
  onDeleteFoodLog: (id: string) => Promise<void>;
  loading: boolean;
}

export default function NutritionCoach({ mealPlan, foodLogs, onGeneratePlan, onLogFoodImage, onDeleteFoodLog, loading }: NutritionCoachProps) {
  const [daysCount, setDaysCount] = useState(7);
  const [dietaryPref, setDietaryPref] = useState("Balanced high-protein");
  const [targetGoal, setTargetGoal] = useState("weight_loss");
  const [selectedDay, setSelectedDay] = useState(1);
  const [imageFile, setImageFile] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"plans" | "scanner">("plans");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGeneratePlan(daysCount, dietaryPref, targetGoal);
    setSelectedDay(1);
  };

  const handleImageUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setImageFile(base64String);
        await onLogFoodImage(base64String);
        alert("Aura scanned food photo via Gemini! Calorie/Macro estimations updated in database.");
        setImageFile(null); // Clear after upload
      };
      reader.readAsDataURL(file);
    }
  };

  const activeDayPlan = mealPlan.find((day) => day.day === selectedDay) || mealPlan[0];

  // Aggregated logged values
  const totalLoggedCalories = foodLogs.reduce((acc, curr) => acc + curr.calories, 0);
  const totalLoggedProtein = foodLogs.reduce((acc, curr) => acc + curr.protein, 0);

  return (
    <div id="nutrition_coach_panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Column 1: Plan Generation & Scanned food log */}
      <div className="space-y-6">
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-900 gap-1">
          <button
            onClick={() => setActiveTab("plans")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "plans" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Structured Plans
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "scanner" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Aura Vision Scanner
          </button>
        </div>

        {activeTab === "plans" ? (
          <form onSubmit={handleGenerate} className="p-5 rounded-xl border border-slate-800 bg-slate-900/20 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" /> AI Calorie Generator
            </h4>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Duration Targets</label>
              <div className="grid grid-cols-3 gap-2">
                {[7, 15, 30].map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setDaysCount(d)}
                    className={`py-2 text-xs font-bold rounded-lg border ${
                      daysCount === d 
                        ? "bg-emerald-400 border-emerald-400 text-slate-950" 
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    } transition-colors`}
                  >
                    {d} Days Plan
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Dietary Orientation & Allergies</label>
              <input
                type="text"
                value={dietaryPref}
                onChange={(e) => setDietaryPref(e.target.value)}
                placeholder="e.g. Vegan, Keto, Lactose-free, low-budget"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Objective Profile</label>
              <select
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="weight_loss">Lose 1kg - 5kg Deficit Matrix</option>
                <option value="gain_weight">Bulk Muscle High Protein TDEE</option>
                <option value="maintain">Hold Core Weight and Energy Balanced</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold hover:shadow-lg hover:shadow-emerald-500/10 transition-all text-xs flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {loading ? "Aura is adjusting macros..." : "Assemble AI Nutrition Matrix"}
            </button>
          </form>
        ) : (
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/20 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-amber-400" /> Food Image Recognition Scan
            </h4>
            
            <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed font-semibold">
              Take or upload a picture of your dish to calculate calories, macronutrients, and hydration levels with Gemini.
            </p>

            <div className="relative border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 rounded-xl p-6 transition-colors flex flex-col items-center justify-center text-center cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUploadChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={loading}
              />
              <UtensilsCrossed className="w-8 h-8 text-slate-600 mb-2" />
              <span className="text-xs font-bold text-slate-300">Choose Image or Snap Photo</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono mt-1">PNG, JPG, HEIC</span>
            </div>

            {loading && (
              <div className="text-center p-3 text-xs text-amber-400 font-semibold animate-pulse flex items-center gap-1.5 justify-center">
                <Sparkles className="w-4 h-4 animate-spin" /> Analyzing meal constituents...
              </div>
            )}
          </div>
        )}

        {/* Selected food logs history list */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Log Targets logged today</span>
            <span className="text-emerald-400 font-mono font-bold">{totalLoggedCalories} kcal / {totalLoggedProtein}g Protein</span>
          </div>

          <div className="space-y-2 max-h-[160px] overflow-y-auto">
            {foodLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/30 flex items-center justify-between gap-2.5">
                <div>
                  <h5 className="font-bold text-xs text-slate-200 line-clamp-1">{log.itemName}</h5>
                  <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] text-slate-550">
                    <span className="text-amber-400">{log.calories} kcal</span>
                    <span>•</span>
                    <span className="text-emerald-400">{log.protein}g P</span>
                    <span>•</span>
                    <span className="text-blue-400">{log.carbs}g C</span>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteFoodLog(log.id)}
                  className="p-1 text-slate-700 hover:text-rose-400 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {foodLogs.length === 0 && (
              <span className="text-xs text-slate-600 block italic text-center py-4 bg-slate-950/20 rounded-xl border border-dashed border-slate-900">
                Log food logs or scan meal images to build your caloric baseline.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Column 2 & 3: Calendar Plan Matrix display */}
      <div className="lg:col-span-2 space-y-6">
        {activeDayPlan ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400 font-bold font-mono">
                  D{activeDayPlan.day}
                </div>
                <div>
                  <h3 className="font-sans text-lg font-bold text-white">Daily Meal Schedule</h3>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">Macro Calibration Model</p>
                </div>
              </div>

              {/* Day selection scroll horizontal bar */}
              <div className="flex items-center gap-1 overflow-x-auto max-w-[240px] py-1">
                {mealPlan.map((d) => (
                  <button
                    key={d.day}
                    onClick={() => setSelectedDay(d.day)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                      selectedDay === d.day
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-950 text-slate-400 border border-slate-900 hover:border-slate-800"
                    }`}
                  >
                    {d.day}
                  </button>
                ))}
              </div>
            </div>

            {/* Target values row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              {[
                { title: "Target Calories", val: `${activeDayPlan.targets.calories} kcal`, color: "border-amber-500/10 text-amber-400" },
                { title: "Daily Protein", val: `${activeDayPlan.targets.protein}g`, color: "border-rose-500/10 text-rose-400" },
                { title: "Fat Limit", val: `${activeDayPlan.targets.fats}g`, color: "border-purple-500/10 text-purple-400" },
                { title: "Carbohydrates", val: `${activeDayPlan.targets.carbs}g`, color: "border-blue-500/10 text-blue-400" },
                { title: "Water Quotient", val: `${activeDayPlan.targets.water}L`, color: "border-teal-500/10 text-teal-400" },
              ].map((t, i) => (
                <div key={i} className={`p-3 rounded-xl border bg-slate-950/40 text-center space-y-1 ${t.color}`}>
                  <span className="text-[9px] font-bold uppercase text-slate-550 block">{t.title}</span>
                  <span className="text-xs sm:text-sm font-mono font-bold block">{t.val}</span>
                </div>
              ))}
            </div>

            {/* Meals items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
              {[
                { name: "Breakfast Plan", desc: activeDayPlan.meals.breakfast, icon: UtensilsCrossed, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                { name: "Core Lunch Nutrition", desc: activeDayPlan.meals.lunch, icon: UtensilsCrossed, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
                { name: "Metabolic Dinner", desc: activeDayPlan.meals.dinner, icon: UtensilsCrossed, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
                { name: "Satiety Snacks Strategy", desc: activeDayPlan.meals.snacks, icon: Apple, color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
              ].map((meal, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-850 bg-slate-950/30 flex items-start gap-3 flex-col sm:flex-row">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${meal.color}`}>
                    <meal.icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200">{meal.name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                      {meal.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[280px] rounded-xl border border-dashed border-slate-800 bg-slate-950/20 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <AlertCircle className="w-8 h-8 text-slate-600 mb-2" />
            <span className="text-xs font-semibold uppercase tracking-wider mb-1">No plan generated</span>
            <p className="text-[10px] max-w-xs text-slate-500 font-medium font-mono">Run the AI Calorie Gen above to draft high compliance meal protocols.</p>
          </div>
        )}
      </div>
    </div>
  );
}
