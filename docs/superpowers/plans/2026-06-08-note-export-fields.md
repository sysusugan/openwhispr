# Note Export Fields Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make single-note and bulk note exports use the same explicit field and asset handling rules.

**Architecture:** Export field selection moves to explicit `content` / `enhanced_content` inputs instead of implicit fallback. Single-note and selected-note exports both build content through `noteExportFormatter`, then run the same asset-copy/inline path for Markdown and PDF. Unreferenced `note_assets` are ignored.

**Tech Stack:** Electron IPC, React 19/TypeScript renderer, Node.js `node:test`.

---

### Task 1: Formatter And Asset Rules

**Files:**

- Modify: `src/helpers/noteExportFormatter.js`
- Modify: `src/helpers/noteAssetExport.js`
- Test: `test/helpers/noteExportFormatter.test.js`
- Test: `test/helpers/noteAssetExport.test.js`

- [ ] Add failing tests for explicit `content` / `enhanced_content` selection, no fallback from empty enhanced content, and no appended unreferenced images.
- [ ] Run `node --test test/helpers/noteExportFormatter.test.js test/helpers/noteAssetExport.test.js` and confirm the new tests fail.
- [ ] Implement `buildNoteExport()` / `getFieldValue()` exports and explicit `selectNoteExportContent(note, field)`.
- [ ] Stop using unreferenced asset appending in export paths.
- [ ] Re-run the focused node tests and confirm they pass.

### Task 2: IPC And Renderer Wiring

**Files:**

- Modify: `src/helpers/ipcHandlers.js`
- Modify: `preload.js`
- Modify: `src/types/electron.ts`
- Modify: `src/components/notes/NoteEditor.tsx`
- Modify: `src/components/notes/PersonalNotesView.tsx`

- [ ] Update `export-note` to accept either legacy `format` string or `{ format, field }`.
- [ ] Route single-note export through `buildNoteExport(note, { format, fields: [field], includeTitle: false })`.
- [ ] Route bulk export through the same `buildNoteExport()` before Markdown asset copying.
- [ ] Update `NoteEditor` to send `field: "enhanced_content"` only when `viewMode === "enhanced"`; otherwise send `field: "content"`.
- [ ] Keep transcript view on existing `exportTranscript` code path.

### Task 3: Verification

**Files:**

- No new files.

- [ ] Run `node --test test/helpers/noteExportFormatter.test.js test/helpers/noteAssetExport.test.js`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run i18n:check`.
- [ ] Inspect `git diff --check`.
