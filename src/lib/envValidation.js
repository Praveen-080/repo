const isMissing = (value) => typeof value !== "string" || value.trim() === "";

export const REQUIRED_FIREBASE_ENV = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
  "VITE_FIREBASE_MEASUREMENT_ID",
];

export const REQUIRED_CLOUDINARY_ENV = [
  "VITE_CLOUDINARY_CLOUD_NAME",
  "VITE_CLOUDINARY_UNSIGNED_PRESET",
  "VITE_CLOUDINARY_API_KEY",
];

export function assertRequiredEnv(keys, context = "App") {
  const missing = keys.filter((key) => isMissing(import.meta.env[key]));
  if (!missing.length) return;

  const message = `[Env Validation][${context}] Missing required Vite env variable(s): ${missing.join(", ")}. Add them to .env.local and rebuild.`;
  console.error(message);

  if (import.meta.env.PROD) {
    throw new Error(message);
  }
}

let hasValidatedAppEnv = false;

export function validateAppEnv() {
  if (hasValidatedAppEnv) return;
  hasValidatedAppEnv = true;

  assertRequiredEnv(REQUIRED_FIREBASE_ENV, "Firebase");
  assertRequiredEnv(REQUIRED_CLOUDINARY_ENV, "Cloudinary");
}
