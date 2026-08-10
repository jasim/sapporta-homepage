# Refactor prompt: `BooksTableDataGrid.tsx`

Paste the contents of this file, followed by the full source of
`packages/docs/src/components/BooksTableDataGrid.tsx`, into a fresh
conversation.

---

## Goal

Simplify `BooksTableDataGrid.tsx` so it is dramatically less complex, more
elegant, and easier to read — while preserving **all** existing functionality
and **all** existing exported/external surface area (props, behavior, URL deep
linking semantics, keyboard interactions, copy-to-clipboard, inline expansion,
dialog details, schema loading, etc.). Do not remove or rename any variable,
prop, or public identifier that other code depends on. The behavior a user
observes in the homepage demo must be identical before and after.

This is a refactor for clarity, not a rewrite for new features.

## Context

This component powers an interactive demo on a marketing/docs homepage. It
renders a Sapporta `TableGridView` of a `books` table with child `quotes`
rows. The interesting UX is:

- Press **Enter** on a clipped quote cell to expand it inline; press **Enter**
  again (or on an unclipped quote) to edit the quote text.
- Press **Enter/Space/Click** on the quote details column to open a dialog
  showing the full quote with book/author credit and a copy button.
- Opening that dialog writes `?quoteBook=…&quoteRow=…` to the URL (deep link).
- Visiting the page with those params present should expand the parent book
  row, reveal it, and open the matching quote dialog.
- Quote cells measure their own text overflow to decide whether inline
  expansion applies.

## Current problems (identified, not prescriptive)

These are the readability and complexity pain points in the current code. Treat
them as symptoms to address, not as a checklist of specific patches. You are
free to choose the structure that resolves them most elegantly.

1. **Ref-based shadowing of state.** Because the TGrid `definition` is memoized
   once and its activation callbacks must stay stable, interaction state is
   duplicated into refs (`expandedQuoteRef`, `clippedQuotesRef`,
   `navigateRef`, `searchParamsRef`) that mirror real state and are kept in
   sync by hand. The result is two sources of truth for the same facts and a
   mental tax on every callback.

2. **Split state for "which quote is open."** Inline expansion lives in local
   React state (`expandedQuote`); the details dialog lives in URL search params
   (`activeQuoteDialog`, derived). Both flow through a single context bundle
   that mixes the two concerns with the callbacks that mutate them. It is hard
   to tell what is source-of-truth vs. derived.

3. **Ad-hoc quote identity system.** A handful of helpers
   (`quoteDetailsIdentity`, `quoteIdentityMatches`, `quoteIdentityKey`) build
   and compare `{ path, rowKey }` pairs by hand throughout the file. This
   micro-framework is verbose relative to what it does.

4. **Repetitive URL helpers.** `quoteDeepLinkFromSearchParams`,
   `quoteDeepLinkUrl`, and `quoteBaseUrl` each re-implement near-identical
   `URLSearchParams` manipulation around the same two parameter names. The
   param names are also spread across multiple constants.

5. **Deep-link book expansion is a hand-rolled observer.**
   `expandDeepLinkedBookWhenAvailable` manually subscribes to
   `root.subscribeDisplayedRowSequence`, manages `watching` flags, an
   `unsubscribe`, a `releaseWatcher` self-reference, and several early-return
   paths. The control flow is hard to follow and easy to break.

6. **Overflow-clipping measurement is heavy for what it does.** Each quote
   cell runs a `useLayoutEffect` + `ResizeObserver` + a shared ref `Map` to
   answer "is this text clipped?", then feeds the answer back to a parent-owned
   ref so the activation callback can read it synchronously. The wiring between
   the cell, the ref map, and the definition callback is indirect.

7. **Large inline `definition` memo.** The `useMemo` that builds the TGrid
   definition contains nested column builders, two activation `run` closures,
   editor wiring, and references to multiple refs. The essential intent
   ("these two columns behave this way") is buried inside plumbing.

8. **Boilerplate editor lifecycle.** `QuoteTextEditor` manually tracks a
   `finishedRef` guard and a `draftRef` mirror alongside local `draft` state,
   with focused/blur/tab/escape handling spread across inline handlers.

9. **Cross-cutting coupling via context.** Cell and editor components reach
   into `QuoteExpansionContext` for both state and mutation, which makes the
   data flow hard to trace and couples leaf components to the parent's
   orchestration shape.

## Direction

Aim for a single, obvious place where each fact lives; let derivation replace
mirrored state where possible; collapse the duplicated URL logic; make the
deep-link lifecycle read as a straightforward sequence rather than a manual
subscription; and let the TGrid definition express column intent with the
plumbing factored out. Prefer React's native primitives and small focused hooks
over bespoke ref-synchronization. The reader should be able to follow "what
happens when I press Enter on a quote" top-to-bottom without jumping between
five refs and two state stores.

Do not change the TGrid/`@sapporta/frontend` API surface or the URL contract.
Keep all user-facing behavior identical. Optimize for a reader who has never
seen this file before.

## Non-goals

- No new features.
- No changes to the schema, the URL parameter names, or the demo's visible
  behavior.
- No premature abstraction — if something is genuinely simple, leave it simple.
