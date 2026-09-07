# AI Diff Review - Project Specification for Implementation

## 1. What We Are Building

A desktop application for local review of changes made by AI agents (Claude Code, Aider, Cursor CLI, Codex CLI, and similar tools) in a codebase. The user works with any CLI agent tool as usual, while this application opens on top of a git repository and provides a convenient review layer: navigation through changed files in the correct order, hunk-level Accept/Reject, a dependency graph between changed files, an embedded call to a local AI agent to explain a specific change ("Ask"), and automatic generation of code comments.

The product does not replace the agent and does not write code itself. It is a review layer over the local CLI agent the user already uses.

## 2. Technology Stack

- **Application**: Tauri v2 (Rust backend + WebView frontend). Chosen for small binary size, fast startup, low RAM usage, and safe file system access through Rust commands.
- **Frontend**: Next.js (App Router, static export for Tauri) + TypeScript.
- **UI components**: shadcn/ui + Tailwind CSS. The theme is light/dark with a switcher (through `next-themes` or an equivalent, bound to shadcn CSS variables, with the choice saved in local application settings).
- **Dependency graph**: React Flow (or `@dagrejs/dagre` + custom SVG renderer), with nodes and edges styled through shadcn/ui components (Card, Badge) for consistency with the rest of the interface.
- **Editor/diff view**: Monaco Editor (VS Code engine) in diff mode (`IStandaloneDiffEditor`), with decorations (`deltaDecorations`) for Accept/Reject/Ask/Comment buttons on changed lines. The Monaco theme switches in sync with the global application theme (vs-dark / vs-light).
- **Git layer**: calls to system `git` through Rust `std::process::Command` (not JS git libraries). This is more reliable for large repositories and targeted `git apply`.
- **Dependency analysis**: `dependency-cruiser` (Node.js CLI tool), called as a subprocess from Rust; the result is a JSON graph of files and their imports.
- **State/annotation storage**: local SQLite database through `tauri-plugin-sql` (or a simple `.reviewstate/` JSON file in the project root for the first stage). Theme settings and the CLI agent path are stored there as well, or through `tauri-plugin-store`.
- **AI integration**: only a local CLI agent (Claude Code, Aider, Codex CLI, and similar tools), without cloud API keys in the first stage. Interaction happens by spawning a subprocess (Rust `std::process::Command` / `tauri-plugin-shell`), passing the prompt and context through stdin or a temporary file, and reading the response from stdout.
- **Package manager**: pnpm.

## 3. Visual Style and UX Principles

The general reference is VS Code: a minimalist, dense, but not overloaded interface that is familiar to any developer from the first launch, without tutorial screens.

- **Minimalism**: no decorative elements, shadows, gradients, or unnecessary animation. Only functional elements: text, icons, and thin panel separators. The color palette is limited to neutral backgrounds (dark gray/almost black for dark mode, light gray/white for light mode) plus 3-4 accent colors for statuses (accepted/rejected/pending/unexpected file).
- **Dense but readable layout**: like VS Code, with narrow side panels, monospaced or compact font for the file list, and clear typographic hierarchy (file name larger than path, path in muted gray).
- **Draggable panel separators** (shadcn `Resizable`): the user controls the width of the left file panel and right graph panel, like VS Code Explorer/Sidebar.
- **Icons instead of text where obvious**: Accept/Reject/Ask/Comment on a hunk should be compact icon buttons with a tooltip on hover, not text buttons, to avoid cluttering the diff editor.
- **Statuses through color and shape, not only text**: a green strip to the left of a hunk means accepted, red means rejected, gray means not reviewed, a yellow dot means there is an Ask answer or comment. This should be readable in peripheral vision without reading text.
- **Keyboard shortcuts as the primary navigation path**: arrows/`j`/`k` to switch hunks, `Tab`/`Shift+Tab` for files, `A`/`R` for Accept/Reject, `Cmd/Ctrl+K` for quick file search. Minimize mouse clicks, following the VS Code Command Palette pattern.
- **Always visible but unobtrusive status bar** at the bottom of the window, like VS Code's status bar. It shows the current file, review progress (N of M files reviewed), and CLI agent connection status (connected/not configured icon).
- **No modal windows for routine actions**: Ask and Generate Comment open as a side sheet (`Sheet`), not a blocking dialog, so the review flow is not interrupted.
- **Empty states and onboarding are inline, not a separate tour**: if the CLI agent is not configured, show an unobtrusive notice directly in the Ask panel with a "configure agent" button instead of a popup tour.
- **Consistent spacing and radius system**: use the Tailwind spacing scale and standard shadcn radius tokens without custom values, so the interface does not drift as new screens are added.
- **Dark theme is the default priority**: most developers open code editors in dark mode. Light theme is available through the same switcher described in the theme section, and both themes must remain equally readable in Monaco Editor and the dependency graph.

## 4. Local CLI Agent Connection Flow

A separate, maximally simple setup wizard on first launch and in settings:

1. **Auto-detection**: the application checks `PATH` for known binaries (`claude`, `aider`, `codex`, and similar tools) and offers detected options in a list with an "automatically detected" icon.
2. **Manual input**: if no agent is found automatically, show a field for the executable path (with a "choose file" button through the system dialog) plus a "launch command" field (for example `claude -p` or `aider --message-file`), because different CLIs use different prompt invocation syntax.
3. **Prompt template**: configurable template for how context (hunk, file, related files) is inserted into arguments or stdin for a specific CLI. Use a simple text template with placeholders (`{{file}}`, `{{hunk}}`, `{{related_files}}`) so the format is not hardcoded for each tool.
4. **Test run**: a "Check connection" button sends a test prompt and shows whether a response arrived and how long it took, confirming the integration before the user starts a real review.
5. **Agent profile saving**: multiple profiles can be saved (for example, different CLIs for different projects) and switched in project settings.

This addresses the main risk of local CLI integration: the variety of interfaces across agents. A single universal adapter with a configurable template is used instead of a hardcoded integration for each tool.

## 5. Main User Flow

1. The user opens the application and chooses a git repository folder.
2. The application reads `git diff` (or a diff between the current state and the last commit/branch) and builds a list of changed files.
3. In parallel, the application builds the dependency graph for the whole project through `dependency-cruiser` and determines which changed files are related to each other (direct imports).
4. The list of changed files is sorted not alphabetically, but by topological order in the graph: leaf files first (files that do not depend on other changed files), then files that use them. This becomes the "reading order".
5. The user switches between files with arrows (left/right or keys), and inside a file switches between individual hunks (change blocks) with a second set of arrows.
6. Each hunk has these actions:
   - **Accept**: apply the change as is.
   - **Reject**: revert the specific hunk to the original version, not the whole file.
   - **Ask**: send the hunk plus surrounding file context and graph-related files to the configured local CLI agent with the question "why was this change made"; the answer is shown in a side panel and saved attached to this hunk.
   - **Generate Comment**: the same agent call with another prompt template, generating a short explanatory comment and inserting it as an inline note above a function/block.
7. The user can click a node in the dependency graph, switching the main view to the diff for that file.
8. Changed files that were not explicitly requested are marked with a separate visual flag as files needing extra attention. The initial heuristic: a file was not mentioned in the task/prompt text, if that text is saved.
9. All decisions (accept/reject/comments/Ask answers) are saved locally and persist across application restarts.

## 6. Screens and Interface Components

### 6.1 Project Selection Screen

- Folder selection through the system dialog (Tauri `dialog` plugin).
- List of recently opened projects (minimalist shadcn `Card` items, without extra illustrations).
- Local CLI agent setup wizard (see section 4), also available from settings at any time.

### 6.2 Main Review Screen

Split into three zones, implemented with Next.js + shadcn `ResizablePanel`/`Sheet`, in the spirit of the VS Code layout (Activity Bar + Sidebar + Editor + Panel):

- **Left panel: file list**: changed files in topological order, with a hunk count indicator (shadcn `Badge`), status (not reviewed / partially accepted / fully accepted / rejected), and an "unexpected file" flag (color/icon highlight). Compact rows like VS Code Explorer.
- **Center area: Monaco diff editor**: side-by-side or inline mode (switchable through shadcn `Tabs` or `Toggle`), with hunk navigation and icon buttons for Accept/Reject/Ask/Comment bound to each hunk through decorations/content widgets.
- **Right panel (slide-out, shadcn `Sheet`)**: dependency graph (React Flow), where changed files are highlighted, relationships are edges, and clicking a node switches the center area.
- **Bottom status bar**: current file, review progress, CLI agent status (see section 3).

**Theme switcher**: in the application top bar/header, with a sun/moon icon (shadcn `DropdownMenu` or a simple `Switch`), toggles the `dark`/`light` CSS class at the application level and synchronizes the Monaco editor theme.

### 6.3 Ask / Comments Panel

- When Ask is clicked, a side sheet (shadcn `Sheet`) opens with an input field (to refine the question) and the agent answer, streamed as it is generated (streamed stdout from the subprocess). It does not block the rest of the interface.
- Ask dialog history and generated comments are saved and permanently attached to the specific line/hunk, available again when returning to the file.

### 6.4 Settings

- Manage local CLI agent profiles (add/edit/test run, see section 4).
- Theme switcher, duplicated here as an alternative access point.
- Configure diff source (compare with last commit, with a specific branch, or unstaged changes).
- File ignore patterns, similar to `.gitignore`, for excluding files from review (for example lock files or generated code).
- Keyboard shortcut settings (view and override, similar to VS Code Keyboard Shortcuts).

## 7. Key Technical Modules (to Implement Separately)

1. **Git diff parser**: Rust module that calls `git diff --numstat` for the file list and `git diff -U3` (or more context) for exact hunks with line numbers. Parses unified diff format into a structure: file -> list of hunks -> lines (added/removed/context) with before/after line numbers.
2. **Hunk apply/revert engine**: apply or revert a specific hunk by generating a mini patch and running `git apply` (with `--reverse` for rejection), or by directly manipulating file contents by line numbers as a fallback when `git apply` fails on a partial patch.
3. **Dependency graph builder**: wrapper over `dependency-cruiser`, launched as a subprocess with JSON output, caching the result (invalidating by file modification time), and filtering the graph to "changed files + their direct neighbors (1 hop)".
4. **Topological sort for file order**: simple algorithm that sorts changed files by the dependency graph, with files that have no outgoing dependencies to other changed files first.
5. **Local CLI agent adapter**: single interface `askAgent(context) => AsyncIterator<string>` (streaming response), implemented by spawning a subprocess (`tauri-plugin-shell`), injecting context into a configurable command/prompt template (see section 4), and parsing stdout line by line for UI streaming. Input context: the hunk itself, full file text, related files from the graph (optionally their contents), and the original task/prompt text if the user saved it.
6. **State persistence layer**: SQLite or JSON storage for hunk statuses (accepted/rejected/pending), saved Ask answers and generated comments attached to a file identifier + hunk hash (to keep attachment stable across small line shifts), plus theme settings and agent profiles.
7. **UI: Monaco diff integration**: embed Monaco into a Next.js component (dynamic import without SSR, `next/dynamic`), custom decorations for rendering buttons on changed lines, click event handling for decorations, and editor theme synchronization (`vs-dark`/`light`) with the global application theme.
8. **UI: dependency graph**: React Flow component with auto-layout through `dagre`, node styling by status (changed/not changed/unexpected) using shadcn/Tailwind theme tokens so the graph looks correct in both themes.
9. **Theme system**: global theme provider (light/dark) at the Next.js root layout level, synchronization with the OS theme by default on first launch, and saving the user's choice in the state persistence layer.
10. **Keyboard shortcut manager**: centralized hotkey registry (file/hunk navigation, Accept/Reject, file search), with settings for viewing and overriding shortcuts.

## 8. MVP - Minimum Set for the First Release

Implementation priority, in this order:

1. Open project, read git diff, list files (simple order for now, without graph).
2. Basic UI shell on Next.js + shadcn/ui with working light/dark theme switching and a minimalist VS Code-like layout (Sidebar + Editor + Status Bar). This is done early because it affects all later components.
3. Monaco diff editor with file and hunk navigation via arrows/keys, with the editor theme synchronized to the global theme.
4. Hunk-level Accept/Reject with real application to files on disk and color status indication.
5. Local CLI agent setup wizard (auto-detection + manual input + test run) and an Ask button on a hunk.
6. Generate Comment (same agent, different prompt template).
7. File sorting by dependency graph topology (basic dependency-cruiser integration).
8. Graph visualization as a separate panel with changed files highlighted.
9. "Unexpected file" flag. Initially this can be manual: the user enters the list of files they expected to change, and the rest are highlighted.

Editing code directly in the diff editor before Accept, supporting multiple CLI agents simultaneously with automatic choice by task type, exporting a review report, and customizing hotkeys are outside the MVP. Implement them after the base flow stabilizes.

## 9. Non-Functional Requirements

- The application works fully locally. Because AI integration uses only a local CLI agent, no code data leaves the machine through this product itself. Any network traffic, if present, is controlled by the user's CLI agent.
- All git operations must be safe: before applying/reverting a hunk, warn if the file has unsaved changes outside git (untracked modifications).
- Repositories of any size must be supported. The dependency graph must be built asynchronously without blocking the UI, with a progress indicator.
- Cross-platform support: Windows/macOS/Linux, the standard Tauri target.
- The application theme must apply instantly without reloading the window and must persist between launches.
- The interface must remain responsive (no lag during typing/scrolling) even in repositories with hundreds of changed files. Use list virtualization (`react-virtual` or an equivalent) for long file and hunk lists.
