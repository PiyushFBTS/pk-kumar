// Centralised, validated environment access.
// Throws early at startup if a required variable is missing.
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  jwt: {
    accessSecret: required("JWT_SECRET"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    accessTtl: optional("JWT_ACCESS_TTL", "15m"),
    refreshTtl: optional("JWT_REFRESH_TTL", "7d"),
  },
  mail: {
    host: optional("SMTP_HOST"),
    port: Number(optional("SMTP_PORT", "587")),
    user: optional("SMTP_USER"),
    pass: optional("SMTP_PASS"),
    from: optional("MAIL_FROM", "no-reply@prkumar.in"),
    toFirm: optional("MAIL_TO_FIRM", "prkumar@prkumar.in"),
  },
  upload: {
    dir: optional("UPLOAD_DIR", "./public/uploads"),
    maxMb: Number(optional("MAX_UPLOAD_MB", "5")),
  },
  siteUrl: optional("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
} as const;
