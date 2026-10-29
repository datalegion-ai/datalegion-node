import { DataLegion } from './client.js';

export { CompanyResource, DataLegion, PersonResource, UtilityResource } from './client.js';
export { AuthenticationError, BadRequestError, DataLegionError, InsufficientCreditsError, NotFoundError, PermissionDeniedError, RateLimitError, RequestTimeoutError, ServerError, ValidationError } from './error.js';
export type {
  // Bulk response types
  BulkCompanyEnrichResponse,

  BulkCompanyItemResult,
  BulkPersonEnrichResponse,

  BulkPersonItemResult,
  // Request parameter types
  Certification,
  // Shared / nested types
  CleanedName,
  CleanedRaw,

  CleanParams,
  // Client options
  ClientOptions,
  CompanyBulkEnrichParams,
  CompanyDomain,
  // Company response types
  CompanyEnrichParams,
  CompanyLocation,
  CompanyMatch,
  CompanyMatchesResponse,
  CompanyResponse,
  CompanySocial,
  DataIssueReportResponse,
  DiscoverParams,
  DynamicBulkEnrichItem,
  DynamicBulkEnrichParams,
  DynamicBulkPersonEnrichResponse,
  DynamicBulkPersonResult,
  Education,

  EducationOrganization,
  Email,
  EmailDomainCheck,
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
  ReportIssueLevel,
  ReportIssueType,
  ReportParams,
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
} from './types.js';

// Default export for convenient usage:
//   import DataLegion from 'datalegion';
export default DataLegion;
