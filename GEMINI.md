# GEMINI.md

## Project Overview

This is a full-stack application called "Action Board" (アクションボード). It's built with Next.js for the web application and Flutter for the mobile application. The backend is powered by Supabase, which provides the database, authentication, and other backend services. The project is well-structured and includes a comprehensive set of tools for development, testing, and deployment.

The web application uses a variety of modern technologies, including:

*   **Framework:** Next.js (with App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui, Radix UI
*   **Testing:** Jest (unit), Playwright (E2E), RLS tests for Supabase
*   **Linting/Formatting:** Biome
*   **Error Tracking:** Sentry

The project also includes a Flutter application in the `mobile_flutter` directory, though the primary focus of the provided files is the web application.

## Building and Running

### Prerequisites

*   Node.js
*   Docker
*   Supabase CLI

### Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Create a `.env.local` file:**
    ```bash
    cp .env.example .env.local
    ```
    Update the values in `.env.local` with your Supabase credentials.

3.  **Start the Supabase local development environment:**
    ```bash
    supabase start
    ```

4.  **Initialize the local database:**
    ```bash
    supabase db reset
    ```

5.  **Synchronize mission data:**
    ```bash
    npm run mission:sync
    ```

### Running the application

*   **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

*   **Build for production:**
    ```bash
    npm run build
    ```

*   **Start the production server:**
    ```bash
    npm run start
    ```

### Running tests

*   **Run all tests:**
    ```bash
    npm run test
    ```

*   **Run unit tests:**
    ```bash
    npm run test:unit
    ```

*   **Run E2E tests:**
    ```bash
    npm run test:e2e
    ```

*   **Run RLS tests:**
    ```bash
    npm run test:supabase
    ```

## Development Conventions

*   **Branching:** Features are developed in `feat/xxx` branches off of `develop`. `develop` is merged into `main` for releases.
*   **Commits:** Conventional Commits are likely used, though not explicitly stated.
*   **Pull Requests:** PRs are made from forks to the main repository.
*   **Database Migrations:** Supabase migrations are used to manage database schema changes. New migrations can be created with `supabase migration new {name}`.
*   **Type Generation:** After a migration, new TypeScript types should be generated with `npx supabase gen types typescript --local > lib/types/supabase.ts`.
*   **Code Style:** Biome is used for linting and formatting. Run `npm run biome:check:write` to check and fix code style issues.
