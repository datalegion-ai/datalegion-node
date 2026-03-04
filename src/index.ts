import { DataLegion } from './client.js';

export { CompanyResource, DataLegion, PersonResource, UtilityResource } from './client.js';
export { AuthenticationError, DataLegionError, InsufficientCreditsError, RateLimitError, ValidationError } from './error.js';
export type {
  // Client options
  ClientOptions,

  // Shared / nested types
  CleanedRaw,

  // Request parameter types
  CleanParams,
  CompanyBulkEnrichParams,
  CompanyDomain,

  // Company response types
  CompanyEnrichParams,
  CompanyMatch,
  CompanyMatchesResponse,
  CompanyResponse,
  CompanySocial,
  DiscoverParams,
  Education,
  EducationOrganization,
  Email,
  EmailHashResponse,
  EmployeeCountByMonth,

  // Other response types
  ErrorResponse,
  Experience,
  ExperienceOrganization,
  FieldCleanResponse,

  // Utility response types
  FieldCleanResult,
  HashEmailParams,

  // Person response types
  HealthResponse,
  Language,
  Location,
  MatchMetadata,
  PersonBulkEnrichParams,
  PersonEnrichParams,
  PersonMatch,
  PersonMatchesResponse,
  PersonResponse,
  Phone,
  SearchParams,
  Skill,
  Social,
  Ticker,
  TimeBucketFloat,
  TimeBucketInt,
  ValidateParams,
  ValidationErrorDetail,
  ValidationResponse,
  ValidationSuggestion,
  ValidationWarning,

  // Bulk response types
  BulkCompanyEnrichResponse,
  BulkCompanyItemResult,
  BulkPersonEnrichResponse,
  BulkPersonItemResult,
} from './types.js';

// Default export for convenient usage:
//   import DataLegion from 'datalegion';
export default DataLegion;
