import { DataLegion } from './client';

export { CompanyResource, DataLegion, PersonResource, UtilityResource } from './client';
export { AuthenticationError, DataLegionError, InsufficientCreditsError, RateLimitError, ValidationError } from './error';
export type {
  // Client options
  ClientOptions,

  // Shared / nested types
  CleanedRaw,

  // Request parameter types
  CleanParams,
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
} from './types';

// Default export for convenient usage:
//   import DataLegion from 'datalegion';
export default DataLegion;
