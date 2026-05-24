export const AUTH_CONFIG = {
  username: process.env.AUTH_USERNAME ?? "admin",
  password: process.env.AUTH_PASSWORD ?? "Blogbonito123",
  sessionSecret:
    process.env.AUTH_SESSION_SECRET ?? "medcof-editais-dev-secret-change-me-in-prod",
  cookieName: "mc_session",
  cookieMaxAgeSeconds: 60 * 60 * 24 * 7,
} as const;
