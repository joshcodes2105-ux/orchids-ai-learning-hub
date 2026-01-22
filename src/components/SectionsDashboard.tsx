"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Play, 
  ExternalLink, 
  Target, 
  Lightbulb, 
  Search,
  BookOpen,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Clock,
  Eye,
  Info
} from "lucide-react";
import { ExtractedSection, SectionResources, LearningResource } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SectionsDashboardProps {
  fileName?: string;
  overallTopic: string;
  sections: ExtractedSection[];
  sectionResources: SectionResources[];
  onBack: () => void;
  onBookmark?: (resource: LearningResource) => void;
  onPlayVideo?: (resource: LearningResource) => void;
}

export function SectionsDashboard({
  fileName,
  overallTopic,
  sections,
  sectionResources,
  onBack,
  onBookmark,
  onPlayVideo,
}: SectionsDashboardProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id || "");
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const selectedSection = useMemo(() => 
    sections.find(s => s.id === selectedSectionId),
    [sections, selectedSectionId]
  );

  const selectedResources = useMemo(() => 
    sectionResources.find(sr => sr.sectionId === selectedSectionId),
    [sectionResources, selectedSectionId]
  );

  const toggleComplete = (id: string) => {
    setCompletedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const primaryVideo = selectedResources?.videos[0];
  const secondaryVideos = selectedResources?.videos.slice(1, 3);

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[80vh]">
      {/* Left Panel - Section List */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to {fileName ? 'Upload' : 'Search'}</span>
        </button>

        <div className="glass rounded-2xl p-4 flex flex-col gap-2">
          <div className="px-2 mb-4">
            <h2 className="text-white font-bold text-lg leading-tight mb-1">{overallTopic}</h2>
            {fileName && <p className="text-gray-500 text-xs truncate">{fileName}</p>}
            <div className="mt-4 flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-wider font-bold">
              <span>Progress</span>
              <span>{Math.round((completedSections.size / sections.length) * 100)}%</span>
            </div>
            <Progress value={(completedSections.size / sections.length) * 100} className="h-1 mt-2 bg-white/5" />
          </div>

          <div className="space-y-1">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setSelectedSectionId(section.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
                  selectedSectionId === section.id
                    ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
                    : "text-gray-400 hover:bg-white/5"
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                  completedSections.has(section.id)
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : selectedSectionId === section.id
                    ? "border-indigo-400 text-indigo-300"
                    : "border-gray-600 text-gray-500"
                }`}>
                  {completedSections.has(section.id) ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{section.title}</div>
                  <div className="text-[10px] opacity-60 flex items-center gap-1">
                    <span className="capitalize">{section.intent.type}</span>
                    <span>•</span>
                    <span className="capitalize">{section.intent.depth}</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedSectionId === section.id ? "rotate-90 text-indigo-400" : "opacity-0 group-hover:opacity-100"}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Section Details */}
      <div className="flex-1 flex flex-col gap-6">
        <AnimatePresence mode="wait">
          {selectedSection ? (
            <motion.div
              key={selectedSection.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="glass rounded-3xl p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Sparkles className="w-32 h-32" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 border-none px-3 py-1">
                      Section {selectedSection.order + 1}
                    </Badge>
                    <Badge variant="outline" className="border-white/10 text-gray-400 px-3 py-1 uppercase text-[10px] tracking-widest font-bold">
                      {selectedSection.intent.type} • {selectedSection.intent.depth}
                    </Badge>
                  </div>

                  <h1 className="text-3xl font-bold text-white mb-6">{selectedSection.title}</h1>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/20 mt-1">
                          <Target className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Learning Objective</h4>
                          <p className="text-gray-300 leading-relaxed text-sm">
                            {selectedSection.learningObjective}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20 mt-1">
                          <Lightbulb className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key Concepts</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedSection.keyConcepts.map((concept, i) => (
                              <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400 border border-white/5">
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="glass bg-white/5 p-6 rounded-2xl border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Theory & Context</h4>
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed mb-4">
                        {selectedResources?.theory.content}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedResources?.theory.relatedTopics.map((topic, i) => (
                          <span key={i} className="text-[10px] text-indigo-400/70 hover:text-indigo-400 transition-colors cursor-pointer">
                            #{topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Best Video Recommendation */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        Primary Recommendation
                      </h3>
                      <button
                        onClick={() => toggleComplete(selectedSection.id)}
                        className={`text-sm px-4 py-1.5 rounded-full transition-all ${
                          completedSections.has(selectedSection.id)
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        {completedSections.has(selectedSection.id) ? "Completed" : "Mark as Done"}
                      </button>
                    </div>

                    {primaryVideo ? (
                      <div className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-all duration-500">
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={primaryVideo.thumbnail}
                            alt={primaryVideo.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                          <button
                            onClick={() => onPlayVideo?.(primaryVideo)}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                              <Play className="w-8 h-8 fill-current" />
                            </div>
                          </button>
                          
                          {/* Match Confidence Score */}
                          <div className="absolute top-4 right-4">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="glass bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                                    <span className="text-xs font-bold text-white">{primaryVideo.matchConfidence}% Match</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="glass border-white/10 text-xs p-3 max-w-[200px]">
                                  <p className="font-bold mb-1">AI Recommendation Insight:</p>
                                  <p className="text-gray-400 leading-tight">{primaryVideo.matchExplanation}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          <div className="absolute bottom-4 right-4 flex gap-2">
                            <Badge className="bg-black/60 backdrop-blur-md text-white border-none flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {primaryVideo.duration}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-6 bg-white/[0.02]">
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                                {primaryVideo.title}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>{primaryVideo.channel}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {primaryVideo.views?.toLocaleString()} views</span>
                              </div>
                            </div>
                            <a 
                              href={primaryVideo.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          </div>

                          {/* Transcript Highlights */}
                          {primaryVideo.transcriptHighlights && primaryVideo.transcriptHighlights.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Info className="w-3 h-3" />
                                Transcript Highlights
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {primaryVideo.transcriptHighlights.map((hl, i) => (
                                  <button
                                    key={i}
                                    className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-lg text-xs transition-colors flex items-center gap-2"
                                  >
                                    <span className="font-mono text-[10px] opacity-60">
                                      {Math.floor(hl.timestamp / 60)}:{(hl.timestamp % 60).toString().padStart(2, '0')}
                                    </span>
                                    <span>{hl.text}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center glass rounded-2xl border-white/5 text-gray-500 italic">
                        <Search className="w-8 h-8 mb-4 opacity-20" />
                        Fetching best match for this section...
                      </div>
                    )}
                  </div>

                  {/* Supporting Resources */}
                  {secondaryVideos && secondaryVideos.length > 0 && (
                    <div className="mt-12">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Supporting Theory & Depth</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {secondaryVideos.map((video) => (
                          <div 
                            key={video.id}
                            onClick={() => onPlayVideo?.(video)}
                            className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer group"
                          >
                            <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                              <img src={video.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                <Play className="w-6 h-6 text-white fill-current" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-white text-sm font-bold truncate mb-1 group-hover:text-indigo-300 transition-colors">
                                {video.title}
                              </h5>
                              <p className="text-gray-500 text-[10px] mb-2">{video.channel}</p>
                              <div className="flex items-center gap-2">
                                <div className="text-[10px] text-indigo-400 font-bold">{video.matchConfidence}% Match</div>
                                <span className="text-gray-600 text-[10px]">•</span>
                                <div className="text-[10px] text-gray-500">{video.duration}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 italic">
              Select a section to begin learning
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
