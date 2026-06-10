import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookOpen, Calendar, Save, Trash2, Sparkles, Quote, Scroll, Feather } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { getDailyQuote, getRandomQuote } from "@/lib/quotes";
import { format } from "date-fns";
import DarkModeToggle from "@/components/DarkModeToggle";

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: string;
  createdAt: Date;
}

const moods = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "💪", label: "Motivated" },
  { emoji: "🤔", label: "Thoughtful" },
  { emoji: "😤", label: "Determined" },
  { emoji: "😔", label: "Low" },
  { emoji: "🎯", label: "Focused" },
  { emoji: "✨", label: "Grateful" },
];

const Journal = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [quote, setQuote] = useState(getDailyQuote());
  const [isWriting, setIsWriting] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayFormatted = format(new Date(), "EEEE, MMMM dd, yyyy");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const savedEntries = localStorage.getItem("soloLevelingJournal");
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("soloLevelingJournal", JSON.stringify(entries));
  }, [entries]);

  const todayEntry = entries.find((e) => e.date === today);

  useEffect(() => {
    if (todayEntry) {
      setCurrentEntry(todayEntry.content);
      setSelectedMood(todayEntry.mood || null);
    }
  }, [todayEntry]);

  const handleSave = () => {
    soundManager.playClick();
    if (!currentEntry.trim()) return;

    const newEntry: JournalEntry = {
      id: todayEntry?.id || Date.now().toString(),
      date: today,
      content: currentEntry,
      mood: selectedMood || undefined,
      createdAt: todayEntry?.createdAt || new Date(),
    };

    if (todayEntry) {
      setEntries(entries.map((e) => (e.date === today ? newEntry : e)));
    } else {
      setEntries([newEntry, ...entries]);
    }
    setIsWriting(false);
  };

  const handleDelete = (id: string) => {
    soundManager.playClick();
    setEntries(entries.filter((e) => e.id !== id));
    if (todayEntry?.id === id) {
      setCurrentEntry("");
      setSelectedMood(null);
    }
  };

  const refreshQuote = () => {
    soundManager.playClick();
    setQuote(getRandomQuote());
  };

  const handleBack = () => {
    soundManager.playClick();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 transition-colors duration-300">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <DarkModeToggle />
        </div>
        
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center">
            <Scroll className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
              Daily Journal
            </h1>
            <p className="text-muted-foreground text-sm">Reflect on your day, track your thoughts</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Card */}
        <Card className="lg:col-span-3 p-6 bg-card border border-primary/30">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
              <Quote className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-lg text-foreground italic mb-3 leading-relaxed">
                "{quote.quote}"
              </p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">— {quote.character}</span>
                  <span className="text-muted-foreground">, {quote.anime}</span>
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshQuote}
                  className="text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  New Quote
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Today's Entry */}
        <Card className="lg:col-span-2 p-6 bg-card border border-border">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center">
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-medium text-foreground">
                {todayFormatted}
              </h2>
            </div>
            {todayEntry && (
              <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 font-medium">
                ✓ Saved
              </span>
            )}
          </div>

          {/* Mood Selection */}
          <div className="mb-5">
            <p className="text-sm text-muted-foreground mb-3">How are you feeling today?</p>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedMood(mood.emoji);
                  }}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    selectedMood === mood.emoji
                      ? "bg-primary/10 border-primary/50 text-foreground"
                      : "bg-muted/50 border-border text-muted-foreground hover:border-primary/30 hover:bg-muted"
                  }`}
                >
                  <span className="mr-2 text-lg">{mood.emoji}</span>
                  <span className="text-sm">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Journal Writing Area */}
          <div className="relative">
            <Textarea
              value={currentEntry}
              onChange={(e) => {
                setCurrentEntry(e.target.value);
                setIsWriting(true);
              }}
              placeholder="Write about your day, your thoughts, your goals, what you're grateful for..."
              className="min-h-[250px] bg-background border-border focus:border-primary focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground text-foreground"
            />
            {isWriting && (
              <div className="absolute bottom-3 right-3">
                <Feather className="w-5 h-5 text-primary animate-pulse" />
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSave}
              disabled={!currentEntry.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Entry
            </Button>
          </div>
        </Card>

        {/* Previous Entries */}
        <Card className="p-6 bg-card border border-border">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </div>
            Past Entries
          </h2>
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mx-auto mb-4">
                  <Scroll className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-foreground text-sm">
                  No entries yet.
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Start writing your first entry!
                </p>
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg border transition-all group ${
                    entry.date === today
                      ? "bg-primary/5 border-primary/30"
                      : "bg-muted/30 border-border hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {entry.mood && <span className="text-lg">{entry.mood}</span>}
                      <span className="text-sm font-medium text-foreground">
                        {format(new Date(entry.date), "MMM dd, yyyy")}
                      </span>
                      {entry.date === today && (
                        <span className="text-xs text-primary font-medium">Today</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entry.id);
                      }}
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {entry.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Journal;
