"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, AlertTriangle, RefreshCw } from "lucide-react";
import { LearningResource } from "@/lib/types";

interface VideoModalProps {
  video: LearningResource | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ video, isOpen, onClose }: VideoModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && video) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isOpen, video]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    let videoId: string | null = null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        videoId = match[1];
        break;
      }
    }

    if (!videoId && url.includes("youtube")) {
      const urlParams = new URLSearchParams(url.split("?")[1] || "");
      videoId = urlParams.get("v");
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    }

    return null;
  };

  const getWatchUrl = (url: string): string => {
    if (!url) return "#";

    const embedUrl = getEmbedUrl(url);
    if (embedUrl) {
      const videoId = embedUrl.match(/embed\/([a-zA-Z0-9_-]{11})/)?.[1];
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }

    return url;
  };

  const openExternal = () => {
    if (video?.url) {
      const watchUrl = getWatchUrl(video.url);
      window.parent.postMessage(
        { type: "OPEN_EXTERNAL_URL", data: { url: watchUrl } },
        "*"
      );
    }
  };

  if (!video) return null;

  const embedUrl = getEmbedUrl(video.url);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl z-10"
          >
            <div className="absolute -top-12 right-0 flex items-center gap-3">
              <button
                onClick={openExternal}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in YouTube
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
              <div className="aspect-video relative bg-black">
                {isLoading && !hasError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                      <p className="text-gray-400 text-sm">Loading video...</p>
                    </div>
                  </div>
                )}

                {hasError || !embedUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="flex flex-col items-center gap-4 text-center p-8">
                      <div className="p-4 rounded-full bg-yellow-500/20">
                        <AlertTriangle className="w-8 h-8 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Video Unavailable
                        </h3>
                        <p className="text-gray-400 text-sm max-w-md">
                          This video cannot be played in the embedded player. It may
                          be restricted, deleted, or region-locked.
                        </p>
                      </div>
                      <button
                        onClick={openExternal}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white font-medium transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Try Opening in YouTube
                      </button>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={embedUrl}
                    title={video.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                  />
                )}
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">
                  {video.title}
                </h2>
                <p className="text-gray-400 text-sm">
                  {video.channel || video.author}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
