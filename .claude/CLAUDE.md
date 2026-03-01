# CLAUDE.md

TypeScript SDK for the Data Legion API. Async client for person/company enrichment, search, discover, and utility endpoints. Zero external dependencies (uses built-in fetch, Node 20+).

## Commands

```bash
bun install            # Install dependencies
bun run lint           # Lint (eslint)
bun run lint:fix       # Lint with auto-fix
bun run build          # Build (tsc)
bun run test           # Run tests with Vitest (needs DATALEGION_API_KEY env var)
```

## Architecture

- `src/index.ts` - Barrel exports
- `src/client.ts` - Main DataLegion client class with resource namespaces and TypeScript overloads for enrich return types
- `src/error.ts` - Error class hierarchy
- `src/types.ts` - TypeScript interfaces for all request/response types
- `tests/client.test.ts` - Integration tests using Vitest (call real API)

## Guidelines

- Use `bun` for all commands
- Run lint and tests after changes
- Zero external dependencies (uses built-in fetch)
- Keep it simple, no over-engineering
