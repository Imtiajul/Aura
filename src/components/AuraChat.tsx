/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Send, Flame, Sparkles, User, Dumbbell, History, BookOpen } from "lucide-react";
import { Message, UserProfile } from "../types";

interface AuraChatProps {
  conversation: Message[];
  userProfile: UserProfile | null;
  onSendMessage: (msg: string) => Promise<void>;
  loading: boolean;
}

export default function AuraChat({ conversation, userProfile, onSendMessage, loading }: AuraChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input);
    setInput("");
  };

  const handlePresetClick = (preset: string) => {
    if (loading) return;
    onSendMessage(preset);
  };

  const presets = [
    { text: "Help me fight physical fatigue", icon: Dumbbell, color: "hover:bg-amber-500/10 hover:text-amber-300" },
    { text: "Draft routine for deep work", icon: Flame, color: "hover:bg-orange-500/10 hover:text-orange-300" },
    { text: "My focus is drifting today", icon: Brain, color: "hover:bg-purple-500/10 hover:text-purple-300" },
    { text: "Calorie target review", icon: BookOpen, color: "hover:bg-emerald-500/10 hover:text-emerald-300" },
  ];

  return (
    <div id="aura_coaching_chat" className="rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-md flex flex-col h-[520px] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Brain className="w-5 h-5 text-emerald-400 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Aura Behavioral Coach</h3>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Memory Engaged
            </span>
          </div>
        </div>

        {/* User Stats Summary */}
        {userProfile && (
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">Consistency Base</span>
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 justify-end">
              <span>Level {userProfile.level}</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>{userProfile.streakDays} Day Streak</span>
            </div>
          </div>
        )}
      </div>

      {/* Message Board */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/20">
        <AnimatePresence initial={false}>
          {conversation.map((msg, index) => {
            const isUser = msg.sender === "user";
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border ${
                  isUser 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}>
                  {isUser ? <User className="w-4.5 h-4.5" /> : <Brain className="w-4 h-4 text-emerald-400" />}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                  isUser 
                    ? "bg-emerald-500/10 border-emerald-500/15 text-emerald-300 rounded-tr-none" 
                    : "bg-slate-900 border-slate-800 text-slate-300 rounded-tl-none"
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className="text-[9px] font-mono text-slate-500 mt-2 block text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Pulsing Loading Bubble */}
        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <Brain className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 rounded-tl-none flex items-center gap-1.5">
              <span>Aura is writing</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-200" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-300" />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Presets and Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-4">
        {/* Preset list */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((preset, index) => (
            <button
              key={index}
              disabled={loading}
              onClick={() => handlePresetClick(preset.text)}
              className={`p-2.5 rounded-lg border border-slate-850 bg-slate-900/60 text-[10px] sm:text-xs text-slate-400 font-semibold transition-all flex items-center gap-2 text-left justify-start ${preset.color} disabled:opacity-50 disabled:pointer-events-none duration-150`}
            >
              <preset.icon className="w-3.5 h-3.5 stroke-[2] shrink-0" />
              <span className="line-clamp-1">{preset.text}</span>
            </button>
          ))}
        </div>

        {/* Chat input box */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Consult Aura on nutrition limits, fitness fatigue, or focus tactics..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-slate-200 focus:border-emerald-500 focus:outline-none text-xs sm:text-sm transition-colors placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              input.trim() && !loading
                ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                : "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
