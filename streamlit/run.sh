#!/bin/sh
set -eu
exec .venv/bin/streamlit run app.py --server.address=127.0.0.1 --server.port="${PORT:-8501}" --server.headless=true --browser.gatherUsageStats=false
