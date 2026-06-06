# Deployment & Launch Checklist — P. R. Kumar & Co.

This covers taking the app from local to production. Items marked **(ops)** require
accounts/infrastructure outside the codebase.

## 1. Environment

Copy `.env.example` → `.env` (production) and set real values:

| Variable                           | Notes                                                                               |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| `DATABASE_URL`                     | Production MySQL 8 connection string                                                |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | **Generate strong unique secrets** (see below)                                      |
| `SMTP_HOST/PORT/USER/PASS`         | A real transactional provider (SES, SendGrid, Postmark) so mail isn't spam-foldered |
| `MAIL_FROM`, `MAIL_TO_FIRM`        | Verified sender + the firm inbox that receives enquiries/applications               |
| `NEXT_PUBLIC_SITE_URL`             | `https://www.prkumar.in` (canonical URL — drives metadata, sitemap, OG, JSON-LD)    |
| `MAX_UPLOAD_MB`                    | Upload size cap (default 5)                                                         |

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## 2. Database

```bash
npm run db:deploy   # applies migrations (prisma migrate deploy) — no dev prompts
npm run db:seed     # first deploy only: partners, practice areas, resources, admin user
```

- **Change the seeded admin password immediately** (`admin@prkumar.in` / `ChangeMe@123`).
- **(ops)** Schedule automated backups (e.g. mysqldump nightly + retention, or managed-DB snapshots).
- Persist uploads: `public/uploads/` (cover images) and `private-uploads/resumes/` (PII) must live on
  durable storage. On ephemeral/serverless hosts, move both to an object store (S3) — `private-uploads`
  must remain non-public and only reachable through the admin resume route.

## 3. Build & run

```bash
npm ci
npm run db:generate
npm run build
npm run start        # serves the production build
```

Run behind a process manager (pm2/systemd) or a container; put a reverse proxy
(NGINX/Caddy) or platform load balancer in front for TLS.

## 4. Security (implemented)

- Security headers + CSP, `poweredByHeader: false` — `next.config.ts`
- Auth: bcrypt(12) hashing, JWT in httpOnly/SameSite cookies, sliding session
- Route protection: `proxy.ts` (optimistic) + server-side guards (authoritative)
- Input validation with zod on every write endpoint
- Stored-XSS prevention: article HTML sanitized (DOMPurify) on save
- Rate limiting + honeypots on public forms (login, register, enquiry, careers, upload)
- Resumes (PII) stored outside `public/`, served only via the admin-gated route

**To do / tighten:**

- **(ops)** Enforce HTTPS at the proxy (HSTS header is already set; only effective over TLS).
- Tighten CSP `script-src` with nonces if a stricter policy is required (currently allows `'unsafe-inline'`).
- The in-memory rate limiter is per-instance — move to Redis if running multiple instances.

## 5. SEO (implemented)

- Per-page metadata + OpenGraph/Twitter; `metadataBase` from `NEXT_PUBLIC_SITE_URL`
- `sitemap.xml`, `robots.txt` (disallows `/admin`, `/account`, auth)
- JSON-LD: `AccountingService` (site-wide) + `Article` (blog posts)
- **(ops)** Add analytics (e.g. Plausible/GA) and submit the sitemap in Search Console.

## 6. Monitoring & ops

- Health check: `GET /api/health` (returns 503 if the DB is unreachable) — point uptime monitoring here.
- **(ops)** Wire an error monitor (e.g. Sentry) into `app/error.tsx` / `app/global-error.tsx`
  (currently `console.error`).
- **(ops)** Centralised logs + alerting.

## 7. Content before launch

- Replace the initials-avatar placeholders with real partner photos (`leadership` grid + profiles).
- Confirm whether named clients (Haldiram's etc.) may appear publicly; if approved, add a clients strip
  (currently a generic sector strip — see `IMPLEMENTATION_PLAN.md` §9.6).
- Final copy review across all pages.

## 8. Pre-launch smoke test

- [ ] `/api/health` returns `{"status":"ok"}`
- [ ] Register → write article → submit; admin approves → appears on `/thought-leadership/blogs`
- [ ] Contact + Careers forms submit; firm inbox receives mail; applicant gets acknowledgement
- [ ] Admin resume download works; logged-out users get 403
- [ ] `/admin` blocked for non-admins; redirects work
- [ ] Security headers present (`curl -I https://<domain>`)
- [ ] Lighthouse: performance, a11y, SEO, best-practices all ≥ 90

## 9. DNS / TLS **(ops)**

- Point the domain at the host; issue a TLS certificate (Let's Encrypt/managed).
- Redirect `http → https` and apex ↔ `www` to the canonical `NEXT_PUBLIC_SITE_URL`.
