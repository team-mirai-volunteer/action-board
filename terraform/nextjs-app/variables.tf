variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for deploying resources"
  type        = string
}

variable "app_name" {
  description = "The name of the application"
  type        = string
}

variable "min_instance_count" {
  description = "Minimum number of Cloud Run instances"
  type        = number
  default     = 0
}

variable "max_instance_count" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = 2
}

variable "github_repository_id" {
  description = "GitHub repository ID"
  type        = string
}

variable "repository_name" {
  description = "Artifact Registry repository name"
  type        = string
}

variable "use_inline_build" {
  description = "Whether to use inline build steps instead of cloudbuild.yaml"
  type        = bool
  default     = false
}

variable "trigger_branch" {
  description = "Git branch pattern to trigger the build"
  type        = string
}

variable "environment" {
  description = "Environment name (staging, production, etc.)"
  type        = string
  default     = "dev"
}

variable "NEXT_PUBLIC_SUPABASE_URL" {
  description = "Supabase URL (public)"
  type        = string
}

variable "NEXT_PUBLIC_SUPABASE_ANON_KEY" {
  description = "Supabase Anonymous Key (public)"
  type        = string
}

variable "NEXT_PUBLIC_SENTRY_DSN" {
  description = "Sentry DSN for error tracking (public)"
  type        = string
}

variable "NEXT_PUBLIC_GA_ID" {
  description = "Google Analytics ID (public)"
  type        = string
}

variable "NEXT_PUBLIC_APP_ORIGIN" {
  description = "Application origin URL for referral missions (public)"
  type        = string
}

variable "NEXT_PUBLIC_LINE_CLIENT_ID" {
  description = "LINE Client ID for LINE Login (public)"
  type        = string
}

variable "LINE_CLIENT_SECRET" {
  description = "LINE Client Secret for LINE Login (sensitive)"
  type        = string
  sensitive   = true
}

variable "HUBSPOT_CONTACT_LIST_ID" {
  description = "HubSpot Contact List ID for referral missions (public)"
  type        = string
}

variable "HUBSPOT_API_KEY" {
  description = "HubSpot API Key for accessing HubSpot APIs (sensitive)"
  type        = string
  sensitive   = true
}

variable "SUPABASE_SERVICE_ROLE_KEY" {
  description = "Supabase Service Role Key (sensitive)"
  type        = string
  sensitive   = true
}

variable "SUPABASE_DB_PASSWORD" {
  description = "Supabase Service Role Key (sensitive)"
  type        = string
  sensitive   = true
}

variable "SUPABASE_ACCESS_TOKEN" {
  description = "Supabase Access Token (sensitive)"
  type        = string
  sensitive   = true
}

variable "SUPABASE_PROJECT_ID" {
  description = "Supabase Project ID"
  type        = string
}

variable "SUPABASE_SMTP_HOST" {
  description = "Supabase SMTP Host"
  type        = string
}

variable "SUPABASE_SMTP_USER" {
  description = "Supabase SMTP User"
  type        = string
}

variable "SUPABASE_SMTP_PASS" {
  description = "Supabase SMTP Password"
  type        = string
  sensitive   = true
}

variable "SUPABASE_SMTP_ADMIN_EMAIL" {
  description = "Supabase SMTP Admin Email"
  type        = string
}

variable "SUPABASE_SMTP_SENDER_NAME" {
  description = "Supabase SMTP Sender Name"
  type        = string
}

variable "SUPABASE_SITE_URL" {
  description = "Supabase Site URL"
  type        = string
}

variable "BQ_USER_PASSWORD" {
  description = "BigQuery User Password (sensitive)"
  type        = string
  sensitive   = true
}

variable "SENTRY_AUTH_TOKEN" {
  description = "Sentry Auth Token (sensitive)"
  type        = string
  sensitive   = true
}

variable "BATCH_ADMIN_KEY" {
  description = "Batch Admin Key for API authentication (sensitive)"
  type        = string
  sensitive   = true
}
