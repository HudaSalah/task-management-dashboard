
# Task Management Dashboard

A production-style Task Management Dashboard built with Angular 20+, demonstrating standalone components, Signals, the new `httpResource` API, Reactive Forms, lazy-loaded routing, and a Signals-first approach to state management — built as a senior front-end assignment.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Available Scripts](#available-scripts)
- [Architecture](#architecture)
- [State Management](#state-management)
- [Forms & Validation](#forms--validation)
- [HTTP Layer: Caching & Error Handling](#http-layer-caching--error-handling)
- [Testing Strategy](#testing-strategy)
- [Performance Optimizations](#performance-optimizations)
- [Code Quality Tooling](#code-quality-tooling)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)

---

## Project Overview

The app is a Kanban-style task manager with three main areas, each its own lazy-loaded route:

- **Dashboard** (`/dashboard`) — live statistics cards and the full task board.
- **Tasks** (`/tasks`) — the same task board on its own, for a focused task-management view.
- **Analytics** (`/analytics`) — Chart.js visualizations of task distribution by status and priority.

Tasks can be created, edited, deleted, filtered by status/priority, and searched in real time. All of this runs against a **mock JSON "backend"** (static files under `public/data/`) — there is no real server, so create/update/delete operations are applied to an in-memory copy of the data and will reset on a full page reload. See [Known Limitations](#known-limitations) for the full reasoning.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Angular 20+ (standalone components, Signals) | Required by the assignment; modern Angular avoids NgModules entirely |
| UI library | Angular Material | Consistent, accessible components out of the box (dialogs, forms, datepicker, menus) |
| Data fetching | `httpResource` | The new signal-based resource API — loading/error/value state without manual RxJS subscriptions |
| Forms | Reactive Forms + custom validators | Explicit, testable validation logic (see [Forms & Validation](#forms--validation)) |
| Charts | Chart.js (`chart.js/auto`) | Lightweight, well-documented, explicitly suggested by the assignment |
| Styling | SCSS with a shared design-token system | One source of truth for colors/spacing/typography (`src/styles/`) |
| Testing | Vitest (via Angular's experimental unit-test builder) | Fast, ESM-native test runner; TestBed API is unchanged from Karma |
| Code quality | ESLint (`@angular-eslint`) + Prettier + Husky + lint-staged | Consistent style, enforced automatically before every commit |

## Setup & Installation

```bash
# 1. Install dependencies
npm install

# 2. Generate fresh mock data (dates are relative to "today", so regenerate
#    before demoing — see data-fetching/generate-data.js)
node data-fetching/generate-data.js

# 3. Start the dev server
ng serve
```

The app runs at `http://localhost:4200` and redirects to `/dashboard` by default.

### Environment Configuration

No environment variables or API keys are required — the app reads its data from static files under `public/data/` (served by Angular's dev server at `/data/*.json`), copied there by `data-fetching/generate-data.js`.

## Available Scripts

| Command | Purpose |
|---|---|
| `ng serve` | Run the dev server with hot reload |
| `ng build` | Production build, output to `dist/` |
| `ng test` | Run the unit test suite (Vitest) |
| `ng test --coverage` | Run tests with a code-coverage report (requires `@vitest/coverage-v8`) |
| `ng lint` | Run ESLint across `.ts` and `.html` files |
| `npm run format` | Format the codebase with Prettier |
| `npm run format:check` | Check formatting without writing changes (useful in CI) |
| `node data-fetching/generate-data.js` | Regenerate mock JSON data with fresh, relative dates |

## Architecture

### Folder Structure

```
src/app/
├── core/                  # App-wide singletons: services, HTTP interceptors
│   ├── interceptors/      # cache.interceptor.ts, error.interceptor.ts
│   └── services/          # task-service.ts, user-service.ts
├── shared/                # Reused across features
│   ├── components/        # stat-card, priority-badge, task-card, confirm-dialog
│   ├── models/             # Task, Statistic, User + filter types
│   └── utils/              # Pure date/overdue helper functions
├── layout/                # App shell chrome
│   ├── header/             # Search, notifications, avatar
│   └── sidebar/            # Navigation rail
├── features/
│   ├── dashboard/          # Overview page: stats + activity feed + task board
│   ├── tasks/               # Task board, filter bar, create/edit dialog, validators
│   └── analytics/           # Chart.js status/priority charts
├── app.ts / app.html / app.scss   # Root shell: header + sidebar + <router-outlet>
├── app.routes.ts                   # Top-level lazy routes
└── app.config.ts                   # Providers: router, HttpClient (+ interceptors), date adapter
```

### Smart / Presentational Split

- **Presentational** (`shared/components/*`, `features/*/components/kanban-column`, `filter-bar`): take data via `input()`, emit events via `output()`, know nothing about services or HTTP. Easy to unit-test in isolation and safe to run with `OnPush`.
- **Smart** (`TaskBoard`, the page components, `App`): inject services, own state, and pass data down to presentational components.

`TaskBoard` (`features/tasks/components/task-board/`) is a deliberate exception worth calling out: it's a *smart* component that's still reused in two places (embedded in the Dashboard page and standalone on the Tasks page), because the alternative — duplicating its filtering/dialog logic in both pages — would violate DRY for no real benefit. When two places need the exact same behavior, extracting a shared component is the right call even if that component isn't purely presentational.

### Routing

All three feature areas are lazy-loaded via `loadChildren`/`loadComponent`, so the initial bundle only includes the app shell; each route's code (and its own chunk of Angular Material modules) is fetched on navigation.

## State Management

The app uses **Signals as the single state-management mechanism** — no NgRx, no RxJS `BehaviorSubject`s for app state. The reasoning:

- `TaskService` fetches data via `httpResource`, then copies the resolved response into a private `signal<Task[]>` (`tasksSignal`). All CRUD methods (`addTask`, `updateTask`, `deleteTask`, `updateTaskStatus`) mutate that signal directly, because the mock backend is static JSON files that can't accept writes — this keeps every consuming component's code identical to what it would be against a real API.
- `TaskService.statistics` is a `computed()` that blends the *live* task counts (recalculated from `tasksSignal` on every change) with the *decorative* fields (icon, color, delta caption) from the original `statistics.json` — see [Known Limitations](#known-limitations) for why the delta caption isn't fully live.
- Cross-cutting UI state that needs to be shared between components that aren't parent/child — the live search query (typed in the `Header`, read by the `TaskBoard` inside a routed page) — also lives as a signal on `TaskService`, since that's the natural shared owner of "task-related" state.
- Filter state (status tab, priority) is local to `TaskBoard` via its own `signal<TaskFilters>`, since nothing outside that component needs it.

This keeps data flow easy to trace: one `Injectable({ providedIn: 'root' })` service per concern, signals for state, `computed()` for anything derived, and `effect()` only where something needs to happen as a *side effect* of a signal changing (syncing the resource's response into local state, wiring up Chart.js).

## Forms & Validation

The create/edit task dialog (`TaskFormModal`) uses **Reactive Forms** with:

- Built-in validators (`Validators.required`, `Validators.minLength`).
- Two **custom validators** (`features/tasks/validators/task-form.validators.ts`):
  - `noWhitespaceValidator()` — rejects a title of only spaces, which `Validators.required` alone would accept.
  - `notInPastValidator()` — rejects a due date earlier than today, applied only in **create** mode (an already-overdue task being edited shouldn't be blocked from saving).
- Dynamic validation: the due-date field's validator set is chosen at form-construction time based on whether the dialog is in create or edit mode.

## HTTP Layer: Caching & Error Handling

Two functional interceptors (`core/interceptors/`), registered via `provideHttpClient(withInterceptors([cacheInterceptor, errorInterceptor]))`:

- **`cacheInterceptor`** — an in-memory cache for GET requests, keyed by full URL, with a 30-second TTL. Repeated navigation between routes within that window is served from cache instead of re-fetching `tasks.json`/`statistics.json`.
- **`errorInterceptor`** — automatically retries a failed request up to twice with a short linear backoff (500ms, 1000ms) before surfacing the error to the UI. The manual **Retry** button shown in each page's error state is the fallback for failures that persist past those automatic attempts.

## Testing Strategy

Unit tests run on Angular's Vitest-based test builder (`ng test`). Coverage spans:

- **Services** (`TaskService`, `UserService`): the trickiest part is that `httpResource` fires its request from an `effect()`, which only runs once Angular actually synchronizes — a plain `TestBed.inject()` isn't enough. Each test:
  1. Calls `TestBed.inject(ApplicationRef).tick()` to flush the effect that *fires* the request,
  2. Flushes the request via `HttpTestingController`,
  3. Awaits a microtask (`await Promise.resolve()`) — `httpResource` resolves through a microtask internally before its own signal updates,
  4. Calls `tick()`/`fixture.detectChanges()` again to flush the effect that *reads* the now-resolved value.
- **Presentational components** (`StatCard`, `TaskCard`, `KanbanColumn`, `FilterBar`, `PriorityBadge`): required inputs are set via `fixture.componentRef.setInput(...)` before the first `detectChanges()`, since Angular throws `NG0950` if a required `input()` is read before it's set.
- **Dialogs** (`TaskFormModal`, `ConfirmDialog`): `MatDialogRef` and `MAT_DIALOG_DATA` are provided as mocks (`vi.fn()`-based spies), so no real dialog needs to open.
- **Pages/smart components** (`TaskBoard`, `DashboardPage`, `AnalyticsPage`, `App`): use the same `HttpTestingController` pattern as the service tests, since they all transitively depend on `TaskService`.
- **`AnalyticsPage`**: Chart.js is mocked (`vi.mock('chart.js/auto', ...)`) with a plain ES class, since jsdom (the DOM implementation tests run against) doesn't implement a real `<canvas>` 2D context — the test verifies *our* component's logic, not Chart.js's actual rendering.

Run `ng test --coverage` (requires `@vitest/coverage-v8`, installed as a dev dependency) for a full coverage report.

## Performance Optimizations

- **`ChangeDetectionStrategy.OnPush`** on every component — each one only re-renders when its `input()`s change or a signal it reads changes, never on unrelated app-wide change detection.
- **`track` functions** on every `@for` loop (task cards, kanban columns, nav items) so Angular reuses DOM nodes instead of destroying/recreating them when a list re-orders.
- **Lazy-loaded routes** for all three feature areas — the initial bundle is just the app shell.
- **HTTP response caching** (see above) avoids redundant network requests on repeat navigation.
- **`computed()` signals** for anything derived (filtered task lists, live statistics) — Angular only recalculates them when an actual dependency changes, and the result is cached between reads.

## Code Quality Tooling

- **ESLint** (`@angular-eslint/schematics`) with the Angular-recommended rule set for both `.ts` files and inline/external templates.
- **Prettier** for formatting, with `eslint-config-prettier` disabling any ESLint rule that would conflict with it.
- **Husky + lint-staged**: a `pre-commit` git hook runs ESLint (`--fix`) and Prettier on staged files only, so formatting/lint issues never make it into a commit.

## Known Limitations

Being upfront about these rather than hiding them:

- **No real backend.** All create/edit/delete operations mutate an in-memory copy of the mock data; a full page refresh resets everything to the original `tasks.json`. This is inherent to the assignment's static-JSON-file mock API.
- **Statistic "delta" captions are not fully live.** The headline number on each statistic card (e.g. "156") is recalculated live from the actual task list, but the small delta caption underneath (e.g. "+12 this week") still comes verbatim from `statistics.json`, because there's no historical snapshot to compute a real delta against.
- **The Recent Activity feed described in the assignment was not implemented** due to time constraints. Everything else under "Dashboard Features" (statistics, analytics charts) is complete.
- **Sidebar links for Calendar, Team, and Settings are inert placeholders.** Only Dashboard, Tasks, and Analytics have real routes/pages behind them; the assignment's scope didn't call for those other sections.
- **Drag-and-drop is not implemented.** It was explicitly optional in the assignment; prioritized instead: routing, filtering, search, interceptors, analytics, the activity feed, and test coverage.
- **Responsive design covers layout reflow, not a fully reworked mobile UI.** The Kanban board stacks vertically and the stat-card grid wraps below ~768px, but the design is adapted from the desktop mock (per the assignment's own note that no separate mobile design was provided) rather than a from-scratch mobile experience.

## Future Improvements

- Implement drag-and-drop (Angular CDK `DragDropModule`) to move tasks between Kanban columns.
- Replace the mock JSON files with a real backend (or `json-server`) so CRUD operations persist.
- Add an i18n setup (`@angular/localize`) for multi-language support.
- Run a full WCAG 2.1 AA accessibility audit and address any gaps beyond the ARIA labels already in place.
- Add a GitHub Actions CI pipeline running `ng lint`, `ng test --coverage`, and `ng build` on every PR.
- Containerize with Docker/docker-compose for one-command local setup.

/////////////////////////////////////////////////////////////////////////////////////////////


# TaskManagementDashboard

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
///////////////////////////////////////////////////////////////////////////////////////////
