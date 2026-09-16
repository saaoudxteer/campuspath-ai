FROM node:24-bookworm-slim AS web
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV API_INTERNAL_URL=http://127.0.0.1:8000
RUN npm run build

FROM python:3.12-slim-bookworm AS runtime
WORKDIR /app
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    CAMPUSPATH_PYTHON=python \
    CAMPUSPATH_WEB_ENTRY=/app/server.js \
    SESSION_COOKIE_SECURE=true \
    PORT=10000
COPY --from=web /usr/local/bin/node /usr/local/bin/node
RUN apt-get update && apt-get install -y --no-install-recommends libstdc++6 tini \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 campuspath
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt
COPY --from=web --chown=campuspath:campuspath /app/.next/standalone ./
COPY --from=web --chown=campuspath:campuspath /app/.next/static ./.next/static
COPY --from=web --chown=campuspath:campuspath /app/public ./public
COPY --chown=campuspath:campuspath backend/app ./backend/app
COPY --chown=campuspath:campuspath scripts/start-hosted.mjs ./scripts/start-hosted.mjs
RUN mkdir -p /app/backend/data && chown -R campuspath:campuspath /app/backend/data
USER campuspath
EXPOSE 10000
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "scripts/start-hosted.mjs"]
