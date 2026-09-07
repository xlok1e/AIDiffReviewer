<!-- BEGIN:agent-rules -->
# How to Read This File

This is not generic advice to "write good code"; it is a concrete architectural contract. Every rule below is mandatory for new code from the first file, even when some modules do not exist yet. If it is not obvious whether a rule applies to the task, verify through current documentation or search instead of relying on a model's memory of "how things are usually done".
<!-- END:agent-rules -->

# AGENTS.md - ai-diff-review

A desktop application for interactive review of changes made by AI CLI agents (Claude Code, Aider, Codex, and similar tools) in a user's codebase. The stack is Tauri v2 (Rust backend) + Next.js (App Router, static export) frontend, running locally without a cloud backend.

## Stack

- Tauri v2, Rust (stable toolchain): backend, file system, git, subprocess agents
- Next.js (App Router, `output: 'export'`), React 19, TypeScript (strict): UI
- Tailwind CSS + shadcn/ui: components
- Zustand: client state
- Monaco Editor: diff view
- React Flow / dagre: file dependency graph
- dependency-cruiser: dependency analysis, called from Rust as a subprocess
- Bun: the only package manager and runner. Do not use npm/yarn/pnpm, and do not create `package-lock.json` or `pnpm-lock.yaml`

## Commands

```bash
bun install                       # install dependencies
bun run tauri dev                 # dev mode (Tauri + Next.js)
bun run tauri build               # production build
bun run lint                      # ESLint
bunx tsc --noEmit                 # typecheck (add a "typecheck" script to package.json by analogy)
cargo check                       # inside src-tauri/
cargo clippy -- -D warnings       # inside src-tauri/, must pass without warnings
cargo test                        # inside src-tauri/
```

Do not start the local dev server as part of a task unless explicitly asked. Coverage is verified through linting, typechecking, and tests, not through manual runs.

## Project Structure

```
src/                               # Next.js frontend
  app/                              # routes: only layout/page, call modules, no business logic
    (group)/
      layout.tsx                    # Scoped Context mount point for the route group

  modules/                          # feature modules, each an independent vertical slice
    <ModuleName>/                    # DiffReview, DependencyGraph, AgentAdapter, Settings...
      api/                           # Tauri invoke calls needed ONLY by this module
        <domain>.api.ts              # <Domain>Api class + instance, wrapper over @tauri-apps/api
        <domain>.model.ts            # types derived from src-tauri Rust structs
      services/                      # hooks over api/, needed ONLY by this module
        <domain>.service.ts          # useQuery-like hooks or direct async hooks
      features/                      # composite screens/blocks (Component + hook)
        <FeatureName>/
          index.tsx                  # markup only
          use<FeatureName>.ts        # all logic
          components/                # decomposed parts of this feature block only
      hooks/                         # module hooks not tied to a single feature
      lib/                           # pure helpers/utilities for the module
      store/                         # module Zustand store, created only when needed
      overlays/                      # module overlay system (see "Overlay System")
      <ModuleName>.types.ts
      index.ts                       # the ONLY public entry point from this module

  api/                               # Tauri calls needed by 2+ modules
    <domain>/
      <domain>.api.ts
      <domain>.model.ts

  services/                          # hooks needed by 2+ modules
    <domain>/
      <domain>.service.ts

  ui/
    shadcn/                          # RAW shadcn components as generated; do not customize manually
    components/                      # global custom wrappers over primitives
      <ComponentName>/
        <ComponentName>.tsx          # markup only
        use<ComponentName>.ts        # if there is logic
        <ComponentName>.types.ts
        <ComponentName>.styles.ts    # cva variants

  shared/                            # things needed EVERYWHERE (Global Scope)
    providers/                       # global providers, mounted once in app/layout.tsx
    store/                           # global Zustand stores: theme, activeRepo, agentConnection
    context/                         # Scoped React Context for cross-module state
    tauri/                           # wrapper over invoke(), shared command types
    hooks/                           # reusable hooks without business context
    helpers/
    constants/
    types/

src-tauri/                          # Rust backend
  src/
    commands/                        # Tauri commands, one module per domain
    git/                             # git operations (diff, apply, checkout -p)
    agent/                           # spawn and communication with the local CLI agent
    graph/                           # wrapper over dependency-cruiser
```

Request and hook placement rule: **module -> top-level (2+ modules) -> shared (truly global)**. Do not design "for the future" up front. Start in `modules/<X>/api|services`, and move higher only when a second module actually starts using the same call.

`shared/` is not a place for business features. It is a mistake to put something needed by only one module into `shared` (state for a specific diff view, hunk lists). That stays in `modules/<X>/store`.

## 3 Dependency Scope Levels

A component should have access only to the dependencies it actually needs.

**1. Global Scope: `shared/`.** Needed literally everywhere: active repository, theme, agent connection status, feature flags. It is a mistake to make something global when it belongs to a specific feature.

**2. Cross-module Scope: needed by 2+ modules, but not all modules.** For Tauri calls, use top-level `src/api` and `src/services`; these can be imported from any module without extra protection.

For **client state**, cross-module scope is protected with the Scoped Context pattern: the provider is mounted only where the store is needed, and the hook throws when used outside the provider.

```tsx
// shared/context/DiffSessionStoreContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react'
import { createStore, useStore, type StoreApi } from 'zustand'

interface DiffSessionState {
	activeFilePath: string | null
	setActiveFile: (path: string) => void
}

const DiffSessionStoreContext = createContext<StoreApi<DiffSessionState> | null>(null)

export function DiffSessionStoreProvider({ children }: { children: ReactNode }) {
	const [store] = useState(() =>
		createStore<DiffSessionState>(set => ({
			activeFilePath: null,
			setActiveFile: path => set({ activeFilePath: path }),
		})),
	)

	return <DiffSessionStoreContext.Provider value={store}>{children}</DiffSessionStoreContext.Provider>
}

export function useDiffSessionStore<T>(selector: (state: DiffSessionState) => T): T {
	const store = useContext(DiffSessionStoreContext)

	if (!store) {
		throw new Error('useDiffSessionStore must be used only inside DiffSessionStoreProvider')
	}

	return useStore(store, selector)
}
```

The boundary is defined by the App Router route group's `layout.tsx`:

```
app/
  (review)/
    layout.tsx        // <DiffSessionStoreProvider>{children}</DiffSessionStoreProvider>
    diff/page.tsx
    graph/page.tsx
  settings/
    page.tsx          // useDiffSessionStore() throws here; the boundary is protected
```

**3. Local Scope: needed by one page or complex component.** Do not move it into any store by default: use local `useState` in the feature root component, pass props down, or use a module `store/` if prop drilling becomes deep.

## Modules

- Each module exports outward only through its own `index.ts`. Everything else is an implementation detail.
- Modules do not import each other directly except through another module's `index.ts`, and only when it is an intentional cross-module dependency, not leakage. Once there are 2+ modules, enforce this with ESLint:

```js
'import/no-restricted-paths': [
  'error',
  {
    zones: [
      { target: './src/modules/DiffReview', from: './src/modules/DependencyGraph', message: '...' },
      { target: './src/modules/DependencyGraph', from: './src/modules/DiffReview', message: '...' },
    ],
  },
],
```

- `features/<FeatureName>/index.tsx` is markup only. All logic lives next to it in `use<FeatureName>.ts`. If a JSX block inside the feature can be named, extract it into `features/<FeatureName>/components/`.

## Tauri Layer (Rust <-> Frontend Boundary)

This is a contract that requires special discipline because, unlike a pure frontend project, this application has a second side in Rust.

```rust
// src-tauri/src/commands/diff.rs
#[tauri::command]
pub fn get_file_diff(repo_path: String, file_path: String) -> Result<FileDiff, String> {
    // ...
}
```

```ts
// modules/DiffReview/api/diff.model.ts
export interface FileDiff {
	filePath: string
	hunks: DiffHunk[]
}
```

```ts
// modules/DiffReview/api/diff.api.ts
import { invoke } from '@tauri-apps/api/core'
import type { FileDiff } from './diff.model'

class DiffApi {
	getFileDiff = (repoPath: string, filePath: string): Promise<FileDiff> =>
		invoke('get_file_diff', { repoPath, filePath })
}

export const diffApi = new DiffApi()
```

- Any change to a `#[tauri::command]` signature must be synchronized with the TypeScript type in the corresponding `.model.ts` in the same commit. Never leave these two places out of sync.
- `api/*.api.ts` is the only place where `invoke()` is called directly. Components must not import `@tauri-apps/api` directly; they go through `api/`.
- Return Rust errors as `Result<T, String>` with a human-readable message. The frontend shows that message in a toast and never swallows it silently.

## UI Components

- `src/ui/shadcn/*` is the output of `shadcn add` exactly as generated. Never edit it manually; regenerate it through the CLI (`bunx shadcn add <name>`). If behavior beyond the primitive is needed, wrap it instead of touching the file.
- `src/ui/components/*` contains custom wrappers over primitives.
- Single component structure:

```
ui/components/HunkAction/
  HunkAction.tsx          # markup only
  useHunkAction.ts        # logic, if any
  HunkAction.types.ts     # props, variants
  HunkAction.styles.ts    # cva variants
  index.ts
```

- One component per file, named after the file. Any named JSX block becomes a separate component. If a file exceeds roughly 150 lines, split it into logical parts.

## State Management (Zustand)

- **Global** (`shared/store/`): only what is truly needed everywhere: `activeRepo`, `theme`, `agentConnectionStatus`. Do not expand this list for convenience.
- **Cross-module**: Scoped Context over `createStore` (see "3 Dependency Scope Levels"), with the provider at the route-group boundary, not as a global singleton.
- **Module-local** (`modules/<X>/store/`): a store needed only inside one module. Do not create it up front; create it only when the local `useState` in the feature root becomes too tight (3+ components share state). One store has one concern: `hunkStatus.store.ts`, not one generic `diffReview.store.ts` for everything.
- State synchronized with disk (accepted/rejected hunks, decision history) has disk as the source of truth (SQLite/JSON through Rust). A Zustand store is only a UI mirror, not the source of truth.

## Overlay System (modals, bottom sheets)

Each module that needs modals has its own independent overlay system in `modules/<Module>/overlays/`.

```
overlays/
  <module>Overlay.types.ts        # EOverlay enum + DataMap for each name + OverlayStackItem
  <module>OverlayStore.ts         # zustand: stack[], open(), close(), cleanupClosed(), closeAll()
  <Module>OverlayRenderer.tsx     # maps stack to concrete Containers
  <OverlayName>/
    use<OverlayName>Overlay.ts    # thin hook: calls store.open() with the right enum + data
    <OverlayName>Container.tsx    # reads typed data from the stack item, renders UI component
    <OverlayName>Modal.tsx        # the UI itself (Dialog/Sheet over shadcn), markup only
```

**types:**

```ts
export enum EDiffReviewOverlay {
	ConfirmReject = 'confirmReject',
	AskExplanation = 'askExplanation',
}

export interface DiffReviewOverlayDataMap {
	[EDiffReviewOverlay.ConfirmReject]: { hunkId: string; onConfirm: () => void }
	[EDiffReviewOverlay.AskExplanation]: { hunkId: string; question: string }
}

export type OverlayOpenStrategy = 'reset' | 'replace' | 'stack'

export type OverlayStackItem = {
	[K in EDiffReviewOverlay]: {
		id: number
		name: K
		data: DiffReviewOverlayDataMap[K]
		isVisible: boolean
	}
}[EDiffReviewOverlay]
```

**store:**

```ts
import { create } from 'zustand'
import type { DiffReviewOverlayDataMap, OverlayOpenStrategy, OverlayStackItem } from './diffReviewOverlay.types'
import { EDiffReviewOverlay } from './diffReviewOverlay.types'

let nextId = 0

interface DiffReviewOverlayState {
	stack: OverlayStackItem[]
	open: <T extends EDiffReviewOverlay>(
		name: T,
		data: DiffReviewOverlayDataMap[T],
		strategy?: OverlayOpenStrategy,
	) => void
	close: () => void
	cleanupClosed: () => void
	closeAll: () => void
}

export const useDiffReviewOverlayStore = create<DiffReviewOverlayState>((set, get) => ({
	stack: [],

	open: (name, data, strategy = 'reset') => {
		const item = { id: ++nextId, name, data, isVisible: true } as OverlayStackItem

		if (strategy === 'reset') {
			set({ stack: [item] })
			return
		}

		if (strategy === 'replace') {
			set(state => ({ stack: [...state.stack.map(i => ({ ...i, isVisible: false })), item] }))
			return
		}

		set(state => ({ stack: [...state.stack, item] }))
	},

	close: () => {
		const { stack } = get()
		if (stack.length === 0) return

		set({
			stack: stack.map((item, index) =>
				index === stack.length - 1 ? { ...item, isVisible: false } : item,
			),
		})
		setTimeout(() => get().cleanupClosed(), 350)
	},

	cleanupClosed: () => {
		set(state => {
			if (state.stack.length === 0) return state
			const stack = state.stack.slice(0, -1)
			if (stack.length > 0) stack[stack.length - 1] = { ...stack[stack.length - 1], isVisible: true }
			return { stack }
		})
	},

	closeAll: () => set({ stack: [] }),
}))
```

**Open strategies** (third argument to `open()`):

| Strategy    | Behavior                                                                 |
| ----------- | ------------------------------------------------------------------------ |
| `'reset'`   | Closes all current overlays and opens this one (default)                 |
| `'replace'` | Hides the current top overlay and places a new one above it; closing returns to the previous one |
| `'stack'`   | Places a new overlay above the current stack without hiding anything     |

Open an overlay only through its hook from the component hook. Never call the store directly from JSX.

**Adding a new overlay:**

1. Add a value to `EDiffReviewOverlay`
2. Add its typed data to `DiffReviewOverlayDataMap`
3. Create `use<Name>Overlay.ts`, calling `store.open(EOverlay.Name, data, strategy)`
4. Create `<Name>Container.tsx`, accepting `{ data, isOpen, onClose }`
5. Add an `if (item.name === EOverlay.Name)` branch in `<Module>OverlayRenderer.tsx`

## Code Rules

1. Decomposition: any named markup block is extracted into a separate component with a clear name.
2. JSX is markup only. All logic (state, effects, handlers, data) lives in `use<Name>.ts` next to it.
3. Functions have one task and are roughly 10-25 lines. If longer, or if side effects are mixed with other work, split them.
4. If a component grows, split it into subcomponents instead of turning it into a huge file.
5. Zero `any` in TypeScript, and no `unwrap()`/`expect()` in production-path Rust code without explicit justification in a comment. All functions are typed: params, return values, generics.
6. Do not allow prop drilling. Use a module store or Scoped Context instead of passing props through 3+ levels.
7. If a function or component has more than 3 arguments, use one object parameter.
8. Expensive computations (dependency graph building, rendering large diffs) should be memoized (`useMemo`/`useCallback`/`memo`) and lists virtualized only when there is a measured reason, not preemptively.
9. If a pattern is unclear or debatable, verify with current search/documentation instead of relying on model memory.
10. Naming: use `verb + noun` for functions (`fetchDiff`, `validateHunkRange`) and `is/has/should` prefixes for booleans. Do not use `data`, `temp`, `x`, `handle`, `process`, or `info` as names.
11. Prefer guard clauses over nested conditions, with a maximum of 2 nesting levels.
12. Do not swallow errors silently: validate inputs at function entry, use `try/catch` for all async operations and `Result` for all fallible Rust operations, and handle `null/undefined`, empty arrays, boundary values, and subprocess failures.
13. No secrets in code, only `.env` or the system keychain. User-provided paths (repo path, file path) must always be normalized and verified to be inside the selected repository to protect against path traversal.
14. Inputs passed to subprocesses (`git`, CLI agent, `dependency-cruiser`) must never be assembled through shell string concatenation. Use parameterized calls only (`Command::new(...).args([...])`) to prevent command injection.

## Git Workflow

- Commit format: Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`).
- One commit equals one logical change.
- Never commit directly to `main`; use `feature/*` or `fix/*` branches.
- Do not rewrite history (`rebase -i`, `push --force`) without an explicit user request.

## Judgment Boundaries

**NEVER:** edit `ui/shadcn/*` manually; commit secrets; change a Tauri command contract without synchronously updating `.model.ts`; weaken TS strictness, ESLint, or Clippy to make checks pass; build shell commands through string concatenation; delete user review data without confirmation; use npm/yarn/pnpm instead of Bun.

**ASK:** before adding a new external dependency; before migrating the state storage schema; before deleting files that are clearly outside the task; when there are 2+ reasonable architectural solutions with different consequences.

**ALWAYS:** explain the plan before editing files for non-trivial tasks; handle errors explicitly and never swallow them silently; after a task, list changed files and why each changed; explicitly say what was not tested if you did not check it.

## Completion Checklist

1. `bun run lint`: fix anything that can be autofixed
2. `bunx tsc --noEmit`: zero type errors
3. `cargo clippy -- -D warnings`: if Rust code changed
4. `cargo test` / frontend unit tests: if logic changed (diff parsing, topological sort, agent adapter)
5. Do not start the local dev server unless explicitly asked. Coverage is verified by linting, typechecking, and tests, not by manual runs.
