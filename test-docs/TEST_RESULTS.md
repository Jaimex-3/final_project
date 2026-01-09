# Test Results

Date: 2025-01-09  
Environment: local sandbox, Python venv at `src/backend/venv`

## Backend unit tests
- Command: `PYTHONPATH=src/backend ./src/backend/venv/bin/pytest tests/unit -q --full-trace`
- Result: **Passed** — 13 passed, 0 failed.
- Duration: ~0.6s

### Notes
- Pytest installed in `src/backend/venv`.
- Fixtures updated to use datetimes, reusable roles/users/rooms/students, unique exam code, and cleanup seating/checkin data per test to avoid constraint conflicts.
- Warnings: LegacyAPIWarning for `Query.get()` in `app/api/checkins.py` (SQLAlchemy 2.0). Tests still pass.
