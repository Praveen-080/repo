import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { createUserDocument, updateUser } from "@/services/_firestoreUsers";
import notify from "@/lib/notify";
import { Fish } from "lucide-react";

export default function NewUser() {
  const { setUser, setShowLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const [isPhoneSignup, setIsPhoneSignup] = useState(false);

  useEffect(() => {
    const tempData = localStorage.getItem("sfm_temp_user");
    if (tempData) {
      try {
        const parsed = JSON.parse(tempData);
        setTempUserData(parsed);
        
        // Pre-fill existing data
        setEmail(parsed.email || "");
        setName(parsed.name || "");
        setPhone(parsed.phone || "");
        
        // Determine if this is phone signup (SIGNUP_REQUIRED) or profile completion (needsProfileCompletion)
        setIsPhoneSignup(!parsed.needsProfileCompletion);
      } catch {
        navigate("/", { replace: true });
      }
    } else {
      // No temp user data - silently redirect to home
      navigate("/", { replace: true });
    }
  }, [navigate, setShowLogin]);

  const completeSignup = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) return notify.warning("Please enter your name");
    if (!phone.trim()) return notify.warning("Please enter your phone number");
    if (phone.replace(/\D/g, '').length < 10) return notify.warning("Please enter a valid 10-digit phone number");
    
    if (!tempUserData) return notify.error("Session expired");
    
    setLoading(true);
    try {
      let userData;
      
      if (isPhoneSignup) {
        // Phone OTP signup - create new user document
        if (!email.trim()) return notify.warning("Please enter your email");
        
        userData = await createUserDocument({
          uid: tempUserData.uid,
          phone: phone.replace(/\D/g, ''),
          name: name.trim(),
          email: email.trim(),
          role: 'user'
        });
      } else {
        // Email/Google signup - update existing user with phone number
        userData = await updateUser(tempUserData.uid, {
          name: name.trim(),
          phone: phone.replace(/\D/g, ''),
          profile_completed: true,
          last_login: new Date().toISOString()
        });
      }
      
      const completeUser = {
        uid: tempUserData.uid,
        email: email.trim() || tempUserData.email,
        phone: phone.replace(/\D/g, ''),
        name: name.trim(),
        role: userData?.role || 'user',
        token: tempUserData.token,
        profile_completed: true
      };
      
      // Update localStorage first
      localStorage.setItem("sfm_current_user", JSON.stringify(completeUser));
      localStorage.removeItem("sfm_temp_user");
      
      // Set user state
      setUser(completeUser);
      
      notify.success("Profile completed successfully! Welcome to Sakthi Fish Market!");
      
      // Navigate to products
      setTimeout(() => {
        navigate("/products", { replace: true });
      }, 200);
    } catch (err) {
      notify.error(err.message || "Failed to complete profile");
      setLoading(false);
    }
  };

  if (!tempUserData) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border border-primary/10 bg-card rounded-3xl shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Fish className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            {isPhoneSignup 
              ? `Phone verified: ${tempUserData?.phone || "Unknown"}`
              : `Signed in with: ${tempUserData?.email || "Unknown"}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={completeSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input 
                id="name"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Your full name"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input 
                id="phone"
                type="tel"
                value={phone} 
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ''))} 
                placeholder="9876543210" 
                required 
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">Enter 10-digit phone number</p>
            </div>
            
            {isPhoneSignup && (
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email"
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="you@example.com" 
                  required 
                />
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Completing Profile..." : "Complete Profile"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              By completing your profile, you agree to our terms and conditions.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}