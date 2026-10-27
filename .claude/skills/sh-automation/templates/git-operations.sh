#!/bin/bash
set -e

# Description: Git automation workflows
# Usage: ./git-operations.sh [command]

# ============================================
# BASIC OPERATIONS
# ============================================

# Quick commit with message
quick_commit() {
  local message="${1:-Quick update}"
  git add -A
  git commit -m "$message"
}

# Commit and push
commit_push() {
  local message="${1:-Update}"
  git add -A
  git commit -m "$message"
  git push
}

# Pull latest and rebase
sync_branch() {
  git fetch origin
  git rebase origin/main
}

# ============================================
# BRANCH OPERATIONS
# ============================================

# Create feature branch
new_feature() {
  local branch_name="$1"
  git checkout main
  git pull origin main
  git checkout -b "feature/$branch_name"
}

# Create bugfix branch
new_bugfix() {
  local branch_name="$1"
  git checkout main
  git pull origin main
  git checkout -b "bugfix/$branch_name"
}

# Delete merged branches
cleanup_branches() {
  git fetch -p
  git branch --merged main | grep -v "main" | xargs -n 1 git branch -d
}

# ============================================
# STASH OPERATIONS
# ============================================

# Stash with description
stash_save() {
  local description="${1:-WIP}"
  git stash push -m "$description"
}

# List stashes
stash_list() {
  git stash list
}

# Apply and drop latest stash
stash_pop() {
  git stash pop
}

# ============================================
# STATUS & INFO
# ============================================

# Show status summary
status_summary() {
  echo "=== Branch ==="
  git branch --show-current
  echo ""
  echo "=== Status ==="
  git status -s
  echo ""
  echo "=== Recent Commits ==="
  git log --oneline -5
}

# Show uncommitted changes count
changes_count() {
  local count=$(git status --porcelain | wc -l | tr -d ' ')
  echo "$count uncommitted changes"
}

# ============================================
# UNDO OPERATIONS
# ============================================

# Undo last commit (keep changes)
undo_commit() {
  git reset --soft HEAD~1
}

# Discard all local changes
discard_changes() {
  git checkout .
  git clean -fd
}

# ============================================
# PRACTICAL WORKFLOWS
# ============================================

# Morning sync: pull all repos
morning_sync() {
  local repos=(
    ~/Projects/repo1
    ~/Projects/repo2
    ~/Projects/repo3
  )

  for repo in "${repos[@]}"; do
    echo "Syncing $repo..."
    cd "$repo"
    git pull --rebase
  done
}

# End of day: commit WIP
end_of_day() {
  if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "WIP: End of day $(date '+%Y-%m-%d')"
    git push
  else
    echo "No changes to commit"
  fi
}

# PR ready: squash and push
pr_ready() {
  local base="${1:-main}"
  local commit_count=$(git rev-list --count HEAD ^origin/$base)

  if [ "$commit_count" -gt 1 ]; then
    git rebase -i HEAD~$commit_count
  fi

  git push --force-with-lease
}
