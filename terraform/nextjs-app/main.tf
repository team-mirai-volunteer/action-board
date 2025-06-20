# Cloud Run Service Account
resource "google_service_account" "cloud_run" {
  account_id   = "${var.app_name}-${var.environment}-sa-cr"
  display_name = "Service Account for ${var.app_name} ${var.environment} Cloud Run"
}

# Cloud Run サービスアカウントにシークレットアクセス権限を付与
resource "google_secret_manager_secret_iam_member" "supabase_service_role_key_access" {
  secret_id = google_secret_manager_secret.supabase_service_role_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run.email}"
}
resource "google_secret_manager_secret_iam_member" "supabase_access_token_access" {
  secret_id = google_secret_manager_secret.supabase_access_token.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run.email}"
}
resource "google_secret_manager_secret_iam_member" "batch_admin_key_access" {
  secret_id = google_secret_manager_secret.batch_admin_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Cloud Run service
resource "google_cloud_run_v2_service" "default" {
  name     = "${var.app_name}-${var.environment}"
  location = var.region

  # Public access (no IAP)
  ingress = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      ports {
        container_port = 3000 # Next.jsのデフォルトポート
      }
      # Initial dummy image
      image = "gcr.io/cloudrun/hello"

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      env {
        name  = "NEXT_PUBLIC_SUPABASE_URL"
        value = var.NEXT_PUBLIC_SUPABASE_URL
      }

      env {
        name  = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        value = var.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }

      env {
        name  = "NEXT_PUBLIC_SENTRY_DSN"
        value = var.NEXT_PUBLIC_SENTRY_DSN
      }

      env {
        name  = "NEXT_PUBLIC_SENTRY_ENVIRONMENT"
        value = var.environment
      }

      env {
        name  = "NEXT_PUBLIC_GA_ID"
        value = var.NEXT_PUBLIC_GA_ID
      }

      env {
        name  = "NEXT_PUBLIC_APP_ORIGIN"
        value = var.NEXT_PUBLIC_APP_ORIGIN
      }

      env {
        name  = "NEXT_PUBLIC_LINE_CLIENT_ID"
        value = var.NEXT_PUBLIC_LINE_CLIENT_ID
      }

      env {
        name  = "NEXT_PUBLIC_SITE_URL"
        value = var.SUPABASE_SITE_URL
      }

      env {
        name = "SUPABASE_SERVICE_ROLE_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.supabase_service_role_key.id
            version = "latest"
          }
        }
      }
      env {
        name = "SUPABASE_ACCESS_TOKEN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.supabase_access_token.id
            version = "latest"
          }
        }
      }
      env {
        name = "BATCH_ADMIN_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.batch_admin_key.id
            version = "latest"
          }
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
    }

    scaling {
      min_instance_count = var.min_instance_count
      max_instance_count = var.max_instance_count
    }

    service_account = google_service_account.cloud_run.email
  }

  lifecycle {
    ignore_changes = [
      client,
      client_version,
      template[0].containers[0].image,
    ]
  }
}

# Allow unauthenticated access to the Cloud Run service
resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.default.location
  service  = google_cloud_run_v2_service.default.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Grant Secret Manager access to the Cloud Run service account
resource "google_project_iam_member" "secret_manager_access" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Output values
output "service_name" {
  description = "The name of the Cloud Run service"
  value       = "${var.app_name}-${var.environment}"
}

output "service_location" {
  description = "The location of the Cloud Run service"
  value       = var.region
}

output "service_url" {
  description = "The URL of the Cloud Run service"
  value       = google_cloud_run_v2_service.default.uri
}

output "service_account_email" {
  description = "The email of the Cloud Run service account"
  value       = google_service_account.cloud_run.email
}
