# Release Command

Create a changelog entry and commit all pending changes for a new version.

## Arguments

- `$ARGUMENTS` — the version number (e.g., `4.8`, `5.0`)

## Instructions

You are creating a release for version **$ARGUMENTS** of the Gerador de Fichas de Tormenta 20 project.

Follow these steps in order:

### Step 1: Gather context

Run the following commands to understand what work was done since the last release:

1. `git log --oneline` — look at recent commits to understand what changed. Identify all commits since the last version bump or release commit.
2. `git diff --stat` — check for any uncommitted changes.
3. `git status` — check for untracked files.

### Step 2: Generate the changelog entry

Read the file `src/components/screens/Changelog.tsx` (first ~150 lines) to understand the existing format and structure.

The changelog uses this pattern inside `<AccordionDetails>`:
- Each version is an `<h3>` tag (e.g., `<h3>4.7</h3>`)
- Changes are listed in `<ul><li>` elements
- Each item starts with a bold category like `<strong>Correção:</strong>`, `<strong>Novo:</strong>`, `<strong>Melhoria:</strong>`, etc.
- Text is in Brazilian Portuguese

Based on the git log, create a new `<h3>$ARGUMENTS</h3>` section with `<ul><li>` entries summarizing all the work done since the last version. Place it **above** the previous version's `<h3>` tag inside the current major version's `<AccordionDetails>`.

Use these categories:
- **Novo:** — for new features
- **Correção:** — for bug fixes
- **Melhoria:** — for improvements/enhancements
- **Remoção:** — for removed features

Also update the "Última atualização em" date in the introductory paragraph to today's date in DD/MM/YYYY format.

### Step 3: Format the file

Run `npx prettier --write src/components/screens/Changelog.tsx` to ensure consistent formatting.

### Step 4: Stage and commit everything

1. Stage all pending changes: `git add -A`
2. Create a single commit with the message: `release: v$ARGUMENTS`

Include the co-author line:
```
Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

### Important notes

- Do NOT push to remote — only commit locally.
- Write changelog entries in Brazilian Portuguese.
- Keep descriptions concise but informative, matching the existing style.
- If there are no meaningful changes in the git log, ask the user what should go in the changelog before proceeding.
