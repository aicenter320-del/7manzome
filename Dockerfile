FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# هوک گیت (prepare) در این لایه فایل اسکریپت ندارد و نباید اجرا شود.
RUN npm ci --ignore-scripts

FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# بیلد Next در NODE_ENV=production به SESSION_SECRET نیاز دارد؛ مقدار واقعی در runtime می‌آید.
ENV SESSION_SECRET=docker-build-placeholder-session-secret-32ch
# بیلدرهای محدود (مثل HamDocker) سقف ترد پایینی دارند. Next و tokio داخل libsql
# هر کدام به تعداد CPU ترد می‌سازند و با OS error 11 می‌ترکند.
ENV TOKIO_WORKER_THREADS=1
ENV RAYON_NUM_THREADS=1
ENV UV_THREADPOOL_SIZE=4
ENV NEXT_CPU_COUNT=1
ENV NODE_OPTIONS=--max-old-space-size=2048
# پوشه data در .dockerignore است؛ بدون آن libsql هنگام جمع‌آوری صفحات بیلد باز نمی‌شود (SQLITE_CANTOPEN).
RUN mkdir -p data storage backups
# Next 16 پیش‌فرض Turbopack است؛ هوک webpack (سقف ترد) فقط با --webpack اعمال می‌شود.
RUN npm run build -- --webpack

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system haft && useradd --system --gid haft --create-home haft

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/next.config.ts ./next.config.ts

RUN mkdir -p data storage backups && chown -R haft:haft /app
RUN chmod +x scripts/docker-entrypoint.sh

# entrypoint با root شروع می‌کند تا bind mount قابل نوشتن باشد، بعد به haft برمی‌گردد.
USER root
EXPOSE 3000

# مایگریشن و در صورت خالی بودن دیتابیس، دموی کامل بار اول؛ سپس سرو.
ENTRYPOINT ["scripts/docker-entrypoint.sh"]
CMD ["sh", "-c", "npm run db:bootstrap && npm run start"]
