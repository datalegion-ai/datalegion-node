// ---------------------------------------------------------------------------
// Shared / Nested Types
// ---------------------------------------------------------------------------

/** Generic `{cleaned, raw[]}` structure used for titles, degrees, headlines, etc. */
export interface CleanedRaw {
  cleaned: string | null;
  raw: string[];
}

/** Phone number entry. */
export interface Phone {
  type: string | null;
  number: string | null;
  current: boolean | null;
  confidence: string | null;
  last_seen: string | null;
  num_sources: number | null;
}

/** Email entry. */
export interface Email {
  address: string | null;
  type: string | null;
  current: boolean | null;
  validated: boolean | null;
  confidence: string | null;
  last_seen: string | null;
  num_sources: number | null;
  validation_status: string | null;
  hash_sha256: string | null;
  hash_sha1: string | null;
  hash_md5: string | null;
}

/** Location entry. */
export interface Location {
  street_address: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  state_code: string | null;
  country: string | null;
  country_code: string | null;
  continent: string | null;
  continent_code: string | null;
  postal_code: string | null;
  postal_code_4: string | null;
  geo: string | null;
  raw: string[];
  current: boolean | null;
  num_sources: number | null;
  confidence: string | null;
  last_seen: string | null;
}

/** Organization within an experience entry. */
export interface ExperienceOrganization {
  legion_id: string | null;
  name: CleanedRaw | null;
  website: string | null;
  linkedin_url: string | null;
  linkedin_id: string | null;
  industry: string | null;
  size: string | null;
}

/** Experience entry. */
export interface Experience {
  title: CleanedRaw | null;
  seniority_level: string | null;
  job_function: string | null;
  expense_category: string | null;
  is_decision_maker: boolean | null;
  is_platform_worker: boolean | null;
  organization: ExperienceOrganization | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean | null;
  tenure_months: number | null;
  description: CleanedRaw | null;
}

/** Organization within an education entry. */
export interface EducationOrganization {
  name: CleanedRaw | null;
  website: string | null;
  linkedin_url: string | null;
}

/** Education entry. */
export interface Education {
  organization: EducationOrganization | null;
  degree: CleanedRaw | null;
  degree_level: string | null;
  field_of_study: CleanedRaw | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean | null;
}

/** Social profile entry. */
export interface Social {
  network: string | null;
  url: string | null;
  username: string | null;
  id: string | null;
  current: boolean | null;
  num_sources: number | null;
  confidence: string | null;
  last_seen: string | null;
}

/** Skill entry. */
export interface Skill {
  cleaned: string | null;
  raw: string[];
}

/** Language entry. */
export interface Language {
  cleaned: string | null;
  raw: string[];
  proficiency: string | null;
}

// ---------------------------------------------------------------------------
// Person Response
// ---------------------------------------------------------------------------

/** Complete person enrichment response. */
export interface PersonResponse {
  legion_id: string;
  full_name: string | null;
  first_name: string | null;
  middle_name: string | null;
  middle_initial: string | null;
  last_name: string | null;
  last_initial: string | null;
  suffix: string | null;
  prefix: string | null;
  sex: string | null;
  birth_date: string | null;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  age: number | null;

  // Contact Info
  work_email: string | null;
  mobile_phone: string | null;
  linkedin_url: string | null;
  linkedin_id: string | null;

  // Location
  city: string | null;
  state: string | null;
  state_code: string | null;
  country: string | null;
  country_code: string | null;

  // Professional
  job_title: string | null;
  company_legion_id: string | null;
  company_name: string | null;
  company_domain: string | null;
  company_linkedin_url: string | null;
  company_linkedin_id: string | null;
  company_industry: string | null;
  company_size: string | null;
  seniority_level: string | null;
  job_function: string | null;
  expense_category: string | null;
  is_decision_maker: boolean | null;
  is_platform_worker: boolean | null;
  years_of_experience: number | null;
  avg_tenure_months: number | null;
  highest_degree_level: string | null;

  // LinkedIn
  linkedin_followers: number | null;
  linkedin_connections: number | null;

  // Narrative
  headline: CleanedRaw | null;
  summary: CleanedRaw | null;

  // Metadata
  num_sources: number | null;
  current_jobs_last_updated: string | null;
  current_jobs_last_confirmed: string | null;
  current_location_last_updated: string | null;
  current_location_last_confirmed: string | null;
  last_seen: string | null;
  build_version: string | null;

  // Related Data
  phones: Phone[];
  emails: Email[];
  locations: Location[];
  experience: Experience[];
  education: Education[];
  socials: Social[];
  skills: Skill[];
  languages: Language[];
}

// ---------------------------------------------------------------------------
// Company Response
// ---------------------------------------------------------------------------

/** Ticker entry. */
export interface Ticker {
  symbol: string | null;
  exchange: string | null;
}

/** Company social profile entry. */
export interface CompanySocial {
  network: string | null;
  url: string | null;
  username: string | null;
  id: string | null;
}

/** Company domain entry. */
export interface CompanyDomain {
  domain: string | null;
}

/** Monthly employee count data point. */
export interface EmployeeCountByMonth {
  month: string | null;
  count: number | null;
  net_change: number | null;
  growth_rate: number | null;
  hires: number | null;
  departures: number | null;
}

/** Time-bucketed integer metric (new hires, attrition). */
export interface TimeBucketInt {
  '1m': number | null;
  '3m': number | null;
  '6m': number | null;
  '12m': number | null;
}

/** Time-bucketed float metric (growth rate, turnover rate). */
export interface TimeBucketFloat {
  '1m': number | null;
  '3m': number | null;
  '6m': number | null;
  '12m': number | null;
}

/** Complete company enrichment response. */
export interface CompanyResponse {
  legion_id: string;

  // Base fields
  name: CleanedRaw | null;
  headline: CleanedRaw | null;
  description: CleanedRaw | null;
  domain: string | null;
  linkedin_url: string | null;
  linkedin_id: string | null;
  linkedin_followers: number | null;
  linkedin_employee_count: number | null;
  industry: string | null;
  type: string | null;
  size: string | null;
  founded: number | null;

  // Legion workforce analytics
  legion_employee_count: number | null;
  legion_average_tenure: number | null;

  // Time-bucketed metrics
  legion_new_hire_count: TimeBucketInt | null;
  legion_attrition_count: TimeBucketInt | null;
  legion_turnover_rate: TimeBucketFloat | null;
  legion_employee_growth_rate: TimeBucketFloat | null;

  // Distribution maps
  legion_seniority_distribution: Record<string, number> | null;
  legion_job_function_distribution: Record<string, number> | null;
  legion_expense_category_distribution: Record<string, number> | null;
  legion_tenure_distribution: Record<string, number> | null;
  legion_education_distribution: Record<string, number> | null;

  // Growth rate maps
  legion_seniority_growth_rate: Record<string, TimeBucketFloat> | null;
  legion_job_function_growth_rate: Record<string, TimeBucketFloat> | null;
  legion_expense_category_growth_rate: Record<string, TimeBucketFloat> | null;

  // Array fields
  tickers: Ticker[];
  socials: CompanySocial[];
  domains: CompanyDomain[];
  legion_employee_count_by_month: EmployeeCountByMonth[];

  // Metadata
  num_sources: number | null;
  last_seen: string | null;
  build_version: string | null;
}

// ---------------------------------------------------------------------------
// Match & Search Response Wrappers
// ---------------------------------------------------------------------------

/** Metadata about how a match was found. */
export interface MatchMetadata {
  matched_on: string[];
  match_type: string;
  match_confidence: string;
}

/** A single person match with optional match metadata. */
export interface PersonMatch {
  person: PersonResponse;
  match_metadata?: MatchMetadata;
}

/** Response wrapper for multiple person matches (enrich with `multiple_results`, search, discover). */
export interface PersonMatchesResponse {
  matches: PersonMatch[];
  total: number;
}

/** A single result from a bulk person enrichment request. */
export interface BulkPersonItemResult {
  matches?: PersonMatch[] | null;
  total?: number | null;
  error?: string | null;
  metadata?: Record<string, string | number | boolean> | null;
}

/** Response from a bulk person enrichment request. */
export interface BulkPersonEnrichResponse {
  results: BulkPersonItemResult[];
}

/** A single company match with optional match metadata. */
export interface CompanyMatch {
  company: CompanyResponse;
  match_metadata?: MatchMetadata;
}

/** Response wrapper for multiple company matches. */
export interface CompanyMatchesResponse {
  matches: CompanyMatch[];
  total: number;
}

/** A single result from a bulk company enrichment request. */
export interface BulkCompanyItemResult {
  matches?: CompanyMatch[] | null;
  total?: number | null;
  error?: string | null;
  metadata?: Record<string, string | number | boolean> | null;
}

/** Response from a bulk company enrichment request. */
export interface BulkCompanyEnrichResponse {
  results: BulkCompanyItemResult[];
}

// ---------------------------------------------------------------------------
// Utility Response Types
// ---------------------------------------------------------------------------

/** Result for a single cleaned field. */
export interface FieldCleanResult {
  original: string;
  cleaned: string | Record<string, string> | null;
  normalized: boolean;
}

/** Response from the `/utility/clean` endpoint. */
export interface FieldCleanResponse {
  results: Record<string, FieldCleanResult>;
}

/** Response from the `/utility/hash/email` endpoint. */
export interface EmailHashResponse {
  email: string;
  normalized_email: string;
  hashes: Record<string, string>;
}

/** A single validation error detail. */
export interface ValidationErrorDetail {
  field: string;
  value?: string | null;
  error: string;
  suggestion?: string | null;
}

/** A single validation warning. */
export interface ValidationWarning {
  field: string;
  value?: string | null;
  warning: string;
  suggestion?: string | null;
}

/** A single validation suggestion. */
export interface ValidationSuggestion {
  field: string;
  cleaned?: string | Record<string, string> | null;
}

/** Response from the `/utility/validate` endpoint. */
export interface ValidationResponse {
  valid: boolean;
  errors: ValidationErrorDetail[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

// ---------------------------------------------------------------------------
// Error Response
// ---------------------------------------------------------------------------

/** Error body returned by the API. */
export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown> | unknown[] | null;
}

// ---------------------------------------------------------------------------
// Health Response
// ---------------------------------------------------------------------------

/** Response from the `/health` endpoint. */
export interface HealthResponse {
  status: string;
  database: string;
}

// ---------------------------------------------------------------------------
// Request Parameter Types
// ---------------------------------------------------------------------------

/** Shared response-option fields used across enrich endpoints. */
interface EnrichResponseOptions {
  /** If true, return multiple matches sorted by confidence. */
  multiple_results?: boolean;
  /** Maximum number of results when `multiple_results` is true (1-10, default 2). */
  limit?: number;
  /** Minimum match confidence level: `'high'`, `'moderate'`, or `'low'`. */
  min_confidence?: string;
  /** If true, format text fields in title case. */
  titlecase?: boolean;
  /** Comma-separated list of fields that must be present in response. */
  required_fields?: string;
  /** Comma-separated list of fields to include in response. */
  include_fields?: string;
  /** Comma-separated list of fields to exclude from response. */
  exclude_fields?: string;
  /** If true, pretty-print JSON response. */
  pretty_print?: boolean;
}

/** Shared response-option fields for search and discover endpoints. */
interface SearchResponseOptions {
  /** If true, format text fields in title case. */
  titlecase?: boolean;
  /** Comma-separated list of fields to include in response. */
  include_fields?: string;
  /** Comma-separated list of fields to exclude from response. */
  exclude_fields?: string;
  /** If true, pretty-print JSON response. */
  pretty_print?: boolean;
}

/** Parameters for `client.person.enrich()`. */
export interface PersonEnrichParams extends EnrichResponseOptions {
  // Primary identifiers
  email?: string;
  email_hash?: string;
  phone?: string;
  linkedin_id?: string;
  social_url?: string;
  legion_id?: string;

  // Name
  full_name?: string;
  first_name?: string;
  last_name?: string;

  // Location
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;

  // Professional
  job_title?: string;
  company?: string;
  school?: string;

  // Demographics
  birth_date?: string;
}

/** Parameters for `client.company.enrich()`. */
export interface CompanyEnrichParams extends EnrichResponseOptions {
  legion_id?: string;
  domain?: string;
  name?: string;
  linkedin_id?: string;
  social_url?: string;
  ticker_symbol?: string;
  industry?: string;
}

/** Parameters for `client.person.search()` and `client.company.search()`. */
export interface SearchParams extends SearchResponseOptions {
  /** SQL query to execute. */
  query: string;
  /** Maximum number of results (1-100). */
  limit: number;
}

/** Parameters for `client.person.discover()` and `client.company.discover()`. */
export interface DiscoverParams extends SearchResponseOptions {
  /** Natural language search query. */
  query: string;
  /** Maximum number of results (1-100). */
  limit: number;
}

/** Shared top-level defaults for bulk enrichment requests. */
interface BulkEnrichDefaults {
  /** If true, return multiple matches sorted by confidence. */
  multiple_results?: boolean;
  /** Maximum number of results when `multiple_results` is true (1-10, default 2). */
  limit?: number;
  /** Minimum match confidence level: `'high'`, `'moderate'`, or `'low'`. */
  min_confidence?: string;
  /** If true, format text fields in title case. */
  titlecase?: boolean;
  /** Comma-separated list of fields that must be present in response. */
  required_fields?: string;
  /** Comma-separated list of fields to include in response. */
  include_fields?: string;
  /** Comma-separated list of fields to exclude from response. */
  exclude_fields?: string;
  /** If true, pretty-print JSON response. */
  pretty_print?: boolean;
}

/** Parameters for `client.person.bulkEnrich()`. */
export interface PersonBulkEnrichParams extends BulkEnrichDefaults {
  /** List of enrichment items (1-100). Each item has identifier fields plus optional `metadata`. */
  items: Record<string, unknown>[];
}

/** Parameters for `client.company.bulkEnrich()`. */
export interface CompanyBulkEnrichParams extends BulkEnrichDefaults {
  /** List of enrichment items (1-100). Each item has identifier fields plus optional `metadata`. */
  items: Record<string, unknown>[];
}

/** Parameters for `client.utility.clean()`. */
export interface CleanParams {
  /** Map of field names to values to clean. */
  fields: Record<string, string>;
  /** Default region for phone normalization (ISO 3166-1 alpha-2). */
  default_region?: string;
}

/** Parameters for `client.utility.hashEmail()`. */
export interface HashEmailParams {
  /** Email address to hash. */
  email: string;
}

/** Parameters for `client.utility.validate()`. */
export interface ValidateParams {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  social_url?: string;
  address?: string;
  state?: string;
  country?: string;
  company?: string;
  school?: string;
  birth_date?: string;
  domain?: string;
  ticker_symbol?: string;
  linkedin_company_url?: string;
}

// ---------------------------------------------------------------------------
// Client Options
// ---------------------------------------------------------------------------

/** Options for constructing a `DataLegion` client. */
export interface ClientOptions {
  /** API key (e.g. `'legion_live_...'`). Falls back to `DATALEGION_API_KEY` env var. */
  apiKey?: string;
  /** Base URL for the API. Defaults to `'https://api.datalegion.ai'`. */
  baseURL?: string;
  /** Default timeout in milliseconds. Defaults to `60000` (60 s). */
  timeout?: number;
  /** Default headers to include with every request. */
  defaultHeaders?: Record<string, string>;
}
