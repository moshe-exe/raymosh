#!/bin/bash
set -e

# Description: API interaction patterns with curl
# Usage: ./api-calls.sh [command]

# ============================================
# BASIC REQUESTS
# ============================================

# GET request
get_request() {
  local url="$1"
  curl -s "$url"
}

# GET with headers
get_with_headers() {
  local url="$1"
  local token="$2"

  curl -s \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    "$url"
}

# POST request with JSON
post_json() {
  local url="$1"
  local data="$2"

  curl -s \
    -X POST \
    -H "Content-Type: application/json" \
    -d "$data" \
    "$url"
}

# PUT request
put_request() {
  local url="$1"
  local data="$2"

  curl -s \
    -X PUT \
    -H "Content-Type: application/json" \
    -d "$data" \
    "$url"
}

# DELETE request
delete_request() {
  local url="$1"

  curl -s -X DELETE "$url"
}

# ============================================
# RESPONSE HANDLING
# ============================================

# Get response with status code
get_with_status() {
  local url="$1"
  local response
  local status

  response=$(curl -s -w "\n%{http_code}" "$url")
  status=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  echo "Status: $status"
  echo "Body: $body"
}

# Check if endpoint is healthy
health_check() {
  local url="$1"
  local status

  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")

  if [ "$status" -eq 200 ]; then
    echo "OK"
    return 0
  else
    echo "FAIL ($status)"
    return 1
  fi
}

# ============================================
# JSON PROCESSING (with jq)
# ============================================

# Extract field from JSON response
extract_field() {
  local url="$1"
  local field="$2"

  curl -s "$url" | jq -r ".$field"
}

# Extract array items
extract_array() {
  local url="$1"
  local array_path="$2"

  curl -s "$url" | jq -r "$array_path[]"
}

# Filter JSON array
filter_json() {
  local url="$1"
  local filter="$2"

  curl -s "$url" | jq "$filter"
}

# ============================================
# AUTHENTICATION
# ============================================

# Basic auth
basic_auth_request() {
  local url="$1"
  local username="$2"
  local password="$3"

  curl -s -u "${username}:${password}" "$url"
}

# OAuth token request
get_oauth_token() {
  local token_url="$1"
  local client_id="$2"
  local client_secret="$3"

  curl -s \
    -X POST \
    -d "grant_type=client_credentials" \
    -d "client_id=$client_id" \
    -d "client_secret=$client_secret" \
    "$token_url" | jq -r '.access_token'
}

# ============================================
# FILE OPERATIONS
# ============================================

# Download file
download_file() {
  local url="$1"
  local output="$2"

  curl -L -o "$output" "$url"
}

# Upload file
upload_file() {
  local url="$1"
  local file="$2"

  curl -s \
    -X POST \
    -F "file=@$file" \
    "$url"
}

# ============================================
# PRACTICAL EXAMPLES
# ============================================

# Slack notification
send_slack_message() {
  local webhook_url="$1"
  local message="$2"

  curl -s \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"$message\"}" \
    "$webhook_url"
}

# GitHub API: List repos
github_list_repos() {
  local token="$1"
  local username="$2"

  curl -s \
    -H "Authorization: token $token" \
    "https://api.github.com/users/$username/repos" | jq -r '.[].name'
}

# Discord webhook
send_discord_message() {
  local webhook_url="$1"
  local content="$2"

  curl -s \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"content\": \"$content\"}" \
    "$webhook_url"
}

# Check website status
check_websites() {
  local sites=(
    "https://google.com"
    "https://github.com"
    "https://example.com"
  )

  for site in "${sites[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$site")
    echo "$site: $status"
  done
}

# Retry request on failure
retry_request() {
  local url="$1"
  local max_retries=3
  local retry_delay=2
  local attempt=1

  while [ $attempt -le $max_retries ]; do
    if curl -s -f "$url" > /dev/null; then
      echo "Success on attempt $attempt"
      return 0
    fi

    echo "Attempt $attempt failed, retrying in ${retry_delay}s..."
    sleep $retry_delay
    ((attempt++))
  done

  echo "Failed after $max_retries attempts"
  return 1
}
