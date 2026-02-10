# BeeKeeper Composition Audit (2026-02-09)

## Scope
- Rule set: `$vercel-composition-patterns`
- Hotspots reviewed:
  - `/Users/mike/code/BeeKeeper/src/App.tsx`
  - `/Users/mike/code/BeeKeeper/src/game.ts`
- Boundaries: UI composition, domain seams, persistence seams

## Severity scale
- `P1` architecture blocker
- `P2` scalability/maintainability risk
- `P3` cleanup/opportunity

## Findings by Rule ID

### `architecture-compound-components`
- `P1` Monolithic UI composition previously concentrated in `/Users/mike/code/BeeKeeper/src/App.tsx` (single component owned hero, hives, objective, queen yard, log, status, and persistence actions).
- `P1` Stateful orchestration and rendering concerns were tightly coupled, preventing independent reuse of internal sections.
- References:
  - `/Users/mike/code/BeeKeeper/src/App.tsx:1`
  - `/Users/mike/code/BeeKeeper/src/game.ts:1`
- Remediation: Introduced provider + composed feature components under `/Users/mike/code/BeeKeeper/src/features/apiary/components`.

### `architecture-avoid-boolean-props`
- `P2` Prior status rendering used mode conditionals inline in `/Users/mike/code/BeeKeeper/src/App.tsx` and mixed multiple mode branches into one render tree.
- `P2` Persistence mode (`isTauriApp`) toggled behavior in-line rather than explicit variants.
- Remediation: Added explicit variants `StatusBannerWon`, `StatusBannerLost`, `TauriPersistenceControls`, and `WebPersistenceControls`.

### `state-context-interface`
- `P1` UI previously consumed reducer dispatch directly, with no typed state/actions/meta contract boundary.
- References:
  - `/Users/mike/code/BeeKeeper/src/App.tsx:1`
  - `/Users/mike/code/BeeKeeper/src/game.ts:38`
- Remediation: Added `ApiaryContextState`, `ApiaryContextActions`, `ApiaryContextMeta`, `ApiaryContextValue` in `/Users/mike/code/BeeKeeper/src/features/apiary/context/ApiaryContext.tsx`.

### `state-decouple-implementation`
- `P1` State implementation details (reducer wiring, dispatch action literals, IO side effects) were visible in rendering code.
- References:
  - `/Users/mike/code/BeeKeeper/src/App.tsx:1`
  - `/Users/mike/code/BeeKeeper/src/game.ts:364`
- Remediation: Moved orchestration into `/Users/mike/code/BeeKeeper/src/features/apiary/provider/ApiaryProvider.tsx`; components only consume context contracts.

### `state-lift-state`
- `P2` Shared values (`selectedHive`, aggregate metrics, inter-panel state) were computed in one parent component and not provided as injectable context.
- Remediation: Lifted to provider with shared derived state and actions used by sibling panels.

### `patterns-explicit-variants`
- `P2` In-line mode branches obscured intent for win/loss and persistence states.
- Remediation: Explicit variant components now encode each mode as concrete render units.

### `patterns-children-over-render-props`
- `P3` No render-prop misuse detected.
- Outcome: No remediation required.

### `react19-no-forwardref`
- `P3` No `forwardRef` usage detected.
- `P2` Context consumption was not standardized to React 19 `use()` pattern.
- Remediation: Added `/Users/mike/code/BeeKeeper/src/features/apiary/hooks/useApiary.ts` using `use(ApiaryContext)`.

## Domain and Persistence Seams
- `/Users/mike/code/BeeKeeper/src/game.ts` remains a pure simulation/domain module (no UI coupling introduced).
- Persistence is now abstracted behind:
  - `/Users/mike/code/BeeKeeper/src/persistence/SaveRepository.ts`
  - `/Users/mike/code/BeeKeeper/src/persistence/TauriSaveRepository.ts`
  - `/Users/mike/code/BeeKeeper/src/persistence/WebUnsupportedSaveRepository.ts`

## Remediation Mapping
- Provider/context boundary: completed.
- Component decomposition: completed.
- Explicit mode variants: completed.
- Persistence abstraction seam: completed.
- React 19 context consumption pattern (`use()`): completed.

## Residual Risks
- Game simulation randomness can complicate deterministic UI tests; provider and integration tests should pin deterministic setup for edge paths.
