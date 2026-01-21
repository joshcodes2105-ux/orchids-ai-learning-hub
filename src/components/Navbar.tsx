"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, History, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { UserMenu } from "./UserMenu";
import { AuthModal } from "./AuthModal";

interface NavbarProps {
  onHistoryClick?: () => void;
}

export function Navbar({ onHistoryClick }: NavbarProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="glass border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                  <Brain className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="text-xl font-bold text-white">
                  Learn<span className="gradient-text">AI</span>
                </span>
              </a>

              <div className="flex items-center gap-4">
                {onHistoryClick && (
                  <motion.button
                    onClick={onHistoryClick}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <History className="w-4 h-4" />
                    History
                  </motion.button>
                )}

                {!isLoading && (
                  <>
                    {isAuthenticated ? (
                      <UserMenu />
                    ) : (
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => openAuth("login")}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <LogIn className="w-4 h-4" />
                          Sign In
                        </motion.button>
                        <motion.button
                          onClick={() => openAuth("signup")}
                          className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Get Started
                        </motion.button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
