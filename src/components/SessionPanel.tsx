"use client";

import { motion, AnimatePresence } from "framer-motion";
import { History, Clock, ChevronRight, Trash2, X, BookmarkIcon } from "lucide-react";
import { SearchSession, LearningResource } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface SessionPanelProps {
  sessions: SearchSession[];
  bookmarks: LearningResource[];
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (session: SearchSession) => void;
  onClearHistory: () => void;
}

export function SessionPanel({
  sessions,
  bookmarks,
  isOpen,
  onClose,
  onSelectSession,
  onClearHistory,
}: SessionPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md glass z-50 overflow-hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20">
                    <History className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Learning History</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {bookmarks.length > 0 && (
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                      <BookmarkIcon className="w-4 h-4 text-yellow-400" />
                      <h3 className="text-sm font-medium text-gray-300">Bookmarked Resources</h3>
                    </div>
                    <div className="space-y-2">
                      {bookmarks.slice(0, 5).map((resource) => (
                        <motion.a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          whileHover={{ x: 4 }}
                        >
                          <img
                            src={resource.thumbnail}
                            alt=""
                            className="w-12 h-8 object-cover rounded"
                          />
                          <span className="text-sm text-gray-200 truncate flex-1">
                            {resource.title}
                          </span>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-300">Recent Searches</h3>
                    {sessions.length > 0 && (
                      <button
                        onClick={onClearHistory}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear
                      </button>
                    )}
                  </div>

                  {sessions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-500">No search history yet</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Your learning journey starts here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sessions.map((session, index) => (
                        <motion.button
                          key={session.id}
                          onClick={() => onSelectSession(session)}
                          className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group text-left"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex-1">
                            <p className="text-white font-medium mb-1">{session.topic}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>
                                {formatDistanceToNow(session.timestamp, { addSuffix: true })}
                              </span>
                              <span className="text-gray-600">•</span>
                              <span>{session.resources.length} resources</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
