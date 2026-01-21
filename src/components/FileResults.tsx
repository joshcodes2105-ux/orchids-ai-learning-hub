"use client";

import { motion } from "framer-motion";
import { FileText, Layers, ArrowLeft, Download } from "lucide-react";
import { ExtractedSection, SectionResources, LearningResource } from "@/lib/types";
import { SectionCard } from "./SectionCard";

interface FileResultsProps {
  fileName: string;
  overallTopic: string;
  sections: ExtractedSection[];
  sectionResources: SectionResources[];
  onBack: () => void;
  onBookmark?: (resource: LearningResource) => void;
}

export function FileResults({
  fileName,
  overallTopic,
  sections,
  sectionResources,
  onBack,
  onBookmark,
}: FileResultsProps) {
  const resourcesMap = new Map(
    sectionResources.map((sr) => [sr.sectionId, sr])
  );

  const totalVideos = sectionResources.reduce(
    (acc, sr) => acc + sr.videos.length,
    0
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Upload another file</span>
        </button>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <FileText className="w-8 h-8 text-indigo-400" />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">
                {overallTopic}
              </h1>
              <p className="text-gray-400 text-sm mb-4">{fileName}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span className="text-gray-300">
                    {sections.length} Learning Sections
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                  <span className="text-gray-300">
                    {totalVideos} Resources Found
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Learning Sections
          </h2>
          <p className="text-sm text-gray-500">
            Click each section to view resources
          </p>
        </div>

        {sections.map((section, index) => (
          <SectionCard
            key={section.id}
            section={section}
            resources={resourcesMap.get(section.id)}
            index={index}
            onBookmark={onBookmark}
          />
        ))}
      </motion.div>
    </div>
  );
}
