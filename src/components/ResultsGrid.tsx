"use client";

import { motion } from "framer-motion";
import { LearningResource } from "@/lib/types";
import { ResourceCard } from "./ResourceCard";
import { Brain, SortAsc, Filter } from "lucide-react";

interface ResultsGridProps {
  resources: LearningResource[];
  topic: string;
  onBookmark: (resource: LearningResource) => void;
  onSummarize: (resource: LearningResource) => void;
}

export function ResultsGrid({
  resources,
  topic,
  onBookmark,
  onSummarize,
}: ResultsGridProps) {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <Brain className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Results for "{topic}"
            </h2>
          </div>
          <p className="text-gray-400">
            Found {resources.length} curated resources ranked by AI
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors">
            <SortAsc className="w-4 h-4" />
            Sort by Score
          </button>
          <button className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource, index) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            index={index}
            onBookmark={onBookmark}
            onSummarize={onSummarize}
          />
        ))}
      </div>
    </div>
  );
}
