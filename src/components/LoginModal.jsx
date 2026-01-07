import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Chrome } from "lucide-react";
import { useNavigate } from "react-router-dom";
import notify from "@/lib/notify";

export default function LoginModal() {
  const { showLogin, setShowLogin, loginWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Email/Password fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [activeTab, setActiveTab] = useState("email");

  // Reset form when modal closes
  useEffect(() => {
    if (!showLogin) {
      setEmail("");
      setPassword("");
      setLoading(false);
    }
  }, [showLogin]);

  // Email/Password Login
  const onEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithEmail({ email, password });
      notify.success("Login successful!");
      setShowLogin(false);
    } catch (err) {
      if (err.message === "PROFILE_INCOMPLETE") {
        notify.info("Please complete your profile");
        setShowLogin(false);
        setTimeout(() => navigate('/new-user'), 150);
      } else {
        notify.error(err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In
  const onGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      notify.success("Signed in with Google!");
      setShowLogin(false);
    } catch (err) {
      if (err.message === "PROFILE_INCOMPLETE") {
        notify.info("Please complete your profile");
        setShowLogin(false);
        setTimeout(() => navigate('/new-user'), 150);
      } else {
        notify.error(err.message || "Google sign in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showLogin} onOpenChange={setShowLogin}>
      <DialogContent className="sm:max-w-[480px] bg-card border border-primary/10 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome Back</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="google" className="flex items-center gap-2">
              <Chrome className="h-4 w-4" />
              <span className="hidden sm:inline">Google</span>
            </TabsTrigger>
          </TabsList>

          {/* Email/Password Login */}
          <TabsContent value="email" className="mt-6">
            <form onSubmit={onEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          {/* Google Sign In */}
          <TabsContent value="google" className="mt-6">
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground mb-4">
                Sign in quickly with your Google account
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-3"
                onClick={onGoogleSignIn}
                disabled={loading}
              >
                <Chrome className="h-5 w-5" />
                {loading ? "Signing in..." : "Continue with Google"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-muted-foreground mt-4">
          New user?{" "}
          <button
            type="button"
            className="text-primary hover:underline font-medium"
            onClick={() => {
              setShowLogin(false);
              navigate('/signup');
            }}
          >
            Create new account
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
