import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Swords, Shield, Crown, Sparkles, User, Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { FloatingCrystal } from "@/components/3d/FloatingCrystal";
import { FloatingOrb } from "@/components/3d/FloatingOrb";
import { z } from "zod";

// Validation schemas
const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" }).max(255, { message: "Email is too long" });
const passwordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(72, { message: "Password is too long" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });
const usernameSchema = z.string().trim().min(2, { message: "Username must be at least 2 characters" }).max(30, { message: "Username is too long" }).regex(/^[a-zA-Z0-9_-]+$/, { message: "Username can only contain letters, numbers, underscores, and hyphens" }).optional().or(z.literal(""));

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; username?: string }>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle Google OAuth sign in via Lovable Cloud
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { lovable } = await import("@/integrations/lovable/index");
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        throw result.error;
      }

      if (result.redirected) {
        return;
      }

      // Session set successfully
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Google Sign-In Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(Math.min(strength, 5));
  }, [password]);

  const validateField = (field: "email" | "password" | "username", value: string) => {
    try {
      if (field === "email") emailSchema.parse(value);
      else if (field === "password") passwordSchema.parse(value);
      else if (field === "username") usernameSchema.parse(value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: err.errors[0].message }));
      }
      return false;
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateField("email", email)) return;
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "📧 Reset Email Sent!",
        description: "Check your inbox for the password reset link.",
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Could not send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const emailValid = validateField("email", email);
    const passwordValid = validateField("password", password);
    const usernameValid = username ? validateField("username", username) : true;
    
    if (!emailValid || !passwordValid || !usernameValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before continuing.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            username: username.trim() || email.split("@")[0],
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "🎮 Hunter Registered!",
          description: "Your journey begins now. Welcome to the guild!",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.message?.includes("User already registered")) {
        errorMessage = "This email is already registered. Try logging in instead.";
      } else if (error.message?.includes("Password")) {
        errorMessage = "Password must be at least 8 characters with uppercase, lowercase, and numbers.";
      } else if (error.message?.includes("rate limit")) {
        errorMessage = "Too many attempts. Please wait a moment and try again.";
      }
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateField("email", email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      if (data.session) {
        toast({
          title: "🎯 Welcome Back, Hunter!",
          description: "Your adventure continues...",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      let errorMessage = "Something went wrong. Please try again.";
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Wrong email or password. Please check and try again.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please verify your email before logging in.";
      } else if (error.message?.includes("rate limit")) {
        errorMessage = "Too many login attempts. Please wait a moment and try again.";
      }
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 2) return "bg-orange-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-lime-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 2) return "Fair";
    if (passwordStrength <= 3) return "Good";
    if (passwordStrength <= 4) return "Strong";
    return "Very Strong";
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-white to-accent/5">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* 3D Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 opacity-40">
        <FloatingCrystal />
      </div>
      <div className="absolute bottom-20 left-20 w-32 h-32 opacity-40">
        <FloatingOrb />
      </div>

      {/* Floating Icons */}
      <div className="absolute top-10 left-10 text-primary/15 animate-float">
        <Swords size={40} />
      </div>
      <div className="absolute top-40 right-10 text-gold/15 animate-float" style={{ animationDelay: "1s" }}>
        <Shield size={40} />
      </div>
      <div className="absolute bottom-20 right-40 text-accent/15 animate-float" style={{ animationDelay: "2s" }}>
        <Crown size={40} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo/Title */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-4">
              <Sparkles className="text-primary animate-glow-pulse" size={32} />
              <h1 className="text-5xl font-game font-bold text-glow-primary anime-title">
                HUNTER'S GATE
              </h1>
              <Sparkles className="text-gold animate-glow-pulse" size={32} />
            </div>
            <p className="text-muted-foreground font-ui text-lg">
              Enter the realm of limitless potential
            </p>
          </div>

          {/* Auth Card */}
          <div className="card-anime bg-white/70 backdrop-blur-xl border border-primary/10 rounded-2xl p-8 shadow-xl">
            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full mb-6 bg-background/50 border-border hover:bg-background/80 hover:border-primary/50 transition-all font-ui flex items-center justify-center gap-3 py-6"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span className="text-foreground">
                {googleLoading ? "Connecting..." : "Continue with Google"}
              </span>
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-ui">Or continue with email</span>
              </div>
            </div>

            <Tabs defaultValue="signup" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-background/50">
                <TabsTrigger value="signup" className="font-ui">
                  New Hunter
                </TabsTrigger>
                <TabsTrigger value="login" className="font-ui">
                  Returning Hunter
                </TabsTrigger>
              </TabsList>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="font-ui text-foreground/60">
                      <User className="inline mr-2" size={16} />
                      Hunter Name
                    </Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose your hunter name"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (e.target.value) validateField("username", e.target.value);
                      }}
                      className={`bg-background/50 border-primary/20 focus:border-primary transition-colors ${errors.username ? 'border-red-500' : ''}`}
                      disabled={loading}
                      autoComplete="username"
                    />
                    {errors.username && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.username}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="font-ui text-foreground/60">
                      <Mail className="inline mr-2" size={16} />
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        validateField("email", e.target.value);
                      }}
                      className={`bg-background/50 border-primary/20 focus:border-primary transition-colors ${errors.email ? 'border-red-500' : ''}`}
                      required
                      disabled={loading}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="font-ui text-foreground/60">
                      <Lock className="inline mr-2" size={16} />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          validateField("password", e.target.value);
                        }}
                        className={`bg-background/50 border-primary/20 focus:border-primary transition-colors pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        required
                        disabled={loading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.password}
                      </p>
                    )}
                    
                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-colors ${
                                i < passwordStrength ? getStrengthColor() : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs ${passwordStrength >= 4 ? 'text-green-500' : 'text-muted-foreground'}`}>
                          Password strength: {getStrengthText()}
                        </p>
                      </div>
                    )}
                    
                    {/* Password Requirements */}
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {[
                        { text: "8+ characters", check: password.length >= 8 },
                        { text: "Uppercase", check: /[A-Z]/.test(password) },
                        { text: "Lowercase", check: /[a-z]/.test(password) },
                        { text: "Number", check: /[0-9]/.test(password) },
                      ].map((req, i) => (
                        <p key={i} className={`text-xs flex items-center gap-1 ${req.check ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {req.check ? <CheckCircle2 size={12} /> : <span className="w-3 h-3 rounded-full border border-current inline-block" />}
                          {req.text}
                        </p>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6 bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all font-game"
                    disabled={loading}
                  >
                    {loading ? "AWAKENING..." : "BEGIN YOUR JOURNEY"}
                  </Button>
                </form>
              </TabsContent>

              {/* Login Tab */}
              <TabsContent value="login">
                {showForgotPassword ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter your email and we'll send you a reset link.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="font-ui text-foreground/60">
                        <Mail className="inline mr-2" size={16} />
                        Email
                      </Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          validateField("email", e.target.value);
                        }}
                        className={`bg-background/50 border-primary/20 focus:border-primary transition-colors ${errors.email ? 'border-red-500' : ''}`}
                        required
                        disabled={loading}
                        autoComplete="email"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.email}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full mt-6 bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all font-game"
                      disabled={loading}
                    >
                      {loading ? "SENDING..." : "SEND RESET LINK"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-muted-foreground"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Back to Login
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="font-ui text-foreground/60">
                        <Mail className="inline mr-2" size={16} />
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          validateField("email", e.target.value);
                        }}
                        className={`bg-background/50 border-primary/20 focus:border-primary transition-colors ${errors.email ? 'border-red-500' : ''}`}
                        required
                        disabled={loading}
                        autoComplete="email"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="font-ui text-foreground/60">
                        <Lock className="inline mr-2" size={16} />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors((prev) => ({ ...prev, password: undefined }));
                          }}
                          className={`bg-background/50 border-primary/20 focus:border-primary transition-colors pr-10 ${errors.password ? 'border-red-500' : ''}`}
                          required
                          disabled={loading}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.password}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </button>

                    <Button
                      type="submit"
                      className="w-full mt-4 bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all font-game"
                      disabled={loading}
                    >
                      {loading ? "ENTERING..." : "RETURN TO GUILD"}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <p className="text-center text-muted-foreground text-sm mt-6 font-ui">
            Join thousands of hunters on their path to greatness
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
