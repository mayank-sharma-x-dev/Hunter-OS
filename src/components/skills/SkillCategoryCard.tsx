import { useState } from "react";
import { ChevronRight, Play, CheckCircle2, Youtube, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import type { SkillCategory, SubSkill } from "@/lib/lifeSkills";
import { getSkillSearchQuery } from "@/lib/lifeSkills";

interface VideoSuggestion {
  title: string;
  channel: string;
  description: string;
  searchUrl: string;
  duration: string;
  difficulty: string;
}

interface Props {
  category: SkillCategory;
  getSkillLevel: (key: string) => number;
  logPractice: (key: string, category: string, text: string) => Promise<void>;
  practiceLog: Record<string, any[]>;
}

export const SkillCategoryCard = ({ category, getSkillLevel, logPractice, practiceLog }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [activeSubSkill, setActiveSubSkill] = useState<string | null>(null);
  const [videos, setVideos] = useState<Record<string, VideoSuggestion[]>>({});
  const [loadingVideos, setLoadingVideos] = useState<string | null>(null);

  const totalSubSkills = category.subSkills.length;
  const practicedCount = category.subSkills.filter(s => (practiceLog[s.key]?.length || 0) > 0).length;
  const progress = (practicedCount / totalSubSkills) * 100;

  const fetchVideos = async (subSkill: SubSkill) => {
    if (videos[subSkill.key]) return;
    setLoadingVideos(subSkill.key);
    try {
      const { data, error } = await supabase.functions.invoke("skill-videos", {
        body: { skillName: category.name, subSkillName: subSkill.name, searchQuery: getSkillSearchQuery(category.key, subSkill.key) },
      });
      if (error) throw error;
      setVideos(prev => ({ ...prev, [subSkill.key]: data?.videos || [] }));
    } catch (e) {
      console.error("Error fetching videos:", e);
    } finally {
      setLoadingVideos(null);
    }
  };

  return (
    <div className={`rounded-2xl border border-border/50 bg-gradient-to-br ${category.gradient} backdrop-blur-sm overflow-hidden transition-all duration-300`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-foreground/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="text-3xl">{category.icon}</div>
          <div>
            <h3 className="font-game text-lg font-bold text-foreground">{category.name}</h3>
            <p className="font-ui text-sm text-muted-foreground">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-game text-sm text-muted-foreground">{practicedCount}/{totalSubSkills}</span>
          <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-90" : ""}`} />
        </div>
      </button>

      {/* Progress bar */}
      <div className="px-5 pb-2">
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Sub-skills */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3 animate-fade-in">
          {category.subSkills.map(sub => {
            const level = getSkillLevel(sub.key);
            const logs = practiceLog[sub.key] || [];
            const isActive = activeSubSkill === sub.key;

            return (
              <div key={sub.key} className="rounded-xl border border-border/30 bg-background/50 overflow-hidden">
                <button
                  onClick={() => { setActiveSubSkill(isActive ? null : sub.key); if (!isActive) fetchVideos(sub); }}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-game text-sm font-bold text-foreground">{sub.name}</h4>
                      {logs.length > 0 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                    <p className="font-ui text-xs text-muted-foreground mt-0.5">{sub.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-game text-muted-foreground">Lv.{level}/5</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i < level ? "bg-primary" : "bg-muted"}`} />
                      ))}
                    </div>
                  </div>
                </button>

                {isActive && (
                  <div className="px-4 pb-4 space-y-4 animate-fade-in">
                    {/* Practices */}
                    <div>
                      <h5 className="font-game text-xs text-muted-foreground mb-2 uppercase tracking-wider">Daily Practices</h5>
                      <div className="space-y-2">
                        {sub.practices.map((practice, i) => {
                          const done = logs.some((l: any) => l.text === practice);
                          return (
                            <button
                              key={i}
                              onClick={() => !done && logPractice(sub.key, category.key, practice)}
                              disabled={done}
                              className={`w-full text-left p-3 rounded-lg border text-sm font-ui flex items-center gap-3 transition-all ${
                                done
                                  ? "border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400"
                                  : "border-border/30 bg-background/30 text-foreground hover:border-primary/40 hover:bg-primary/5"
                              }`}
                            >
                              {done ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Play className="w-4 h-4 shrink-0 text-primary" />}
                              {practice}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Videos */}
                    <div>
                      <h5 className="font-game text-xs text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
                        <Youtube className="w-3.5 h-3.5 text-red-500" /> AI-Recommended Videos
                      </h5>
                      {loadingVideos === sub.key ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
                          <Loader2 className="w-4 h-4 animate-spin" /> Finding best videos...
                        </div>
                      ) : (videos[sub.key] || []).length > 0 ? (
                        <div className="space-y-2">
                          {(videos[sub.key] || []).map((vid, i) => (
                            <a
                              key={i}
                              href={vid.searchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-3 rounded-lg border border-border/30 bg-background/30 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                  <Youtube className="w-4 h-4 text-red-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-ui text-sm font-medium text-foreground line-clamp-1">{vid.title}</p>
                                  <p className="font-ui text-xs text-muted-foreground">{vid.channel} • {vid.duration}</p>
                                  <p className="font-ui text-xs text-muted-foreground mt-1">{vid.description}</p>
                                  <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${
                                    vid.difficulty === "beginner" ? "bg-green-500/10 text-green-600" :
                                    vid.difficulty === "intermediate" ? "bg-yellow-500/10 text-yellow-600" :
                                    "bg-red-500/10 text-red-600"
                                  }`}>{vid.difficulty}</span>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground p-3">Click to load video suggestions</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
