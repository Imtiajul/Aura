/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
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
  Droplet,
  Heart,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Scale,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  ClipboardList,
  Info,
  CalendarDays
} from "lucide-react";
import { MealPlanDay, FoodLog } from "../types";

interface NutritionCoachProps {
  mealPlan: MealPlanDay[];
  foodLogs: FoodLog[];
  onGeneratePlan: (days: number, pref: string, goal: string) => Promise<void>;
  onLogFoodImage: (base64Image: string) => Promise<void>;
  onDeleteFoodLog: (id: string) => Promise<void>;
  onAddManualLog: (item: { itemName: string; calories: number; protein: number; carbs: number; fats: number; timestamp?: string }) => Promise<void>;
  loading: boolean;
}

interface DetectedIngredient {
  name: string;
  estimated_quantity: string;
  confidence: string;
}

interface MealSuggestion {
  meal_name: string;
  description: string;
  difficulty: string;
  prep_time: string;
  cook_time: string;
  servings: string;
  ingredients_used: string[];
  optional_ingredients: string[];
  recipe_steps: string[];
  nutrition: {
    calories_kcal: string;
    protein_g: string;
    carbohydrates_g: string;
    fat_g: string;
    fiber_g: string;
  };
  health_goal_alignment: string;
}

interface AnalyzeIngredientsResponse {
  detected_ingredients: DetectedIngredient[];
  meal_suggestions: MealSuggestion[];
  disclaimer: string;
}

export default function NutritionCoach({ 
  mealPlan, 
  foodLogs, 
  onGeneratePlan, 
  onLogFoodImage, 
  onDeleteFoodLog, 
  onAddManualLog, 
  loading 
}: NutritionCoachProps) {
  const [daysCount, setDaysCount] = useState(7);
  const [dietaryPref, setDietaryPref] = useState("Balanced high-protein");
  const [targetGoal, setTargetGoal] = useState("weight_loss");
  const [selectedDay, setSelectedDay] = useState(1);
  const [imageFile, setImageFile] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"plans" | "scanner" | "nutrition_ai" | "dashboard">("plans");

  // 30-Day Dashboard states
  const [selectedDashboardDate, setSelectedDashboardDate] = useState<Date>(new Date());
  const [manualItemName, setManualItemName] = useState("");
  const [manualCalories, setManualCalories] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualFats, setManualFats] = useState("");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualError, setManualError] = useState("");
  const [manualSuccess, setManualSuccess] = useState("");

  const getLast30Days = () => {
    const days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  };

  // Aura Nutrition AI State variables
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string>("Weight Loss");
  const [analyzingIngredients, setAnalyzingIngredients] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeIngredientsResponse | null>(null);
  const [expandedMealIndex, setExpandedMealIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loggedIndicator, setLoggedIndicator] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<number>(0);

  const loadingStepsByAura = [
    "Aura Vision analyzing raw ingredient structures...",
    "Extracting food classifications and confidence profiles...",
    "Planning calorie-targeted meal vectors matching goals...",
    "Compiling step-by-step cooking procedures...",
    "Evaluating macros, dietary fiber limits, and disclaimers..."
  ];

  useEffect(() => {
    let interval: any;
    if (analyzingIngredients) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingStepsByAura.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [analyzingIngredients]);

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

  // Trigger raw food ingredient analysis
  const handleAnalyzeIngredients = async () => {
    if (!rawImage) return;
    setAnalyzingIngredients(true);
    setExpandedMealIndex(null);
    setAnalysisResult(null);
    try {
      const res = await fetch("/api/nutrition/analyze-ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: rawImage,
          goal: selectedGoal
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      } else {
        alert("Aura Nutrition AI: Standby mode activated for ingredients planner.");
      }
    } catch (err) {
      console.error("Ingredients planning error", err);
    } finally {
      setAnalyzingIngredients(false);
    }
  };

  // Log planned nutrition suggestion directly to daily logs
  const handleLogPlannedMeal = async (meal: MealSuggestion) => {
    try {
      await onAddManualLog({
        itemName: meal.meal_name,
        calories: Number(meal.nutrition?.calories_kcal || 350),
        protein: Number(meal.nutrition?.protein_g || 25),
        carbs: Number(meal.nutrition?.carbohydrates_g || 40),
        fats: Number(meal.nutrition?.fat_g || 12),
      });
      setLoggedIndicator(meal.meal_name);
      setTimeout(() => setLoggedIndicator(null), 3000);
    } catch (err) {
      console.error("Failed to log customized meal option", err);
    }
  };

  const activeDayPlan = mealPlan.find((day) => day.day === selectedDay) || mealPlan[0];

  // Aggregated logged values
  const totalLoggedCalories = foodLogs.reduce((acc, curr) => acc + curr.calories, 0);
  const totalLoggedProtein = foodLogs.reduce((acc, curr) => acc + curr.protein, 0);

  return (
    <div id="nutrition_coach_panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Column 1: Mode Switcher & inputs selection */}
      <div className="space-y-6">
        <div className="flex overflow-x-auto bg-slate-950 p-1.5 rounded-xl border border-slate-900 gap-1 no-scrollbar select-none">
          <button
            onClick={() => setActiveTab("plans")}
            className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === "plans" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Structured Plans
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === "scanner" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Calorie Scanner
          </button>
          <button
            onClick={() => setActiveTab("nutrition_ai")}
            className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === "nutrition_ai" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Aura Nutrition AI
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === "dashboard" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            30-Day Dashboard
          </button>
        </div>

        {activeTab === "plans" && (
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
                    {d} Days
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
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
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
        )}

        {activeTab === "scanner" && (
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
              <span className="text-xs font-bold text-slate-300 font-sans">Choose Cooked Dish Image</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono mt-1">PNG, JPG, HEIC</span>
            </div>

            {loading && (
              <div className="text-center p-3 text-xs text-amber-400 font-semibold animate-pulse flex items-center gap-1.5 justify-center">
                <Sparkles className="w-4 h-4 animate-spin" /> Analyzing meal constituents...
              </div>
            )}
          </div>
        )}

        {activeTab === "nutrition_ai" && (
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/20 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Aura Nutrition AI
            </h4>
            
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              Upload or drop a picture of raw ingredients (veggies, grains, proteins) to generate 3-5 custom healthy meal suggestions tailored to your goals.
            </p>

            {/* Health goal selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Health Goal Adaptability</label>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="Weight Loss">Weight Loss</option>
                <option value="Weight Gain">Weight Gain</option>
                <option value="Muscle Building">Muscle Building</option>
                <option value="Balanced Diet">Balanced Diet</option>
                <option value="Diabetic-Friendly">Diabetic-Friendly</option>
                <option value="Heart-Healthy">Heart-Healthy</option>
                <option value="High Protein">High Protein</option>
              </select>
            </div>

            {/* Drag & Drop uploader area */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-5 transition-colors flex flex-col items-center justify-center text-center cursor-pointer ${
                isDragging ? "border-emerald-500 bg-emerald-900/10" : "border-slate-800 hover:border-slate-700 bg-slate-950"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setRawImage(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setRawImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={analyzingIngredients}
              />
              
              {rawImage ? (
                <div className="space-y-2 w-full relative z-10">
                  <img 
                    src={rawImage} 
                    alt="Raw ingredients selection" 
                    className="w-full h-32 object-cover rounded-lg border border-slate-800" 
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRawImage(null);
                    }}
                    className="text-[10px] text-rose-400 font-bold hover:underline"
                  >
                    Remove Selection
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-7 h-7 text-slate-600 mb-1.5" />
                  <span className="text-xs font-bold text-slate-300">Manual Snap or Drag Ingredients Here</span>
                  <span className="text-[8px] text-slate-500 font-mono mt-1 font-bold">DRAG & DROP SUPPORTED</span>
                </>
              )}
            </div>

            {rawImage && (
              <button
                type="button"
                onClick={handleAnalyzeIngredients}
                disabled={analyzingIngredients}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold hover:shadow-lg hover:shadow-emerald-500/10 transition-all font-sans text-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {analyzingIngredients ? "Aura processing ingredients..." : "Formulate Goals and Recipes"}
              </button>
            )}

            {analyzingIngredients && (
              <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20 text-center animate-pulse text-amber-400 text-[10px] font-bold font-mono">
                <RefreshCw className="w-4 h-4 animate-spin text-center mx-auto mb-1" />
                {loadingStepsByAura[loadingStep]}
              </div>
            )}
          </div>
        )}

        {activeTab === "dashboard" && (
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              setManualError("");
              setManualSuccess("");
              if (!manualCalories) {
                setManualError("Please enter a valid calorie amount.");
                return;
              }
              const calNum = Number(manualCalories);
              if (isNaN(calNum) || calNum <= 0) {
                setManualError("Calorie count must be a positive number.");
                return;
              }
              setIsSubmittingManual(true);
              try {
                // Preserving current hour/minute on selected date to make it robust
                const dateToLog = new Date(selectedDashboardDate);
                const now = new Date();
                dateToLog.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

                await onAddManualLog({
                  itemName: manualItemName.trim() || "Manual Calorie Log",
                  calories: calNum,
                  protein: Number(manualProtein) || 0,
                  carbs: Number(manualCarbs) || 0,
                  fats: Number(manualFats) || 0,
                  timestamp: dateToLog.toISOString(),
                });
                
                setManualCalories("");
                setManualItemName("");
                setManualProtein("");
                setManualCarbs("");
                setManualFats("");
                setManualSuccess("Calorie entry logged successfully!");
                setTimeout(() => setManualSuccess(""), 3000);
              } catch (err) {
                setManualError("Failed to save calorie log.");
              } finally {
                setIsSubmittingManual(false);
              }
            }}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/20 space-y-4"
          >
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-400" /> Manual Calorie Entry
            </h4>
            <span className="text-[10px] text-slate-400 font-mono block">
              Logging for: <span className="text-amber-400 font-bold">{selectedDashboardDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </span>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Calorie Intake (kcal) *</label>
              <input
                type="number"
                required
                value={manualCalories}
                onChange={(e) => setManualCalories(e.target.value)}
                placeholder="e.g. 450"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Meal / Item Name</label>
              <input
                type="text"
                value={manualItemName}
                onChange={(e) => setManualItemName(e.target.value)}
                placeholder="e.g. Avocado Toast or Protein Shake"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={manualProtein}
                  onChange={(e) => setManualProtein(e.target.value)}
                  placeholder="0"
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500 text-center font-mono"
                />
              </div>
              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={manualCarbs}
                  onChange={(e) => setManualCarbs(e.target.value)}
                  placeholder="0"
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500 text-center font-mono"
                />
              </div>
              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">Fats (g)</label>
                <input
                  type="number"
                  value={manualFats}
                  onChange={(e) => setManualFats(e.target.value)}
                  placeholder="0"
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500 text-center font-mono"
                />
              </div>
            </div>

            {manualError && (
              <div className="text-[10px] text-rose-400 font-semibold p-2 bg-rose-500/5 rounded border border-rose-500/10 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 animate-pulse" /> {manualError}
              </div>
            )}
            {manualSuccess && (
              <div className="text-[10px] text-emerald-400 font-semibold p-2 bg-emerald-500/5 rounded border border-emerald-500/10 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> {manualSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingManual}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold hover:shadow-lg hover:shadow-emerald-500/10 transition-all text-xs flex items-center justify-center gap-1.5 font-sans cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {isSubmittingManual ? "Saving Entry..." : "Record Calorie Entry"}
            </button>
          </form>
        )}

        {/* Selected food logs history list */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>
              {activeTab === "dashboard" 
                ? `Logged: ${selectedDashboardDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` 
                : "Logged Today"}
            </span>
            <span className="text-emerald-400 font-mono font-bold">
              {activeTab === "dashboard" 
                ? `${foodLogs.filter(l => new Date(l.timestamp).toDateString() === selectedDashboardDate.toDateString()).reduce((sum, l) => sum + l.calories, 0)} kcal`
                : `${totalLoggedCalories} kcal / ${totalLoggedProtein}g Protein`
              }
            </span>
          </div>

          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            {(activeTab === "dashboard" 
              ? foodLogs.filter(l => new Date(l.timestamp).toDateString() === selectedDashboardDate.toDateString())
              : foodLogs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString())
            ).map((log) => (
              <div key={log.id} className="p-3 rounded-xl border border-slate-900 bg-slate-950/30 flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-xs text-slate-200 truncate">{log.itemName}</h5>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 font-mono text-[9px] text-slate-500">
                    <span className="text-amber-400 font-bold">{log.calories} kcal</span>
                    <span>•</span>
                    <span className="text-emerald-400">{log.protein}g P</span>
                    <span>•</span>
                    <span className="text-blue-400">{log.carbs}g C</span>
                    {activeTab === "dashboard" && (
                      <>
                        <span>•</span>
                        <span className="text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteFoodLog(log.id)}
                  className="p-1 text-slate-700 hover:text-rose-450 transition-colors shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {(activeTab === "dashboard" 
              ? foodLogs.filter(l => new Date(l.timestamp).toDateString() === selectedDashboardDate.toDateString())
              : foodLogs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString())
            ).length === 0 && (
              <span className="text-xs text-slate-600 block italic text-center py-4 bg-slate-950/20 rounded-xl border border-dashed border-slate-900">
                {activeTab === "dashboard" 
                  ? "No manual or scanned food entries logged for this date." 
                  : "Log meals or analyze ingredients to record nutritional baseline."
                }
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Column 2 & 3: Meal Suggestions or Daily Calendar schedules block */}
      <div className="lg:col-span-2 space-y-6">
        {activeTab === "plans" || activeTab === "scanner" ? (
          activeDayPlan ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400 font-bold font-mono">
                    D{activeDayPlan.day}
                  </div>
                  <div>
                    <h3 className="font-sans text-lg font-bold text-white flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4 text-amber-400" /> Daily Meal Schedule
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">Macro Calibration Model</p>
                  </div>
                </div>

                {/* Day selection scroll horizontal bar */}
                <div className="flex items-center gap-1 overflow-x-auto max-w-[240px] py-1 max-h-[80px]">
                  {mealPlan.map((d) => (
                    <button
                      key={d.day}
                      onClick={() => setSelectedDay(d.day)}
                      type="button"
                      className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
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

              {/* Action and button to instantly log the daily meal plan target calories */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/40 border border-slate-900/60 font-sans">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">AI Nutrition Matrix Actions</span>
                  <p className="text-xs font-semibold text-slate-300">Quickly record completed targets from your planned nutritional blueprint.</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await onAddManualLog({
                      itemName: `Day ${activeDayPlan.day} Planned Micro/Macro Intake`,
                      calories: activeDayPlan.targets.calories,
                      protein: activeDayPlan.targets.protein,
                      carbs: activeDayPlan.targets.carbs,
                      fats: activeDayPlan.targets.fats,
                    });
                    alert(`Day ${activeDayPlan.day} targets logged successfully! (${activeDayPlan.targets.calories} kcal, ${activeDayPlan.targets.protein}g Protein, ${activeDayPlan.targets.carbs}g Carbs, ${activeDayPlan.targets.fats}g Fats added to your index).`);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/10 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all self-stretch sm:self-auto shrink-0 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Log Calorie Intake
                </button>
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
                    <span className="text-[9px] font-bold uppercase text-slate-500 block">{t.title}</span>
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
          )
        ) : activeTab === "dashboard" ? (
          /* Active tab is 30-day calorie dashboard */
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                <div>
                  <h3 className="font-sans text-lg font-bold text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> 30-Day Calorie Analytics
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">Historical consumption & calorie logging portal</p>
                </div>
                
                {/* Information badge */}
                <div className="text-[10px] px-3 py-1 bg-slate-950 border border-slate-900 rounded-lg text-slate-400 font-mono font-medium">
                  Active Baseline Target: <span className="text-emerald-400 font-bold">2,000 kcal / day</span>
                </div>
              </div>

              {/* Stat dashboard grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(() => {
                  const daysList = getLast30Days();
                  const loggedDays = daysList.map(d => ({
                    date: d,
                    cals: foodLogs
                      .filter(l => new Date(l.timestamp).toDateString() === d.toDateString())
                      .reduce((sum, l) => sum + l.calories, 0)
                  }));
                  
                  const activeLoggedDays = loggedDays.filter(d => d.cals > 0);
                  const total35000 = loggedDays.reduce((sum, d) => sum + d.cals, 0);
                  const averageCals = activeLoggedDays.length > 0 ? Math.round(total35000 / activeLoggedDays.length) : 0;
                  const highestDay = Math.max(...loggedDays.map(d => d.cals), 0);
                  
                  // Goal compliance
                  const compliantDays = loggedDays.filter(d => d.cals >= 1400 && d.cals <= 2450).length;
                  const complianceRate = loggedDays.filter(d => d.cals > 0).length > 0 
                    ? Math.round((compliantDays / loggedDays.filter(d => d.cals > 0).length) * 100) 
                    : 0;

                  return (
                    <>
                      <div className="p-3 rounded-xl border border-blue-500/10 bg-slate-950/40 text-center space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">30-Day Intake</span>
                        <span className="text-base sm:text-lg font-mono font-bold block text-blue-400">{total35000.toLocaleString()} kcal</span>
                      </div>
                      <div className="p-3 rounded-xl border border-emerald-500/10 bg-slate-950/40 text-center space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Daily Average</span>
                        <span className="text-base sm:text-lg font-mono font-bold block text-emerald-400">{averageCals.toLocaleString()} kcal</span>
                      </div>
                      <div className="p-3 rounded-xl border border-amber-500/10 bg-slate-950/40 text-center space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Highest Single Day</span>
                        <span className="text-base sm:text-lg font-mono font-bold block text-amber-400">{highestDay.toLocaleString()} kcal</span>
                      </div>
                      <div className="p-3 rounded-xl border border-purple-500/10 bg-slate-950/40 text-center space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Compliance Rate</span>
                        <span className="text-base sm:text-lg font-mono font-bold block text-purple-400">{complianceRate}%</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* 30-Day Bar Chart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
                  <span>30-Day Calorie Progress Chart</span>
                  <span className="text-[10px] text-slate-500 font-normal normal-case">Click on any day bar to log or inspect calories</span>
                </div>
                
                <div className="h-44 w-full bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex items-end justify-between gap-1 sm:gap-2">
                  {getLast30Days().map((d, index) => {
                    const dailyCal = foodLogs
                      .filter(l => new Date(l.timestamp).toDateString() === d.toDateString())
                      .reduce((sum, l) => sum + l.calories, 0);

                    const targetMax = 2500; // Benchmark for tallest bar
                    const percentHeight = Math.min(Math.round((dailyCal / targetMax) * 100), 100);
                    const isSelected = d.toDateString() === selectedDashboardDate.toDateString();

                    return (
                      <div 
                        key={index} 
                        onClick={() => setSelectedDashboardDate(d)}
                        className="group flex-1 h-full flex flex-col justify-end items-center cursor-pointer"
                      >
                        {/* Tooltip */}
                        <div className="absolute mb-32 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-800 text-white rounded p-1.5 text-[10px] font-mono z-50 pointer-events-none scale-95 origin-bottom">
                          <span className="block font-bold text-slate-200">{d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          <span className="text-amber-400">{dailyCal.toLocaleString()} kcal</span>
                        </div>

                        {/* Bar */}
                        <div className="w-full flex justify-center items-end h-[90%] relative">
                          <div 
                            style={{ height: `${Math.max(percentHeight, dailyCal > 0 ? 5 : 2)}%` }}
                            className={`w-full max-w-[12px] rounded-t transition-all ${
                              isSelected 
                                ? "bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-md shadow-emerald-500/20" 
                                : dailyCal > 2000
                                ? "bg-gradient-to-t from-amber-500 to-amber-400 group-hover:from-amber-400 group-hover:to-amber-300"
                                : dailyCal > 0
                                ? "bg-gradient-to-t from-blue-500 to-blue-400 group-hover:from-blue-400 group-hover:to-blue-300"
                                : "bg-slate-850 group-hover:bg-slate-800"
                            }`}
                          />
                        </div>

                        {/* Day initial indicator */}
                        <span className={`text-[8px] font-mono mt-1 font-bold ${
                          isSelected ? "text-emerald-400" : "text-slate-600 group-hover:text-slate-400"
                        }`}>
                          {d.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dashboard Navigation Help Map */}
              <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-200">Interactive Calendar Navigation</h4>
                  <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed font-semibold font-sans">
                    Each bar represents a day index of your historical calorie consumption. Click on any of the 30 vertical bars above to load that specific date context, inspect meal logs, or manually log new nutrient portions for that day!
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active tab is Aura Nutrition AI raw ingredients planner */
          <div className="space-y-6">
            {!analysisResult ? (
              <div className="border border-slate-800 bg-slate-900/10 rounded-xl p-8 text-center space-y-6">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Aura Nutrition AI Co-Pilot</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                    Plan custom culinary creations using ONLY the raw food ingredients available in your pantry. Fully optimized to support your health journey!
                  </p>
                </div>

                {/* Structured user step guidelines matching instruction mapping */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-xl mx-auto text-left">
                  {[
                    { title: "1. Photograph Items", desc: "Choose or drag-and-drop a clear image of raw ingredients (spiced portions, grains, leafy plants, or roots).", icon: Camera, color: "text-amber-400" },
                    { title: "2. Focus Health Goal", desc: `Specify goals like "${selectedGoal}" or Diabetic/Heart safe protocols. Aura calibrates the entire suggestions grid.`, icon: Heart, color: "text-rose-400" },
                    { title: "3. Formulate Meals", desc: "Receive 3-5 macro-customized recipes, confidence indexes, missing food safety flags, and instant logged options.", icon: UtensilsCrossed, color: "text-emerald-400" }
                  ].map((step, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-slate-950 border border-slate-900 space-y-1.5 flex flex-col items-start">
                      <step.icon className={`w-5 h-5 ${step.color}`} />
                      <h4 className="text-[11px] font-bold text-slate-200">{step.title}</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Scanned ingredient analysis outputs display */
              <div className="space-y-6">
                {/* 1. Detected raw ingredient extraction and confidence cards array */}
                <div className="border border-slate-800 bg-slate-900/10 rounded-xl p-5 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <ClipboardList className="w-4 h-4 text-emerald-400" /> Aura Ingredient Vision Diagnostics
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                      Detected: {analysisResult.detected_ingredients?.length || 0} items
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {analysisResult.detected_ingredients?.map((ing, idx) => {
                      const isUncertain = ing.confidence?.toLowerCase().includes("uncertain");
                      return (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-xl border bg-slate-950/40 relative space-y-1 transition-colors hover:bg-slate-950/60 ${
                            isUncertain ? "border-amber-500/20 hover:border-amber-500/40" : "border-slate-850 hover:border-slate-800"
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-200 block">{ing.name}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">Qty: {ing.estimated_quantity || "unknown"}</span>
                          
                          {/* Confidence badge layout */}
                          <div className="pt-1 flex items-center justify-between">
                            <span className="text-[9px] text-slate-500 uppercase tracking-wide font-mono font-bold">Category</span>
                            <span 
                              className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase max-w-fit ${
                                isUncertain 
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}
                            >
                              {ing.confidence || "High"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {analysisResult.detected_ingredients?.some(i => i.confidence?.toLowerCase().includes("uncertain")) && (
                    <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-amber-500/5 text-amber-400 text-[10px] font-semibold">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>Note: Aura detected certain ingredients with lower certainty. Please inspect physical food packets before eating.</span>
                    </div>
                  )}
                </div>

                {/* 2. Structured meal suggestions with directions accordion list */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <UtensilsCrossed className="w-4 h-4 text-emerald-400" /> Aligned Culinary Proposals
                  </h3>

                  <div className="space-y-3">
                    {analysisResult.meal_suggestions?.map((meal, idx) => {
                      const isExpanded = expandedMealIndex === idx;
                      const isLogged = loggedIndicator === meal.meal_name;

                      return (
                        <div 
                          key={idx} 
                          className="border border-slate-800 bg-slate-900/10 rounded-xl transition-all overflow-hidden"
                        >
                          {/* Main header block */}
                          <div 
                            onClick={() => setExpandedMealIndex(isExpanded ? null : idx)}
                            className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/20 transition-all font-sans"
                          >
                            <div className="space-y-1.5 flex-1 select-none">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-bold text-white">{meal.meal_name}</h4>
                                <span className={`text-[9px] px-2 py-0.5 font-bold uppercase rounded-full border ${
                                  meal.difficulty?.toLowerCase().includes("easy") 
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : meal.difficulty?.toLowerCase().includes("medium")
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                }`}>
                                  {meal.difficulty || "Easy"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed font-semibold">{meal.description}</p>
                            </div>

                            {/* Chevron and trigger controls */}
                            <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                {meal.nutrition?.calories_kcal || 350} kcal
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                          </div>

                          {/* Expansion contents accordion */}
                          {isExpanded && (
                            <div className="px-5 pb-5 pt-1.5 border-t border-slate-800/60 bg-slate-950/20 space-y-4 font-sans text-xs">
                              {/* Metadata chips indicators */}
                              <div className="grid grid-cols-3 gap-3">
                                <div className="p-2 border border-slate-850/60 bg-slate-950/60 rounded-xl text-center">
                                  <span className="text-[9px] text-slate-500 font-bold uppercase block mb-0.5">Prep Duration</span>
                                  <span className="text-xs text-slate-200 font-bold font-mono">{meal.prep_time || "10 mins"}</span>
                                </div>
                                <div className="p-2 border border-slate-850/60 bg-slate-950/60 rounded-xl text-center">
                                  <span className="text-[9px] text-slate-500 font-bold uppercase block mb-0.5">Cooking Duration</span>
                                  <span className="text-xs text-slate-200 font-bold font-mono">{meal.cook_time || "15 mins"}</span>
                                </div>
                                <div className="p-2 border border-slate-850/60 bg-slate-950/60 rounded-xl text-center">
                                  <span className="text-[9px] text-slate-500 font-bold uppercase block mb-0.5">Servings</span>
                                  <span className="text-xs text-slate-200 font-bold font-mono">{meal.servings || "1 serving"}</span>
                                </div>
                              </div>

                              {/* Health Goal Alignment Badge and alignment details */}
                              {meal.health_goal_alignment && (
                                <div className="p-3.5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 leading-relaxed text-slate-300 space-y-1 flex items-start gap-2.5">
                                  <Heart className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold text-emerald-400 text-[10px] uppercase tracking-wider block mb-0.5">
                                      Goal Optimized for {selectedGoal}
                                    </span>
                                    <p className="text-xs font-semibold leading-relaxed text-slate-300">
                                      {meal.health_goal_alignment}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Ingredient segregation panel */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block">
                                    🍳 Ingredients from Vision
                                  </span>
                                  <ul className="space-y-1 text-slate-400 font-semibold text-xs">
                                    {meal.ingredients_used?.map((ing, iIdx) => (
                                      <li key={iIdx} className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        <span>{ing}</span>
                                      </li>
                                    ))}
                                    {(!meal.ingredients_used || meal.ingredients_used.length === 0) && (
                                      <span className="text-[10px] block text-slate-600 italic">No direct raw matches mapped.</span>
                                    )}
                                  </ul>
                                </div>

                                <div className="space-y-1.5">
                                  <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold block">
                                    🛒 Recommended Optional Elements
                                  </span>
                                  <ul className="space-y-1 text-slate-400 font-semibold text-xs">
                                    {meal.optional_ingredients?.map((ing, iIdx) => (
                                      <li key={iIdx} className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                        <span>{ing}</span>
                                      </li>
                                    ))}
                                    {(!meal.optional_ingredients || meal.optional_ingredients.length === 0) && (
                                      <span className="text-[10px] block text-slate-650 italic">None required. Perfect pantry fit.</span>
                                    )}
                                  </ul>
                                </div>
                              </div>

                              {/* Recipe Step-by-Step Instructions */}
                              {meal.recipe_steps && meal.recipe_steps.length > 0 && (
                                <div className="space-y-2">
                                  <span className="text-[10px] text-slate-300 uppercase tracking-wider font-bold block">
                                    📋 Culinary Directions
                                  </span>
                                  <div className="space-y-2 text-slate-300 font-semibold leading-relaxed">
                                    {meal.recipe_steps.map((step, sIdx) => (
                                      <div key={sIdx} className="pl-2 border-l-2 border-slate-800 hover:border-emerald-500/50 transition-colors py-0.5">
                                        {step}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Target Macros Breakdown Dashboard */}
                              <div className="pt-2 border-t border-slate-850">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-2">
                                  Nutritional Estimates
                                </span>
                                <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                                  {[
                                    { name: "Calories", val: `${meal.nutrition?.calories_kcal || "—"}`, label: "kcal", color: "text-amber-400" },
                                    { name: "Protein", val: `${meal.nutrition?.protein_g || "—"}`, label: "g", color: "text-rose-450" },
                                    { name: "Carbs", val: `${meal.nutrition?.carbohydrates_g || "—"}`, label: "g", color: "text-blue-450" },
                                    { name: "Fats", val: `${meal.nutrition?.fat_g || "—"}`, label: "g", color: "text-purple-450" },
                                    { name: "Fiber", val: `${meal.nutrition?.fiber_g || "—"}`, label: "g", color: "text-teal-450" },
                                  ].map((m, mIdx) => (
                                    <div key={mIdx} className="p-2 border border-slate-900/50 bg-slate-950/40 rounded-lg">
                                      <span className="text-slate-500 block mb-0.5 font-bold">{m.name}</span>
                                      <span className={`font-mono text-xs font-bold block ${m.color}`}>
                                        {m.val} <span className="text-[8px] font-sans font-normal">{m.label}</span>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Interactive Logging Button with state reaction feedback */}
                              <div className="pt-3 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleLogPlannedMeal(meal)}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 ${
                                    isLogged 
                                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default" 
                                      : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 hover:shadow-md"
                                  }`}
                                >
                                  {isLogged ? (
                                    <>
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      Saved to Baseline Profile
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3.5 h-3.5" />
                                      Log This Meal to Intake
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Safety Notice and disclaimer boxes */}
                <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/40 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-500/80 font-bold font-mono tracking-widest uppercase">
                    <Info className="w-3.5 h-3.5" /> Critical Safety Advisory
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Aura suggests meal recommendations strictly based on raw photo interpretations. {analysisResult.disclaimer || "Values are approximate estimates."}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    Always consult with a healthcare professional or clinical nutritionist for chronic conditions, strict allergen restrictions, or severe health diets. Aura AI estimates do not substitute clinical consultations.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
