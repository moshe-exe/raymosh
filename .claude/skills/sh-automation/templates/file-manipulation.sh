#!/bin/bash
set -e

# Description: File and folder manipulation utilities
# Usage: ./file-manipulation.sh [command]

# ============================================
# FILE OPERATIONS
# ============================================

# Copy with backup
copy_backup() {
  local src="$1"
  local dest="$2"
  cp "$src" "${dest}.backup.$(date +%Y%m%d%H%M%S)"
  cp "$src" "$dest"
}

# Move with confirmation
safe_move() {
  local src="$1"
  local dest="$2"

  if [ -e "$dest" ]; then
    echo "Destination exists. Overwrite? (y/n)"
    read -r confirm
    [ "$confirm" != "y" ] && exit 1
  fi

  mv "$src" "$dest"
}

# Create file with content
create_file() {
  local path="$1"
  local content="$2"

  mkdir -p "$(dirname "$path")"
  echo "$content" > "$path"
}

# ============================================
# FOLDER OPERATIONS
# ============================================

# Create project structure
create_project_structure() {
  local base="$1"

  mkdir -p "$base"/{src,tests,docs,scripts}
  touch "$base/README.md"
  touch "$base/.gitignore"
}

# Clean temp files
clean_temp() {
  local dir="${1:-.}"

  find "$dir" -type f -name "*.tmp" -delete
  find "$dir" -type f -name "*.log" -delete
  find "$dir" -type f -name ".DS_Store" -delete
  find "$dir" -type d -name "__pycache__" -exec rm -rf {} +
  find "$dir" -type d -name "node_modules" -exec rm -rf {} +
}

# Archive folder
archive_folder() {
  local folder="$1"
  local archive_name="${2:-$(basename "$folder")-$(date +%Y%m%d).tar.gz}"

  tar -czvf "$archive_name" "$folder"
  echo "Created: $archive_name"
}

# ============================================
# BACKUP OPERATIONS
# ============================================

# Backup to external drive
backup_to_drive() {
  local source="$1"
  local drive="/Volumes/Backup"
  local dest="$drive/$(basename "$source")-$(date +%Y%m%d)"

  if [ ! -d "$drive" ]; then
    echo "Backup drive not mounted"
    exit 1
  fi

  rsync -av --progress "$source" "$dest"
}

# Incremental backup
incremental_backup() {
  local source="$1"
  local dest="$2"
  local latest="$dest/latest"
  local new_backup="$dest/$(date +%Y%m%d%H%M%S)"

  mkdir -p "$dest"

  if [ -d "$latest" ]; then
    rsync -av --link-dest="$latest" "$source" "$new_backup"
  else
    rsync -av "$source" "$new_backup"
  fi

  rm -f "$latest"
  ln -s "$new_backup" "$latest"
}

# ============================================
# SEARCH & REPLACE
# ============================================

# Find files by name
find_by_name() {
  local pattern="$1"
  local dir="${2:-.}"

  find "$dir" -name "$pattern" -type f
}

# Find files by content
find_by_content() {
  local pattern="$1"
  local dir="${2:-.}"

  grep -rl "$pattern" "$dir"
}

# Replace in files
replace_in_files() {
  local search="$1"
  local replace="$2"
  local dir="${3:-.}"

  find "$dir" -type f -name "*.txt" -exec sed -i '' "s/$search/$replace/g" {} +
}

# ============================================
# SYNC OPERATIONS
# ============================================

# Sync two folders
sync_folders() {
  local src="$1"
  local dest="$2"

  rsync -av --delete "$src/" "$dest/"
}

# Sync to remote
sync_to_remote() {
  local local_path="$1"
  local remote_host="$2"
  local remote_path="$3"

  rsync -avz --progress "$local_path" "${remote_host}:${remote_path}"
}

# ============================================
# PRACTICAL EXAMPLES
# ============================================

# Organize downloads folder
organize_downloads() {
  local downloads=~/Downloads

  # Move images
  mkdir -p "$downloads/Images"
  mv "$downloads"/*.{jpg,jpeg,png,gif} "$downloads/Images/" 2>/dev/null || true

  # Move documents
  mkdir -p "$downloads/Documents"
  mv "$downloads"/*.{pdf,doc,docx,txt} "$downloads/Documents/" 2>/dev/null || true

  # Move archives
  mkdir -p "$downloads/Archives"
  mv "$downloads"/*.{zip,tar,gz,rar} "$downloads/Archives/" 2>/dev/null || true
}

# Daily cleanup
daily_cleanup() {
  # Empty trash
  rm -rf ~/.Trash/*

  # Clean downloads older than 30 days
  find ~/Downloads -type f -mtime +30 -delete

  # Clean logs older than 7 days
  find ~/.logs -type f -mtime +7 -delete 2>/dev/null || true
}
