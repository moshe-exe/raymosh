# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Raymosh is a Raycast extension for opening development-related windows (repositories, IDEs, deploy pages). Built with TypeScript, React, and the Raycast API.

## Development Commands

```bash
npm run dev       # Start development with hot reload
npm run build     # Build for production
npm run lint      # Run ESLint
npm run fix-lint  # Auto-fix linting issues
npm run publish   # Publish to Raycast Store
```

## Architecture

**Commands** (in `src/`):
- `repo.tsx` - Grid view command for browsing repositories
- `ide.tsx` - Form-based command for opening IDEs
- `deploy.ts` - No-view command for opening deploy pages

Each command exports a default `Command` function component. Commands are registered in `package.json` under the `commands` array with their mode (`view` or `no-view`).

**Key Raycast Components**:
- `Grid` - For icon/card layouts with configurable columns
- `Form` - For user input with various field types
- `ActionPanel`/`Action` - For command actions

## Tech Stack

- Raycast API (`@raycast/api`, `@raycast/utils`)
- React 19 with JSX
- TypeScript (strict mode, ES2023 target)
- ESLint with `@raycast/eslint-config`
- Prettier (120 char width, double quotes)
