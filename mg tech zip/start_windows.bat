@echo off
cd /d "%~dp0"
py -m venv .venv
call .venv\Scripts\activate
python -m pip install -r requirements.txt
set /p MG_SESSION_SECRET=Enter a long random session secret (or press Enter for temporary): 
python -m uvicorn server:app --host 127.0.0.1 --port 8000
pause
