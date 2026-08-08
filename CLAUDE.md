# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gerador de Fichas de Tormenta 20 - A character sheet generator for the Brazilian tabletop RPG "Tormenta 20". The app generates random or customized character sheets with comprehensive RPG rules implementation.

### Project Structure

- **Frontend (public)**: Main React application for character sheet generation (this repository)
- **Backend (private submodule)**: Node.js backend for premium features and user authentication (located in `/backend`)
- **Premium Features (private submodule)**: Premium frontend features (located in `/src/premium`)

## Git Submodules

This project uses git submodules for backend and premium features:

- **Backend**: `git@github.com:YuriAlessandro/fichas-de-nimb-backend.git` (located in `/backend`)
- **Premium**: `git@github.com:YuriAlessandro/fichas-de-nimb-premium.git` (located in `/src/premium`)

**IMPORTANT**: New features should be developed in the premium submodule (`/src/premium`) as they will be paid features. The main repository remains open-source with core functionality.

### Working with Submodules

```bash
# Clone repository with submodules
git clone --recurse-submodules git@github.com:YuriAlessandro/gerador-ficha-tormenta20.git

# If already cloned, initialize and update submodules
git submodule init
git submodule update

# Pull latest changes from backend submodule
cd backend
git pull origin main
cd ..
git add backend
git commit -m "Update backend submodule"

# Pull latest changes from premium submodule
cd src/premium
git pull origin main
cd ../..
git add src/premium
git commit -m "Update premium submodule"

# Working in the backend
cd backend
# Make changes, commit, push as normal
git add .
git commit -m "Your commit message"
git push origin main
# Then update parent repository
cd ..
git add backend
git commit -m "Update backend submodule reference"

# Working in premium features
cd src/premium
# Make changes, commit, push as normal
git add .
git commit -m "Your commit message"
git push origin main
# Then update parent repository
cd ../..
git add src/premium
git commit -m "Update premium submodule reference"
```

## Commands

### Frontend Development

```bash
npm install          # Install frontend dependencies
npm start           # Start Vite dev server at localhost:5173
npm run build       # Build for production
```

Frontend é deployado automaticamente no **Cloudflare Pages** a cada push em `main`, via GitHub Actions (`.github/workflows/deploy-frontend.yml`).

### Backend Development

```bash
cd backend
npm install         # Install backend dependencies
npm run dev        # Start backend dev server
npm run build      # Build backend for production
npm start          # Start production server
```

### Full Stack Development

```bash
# Terminal 1 - Frontend
npm start

# Terminal 2 - Backend
cd backend && npm run dev
```

### Code Quality

```bash
npx tsc --noEmit   # Run TypeScript compiler check
npx eslint <filename>  # Run ESLint on specific files
npx prettier --write <filename>  # Format files with Prettier
npx prettier --check <filename>  # Check if files are formatted
```

## Architecture

### Core Structure

- **Feature-based components**: Components organized by feature (SheetResult/, DatabaseTables/)
- **Redux Toolkit**: State management with `sheetBuilder` and `sheetStorage` slices
- **TypeScript-first**: Comprehensive interfaces in `/interfaces` for all RPG entities
- **Data-driven**: All game content in `/data` folder as TypeScript objects

### Key Patterns

1. **Multi-step Character Builder**: Wizard-style form with steps for race, class, origin, attributes, equipment
2. **PDF Generation**: Uses pdf-lib to fill template PDF (`public/sheet.pdf`) with character data
3. **Persistent Storage**: Redux Persist saves character sheets locally
4. **Theme System**: Material-UI v9 with light/dark mode support

### Important Files

**Frontend:**

- `src/store/` - Redux store configuration and slices
- `src/interfaces/` - All TypeScript type definitions for RPG entities
- `src/data/` - Game content (races, classes, spells, equipment)
- `src/functions/` - Business logic and utility functions
- `src/premium/` - Premium features submodule (PRIVATE)

**Backend (when present):**

- `backend/src/` - Backend source code
- `backend/src/api/` - API routes and controllers
- `backend/src/models/` - Database models
- `backend/src/services/` - Business logic services

**Premium (when present):**

- `src/premium/` - Premium frontend features (PRIVATE)
- New paid features should be developed here
- Integrates with main app through exports

### Deprecated - DO NOT USE

- **SheetBuilder folder**: Components in `src/components/SheetBuilder/` are deprecated and should be ignored
- **t20-sheet-builder library**: This NPM package is deprecated - never import or use anything from it

### Technology Stack

- React 17 + TypeScript (strict mode)
- Vite 4.3.9 (build tool)
- Material-UI v9 + Tailwind CSS (inputs numéricos usam o wrapper `src/components/common/NumberField.tsx` — Base UI + blocos MUI)
- Redux Toolkit with Redux Persist
- pdf-lib for PDF generation

### Development Notes

- All content is in Portuguese (Brazilian)
- Follows official Tormenta 20 RPG rules and terminology
- ESLint with Airbnb config + Prettier for formatting
- **IMPORTANT**: Always run `npx prettier --write <filename>` on every file you create or edit to ensure consistent formatting
- **IMPORTANT**: Always develop with mobile responsiveness in mind - while most users are on desktop, a significant portion use mobile devices
  - Use responsive MUI breakpoints (xs, sm, md, lg, xl)
  - Test layouts for both mobile and desktop views
  - Use `isMobile` pattern: `const isMobile = window.innerWidth <= 768;`
- Produção em https://fichasdenimb.com.br

### Infraestrutura

- **Frontend** (este repo): **Cloudflare Pages**, projeto `fichas-frontend`. Push em `main` → GitHub Actions (`.github/workflows/deploy-frontend.yml`) faz `npm run build` e publica via `wrangler pages deploy` (Direct Upload). A integração Git nativa do Pages **não serve**: não clona submódulo privado, e o build depende de `src/premium`.
- **Backend** (`/backend` submodule): Fly.io `fichas-backend` em região `gru` (São Paulo) — `shared-cpu-2x` 1GB, 1 machine, `auto_stop_machines=off`. Deploy automatizado via GitHub Actions (`.github/workflows/fly-deploy.yml`) no repo do backend. Runbook completo em `backend/docs/runbook.md`.
- **Banco**: MongoDB Atlas (externo, fora do GCP).
- **Auth**: Firebase Auth (no projeto GCP `fichas-de-nimb`). **É a única coisa que ainda vive no GCP** — todo o resto foi decomissionado em 08/08/2026. Não apagar o projeto.
- **Pagamentos**: Stripe — webhooks vão direto pra `https://fichas-backend.fly.dev/api/webhooks/stripe`.

#### Serving layer (o que era o nginx do Cloud Run)

O Pages não é só hospedagem estática aqui. Três arquivos carregam o que o `nginx.conf` fazia:

- `public/_redirects` — SPA fallback. Precisa ser explícito porque rotas têm ponto (`/perfil/user.name`) e o fallback automático do Pages as trata como arquivo.
- `public/_headers` — cache, CORS dos assets e headers de segurança. `X-Frame-Options` é destacado (`!`) em `/owlbear/*` e `/mapadearton*`.
- `functions/_middleware.ts` — proxy de SEO por User-Agent (crawler → backend, que devolve HTML com OG tags) e remoção do XFO no subdomínio `mapadearton.*`.
- `public/_routes.json` — **crítico para custo**: restringe quais caminhos invocam a Function. Sem ele, toda requisição de asset conta na cota do Workers (100k/dia no free).

⚠️ **Transform Rules / regras de resposta da zona Cloudflare NÃO se aplicam ao tráfego servido pelo Pages** (verificado empiricamente). Qualquer manipulação de header de resposta vai em `_headers` ou na Function — não no dashboard de Rules.

### ESLint Rules - DO NOT VIOLATE

This project uses strict ESLint rules. **Always follow these guidelines to avoid common errors:**

#### ❌ NEVER Use:

1. **`any` type** - Use specific types or proper type assertions

   ```typescript
   // ❌ BAD
   const data = response as any;

   // ✅ GOOD
   const data = response as ResponseType;
   // or
   const data = response as unknown as ResponseType;
   ```

2. **`unknown` as direct type** - Use proper type guards or assertions

   ```typescript
   // ❌ BAD
   supplements as unknown;

   // ✅ GOOD
   supplements as unknown as SupplementId[];
   ```

3. **Prop spreading (`{...other}`)** - Explicitly pass props

   ```typescript
   // ❌ BAD
   const { children, ...other } = props;
   return <div {...other}>{children}</div>;

   // ✅ GOOD
   const { children, className, onClick } = props;
   return (
     <div className={className} onClick={onClick}>
       {children}
     </div>
   );
   ```

4. **Unused variables** - Remove or prefix with `_`

   ```typescript
   // ❌ BAD
   const { data } = await api.get(); // 'data' is never used

   // ✅ GOOD
   await api.get(); // Don't destructure if not needed
   // or
   const { data: _data } = await api.get(); // Prefix with _ if intentionally unused
   ```

5. **Empty block statements** - Add comments or remove

   ```typescript
   // ❌ BAD
   if (condition) {
   }

   // ✅ GOOD
   if (condition) {
     // Intentionally empty - handle in future
   }
   // or just remove the if block
   ```

6. **Unnecessary return statements**

   ```typescript
   // ❌ BAD
   if (condition) {
     return;
   }

   // ✅ GOOD
   if (!condition) {
     // Do something
   }
   ```

#### ✅ Always Do:

1. **Use specific types** - Import and use proper TypeScript interfaces/types
2. **Type assertions with context** - Use `as unknown as Type` for complex conversions
3. **Explicit prop passing** - List all props individually instead of spreading
4. **Clean up unused code** - Remove unused variables or imports immediately
5. **Add meaningful comments** - For intentionally empty blocks or complex logic
6. **Run linter before commit** - `npx eslint <files> --max-warnings=0`

### Backend Integration Notes

- **Backend Privacy**: The backend repository is PRIVATE and should never be pushed to public repositories
- **API Communication**: Frontend communicates with backend via REST API (consider CORS configuration)
- **Authentication**: Backend handles user authentication for premium features
- **Environment Variables**: Keep all sensitive configuration in `.env` files (never commit these)
- **Development**: Backend runs separately from frontend during development

### TODO: Future Development

- **Sheet Edit Persistence**: ✅ COMPLETED - When implementing sheet editing functionality, ensure that any edits to a character sheet also update its corresponding save in localStorage ('fdnHistoric'). This maintains consistency between the displayed sheet and the saved history.
- ✅ COMPLETED - to memorize users must be able to remove any power or spell from the sheet
- ✅ COMPLETED - **Historic Sheet Editing**: Function restoration system automatically restores spellPath functions and Bag class methods when loading historic sheets, enabling full editing capabilities for all stored sheets.
