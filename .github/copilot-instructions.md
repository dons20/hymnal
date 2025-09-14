# Copilot Instructions for AI Agents

## Project Overview
- **Hymnal** is a React (TypeScript) SPA for browsing, searching, and displaying hymns, optimized for mobile and desktop.
- Uses Mantine UI, React Router, Fuse.js (search), and localforage (local storage). Song data is loaded from JSON and can be updated/synced.
- Key files: `src/App.tsx` (routing/layout), `src/components/` (UI), `src/pages/` (page-level logic), `src/data/songs.ts` (sample data), `src/helpers/index.tsx` (data loading, context helpers).

## Architecture & Patterns
- **Context**: App-wide state (songs, favourites, UI meta) is managed via a custom context (`src/utils/context.ts`) using a `createCtx` helper. Use `useMainContext()` for access.
- **Routing**: All navigation is via React Router. Main routes: `/home`, `/songs/index`, `/songs/favourites`, `/song/:songID`, `/search`.
- **Component Structure**: UI is split into reusable components (e.g., `Card`, `Header`, `BottomNav`, `SongList`, `SongDisplay`). Pages compose these.
- **Song Data**: Songs are loaded from JSON (see `src/helpers/index.tsx` for logic). Favourites are stored in localforage. Song numbers are 1-based, but favourites use 0-based indexes.
- **Search**: Uses Fuse.js for fuzzy search on song number/title. See `Header` for search logic and dropdown/modal UX.
- **Presentation Mode**: `SongDisplay` supports a presentation mode for slide-style display of verses/chorus.

## Developer Workflows
- **Start Dev Server**: `yarn dev` or `npm run dev` (uses Vite)
- **Run Tests**: `yarn test` or `npm run test` (runs typecheck, lint, prettier, vitest, build)
- **Build**: `yarn build` or `npm run build`
- **Analyze Bundle**: `yarn analyze` (after build)
- **Storybook**: `yarn storybook` (for component dev)

## Project Conventions
- **Imports**: Use `@/` alias for `src/` (see `tsconfig.json` and Vite config).
- **Styling**: SCSS modules per component/page. Mantine theming is used for color/dark mode.
- **Testing**: Vitest and Testing Library. Tests in `src/components/__tests__/`.
- **Song/Favourite Indexing**: Song numbers are 1-based, but favourites and some internal logic use 0-based indexes. Be careful when toggling favourites.
- **Mobile UX**: `BottomNav` only appears on mobile and when scrolled to bottom. Responsive design is a priority.
- **Data Sync**: Song data is checked/updated on load. See `checkDB` and `loadNewSongs` in `src/helpers/index.tsx`.

## Integration Points
- **External Data**: Song data can be loaded from remote or local JSON. See `checkDB` for logic.
- **Local Storage**: Uses localforage for songs, version, and favourites.
- **Mantine**: All UI components use Mantine for styling and theming.

## Examples
- To add a new page, create a file in `src/pages/`, add a route in `App.tsx`, and use Mantine components for layout.
- To add a new UI component, place it in `src/components/`, export from `src/components/index.ts`, and import via `@/components`.
- To update song data, edit `src/data/songs.ts` or the JSON in `static/`.

---
For more, see `README.md` and code comments. When in doubt, follow the patterns in `src/pages/` and `src/components/`.
