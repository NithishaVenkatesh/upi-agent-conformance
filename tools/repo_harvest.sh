#!/usr/bin/env bash
# Clone a repo to a SCRATCH area (never into research/), then emit a structural census.
# Usage: tools/repo_harvest.sh <repo_id> <git_url>
set -euo pipefail
REPO_ID="${1:?repo_id required}"; URL="${2:?git url required}"
SCRATCH="/tmp/rzp_scratch/$REPO_ID"
OUT="$(pwd)/research/04_repositories/$REPO_ID"
mkdir -p "$SCRATCH" "$OUT"

if [ ! -d "$SCRATCH/.git" ]; then
  git clone --depth 50 --quiet "$URL" "$SCRATCH" 2>/dev/null || { echo "CLONE_FAILED $REPO_ID $URL"; exit 1; }
fi

cd "$SCRATCH"
set +e   # census steps may exit non-zero (git grep = 1 on no match); never abort the census
{
  echo "# Repo census: $REPO_ID"
  echo; echo "- source: $URL"
  echo "- head: $(git rev-parse --short HEAD)"
  echo "- last commit: $(git log -1 --format=%cI)"
  echo "- first commit: $(git log --reverse --format=%cI | head -1)"
  echo "- commits (shallow 50): $(git rev-list --count HEAD)"
  echo "- authors: $(git shortlog -sn HEAD 2>/dev/null | head -10 | tr '\n' ';')"
  echo "- tracked files: $(git ls-files | wc -l | tr -d ' ')"
  echo "- repo size: $(du -sh .git 2>/dev/null | cut -f1)"
  echo
  echo "## Language mix (tracked, by file count)"
  git ls-files | sed -n 's/.*\.\([A-Za-z0-9]\{1,8\}\)$/\1/p' | sort | uniq -c | sort -rn | head -25
  echo
  echo "## Largest tracked source files"
  git ls-files -z | xargs -0 du -k 2>/dev/null | sort -rn | head -30
  echo
  echo "## Signal files present"
  for f in README.md ARCHITECTURE.md Dockerfile docker-compose.yml docker-compose.yaml Makefile \
           package.json requirements.txt pyproject.toml go.mod Cargo.toml pom.xml \
           .env.example .github/workflows vercel.json railway.json fly.toml; do
    [ -e "$f" ] && echo "  PRESENT  $f"
  done
  echo
  echo "## Directory tree (depth 3, excluding vendor/build)"
  find . -maxdepth 3 -type d \
    ! -path './.git*' ! -path '*/node_modules*' ! -path '*/.venv*' ! -path '*/venv*' \
    ! -path '*/__pycache__*' ! -path '*/dist*' ! -path '*/build*' ! -path '*/.next*' \
    | sort | sed 's|^\./||'
  echo
  echo "## Heuristic signal grep (counts)"
  for pat in 'openai\|anthropic\|gemini\|litellm\|langchain\|llamaindex\|crewai\|autogen' \
             'prompt' 'retry\|backoff\|tenacity' 'audit' 'precision\|recall\|f1_score\|confusion' \
             'eval\b\|evaluate\|benchmark' 'webhook' 'razorpay\|stripe\|paypal\|adyen' \
             'try:\|except\|catch\s*(' 'test_\|describe(\|it(' 'TODO\|FIXME\|HACK' \
             'demo_mode\|MOCK\|hardcod\|dummy\|sample_data'; do
    n=$(grep -rIiE --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.venv -c "$pat" . 2>/dev/null | awk -F: '{s+=$NF} END{print s+0}')
    printf "  %-55s %s\n" "$pat" "$n"
  done
} > "$OUT/repo_census.md" 2>&1

echo "OK $REPO_ID -> $OUT/repo_census.md  (scratch: $SCRATCH)"
