# Contributing

Thank you for your interest in contributing to the Data Legion Node.js SDK.

## Getting Started

1. Fork the repository
2. Clone your fork and create a new branch
3. Install dependencies: `bun install`
4. Make your changes

## Development

```bash
bun install          # Install dependencies
bun run lint         # Run linter
bun run lint:fix     # Run linter with auto-fix
bun run build        # Build the project
bun run test         # Run tests (requires DATALEGION_API_KEY)
```

## Pull Requests

- Keep changes focused and scoped to a single feature or fix
- Ensure `bun run lint` and `bun run build` pass before submitting
- Write a clear PR description explaining the change and motivation

## Code Style

- TypeScript strict mode
- Follow existing patterns in the codebase
- Zero external dependencies — use built-in Node.js APIs

## Reporting Issues

Use the [issue templates](https://github.com/datalegion-ai/datalegion-node/issues/new/choose) to report bugs or request features.

## Security

Please see [SECURITY.md](SECURITY.md) for reporting vulnerabilities.
