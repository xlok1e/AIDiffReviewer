<!-- BEGIN:agent-rules -->
# Как читать этот файл

Это не универсальный совет "пиши хороший код" — это конкретный архитектурный контракт. Каждое правило ниже обязательно к исполнению для нового кода с первого файла, даже если часть модулей ещё не создана. Если правило неочевидно применимо к задаче — сверься через актуальный поиск/документацию, не полагайся на память модели о том, "как обычно делают".
<!-- END:agent-rules -->

# AGENTS.md — ai-diff-review

Десктоп-приложение для интерактивного ревью изменений, вносимых AI CLI-агентами (Claude Code, Aider, Codex и т.п.) в кодовую базу пользователя. Tauri v2 (Rust backend) + Next.js (App Router, static export) фронтенд, локальная работа без облачного бэкенда.

## Стек

- Tauri v2, Rust (stable toolchain) — backend, файловая система, git, subprocess-агенты
- Next.js (App Router, `output: 'export'`), React 19, TypeScript (strict) — UI
- Tailwind CSS + shadcn/ui — компоненты
- Zustand — client state
- Monaco Editor — diff-view
- React Flow / dagre — граф зависимостей файлов
- dependency-cruiser — анализ зависимостей (вызывается из Rust как subprocess)
- Bun — единственный пакетный менеджер и раннер. Не использовать npm/yarn/pnpm, не создавать `package-lock.json`/`pnpm-lock.yaml`

## Команды

```bash
bun install                 # установка зависимостей
bun run tauri dev            # дев-режим (Tauri + Next.js)
bun run tauri build           # продакшн-сборка
bun run lint                    # ESLint
bunx tsc --noEmit                 # typecheck (добавь скрипт "typecheck" в package.json по аналогии)
cargo check                       # внутри src-tauri/
cargo clippy -- -D warnings        # внутри src-tauri/, обязателен без warnings
cargo test                          # внутри src-tauri/
```

Локальный dev-сервер в рамках задачи не поднимать без явной просьбы — покрытие проверяется линтом/тайпчеком/тестами, а не ручным прогоном.

## Структура проекта

```
src/                               # Next.js frontend
  app/                              # роуты — только layout/page, вызывают модули, без бизнес-логики
    (group)/
      layout.tsx                     # точка монтирования Scoped Context для группы роутов

  modules/                          # фича-модули, каждый — независимый вертикальный срез
    <ModuleName>/                     # DiffReview, DependencyGraph, AgentAdapter, Settings...
      api/                            # вызовы Tauri invoke, нужные ТОЛЬКО этому модулю
        <domain>.api.ts                 # класс <Domain>Api + инстанс, обёртка над @tauri-apps/api
        <domain>.model.ts                # типы — производные от src-tauri Rust-структур
      services/                        # хуки поверх api/, нужные ТОЛЬКО этому модулю
        <domain>.service.ts              # useQuery-подобные хуки или прямые async-хуки
      features/                        # композитные экраны/блоки (Component + hook)
        <FeatureName>/
          index.tsx                       # markup only
          use<FeatureName>.ts               # вся логика
          components/                        # декомпозированные куски именно этого фича-блока
      hooks/                            # хуки модуля, не привязанные к одной фиче
      lib/                              # чистые хелперы/утилиты модуля
      store/                            # zustand-стор модуля — заводится по необходимости
      overlays/                         # overlay-система модуля (см. «Overlay-система»)
      <ModuleName>.types.ts
      index.ts                          # ЕДИНСТВЕННАЯ публичная точка входа модуля наружу

  api/                               # вызовы Tauri, нужные 2+ модулям
    <domain>/
      <domain>.api.ts
      <domain>.model.ts

  services/                         # хуки, нужные 2+ модулям
    <domain>/
      <domain>.service.ts

  ui/
    shadcn/                          # СЫРЫЕ shadcn-компоненты как есть — не кастомизировать вручную
    components/                      # кастомные обёртки над примитивами, глобальные
      <ComponentName>/
        <ComponentName>.tsx             # markup only
        use<ComponentName>.ts            # если есть логика
        <ComponentName>.types.ts
        <ComponentName>.styles.ts        # cva-варианты

  shared/                           # то, что нужно ВЕЗДЕ (Global Scope)
    providers/                        # глобальные провайдеры, монтируются один раз в app/layout.tsx
    store/                            # глобальные zustand-сторы: theme, activeRepo, agentConnection
    context/                          # Scoped React Context для cross-module состояния
    tauri/                            # обёртка над invoke(), общие типы команд
    hooks/                            # переиспользуемые хуки без бизнес-контекста
    helpers/
    constants/
    types/

src-tauri/                         # Rust backend
  src/
    commands/                        # Tauri commands, по одному модулю на домен
    git/                              # git-операции (diff, apply, checkout -p)
    agent/                            # спавн и коммуникация с локальным CLI-агентом
    graph/                            # обёртка над dependency-cruiser
```

Правило размещения запросов и хуков: **модуль → top-level (2+ модуля) → shared (реально глобальное)**. Не проектируй заранее «на будущее» — начинай в `modules/<X>/api|services`, выноси выше только когда второй модуль реально начинает использовать тот же вызов.

`shared/` не место для бизнес-фич. Ошибка — тащить в `shared` то, что нужно одному модулю (состояние конкретного diff-view, список hunks). Такое остаётся в `modules/<X>/store`.

## 3 уровня Dependency Scope

Компонент должен иметь доступ только к тем зависимостям, которые ему реально нужны.

**1. Global Scope — `shared/`.** Нужно буквально везде: активный репозиторий, тема, статус подключения агента, фиче-флаги. Ошибка — делать глобальным то, что относится к конкретной фиче.

**2. Cross-module Scope — нужен 2+ модулям, но не всем.** Для Tauri-вызовов — top-level `src/api` и `src/services`, их можно импортировать из любого модуля без дополнительной защиты.

Для **клиентского состояния** cross-module scope защищается паттерном Scoped Context: провайдер монтируется только там, где стор нужен, а хук кидает ошибку при использовании вне провайдера.

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
		throw new Error('useDiffSessionStore должен использоваться только внутри DiffSessionStoreProvider')
	}

	return useStore(store, selector)
}
```

Граница задаётся `layout.tsx` роут-группы App Router:

```
app/
  (review)/
    layout.tsx        // <DiffSessionStoreProvider>{children}</DiffSessionStoreProvider>
    diff/page.tsx
    graph/page.tsx
  settings/
    page.tsx           // useDiffSessionStore() здесь бросит ошибку — граница защищена
```

**3. Local Scope — нужен одной странице/сложному компоненту.** Не выносить ни в какой стор: локальный `useState` в корневом компоненте фичи, прокидывать пропсами вниз или через модульный `store/`, если пропс-дриллинг становится глубоким.

## Модули

- Каждый модуль экспортирует наружу только через свой `index.ts`. Всё остальное — деталь реализации.
- Модули не импортируют друг друга напрямую (кроме как через чужой `index.ts`, и только если это осознанная межмодульная зависимость, а не протечка). Когда модулей станет 2+, закрепи это ESLint-ом:

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

- `features/<FeatureName>/index.tsx` — только разметка. Вся логика — в `use<FeatureName>.ts` рядом. Если внутри фичи можно назвать какой-то блок JSX — выноси в `features/<FeatureName>/components/`.

## Tauri-слой (Rust ↔ Frontend граница)

Это контракт, требующий особой дисциплины — в отличие от чисто фронтенд-проекта, здесь есть вторая сторона на Rust.

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

- Любое изменение сигнатуры `#[tauri::command]` обязательно синхронизируй с TypeScript-типом в `.model.ts` в том же коммите. Никогда не оставляй эти два места рассинхронизированными.
- `api/*.api.ts` — единственное место, где вызывается `invoke()` напрямую. Компоненты не импортируют `@tauri-apps/api` напрямую, только через `api/`.
- Ошибки из Rust возвращай как `Result<T, String>` с человекочитаемым сообщением — фронтенд показывает его в toast, не глотает молча.

## UI-компоненты

- `src/ui/shadcn/*` — вывод `shadcn add` как есть. Никогда не редактировать руками — только пересоздавать CLI-командой (`bunx shadcn add <name>`). Если нужно поведение сверх примитива — не трогай файл, оберни его.
- `src/ui/components/*` — кастомные обёртки над примитивами.
- Структура одного компонента:

```
ui/components/HunkAction/
  HunkAction.tsx         ← только разметка
  useHunkAction.ts         ← логика, если есть
  HunkAction.types.ts        ← пропсы, варианты
  HunkAction.styles.ts         ← cva-варианты
  index.ts
```

- Один компонент — один файл, назван по файлу. Любой именуемый блок JSX — отдельный компонент. Файл длиннее ~150 строк — дели на логические части.

## Стейт-менеджмент (Zustand)

- **Global** (`shared/store/`) — только то, что реально нужно везде: `activeRepo`, `theme`, `agentConnectionStatus`. Не расширять этот список ради удобства.
- **Cross-module** — Scoped Context поверх `createStore` (см. «3 уровня Dependency Scope»), провайдер на границе роут-группы, а не глобальный синглтон.
- **Module-local** (`modules/<X>/store/`) — стор нужен только внутри одного модуля. Заводить не заранее, а когда локальному `useState` в корневом компоненте фичи реально стало тесно (3+ компонентов делят состояние). Один стор — одна забота: `hunkStatus.store.ts`, а не общий `diffReview.store.ts` на всё сразу.
- Состояние, синхронизированное с диском (принятые/отклонённые hunks, история решений) — источник правды на диске (SQLite/JSON через Rust), zustand-стор — только зеркало для UI, не наоборот.

## Overlay-система (модалки, bottom sheet)

У каждого модуля, которому нужны модалки, — собственная независимая overlay-система в `modules/<Module>/overlays/`.

```
overlays/
  <module>Overlay.types.ts       # EOverlay enum + DataMap на каждое имя + OverlayStackItem
  <module>OverlayStore.ts         # zustand: stack[], open(), close(), cleanupClosed(), closeAll()
  <Module>OverlayRenderer.tsx      # маппит stack → конкретные Container'ы
  <OverlayName>/
    use<OverlayName>Overlay.ts      # тонкий хук: вызывает store.open() с нужными enum+data
    <OverlayName>Container.tsx       # достаёт typed data из stack item, рендерит UI-компонент
    <OverlayName>Modal.tsx            # сам UI (Dialog/Sheet поверх shadcn), markup only
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

**Стратегии открытия** (третий аргумент `open()`):

| Стратегия   | Поведение                                                                     |
| ----------- | ------------------------------------------------------------------------------ |
| `'reset'`   | Закрывает все текущие оверлеи, открывает этот (по умолчанию)                    |
| `'replace'` | Прячет текущий верхний оверлей, кладёт новый поверх; закрытие вернёт предыдущий |
| `'stack'`   | Кладёт поверх, ничего не пряча                                                  |

Открывать оверлей — только через его хук из хука компонента, никогда не дёргать стор напрямую из JSX.

**Добавление нового оверлея:**
1. Добавить значение в `EDiffReviewOverlay`
2. Добавить его typed data в `DiffReviewOverlayDataMap`
3. Создать `use<Name>Overlay.ts`, вызывающий `store.open(EOverlay.Name, data, strategy)`
4. Создать `<Name>Container.tsx`, принимающий `{ data, isOpen, onClose }`
5. Добавить ветку `if (item.name === EOverlay.Name)` в `<Module>OverlayRenderer.tsx`

## Правила кода

1. Декомпозиция — любой именуемый блок разметки выносится в отдельный компонент с говорящим именем.
2. JSX — только разметка. Вся логика (стейт, эффекты, обработчики, данные) — в `use<Name>.ts` рядом.
3. Функции — одна задача, ~10-25 строк. Длиннее или с побочными эффектами вперемешку — дели.
4. Компонент разросся — дели на подкомпоненты, а не превращай в мега-файл.
5. Ноль `any` (TS) и никаких `unwrap()`/`expect()` в продакшн-пути Rust-кода без явного обоснования в комментарии. Все функции типизированы: параметры, возврат, дженерики.
6. Не допускать проп-дриллинг — модульный store / Scoped Context вместо протаскивания через 3+ уровня.
7. Больше 3 аргументов у функции/компонента — один объект-параметр.
8. Дорогие вычисления (построение графа зависимостей, рендер больших диффов) — мемоизировать (`useMemo`/`useCallback`/`memo`) и виртуализировать списки, но только когда есть измеренная причина, не превентивно.
9. Паттерн неочевиден или спорен — свериться через актуальный поиск/документацию, не полагаться на память модели.
10. Naming: `verb + noun` для функций (`fetchDiff`, `validateHunkRange`), `is/has/should` для булевых. Не использовать `data`, `temp`, `x`, `handle`, `process`, `info` как имена.
11. Guard clauses вместо вложенных условий, максимум 2 уровня вложенности.
12. Ошибки не глотать молча: валидировать вход в начале функции, `try/catch` на все async-операции и `Result` на все Rust fallible-операции, обрабатывать `null/undefined`, пустые массивы, граничные значения, сбои subprocess.
13. Секретов в коде нет — только `.env`/системный keychain. Пути от пользователя (repo path, file path) — всегда нормализовать и проверять, что они внутри выбранного репозитория (защита от path traversal).
14. Ввод, передаваемый в subprocess (`git`, CLI-агент, `dependency-cruiser`) — никогда не собирать конкатенацией строк в shell-команду, только параметризованный вызов (`Command::new(...).args([...])`), чтобы исключить command injection.

## Git workflow

- Формат коммитов: Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`).
- Один коммит — одно логическое изменение.
- Никогда не коммить напрямую в `main` — только через ветки `feature/*`, `fix/*`.
- Не переписывать историю (`rebase -i`, `push --force`) без явного запроса пользователя.

## Границы (Judgment Boundaries)

**NEVER:** редактировать `ui/shadcn/*` вручную · коммитить секреты · менять контракт Tauri-команды без синхронного обновления `.model.ts` · ослаблять TS strict/ESLint/Clippy ради прохождения проверки · собирать shell-команды конкатенацией строк · удалять пользовательские данные ревью без подтверждения · использовать npm/yarn/pnpm вместо Bun.

**ASK:** перед добавлением новой внешней зависимости · перед миграцией схемы хранения состояния · перед удалением файлов, явно не относящихся к задаче · если есть 2+ разумных архитектурных решения с разными последствиями.

**ALWAYS:** объясняй план перед правкой файлов для нетривиальных задач · обрабатывай ошибки явно, никогда не глотай молча · после задачи перечисляй изменённые файлы с причиной изменения каждого · явно сообщай, что не протестировано, если не проверял.

## Чек-лист перед завершением задачи

1. `bun run lint` — и исправить, что автофиксится
2. `bunx tsc --noEmit` — ноль ошибок типов
3. `cargo clippy -- -D warnings` — если менялся Rust-код
4. `cargo test` / unit-тесты фронтенда — если менялась логика (парсинг diff, топологическая сортировка, agent adapter)
5. Локальный dev-сервер не поднимать, если явно не попросили — покрытие проверяется линтом/тайпчеком/тестами, а не ручным прогоном
</content>
