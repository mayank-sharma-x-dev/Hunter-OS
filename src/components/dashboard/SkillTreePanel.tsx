import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock, Sparkles, RotateCcw, Zap, ChevronRight } from "lucide-react";
import { useSkillTree, SKILL_DEFINITIONS, BRANCH_INFO, SkillDefinition } from "@/hooks/useSkillTree";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { soundManager } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface SkillNodeProps {
  skill: SkillDefinition;
  currentLevel: number;
  canUnlock: boolean;
  onUnlock: () => void;
  playerLevel: number;
}

const SkillNode = ({ skill, currentLevel, canUnlock, onUnlock, playerLevel }: SkillNodeProps) => {
  const isLocked = playerLevel < skill.requiredLevel;
  const isMaxed = currentLevel >= skill.maxLevel;
  const isUnlocked = currentLevel > 0;

  const branchColors = {
    combat: "from-destructive/20 to-destructive/5 border-destructive/40 hover:border-destructive",
    wisdom: "from-primary/20 to-primary/5 border-primary/40 hover:border-primary",
    spirit: "from-accent/20 to-accent/5 border-accent/40 hover:border-accent",
    shadow: "from-secondary/20 to-secondary/5 border-secondary/40 hover:border-secondary",
  };

  const glowColors = {
    combat: "shadow-destructive/30",
    wisdom: "shadow-primary/30",
    spirit: "shadow-accent/30",
    shadow: "shadow-secondary/30",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => {
              if (canUnlock) {
                soundManager.playClick();
                onUnlock();
              } else {
                soundManager.playHover();
              }
            }}
            disabled={!canUnlock}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all duration-300",
              "bg-gradient-to-br",
              branchColors[skill.branch],
              isMaxed && "ring-2 ring-gold/50 shadow-lg",
              isMaxed && glowColors[skill.branch],
              canUnlock && "animate-pulse cursor-pointer hover:scale-105",
              isLocked && "opacity-50 cursor-not-allowed",
              !isLocked && !canUnlock && !isMaxed && "cursor-default"
            )}
          >
            {/* Lock icon for locked skills */}
            {isLocked && (
              <div className="absolute -top-2 -right-2 bg-muted rounded-full p-1">
                <Lock className="w-3 h-3 text-muted-foreground" />
              </div>
            )}

            {/* Maxed indicator */}
            {isMaxed && (
              <div className="absolute -top-2 -right-2 bg-gold rounded-full p-1 animate-glow-pulse">
                <Sparkles className="w-3 h-3 text-background" />
              </div>
            )}

            {/* Skill icon */}
            <div className="text-3xl mb-2">{skill.icon}</div>

            {/* Skill name */}
            <h4 className="font-game text-xs font-bold text-foreground truncate max-w-[80px]">
              {skill.name}
            </h4>

            {/* Level indicator */}
            <div className="mt-1 flex items-center justify-center gap-1">
              {Array.from({ length: skill.maxLevel }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i < currentLevel ? "bg-gold" : "bg-muted"
                  )}
                />
              ))}
            </div>

            {/* Can unlock indicator */}
            {canUnlock && (
              <div className="absolute inset-0 rounded-xl border-2 border-gold animate-pulse pointer-events-none" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs bg-card border-primary/30">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{skill.icon}</span>
              <div>
                <h4 className="font-game font-bold text-foreground">{skill.name}</h4>
                <p className="text-xs text-muted-foreground">
                  Level {currentLevel}/{skill.maxLevel}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{skill.description}</p>
            
            {/* Requirements */}
            <div className="pt-2 border-t border-border/50">
              <p className={cn("text-xs", playerLevel >= skill.requiredLevel ? "text-accent" : "text-destructive")}>
                Required: Level {skill.requiredLevel}
              </p>
              {skill.prerequisites.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Requires: {skill.prerequisites.map(p => {
                    const prereq = SKILL_DEFINITIONS.find(s => s.key === p);
                    return prereq?.name || p;
                  }).join(", ")}
                </p>
              )}
            </div>

            {/* Effects */}
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-semibold text-foreground mb-1">Effects:</p>
              {skill.effects.map((effect, i) => (
                <p
                  key={i}
                  className={cn(
                    "text-xs",
                    i < currentLevel ? "text-gold" : "text-muted-foreground"
                  )}
                >
                  Lv{i + 1}: {effect}
                </p>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface SkillBranchProps {
  branch: SkillDefinition["branch"];
  skills: SkillDefinition[];
  getSkillLevel: (key: string) => number;
  canUnlockSkill: (skill: SkillDefinition, level: number) => boolean;
  onUnlock: (key: string) => void;
  playerLevel: number;
  branchProgress: { current: number; max: number };
}

const SkillBranch = ({
  branch,
  skills,
  getSkillLevel,
  canUnlockSkill,
  onUnlock,
  playerLevel,
  branchProgress,
}: SkillBranchProps) => {
  const info = BRANCH_INFO[branch];

  return (
    <div className="space-y-4">
      {/* Branch header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{info.icon}</span>
          <div>
            <h3 className="font-game font-bold text-foreground">{info.name}</h3>
            <p className="text-xs text-muted-foreground">{info.description}</p>
          </div>
        </div>
        <Badge variant="outline" className="font-game">
          {branchProgress.current}/{branchProgress.max}
        </Badge>
      </div>

      {/* Progress bar */}
      <Progress
        value={(branchProgress.current / branchProgress.max) * 100}
        className="h-2"
      />

      {/* Skills grid with connections */}
      <div className="relative flex items-center justify-center gap-2 py-4 overflow-x-auto">
        {skills.map((skill, index) => (
          <div key={skill.key} className="flex items-center">
            <SkillNode
              skill={skill}
              currentLevel={getSkillLevel(skill.key)}
              canUnlock={canUnlockSkill(skill, playerLevel)}
              onUnlock={() => onUnlock(skill.key)}
              playerLevel={playerLevel}
            />
            {index < skills.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground mx-1 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkillTreePanel = () => {
  const { currentLevel } = usePlayerStats();
  const {
    availablePoints,
    totalPoints,
    loading,
    getSkillLevel,
    canUnlockSkill,
    unlockOrUpgradeSkill,
    resetSkillTree,
    getSpentPoints,
    getBranchProgress,
  } = useSkillTree();

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [activeBranch, setActiveBranch] = useState<SkillDefinition["branch"]>("combat");

  const handleUnlock = async (skillKey: string) => {
    await unlockOrUpgradeSkill(skillKey, currentLevel);
  };

  const handleReset = async () => {
    await resetSkillTree();
    setShowResetDialog(false);
  };

  const branchSkills = {
    combat: SKILL_DEFINITIONS.filter((s) => s.branch === "combat"),
    wisdom: SKILL_DEFINITIONS.filter((s) => s.branch === "wisdom"),
    spirit: SKILL_DEFINITIONS.filter((s) => s.branch === "spirit"),
    shadow: SKILL_DEFINITIONS.filter((s) => s.branch === "shadow"),
  };

  if (loading) {
    return (
      <Card className="p-6 bg-card border-primary/40 animate-pulse">
        <div className="h-64 bg-muted rounded-lg" />
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4 md:p-6 bg-card border-primary/40 card-anime">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Zap className="w-7 h-7 text-gold" />
              <div className="absolute -inset-1 bg-gold/20 rounded-full blur-md -z-10" />
            </div>
            <div>
              <h2 className="font-game text-xl font-bold text-gold text-glow-gold tracking-wide">
                TALENT TREE
              </h2>
              <p className="font-ui text-xs text-muted-foreground">
                Unlock abilities as you level up
              </p>
            </div>
          </div>

          {/* Talent points display */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 rounded-lg border border-gold/30">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="font-game text-gold">
                {availablePoints}/{totalPoints} Points
              </span>
            </div>
            {getSpentPoints() > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetDialog(true)}
                className="font-ui border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Next talent point info */}
        {currentLevel < 300 && (
          <div className="mb-4 p-2 bg-muted/50 rounded-lg text-center">
            <p className="text-xs text-muted-foreground font-ui">
              Next talent point at Level {Math.ceil((currentLevel + 1) / 5) * 5}
            </p>
          </div>
        )}

        {/* Branch tabs */}
        <Tabs
          value={activeBranch}
          onValueChange={(v) => {
            soundManager.playClick();
            setActiveBranch(v as SkillDefinition["branch"]);
          }}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full mb-4 bg-muted/50">
            {(Object.keys(BRANCH_INFO) as Array<keyof typeof BRANCH_INFO>).map((branch) => {
              const info = BRANCH_INFO[branch];
              const progress = getBranchProgress(branch);
              return (
                <TabsTrigger
                  key={branch}
                  value={branch}
                  className="font-game text-xs data-[state=active]:bg-card"
                >
                  <span className="mr-1">{info.icon}</span>
                  <span className="hidden sm:inline">{info.name}</span>
                  <span className="ml-1 text-[10px] text-muted-foreground">
                    ({progress.current})
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(Object.keys(branchSkills) as Array<keyof typeof branchSkills>).map((branch) => (
            <TabsContent key={branch} value={branch} className="mt-0">
              <SkillBranch
                branch={branch}
                skills={branchSkills[branch]}
                getSkillLevel={getSkillLevel}
                canUnlockSkill={canUnlockSkill}
                onUnlock={handleUnlock}
                playerLevel={currentLevel}
                branchProgress={getBranchProgress(branch)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Reset confirmation dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="bg-card border-destructive/40">
          <DialogHeader>
            <DialogTitle className="font-game text-destructive">Reset Talent Tree?</DialogTitle>
            <DialogDescription className="font-ui">
              This will remove all your unlocked skills and refund {getSpentPoints()} talent points.
              This action cannot be undone!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
              className="font-ui"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
              className="font-ui"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All Skills
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
