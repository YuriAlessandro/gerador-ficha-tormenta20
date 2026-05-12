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

### Step 4: Commit changes

There are two types of changes to commit — handle them separately:

#### 4a. Commit pending code changes (if any)

If there are uncommitted changes **other than** `Changelog.tsx` (e.g., bug fixes, data corrections, new features), commit them first with a message that describes **what was actually changed** — not the version number. For example: `fix: corrigir duração da magia Velocidade`.

1. Stage only the non-changelog files: `git add <files>`
2. Create a commit with a descriptive message reflecting the change.

If there are multiple unrelated changes, create separate commits for each.

#### 4b. Commit the changelog

After all code changes are committed:

1. Stage only the changelog: `git add src/components/screens/Changelog.tsx`
2. Create a commit with the message: `release: v$ARGUMENTS`

Include the co-author line in all commits:
```
Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

### Step 5: Manual testing walkthrough (SEMPRE)

After committing, you **MUST** output a manual testing walkthrough for at least one scenario from the work done in this release. This is mandatory — never skip this step.

Requirements:
- Pick at least one meaningful change from this release (prefer a user-visible feature, fix, or improvement).
- Write the walkthrough in Brazilian Portuguese, addressed to the user as if they were a normal end user of the app.
- Describe the steps as clicks/taps and visible UI interactions only (e.g., "abra o app", "clique em X", "selecione Y", "verifique que Z aparece").
- Do NOT include project setup, dev server, build commands, env vars, or any technical/developer context — assume the user is just using the app in the browser.
- Be specific: name the actual buttons, screens, fields, and expected results so the user can follow it without guessing.
- If there are multiple distinct changes worth testing, you may include more than one scenario, but at least one is required.

Format the output as a clearly labeled section at the end of your final message, e.g.:

```
## Como testar manualmente

**Cenário: <nome curto do que está sendo testado>**

1. ...
2. ...
3. Resultado esperado: ...
```

### Important notes

- Do NOT push to remote — only commit locally.
- Write changelog entries in Brazilian Portuguese.
- Keep descriptions concise but informative, matching the existing style.
- If there are no meaningful changes in the git log, ask the user what should go in the changelog before proceeding.
