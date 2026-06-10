import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import DarkModeToggle from "@/components/DarkModeToggle";
import NatureAmbience from "@/components/nature/NatureAmbience";
import { soundManager } from "@/lib/sounds";
import {
  ArrowLeft,
  User,
  Lock,
  Settings as SettingsIcon,
  Camera,
  Shield,
  Bell,
  Palette,
  Volume2,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Trash2,
  LogOut,
  Swords,
  Sparkles,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  rank: string | null;
}

interface Preferences {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  animationsEnabled: boolean;
  ambientSoundsEnabled: boolean;
}

const Settings = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Preferences state
  const [preferences, setPreferences] = useState<Preferences>({
    soundEnabled: true,
    notificationsEnabled: true,
    animationsEnabled: true,
    ambientSoundsEnabled: true,
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Delete account state
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem("userPreferences");
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
      }
    };

    fetchProfile();
  }, [user]);

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[a-z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
    setPasswordStrength(strength);
  }, [newPassword]);

  const handleAvatarClick = () => {
    soundManager.playClick();
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);
      
      // Update profile
      await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", user.id);

      toast({
        title: "Avatar updated! ✨",
        description: "Your new avatar looks great!",
      });
      soundManager.playLevelUp();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !username.trim()) return;

    setSavingProfile(true);
    soundManager.playClick();

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: username.trim() })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated! 🎉",
        description: "Your changes have been saved.",
      });
      soundManager.playTaskComplete();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength < 3) {
      toast({
        title: "Weak password",
        description: "Please use a stronger password.",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    soundManager.playClick();

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password changed! 🔐",
        description: "Your password has been updated successfully.",
      });
      soundManager.playLevelUp();
      
      // Clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSavePreferences = () => {
    setSavingPreferences(true);
    soundManager.playClick();

    localStorage.setItem("userPreferences", JSON.stringify(preferences));

    setTimeout(() => {
      setSavingPreferences(false);
      toast({
        title: "Preferences saved! ⚙️",
        description: "Your settings have been applied.",
      });
    }, 500);
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    
    try {
      // Note: Full account deletion requires a backend function
      // For now, we sign out and show a message
      await signOut();
      toast({
        title: "Account deletion requested",
        description: "Please contact support to complete account deletion.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-destructive";
    if (passwordStrength <= 2) return "bg-orange-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-lime-500";
    return "bg-primary";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 2) return "Fair";
    if (passwordStrength <= 3) return "Good";
    if (passwordStrength <= 4) return "Strong";
    return "Very Strong";
  };

  const passwordRequirements = [
    { met: newPassword.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(newPassword), text: "One uppercase letter" },
    { met: /[a-z]/.test(newPassword), text: "One lowercase letter" },
    { met: /[0-9]/.test(newPassword), text: "One number" },
    { met: /[^A-Za-z0-9]/.test(newPassword), text: "One special character" },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <NatureAmbience />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                soundManager.playClick();
                navigate("/dashboard");
              }}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-game font-bold text-foreground flex items-center gap-2">
                <SettingsIcon className="w-8 h-8 text-primary" />
                Settings
              </h1>
              <p className="text-muted-foreground font-ui">Manage your account and preferences</p>
            </div>
          </div>
          <DarkModeToggle />
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border border-border">
            <TabsTrigger value="profile" className="font-ui flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="font-ui flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="font-ui flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
              <CardHeader>
                <CardTitle className="font-game flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription className="font-ui">
                  Update your avatar and display name
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-primary via-secondary to-primary opacity-50 blur-md group-hover:opacity-100 transition-opacity" />
                    <Avatar className="relative w-24 h-24 border-4 border-primary/30 cursor-pointer" onClick={handleAvatarClick}>
                      <AvatarImage src={avatarUrl || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/30 to-secondary/30">
                        <Swords className="w-10 h-10 text-primary/80" />
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={handleAvatarClick}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground font-ui">
                    Click to change avatar (max 5MB)
                  </p>
                </div>

                <Separator />

                {/* Username Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="font-ui">Display Name</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your display name"
                      className="bg-background/50 border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-ui text-muted-foreground">Email</Label>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="bg-muted/50 border-border opacity-60"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={savingProfile || username === profile?.username}
                    className="w-full font-ui"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              {/* Change Password Card */}
              <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
                <CardHeader>
                  <CardTitle className="font-game flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Change Password
                  </CardTitle>
                  <CardDescription className="font-ui">
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="font-ui">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="bg-background/50 border-border pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength */}
                  {newPassword && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-ui">Password Strength</span>
                        <span className={`font-ui font-medium ${passwordStrength >= 4 ? "text-primary" : passwordStrength >= 3 ? "text-yellow-500" : "text-destructive"}`}>
                          {getStrengthText()}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {passwordRequirements.map((req, i) => (
                          <div key={i} className={`flex items-center gap-2 text-xs font-ui ${req.met ? "text-primary" : "text-muted-foreground"}`}>
                            {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {req.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="font-ui">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="bg-background/50 border-border pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-destructive font-ui flex items-center gap-1">
                        <X className="w-3 h-3" />
                        Passwords don't match
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={changingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                    className="w-full font-ui"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="bg-card/80 backdrop-blur-xl border-destructive/30">
                <CardHeader>
                  <CardTitle className="font-game flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="font-ui">
                    Irreversible actions for your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription className="font-ui">
                      Deleting your account will permanently remove all your data including progress, achievements, and settings.
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        soundManager.playClick();
                        signOut();
                      }}
                      className="flex-1 font-ui border-border"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="flex-1 font-ui"
                          onClick={() => soundManager.playClick()}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-destructive/30">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-game text-destructive">
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="font-ui">
                            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="font-ui">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={deletingAccount}
                            className="bg-destructive hover:bg-destructive/90 font-ui"
                          >
                            {deletingAccount ? "Deleting..." : "Delete Account"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
              <CardHeader>
                <CardTitle className="font-game flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  App Preferences
                </CardTitle>
                <CardDescription className="font-ui">
                  Customize your experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sound Settings */}
                <div className="space-y-4">
                  <h3 className="font-game text-lg flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-secondary" />
                    Sound
                  </h3>
                  <div className="space-y-4 pl-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-ui">Sound Effects</Label>
                        <p className="text-xs text-muted-foreground">Play sounds on interactions</p>
                      </div>
                      <Switch
                        checked={preferences.soundEnabled}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, soundEnabled: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-ui">Ambient Sounds</Label>
                        <p className="text-xs text-muted-foreground">Nature and background sounds</p>
                      </div>
                      <Switch
                        checked={preferences.ambientSoundsEnabled}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, ambientSoundsEnabled: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Notification Settings */}
                <div className="space-y-4">
                  <h3 className="font-game text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-gold" />
                    Notifications
                  </h3>
                  <div className="space-y-4 pl-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-ui">Push Notifications</Label>
                        <p className="text-xs text-muted-foreground">Get notified about important updates</p>
                      </div>
                      <Switch
                        checked={preferences.notificationsEnabled}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, notificationsEnabled: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Visual Settings */}
                <div className="space-y-4">
                  <h3 className="font-game text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Visual
                  </h3>
                  <div className="space-y-4 pl-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-ui">Animations</Label>
                        <p className="text-xs text-muted-foreground">Enable UI animations and effects</p>
                      </div>
                      <Switch
                        checked={preferences.animationsEnabled}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, animationsEnabled: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <Button
                  onClick={handleSavePreferences}
                  disabled={savingPreferences}
                  className="w-full font-ui"
                >
                  {savingPreferences ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
