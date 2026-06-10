import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Timer, Play, Pause, RotateCcw, Coffee, Brain, Flame,
  Plus, Trash2, Clock, BookOpen, ChevronRight, CheckCircle2
} from "lucide-react";
import { soundManager } from "@/lib/sounds";

interface StudyBlock {
  id: string;
  topic: string;
  duration: number; // minutes
  breakAfter: number; // minutes
  completed: boolean;
}

interface DeepFocusSessionProps {
  onSessionComplete?: (type: 'work' | 'break') => void;
}

const PRESET_SESSIONS = [
  {
    name: "Quick Focus",
    icon: "⚡",
    blocks: [
      { topic: "Study Block", duration: 25, breakAfter: 5 },
    ],
  },
  {
    name: "1-Hour Deep",
    icon: "🧠",
    blocks: [
      { topic: "Session 1", duration: 25, breakAfter: 5 },
      { topic: "Session 2", duration: 25, breakAfter: 5 },
    ],
  },
  {
    name: "3-Hour Marathon",
    icon: "🏔️",
    blocks: [
      { topic: "Block 1", duration: 50, breakAfter: 10 },
      { topic: "Block 2", duration: 50, breakAfter: 15 },
      { topic: "Block 3", duration: 50, breakAfter: 10 },
    ],
  },
  {
    name: "Full Day Grind",
    icon: "🔥",
    blocks: [
      { topic: "Morning 1", duration: 50, breakAfter: 10 },
      { topic: "Morning 2", duration: 50, breakAfter: 20 },
      { topic: "Afternoon 1", duration: 50, breakAfter: 10 },
      { topic: "Afternoon 2", duration: 50, breakAfter: 15 },
    ],
  },
];

const DeepFocusSession = ({ onSessionComplete }: DeepFocusSessionProps) => {
  const [blocks, setBlocks] = useState<StudyBlock[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Load stats
  useEffect(() => {
    const saved = localStorage.getItem('deepFocusStats');
    if (saved) {
      const data = JSON.parse(saved);
      setTotalFocusTime(data.totalFocusTime || 0);
      setSessionsCompleted(data.sessionsCompleted || 0);
    }
  }, []);

  // Save stats
  useEffect(() => {
    localStorage.setItem('deepFocusStats', JSON.stringify({ totalFocusTime, sessionsCompleted }));
  }, [totalFocusTime, sessionsCompleted]);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        if (!isBreak) setTotalFocusTime(prev => prev + 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0 && sessionStarted) {
      soundManager.playLevelUp();

      if (isBreak) {
        // Break finished, move to next block
        const nextIndex = currentBlockIndex + 1;
        if (nextIndex < blocks.length) {
          setCurrentBlockIndex(nextIndex);
          setTimeLeft(blocks[nextIndex].duration * 60);
          setIsBreak(false);
        } else {
          // All blocks done
          setIsRunning(false);
          setSessionStarted(false);
          setSessionsCompleted(prev => prev + 1);
          onSessionComplete?.('work');
        }
      } else {
        // Work block finished
        setBlocks(prev => prev.map((b, i) => i === currentBlockIndex ? { ...b, completed: true } : b));
        onSessionComplete?.('work');
        const currentBlock = blocks[currentBlockIndex];
        if (currentBlock.breakAfter > 0) {
          setIsBreak(true);
          setTimeLeft(currentBlock.breakAfter * 60);
        } else {
          const nextIndex = currentBlockIndex + 1;
          if (nextIndex < blocks.length) {
            setCurrentBlockIndex(nextIndex);
            setTimeLeft(blocks[nextIndex].duration * 60);
          } else {
            setIsRunning(false);
            setSessionStarted(false);
            setSessionsCompleted(prev => prev + 1);
          }
        }
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, currentBlockIndex, blocks, sessionStarted, onSessionComplete]);

  const loadPreset = (preset: typeof PRESET_SESSIONS[0]) => {
    soundManager.playClick();
    const newBlocks: StudyBlock[] = preset.blocks.map((b, i) => ({
      id: `${Date.now()}-${i}`,
      topic: b.topic,
      duration: b.duration,
      breakAfter: b.breakAfter,
      completed: false,
    }));
    setBlocks(newBlocks);
    setCurrentBlockIndex(0);
    setIsRunning(false);
    setSessionStarted(false);
    setIsBreak(false);
  };

  const addCustomBlock = () => {
    soundManager.playClick();
    setBlocks(prev => [...prev, {
      id: Date.now().toString(),
      topic: "",
      duration: 50,
      breakAfter: 10,
      completed: false,
    }]);
  };

  const updateBlock = (id: string, field: keyof StudyBlock, value: string | number) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const removeBlock = (id: string) => {
    soundManager.playClick();
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const startSession = () => {
    if (blocks.length === 0) return;
    soundManager.playClick();
    setCurrentBlockIndex(0);
    setTimeLeft(blocks[0].duration * 60);
    setIsRunning(true);
    setSessionStarted(true);
    setIsBreak(false);
    setBlocks(prev => prev.map(b => ({ ...b, completed: false })));
  };

  const togglePause = () => {
    soundManager.playClick();
    setIsRunning(!isRunning);
  };

  const resetSession = () => {
    soundManager.playClick();
    setIsRunning(false);
    setSessionStarted(false);
    setCurrentBlockIndex(0);
    setIsBreak(false);
    setTimeLeft(0);
    setBlocks(prev => prev.map(b => ({ ...b, completed: false })));
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const totalSessionTime = blocks.reduce((sum, b) => sum + b.duration + b.breakAfter, 0);
  const completedBlocks = blocks.filter(b => b.completed).length;
  const currentBlock = blocks[currentBlockIndex];
  const currentMaxTime = currentBlock ? (isBreak ? currentBlock.breakAfter : currentBlock.duration) * 60 : 1;
  const progress = currentMaxTime > 0 ? ((currentMaxTime - timeLeft) / currentMaxTime) * 100 : 0;

  return (
    <Card className="card-anime border-primary/30 bg-card/80 backdrop-blur-sm col-span-1 lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="font-game text-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
              <Timer className="w-5 h-5" />
            </div>
            DEEP FOCUS CHAMBER
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/30 text-sm">
              <Flame className="w-4 h-4 text-destructive" />
              <span className="font-game text-destructive">{sessionsCompleted}</span>
              <span className="text-muted-foreground">sessions</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/30 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-game text-primary">{formatTotalTime(totalFocusTime)}</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Preset Sessions */}
        {!sessionStarted && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-ui uppercase tracking-wide">Choose a session template:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PRESET_SESSIONS.map((preset) => {
                const totalMins = preset.blocks.reduce((s, b) => s + b.duration + b.breakAfter, 0);
                return (
                  <button
                    key={preset.name}
                    onClick={() => loadPreset(preset)}
                    className="p-3 rounded-xl bg-gradient-to-br from-primary/8 to-primary/3 border border-primary/20 hover:border-primary/50 transition-all hover:scale-[1.02] text-left group"
                  >
                    <span className="text-2xl mb-1 block">{preset.icon}</span>
                    <p className="font-game text-sm text-foreground">{preset.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {preset.blocks.length} blocks • {totalMins}min
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Study Blocks Editor */}
        {blocks.length > 0 && !sessionStarted && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-ui uppercase tracking-wide">
                Study Plan • {totalSessionTime} min total
              </p>
              <Button size="sm" variant="ghost" onClick={addCustomBlock} className="text-primary hover:bg-primary/10">
                <Plus className="w-4 h-4 mr-1" /> Add Block
              </Button>
            </div>

            <div className="space-y-2">
              {blocks.map((block, index) => (
                <div key={block.id} className="flex items-center gap-2 p-3 rounded-xl bg-background/40 border border-border/30 group">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-sm font-game text-primary">
                    {index + 1}
                  </div>
                  <Input
                    value={block.topic}
                    onChange={(e) => updateBlock(block.id, 'topic', e.target.value)}
                    placeholder="What will you study?"
                    className="flex-1 h-9 bg-transparent border-border/30 font-ui text-sm"
                  />
                  <div className="flex items-center gap-1">
                    <Brain className="w-3 h-3 text-muted-foreground" />
                    <Input
                      type="number"
                      value={block.duration}
                      onChange={(e) => updateBlock(block.id, 'duration', parseInt(e.target.value) || 0)}
                      className="w-14 h-9 text-center bg-transparent border-border/30 text-sm"
                    />
                    <span className="text-[10px] text-muted-foreground">min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coffee className="w-3 h-3 text-muted-foreground" />
                    <Input
                      type="number"
                      value={block.breakAfter}
                      onChange={(e) => updateBlock(block.id, 'breakAfter', parseInt(e.target.value) || 0)}
                      className="w-14 h-9 text-center bg-transparent border-border/30 text-sm"
                    />
                    <span className="text-[10px] text-muted-foreground">brk</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeBlock(block.id)}
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button onClick={startSession} className="w-full font-ui bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Play className="w-5 h-5 mr-2" /> Start Deep Focus Session
            </Button>
          </div>
        )}

        {/* Active Session View */}
        {sessionStarted && currentBlock && (
          <div className="space-y-4">
            {/* Block Progress Dots */}
            <div className="flex items-center justify-center gap-2">
              {blocks.map((block, i) => (
                <div key={block.id} className="flex items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-game transition-all ${
                    block.completed ? 'bg-accent text-accent-foreground scale-90' :
                    i === currentBlockIndex ? 'bg-primary text-primary-foreground scale-110 ring-2 ring-primary/50' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {block.completed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < blocks.length - 1 && (
                    <ChevronRight className={`w-4 h-4 ${block.completed ? 'text-accent' : 'text-muted-foreground/30'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Current Block Info */}
            <div className="text-center">
              <Badge variant="outline" className={`mb-2 ${isBreak ? 'border-accent/50 text-accent' : 'border-primary/50 text-primary'}`}>
                {isBreak ? (
                  <><Coffee className="w-3 h-3 mr-1" /> Break Time</>
                ) : (
                  <><Brain className="w-3 h-3 mr-1" /> Focus Mode</>
                )}
              </Badge>
              {!isBreak && currentBlock.topic && (
                <p className="font-ui text-lg text-foreground mt-1 flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {currentBlock.topic}
                </p>
              )}
            </div>

            {/* Timer */}
            <div className={`text-center py-8 rounded-2xl border transition-all ${
              isBreak 
                ? 'bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30' 
                : 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30'
            }`}>
              <div className={`font-game text-6xl font-bold ${
                isBreak ? 'text-accent' : 'text-primary'
              } ${isRunning ? 'animate-pulse' : ''}`}>
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm text-muted-foreground mt-2 font-ui">
                Block {currentBlockIndex + 1} of {blocks.length}
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-1">
              <Progress value={progress} className={`h-2 bg-muted ${isBreak ? '[&>div]:bg-accent' : '[&>div]:bg-primary'}`} />
              <p className="text-xs text-muted-foreground text-center font-ui">{Math.round(progress)}% of current block</p>
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={togglePause}
                size="lg"
                className={`font-ui ${isBreak ? 'bg-accent hover:bg-accent/90' : 'bg-primary hover:bg-primary/90'} shadow-lg transition-all hover:scale-105`}
              >
                {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isRunning ? 'Pause' : 'Resume'}
              </Button>
              <Button onClick={resetSession} variant="outline" size="lg" className="font-ui border-muted-foreground/30">
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {blocks.length === 0 && !sessionStarted && (
          <div className="text-center py-6 text-muted-foreground">
            <Brain className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-ui text-sm">Choose a template above or create a custom session</p>
            <Button variant="outline" size="sm" onClick={addCustomBlock} className="mt-3 font-ui">
              <Plus className="w-4 h-4 mr-1" /> Create Custom Plan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { DeepFocusSession };
