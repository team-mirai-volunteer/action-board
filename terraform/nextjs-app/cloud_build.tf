# Cloud Build Service Account
resource "google_service_account" "cloud_build" {
  account_id   = "${var.app_name}-${var.environment}-sa-cb"
  display_name = "Service Account for ${var.app_name} ${var.environment} Cloud Build"
}

# Grant Cloud Build roles
resource "google_project_iam_member" "cloudbuild_iam" {
  for_each = toset([
    "roles/run.admin",
    "roles/iam.serviceAccountUser",
    "roles/secretmanager.secretAccessor",
    "roles/secretmanager.secretVersionManager",
    "roles/logging.logWriter",
    "roles/artifactregistry.writer",
  ])
  role   = each.key
  member = "serviceAccount:${google_service_account.cloud_build.email}"

  project = var.project_id
}


# Cloud Build サービスアカウントにシークレットアクセス権限を付与
resource "google_secret_manager_secret_iam_member" "supabase_db_password_accessor" {
  secret_id = google_secret_manager_secret.supabase_db_password.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_build.email}"
}

resource "google_secret_manager_secret_iam_member" "supabase_service_role_key_accessor" {
  secret_id = google_secret_manager_secret.supabase_service_role_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_build.email}"
}

resource "google_secret_manager_secret_iam_member" "supabase_access_token_accessor" {
  secret_id = google_secret_manager_secret.supabase_access_token.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_build.email}"
}

resource "google_secret_manager_secret_iam_member" "supabase_smtp_pass_accessor" {
  secret_id = google_secret_manager_secret.supabase_smtp_pass.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_build.email}"
}

resource "google_secret_manager_secret_iam_member" "sentry_auth_token_accessor" {
  secret_id = google_secret_manager_secret.sentry_auth_token.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_build.email}"
}

resource "google_secret_manager_secret_iam_member" "line_client_secret_accessor" {
  secret_id = google_secret_manager_secret.line_client_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_build.email}"
}

resource "google_secret_manager_secret_iam_member" "hubspot_api_key_accessor" {
  secret_id = google_secret_manager_secret.hubspot_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_build.email}"
}

resource "google_secret_manager_secret_iam_member" "tiktok_client_secret_accessor" {
  secret_id = google_secret_manager_secret.tiktok_client_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_build.email}"
}

resource "google_secret_manager_secret_iam_member" "google_client_secret_accessor" {
  secret_id = google_secret_manager_secret.google_client_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_build.email}"
}

resource "google_secret_manager_secret_iam_member" "youtube_api_key_accessor" {
  secret_id = google_secret_manager_secret.youtube_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_build.email}"
}


# Cloud Build trigger
resource "google_cloudbuild_trigger" "build_and_deploy" {
  name            = "build-and-deploy-${var.app_name}-${var.environment}"
  description     = "Build and deploy ${var.app_name} ${var.environment} to Cloud Run"
  location        = var.region
  service_account = google_service_account.cloud_build.id

  repository_event_config {
    repository = var.github_repository_id
    push {
      branch = var.trigger_branch
    }
  }

  # Trigger on all changes except ignored files
  # included_files is commented out to trigger on all files not in ignored_files
  # included_files = []

  ignored_files = [
    "README.md",
    "LICENSE",
    ".dockerignore",
    ".gitignore",
    ".env",
    ".env.*",
    ".git/**",
    ".github/**",
    "tests/**",
    "playwright.config.ts",
    "reviewrules.toml",
    "terraform/**",
    "stories/**",
    "vitest.config.ts",
    "biome.json",
  ]

  filename = "cloudbuild.yaml"

  substitutions = {
    _REGION                            = var.region
    _SERVICE_NAME                      = "${var.app_name}-${var.environment}"
    _ENVIRONMENT                       = var.environment
    _REPOSITORY_NAME                   = var.repository_name
    _NEXT_PUBLIC_SUPABASE_URL          = var.NEXT_PUBLIC_SUPABASE_URL
    _NEXT_PUBLIC_SUPABASE_ANON_KEY     = var.NEXT_PUBLIC_SUPABASE_ANON_KEY
    _NEXT_PUBLIC_SENTRY_DSN            = var.NEXT_PUBLIC_SENTRY_DSN
    _NEXT_PUBLIC_GA_ID                 = var.NEXT_PUBLIC_GA_ID
    _NEXT_PUBLIC_SENTRY_ENVIRONMENT    = var.environment
    _NEXT_PUBLIC_APP_ORIGIN            = var.NEXT_PUBLIC_APP_ORIGIN
    _NEXT_PUBLIC_LINE_CLIENT_ID        = var.NEXT_PUBLIC_LINE_CLIENT_ID
    _HUBSPOT_CONTACT_LIST_ID           = var.HUBSPOT_CONTACT_LIST_ID
    _SUPABASE_PROJECT_ID               = var.SUPABASE_PROJECT_ID
    _SUPABASE_SMTP_HOST                = var.SUPABASE_SMTP_HOST
    _SUPABASE_SMTP_USER                = var.SUPABASE_SMTP_USER
    _SUPABASE_SMTP_ADMIN_EMAIL         = var.SUPABASE_SMTP_ADMIN_EMAIL
    _SUPABASE_SMTP_SENDER_NAME         = var.SUPABASE_SMTP_SENDER_NAME
    _SUPABASE_SITE_URL                 = var.SUPABASE_SITE_URL
    _SUPABASE_ADDITIONAL_REDIRECT_URLS = "${var.SUPABASE_SITE_URL}/auth/callback/"
    _NEXT_PUBLIC_TIKTOK_CLIENT_KEY     = var.NEXT_PUBLIC_TIKTOK_CLIENT_KEY
    _NEXT_PUBLIC_GOOGLE_CLIENT_ID      = var.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  }
}
