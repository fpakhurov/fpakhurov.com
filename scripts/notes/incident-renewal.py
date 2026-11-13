#!/usr/bin/env python3
"""Original fictional incident and local release-policy exercises. No network use."""
import hashlib
import json
import os
from fractions import Fraction
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[2]
REPORT = ROOT / "docs/reports/2026-11-13-licensed-example-renewal"


def git_history_demo():
    with tempfile.TemporaryDirectory(prefix="incident-git-") as folder:
        env = dict({key: value for key, value in os.environ.items() if not key.startswith("GIT_")},
                   GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_GLOBAL=os.devnull,
                   GIT_AUTHOR_NAME="Local fixture", GIT_AUTHOR_EMAIL="fixture@example.invalid",
                   GIT_COMMITTER_NAME="Local fixture", GIT_COMMITTER_EMAIL="fixture@example.invalid",
                   GIT_AUTHOR_DATE="2026-11-13T00:00:00+00:00",
                   GIT_COMMITTER_DATE="2026-11-13T00:00:00+00:00")
        hooks = Path(folder) / "empty-hooks"
        hooks.mkdir()
        def git(*args):
            return subprocess.run(["git", "-c", "commit.gpgsign=false",
                                   "-c", "core.hooksPath=" + str(hooks), *args],
                                  cwd=folder, env=env, check=True, capture_output=True, text=True).stdout.strip()
        git("init", "-q")
        fake = Path(folder) / "demo.env"
        fake.write_text("DEMO_TOKEN=fictional-not-a-credential\n")
        git("add", "demo.env")
        git("commit", "-qm", "Add fictional token")
        git("rm", "-q", "demo.env")
        git("commit", "-qm", "Remove file from current tree")
        historical = git("show", "HEAD~1:demo.env")
        assert historical == "DEMO_TOKEN=fictional-not-a-credential"
        return {"current_file_exists": fake.exists(), "historical_content": historical}


def policy_only(artifact, verified_receipt):
    """Model authorization AFTER a trusted verifier. Does not verify signatures."""
    if verified_receipt is None:
        return "missing verified receipt"
    expected = {
        "digest": hashlib.sha256(artifact).hexdigest(),
        "repository": "https://example.invalid/school/answer-service",
        "ref": "refs/heads/release",
        "builder": "https://example.invalid/builders/isolated-v1",
    }
    for field, value in expected.items():
        if verified_receipt.get(field) != value:
            return "reject " + field
    return "accept"


def make_results():
    minutes = [{"minute": m, "attempts": 200 if m < 4 else 400 if m < 11 else 300,
                "bad": 50 if m < 4 else 20 if m < 11 else 0} for m in range(18)]
    attempts = sum(row["attempts"] for row in minutes)
    bad = sum(row["bad"] for row in minutes)
    budget = Fraction(500000) * (1 - Fraction(995, 1000))
    assert attempts == 5700 and bad == 340 and budget == 2500
    assert sum(row["attempts"] for row in minutes[:11]) == 3600
    artifact = b"fictional answer-service release v3\n"
    receipt = {"digest": hashlib.sha256(artifact).hexdigest(),
               "repository": "https://example.invalid/school/answer-service",
               "ref": "refs/heads/release",
               "builder": "https://example.invalid/builders/isolated-v1"}
    policy = {
        "expected": policy_only(artifact, receipt),
        "changed_bytes": policy_only(artifact + b"changed", receipt),
        "wrong_repository": policy_only(artifact, dict(receipt, repository="https://example.invalid/other")),
        "wrong_ref": policy_only(artifact, dict(receipt, ref="refs/heads/experiment")),
        "wrong_builder": policy_only(artifact, dict(receipt, builder="https://example.invalid/other-builder")),
        "missing_receipt": policy_only(artifact, None),
    }
    assert list(policy.values()) == ["accept", "reject digest", "reject repository", "reject ref", "reject builder", "missing verified receipt"]
    events = [
        {"minute": 0, "en": "Permission change reaches the writer service.", "ru": "Изменение прав достигает сервиса записи."},
        {"minute": 2, "en": "The synthetic save probe alerts.", "ru": "Срабатывает синтетическая проверка сохранения."},
        {"minute": 3, "en": "On-call acknowledges and coordinates the response.", "ru": "Дежурный подтверждает вызов и координирует работу."},
        {"minute": 4, "en": "Rollout stops; partial rollback reduces failures.", "ru": "Выкладка остановлена; частичный откат уменьшает число ошибок."},
        {"minute": 6, "en": "Support receives the first impact update.", "ru": "Поддержка получает первое сообщение о последствиях."},
        {"minute": 8, "en": "Remaining workers begin refreshing their authorization state.", "ru": "Оставшиеся обработчики начинают обновлять состояние авторизации."},
        {"minute": 11, "en": "All writers recover; verification begins.", "ru": "Все обработчики восстановлены; начинается проверка."},
        {"minute": 18, "en": "Incident closes after seven healthy minute buckets.", "ru": "Инцидент закрыт после семи минутных интервалов без ошибок."},
    ]
    net_weekly_hours = Fraction(7 * 10 - 10, 60)
    return {
        "fixture": "Fictional request counters and events independently specified for this course; not production observations.",
        "minutes": minutes, "events": events,
        "totals": {"attempts": attempts, "bad": bad, "affected_window_attempts": 3600,
                   "period_attempts": 500000, "period_bad": bad, "budget": int(budget),
                   "budget_used_pct": float(100 * bad / budget),
                   "period_success_pct": float(100 * (1 - Fraction(bad, 500000))),
                   "detect_minutes": 2, "ack_minutes": 1, "mitigate_minutes": 11,
                   "verify_minutes": 7},
        "toil": {"weekly_net_hours": float(net_weekly_hours), "setup_hours": 9,
                 "break_even_weeks": float(9 / net_weekly_hours),
                 "net_hours_after_26_weeks": float(26 * net_weekly_hours - 9)},
        "git": git_history_demo(), "policy": policy,
    }


if __name__ == "__main__":
    results = make_results()
    REPORT.mkdir(parents=True, exist_ok=True)
    output = json.dumps(results, ensure_ascii=False, indent=2) + "\n"
    (REPORT / "incident-results.json").write_text(output)
    (ROOT / "src/components/figures/incidents-and-security/incident-data.json").write_text(output)
    print(json.dumps({k: results[k] for k in ("totals", "toil", "git", "policy")}, indent=2))
