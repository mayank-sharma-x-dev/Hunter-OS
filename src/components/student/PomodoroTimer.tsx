import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, Flame } from "lucide-react";
import { soundManager } from "@/lib/sounds";

interface PomodoroTimerProps {
  onSessionComplete?: (type: 'work' | 'break') => void;
}

export const PomodoroTimer = ({ onSessionComplete }: PomodoroTimerProps) => {
  const WORK_TIME = 25 * 60; // 25 minutes
  const SHORT_BREAK = 5 * 60; // 5 minutes
  const LONG_BREAK = 15 * 60; // 15 minutes

  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);

  const getMaxTime = useCallback(() => {
    switch (mode) {
      case 'work': return WORK_TIME;
      case 'shortBreak': return SHORT_BREAK;
      case 'longBreak': return LONG_BREAK;
    }
  }, [mode]);

  useEffect(() => {
    const saved = localStorage.getItem('pomodoroStats');
    if (saved) {
      const data = JSON.parse(saved);
      setSessionsCompleted(data.sessionsCompleted || 0);
      setTotalFocusTime(data.totalFocusTime || 0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pomodoroStats', JSON.stringify({
      sessionsCompleted,
      totalFocusTime,
    }));
  }, [sessionsCompleted, totalFocusTime]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (mode === 'work') {
          setTotalFocusTime((prev) => prev + 1);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      soundManager.playLevelUp();
      if (mode === 'work') {
        setSessionsCompleted((prev) => prev + 1);
        onSessionComplete?.('work');
        if ((sessionsCompleted + 1) % 4 === 0) {
          setMode('longBreak');
          setTimeLeft(LONG_BREAK);
        } else {
          setMode('shortBreak');
          setTimeLeft(SHORT_BREAK);
        }
      } else {
        onSessionComplete?.('break');
        setMode('work');
        setTimeLeft(WORK_TIME);
      }
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, sessionsCompleted, onSessionComplete]);

  const toggleTimer = () => {
    soundManager.playClick();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    soundManager.playClick();
    setIsRunning(false);
    setTimeLeft(getMaxTime());
  };

  const switchMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    soundManager.playClick();
    setMode(newMode);
    setIsRunning(false);
    switch (newMode) {
      case 'work': setTimeLeft(WORK_TIME); break;
      case 'shortBreak': setTimeLeft(SHORT_BREAK); break;
      case 'longBreak': setTimeLeft(LONG_BREAK); break;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const progress = ((getMaxTime() - timeLeft) / getMaxTime()) * 100;

  const getModeColor = () => {
    switch (mode) {
      case 'work': return 'primary';
      case 'shortBreak': return 'accent';
      case 'longBreak': return 'secondary';
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'work': return <Brain className="w-5 h-5" />;
      case 'shortBreak': return <Coffee className="w-5 h-5" />;
      case 'longBreak': return <Coffee className="w-5 h-5" />;
    }
  };

  return (
    <Card className="card-anime border-primary/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-game text-lg flex items-center gap-2 text-primary">
          <Timer className="w-5 h-5 text-primary" />
          FOCUS CHAMBER
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Selector */}
        <div className="flex gap-2">
          <Button
            variant={mode === 'work' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('work')}
            className={`flex-1 font-ui text-xs ${mode === 'work' ? 'bg-primary glow-primary' : 'border-primary/30'}`}
          >
            <Brain className="w-3 h-3 mr-1" />
            Focus
          </Button>
          <Button
            variant={mode === 'shortBreak' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('shortBreak')}
            className={`flex-1 font-ui text-xs ${mode === 'shortBreak' ? 'bg-accent glow-accent' : 'border-accent/30'}`}
          >
            <Coffee className="w-3 h-3 mr-1" />
            Short
          </Button>
          <Button
            variant={mode === 'longBreak' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('longBreak')}
            className={`flex-1 font-ui text-xs ${mode === 'longBreak' ? 'bg-secondary glow-secondary' : 'border-secondary/30'}`}
          >
            <Coffee className="w-3 h-3 mr-1" />
            Long
          </Button>
        </div>

        {/* Timer Display */}
        <div className={`text-center py-6 rounded-lg bg-gradient-${getModeColor()} border border-${getModeColor()}/40`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {getModeIcon()}
            <span className="font-ui text-sm text-muted-foreground uppercase">
              {mode === 'work' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </span>
          </div>
          <div className={`font-game text-5xl font-bold text-${getModeColor()} text-glow-${getModeColor()} ${isRunning ? 'animate-glow-pulse' : ''}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress value={progress} className={`h-2 bg-muted [&>div]:bg-${getModeColor()}`} />
          <p className="text-xs text-muted-foreground text-center font-ui">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={toggleTimer}
            size="lg"
            className={`font-ui bg-${getModeColor()} hover:bg-${getModeColor()}/90 glow-${getModeColor()} transition-all hover:scale-105`}
          >
            {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button
            onClick={resetTimer}
            variant="outline"
            size="lg"
            className="font-ui border-muted-foreground/30"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-4 h-4 text-destructive" />
              <span className="font-game text-lg text-destructive">{sessionsCompleted}</span>
            </div>
            <p className="text-xs text-muted-foreground font-ui">Sessions</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Timer className="w-4 h-4 text-primary" />
              <span className="font-game text-lg text-primary">{formatTotalTime(totalFocusTime)}</span>
            </div>
            <p className="text-xs text-muted-foreground font-ui">Focus Time</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
