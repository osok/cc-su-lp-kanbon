# Project Components

## Summary

| ID | Name | Type | Path | Status |
|----|------|------|------|--------|
| md-parser | Markdown Parser | library | components/md-parser | pending |
| backend-api | Backend API Server | backend | components/backend-api | pending |
| kanban-ui | Kanban Dashboard UI | frontend | components/kanban-ui | pending |

---

## md-parser

| Field | Value |
|-------|-------|
| **Name** | Markdown Parser |
| **Type** | library |
| **Path** | components/md-parser |
| **Description** | Isolated module that parses CommonMark markdown task files into structured data. Handles summary tables, section markers, status normalization, dependency extraction, and sequence identification. Designed with a defined interface for replaceability per NR-MNT-001. |
| **Language** | TypeScript |
| **Status** | pending |

---

## backend-api

| Field | Value |
|-------|-------|
| **Name** | Backend API Server |
| **Type** | backend |
| **Path** | components/backend-api |
| **Description** | Node.js/Express server that discovers and reads markdown task files from a user-selected directory, delegates parsing to md-parser, and exposes REST endpoints (GET /api/tasks, GET /api/sequences, GET /api/status, POST /api/config/directory, GET /api/config). Handles polling, file change detection via mtime, and serves the frontend as static files. Binds to localhost only. |
| **Language** | TypeScript |
| **Depends On** | md-parser |
| **Deployment** | Local (npm start) |
| **Port** | 3001 |
| **Status** | pending |

---

## kanban-ui

| Field | Value |
|-------|-------|
| **Name** | Kanban Dashboard UI |
| **Type** | frontend |
| **Path** | components/kanban-ui |
| **Description** | React 18+ single-page application rendering an interactive read-only Kanban board. Features include status-based columns, dependency visualization (SVG/canvas overlay), agent swimlane grouping, sequence/component filtering with tabs, progress heatmap bars, light/dark theme toggle, and periodic polling with change highlighting. Responsive from 1280px to 3840px. |
| **Language** | TypeScript/React |
| **Depends On** | backend-api |
| **Deployment** | Served as static files by backend-api |
| **Port** | 3000 |
| **Status** | pending |
