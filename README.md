# Svelte + Convex Task Manager

A modern task management application built with SvelteKit 2 and Convex, featuring real-time data synchronization and comprehensive test coverage.

## Features

- **Real-time Task Management**: View and manage tasks with live updates from Convex backend
- **Task Status Tracking**: Visual indicators for completed (✅) and incomplete (☐) tasks
- **Task Assignment**: Each task displays assigned user information
- **Responsive UI**: Clean, accessible interface using Pico CSS
- **Type-Safe**: Full TypeScript support with strict mode enabled
- **Comprehensive Testing**: Unit tests, component tests, and end-to-end tests

## Tech Stack

- **Frontend**: SvelteKit 2, Svelte 5
- **Backend**: Convex (real-time database & serverless functions)
- **Styling**: Pico CSS
- **Testing**: Vitest (unit), Playwright (e2e)
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite

## Project Structure

```
svelte-convex/
├── e2e/                          # End-to-end tests
│   └── tasks-page.test.ts        # E2E tests for tasks page (10 tests)
├── src/
│   ├── convex/                   # Convex backend functions
│   │   ├── _generated/           # Auto-generated Convex types
│   │   ├── tasks.ts              # Tasks query endpoint
│   │   └── tasks.spec.ts         # Unit tests for tasks API (6 tests)
│   ├── lib/                      # Shared library code
│   │   ├── assets/               # Static assets
│   │   └── index.ts              # Library exports
│   ├── routes/                   # SvelteKit routes
│   │   ├── +layout.svelte        # Root layout (Convex setup)
│   │   ├── +page.svelte          # Home page (tasks list)
│   │   └── page.svelte.spec.ts   # Component unit tests (4 tests)
│   ├── app.d.ts                  # App type definitions
│   ├── app.html                  # HTML template
│   └── demo.spec.ts              # Demo unit test
├── static/                       # Static files
│   └── robots.txt
├── convex.json                   # Convex configuration
├── sampleData.jsonl              # Sample task data for seeding
├── svelte.config.js              # SvelteKit configuration
├── vite.config.ts                # Vite & Vitest configuration
├── playwright.config.ts          # Playwright configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

### Installation

1. Clone the repository:

```sh
git clone <repository-url>
cd svelte-convex
```

2. Install dependencies:

```sh
npm install
# or
pnpm install
```

3. Set up Convex:

```sh
npx convex dev
```

This will create a `.env.local` file with your `PUBLIC_CONVEX_URL`.

4. (Optional) Seed sample data:

```sh
npx convex import --table tasks sampleData.jsonl
```

### Development

Start the development server:

```sh
npm run dev

# or start and open in browser
npm run dev -- --open
```

The app will be available at `http://localhost:5173`

## Available Scripts

### Development

- `npm run dev` - Start Vite dev server
- `npx convex dev` - Start Convex backend in dev mode

### Building

- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality

- `npm run check` - Run svelte-check with TypeScript
- `npm run lint` - Run Prettier check + ESLint
- `npm run format` - Auto-format with Prettier

### Testing

- `npm test` - Run all tests (unit + e2e)
- `npm run test:unit` - Run Vitest unit tests
- `npm run test:unit -- src/convex/tasks.spec.ts` - Run specific test file
- `npm run test:e2e` - Run Playwright e2e tests

## Testing

### Test Coverage

**Total: 21 tests (100% passing)**

#### Unit Tests (11 tests)

- **Tasks API** (`src/convex/tasks.spec.ts`): 6 tests
  - Query configuration validation
  - Task fetching and transformation
  - Empty list handling
  - Data preservation
  - Error handling
- **Page Component** (`src/routes/page.svelte.spec.ts`): 4 tests
  - H1 rendering
  - Task list rendering
  - Task text display
  - Assigner info display

- **Demo** (`src/demo.spec.ts`): 1 test
  - Basic arithmetic validation

#### E2E Tests (10 tests)

Located in `e2e/tasks-page.test.ts`:

- Page title and heading display
- Loading state handling
- Task list loading from Convex
- Completed/incomplete task rendering
- Task structure validation
- Error handling UI
- Accessibility checks
- Sample data validation

### Running Tests

```sh
# Run all tests
npm test

# Run unit tests in watch mode
npm run test:unit

# Run e2e tests with UI
npx playwright test --ui

# Run specific e2e test
npx playwright test -g "should display the page title"
```

## API Endpoints

### Convex Queries

#### `api.tasks.get`

Fetches all tasks from the database and adds an `assigner` field to each task.

**Returns:**

```typescript
Array<{
	_id: string;
	text: string;
	isCompleted: boolean;
	assigner: string;
	_creationTime: number;
}>;
```

**Example Usage:**

```typescript
import { useQuery } from 'convex-svelte';
import { api } from '../convex/_generated/api';

const query = useQuery(api.tasks.get, {});
// query.data contains the tasks array
// query.isLoading indicates loading state
// query.error contains any error
```

## Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Tabs for indentation, single quotes, no trailing commas, 100 char line width
- **Imports**: Relative paths for local files, absolute for packages
- **Types**: Always explicit types, no `any`
- **Naming**: camelCase for variables/functions, PascalCase for components/types

## Environment Variables

Create a `.env.local` file with:

```env
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

This is automatically created when you run `npx convex dev`.

## Deployment

### Deploy to Vercel

```sh
npm run build
# Deploy the .svelte-kit/output directory
```

### Deploy Convex Backend

```sh
npx convex deploy
```

> You may need to install a [SvelteKit adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Run tests (`npm test`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Resources

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Convex Documentation](https://docs.convex.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
