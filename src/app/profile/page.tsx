"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  User,
  BookOpen,
  Settings,
  Search,
  Bookmark,
  Clock,
  FileText,
  TrendingUp,
  Calendar,
  Play,
  ExternalLink,
  Loader2,
  Camera,
  Save,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface ProfileStats {
  totalSearches: number;
  totalResourcesViewed: number;
  totalViews: number;
  totalBookmarks: number;
  totalFilesUploaded: number;
  completedSections: number;
  totalSections: number;
  completionRate: number;
}

interface TopTopic {
  topic: string;
  count: number;
}

interface ProfileData {
  stats: ProfileStats;
  topTopics: TopTopic[];
  sourceBreakdown: { youtube: number; article: number; blog: number };
  dailyActivity: Record<string, number>;
  recentTopics: string[];
}

interface HistoryItem {
  id: string;
  topic: string;
  created_at: string;
}

interface BookmarkItem {
  id: string;
  resource_id: string;
  resource_data: {
    title: string;
    source: string;
    url: string;
    thumbnail?: string;
  };
  created_at: string;
}

function ProfileContent() {
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "bookmarks" | "settings">(
    (tabParam as "overview" | "history" | "bookmarks" | "settings") || "overview"
  );
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam as "overview" | "history" | "bookmarks" | "settings");
    }
  }, [tabParam]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
    }
  }, [user]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, historyRes, bookmarksRes] = await Promise.all([
        fetch("/api/profile/stats"),
        fetch("/api/profile/history"),
        fetch("/api/profile/bookmarks"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setProfileData(data);
      }

      if (historyRes.ok) {
        const data = await historyRes.json();
        setHistory(data.history || []);
      }

      if (bookmarksRes.ok) {
        const data = await bookmarksRes.json();
        setBookmarks(data.bookmarks || []);
      }
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || editName === user?.name) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });

      if (response.ok) {
        updateUser({ name: editName });
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const openExternalUrl = (url: string) => {
    window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <Navbar />
        <main className="relative z-10 pt-24 pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Sign in to view your profile</h1>
            <p className="text-gray-400 mb-6">
              Create an account to track your learning progress and save resources.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "history", label: "History", icon: Clock },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="relative group">
                <img
                  src={user?.avatarUrl}
                  alt={user?.name}
                  className="w-20 h-20 rounded-2xl bg-indigo-500/20"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{user?.name}</h1>
                <p className="text-gray-400">{user?.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Member since {user?.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : ""}
                </p>
              </div>
            </div>

            <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-indigo-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  </div>
                ) : profileData ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard
                        icon={Search}
                        label="Searches"
                        value={profileData.stats.totalSearches}
                        color="indigo"
                      />
                      <StatCard
                        icon={Play}
                        label="Resources Viewed"
                        value={profileData.stats.totalResourcesViewed}
                        color="purple"
                      />
                      <StatCard
                        icon={Bookmark}
                        label="Bookmarks"
                        value={profileData.stats.totalBookmarks}
                        color="pink"
                      />
                      <StatCard
                        icon={FileText}
                        label="Files Uploaded"
                        value={profileData.stats.totalFilesUploaded}
                        color="cyan"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-indigo-400" />
                          Top Topics
                        </h3>
                        {profileData.topTopics.length > 0 ? (
                          <div className="space-y-3">
                            {profileData.topTopics.slice(0, 5).map((topic, index) => (
                              <div key={topic.topic} className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                                <div className="flex-1">
                                  <p className="text-white text-sm capitalize">{topic.topic}</p>
                                  <div className="h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                      style={{
                                        width: `${(topic.count / profileData.topTopics[0].count) * 100}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                                <span className="text-sm text-gray-400">{topic.count}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">No topics searched yet</p>
                        )}
                      </div>

                      <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-purple-400" />
                          Content Breakdown
                        </h3>
                        <div className="space-y-4">
                          <ContentBar
                            label="YouTube Videos"
                            count={profileData.sourceBreakdown.youtube}
                            total={
                              profileData.sourceBreakdown.youtube +
                              profileData.sourceBreakdown.article +
                              profileData.sourceBreakdown.blog
                            }
                            color="red"
                          />
                          <ContentBar
                            label="Articles"
                            count={profileData.sourceBreakdown.article}
                            total={
                              profileData.sourceBreakdown.youtube +
                              profileData.sourceBreakdown.article +
                              profileData.sourceBreakdown.blog
                            }
                            color="blue"
                          />
                          <ContentBar
                            label="Blog Posts"
                            count={profileData.sourceBreakdown.blog}
                            total={
                              profileData.sourceBreakdown.youtube +
                              profileData.sourceBreakdown.article +
                              profileData.sourceBreakdown.blog
                            }
                            color="green"
                          />
                        </div>
                      </div>
                    </div>

                    {profileData.recentTopics.length > 0 && (
                      <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-cyan-400" />
                          Recent Searches
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData.recentTopics.map((topic, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-sm capitalize"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-12">Start learning to see your stats!</p>
                )}
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    Search History
                  </h3>
                  {history.length > 0 ? (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Search className="w-4 h-4 text-gray-400" />
                            <span className="text-white capitalize">{item.topic}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {format(new Date(item.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-8">No search history yet</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "bookmarks" && (
              <motion.div
                key="bookmarks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-pink-400" />
                    Saved Resources
                  </h3>
                  {bookmarks.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {bookmarks.map((bookmark) => (
                        <div
                          key={bookmark.id}
                          onClick={() => openExternalUrl(bookmark.resource_data.url)}
                          className="flex gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          {bookmark.resource_data.thumbnail && (
                            <img
                              src={bookmark.resource_data.thumbnail}
                              alt=""
                              className="w-24 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium line-clamp-2">
                              {bookmark.resource_data.title}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  bookmark.resource_data.source === "youtube"
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-blue-500/20 text-blue-400"
                                }`}
                              >
                                {bookmark.resource_data.source}
                              </span>
                              <ExternalLink className="w-3 h-3 text-gray-500" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-8">No bookmarks yet</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="glass rounded-2xl p-6 max-w-xl">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-400" />
                    Profile Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving || editName === user?.name}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Search;
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-400",
    purple: "from-purple-500/20 to-purple-500/5 text-purple-400",
    pink: "from-pink-500/20 to-pink-500/5 text-pink-400",
    cyan: "from-cyan-500/20 to-cyan-500/5 text-cyan-400",
  };

  return (
    <div className={`glass rounded-2xl p-5 bg-gradient-to-br ${colorClasses[color]}`}>
      <Icon className="w-6 h-6 mb-3" />
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

function ContentBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const colorClasses: Record<string, string> = {
    red: "from-red-500 to-red-600",
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-500">{count}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
