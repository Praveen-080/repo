import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/integrations/firebase/firebase";

let recaptchaVerifier = null;
let confirmationResultRef = null;
let widgetIdRef = null;

export function ensureRecaptcha(containerId = "recaptcha-container", size = "normal") {
  // Prefer visible reCAPTCHA in development for easier debugging
  const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development';
  const effSize = isDev ? 'normal' : (size || 'normal');
  // Reuse if already created with same size
  if (recaptchaVerifier && recaptchaVerifier.size === effSize) return recaptchaVerifier;
  // If exists with different size, clear it first
  if (recaptchaVerifier?.clear) {
    try { recaptchaVerifier.clear(); } catch { /* ignore */ }
    recaptchaVerifier = null;
  }
  if (!document.getElementById(containerId)) {
    throw new Error(`[reCAPTCHA] Container #${containerId} not found in DOM`);
  }
  console.log(`[reCAPTCHA] Initializing verifier on #${containerId} with size: ${effSize}`);
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: effSize,
    callback: (response) => console.log("✅ reCAPTCHA solved:", response),
    "expired-callback": () => console.warn("⚠️ reCAPTCHA expired, please refresh."),
  });
  return recaptchaVerifier;
}

export async function renderRecaptcha() {
  if (!recaptchaVerifier) throw new Error("reCAPTCHA not initialized. Call ensureRecaptcha() first.");
  try {
    widgetIdRef = await recaptchaVerifier.render();
  } catch {
    // already rendered
  }
  return widgetIdRef;
}

export async function sendOtpToPhone(rawPhone, { countryPrefix = "+91", containerId = "recaptcha-container", size } = {}) {
  if (!rawPhone) throw new Error("Enter phone number");
  const digits = String(rawPhone).replace(/\D/g, "");
  if (digits.length < 10 && !String(rawPhone).startsWith("+")) {
    throw new Error("Enter valid mobile number");
  }
  const mode = (localStorage.getItem("recaptchaMode") || "normal").toLowerCase();
  const effectiveSize = size || (mode === "invisible" ? "invisible" : "normal");
  const verifier = ensureRecaptcha(containerId, effectiveSize);
  await renderRecaptcha();
  const e164 = String(rawPhone).startsWith("+") ? String(rawPhone) : `${countryPrefix}${digits}`;
  try {
    console.log("[Auth] Sending OTP to:", e164, "(size:", effectiveSize, ")");
    confirmationResultRef = await signInWithPhoneNumber(auth, e164, verifier);
    console.log("📨 OTP sent successfully to:", e164);
  } catch (err) {
    // Let Firebase's native error surface; provide minimal guidance only
    if (err?.code === "auth/too-many-requests") {
      // Automatically reset the reCAPTCHA so user can immediately attempt again (may still be blocked server-side)
  try { window.grecaptcha && window.grecaptcha.reset(widgetIdRef || undefined); } catch { /* ignore */ }
      throw new Error("Too many requests from Firebase. This is a server-side throttle; you can try again shortly or use test phone numbers in Firebase console.");
    }
    console.error("❌ OTP send error:", err?.code, err?.message || err);
    throw err;
  }
  return confirmationResultRef;
}

export async function confirmOtp(code) {
  if (!confirmationResultRef) throw new Error("No OTP session. Send OTP first.");
  console.log("[Auth] Verifying OTP code...\n");
  const res = await confirmationResultRef.confirm(code);
  console.log("✅ OTP verified. Firebase user:", res.user);
  return res;
}

export function resetRecaptcha() {
  try { window.grecaptcha && window.grecaptcha.reset(widgetIdRef || undefined); } catch { /* ignore */ }
}

export function clearOtpSession() {
  confirmationResultRef = null;
}

export function getConfirmationResult() {
  return confirmationResultRef;
}
