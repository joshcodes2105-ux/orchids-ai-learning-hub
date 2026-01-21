"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SearchBar } from "@/components/SearchBar";
import { ResultsGrid } from "@/components/ResultsGrid";
import { SessionPanel } from "@/components/SessionPanel";
import { LoadingState } from "@/components/LoadingState";
import { Chatbot, ChatButton } from "@/components/Chatbot";
import { FileUpload } from "@/components/FileUpload";
import { FileResults } from "@/components/FileResults";
import {
  LearningResource,
  SearchSession,
  ProcessingStage,
  ExtractedSection,
  SectionResources,
} from "@/lib/types";
import {
  getStoredSession,
  addSearchSession,
  toggleBookmark,
  clearHistory,
  isBookmarked,
} from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles, Upload, Search } from "lucide-react";

type ViewMode = "search" | "upload" | "file-results";

export default function Home() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<SearchSession[]>([]);
  const [bookmarks, setBookmarks] = useState<LearningResource[]>([]);
  const [isSessionPanelOpen, setIsSessionPanelOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>("search");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>("uploading");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingError, setProcessingError] = useState<string | undefined>();

  const [fileName, setFileName] = useState("");
  const [overallTopic, setOverallTopic] = useState("");
  const [sections, setSections] = useState<ExtractedSection[]>([]);
  const [sectionResources, setSectionResources] = useState<SectionResources[]>([]);

  useEffect(() => {
    const stored = getStoredSession();
    setSessions(stored.sessions);
    setBookmarks(stored.bookmarks);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = useCallback(async (topic: string) => {
    setIsLoading(true);
    setCurrentTopic(topic);
    setViewMode("search");

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      const resourcesWithBookmarks = data.resources.map((r: LearningResource) => ({
        ...r,
        bookmarked: isBookmarked(r.id),
      }));

      setResources(resourcesWithBookmarks);

      const newSession = addSearchSession(topic, resourcesWithBookmarks);
      setSessions((prev) =>
        [newSession, ...prev.filter((s) => s.id !== newSession.id)].slice(0, 20)
      );
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBookmark = useCallback((resource: LearningResource) => {
    const isNowBookmarked = toggleBookmark(resource);

    setResources((prev) =>
      prev.map((r) =>
        r.id === resource.id ? { ...r, bookmarked: isNowBookmarked } : r
      )
    );

    if (isNowBookmarked) {
      setBookmarks((prev) => [...prev, { ...resource, bookmarked: true }]);
    } else {
      setBookmarks((prev) => prev.filter((b) => b.id !== resource.id));
    }
  }, []);

  const handleSummarize = useCallback(
    async (resource: LearningResource) => {
      try {
        const response = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resourceId: resource.id,
            title: resource.title,
            topic: currentTopic,
          }),
        });

        const data = await response.json();

        setResources((prev) =>
          prev.map((r) =>
            r.id === resource.id ? { ...r, summary: data.summary } : r
          )
        );
      } catch (error) {
        console.error("Summarize failed:", error);
      }
    },
    [currentTopic]
  );

  const handleSelectSession = useCallback((session: SearchSession) => {
    setCurrentTopic(session.topic);
    setResources(
      session.resources.map((r) => ({
        ...r,
        bookmarked: isBookmarked(r.id),
      }))
    );
    setIsSessionPanelOpen(false);
    setViewMode("search");
  }, []);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setSessions([]);
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessingFile(true);
    setProcessingError(undefined);
    setProcessingStage("uploading");
    setProcessingProgress(10);

    try {
      await new Promise((r) => setTimeout(r, 500));
      setProcessingStage("extracting");
      setProcessingProgress(25);

      const formData = new FormData();
      formData.append("file", file);

      const processResponse = await fetch("/api/process-file", {
        method: "POST",
        body: formData,
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.error || "Failed to process file");
      }

      const processData = await processResponse.json();

      setProcessingStage("understanding");
      setProcessingProgress(50);
      await new Promise((r) => setTimeout(r, 500));

      setProcessingStage("sectioning");
      setProcessingProgress(65);
      await new Promise((r) => setTimeout(r, 500));

      setProcessingStage("fetching");
      setProcessingProgress(80);

      const resourcesResponse = await fetch("/api/section-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: processData.sections }),
      });

      if (!resourcesResponse.ok) {
        throw new Error("Failed to fetch resources for sections");
      }

      const resourcesData = await resourcesResponse.json();

      setProcessingProgress(100);
      setProcessingStage("complete");

      setFileName(processData.fileName);
      setOverallTopic(processData.overallTopic);
      setSections(processData.sections);
      setSectionResources(resourcesData.sectionResources);
      setCurrentTopic(processData.overallTopic);

      await new Promise((r) => setTimeout(r, 500));
      setViewMode("file-results");
      setIsProcessingFile(false);
    } catch (error) {
      console.error("File processing failed:", error);
      setProcessingStage("error");
      setProcessingError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setIsProcessingFile(false);
    }
  }, []);

  const handleCancelUpload = useCallback(() => {
    setIsProcessingFile(false);
    setProcessingStage("uploading");
    setProcessingProgress(0);
    setProcessingError(undefined);
  }, []);

  const handleBackFromFileResults = useCallback(() => {
    setViewMode("upload");
    setSections([]);
    setSectionResources([]);
    setFileName("");
    setOverallTopic("");
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasResults = resources.length > 0;
  const showFileResults = viewMode === "file-results" && sections.length > 0;

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar onHistoryClick={() => setIsSessionPanelOpen(true)} />

      <main className="relative z-10 pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {showFileResults ? (
              <motion.div
                key="file-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <FileResults
                  fileName={fileName}
                  overallTopic={overallTopic}
                  sections={sections}
                  sectionResources={sectionResources}
                  onBack={handleBackFromFileResults}
                  onBookmark={handleBookmark}
                />
              </motion.div>
            ) : !hasResults && !isLoading ? (
              <motion.div
                key="hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-[70vh] flex flex-col items-center justify-center"
              >
                <Hero />

                <div className="w-full max-w-2xl mx-auto mb-8">
                  <div className="flex justify-center gap-2 mb-6">
                    <button
                      onClick={() => setViewMode("search")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        viewMode === "search"
                          ? "bg-indigo-500/20 text-indigo-300"
                          : "text-gray-400 hover:bg-white/5"
                      }`}
                    >
                      <Search className="w-4 h-4" />
                      Search Topic
                    </button>
                    <button
                      onClick={() => setViewMode("upload")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        viewMode === "upload"
                          ? "bg-indigo-500/20 text-indigo-300"
                          : "text-gray-400 hover:bg-white/5"
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      Upload File
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {viewMode === "search" ? (
                    <motion.div
                      key="search-mode"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="w-full"
                    >
                      <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload-mode"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="w-full"
                    >
                      <FileUpload
                        onFileSelect={handleFileSelect}
                        isProcessing={isProcessingFile}
                        stage={processingStage}
                        progress={processingProgress}
                        error={processingError}
                        onCancel={handleCancelUpload}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="mb-12"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm text-gray-400">
                      Searching for the best resources
                    </span>
                  </div>
                  <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                </motion.div>

                {isLoading ? (
                  <LoadingState />
                ) : (
                  <ResultsGrid
                    resources={resources}
                    topic={currentTopic}
                    onBookmark={handleBookmark}
                    onSummarize={handleSummarize}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <SessionPanel
        sessions={sessions}
        bookmarks={bookmarks}
        isOpen={isSessionPanelOpen}
        onClose={() => setIsSessionPanelOpen(false)}
        onSelectSession={handleSelectSession}
        onClearHistory={handleClearHistory}
      />

      {(hasResults || showFileResults) && !isChatOpen && currentTopic && (
        <ChatButton onClick={() => setIsChatOpen(true)} topic={currentTopic} />
      )}

      <Chatbot
        topic={currentTopic || overallTopic}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 left-6 p-3 glass rounded-full text-white hover:bg-white/10 transition-colors z-40"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="relative z-10 py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">
            Built with AI-powered curation • Find the best learning resources
            instantly
          </p>
        </div>
      </footer>
    </div>
  );
}
