"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Clock,
  ThumbsUp,
  Eye,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  Youtube,
  FileText,
  Rss,
} from "lucide-react";
import { LearningResource } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  resource: LearningResource;
  index: number;
  onBookmark: (resource: LearningResource) => void;
  onSummarize: (resource: LearningResource) => void;
}

const sourceIcons = {
  youtube: Youtube,
  article: FileText,
  blog: Rss,
};

const sourceColors = {
  youtube: "text-red-400",
  article: "text-blue-400",
  blog: "text-green-400",
};

export function ResourceCard({
  resource,
  index,
  onBookmark,
  onSummarize,
}: ResourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const SourceIcon = sourceIcons[resource.source];
  const scoreColor =
    resource.rankingScore >= 80
      ? "text-green-400"
      : resource.rankingScore >= 60
      ? "text-yellow-400"
      : "text-orange-400";

  const formatViews = (views?: number) => {
    if (!views) return "N/A";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      <div className="glass rounded-2xl overflow-hidden card-hover">
        <div className="relative">
          <div className="aspect-video relative overflow-hidden">
            <img
              src={resource.thumbnail}
              alt={resource.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40"
                >
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-full bg-indigo-500/90 hover:bg-indigo-500 transition-colors"
                  >
                    <Play className="w-8 h-8 text-white fill-white" />
                  </a>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className={cn("p-1.5 rounded-lg bg-black/60", sourceColors[resource.source])}>
                <SourceIcon className="w-4 h-4" />
              </div>
              {resource.duration && (
                <span className="px-2 py-1 text-xs font-medium bg-black/60 rounded-lg text-white">
                  {resource.duration}
                </span>
              )}
            </div>

            <div className="absolute top-3 right-3">
              <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60", scoreColor)}>
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-bold">{resource.rankingScore}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
            {resource.title}
          </h3>
          
          <p className="text-sm text-gray-400 mb-3">
            {resource.channel || resource.author}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            {resource.views && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {formatViews(resource.views)}
              </span>
            )}
            {resource.likes && (
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" />
                {formatViews(resource.likes)}
              </span>
            )}
            {resource.publishedAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {resource.publishedAt}
              </span>
            )}
          </div>

          {resource.summary && (
            <div className="mb-4">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide Summary
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    View AI Summary
                  </>
                )}
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 rounded-xl bg-white/5 space-y-3">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Key Points
                        </h4>
                        <ul className="space-y-1">
                          {resource.summary.bullets.map((bullet, i) => (
                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                              <span className="text-indigo-400 mt-1">•</span>
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Key Concepts
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {resource.summary.keyConcepts.map((concept, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs bg-indigo-500/20 text-indigo-300 rounded-full"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {!resource.summary && (
            <button
              onClick={() => onSummarize(resource)}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors mb-4"
            >
              Generate AI Summary
            </button>
          )}

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => onBookmark(resource)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                resource.bookmarked
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
              )}
              whileTap={{ scale: 0.95 }}
            >
              {resource.bookmarked ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  Save
                </>
              )}
            </motion.button>
            
            <motion.a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </motion.a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
