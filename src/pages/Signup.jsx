import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import notify from "@/lib/notify";
import { Fish, Mail, Chrome } from "lucide-react";

export default function Signup() {
  const { signupWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Email fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [activeTab, setActiveTab] = useState("email");

  // Email/Password Signup
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      notify.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      notify.error("Password must be at least 6 characters");
      return;
    }
    if (!name.trim()) {
      notify.error("Please enter your name");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      notify.error("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      await signupWithEmail({ email, password, name, phone: phone.replace(/\D/g, '') });
      notify.success("Account created successfully!");
      setTimeout(() => navigate('/'), 200);
    } catch (err) {
      notify.error(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  // Google Signup
  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      notify.success("Account created with Google!");
      setTimeout(() => navigate('/'), 200);
    } catch (err) {
      if (err.message === "PROFILE_INCOMPLETE") {
        notify.info("Please complete your profile");
        setTimeout(() => navigate('/new-user'), 150);
      } else {
        notify.error(err.message || "Failed to sign up with Google");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-12 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Fish className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Choose your preferred signup method
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Email</span>
                </TabsTrigger>
                <TabsTrigger value="google" className="flex items-center gap-2">
                  <Chrome className="h-4 w-4" />
                  <span className="hidden sm:inline">Google</span>
                </TabsTrigger>
              </TabsList>

              {/* Email/Password Signup */}
              <TabsContent value="email">
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                      required
                      maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground">Enter 10-digit phone number</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>

              {/* Google Signup */}
              <TabsContent value="google">
                <div className="space-y-4">
                  <div className="text-center text-sm text-muted-foreground mb-4">
                    Create account quickly with Google
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-3"
                    onClick={handleGoogleSignup}
                    disabled={loading}
                  >
                    <Chrome className="h-5 w-5" />
                    {loading ? "Creating Account..." : "Continue with Google"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => navigate('/')}
              >
                Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
