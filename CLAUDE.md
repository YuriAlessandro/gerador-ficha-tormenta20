# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gerador de Fichas de Tormenta 20 - A character sheet generator for the Brazilian tabletop RPG "Tormenta 20". The app generates random or customized character sheets with comprehensive RPG rules implementation.

### Project Structure

- **Frontend (public)**: Main React application for character sheet generation (this repository)
- **Backend (private submodule)**: Node.js backend for premium features and user authentication (located in `/backend`)

## Git Submodules

This project uses a git submodule for the backend. The backend repository is private and located at `git@github.com:YuriAlessandro/fichas-de-nimb-backend.git`.

### Working with Submodules

```bash
# Clone repository with submodules
git clone --recurse-submodules git@github.com:YuriAlessandro/gerador-ficha-tormenta20.git

# If already cloned, initialize and update submodules
git submodule init
git submodule update

# Pull latest changes from submodule
cd backend
git pull origin main
cd ..
git add backend
git commit -m "Update backend submodule"

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
```

## Commands

### Frontend Development

```bash
npm install          # Install frontend dependencies
npm start           # Start Vite dev server at localhost:5173
npm run build       # Build for production
npm run deploy      # Deploy to GitHub Pages (builds first)
```

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
4. **Theme System**: Material-UI v5 with light/dark mode support

### Important Files

**Frontend:**
- `src/store/` - Redux store configuration and slices
- `src/interfaces/` - All TypeScript type definitions for RPG entities
- `src/data/` - Game content (races, classes, spells, equipment)
- `src/functions/` - Business logic and utility functions

**Backend (when present):**
- `backend/src/` - Backend source code
- `backend/src/api/` - API routes and controllers
- `backend/src/models/` - Database models
- `backend/src/services/` - Business logic services

### Deprecated - DO NOT USE

- **SheetBuilder folder**: Components in `src/components/SheetBuilder/` are deprecated and should be ignored
- **t20-sheet-builder library**: This NPM package is deprecated - never import or use anything from it

### Technology Stack

- React 17 + TypeScript (strict mode)
- Vite 4.3.9 (build tool)
- Material-UI v5 + Tailwind CSS
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
- Deployed to GitHub Pages at https://yurialessandro.github.io/gerador-ficha-tormenta20/

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
