import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { BookOpen, Save, Plus, Trash2 } from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  content: string;
  chapter: number;
}

export const CharacterStory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("character_story")
        .select("*")
        .eq("user_id", user.id)
        .order("chapter");
      if (data && data.length > 0) {
        setChapters(data as any[]);
        setActiveChapter(data[0].id);
        setEditTitle(data[0].title);
        setEditContent(data[0].content);
      }
    };
    load();
  }, [user]);

  const selectChapter = (ch: Chapter) => {
    setActiveChapter(ch.id);
    setEditTitle(ch.title);
    setEditContent(ch.content);
  };

  const save = async () => {
    if (!user || !activeChapter) return;
    setSaving(true);
    await supabase
      .from("character_story")
      .update({ title: editTitle, content: editContent, updated_at: new Date().toISOString() })
      .eq("id", activeChapter);
    setChapters(prev => prev.map(c => c.id === activeChapter ? { ...c, title: editTitle, content: editContent } : c));
    toast({ title: "📖 Chapter Saved!" });
    setSaving(false);
  };

  const addChapter = async () => {
    if (!user) return;
    const newNum = chapters.length + 1;
    const { data } = await supabase
      .from("character_story")
      .insert({ user_id: user.id, title: `Chapter ${newNum}: New Beginning`, chapter: newNum, content: "" })
      .select()
      .single();
    if (data) {
      const ch = data as any;
      setChapters(prev => [...prev, ch]);
      selectChapter(ch);
    }
  };

  const deleteChapter = async (id: string) => {
    await supabase.from("character_story").delete().eq("id", id);
    const remaining = chapters.filter(c => c.id !== id);
    setChapters(remaining);
    if (activeChapter === id) {
      if (remaining.length > 0) selectChapter(remaining[0]);
      else { setActiveChapter(null); setEditTitle(""); setEditContent(""); }
    }
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-gold/10 to-primary/5 backdrop-blur-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="font-game text-lg font-bold text-foreground">My Character Story</h3>
              <p className="font-ui text-xs text-muted-foreground">Write your journey, define your character arc</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={addChapter} className="gap-1.5 rounded-full">
            <Plus className="w-3.5 h-3.5" /> New Chapter
          </Button>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-ui text-muted-foreground mb-3">Every legend starts with Chapter 1</p>
            <Button onClick={addChapter} className="rounded-full gap-2">
              <Plus className="w-4 h-4" /> Begin Your Story
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chapter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {chapters.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => selectChapter(ch)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-game transition-all ${
                    activeChapter === ch.id
                      ? "bg-gold/20 text-gold border border-gold/30"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  Ch.{ch.chapter}
                </button>
              ))}
            </div>

            {activeChapter && (
              <div className="space-y-3">
                <Input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="font-game text-lg border-none bg-transparent px-0 focus-visible:ring-0"
                  placeholder="Chapter Title..."
                />
                <Textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="min-h-[200px] font-ui text-sm bg-background/30 border-border/30 resize-none"
                  placeholder="Write your story... Who are you becoming? What challenges have you faced? What skills are you mastering?"
                />
                <div className="flex justify-between">
                  <Button size="sm" variant="ghost" onClick={() => deleteChapter(activeChapter)} className="text-destructive hover:text-destructive gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                  <Button size="sm" onClick={save} disabled={saving} className="rounded-full gap-1.5">
                    <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save Chapter"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
