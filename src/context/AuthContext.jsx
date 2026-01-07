import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { initMockData, authenticateWithPassword, registerUser } from "@/services/mockApi";
import { checkUserExists, updateUserLastLogin, createUser } from '@/services/_firestoreUsers';
import { ensureRecaptcha, renderRecaptcha, sendOtpToPhone, confirmOtp } from "@/integrations/firebase/phoneAuth";
import { auth } from '@/integrations/firebase/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  // OTP confirmation state handled inside phoneAuth service; we only track UI flags here
  const [otpSessionStarted, setOtpSessionStarted] = useState(false);

  // Restore auth state from Firebase + localStorage on mount
  useEffect(() => {
    initMockData(); // legacy local users
    
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase user is signed in
        console.log('[Auth] Firebase user detected:', firebaseUser.uid);
        
        // Check if we have user data in localStorage
        const raw = localStorage.getItem("sfm_current_user");
        if (raw) {
          const storedUser = JSON.parse(raw);
          // Verify the stored user matches Firebase user
          if (storedUser.uid === firebaseUser.uid) {
            console.log('[Auth] Restored user from localStorage:', storedUser.uid);
            setUser(storedUser);
            setAuthLoading(false);
            return;
          }
        }
        
        // If no valid localStorage data, fetch from Firestore
        try {
          const userData = await checkUserExists(firebaseUser.uid);
          if (userData && userData.uid) {
            const token = await firebaseUser.getIdToken();
            const u = {
              uid: userData.uid,
              phone: userData.phone || firebaseUser.phoneNumber,
              name: userData.name || '',
              email: userData.email || '',
              role: userData.role || 'user',
              token
            };
            localStorage.setItem("sfm_current_user", JSON.stringify(u));
            localStorage.setItem("sfm_user_id_token", token);
            setUser(u);
            console.log('[Auth] User data fetched and restored:', u.uid);
          }
        } catch (error) {
          console.error('[Auth] Failed to fetch user data:', error);
        }
      } else {
        // No Firebase user signed in
        console.log('[Auth] No Firebase user signed in');
        localStorage.removeItem('sfm_current_user');
        localStorage.removeItem('sfm_user_id_token');
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Centralized function to set up reCAPTCHA. This should be called in the component
  // where the reCAPTCHA container div exists.
  const setupRecaptcha = useCallback((containerId = "recaptcha-container") => {
    try {
      ensureRecaptcha(containerId); // visible in dev by service logic
      renderRecaptcha();
    } catch (e) {
      console.warn("[AuthContext] reCAPTCHA setup failed:", e.message || e);
    }
  }, []);

  const loginWithPassword = useCallback(async ({ email, password }) => {
    const u = authenticateWithPassword({ email, password });
    localStorage.setItem("sfm_current_user", JSON.stringify(u));
    setUser(u);
    setShowLogin(false);
    return u;
  }, []);

  // Firebase Email/Password Sign In
  const loginWithEmail = useCallback(async ({ email, password }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();
      
      // Fetch user data from Firestore
      const userData = await checkUserExists(firebaseUser.uid);
      
      if (userData && userData.uid) {
        await updateUserLastLogin(firebaseUser.uid);
        
        // Check if profile is complete (has name and phone)
        const isProfileComplete = userData.name && userData.phone;
        
        const u = {
          uid: userData.uid,
          email: userData.email || firebaseUser.email,
          phone: userData.phone || '',
          name: userData.name || '',
          token,
          profile_completed: isProfileComplete
        };
        
        if (!isProfileComplete) {
          // Store as temp user and redirect to profile completion
          localStorage.setItem("sfm_temp_user", JSON.stringify({
            uid: u.uid,
            email: u.email,
            phone: u.phone || '',
            name: u.name || '',
            token,
            needsProfileCompletion: true
          }));
          localStorage.setItem("sfm_user_id_token", token);
          throw new Error("PROFILE_INCOMPLETE");
        }
        
        localStorage.setItem("sfm_current_user", JSON.stringify(u));
        localStorage.setItem("sfm_user_id_token", token);
        setUser(u);
        setShowLogin(false);
        return u;
      } else {
        throw new Error("User account not found. Please sign up first.");
      }
    } catch (error) {
      if (error.message === "PROFILE_INCOMPLETE") {
        throw error;
      }
      if (error.code === 'auth/invalid-credential') {
        throw new Error("Invalid email or password");
      } else if (error.code === 'auth/user-not-found') {
        throw new Error("No account found with this email");
      } else if (error.code === 'auth/wrong-password') {
        throw new Error("Incorrect password");
      }
      throw new Error(error.message || "Login failed");
    }
  }, []);

  // Firebase Email/Password Sign Up
  const signupWithEmail = useCallback(async ({ email, password, name, phone = "" }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();
      
      // Create user in Firestore with complete profile
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: name || '',
        phone: phone || '',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        profile_completed: !!(name && phone)
      };
      
      await createUser(userData);
      
      const u = {
        uid: userData.uid,
        email: userData.email,
        phone: userData.phone,
        name: userData.name,
        token,
        profile_completed: userData.profile_completed
      };
      
      localStorage.setItem("sfm_current_user", JSON.stringify(u));
      localStorage.setItem("sfm_user_id_token", token);
      setUser(u);
      setShowLogin(false);
      return u;
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("Email already in use. Please login instead.");
      } else if (error.code === 'auth/weak-password') {
        throw new Error("Password should be at least 6 characters");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("Invalid email address");
      }
      throw new Error(error.message || "Signup failed");
    }
  }, []);

  // Google Sign In
  const loginWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();
      
      // Check if user exists in Firestore
      const userData = await checkUserExists(firebaseUser.uid);
      
      if (userData && userData.uid) {
        // Existing user - just log them in
        await updateUserLastLogin(firebaseUser.uid);
        
        const u = {
          uid: userData.uid,
          email: userData.email || firebaseUser.email,
          phone: userData.phone || '',
          name: userData.name || firebaseUser.displayName || '',
          token,
          profile_completed: userData.profile_completed
        };
        
        localStorage.setItem("sfm_current_user", JSON.stringify(u));
        localStorage.setItem("sfm_user_id_token", token);
        setUser(u);
        setShowLogin(false);
        return u;
      } else {
        // New user - redirect to profile completion for name and phone
        const newUserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || '',
          phone: '',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          profile_completed: false
        };
        
        await createUser(newUserData);
        
        // Store temp user for profile completion
        localStorage.setItem("sfm_temp_user", JSON.stringify({
          uid: newUserData.uid,
          email: newUserData.email,
          phone: '',
          name: newUserData.name,
          token,
          needsProfileCompletion: true
        }));
        localStorage.setItem("sfm_user_id_token", token);
        throw new Error("PROFILE_INCOMPLETE");
      }
    } catch (error) {
      if (error.message === "PROFILE_INCOMPLETE") {
        throw error;
      }
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error("Sign in cancelled");
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }
      throw new Error(error.message || "Google sign in failed");
    }
  }, []);

  const signup = useCallback(async ({ email, name, password, role = "user", phone = "" }) => {
    const u = registerUser({ email, name, password, role, phone });
    localStorage.setItem("sfm_current_user", JSON.stringify(u));
    setUser(u);
    setShowLogin(false);
    return u;
  }, []);

  const sendOtp = useCallback(async ({ phone = "" }) => {
    const raw = String(phone).trim();
    if (!raw) throw new Error("Enter phone number");
    try {
      await sendOtpToPhone(raw, { countryPrefix: "+91" });
      setOtpSessionStarted(true);
      return { success: true };
    } catch (err) {
      // Provide clearer guidance for common environment issues
      if (err?.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number — please check and try again.');
      }
      if (err?.code === "auth/invalid-app-credential") {
        throw new Error("Invalid app credential. Check Firebase console: enable Phone provider & add this development domain under Authentication > Settings > Authorized domains.");
      }
      throw new Error(err?.message || "Failed to send OTP");
    }
  }, []);

  // Firebase OTP: step 2 verify
  const loginWithOTP = useCallback(async ({ otp = "", name = "", email = "" }) => {
    if (!otpSessionStarted) throw new Error("No OTP session. Send OTP first.");
    if (!otp || otp.length < 6) throw new Error("Enter 6-digit OTP");
    try {
      const res = await confirmOtp(otp);
      const firebaseUser = res.user;
      
      // Obtain ID token for protected routes
      const token = await firebaseUser.getIdToken();
      
      // Check if user exists in Firestore
      try {
        const userData = await checkUserExists(firebaseUser.uid);
        
        if (userData && userData.uid) {
          // Existing user - update last login and set user state
          await updateUserLastLogin(firebaseUser.uid);
          console.log('[Auth] Existing user logged in:', firebaseUser.uid);
          
          // Build complete user object from Firestore data
          const u = {
            uid: userData.uid,
            phone: userData.phone || firebaseUser.phoneNumber,
            name: userData.name || name,
            email: userData.email || email,
            token
          };
          
          localStorage.setItem("sfm_current_user", JSON.stringify(u));
          localStorage.setItem("sfm_user_id_token", token);
          setUser(u);
          setShowLogin(false);
          setOtpSessionStarted(false);
          return u;
        } else {
          // New user - needs to complete signup
          console.log('[Auth] New user detected, needs signup:', firebaseUser.uid);
          // Store temporary auth data for signup completion
          const tempUser = {
            uid: firebaseUser.uid,
            phone: firebaseUser.phoneNumber,
            token,
            needsSignup: true
          };
          localStorage.setItem("sfm_temp_user", JSON.stringify(tempUser));
          localStorage.setItem("sfm_user_id_token", token);
          setOtpSessionStarted(false);
          
          // Return special flag to indicate signup needed
          throw new Error("SIGNUP_REQUIRED");
        }
      } catch (err) {
        if (err.message === "SIGNUP_REQUIRED") {
          throw err;
        }
        console.error('[Auth] Firestore check failed:', err?.message || err);
        throw new Error("Failed to verify user account. Please try again.");
      }
    } catch (err) {
      if (err.message === "SIGNUP_REQUIRED") {
        throw err; // Re-throw to be handled by LoginModal
      }
      const msg = err.code === 'auth/invalid-verification-code' ? "Invalid OTP. Try again." : (err.message || "Invalid or expired OTP");
      throw new Error(msg);
    }
  }, [otpSessionStarted]);

  const logout = useCallback(async () => {
    try {
      await auth.signOut();
      console.log('[Auth] Firebase sign out successful');
    } catch (error) {
      console.error('[Auth] Firebase sign out failed:', error);
    }
    localStorage.removeItem('sfm_current_user');
    localStorage.removeItem('sfm_user_id_token');
    localStorage.removeItem('sfm_temp_user');
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    setUser,
    showLogin,
    setShowLogin,
    authLoading,
    loginWithPassword,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    signup,
    loginWithOTP,
    sendOtp,
    logout,
    setupRecaptcha,
  }), [user, showLogin, authLoading, loginWithPassword, loginWithEmail, signupWithEmail, loginWithGoogle, signup, loginWithOTP, sendOtp, logout, setupRecaptcha]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}