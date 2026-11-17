# Deployment checklist

## Local run

Windows: run `start_windows.bat`, then visit `http://127.0.0.1:8000`.
macOS/Linux: run `chmod +x start_unix.sh && ./start_unix.sh`, then visit the same address.

## Docker staging

1. Copy `.env.example` to `.env`.
2. Set `MG_SESSION_SECRET` to a unique random secret (for example generate one with Python: `python -c "import secrets; print(secrets.token_urlsafe(64))"`).
3. Keep `.env` private and out of source control.
4. Run `docker compose up --build -d`.
5. Put a maintained reverse proxy with HTTPS in front of the app. The compose port binds to localhost only.
6. Back up the persistent `mg_data` volume and test restore procedures.

## Required before public production

- External PostgreSQL database with encrypted backups and migrations.
- Distributed rate limiting, CSRF protection/origin validation, security headers and robust audit logging.
- Email verification, password reset, account deletion/export and abuse reporting.
- HTTPS, domain, monitoring, incident response, vulnerability assessment and penetration test.
- Privacy policy, terms, cookie notice, company/operator identity and support contact reviewed by counsel.
- Payment provider merchant account, hosted checkout, webhook signature verification, subscription lifecycle, refunds and tax compliance. No payment is processed by this project.
- AI provider selection, API key stored server-side, privacy review, usage limits and safety evaluation. No live AI integration is present.
- Android package and signed Windows installer built and tested separately. This web app is PWA-capable but is not a native Android/Windows app.

Never expose the development server directly to the public internet. Keep security tools restricted to defensive/offline demonstrations unless a qualified team implements explicit authorisation, scope controls, audit trails and safe isolation.
