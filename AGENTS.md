# Agent Guidelines for svelte-convex

## Build/Test Commands

- **Dev**: `npm run dev` - Start Vite dev server (or `pnpm start:dev` for dev + Convex)
- **Build**: `npm run build` - Build for production
- **Type Check**: `npm run check` - Run svelte-check with TypeScript
- **Lint**: `npm run lint` - Run Prettier check + ESLint
- **Format**: `npm run format` - Auto-format with Prettier
- **Test All**: `npm test` - Run unit + e2e tests
- **Unit Tests**: `npm run test:unit` - Run Vitest (browser + server)
- **Single Test**: `npm run test:unit -- path/to/file.spec.ts` - Run specific test file
- **E2E Tests**: `npm run test:e2e` - Run Playwright tests

## Code Style

- **TypeScript**: Strict mode enabled (`strict: true`), allowJs/checkJs enabled
- **Formatting**: Tabs for indentation, single quotes, no trailing commas, 100 char line width
- **Imports**: Use relative paths for local files (e.g., `../lib/utils`), absolute for packages
- **Types**: Always use explicit types, avoid `any`, no-undef disabled for TypeScript files
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Svelte 5**: Use runes (`$state`, `$props`, `$derived`) for reactivity
- **Error Handling**: Use try/catch for async operations
- **Convex**: Import from `./_generated/server` for queries/mutations, use validators from `convex/values`
- **Test Files**: Use `.spec.ts` or `.test.ts` for server tests, `.svelte.spec.ts` for component tests
- **Vitest**: All tests require assertions (`requireAssertions: true`)
