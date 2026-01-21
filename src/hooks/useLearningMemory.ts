"use client";

import { useCallback } from "react";
import { LearningResource } from "@/lib/types";

export function useLearningMemory() {
  const trackSearch = useCallback(
    async (topic: string, resources: LearningResource[]) => {
      try {
        await fetch("/api/profile/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, resources }),
        });
      } catch (error) {
        console.error("Failed to track search:", error);
      }
    },
    []
  );

  const trackView = useCallback(
    async (resource: LearningResource) => {
      try {
        await fetch("/api/profile/viewed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resourceId: resource.id,
            resourceData: {
              title: resource.title,
              source: resource.source,
              url: resource.url,
              thumbnail: resource.thumbnail,
              channel: resource.channel,
              author: resource.author,
            },
          }),
        });
      } catch (error) {
        console.error("Failed to track view:", error);
      }
    },
    []
  );

  const toggleBookmark = useCallback(
    async (resource: LearningResource): Promise<boolean | null> => {
      try {
        const response = await fetch("/api/profile/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resourceId: resource.id,
            resourceData: {
              title: resource.title,
              source: resource.source,
              url: resource.url,
              thumbnail: resource.thumbnail,
              channel: resource.channel,
              author: resource.author,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.bookmarked;
        }
        return null;
      } catch (error) {
        console.error("Failed to toggle bookmark:", error);
        return null;
      }
    },
    []
  );

  const trackFileUpload = useCallback(
    async (fileName: string, fileType: string, overallTopic: string, sections: unknown[]) => {
      try {
        await fetch("/api/profile/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName, fileType, overallTopic, sections }),
        });
      } catch (error) {
        console.error("Failed to track file upload:", error);
      }
    },
    []
  );

  return {
    trackSearch,
    trackView,
    toggleBookmark,
    trackFileUpload,
  };
}
