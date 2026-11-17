# MG TECH launch status

This is the MG TECH early MVP deployment package for Render. It is prepared and smoke-tested, but it is **not live or deployed** yet.

## Deploy to the existing GitHub repository

1. Download and extract this ZIP on your Windows PC.
2. Open the extracted folder. You should see `render.yaml`, `Dockerfile`, `server.py`, `index.html`, `app.js`, and `assets` directly inside it.
3. Open your GitHub repository `MGTAVONGA/MG-TECH` and upload the CONTENTS of this folder to the repository root (not the containing folder). If GitHub asks, replace the old starter files.
4. Commit the changes to the default branch. Never upload `.env`, passwords, API keys, or database files.
5. Open Render → **New +** → **Blueprint**. Connect `MGTAVONGA/MG-TECH`, select the branch, and review the `mg-tech` service and persistent disk before approving.
6. Wait for deployment. Open the Render service URL and visit `/health`. It should return `status: ok` and `database: connected`.
7. Register a test account, log out, log in again, and confirm the account remains after a service restart.

## Hosting cost

The included Blueprint uses a Render Starter web service and a 1 GB persistent disk. This is a paid setup, not a free-tier deployment. Confirm current pricing in Render before approving.

## Current MVP limitations — do not accept public customers or payments yet

The app currently provides an early learning-platform shell with account registration/login, profile and progress saving, learning UI, and educational cybersecurity content. It does not yet include verified email, password reset, account export/deletion, production-grade distributed rate limiting, PostgreSQL, payment processing, or a live AI service. Security exercises are educational and limited to authorized practice. Before public launch, arrange an independent security/privacy review, legally reviewed policies, support contact details, backups, monitoring, and the missing account/payment/AI features.
