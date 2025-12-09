# CCEditor

A modern, plugin-driven level editor for Chip’s Challenge–style games, starting with **CC1/DAT format**.

CCEditor is a TypeScript/React application built on a game-agnostic core. It models levels as grids and logical layers, with a plugin system for tools, generators, file formats, and overlays.

> **Status:** Early development. TS tasks (TS00–TS30) drive all work on this repo.

---

## Goals

- **First-class CC1 editing**: open, modify, and export CC1 DAT levelsets safely.
- **Modern UI**: React + Vite + TypeScript, with keyboard-friendly editing.
- **Plugin-driven**: tools, file formats, panels/overlays, and procedural generators are plugins.
- **Game-agnostic core**: CC1 first, but abstractions (hopefully) support future CC2 and similar games.
- **Safe editing**: command + history system with undo/redo and clear file I/O semantics.

---

## Scope

**In scope (initial phases)**

- Editing CC1 levels and levelsets.
- Logical layers over a grid (Photoshop-style layer stack which flattens to DAT format).
- Selection tools, brush/line/rectangle tools, and generators.
- `.datlayers.json` project format (like .PSD photoshop format for WIP levelsets) + CC1 `.dat` read/write.
- Overlays for monster order, secrets, and connections.

**Out of scope (for now)**

- CC2/C2M support (TS30 adds stubs only).
- Any kind of backend (file storage, DB, etc)

---

## Architecture (High Level)

- **Core domain** (TS04–TS06)
  - Grids, coordinates, selections, clipboards.
  - Logical layers and levels-with-layers.
  - Game definitions (CC1 model and painting rules).

- **Editor core** (TS08–TS11, TS25)
  - `EditorState` and `EditorHistory` with undo/redo.
  - Command system for all editor operations.
  - Zustand store for state and actions.

- **Plugins** (TS07, TS10, TS19–TS24, TS26)
  - Tools (brush, line, rectangle, selection).
  - Procedural Generators (e.g., mazes, wall patterns, aesthetic patterns).
  - File formats (`.datlayers.json`, CC1 `.dat`).
  - Panels/overlays (monster order, secrets, connections).

- **React UI** (TS02, TS11–TS16, TS18)
  - Shell layout: toolbars, sidebars, canvas, status bar.
  - Canvas rendering of flattened levels and overlays.
  - Level list, layer panel, palette, generators panel.

---

## Getting Started (Dev)

> The exact steps will be finalized in TS02 and TS03.

### Prerequisites (planned)

- Node.js LTS (e.g. 18+), npm (or pnpm/yarn).
- A modern browser.
- Recommended: VSCode with TypeScript/Prettier extensions.

### Clone

```bash
git clone https://github.com/joshua-bone/CCEditor.git
cd CCEditor
```
### Dev setup
For detailed setup instructions (Node, nvm, VSCode, and commands), see:
- [Dev Setup](./devsetup.md)

Quick start (frontend only):
- Frontend (Vite) lives in `frontend/`
- Run `npm install` + `npm run dev` inside `frontend/` to start the dev server.
- Run `npm run build` to generate HTML/CSS/JS in `frontend/dest/` folder.
- Run `npm run preview` to preview the built app.


Details (Node versions, VSCode settings, test commands) will live in `devsetup.md`.

---

## Project Layout (Planned)

This will evolve as tasks complete, but the target structure is:

```text
CCEditor/
├─ README.md
├─ .gitignore
├─ docs/              # TS00 design doc, architecture notes
├─ frontend/          # React + Vite + TS app (TS02+)
├─ core/              # Domain primitives, layers, game definitions (TS04–TS06+)
├─ plugins/           # Built-in tools, generators, file formats, overlays
├─ tests/             # Domain + core + plugin + React tests (TS27–TS28+)
└─ scripts/           # Helper scripts
```
## Development Workflow

- Default branch: **`main`**.
- Use short-lived feature branches per TS task:
  - `ts02-vite-scaffold`, `ts04-grid-primitives`, `ts19-brush-tool`, etc.
- Commit messages reference TS IDs:
  - `TS01: add README and gitignore`
  - `TS04: implement Grid and SelectionRect`
- Code formatting is standardized with **Prettier** (TS03).

---

## Roadmap (TS Tasks Overview)

Each TS task is tracked as a GitHub issue. This overview is intentionally brief; the (currently private) design doc (TS00) holds full details. Reach out if you're interested!

- **TS00 – Design Doc**  
  Write and maintain Design Doc as the single source of truth for architecture and roadmap.

- **TS01 – GitHub Repo & Setup**  
  Create the repo, add README and .gitignore, configure labels/branches, seed issues.

- **TS02 – Local Dev Env & Vite+React+TS**  
  Vite + React + TypeScript scaffold with `npm run dev/build/preview`.

- **TS03 – Dev Tooling & `devsetup.md`**  
  Prettier config, VSCode recommendations, initial `devsetup.md`.

- **TS04 – Core Domain Primitives**  
  Grids, coordinates, selections, clipboard structures plus tests.

- **TS05 – Logical Layer Model & Ops**  
  Layer stack, layer operations, and selection-based copy/paste.

- **TS06 – CC1 Game Model & GameDefinition**  
  CC1 tiles/cells/metadata and the `GameDefinition` abstraction.

- **TS07 – Plugin API & Descriptors**  
  Plugin interfaces for tools, generators, file formats, and panels/overlays.

- **TS08 – EditorState & History**  
  Top-level editor state and history structures.

- **TS09 – Command System & Core Operations**  
  Command-based application layer for all core edits and undo/redo.

- **TS10 – Plugin Registry & EditorContext**  
  Registry for plugins and concrete `EditorContext` implementation.

- **TS11 – Zustand Store & Editor Bootstrapping**  
  Zustand store wiring, history integration, plugin activation at startup.

- **TS12 – React Shell Layout**  
  App/EditorRoot layout with toolbar, sidebars, canvas region, status bar.

- **TS13 – Canvas Rendering v1**  
  Flattened level rendering (no sprites yet), basic click handling, zoom/pan.

- **TS14 – Tile Palette UI & CC1 Catalog**  
  Palette UI wired to CC1 tile catalog and editor state.

- **TS15 – Level List & Levelset Management**  
  Level list UI and level add/delete/reorder operations.

- **TS16 – Layers Panel & Layer Operations UI**  
  Layers UI for visibility, add/remove/reorder, “new layer from selection”.

- **TS17 – `.datlayers.json` Schema & Plugin**  
  Project file format with JSON Schema, AJV validation, open/save.

- **TS18 – CC1 DAT Codec & Plugin**  
  CC1 `.dat` read/write and integration via file format plugin.

- **TS19 – Tool Runtime & Brush Tool**  
  Tool runtime context and the basic brush painting tool.

- **TS20 – Line / Rectangle Tools**  
  Additional painting tools using shared runtime logic.

- **TS21 – Selection Tool & Clipboard Workflows**  
  Selection tool, copy/paste, and “new layer from selection” wiring.

- **TS22 – Generator Framework & Random Noise**  
  Generator runtime, parameter forms, and a random-noise generator.

- **TS23 – Overlay Framework & Monster Order Overlay**  
  Overlay drawing and monster-order overlay panel.

- **TS24 – Secrets & Connections Overlays**  
  Overlays for secrets (invisible/fake walls, hidden items) and connections.

- **TS25 – Undo/Redo Wiring & History Limits**  
  Ensure all actions are undoable, with configurable history limits.

- **TS26 – Play Level Stub Plugin**  
  Export current level and integrate with an external player (stub).

- **TS27 – Domain/Core/Plugin Testing**  
  Broader test coverage for domain, core, codecs, and plugins.

- **TS28 – React & E2E-ish Tests**  
  Component tests and simple flows with testing-library and vitest.

- **TS29 – Documentation & Guides**  
  Improved README, architecture summary, user guide, and contributing notes.

- **TS30 – CC2 Support Stubs & Abstraction Check**  
  CC2-type stubs and validation that abstractions generalize beyond CC1.

---

## Documentation Plan

- Main design doc (architecture + roadmap) is currently private, if there's interest I can clean it up and release it publicly.
- Additional docs:
  - `devsetup.md`: dev environment and tooling.
  - Future `ARCHITECTURE.md` / `USER_GUIDE.md` as features stabilize.

---

## Contributing

Right now this is primarily a solo/experimental project.  
If the repo is public and you’re interested in helping, open an issue to discuss ideas or questions.

---

## License & Trademarks

- **License:** [LGPL 2.1](https://www.gnu.org/licenses/old-licenses/lgpl-2.1.en.html#SEC1).
- **Trademarks:**  
  “Chip’s Challenge” and related names may be trademarks of their respective owners.  
  CCEditor is an independent project and is not affiliated with or endorsed by the original creators or rights holders.

