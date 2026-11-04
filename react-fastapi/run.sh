#!/bin/sh
set -eu
exec .venv/bin/uvicorn app:app --host 127.0.0.1 --port="${PORT:-8000}"
