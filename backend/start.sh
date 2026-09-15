#!/bin/bash
python3 seed.py || python seed.py
uvicorn app.main:app --host 0.0.0.0 --port $PORT