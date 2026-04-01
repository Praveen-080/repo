export const GOOGLE_WEB_CLIENT_ID_FALLBACK =
  "697772392345-npci85spboio8aefr5com0vh8984jt0d.apps.googleusercontent.com";

const PLACEHOLDER_VALUES = new Set([
  "your-web-client-id.apps.googleusercontent.com",
  "Your Web Client Key",
]);

export function resolveGoogleWebClientId() {
  const envValue = String(import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID || "").trim();
  const hasValidEnvValue = envValue.length > 0 && !PLACEHOLDER_VALUES.has(envValue);

  if (hasValidEnvValue) {
    return {
      clientId: envValue,
      source: "env",
    };
  }

  return {
    clientId: GOOGLE_WEB_CLIENT_ID_FALLBACK,
    source: "fallback",
  };
}