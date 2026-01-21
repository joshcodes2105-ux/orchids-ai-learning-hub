"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { POPULAR_TOPICS } from "@/lib/constants";

interface SearchBarProps {
  onSearch: (topic: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTopics = POPULAR_TOPICS.filter((topic) =>
    topic.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleTopicClick = (topic: string) => {
    setQuery(topic);
    onSearch(topic);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          className={`relative rounded-2xl transition-all duration-300 ${
            isFocused ? "glow-border" : ""
          }`}
          animate={{
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 blur-xl opacity-50" />
          
          <div className="relative glass rounded-2xl overflow-hidden">
            <div className="flex items-center px-6 py-4">
              <Search className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
              
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  setIsFocused(true);
                  setShowSuggestions(true);
                }}
                onBlur={() => setIsFocused(false)}
                placeholder="What do you want to learn today?"
                className="flex-1 bg-transparent text-lg text-white placeholder-gray-400 outline-none"
                disabled={isLoading}
              />
              
              <motion.button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="ml-4 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Search
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showSuggestions && query && filteredTopics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-50"
            >
              {filteredTopics.map((topic, index) => (
                <motion.button
                  key={topic}
                  type="button"
                  onClick={() => handleTopicClick(topic)}
                  className="w-full px-6 py-3 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-200">{topic}</span>
                  <ArrowRight className="w-4 h-4 text-gray-500 ml-auto" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <span className="text-sm text-gray-500 mr-2">Popular:</span>
        {POPULAR_TOPICS.slice(0, 4).map((topic, index) => (
          <motion.button
            key={topic}
            onClick={() => handleTopicClick(topic)}
            className="px-4 py-1.5 text-sm text-gray-300 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {topic}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
