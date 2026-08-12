#!/usr/bin/env python3
from __future__ import annotations
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
try:
    from pydriller import Repository
except ImportError:
    print("pip install -r requirements-tools.txt", file=sys.stderr)
    raise SystemExit(1)
n = 0
for _ in Repository(str(ROOT)).traverse_commits():
    n += 1
    if n >= 5:
        break
out = {"project_root": str(ROOT), "commits_sampled": n}
(ROOT / "reports" / "pydriller").mkdir(parents=True, exist_ok=True)
(ROOT / "reports" / "pydriller" / "churn.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
print(json.dumps(out, indent=2))
