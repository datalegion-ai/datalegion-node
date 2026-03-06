<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/datalegion-ai/datalegion-node/main/.github/logo-light.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/datalegion-ai/datalegion-node/main/.github/logo.svg">
    <img alt="Data Legion" src="https://raw.githubusercontent.com/datalegion-ai/datalegion-node/main/.github/logo.svg" width="260">
  </picture>
</p>

<h1 align="center">Data Legion Node.js SDK</h1>

<p align="center">
  <a href="https://github.com/datalegion-ai/datalegion-node/actions/workflows/test.yml"><img src="https://github.com/datalegion-ai/datalegion-node/actions/workflows/test.yml/badge.svg" alt="Tests"></a>&nbsp;&nbsp;
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>&nbsp;&nbsp;
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg" alt="Node.js"></a>
</p>

TypeScript client for the [Data Legion API](https://www.datalegion.ai/docs). Provides typed access to person enrichment, company enrichment, search, discovery, and utility endpoints.

- Zero external dependencies -- uses built-in `fetch` (Node.js 18+)
- Full TypeScript type definitions for all request and response objects
- Async-only API

## Installation

```bash
npm install datalegion
```

## Quick Start

```typescript
import DataLegion from 'datalegion';

const client = new DataLegion({ apiKey: 'legion_live_...' });
```

Or set the `DATALEGION_API_KEY` environment variable and omit the constructor argument:

```typescript
const client = new DataLegion();
```

## Person Enrichment

Look up a person by email, phone, social URL, name + location, or other identifiers.

```typescript
const person = await client.person.enrich({ email: 'john@example.com' });
console.log(person.full_name);
console.log(person.job_title, 'at', person.company_name);
```

Return multiple matches:

```typescript
const results = await client.person.enrich({
  email: 'john@example.com',
  multiple_results: true,
  limit: 2,
});

for (const match of results.matches) {
  console.log(match.person.full_name, '-', match.match_metadata?.match_confidence);
}
```

## Person Search

Search for people using a SQL query.

```typescript
const results = await client.person.search({
  query: "SELECT * FROM people WHERE company_name ILIKE '%google%'",
  limit: 10,
});

console.log(`Found ${results.total} people`);
for (const match of results.matches) {
  console.log(match.person.full_name, '-', match.person.job_title);
}
```

## Person Discover

Search for people using natural language.

```typescript
const results = await client.person.discover({
  query: 'engineers in San Francisco who worked at Google',
  limit: 10,
});

for (const match of results.matches) {
  console.log(match.person.full_name);
}
```

## Company Enrichment

Look up a company by domain, name, LinkedIn ID, social URL, or ticker symbol.

```typescript
const company = await client.company.enrich({ domain: 'google.com' });
console.log(company.name?.cleaned);
console.log(company.industry, '-', company.size);
console.log('Employees:', company.legion_employee_count);
```

Return multiple matches:

```typescript
const results = await client.company.enrich({
  name: 'Google',
  multiple_results: true,
});

for (const match of results.matches) {
  console.log(match.company.name?.cleaned, '-', match.company.domain);
}
```

## Company Search

Search for companies using a SQL query.

```typescript
const results = await client.company.search({
  query: "SELECT * FROM companies WHERE industry = 'software development'",
  limit: 10,
});

for (const match of results.matches) {
  console.log(match.company.name?.cleaned, '-', match.company.domain);
}
```

## Company Discover

Search for companies using natural language.

```typescript
const results = await client.company.discover({
  query: 'AI companies with more than 100 employees',
  limit: 10,
});

for (const match of results.matches) {
  console.log(match.company.name?.cleaned);
}
```

## Utility: Clean

Clean and normalise fields (email, phone, domain, name, etc.).

```typescript
const cleaned = await client.utility.clean({
  fields: {
    email: 'John.Doe+tag@gmail.com',
    phone: '(555) 123-4567',
    domain: 'https://www.Google.com/about',
  },
});

for (const [field, result] of Object.entries(cleaned.results)) {
  console.log(`${field}: ${result.original} -> ${result.cleaned}`);
}
```

## Utility: Hash Email

Hash an email address (SHA-256, SHA-1, MD5).

```typescript
const hashed = await client.utility.hashEmail({ email: 'john@example.com' });
console.log(hashed.hashes.sha256);
```

## Utility: Validate

Validate input data and receive errors, warnings, and suggestions.

```typescript
const validation = await client.utility.validate({
  email: 'john@example.com',
  phone: '+15551234567',
  company: 'Google LLC',
});

if (validation.valid) {
  console.log('All fields are valid');
} else {
  for (const err of validation.errors) {
    console.log(`${err.field}: ${err.error}`);
  }
}
```

## Health Check

```typescript
const health = await client.health();
console.log(health.status); // "ok"
```

## Response Metadata

After each request, the client exposes metadata from response headers:

```typescript
await client.person.enrich({ email: 'john@example.com' });

console.log(client.requestId);           // unique request ID
console.log(client.creditsUsed);          // credits consumed
console.log(client.creditsRemaining);     // credits remaining
console.log(client.contractId);           // contract ID
console.log(client.rateLimitLimit);       // requests quota in current window
console.log(client.rateLimitRemaining);   // remaining requests in current window
console.log(client.rateLimitReset);       // unix timestamp when window resets
console.log(client.rateLimitPolicy);      // rate limit policy (e.g. "100/min")
console.log(client.retryAfter);           // seconds to wait (on 429 responses)
console.log(client.generatedQuery);       // SQL from discover endpoints
console.log(client.correlationId);        // echoed Correlation-ID
```

## Error Handling

All API errors throw typed error classes that extend `DataLegionError`:

```typescript
import { DataLegionError, AuthenticationError, RateLimitError } from 'datalegion';

try {
  await client.person.enrich({ email: 'john@example.com' });
} catch (err) {
  if (err instanceof AuthenticationError) {
    console.error('Invalid API key:', err.message);
  } else if (err instanceof RateLimitError) {
    console.error('Rate limited:', err.message);
  } else if (err instanceof DataLegionError) {
    console.error(`API error (${err.statusCode}):`, err.message);
  }
}
```

| Error Class                | HTTP Status | Description                |
| -------------------------- | ----------- | -------------------------- |
| `AuthenticationError`      | 401         | Invalid or missing API key |
| `InsufficientCreditsError` | 402         | Not enough credits         |
| `ValidationError`          | 422         | Invalid request parameters |
| `RateLimitError`           | 429         | Too many requests          |
| `DataLegionError`          | any         | Base class for all errors  |

Each error exposes `statusCode`, `error`, `message`, and `details` properties.

## Configuration

```typescript
const client = new DataLegion({
  apiKey: 'legion_live_...',       // required (or set DATALEGION_API_KEY env var)
  baseURL: 'https://api.datalegion.ai', // default
  timeout: 60000,                  // default: 60s
  defaultHeaders: {                // optional extra headers
    'X-Custom-Header': 'value',
  },
});
```

## Documentation

Full API documentation is available at [https://www.datalegion.ai/docs](https://www.datalegion.ai/docs).
