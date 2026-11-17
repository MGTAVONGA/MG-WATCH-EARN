#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
export MG_SESSION_SECRET="${MG_SESSION_SECRET:-$(python -c 'import secrets; print(secrets.token_urlsafe(48))')}"
python -m uvicorn server:app --host 127.0.0.1 --port 8000
