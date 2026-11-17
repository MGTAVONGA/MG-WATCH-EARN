MG TECH — CYBER SECURITY LEARNING PLATFORM (VERSION 2.1)
=======================================================

WHAT THIS BUILD DOES
- Responsive browser-based learning platform with MG TECH branding.
- Real local account registration/sign-in using salted PBKDF2-HMAC-SHA256 password hashes.
- Signed HttpOnly session cookie; server-side profile and learning progress.
- Basic in-process throttling on login/register endpoints.
- Offline password-strength feedback and IPv4 private-range classification.
- Defensive security checklist, beginner lessons, fictional quiz lab and offline help guide.
- PWA shell caching for installable browser experience; API/account data is never cached by the service worker.
- Docker staging files and deployment/legal-review drafts.

RUN ON WINDOWS
1. Install Python 3.10+ and enable Add Python to PATH.
2. Extract the ZIP.
3. Double-click start_windows.bat.
4. Visit http://127.0.0.1:8000 and create an account.

RUN ON macOS / LINUX
1. Install Python 3.10+.
2. Run: chmod +x start_unix.sh && ./start_unix.sh
3. Visit http://127.0.0.1:8000.

DOCKER STAGING
See DEPLOYMENT.md. Copy .env.example to .env and set a unique MG_SESSION_SECRET before starting Docker Compose. The compose port binds to localhost. Put a properly configured HTTPS reverse proxy in front of it for staging.

TESTS
Install requirements, then run: python -m unittest tests_smoke

IMPORTANT: HONEST STATUS
This is an operational local MVP / staging starter, not a finished commercial international SaaS. No live AI provider, payment processing, email verification, password reset, PostgreSQL, remote scanning, real penetration-testing engine, signed Android APK or Windows installer is included. The AI assistant is an offline topic guide. Security tools are deliberately offline/educational and do not probe real systems.

Before public launch, complete every item in DEPLOYMENT.md. The privacy policy and terms files are drafts requiring operator details and legal review. Do not expose the development server directly to the internet or test systems without explicit written authorisation.

STACK: Python, FastAPI, SQLite, HTML/CSS/JavaScript, PWA service worker.
BRAND: MG TECH — Think smart. Stay secure. Build the future.
