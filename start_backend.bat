@echo off
echo Iniciando backend NLP (FastAPI)...
cd /d "%~dp0"
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload
pause
