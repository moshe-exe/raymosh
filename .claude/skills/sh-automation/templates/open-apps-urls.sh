#!/bin/bash
set -e

# Description: Open applications, URLs, or files
# Usage: ./open-apps-urls.sh

# ============================================
# OPEN URLs
# ============================================

# Open URL in default browser
open "https://example.com"

# Open URL in specific browser
open -a "Google Chrome" "https://example.com"
open -a "Safari" "https://example.com"
open -a "Firefox" "https://example.com"

# Open multiple URLs
urls=(
  "https://github.com"
  "https://mail.google.com"
  "https://slack.com"
)
for url in "${urls[@]}"; do
  open "$url"
done

# ============================================
# OPEN APPLICATIONS
# ============================================

# Open application by name
open -a "Visual Studio Code"
open -a "Slack"
open -a "Spotify"

# Open application with file
open -a "Visual Studio Code" "/path/to/project"

# Open application and wait for it to close
open -a "TextEdit" -W "/path/to/file.txt"

# ============================================
# OPEN FILES & FOLDERS
# ============================================

# Open file with default application
open "/path/to/document.pdf"

# Open folder in Finder
open "/path/to/folder"

# Open current directory in Finder
open .

# Open file with specific application
open -a "Preview" "/path/to/image.png"

# ============================================
# OPEN IN IDE
# ============================================

# VS Code
code "/path/to/project"
code --new-window "/path/to/project"

# Cursor
cursor "/path/to/project"

# WebStorm (via Toolbox)
open -a "WebStorm" "/path/to/project"

# ============================================
# PRACTICAL EXAMPLES
# ============================================

# Morning routine: open work apps
morning_routine() {
  open -a "Slack"
  open -a "Spotify"
  open "https://mail.google.com"
  open "https://calendar.google.com"
  code ~/Projects/current-project
}

# Open project with all related resources
open_project() {
  local project_path="$1"
  code "$project_path"
  open -a "Terminal" "$project_path"
  open "${project_path}/README.md"
}
