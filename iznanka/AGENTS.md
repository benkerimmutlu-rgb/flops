# IZNANKA — заметки для агентов (Claude / Codex)

Образовательное приложение по психологии для специалистов. Живёт как **статическая зона `/iznanka`** внутри портала VivaLearn (этот же репозиторий, папка `portal/`).

## Стек
Next.js 14 (App Router) + TypeScript + Tailwind + Supabase (вход по **коду из письма** (email OTP) + имя, и синхронизация прогресса — **на клиенте**). Сборка — **статический экспорт** (`output: "export"`, `basePath: "/iznanka"`).

## Как собрать и выложить
Исходники — в этой папке (`iznanka/`). Готовая статика кладётся в `portal/public/iznanka/`, портал отдаёт её по пути `/iznanka`.

```bash
cd iznanka
# нужен .env.local с NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run build                      # создаёт iznanka/out/
rsync -a --delete out/ ../portal/public/iznanka/
# затем закоммитить и запушить — Vercel пересоберёт портал
```

> `out/` и `node_modules` в git не коммитятся (gitignore). Коммитится результат в `portal/public/iznanka/`.

## Структура
- `src/content/clusters.ts` — ВЕСЬ учебный контент (кластеры, темы, тесты, симуляции). Масштабирование = добавить данные.
- `src/content/safety.ts` — модуль «Оценка риска и кризис».
- `src/types/content.ts` — контракт контента.
- `src/components/` — экраны (Hub, Map, Topic, Test, Sim, Review, Safety, Profile).
- `src/lib/progress.tsx` — прогресс + авторизация (Supabase ⇄ localStorage), SRS-повторение.
- `src/lib/supabase/client.ts` — клиент Supabase (singleton, клиентский вход).
- Вход: `requestCode` (отправить код) → `verifyCode(email, token, name)` в `progress.tsx`. Redirect-URL не используется.

## Маршруты
`/` (хаб) · `/cluster/[id]` · `/topic/[id]` · `/test/[id]` · `/sim/[id]` · `/safety` · `/review` · `/profile`. Динамические пути пре-генерируются (`generateStaticParams`) — при добавлении кластера/темы они попадут в сборку автоматически.

## ВАЖНО про контент
Весь клинический контент — **доказательно-ориентированный ЧЕРНОВИК**, требует вычитки лицензированным специалистом. Кризисные контакты в `safety.ts` — плейсхолдер, заменить проверёнными телефонами региона.

## Supabase
Проект `tyozpriulilijwvytewc` (бесплатный тариф). Чтобы не засыпал, в корне репозитория есть workflow `.github/workflows/supabase-keepalive.yml` (пинг раз в 3 дня).
Вход — по коду (email OTP): в Supabase → Authentication → Email Templates → «Magic Link» шаблон должен содержать `{{ .Token }}` (код), а не только ссылку. Redirect URL для входа по коду не нужен.
