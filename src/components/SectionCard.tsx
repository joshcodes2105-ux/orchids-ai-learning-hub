"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Play,
  BookOpen,
  Lightbulb,
  Code,
  Calculator,
  FileText,
  Star,
  Clock,
  Eye,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { ExtractedSection, SectionResources, LearningResource } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  section: ExtractedSection;
  resources?: SectionResources;
  index: number;
  onBookmark?: (resource: LearningResource) => void;
  onPlayVideo?: (resource: LearningResource) => void;
}

const intentIcons = {
  concept: Lightbulb,
  derivation: Calculator,
  example: FileText,
  theory: BookOpen,
  implementation: Code,
};

const intentColors = {
  concept: "text-yellow-400 bg-yellow-400/10",
  derivation: "text-blue-400 bg-blue-400/10",
  example: "text-green-400 bg-green-400/10",
  theory: "text-purple-400 bg-purple-400/10",
  implementation: "text-cyan-400 bg-cyan-400/10",
};

const depthBadges = {
  beginner: { label: "Beginner", color: "bg-green-500/20 text-green-400" },
  intermediate: { label: "Intermediate", color: "bg-yellow-500/20 text-yellow-400" },
  advanced: { label: "Advanced", color: "bg-red-500/20 text-red-400" },
};

export function SectionCard({ section, resources, index, onBookmark, onPlayVideo }: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"videos" | "theory">("videos");

  const IntentIcon = intentIcons[section.intent.type];
  const intentColor = intentColors[section.intent.type];
  const depthBadge = depthBadges[section.intent.depth];

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
      className="glass rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-start gap-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex-shrink-0">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              intentColor
            )}
          >
            <IntentIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 font-medium">
              Section {index + 1}
            </span>
            <span className={cn("px-2 py-0.5 text-xs rounded-full", depthBadge.color)}>
              {depthBadge.label}
            </span>
            {section.intent.needsVisual && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-400">
                Visual
              </span>
            )}
            {section.intent.needsPractice && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-400">
                Practice
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
            {section.title}
          </h3>

          {resources && (
            <p className="text-sm text-gray-400 line-clamp-2">{resources.summary}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {section.keyConcepts.slice(0, 4).map((concept) => (
              <span
                key={concept}
                className="px-2 py-1 text-xs bg-white/5 text-gray-300 rounded-full"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 p-2"
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && resources && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-white/10">
              <div className="flex gap-2 mt-4 mb-4">
                <button
                  onClick={() => setActiveTab("videos")}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    activeTab === "videos"
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-gray-400 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Videos ({resources.videos.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("theory")}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    activeTab === "theory"
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-gray-400 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Theory
                  </div>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "videos" ? (
                  <motion.div
                    key="videos"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3"
                  >
                    {resources.videos.map((video, vidIndex) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        index={vidIndex}
                        formatViews={formatViews}
                        onBookmark={onBookmark}
                        onPlayVideo={onPlayVideo}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="theory"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-white/5 rounded-xl">
                      <h4 className="text-lg font-semibold text-white mb-3">
                        {resources.theory.title}
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {resources.theory.content}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-400 mb-2">
                        Key Concepts
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {resources.theory.keyConcepts.map((concept) => (
                          <span
                            key={concept}
                            className="px-3 py-1.5 text-sm bg-indigo-500/20 text-indigo-300 rounded-lg"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-400 mb-2">
                        Related Topics
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {resources.theory.relatedTopics.map((topic) => (
                          <span
                            key={topic}
                            className="px-3 py-1.5 text-sm bg-white/5 text-gray-300 rounded-lg"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface VideoCardProps {
  video: LearningResource;
  index: number;
  formatViews: (views?: number) => string;
  onBookmark?: (resource: LearningResource) => void;
  onPlayVideo?: (resource: LearningResource) => void;
}

function VideoCard({ video, index, formatViews, onBookmark, onPlayVideo }: VideoCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(video.bookmarked || false);
  const [isHovered, setIsHovered] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark?.({ ...video, bookmarked: !isBookmarked });
  };

  const handlePlay = () => {
    if (onPlayVideo) {
      onPlayVideo(video);
    }
  };

  const handleCardClick = () => {
    if (video.source === "youtube" && onPlayVideo) {
      onPlayVideo(video);
    } else {
      window.open(video.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      className="flex gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer"
    >
      <div className="relative flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  className="p-2 rounded-full bg-indigo-500/90"
                >
                  {video.source === "youtube" ? (
                    <Play className="w-5 h-5 text-white fill-white" />
                  ) : (
                    <ExternalLink className="w-5 h-5 text-white" />
                  )}
                </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {video.duration && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs bg-black/80 text-white rounded">
            {video.duration}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-white line-clamp-2 group-hover:text-indigo-300 transition-colors">
            {video.title}
          </h4>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">
              {video.rankingScore}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-1">
          {video.channel || video.author}
        </p>

        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          {video.views && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatViews(video.views)}
            </span>
          )}
          {video.publishedAt && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {video.publishedAt}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleBookmark}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              isBookmarked
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            )}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-colors"
            >
              {video.source === "youtube" ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-indigo-300" />
                  Watch
                </>
              ) : (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open
                </>
              )}
            </button>
        </div>
      </div>
    </motion.div>
  );
}
