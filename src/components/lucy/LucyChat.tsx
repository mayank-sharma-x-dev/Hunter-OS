import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { 
  MessageCircle, X, Send, Sparkles, MapPin, Bot, User, 
  Minimize2, Maximize2, Loader2 
} from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { useTasks } from "@/hooks/useTasks";
import { useCampus } from "@/hooks/useCampus";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lucy-ai`;

export const LucyChat = () => {
  const { user } = useAuth();
  const { currentLevel, currentExp, rankInfo, stats } = usePlayerStats();
  const { pendingTasks, completedTasks, dailyTasks, weeklyTasks } = useTasks();
  const { campus, setCampus, detectLocation, locationLoading } = useCampus();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Hey there, Hunter! 🌟 I'm **Lucy**, your AI campus advisor and growth coach!\n\nI know everything about your quests, levels, and progress. I can also help you navigate campus life!\n\n**Try asking me:**\n- "What quests should I focus on today?"\n- "Help me find places on campus"\n- "How can I level up faster?"\n- "Give me a study plan"\n\nWhat can I help you with? ✨`
      }]);
    }
  }, [isOpen]);

  const buildUserContext = useCallback(() => {
    return {
      level: currentLevel,
      exp: currentExp,
      rank: rankInfo?.rank,
      pendingQuests: pendingTasks.length,
      completedToday: completedTasks.length,
      dailyQuests: dailyTasks.map(t => ({ title: t.title, completed: t.is_completed })),
      weeklyQuests: weeklyTasks.map(t => ({ title: t.title, completed: t.is_completed })),
      streak: stats?.current_streak || 0,
      longestStreak: stats?.longest_streak || 0,
      campus: campus || "Not set",
    };
  }, [currentLevel, currentExp, rankInfo, pendingTasks, completedTasks, dailyTasks, weeklyTasks, stats, campus]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    soundManager.playClick();
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: allMessages,
          userContext: buildUserContext(),
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: "Connection failed" }));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { 
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `Oops! ${err.message || "Something went wrong."} Let me try again in a moment! 💫` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOpen = () => {
    soundManager.playClick();
    setIsOpen(!isOpen);
    setShowPulse(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Open Lucy AI"
      >
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-60 blur-md group-hover:opacity-100 transition-opacity animate-spin-slow" />
        
        {/* Button */}
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </div>
        
        {/* Label */}
        {showPulse && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card border border-primary/30 rounded-lg px-3 py-1.5 text-xs font-ui text-foreground shadow-lg animate-bounce">
            Hey! I'm Lucy ✨
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-card" />
          </div>
        )}
      </button>
    );
  }

  return (
    <div className={`fixed z-50 transition-all duration-300 ${
      isExpanded 
        ? "inset-4 md:inset-8" 
        : "bottom-6 right-6 w-[380px] h-[550px] max-h-[80vh]"
    }`}>
      {/* Chat container */}
      <div className="w-full h-full rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/20 via-secondary/10 to-accent/20 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-card" />
            </div>
            <div>
              <h3 className="font-game text-sm font-bold text-foreground">LUCY AI</h3>
              <p className="text-[10px] text-muted-foreground font-ui">Campus Advisor • Online</p>
            </div>
          </div>
          <div className="flex gap-1">
            {campus && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-ui text-primary mr-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[80px]">{campus}</span>
              </div>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={toggleOpen}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Campus setup banner */}
        {!campus && (
          <div className="p-2 bg-secondary/10 border-b border-secondary/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-ui text-secondary">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Set your campus for personalized guidance</span>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button 
                size="sm" 
                variant="ghost"
                className="h-6 text-[10px] px-2 text-secondary hover:bg-secondary/10"
                onClick={detectLocation}
                disabled={locationLoading}
              >
                {locationLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Auto-detect"}
              </Button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm font-ui ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted/60 text-foreground rounded-bl-sm border border-border/50"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_strong]:text-primary">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-secondary" />
                </div>
              )}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-muted/60 rounded-2xl rounded-bl-sm px-4 py-3 border border-border/50">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        {messages.length <= 1 && (
          <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
            {["What quests are pending?", "Help me study", "Campus info", "Motivate me!"].map(q => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                className="text-[10px] font-ui px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-border/50 bg-card/50">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask Lucy anything..."
              className="flex-1 h-9 text-sm bg-muted/30 border-primary/20 focus:border-primary rounded-xl"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              size="icon"
              disabled={isLoading || !input.trim()}
              className="h-9 w-9 rounded-xl bg-primary hover:bg-primary/80 transition-all"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
