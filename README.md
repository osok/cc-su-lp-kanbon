# AI Tester Kanban Dashboard

A read-only web dashboard that parses markdown task files and displays them as an interactive Kanban board. Built for monitoring AI-driven software testing pipelines that track progress in structured markdown tables.

## Features

- **Kanban Board** - Tasks displayed in status columns (Pending, In Progress, Blocked, Deferred, Complete)
- **Live Polling** - Automatic 30-second refresh detects file changes with status change highlighting
- **Dependency Visualization** - SVG overlay shows blocker/dependent relationships between tasks
- **Agent Swimlanes** - Group tasks by agent type (Developer, Test Coder, Architect, etc.)
- **Sequence Filtering** - Filter by component/sequence with progress indicators
- **Progress Heatmap** - Color-coded bars showing completion status per sequence
- **Light/Dark Themes** - Toggle with persistent preference
- **Zero Configuration** - Select a directory and start viewing

## Prerequisites

- Node.js 18+
- npm

## Quick Start

```bash
# Install dependencies
npm install

# Start in production mode (builds and serves)
npm start

# Or start in development mode (hot reload)
npm run dev
```

The dashboard will be available at:
- **Production:** http://localhost:7600
- **Development:** http://localhost:3000 (frontend) + http://localhost:7600 (API)

On first launch, select the directory containing your markdown task files.

## Project Structure

```
kanban-dashboard/
├── shared/types/          # Shared TypeScript interfaces
├── components/
│   ├── md-parser/         # Markdown task file parser (zero-dependency)
│   ├── backend-api/       # Express REST API server
│   └── kanban-ui/         # React SPA (Vite)
├── config/                # Runtime config (generated, gitignored)
└── package.json           # Workspace root
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Build all packages and start the server |
| `npm run dev` | Start backend and frontend in development mode |
| `npm run build` | Build all packages |
| `npm test` | Run all test suites |
| `npm run test:parser` | Run md-parser unit tests |
| `npm run test:backend` | Run backend-api tests |
| `npm run test:ui` | Run kanban-ui component tests |

## Task File Format

The dashboard parses markdown files containing tables with these columns:

```markdown
| ID | Task | Status | Blocked-By | Agent | Priority |
|----|------|--------|------------|-------|----------|
| TASK-001-001 | Setup project | complete | - | Developer | critical |
| TASK-001-002 | Build API | in-progress | TASK-001-001 | Developer | high |
```

### Supported Status Values

| Status | Aliases |
|--------|---------|
| complete | completed, done |
| in-progress | in progress, active, wip |
| pending | todo, not started, queued |
| blocked | blocked |
| deferred | deferred, skipped |

## Architecture

- **Monorepo** with npm workspaces for isolated packages
- **Poll-based** file monitoring (no fs.watch, handles locked files gracefully)
- **Custom regex parser** (zero external dependencies for parsing)
- **CSS Modules + Custom Properties** for theming
- **Vite** for frontend build tooling

See `project-docs/adrs/` for detailed architectural decision records.

## Security

- Server binds to **localhost only** (127.0.0.1)
- **Read-only** filesystem access (never writes to task files)
- Path traversal prevention on directory configuration
- No authentication required (single-user, local tool)

## License

Private project.
