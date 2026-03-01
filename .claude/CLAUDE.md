# CLAUDE.md

TypeScript SDK for the Data Legion API. Async client for person/company enrichment, search, discover, and utility endpoints. Zero external dependencies.

## Commands

```bash
bun install            # Install dependencies
bun run lint           # Lint (eslint)
bun run lint:fix       # Lint with auto-fix
bun run build          # Build (tsc)
```

## Architecture

- `src/index.ts` - Barrel exports
- `src/client.ts` - Main DataLegion client class with resource namespaces
- `src/error.ts` - Error class hierarchy
- `src/types.ts` - TypeScript interfaces for all request/response types

## Guidelines

- Use `bun` for all commands
- Run lint after changes
- Zero external dependencies (uses built-in fetch)
- Keep it simple, no over-engineering
