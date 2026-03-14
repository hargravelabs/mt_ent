#!/usr/bin/env bash
set -euo pipefail

# Push commits to GitHub via the REST API.
# Bypasses Zscaler/corporate proxy that blocks git-receive-pack POST requests.
#
# Usage:
#   npm run push            # push current branch
#   ./scripts/git-api-push.sh [--force]

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[info]${NC}  $*"; }
ok()    { echo -e "${GREEN}[ok]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[warn]${NC}  $*"; }
error() { echo -e "${RED}[error]${NC} $*" >&2; }
fatal() { error "$*"; exit 1; }

FORCE=false
for arg in "$@"; do
  case "$arg" in
    --force|-f) FORCE=true ;;
    --help|-h)
      echo "Usage: $0 [--force]"
      echo "  --force  Force-push (overwrite remote ref)"
      exit 0
      ;;
    *) fatal "Unknown argument: $arg" ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# --- Token resolution ---
# Priority: GITHUB_TOKEN env var > GH_TOKEN env var > .env file
resolve_token() {
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    echo "$GITHUB_TOKEN"
    return
  fi
  if [[ -n "${GH_TOKEN:-}" ]]; then
    echo "$GH_TOKEN"
    return
  fi
  if [[ -f "$PROJECT_ROOT/.env" ]]; then
    local token
    token=$(grep -E '^GITHUB_TOKEN=' "$PROJECT_ROOT/.env" | cut -d'=' -f2- | tr -d '"' | tr -d "'" | tr -d ' ')
    if [[ -n "$token" ]]; then
      echo "$token"
      return
    fi
  fi
  return 1
}

TOKEN=$(resolve_token) || fatal "No GitHub token found.\n  Set GITHUB_TOKEN env var or add GITHUB_TOKEN=ghp_xxx to .env"

# --- Repo & branch detection ---
REMOTE_URL=$(git remote get-url origin 2>/dev/null) || fatal "No 'origin' remote configured"
REPO=$(echo "$REMOTE_URL" | sed -E 's#.*(github\.com[:/])##; s#\.git$##')
BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null) || fatal "Detached HEAD — checkout a branch first"
API="https://api.github.com/repos/$REPO"

info "Repo:   $REPO"
info "Branch: $BRANCH"

# --- Validate token ---
api_call() {
  local method="$1" endpoint="$2"
  shift 2
  curl -sf -X "$method" \
    -H "Authorization: token $TOKEN" \
    -H "Content-Type: application/json" \
    "$@" \
    "$API/$endpoint"
}

api_call_raw() {
  local method="$1" endpoint="$2"
  shift 2
  curl -s -w "\n%{http_code}" -X "$method" \
    -H "Authorization: token $TOKEN" \
    -H "Content-Type: application/json" \
    "$@" \
    "$API/$endpoint"
}

validate_token() {
  local response http_code body
  response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: token $TOKEN" \
    "https://api.github.com/user")
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')

  if [[ "$http_code" != "200" ]]; then
    fatal "Token validation failed (HTTP $http_code). Check your GITHUB_TOKEN."
  fi

  local user
  user=$(echo "$body" | python3 -c "import sys,json; print(json.load(sys.stdin).get('login',''))" 2>/dev/null)
  ok "Authenticated as: $user"
}

validate_token

# --- Check remote ref ---
get_remote_sha() {
  local response http_code body
  response=$(api_call_raw GET "git/refs/heads/$BRANCH")
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')

  if [[ "$http_code" == "404" ]]; then
    echo "NEW_BRANCH"
    return
  fi
  if [[ "$http_code" != "200" ]]; then
    fatal "Failed to fetch remote ref (HTTP $http_code)"
  fi
  echo "$body" | python3 -c "import sys,json; print(json.load(sys.stdin)['object']['sha'])"
}

REMOTE_SHA=$(get_remote_sha)
LOCAL_SHA=$(git rev-parse HEAD)

if [[ "$REMOTE_SHA" == "$LOCAL_SHA" ]]; then
  ok "Already up to date. Nothing to push."
  exit 0
fi

if [[ "$REMOTE_SHA" == "NEW_BRANCH" ]]; then
  info "Remote branch doesn't exist yet — will create it"
  COMMITS_TO_PUSH=$(git rev-list --count HEAD)
  COMMIT_LIST=$(git rev-list --reverse HEAD)
  BASE_MODE="new"
else
  COMMITS_TO_PUSH=$(git rev-list --count "$REMOTE_SHA..$LOCAL_SHA" 2>/dev/null || echo "0")

  if [[ "$COMMITS_TO_PUSH" == "0" ]]; then
    if [[ "$FORCE" == "true" ]]; then
      warn "Local and remote have diverged. Force-pushing..."
      COMMITS_TO_PUSH=1
      COMMIT_LIST="$LOCAL_SHA"
      BASE_MODE="force"
    else
      error "Local and remote have diverged. Use --force to overwrite remote."
      error "  Local:  $LOCAL_SHA"
      error "  Remote: $REMOTE_SHA"
      exit 1
    fi
  else
    COMMIT_LIST=$(git rev-list --reverse "$REMOTE_SHA..$LOCAL_SHA")
    BASE_MODE="ff"
  fi
fi

info "Commits to push: $COMMITS_TO_PUSH"

# --- Upload each commit ---
push_commit() {
  local commit_sha="$1"
  local short_sha="${commit_sha:0:7}"
  local msg
  msg=$(git log -1 --format='%s' "$commit_sha")
  info "Pushing $short_sha: $msg"

  local parent_sha tree_sha
  parent_sha=$(git log -1 --format='%P' "$commit_sha" | awk '{print $1}')
  tree_sha=$(git cat-file -p "$commit_sha" | grep "^tree" | awk '{print $2}')

  # Upload blobs for changed files
  local changed_files
  if [[ -z "$parent_sha" ]]; then
    changed_files=$(git diff-tree --no-commit-id -r --name-only "$commit_sha")
  else
    changed_files=$(git diff --name-only "$parent_sha" "$commit_sha")
  fi

  if [[ -z "$changed_files" ]]; then
    warn "  No file changes in this commit, skipping blob upload"
  else
    while IFS= read -r filepath; do
      # Check if file exists in this commit (could be a deletion)
      if git cat-file -e "$commit_sha:$filepath" 2>/dev/null; then
        local content blob_response blob_sha
        content=$(git show "$commit_sha:$filepath" | base64)
        blob_response=$(api_call POST "git/blobs" \
          -d "{\"content\": \"$content\", \"encoding\": \"base64\"}") || fatal "  Failed to upload blob: $filepath"
        blob_sha=$(echo "$blob_response" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
        info "  Uploaded: $filepath ($blob_sha)"
      else
        info "  Deleted:  $filepath"
      fi
    done <<< "$changed_files"
  fi

  # Build tree entries
  local tree_json
  tree_json=$(python3 - "$commit_sha" "$parent_sha" << 'PYEOF'
import subprocess, json, sys

commit = sys.argv[1]
parent = sys.argv[2]

if parent:
    files = subprocess.check_output(
        ["git", "diff", "--name-status", parent, commit]
    ).decode().strip().split("\n")
else:
    raw = subprocess.check_output(
        ["git", "diff-tree", "--no-commit-id", "-r", "--name-status", commit]
    ).decode().strip().split("\n")
    files = raw

entries = []
for line in files:
    if not line.strip():
        continue
    parts = line.split("\t")
    status = parts[0][0]  # first char: A, M, D, R, etc.
    filepath = parts[-1]  # last element handles renames

    if status == "D":
        entries.append({"path": filepath, "mode": "100644", "type": "blob", "sha": None})
    else:
        blob_sha = subprocess.check_output(
            ["git", "rev-parse", f"{commit}:{filepath}"]
        ).decode().strip()
        mode = subprocess.check_output(
            ["git", "ls-tree", commit, filepath]
        ).decode().strip().split()[0]
        entries.append({"path": filepath, "mode": mode, "type": "blob", "sha": blob_sha})

print(json.dumps(entries))
PYEOF
  ) || fatal "  Failed to build tree entries"

  # Create tree
  local base_tree_sha tree_response new_tree_sha
  if [[ -n "$parent_sha" ]]; then
    base_tree_sha=$(api_call GET "git/commits/$parent_sha" 2>/dev/null \
      | python3 -c "import sys,json; print(json.load(sys.stdin)['tree']['sha'])" 2>/dev/null) \
      || fatal "  Failed to get parent tree from API. Parent may not exist on remote."
  fi

  local tree_payload
  if [[ -n "$parent_sha" && -n "${base_tree_sha:-}" ]]; then
    tree_payload="{\"base_tree\": \"$base_tree_sha\", \"tree\": $tree_json}"
  else
    # First commit — full tree
    tree_payload="{\"tree\": $tree_json}"
  fi

  tree_response=$(api_call POST "git/trees" -d "$tree_payload") || fatal "  Failed to create tree"
  new_tree_sha=$(echo "$tree_response" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
  info "  Tree: $new_tree_sha"

  # Create commit
  local author_name author_email author_date committer_name committer_email committer_date
  author_name=$(git log -1 --format='%an' "$commit_sha")
  author_email=$(git log -1 --format='%ae' "$commit_sha")
  author_date=$(git log -1 --format='%aI' "$commit_sha")
  committer_name=$(git log -1 --format='%cn' "$commit_sha")
  committer_email=$(git log -1 --format='%ce' "$commit_sha")
  committer_date=$(git log -1 --format='%cI' "$commit_sha")

  local parents_json
  if [[ -n "$parent_sha" ]]; then
    # Use the remote parent SHA (which may differ from local if previous commits were API-created)
    local remote_parent="${CURRENT_REMOTE_TIP:-$parent_sha}"
    parents_json="[\"$remote_parent\"]"
  else
    parents_json="[]"
  fi

  local commit_payload commit_response new_commit_sha
  commit_payload=$(python3 -c "
import json
print(json.dumps({
    'message': $(git log -1 --format='%B' "$commit_sha" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read().strip()))"),
    'tree': '$new_tree_sha',
    'parents': $parents_json,
    'author':    {'name': '$author_name',    'email': '$author_email',    'date': '$author_date'},
    'committer': {'name': '$committer_name', 'email': '$committer_email', 'date': '$committer_date'}
}))
")

  commit_response=$(api_call POST "git/commits" -d "$commit_payload") || fatal "  Failed to create commit"
  new_commit_sha=$(echo "$commit_response" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
  ok "  Commit created: $new_commit_sha"

  CURRENT_REMOTE_TIP="$new_commit_sha"
}

# Track the tip as we create commits
CURRENT_REMOTE_TIP="$REMOTE_SHA"

for commit_sha in $COMMIT_LIST; do
  push_commit "$commit_sha"
done

# --- Update remote ref ---
info "Updating remote ref..."

if [[ "$REMOTE_SHA" == "NEW_BRANCH" ]]; then
  # Create new ref
  ref_response=$(api_call POST "git/refs" \
    -d "{\"ref\": \"refs/heads/$BRANCH\", \"sha\": \"$CURRENT_REMOTE_TIP\"}") \
    || fatal "Failed to create remote branch"
else
  ref_response=$(api_call_raw PATCH "git/refs/heads/$BRANCH" \
    -d "{\"sha\": \"$CURRENT_REMOTE_TIP\", \"force\": $FORCE}")
  http_code=$(echo "$ref_response" | tail -1)

  if [[ "$http_code" != "200" ]]; then
    body=$(echo "$ref_response" | sed '$d')
    fatal "Failed to update ref (HTTP $http_code): $body"
  fi
fi

ok "Remote ref updated to $CURRENT_REMOTE_TIP"

# --- Sync local tracking ---
info "Syncing local tracking ref..."
git fetch origin "$BRANCH" 2>/dev/null || warn "Fetch failed (expected with Zscaler) — syncing manually"

# Check if local is now aligned
if git merge-base --is-ancestor HEAD "origin/$BRANCH" 2>/dev/null; then
  ok "Local branch is up to date with remote."
else
  # The API commit SHAs differ from local, so reset to align
  git reset --soft "origin/$BRANCH" 2>/dev/null || true
  if git diff --cached --quiet 2>/dev/null; then
    ok "Local branch synced with remote."
  else
    warn "Local has staged changes after sync — your working changes are preserved."
  fi
fi

echo ""
ok "Push complete! $COMMITS_TO_PUSH commit(s) pushed to origin/$BRANCH"
