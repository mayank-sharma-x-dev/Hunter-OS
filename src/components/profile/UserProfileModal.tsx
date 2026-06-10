import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { useTasks } from "@/hooks/useTasks";
import { 
  Camera, Shield, Swords, Star, Trophy, Target, Crown, 
  Sparkles, Award, TrendingUp, Loader2, User
} from "lucide-react";
import { soundManager } from "@/lib/sounds";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    id: string;
    username: string;
    avatar_url: string | null;
    rank: string | null;
  } | null;
  onProfileUpdate: (profile: any) => void;
}

const ROLE_MILESTONES = [
  { role: 'hunter', level: 1, label: "Hunter", icon: Swords, color: "text-primary", bgColor: "bg-primary/20", description: "Rookie adventurer" },
  { role: 'elite_hunter', level: 25, label: "Elite Hunter", icon: Shield, color: "text-secondary", bgColor: "bg-secondary/20", description: "Proven warrior" },
  { role: 'guild_master', level: 50, label: "Guild Master", icon: Crown, color: "text-gold", bgColor: "bg-gold/20", description: "Leader of hunters" },
  { role: 'shadow_monarch', level: 100, label: "Shadow Monarch", icon: Sparkles, color: "text-accent", bgColor: "bg-accent/20", description: "Legendary being" },
];

const ROLE_INFO: Record<string, { label: string; icon: typeof Crown; color: string; description: string }> = {
  hunter: {
    label: "Hunter",
    icon: Swords,
    color: "text-primary",
    description: "Rookie adventurer starting their journey"
  },
  elite_hunter: {
    label: "Elite Hunter",
    icon: Shield,
    color: "text-secondary",
    description: "Proven warrior with exceptional skills"
  },
  guild_master: {
    label: "Guild Master",
    icon: Crown,
    color: "text-gold",
    description: "Leader of hunters, master of quests"
  },
  shadow_monarch: {
    label: "Shadow Monarch",
    icon: Sparkles,
    color: "text-accent",
    description: "Legendary being of unmatched power"
  }
};

const UserProfileModal = ({ open, onOpenChange, profile, onProfileUpdate }: UserProfileModalProps) => {
  const { toast } = useToast();
  const { currentLevel, currentExp, rankInfo, stats } = usePlayerStats();
  const { tasks, completedTasks } = useTasks();
  const [uploading, setUploading] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(profile?.username || "");
  const [userRole, setUserRole] = useState<string>("hunter");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const expToNextLevel = 20;
  const expProgress = (currentExp / expToNextLevel) * 100;

  useEffect(() => {
    if (profile?.id) {
      fetchUserRole();
    }
  }, [profile?.id]);

  useEffect(() => {
    setNewUsername(profile?.username || "");
  }, [profile?.username]);

  const fetchUserRole = async () => {
    if (!profile?.id) return;
    
    const { data, error } = await supabase.rpc('get_user_role', { _user_id: profile.id });
    if (!error && data) {
      setUserRole(data);
    }
  };

  const handleAvatarClick = () => {
    soundManager.playClick();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 2MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: `${publicUrl}?t=${Date.now()}` })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      soundManager.playLevelUp();
      toast({
        title: "✨ Avatar Updated!",
        description: "Your new look suits you, Hunter!"
      });

      onProfileUpdate({ ...profile, avatar_url: `${publicUrl}?t=${Date.now()}` });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!profile?.id || !newUsername.trim()) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('id', profile.id);

      if (error) throw error;

      soundManager.playClick();
      toast({
        title: "Username Updated!",
        description: `You are now known as ${newUsername}`
      });

      onProfileUpdate({ ...profile, username: newUsername.trim() });
      setEditingUsername(false);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const roleData = ROLE_INFO[userRole] || ROLE_INFO.hunter;
  const RoleIcon = roleData.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-primary/30 text-foreground">
        <DialogHeader>
          <DialogTitle className="font-game text-xl text-primary text-glow-primary flex items-center gap-2">
            <User className="w-5 h-5" />
            Hunter Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div 
              onClick={handleAvatarClick}
              className="relative group cursor-pointer"
            >
              {/* Animated ring */}
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-75 blur-md group-hover:opacity-100 transition-opacity animate-spin-slow" />
              
              {/* Avatar container */}
              <div className="relative w-28 h-28 rounded-full border-4 border-primary/50 overflow-hidden bg-muted group-hover:border-primary transition-colors">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    <Swords className="w-12 h-12 text-primary/60" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </div>
              </div>

              {/* Rank badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <span className={`rank-badge ${rankInfo.class} text-xs px-3`}>
                  {profile?.rank || 'E-RANK'}
                </span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Username */}
            <div className="mt-6 text-center">
              {editingUsername ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="text-center font-game"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleUsernameUpdate}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingUsername(false)}>✕</Button>
                </div>
              ) : (
                <h2 
                  onClick={() => setEditingUsername(true)}
                  className="font-game text-2xl text-foreground cursor-pointer hover:text-primary transition-colors"
                >
                  {profile?.username || 'Hunter'}
                </h2>
              )}
              <p className="text-sm text-muted-foreground">Click to edit username</p>
            </div>
          </div>

          {/* Role Badge */}
          <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20">
            <RoleIcon className={`w-6 h-6 ${roleData.color}`} />
            <div className="text-center">
              <p className={`font-game text-lg ${roleData.color}`}>{roleData.label}</p>
              <p className="text-xs text-muted-foreground">{roleData.description}</p>
            </div>
          </div>

          {/* Role Milestones Progress */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground text-center">Role Milestones</p>
            <div className="flex items-center justify-between gap-1">
              {ROLE_MILESTONES.map((milestone, index) => {
                const MilestoneIcon = milestone.icon;
                const isUnlocked = currentLevel >= milestone.level;
                const isActive = userRole === milestone.role;
                const nextMilestone = ROLE_MILESTONES[index + 1];
                const progressToNext = nextMilestone 
                  ? Math.min(100, ((currentLevel - milestone.level) / (nextMilestone.level - milestone.level)) * 100)
                  : 100;
                
                return (
                  <div key={milestone.role} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isUnlocked 
                          ? `${milestone.bgColor} border-current ${milestone.color} ${isActive ? 'ring-2 ring-offset-2 ring-current scale-110' : ''}`
                          : 'bg-muted/50 border-muted-foreground/30 text-muted-foreground/50'
                      }`}
                      title={`${milestone.label} - Level ${milestone.level}`}
                    >
                      <MilestoneIcon className={`w-5 h-5 ${isUnlocked ? '' : 'opacity-50'}`} />
                      {isActive && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card animate-pulse" />
                      )}
                    </div>
                    <span className={`text-[10px] mt-1 font-medium ${isUnlocked ? milestone.color : 'text-muted-foreground/50'}`}>
                      Lv.{milestone.level}
                    </span>
                    {/* Progress line to next */}
                    {index < ROLE_MILESTONES.length - 1 && (
                      <div className="absolute hidden" /> 
                    )}
                  </div>
                );
              })}
            </div>
            {/* Next role progress */}
            {(() => {
              const currentMilestoneIndex = ROLE_MILESTONES.findIndex(m => m.role === userRole);
              const nextMilestone = ROLE_MILESTONES[currentMilestoneIndex + 1];
              if (nextMilestone) {
                const currentMilestone = ROLE_MILESTONES[currentMilestoneIndex];
                const progress = ((currentLevel - currentMilestone.level) / (nextMilestone.level - currentMilestone.level)) * 100;
                return (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Next: {nextMilestone.label}</span>
                      <span className={nextMilestone.color}>{nextMilestone.level - currentLevel} levels to go</span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${
                          nextMilestone.role === 'elite_hunter' ? 'from-primary to-secondary' :
                          nextMilestone.role === 'guild_master' ? 'from-secondary to-gold' :
                          'from-gold to-accent'
                        } transition-all duration-500`}
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      />
                    </div>
                  </div>
                );
              }
              return (
                <div className="mt-2 text-center">
                  <span className="text-xs text-accent font-game">🎉 Maximum Role Achieved!</span>
                </div>
              );
            })()}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-center">
              <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-game text-2xl text-primary">{currentLevel}</p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
            <div className="p-3 rounded-xl bg-gold/10 border border-gold/30 text-center">
              <Star className="w-5 h-5 text-gold mx-auto mb-1" />
              <p className="font-game text-2xl text-gold">{stats?.total_exp || 0}</p>
              <p className="text-xs text-muted-foreground">Total EXP</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/30 text-center">
              <Trophy className="w-5 h-5 text-secondary mx-auto mb-1" />
              <p className="font-game text-2xl text-secondary">{completedTasks.length}</p>
              <p className="text-xs text-muted-foreground">Quests Done</p>
            </div>
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-center">
              <Target className="w-5 h-5 text-destructive mx-auto mb-1" />
              <p className="font-game text-2xl text-destructive">{stats?.longest_streak || 0}</p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
          </div>

          {/* EXP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to Level {currentLevel + 1}</span>
              <span className="text-primary font-game">{currentExp}/{expToNextLevel} EXP</span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden border border-primary/30">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${expProgress}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
            </div>
          </div>

          {/* Achievements Preview */}
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
            <Award className="w-4 h-4 text-gold" />
            <span className="text-sm text-muted-foreground">
              {currentLevel >= 10 ? "🏆" : "🔒"} 
              {currentLevel >= 25 ? "⚔️" : "🔒"} 
              {currentLevel >= 50 ? "👑" : "🔒"} 
              {currentLevel >= 100 ? "⭐" : "🔒"}
            </span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
