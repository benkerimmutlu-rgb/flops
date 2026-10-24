# IZNANKA

Образовательное приложение по психологии: интерактивная карта знаний, микрообучение, теория, практический блок «В кабинете» и итоговый кейс-тест. Дизайн — по системе **IZNANKA** (тёмная тема, единственный неоновый акцент, Montserrat).

## Стек

- **Next.js 14** (App Router) + **TypeScript** + **React 18**
- **Tailwind CSS** (утилиты) + CSS-переменные дизайн-системы (отличительные компоненты)
- **Supabase** — вход по magic-link и синхронизация прогресса (с fallback в `localStorage`)
- Деплой: **Vercel**

## Архитектура

```
iznanka/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx              # шрифт Montserrat + ProgressProvider
│  │  ├─ globals.css             # токены и компоненты дизайн-системы IZNANKA
│  │  ├─ page.tsx                # «/» — сплэш → карта знаний
│  │  ├─ topic/[topicId]/page.tsx# экран темы (3 уровня через табы)
│  │  ├─ test/[clusterId]/page.tsx# итоговый кейс-тест
│  │  ├─ login/page.tsx          # вход по magic-link / аккаунт
│  │  ├─ auth/callback/route.ts  # обмен кода на сессию
│  │  └─ not-found.tsx
│  ├─ components/                # Map / Topic / Test / Splash / Logo / icons
│  ├─ content/clusters.ts        # ВЕСЬ КОНТЕНТ (данные отделены от UI)
│  ├─ lib/
│  │  ├─ progress.tsx            # контекст прогресса + авторизация (Supabase⇄localStorage)
│  │  └─ supabase/               # браузерный и серверный клиенты
│  ├─ types/content.ts           # контракт контента
│  └─ middleware.ts              # refresh сессии Supabase
└─ supabase/migrations/0001_init.sql  # таблица прогресса + RLS
```

### Масштабирование контента

Контент полностью отделён от интерфейса. Новый кластер или тему добавляют **только** в `src/content/clusters.ts` — UI подхватывает их без изменений. Формат описан типами в `src/types/content.ts`.

### Как хранится прогресс

Один объект на пользователя (тот же формат в `localStorage` и в Supabase JSONB):

```json
{ "status": { "<topicId>": "new|progress|done" }, "testPassed": { "<clusterId>": true } }
```

Без входа прогресс живёт в браузере. После входа — синхронизируется с аккаунтом (при первом входе локальный прогресс подтягивается наверх). Доступ к строкам ограничен политиками RLS.

## Локальный запуск

```bash
npm install
cp .env.local.example .env.local   # заполнить ключами Supabase (или оставить пустым — демо-режим)
npm run dev                        # http://localhost:3000
```

Без ключей Supabase приложение работает в демо-режиме (прогресс только локально). С ключами — включается вход и синхронизация.

Полная инструкция по Supabase и Vercel — в [DEPLOY.md](./DEPLOY.md).
