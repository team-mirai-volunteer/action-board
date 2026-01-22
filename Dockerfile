FROM node:22-slim@sha256:a4b757cd491c7f0b57f57951f35f4e85b7e1ad54dbffca4cf9af0725e1650cd8 AS builder

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_SENTRY_ENVIRONMENT
ARG NEXT_PUBLIC_LINE_CLIENT_ID
ARG SENTRY_RELEASE
ARG SENTRY_AUTH_TOKEN
ARG SUPABASE_SERVICE_ROLE_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID}
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}
ENV NEXT_PUBLIC_SENTRY_ENVIRONMENT=${NEXT_PUBLIC_SENTRY_ENVIRONMENT}
ENV NEXT_PUBLIC_LINE_CLIENT_ID=${NEXT_PUBLIC_LINE_CLIENT_ID}
ENV SENTRY_RELEASE=${SENTRY_RELEASE}
ENV STANDALONE_BUILD=true
ENV UPLOAD_SOURCEMAPS=true

WORKDIR /app

# CA certificates are required for HTTPS requests (Sentry)
RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

# Install pnpm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN} \
    SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY} \
    pnpm run build

FROM node:22-slim@sha256:a4b757cd491c7f0b57f57951f35f4e85b7e1ad54dbffca4cf9af0725e1650cd8 AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
