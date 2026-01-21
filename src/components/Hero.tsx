"use client";

import { motion } from "framer-motion";
import { Brain, Zap, BookOpen, Target } from "lucide-react";

export function Hero() {
  return (
    <div className="text-center mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8"
      >
        <Zap className="w-4 h-4 text-indigo-400" />
        <span className="text-sm text-indigo-300 font-medium">
          AI-Powered Learning Platform
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
      >
        <span className="text-white">Learn Smarter with</span>
        <br />
        <span className="gradient-text glow-text">AI Curation</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
      >
        Stop endless searching. Our AI aggregates, ranks, and summarizes the
        best learning resources from across the web — so you can focus on
        what matters: <span className="text-white font-medium">learning</span>.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap justify-center gap-8 mb-16"
      >
        {[
          { icon: Brain, label: "AI Ranking", desc: "Smart quality scoring" },
          { icon: BookOpen, label: "Summaries", desc: "Instant overviews" },
          { icon: Target, label: "Curated", desc: "Best resources only" },
        ].map((feature, index) => (
          <motion.div
            key={feature.label}
            className="flex items-center gap-3 px-6 py-3 glass rounded-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <feature.icon className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">{feature.label}</p>
              <p className="text-xs text-gray-500">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
