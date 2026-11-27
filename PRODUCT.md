# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Responsive web app, installable as a PWA (including edge-to-edge on iOS). Mobile web, not native.

## Users

**Primary: the player building and using their own character sheet.** When a design trade-off has to pick a side, the player wins. They create a character step by step or in one click, edit it as the campaign goes, level it up, and consult it during play — often on a phone at an in-person table, with the screen locking and the app being switched away from and back to frequently.

**Secondary: the game master (mestre).** Generates threats/NPCs, items and rewards; runs virtual tables (online, in-person, or solo); manages players' sheets and the GM compendium.

**Also present:** community creators publishing homebrews, builds and bestiary entries; readers of the blog, forum and Caverna do Saber; supporters (apoiadores) who pay for higher limits and exclusive features.

## Product Purpose

Fichas de Nimb is a character sheet generator and companion platform for the Brazilian tabletop RPG **Tormenta 20**. It turns the official rules into a sheet that calculates itself: from level 1 to 20, random or chosen detail by detail, exported to PDF or Foundry VTT. Success means a player gets a correct, rules-valid sheet without opening the rulebook to do arithmetic, and keeps using it at the table.

Production: https://fichasdenimb.com.br. Scale (May 2026): ~11.5K users, ~1.2K tables, ~800 DAU, ~3.8K WAU.

## Positioning

Confirmed differentiators, all four together:

1. **Official rules, calculated.** The Tormenta 20 core book and supplements (Ameaças de Arton, Atlas de Arton, Deuses de Arton, Heróis de Arton, Guia de Deuses Menores) are implemented as data and logic; the sheet derives its numbers and can explain them (e.g. Defesa).
2. **A full sheet in one click.** Random generation produces a complete, valid sheet instantly, with optional filters (race, class, origin, deity, level).
3. **Free, offline core.** Creating, editing, levelling up and exporting PDF work without an account and without the backend.
4. **A community ecosystem built for T20.** Virtual tables, homebrews, builds, community bestiary, public profiles, blog and forum in one place, around the same sheets.

## Operating Context

- In-person sessions with players on phones; online sessions; GMs running solo tables, sometimes with a TV display.
- Integrations: Owlbear Rodeo extension, Roll20 extension (Chrome), Foundry VTT JSON export, PDF filled into the official-layout template (`public/sheet.pdf`).
- Supplements are toggled on and off per user; free accounts have a limit on active supplements.
- Open-core: this repository is public (MIT) and holds only sheet generation; platform features live in the private `src/premium` submodule, backend in the private `backend` submodule.

## Capabilities and Constraints

- Core (no account): character creation wizard, random sheet, level-up wizard, full sheet editor, threat generator, superior/magic item creators, reward roller, Enciclopédia de Tanah-Toh, Caverna do Saber, PDF and Foundry export, 3D dice roller, light/dark theme, PWA.
- Free account: cloud sheets in folders, virtual tables, community homebrews, builds and bestiary, blog/forum posting, gamified public profile.
- Supporters: raised limits plus exclusive features (Multiclasse, Efeitos Ativos, Complicações, area-of-effect guide, and others).
- Stack is fixed by the existing codebase: React 17 + TypeScript, Vite, Material-UI v9 + Tailwind, Redux Toolkit. Frontend on Cloudflare Pages, backend on Fly.io.
- Terminology: all content uses the exact official Tormenta 20 terms (Defesa, PV, PM, perícias, poderes concedidos, devoto, etc.).

## Brand Commitments

- **Name:** Fichas de Nimb.
- **Fan project.** No affiliation with Jambô Editora (owner of Tormenta 20). Never use official Jambô art or logos, and never imply endorsement or that the app replaces the books.
- **Portuguese (Brazil) only**, with official Tormenta 20 terminology exactly as in the books.
- **Mobile at the table is critical.** Interfaces must survive phone use mid-session: interruptions, screen locks, app switching, one-handed reading.

## Evidence on Hand

- Usage metrics above (May 2026).
- Changelog with version history (`src/components/screens/Changelog.tsx`, `CHANGELOG.md`) and release posts (`release-posts/`).
- Official rulebooks in `livros/` (gitignored), used as the source of truth for rules. They are not a source of artwork.
- No collected testimonials, press, or case studies recorded here; do not fabricate them.

## Product Principles

1. **The rules are the product.** Correctness to the official books comes before convenience or flourish; a number on the sheet must be traceable to a rule.
2. **The player at the table first.** Optimize for someone reading and editing their own sheet on a phone during a session; GM and platform surfaces must not make that harder.
3. **Free core stays whole.** Generating, editing and exporting a sheet never requires an account; paid features add to it, never gate it.
4. **Speak Tormenta 20.** Use the books' words, in Portuguese, so players recognise their game instantly.
5. **A fan's tool, honestly.** Earn trust through accuracy and openness, never by borrowing the publisher's identity.
