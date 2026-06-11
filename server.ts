/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Express
const app = express();
app.use(express.json({ limit: "15mb" }));
const PORT = 3000;

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const geminiKey = process.env.GEMINI_API_KEY;

if (geminiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Aura AI: Gemini SDK successfully initialized on the server.");
  } catch (err) {
    console.error("Aura AI: Failed to initialize Gemini SDK:", err);
  }
} else {
  console.log("Aura AI: GEMINI_API_KEY environment variable not detected. Running in premium adaptive rule-based backup mode.");
}

// Durable Database Setup (db.json)
const DB_FILE = path.join(process.cwd(), "db.json");

// Define a comprehensive initial state mimicking requested DATABASE TABLES
const createInitialDb = () => {
  return {
    users: [
      {
        id: "main_user",
        name: "Alex Performance",
        age: 29,
        gender: "Male",
        height: 180,
        weight: 84,
        goalWeight: 78,
        activityLevel: "moderate",
        dietaryPreferences: "Balanced, high-protein",
        allergies: "None",
        medicalConditions: "Slight lower back tension",
        sleepHours: 7,
        dailyRoutine: "Gym mornings, desk work afternoons, reading evenings",
        workSchedule: "9 AM - 6 PM (Remote tech role)",
        fitnessExperience: "intermediate",
        xp: 1250,
        level: 3,
        badges: ["Early Bird", "Deep Worker", "Hydration Hero", "Iron Discipline"],
        streakDays: 8,
        consistencyShields: 2,
      },
    ],
    health_profiles: [
      {
        userId: "main_user",
        healthScore: 84,
        riskFactors: ["Mild screen eye strain", "Sedentary block afternoon fatigue"],
        recommendations: [
          "Perform 5-minute micro-stretches every 90 minutes of desk work.",
          "Keep water flask visible to reach target consumption.",
          "Target protein count 140g - 160g to protect lean mass.",
        ],
      },
    ],
    goals: [
      {
        id: "goal_1",
        title: "Launch Aura Core Software",
        category: "business",
        targetDate: "2026-08-31",
        completed: false,
        milestones: [
          { id: "ms_1", title: "Complete API Architecture", description: "Design express routers and file data-store contracts", status: "completed", weekNumber: 1 },
          { id: "ms_2", title: "Develop Premium Dashboard", description: "Implement responsive metrics, life metrics charts, and quick-add actions", status: "pending", weekNumber: 2 },
          { id: "ms_3", title: "Integrate Gemini AI Briefing & Reflection Engine", description: "Build automated morning briefing and evening accountability panels", status: "pending", weekNumber: 3 },
          { id: "ms_4", title: "Pilot Beta Deployment", description: "Release to early business team advocates for stress evaluation", status: "pending", weekNumber: 4 },
        ],
        weeklyPlans: [
          "Week 1: Core routes structure & basic data-sync layout.",
          "Week 2: Advanced widgets, Pomodoro visual state, and streak charts.",
          "Week 3: LLM prompt architectures, memory optimization, and meal loaders.",
          "Week 4: Polishing transitions, red-team UI audits, and compliance locks.",
        ],
        dailyActions: [
          "Devote 120 minutes of undisturbed focus session.",
          "Perform review on team logs and respond to coaching suggestions.",
          "Log tasks before noon and document reflection summaries.",
        ],
        createdAt: "2026-06-01T08:00:00Z",
      },
      {
        id: "goal_2",
        title: "Achieve Athletic 78kg & Under 14% Body Fat",
        category: "fitness",
        targetDate: "2026-09-15",
        completed: false,
        milestones: [
          { id: "ms_5", title: "Consistent Gym Routine Set", description: "Perform resistance routines 4x weekly without exception", status: "completed", weekNumber: 1 },
          { id: "ms_6", title: "Log Nutrition Accurately", description: "Register meal components and check macro counts every single day", status: "pending", weekNumber: 2 },
          { id: "ms_7", title: "Consistent Sleep Window Established", description: "Target screen shutoff at 10 PM and rise consistently at 6 AM", status: "pending", weekNumber: 3 },
        ],
        weeklyPlans: [
          "Week 1: Focus on form adjustments and proper hydration ratios.",
          "Week 2: Caloric restriction adjustments & structural cardio progressions.",
        ],
        dailyActions: [
          "Complete morning fasted brisk walk.",
          "Maintain daily deficit targets and register water intake.",
        ],
        createdAt: "2026-06-02T06:00:00Z",
      },
    ],
    tasks: [
      { id: "task_1", title: "Complete 15-minute dynamic physical stretch", completed: true, priority: "high", dueDate: "2026-06-10", autoGenerated: false },
      { id: "task_2", title: "Initiate Aura morning system brief", completed: true, priority: "medium", dueDate: "2026-06-10", autoGenerated: true },
      { id: "task_3", title: "Lock in 90-minute focus session for marketing design", completed: false, priority: "high", dueDate: "2026-06-10", autoGenerated: false },
      { id: "task_4", title: "Prepare evening nutrition evaluation log", completed: false, priority: "low", dueDate: "2026-06-10", autoGenerated: true },
    ],
    habit_logs: [
      { id: "h_1", type: "water", value: 4, timestamp: "2026-06-10T11:00:00Z" },
      { id: "h_2", type: "exercise", value: 45, timestamp: "2026-06-10T07:30:00Z" },
      { id: "h_3", type: "reading", value: 20, timestamp: "2026-06-09T21:30:00Z" },
      { id: "h_4", type: "meditation", value: 10, timestamp: "2026-06-10T06:15:00Z" },
    ],
    focus_sessions: [
      { id: "f_1", durationMinutes: 25, timestamp: "2026-06-09T10:15:00Z", mode: "work" },
      { id: "f_2", durationMinutes: 25, timestamp: "2026-06-09T10:45:00Z", mode: "work" },
      { id: "f_3", durationMinutes: 50, timestamp: "2026-06-10T09:00:00Z", mode: "work" },
    ],
    user_memories: {
      profile: "Prefers concise technical instruction. Struggles to maintain water targets while deeply focused. Enjoys resistance weightlifting.",
      lastInteraction: "Discussed launching a pilot app for business metrics tracking.",
    },
    ai_conversations: [
      { sender: "aura", text: "Welcome to Aura, Alex. I am Aura. To optimize today's mental and athletic output, start with 3 glasses of water and initiate a brief posture stretch. Let's conquer the task list.", timestamp: "2026-06-10T06:45:00Z" },
    ],
    daily_briefings: {
      id: "b_current",
      date: "2026-06-10",
      healthScore: 84,
      lifeScore: 82,
      tasksSummary: ["Physical stretch: Ready for execution", "Aura System Brief: Success", "Deep marketing focus sprint: Scheduled"],
      focusGoal: "120 Minutes of Deep focused workspace logging",
      nutritionGoal: "Target 2,100 kcal, maximum 150g protein and 3L pure water",
      recs: [
        "Hydration: Your average focus track blocks drink prompts. Keep water on desk.",
        "Recovery: Maintain clear screen boundaries at 10:00 PM to protect gym fatigue recovery.",
      ],
    },
    daily_reflections: {
      id: "r_current",
      date: "2026-06-09",
      tasksCompleted: 4,
      focusSessionsCompleted: 2,
      waterIntake: 6, // glasses
      nutritionCompliance: "good",
      habitCompletionRate: 85,
      recsForTomorrow: [
        "Begin next work block with a hard task while your mind is completely fresh.",
        "Increase water count by at least 2 glasses during afternoon segments.",
      ],
    },
    behavior_predictions: {
      burnoutRisk: "low",
      missedWorkoutProb: 15,
      productivityCrashProb: 24,
      junkFoodCravingRisk: "moderate",
      warningMessage: "High morning desk concentration patterns show potential minor energy slumps between 3 PM and 5 PM, which traditionally triggers low-nutrition grazing.",
      interventions: [
        "Plan your healthy snacks (handful of almonds or a whey-protein shaker) directly at 2:30 PM, preceding any craving signals.",
        "Leverage a Pomodoro break at 3 PM to take physical stretch outdoors; breaks screen lock.",
      ],
    },
    organizations: [
      {
        id: "corp_1",
        name: "Acme High Performance Corp",
        wellnessScore: 78,
        activeCampaign: "Focus Marathon Weeks",
        teams: [
          {
            id: "team_1",
            name: "Platform Developers",
            burnoutScale: 34,
            productivityScale: 88,
            engagementScore: 91,
            members: [
              { id: "tm_1", name: "Alex Performance", burnoutRisk: "low", productivityScore: 92 },
              { id: "tm_2", name: "Sarah Deployments", burnoutRisk: "medium", productivityScore: 85 },
              { id: "tm_3", name: "Ken Database", burnoutRisk: "high", productivityScore: 74 },
            ],
          },
          {
            id: "team_2",
            name: "Executive Growth Team",
            burnoutScale: 42,
            productivityScale: 82,
            engagementScore: 79,
            members: [
              { id: "tm_4", name: "Elena Operations", burnoutRisk: "medium", productivityScore: 80 },
              { id: "tm_5", name: "Chris Sales", burnoutRisk: "low", productivityScore: 84 },
            ],
          },
        ],
      },
    ],
    family_accounts: [
      {
        id: "fam_1",
        familyName: "The Performance Family",
        familyWellnessScore: 81,
        sharedGoals: ["Daily family posture stretches", "Aura weekly meal prep bonding session"],
        members: [
          { id: "fm_1", name: "Alex (Creator)", role: "parent", lifeScore: 84 },
          { id: "fm_2", name: "Jane (Spouse)", role: "spouse", lifeScore: 87 },
          { id: "fm_3", name: "Tyler (Child)", role: "child", lifeScore: 72 },
        ],
      },
    ],
    meal_plans: [
      {
        day: 1,
        meals: {
          breakfast: "Fasted cardio first. Then 3 Whole Eggs, 100g Smoked Salmon, Spinach, half Avocado.",
          lunch: "Grilled Chicken Breast (180g), Steamed Brown Rice (150g), Broccoli sprinkled with Olive Oil.",
          dinner: "Pan-seared Lean Beef (200g), Baked Sweet Potato (120g), Asparagus spears, Mushrooms.",
          snacks: "Dry roasted almonds (30g), Chocolate Whey Isolate shake (1 scoop).",
        },
        targets: { calories: 2150, protein: 175, fats: 72, carbs: 145, water: 3.5 },
      },
      {
        day: 2,
        meals: {
          breakfast: "High protein Oatmeal: 60g Oats, 1 scoop Whey Protein, Blueberry topping, Chia seeds.",
          lunch: "Baked Salmon (180g), Quinoa grain mix (120g), Mixed vegetable salad with Lemon dressing.",
          dinner: "Lean Turkey Breast patties (200g), Red kidney beans stew, Baked zucchini.",
          snacks: "Low-fat Greek Yogurt (200g), Mixed raw berries, walnut bits.",
        },
        targets: { calories: 2050, protein: 165, fats: 64, carbs: 155, water: 3.5 },
      },
      {
        day: 3,
        meals: {
          breakfast: "Scrambled Tofu / Egg whites, Whole grain toast slices (2), Wilted spinach patches.",
          lunch: "Classic Tuna Salad bowl with fresh arugula, cherry tomatoes, cucumbers and light balsamic.",
          dinner: "Shrimp stir-fry (200g) with diverse bell peppers, snow peas, and brown rice noodles (100g).",
          snacks: "Cottage cheese (150g), sliced organic apple with organic natural peanut butter.",
        },
        targets: { calories: 1980, protein: 160, fats: 58, carbs: 165, water: 3.2 },
      },
    ],
    food_logs: [
      { id: "fl_1", itemName: "High Protein Salmon Lunch Platter", calories: 650, protein: 48, carbs: 45, fats: 22, timestamp: "2026-06-10T13:15:00Z" },
    ],
    articles: [
      {
        id: "art_1",
        title: "Behavioral Friction: Designing Systems for High Compliance",
        category: "psychology",
        readTime: "4 min",
        summary: "Traditional habit builders focus on raw willpower. We explore why eliminating environmental friction outperforms determination in the long-term.",
        content: "Willpower is a depleting reservoir... By placing water bottles, resistance bands, and focused workspaces in physical paths, we create cues that initiate automated performance without energy depletion. Pre-loading choices prevents late-day friction fatigue.",
      },
      {
        id: "art_2",
        title: "Nutrition Architectures: Protein Satiety Explained",
        category: "nutrition",
        readTime: "3 min",
        summary: "Understanding the hormonal feedback loops of proteins vs simple carbohydrates in calorie restriction regimes.",
        content: "Proteins trigger high postprandial thermogenesis and stimulate peptide YY (PYY) and GLP-1 hormone release. This provides persistent satiety signals to the hypothalamus, which mitigates nighttime junk craving spikes.",
      },
      {
        id: "art_3",
        title: "Chronobiology and Focus: Harnessing Ultradian Rhythms",
        category: "productivity",
        readTime: "5 min",
        summary: "Why blocking deep work sessions in 90-minute blocks aligns perfectly with cognitive peak performance phases.",
        content: "Our cognitive performance operates on wave patterns known as Ultradian Rhythms. Attempting to force continuous 4-hour focus leads to brain fog and high stress. By integrating 50-minute work sets followed by 10-minute break gaps, the brain restores crucial neurotransmitters.",
      },
    ],
  };
};

// Check if database exists, if not, write initials
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(createInitialDb(), null, 2));
}

let dbCache: any = null;

// Read database from cache or file system
const readDb = () => {
  if (dbCache) {
    return dbCache;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    dbCache = JSON.parse(data);
    return dbCache;
  } catch (err) {
    console.error("Aura DB Error reading file, resetting to initials:", err);
    dbCache = createInitialDb();
    return dbCache;
  }
};

// Write database to cache and file system
const writeDb = (data: any) => {
  dbCache = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Aura DB Error saving file:", err);
  }
};

// Helper for generating custom fallback AI responses to guarantee graceful operation
const getFallbackCoachingResponse = (message: string, profile: any) => {
  const m = (message || "").toLowerCase();
  if (m.includes("water") || m.includes("drink")) {
    return "Alex, your hydration compliance stands at 4/8 glasses today. Hydration is vital for cognitive stamina and muscular efficiency. Grab a glass immediately. I've noted this check.";
  }
  if (m.includes("gym") || m.includes("workout") || m.includes("exercise")) {
    return "Excellent focus on physical output. Your health score thrives on muscle-resistance work. Make sure to log today's exercises, Alex, and scale your protein target accordingly.";
  }
  if (m.includes("tired") || m.includes("burnout") || m.includes("stress")) {
    return "I am picking up elevated strain signals. Let's do a preventive intervention: turn down your workspace brightness, lock in a 10-minute deep breathing gap, and reduce screen stimulation. Guard your focus energy.";
  }
  return `Alex, as your AI strategist Aura, I am tracking your daily consistency score closely. Your active goal "${profile.dailyRoutine || "building routines"}" remains our core focus. Identify the single highest-priority milestone today, block distractions, and conquer it. What specific block is slowing you down right now?`;
};

// ==========================================
// API REST ENDPOINTS
// ==========================================

// Auth & Onboarding Profiles
const getActiveUser = (req: any, db: any) => {
  const userId = req.headers["x-user-id"] || req.query.userId;
  if (!userId) {
    return db.users[0];
  }
  const user = db.users.find((u: any) => u.id === userId || u.email === userId);
  return user || db.users[0];
};

app.post("/api/signup", (req, res) => {
  const db = readDb();
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const existing = db.users.find((u: any) => u.email && email && u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "A user with this email already exists." });
  }

  const newUserId = `user_${Date.now()}`;
  const newUser = {
    id: newUserId,
    email: email,
    password: password,
    name: name || "User",
    age: 28,
    gender: "Other",
    height: 175,
    weight: 72,
    goalWeight: 68,
    activityLevel: "moderate",
    dietaryPreferences: "Balanced",
    allergies: "None",
    medicalConditions: "None",
    sleepHours: 8,
    dailyRoutine: "Productive mornings",
    workSchedule: "9 AM - 5 PM",
    fitnessExperience: "beginner",
    xp: 150,
    level: 1,
    badges: ["First Steps"],
    streakDays: 1,
    consistencyShields: 1
  };

  db.users.push(newUser);

  // Initialize companion sub-tables
  db.health_profiles.push({
    userId: newUserId,
    healthScore: 80,
    riskFactors: ["Initial staging active"],
    recommendations: ["Log your first action to unlock insights"]
  });

  writeDb(db);
  res.json({ success: true, user: newUser });
});

app.post("/api/signin", (req, res) => {
  const db = readDb();
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = db.users.find((u: any) => u.email && email && u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  res.json({ success: true, user });
});

app.get("/api/profile", (req, res) => {
  const db = readDb();
  const user = getActiveUser(req, db);
  const healthProfile = db.health_profiles.find((hp: any) => hp.userId === user?.id) || db.health_profiles[0];
  const family = db.family_accounts?.find((f: any) => f.userId === user?.id) || db.family_accounts?.[0];
  const org = db.organizations?.find((o: any) => o.userId === user?.id) || db.organizations?.[0];

  res.json({
    user,
    healthProfile,
    family,
    org,
  });
});

app.post("/api/profile/update", (req, res) => {
  const db = readDb();
  const user = getActiveUser(req, db);
  const update = req.body;
  
  const userIdx = db.users.findIndex((u: any) => u.id === user?.id);
  if (userIdx === -1) {
    return res.status(404).json({ error: "User profile context not found." });
  }

  db.users[userIdx] = {
    ...db.users[userIdx],
    ...update,
    xp: db.users[userIdx].xp || 100,
    level: db.users[userIdx].level || 1,
    badges: db.users[userIdx].badges || ["Early Adopter"],
    streakDays: db.users[userIdx].streakDays || 1,
    consistencyShields: db.users[userIdx].consistencyShields || 1,
  };

  const bmi = (db.users[userIdx].weight / ((db.users[userIdx].height / 100) ** 2)).toFixed(1);
  const healthScore = Math.min(95, Math.max(50, 95 - Math.abs(db.users[userIdx].weight - db.users[userIdx].goalWeight) * 2));
  
  let hpIdx = db.health_profiles.findIndex((hp: any) => hp.userId === user?.id);
  if (hpIdx === -1) {
    db.health_profiles.push({
      userId: user?.id,
      healthScore,
      riskFactors: [],
      recommendations: []
    });
    hpIdx = db.health_profiles.length - 1;
  }

  db.health_profiles[hpIdx] = {
    userId: user?.id,
    healthScore: healthScore,
    riskFactors: [
      `Potential weight shift deviation (BMI: ${bmi})`,
      db.users[userIdx].sleepHours < 7 ? "Minor sleep disruption risk" : "Standard sleep recovery pattern",
    ],
    recommendations: [
      `Consume customized calorie target of ${Math.round(db.users[userIdx].weight * 25)} kcal daily.`,
      `Target protein quotient of ${Math.round(db.users[userIdx].weight * 1.8)}g to reach physical benchmark.`,
      `Leverage focused blocks styled after linear tasks schedule.`,
    ],
  };

  writeDb(db);
  res.json({
    user: db.users[userIdx],
    healthProfile: db.health_profiles[hpIdx]
  });
});

// Goals Router
app.get("/api/goals", (req, res) => {
  const db = readDb();
  res.json(db.goals || []);
});

app.post("/api/goals", async (req, res) => {
  const db = readDb();
  const { title, category, targetDate } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Goal title is requested" });
  }

  const newGoalId = `goal_${Date.now()}`;
  let milestones = [
    { id: `ms_${Date.now()}_1`, title: "Setup Initial Requirements", description: "Establish tools and document baseline indicators", status: "completed" as const, weekNumber: 1 },
    { id: `ms_${Date.now()}_2`, title: "Deploy Prototypes", description: "Assemble early features and seek review", status: "pending" as const, weekNumber: 2 },
    { id: `ms_${Date.now()}_3`, title: "Execute Core Performance System", description: "Harden consistency loops and assess logs", status: "pending" as const, weekNumber: 3 },
  ];
  let weeklyPlans = [
    "Week 1: Focus on baseline system diagnostics.",
    "Week 2: Focus on prototype build releases.",
    "Week 3: Focus on validation, audit checks, and expansion.",
  ];
  let dailyActions = [
    "Dedicate 45 minutes of proactive planning.",
    "Inspect daily metric logs.",
  ];

  // Try calling Gemini to generate tailored milestones dynamically!
  if (ai) {
    try {
      const prompt = `You are Aura, elite behavioral coach. Generate a premium structured milestone plan for the goal: "${title}" under category: "${category}" to completion by: "${targetDate}".
      Generate:
      1. Exactly 3 to 4 modular Milestones with weekNumber, title, and detailed descriptions.
      2. Exactly 3 to 4 elements of Weekly Plans.
      3. Exactly 2 to 3 elements of Daily Actions.
      
      Respond STRICTLY with a valid JSON representation matching this TypeScript schema:
      {
        "milestones": [
          { "title": string, "description": string, "weekNumber": number }
        ],
        "weeklyPlans": string[],
        "dailyActions": string[]
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        if (parsed.milestones && Array.isArray(parsed.milestones)) {
          milestones = parsed.milestones.map((m: any, idx: number) => ({
            id: `ms_${Date.now()}_${idx}`,
            title: m.title,
            description: m.description,
            status: idx === 0 ? ("completed" as const) : ("pending" as const),
            weekNumber: m.weekNumber || (idx + 1),
          }));
        }
        if (parsed.weeklyPlans && Array.isArray(parsed.weeklyPlans)) {
          weeklyPlans = parsed.weeklyPlans;
        }
        if (parsed.dailyActions && Array.isArray(parsed.dailyActions)) {
          dailyActions = parsed.dailyActions;
        }
      }
    } catch (err) {
      console.log("Aura AI: Standby mode activated for goal generation.");
    }
  }

  const newGoal = {
    id: newGoalId,
    title,
    category: category || "other",
    targetDate: targetDate || "2026-12-31",
    completed: false,
    milestones,
    weeklyPlans,
    dailyActions,
    createdAt: new Date().toISOString(),
  };

  db.goals.push(newGoal);
  
  // Award XP for creating goals
  db.users[0].xp += 100;
  if (db.users[0].xp >= db.users[0].level * 1000) {
    db.users[0].level += 1;
    db.users[0].badges.push(`Goal Crusher Lv${db.users[0].level}`);
  }

  writeDb(db);
  res.json(db.goals);
});

// Update Goal milestones (supports both route types)
const handleMilestoneToggle = (req: any, res: any) => {
  const db = readDb();
  let { goalId, milestoneId } = req.body;
  if (!goalId) {
    goalId = req.params.goalId;
    milestoneId = req.params.milestoneId;
  }

  const goal = db.goals.find((g: any) => g.id === goalId);
  if (!goal) return res.status(404).json({ error: "Goal not found" });

  const milestone = goal.milestones.find((m: any) => m.id === milestoneId);
  if (!milestone) return res.status(404).json({ error: "Milestone not found" });

  milestone.status = milestone.status === "completed" ? "pending" : "completed";
  
  // Check if all milestones are completed to mark goal done
  const allDone = goal.milestones.every((m: any) => m.status === "completed");
  goal.completed = allDone;

  // Award XP
  db.users[0].xp += 50;
  if (allDone) {
    db.users[0].xp += 300;
  }
  
  if (db.users[0].xp >= db.users[0].level * 1000) {
    db.users[0].level += 1;
  }

  writeDb(db);
  res.json(db.goals);
};

app.post("/api/goals/milestone/toggle", handleMilestoneToggle);
app.post("/api/goals/:goalId/milestones/:milestoneId/toggle", handleMilestoneToggle);

app.delete("/api/goals/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  db.goals = db.goals.filter((g: any) => g.id !== id);
  writeDb(db);
  res.json(db.goals);
});

// Tasks Router
app.get("/api/tasks", (req, res) => {
  const db = readDb();
  res.json(db.tasks);
});

app.post("/api/tasks", (req, res) => {
  const db = readDb();
  const { title, priority, dueDate } = req.body;

  if (!title) return res.status(400).json({ error: "Title required" });

  const newTask = {
    id: `task_${Date.now()}`,
    title,
    priority: priority || "medium",
    completed: false,
    dueDate: dueDate || new Date().toISOString().split("T")[0],
    autoGenerated: false,
  };

  db.tasks.unshift(newTask);
  writeDb(db);
  res.json(newTask);
});

app.post("/api/tasks/toggle", (req, res) => {
  const db = readDb();
  const { id } = req.body;
  const task = db.tasks.find((t: any) => t.id === id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  task.completed = !task.completed;
  if (task.completed) {
    db.users[0].xp += 20;
    if (db.users[0].xp >= db.users[0].level * 1000) db.users[0].level += 1;
  } else {
    db.users[0].xp = Math.max(0, db.users[0].xp - 20);
  }

  writeDb(db);
  res.json({ task, user: db.users[0] });
});

app.delete("/api/tasks/:id", (req, res) => {
  const db = readDb();
  db.tasks = db.tasks.filter((t: any) => t.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Habits Logging Router
const handleGetHabits = (req: any, res: any) => {
  const db = readDb();
  res.json(db.habit_logs || []);
};

const handlePostHabit = (req: any, res: any) => {
  const db = readDb();
  const { type, value } = req.body;

  if (!type || value === undefined) {
    return res.status(400).json({ error: "Type and value are required" });
  }

  const newLog = {
    id: `h_${Date.now()}`,
    type,
    value: Number(value),
    timestamp: new Date().toISOString(),
  };

  db.habit_logs.push(newLog);

  // Award XP and calculate streaks
  db.users[0].xp += 15;
  if (db.users[0].xp >= db.users[0].level * 1000) db.users[0].level += 1;

  writeDb(db);
  res.json(db.habit_logs);
};

app.get("/api/habits", handleGetHabits);
app.get("/api/habits/log", handleGetHabits);
app.post("/api/habits", handlePostHabit);
app.post("/api/habits/log", handlePostHabit);

// Focus Pomodoro Timer
const handleGetFocus = (req: any, res: any) => {
  const db = readDb();
  res.json(db.focus_sessions || []);
};

const handlePostFocus = (req: any, res: any) => {
  const db = readDb();
  const { durationMinutes, mode } = req.body;

  const newSession = {
    id: `f_${Date.now()}`,
    durationMinutes: Number(durationMinutes || 25),
    mode: mode || "work",
    timestamp: new Date().toISOString(),
  };

  db.focus_sessions.push(newSession);

  if (mode === "work") {
    db.users[0].xp += Math.round(durationMinutes * 2);
    if (db.users[0].xp >= db.users[0].level * 1000) {
      db.users[0].level += 1;
      db.users[0].badges.push(`Focus Specialist`);
    }
  }

  writeDb(db);
  res.json(db.focus_sessions);
};

app.get("/api/focus", handleGetFocus);
app.get("/api/focus/sessions", handleGetFocus);
app.post("/api/focus", handlePostFocus);
app.post("/api/focus/log-session", handlePostFocus);

// Nutrition & Meal Planning
app.get("/api/nutrition/meal-plan", (req, res) => {
  const db = readDb();
  res.json(db.meal_plans);
});

app.post("/api/nutrition/generate-plan", async (req, res) => {
  const db = readDb();
  const { daysCount, dietaryPref, targetGoal } = req.body; // e.g., 7 / 15 / 30, vegan, weight_loss
  
  const days = Number(daysCount || 7);
  let generatedPlan = db.meal_plans; // Default fallback to initial days 1-3

  if (ai) {
    try {
      const prompt = `As Aura, elite AI Nutritionist, generate a customized highly nutritious daily meal plan for a ${days}-day cycle.
      The goals of this plan: User dietary restriction "${dietaryPref || 'None'}", targeting: "${targetGoal || 'weight loss/fitness optimization'}".
      Provide customized calories, specific proteins, fats, carbs, and target water values for each day.
      Your recommendations should be budget-friendly and physically sustaining.
      
      Respond STRICTLY with a valid JSON array containing day objects conforming to this schema:
      [
        {
          "day": number,
          "meals": {
            "breakfast": string,
            "lunch": string,
            "dinner": string,
            "snacks": string
          },
          "targets": {
            "calories": number,
            "protein": number,
            "fats": number,
            "carbs": number,
            "water": number
          }
        }
      ]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        if (Array.isArray(parsed)) {
          generatedPlan = parsed;
        }
      }
    } catch (err) {
      console.log("Aura AI: Standby mode activated for meal planner.");
    }
  } else {
    // Generate simulated dynamic meal plan based on preferences
    generatedPlan = Array.from({ length: days }).map((_, i) => ({
      day: i + 1,
      meals: {
        breakfast: `Mornings Cardio followed by: ${dietaryPref?.includes("vegan") ? "Almond milk tofu scramble with spinach" : "Whole eggs scrambled on keto sourdough Toast with organic avocado slice"}.`,
        lunch: `Elite energy bowl: ${dietaryPref?.includes("vegan") ? "Tempeh blocks with brown rice" : "Grilled salmon breast with quinoa, steamed broccoli and light lemon glaze"}.`,
        dinner: `Recovery dish: ${dietaryPref?.includes("vegan") ? "Lentil soup with baked sweet potatoes" : "Lean grass-fed steak slices with asparagus spear locks and mushrooms"}.`,
        snacks: "Roasted raw almonds, organic whey, or pea-isolate shaker with berries.",
      },
      targets: {
        calories: targetGoal?.includes("gain") ? 2500 : 1950,
        protein: targetGoal?.includes("gain") ? 180 : 155,
        fats: 60,
        carbs: targetGoal?.includes("gain") ? 220 : 130,
        water: 3.5,
      },
    }));
  }

  db.meal_plans = generatedPlan;
  writeDb(db);
  res.json(generatedPlan);
});

// Image Nutrition Detector
app.post("/api/nutrition/analyze-photo", async (req, res) => {
  const db = readDb();
  let base64Image = req.body.image; // can be data URL

  let estimation = {
    id: `fl_${Date.now()}`,
    itemName: "Detected Superfood Salad Platter",
    calories: 580,
    protein: 38,
    carbs: 42,
    fats: 18,
    timestamp: new Date().toISOString(),
  };

  if (ai && base64Image) {
    try {
      // Remove dataurl headers
      const pureBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

      const imagePart = {
        inlineData: {
          mimeType: "image/png",
          data: pureBase64,
        },
      };

      const promptPart = {
        text: `You are Aura, an elite Food Intelligence system. Analyze this food picture.
        Identify:
        1. Name of the primary food items
        2. Extrapolated Calories
        3. Carbohydrates count in grams
        4. Protein count in grams
        5. Fats count in grams
        
        Respond STRICTLY with a JSON matching this exact structure:
        {
          "itemName": "Specific Food Title",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fats": number
        }`,
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, promptPart] },
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        estimation = {
          id: `fl_${Date.now()}`,
          itemName: parsed.itemName || "Scanned Delicacy",
          calories: Number(parsed.calories || 500),
          protein: Number(parsed.protein || 30),
          carbs: Number(parsed.carbs || 40),
          fats: Number(parsed.fats || 15),
          timestamp: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.log("Aura AI: Standby mode activated for vision analysis.");
    }
  }

  db.food_logs.unshift(estimation);
  writeDb(db);
  res.json(db.food_logs);
});

// Get/Delete Meal Logs
app.get("/api/nutrition/logs", (req, res) => {
  const db = readDb();
  res.json(db.food_logs || []);
});

app.delete("/api/nutrition/logs/:id", (req, res) => {
  const db = readDb();
  db.food_logs = db.food_logs.filter((fl: any) => fl.id !== req.params.id);
  writeDb(db);
  res.json(db.food_logs);
});

// AI Daily Briefing & Accountability Coach
const handleBriefing = async (req: any, res: any) => {
  const db = readDb();
  const today = new Date().toISOString().split("T")[0];

  // If simple GET load, check if today's briefing is already computed to bypass model quota
  if (req.method === "GET") {
    if (db.daily_briefings && db.daily_briefings.date === today) {
      return res.json(db.daily_briefings);
    }
    // Return standby instantly for GET to conserve quota on dashboard load
    const standbyBriefing = {
      id: `b_${Date.now()}`,
      date: today,
      healthScore: db.health_profiles[0]?.healthScore || 84,
      lifeScore: Math.round(((db.health_profiles[0]?.healthScore || 84) + (db.users[0].streakDays * 5)) / 1.1),
      tasksSummary: db.tasks.slice(0, 3).map((t: any) => t.title),
      focusGoal: `Deep focused workspace block to finish top active priorities. Let's maximize today's cognitive stamina.`,
      nutritionGoal: `Target protein quotient of ${Math.round(db.users[0].weight * 1.8)}g & 3 liters of pure hydrating water.`,
      recs: [
        "Perform critical 5-minute physical stretch every 90 minutes of intensive desk work.",
        "Secure early gym sessions in high energy morning slots before workday distraction starts.",
      ],
      isStandby: true,
    };
    db.daily_briefings = standbyBriefing;
    writeDb(db);
    return res.json(standbyBriefing);
  }

  let fallbackGenerated = false;

  if (ai) {
    try {
      const activeGoalText = db.goals.map((g: any) => `${g.title} (${g.category})`).join(", ");
      const taskText = db.tasks.map((t: any) => `${t.title} [${t.priority} priority, Completed: ${t.completed}]`).join("; ");
      const profileText = `Name: ${db.users[0].name}, Weight: ${db.users[0].weight}kg, GoalWeight: ${db.users[0].goalWeight}kg. Routine: ${db.users[0].dailyRoutine}`;

      const prompt = `You are Aura, an elite AI Coach. Generate a highly personalized Daily Morning Briefing for the user.
      User Profile: ${profileText}
      Current active goals: ${activeGoalText}
      Today's tasks: ${taskText}

      Create:
      1. A custom Today's Focus Action Target (e.g. 120 minutes of focus work).
      2. Today's target nutrition goal (e.g., target protein/water).
      3. Exactly 2 highly actionable recommendations to prevent failure or boost consistency today.
      
      Respond STRICTLY with a valid JSON file structure:
      {
        "focusGoal": "Brief text explaining today's focus work strategy",
        "nutritionGoal": "Specific target calories, protein, and water",
        "recs": ["Action 1", "Action 2"]
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        db.daily_briefings = {
          id: `b_${Date.now()}`,
          date: today,
          healthScore: db.health_profiles[0]?.healthScore || 85,
          lifeScore: Math.round(((db.health_profiles[0]?.healthScore || 85) + (db.users[0].streakDays * 5)) / 1.1),
          tasksSummary: db.tasks.slice(0, 3).map((t: any) => t.title),
          focusGoal: parsed.focusGoal,
          nutritionGoal: parsed.nutritionGoal,
          recs: parsed.recs,
          isStandby: false,
        };
        writeDb(db);
      } else {
        fallbackGenerated = true;
      }
    } catch (err) {
      console.log("Aura AI: Standby mode activated for morning briefing.");
      fallbackGenerated = true;
    }
  } else {
    fallbackGenerated = true;
  }

  if (fallbackGenerated || !db.daily_briefings || !db.daily_briefings.focusGoal) {
    db.daily_briefings = {
      id: `b_${Date.now()}`,
      date: today,
      healthScore: db.health_profiles[0]?.healthScore || 84,
      lifeScore: Math.round(((db.health_profiles[0]?.healthScore || 84) + (db.users[0].streakDays * 5)) / 1.1),
      tasksSummary: db.tasks.slice(0, 3).map((t: any) => t.title),
      focusGoal: `Deep focused workspace block to finish top active priorities. Let's maximize today's cognitive stamina.`,
      nutritionGoal: `Target protein quotient of ${Math.round(db.users[0].weight * 1.8)}g & 3 liters of pure hydrating water.`,
      recs: [
        "Perform critical 5-minute physical stretch every 90 minutes of intensive desk work.",
        "Secure early gym sessions in high energy morning slots before workday distraction starts.",
      ],
      isStandby: true,
    };
    writeDb(db);
  }

  res.json(db.daily_briefings);
};

app.get("/api/coaching/briefing", handleBriefing);
app.post("/api/coaching/briefing", handleBriefing);

// Evening Reflection
const handleReflection = async (req: any, res: any) => {
  const db = readDb();
  const today = new Date().toISOString().split("T")[0];

  // If simple GET load, check if today's reflection is already computed to bypass model quota
  if (req.method === "GET") {
    if (db.daily_reflections && db.daily_reflections.date === today) {
      return res.json(db.daily_reflections);
    }
    const completedCount = db.tasks.filter((t: any) => t.completed).length;
    const waterGlasses = db.habit_logs.filter((h: any) => h.type === "water").reduce((acc: number, curr: any) => acc + curr.value, 0);
    const standbyReflection = {
      id: `r_${Date.now()}`,
      date: today,
      tasksCompleted: completedCount,
      focusSessionsCompleted: db.focus_sessions.length,
      waterIntake: waterGlasses,
      nutritionCompliance: waterGlasses >= 7 ? "perfect" as const : waterGlasses >= 4 ? "good" as const : "fair" as const,
      habitCompletionRate: Math.round(((completedCount / Math.max(1, db.tasks.length)) * 100)),
      recsForTomorrow: [
        "Plan your healthy snacks at 2:30 PM, preceding any mid-day energy sags.",
        "Perform next work block with a hard task while cognitive reserve is high.",
      ],
      isStandby: true,
    };
    db.daily_reflections = standbyReflection;
    writeDb(db);
    return res.json(standbyReflection);
  }

  const completedCount = db.tasks.filter((t: any) => t.completed).length;
  const waterGlasses = db.habit_logs.filter((h: any) => h.type === "water").reduce((acc: number, curr: any) => acc + curr.value, 0);
  const totalFocus = db.focus_sessions.reduce((acc: number, curr: any) => acc + curr.durationMinutes, 0);
  let fallbackGenerated = false;

  if (ai) {
    try {
      const activeGoalText = db.goals.map((g: any) => g.title).join(", ");
      const profileText = `Name: ${db.users[0].name}, Active Goals: ${activeGoalText}`;

      const prompt = `You are Aura, an elite Performance Mentor. Generate today's Evening Accountability Reflection.
      Metrics:
      - Tasks Completed: ${completedCount}
      - Total Deep Work Time: ${totalFocus} minutes
      - Water glasses logged: ${waterGlasses}
      
      Provide:
      1. A strict compliance categorization ('poor' | 'fair' | 'good' | 'perfect').
      2. Exactly 2 highly customized recommendations to lock in for tomorrow.
      
      Respond STRICTLY in JSON format:
      {
        "nutritionCompliance": "poor" | "fair" | "good" | "perfect",
        "recsForTomorrow": ["Specific advice 1", "Specific advice 2"]
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        db.daily_reflections = {
          id: `r_${Date.now()}`,
          date: today,
          tasksCompleted: completedCount,
          focusSessionsCompleted: db.focus_sessions.length,
          waterIntake: waterGlasses,
          nutritionCompliance: parsed.nutritionCompliance || "good",
          habitCompletionRate: Math.round(((completedCount / Math.max(1, db.tasks.length)) * 100)),
          recsForTomorrow: parsed.recsForTomorrow || [],
          isStandby: false,
        };
        writeDb(db);
      } else {
        fallbackGenerated = true;
      }
    } catch (err) {
      console.log("Aura AI: Standby mode activated for evening reflection.");
      fallbackGenerated = true;
    }
  } else {
    fallbackGenerated = true;
  }

  if (fallbackGenerated || !db.daily_reflections || !db.daily_reflections.nutritionCompliance) {
    db.daily_reflections = {
      id: `r_${Date.now()}`,
      date: today,
      tasksCompleted: completedCount,
      focusSessionsCompleted: db.focus_sessions.length,
      waterIntake: waterGlasses,
      nutritionCompliance: waterGlasses >= 7 ? "perfect" : waterGlasses >= 4 ? "good" : "fair",
      habitCompletionRate: Math.round(((completedCount / Math.max(1, db.tasks.length)) * 100)),
      recsForTomorrow: [
        "Plan your healthy snacks at 2:30 PM, preceding any mid-day energy sags.",
        "Perform next work block with a hard task while cognitive reserve is high.",
      ],
      isStandby: true,
    };
    writeDb(db);
  }

  res.json(db.daily_reflections);
};

app.get("/api/coaching/reflection", handleReflection);
app.post("/api/coaching/reflection", handleReflection);

// Behavior Prediction Engine
const handlePredictBehavior = async (req: any, res: any) => {
  const db = readDb();
  const today = new Date().toISOString().split("T")[0];

  // If simple GET load, check if today's predictions are already computed to bypass model quota
  if (req.method === "GET") {
    if (db.behavior_predictions && db.behavior_predictions.date === today) {
      return res.json(db.behavior_predictions);
    }
    const standbyPrediction = {
      burnoutRisk: db.users[0].sleepHours < 7 ? "moderate" as const : "low" as const,
      missedWorkoutProb: db.users[0].streakDays > 5 ? 12 : 25,
      productivityCrashProb: db.users[0].sleepHours < 7 ? 35 : 18,
      junkFoodCravingRisk: "moderate" as const,
      warningMessage: "High morning desk concentration patterns show potential minor energy slumps between 3 PM and 5 PM, which traditionally triggers low-nutrition grazing.",
      interventions: [
        "Plan your healthy snacks (handful of almonds or a whey-protein shaker) directly at 2:30 PM, preceding any craving signals.",
        "Leverage a Pomodoro break at 3 PM to take physical stretch outdoors; breaks screen lock.",
      ],
      date: today,
      isStandby: true,
    };
    db.behavior_predictions = standbyPrediction;
    writeDb(db);
    return res.json(standbyPrediction);
  }

  let fallbackGenerated = false;

  if (ai) {
    try {
      const activeGoalText = db.goals.map((g: any) => g.title).join(", ");
      const taskRatio = db.tasks.filter((t: any) => t.completed).length / Math.max(1, db.tasks.length);
      const waterCount = db.habit_logs.filter((h: any) => h.type === "water").length;

      const prompt = `You are Aura, elite Behavioral Strategist & Psychologist. Predict user behavioral slumps or performance fatigue blocks based on current metrics.
      Goals: ${activeGoalText}
      Completed task ratio: ${taskRatio}
      Water logging habits: ${waterCount} logs.
      
      Predict:
      1. Overall burnoutRisk: "low" | "moderate" | "high".
      2. Probability of missed workout (number: 0-100).
      3. Probability of productivity crash (number: 0-100).
      4. Junk-food craving risk: "low" | "moderate" | "high".
      5. A context-aware warning message detailing potential slumps based on psychological patterns.
      6. Exactly 2 highly target preventative interventions.
      
      Respond STRICTLY in JSON:
      {
        "burnoutRisk": "low" | "moderate" | "high",
        "missedWorkoutProb": number,
        "productivityCrashProb": number,
        "junkFoodCravingRisk": "low" | "moderate" | "high",
        "warningMessage": "string",
        "interventions": ["Intervention 1", "Intervention 2"]
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        db.behavior_predictions = {
          ...parsed,
          date: today,
          isStandby: false,
        };
        writeDb(db);
      } else {
        fallbackGenerated = true;
      }
    } catch (err) {
      console.log("Aura AI: Standby mode activated for prediction engine.");
      fallbackGenerated = true;
    }
  } else {
    fallbackGenerated = true;
  }

  if (fallbackGenerated || !db.behavior_predictions || !db.behavior_predictions.burnoutRisk) {
    db.behavior_predictions = {
      burnoutRisk: db.users[0].sleepHours < 7 ? "moderate" : "low",
      missedWorkoutProb: db.users[0].streakDays > 5 ? 12 : 25,
      productivityCrashProb: db.users[0].sleepHours < 7 ? 35 : 18,
      junkFoodCravingRisk: "moderate",
      warningMessage: "High morning desk concentration patterns show potential minor energy slumps between 3 PM and 5 PM, which traditionally triggers low-nutrition grazing.",
      interventions: [
        "Plan your healthy snacks (handful of almonds or a whey-protein shaker) directly at 2:30 PM, preceding any craving signals.",
        "Leverage a Pomodoro break at 3 PM to take physical stretch outdoors; breaks screen lock.",
      ],
      date: today,
      isStandby: true,
    };
    writeDb(db);
  }

  res.json(db.behavior_predictions);
};

app.get("/api/coaching/predict-behavior", handlePredictBehavior);
app.post("/api/coaching/predict-behavior", handlePredictBehavior);

// Chat with Aura (Accountability Partner)
app.post("/api/coaching/chat", async (req, res) => {
  const db = readDb();
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "Message requested" });

  const userMsg = {
    sender: "user" as const,
    text: message,
    timestamp: new Date().toISOString(),
  };

  db.ai_conversations.push(userMsg);

  let responseText = "";

  if (ai) {
    try {
      const chatContext = db.ai_conversations.slice(-8).map((c: any) => `${c.sender}: ${c.text}`).join("\n");
      const profile = db.users[0];
      const goalsText = db.goals.map((g: any) => `Goal: ${g.title}, milestones completed: ${g.milestones.filter((m: any) => m.status === 'completed').length}/${g.milestones.length}`).join("; ");
      const dailyBrief = db.daily_briefings;

      const systemPrompt = `You are Aura, an elite AI Behavioral Psychologist, Personal Performance Coach, Nutritionist and Goal Planner.
      You actively drive behavior change with Alex, who is ${profile.age} yrs old, weight ${profile.weight}kg, aiming for ${profile.goalWeight}kg.
      Their dietary choices: ${profile.dietaryPreferences}.
      Active goal metrics: ${goalsText}.
      Today's morning focus advice: ${dailyBrief?.focusGoal || "None"}.
      
      Speak as an executive advisor. Match brevity with deep actionable direction. Challenge Alex to overcome procrastination. Highlight past achievements if relevant, but prioritize current commitments. Avoid dry templates or corporate jargon. Focus on consistency. Limit your responses to 3-4 short, punchy paragraphs.`;

      const chatResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Previous Dialogue:\n${chatContext}\n\nLatest User Input:\nuser: ${message}\n\nAura Response:`,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      responseText = chatResponse.text || getFallbackCoachingResponse(message, profile);
    } catch (err) {
      console.log("Aura AI: Standby mode activated for chat companion.");
      responseText = getFallbackCoachingResponse(message, db.users[0]);
    }
  } else {
    responseText = getFallbackCoachingResponse(message, db.users[0]);
  }

  const auraMsg = {
    sender: "aura" as const,
    text: responseText,
    timestamp: new Date().toISOString(),
  };

  db.ai_conversations.push(auraMsg);
  writeDb(db);

  // Directly return db.ai_conversations array to comply with client's array map expectations
  res.json(db.ai_conversations);
});

app.get("/api/coaching/chat", (req, res) => {
  const db = readDb();
  res.json(db.ai_conversations || []);
});

// Articles/Knowledge Hub
app.get("/api/articles", (req, res) => {
  const db = readDb();
  res.json(db.articles || []);
});

// Gamification Challenges & Leaderboards
app.get("/api/gamification", (req, res) => {
  res.json({
    badges: ["Early Bird", "Deep Worker", "Hydration Hero", "Iron Discipline", "Pro Planner", "Burnout Resilient"],
    weeklyChallenge: {
      title: "The 90-95 Accountability Run",
      description: "Log at least 3 separate 50-minute Focus Blocks and maintain 100% water completion (8 glasses) for 3 consecutive days.",
      xpReward: 500,
      badgeReward: "Zen Master",
      participants: 1240,
    },
    monthlyChallenge: {
      title: "Athletic Lean Cut Matrix",
      description: "Complete 15 metabolic/strength tasks and hit deficit guidelines 4 weeks in a row.",
      xpReward: 1500,
      badgeReward: "Peak Physical Beast",
    },
  });
});

// Family / Multi-user dashboard operations
app.post("/api/family/challenge", (req, res) => {
  const db = readDb();
  const { title } = req.body;
  
  if (db.family_accounts[0]) {
    db.family_accounts[0].sharedGoals.push(title || "Dynamic family goal");
    db.family_accounts[0].familyWellnessScore = Math.min(100, db.family_accounts[0].familyWellnessScore + 2);
    writeDb(db);
  }
  res.json(db.family_accounts[0]);
});

// Business Plan dashboard operations
const handleBusinessIntervention = (req: any, res: any) => {
  const db = readDb();
  const { teamId } = req.body;

  const org = db.organizations[0];
  if (org) {
    const team = org.teams.find((t: any) => t.id === teamId || !teamId); // Fallback to first if none specified
    if (team) {
      // Run preventive fatigue breathing intervention
      team.burnoutScale = Math.max(10, team.burnoutScale - 8);
      team.engagementScore = Math.min(100, team.engagementScore + 5);
      writeDb(db);
      return res.json({ team, message: "Aura smart breathing warning dispatched to Platform Developers workstation dashboard!" });
    }
  }
  res.status(404).json({ error: "Team not found" });
};

app.post("/api/business/intervention", handleBusinessIntervention);
app.post("/api/business/team/wellness-intervention", handleBusinessIntervention);


// ==========================================
// VITE OR STATIC ASSET STREAMING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite compiler attached in dev mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aura OS is officially online at: http://localhost:${PORT}`);
  });
}

startServer();
