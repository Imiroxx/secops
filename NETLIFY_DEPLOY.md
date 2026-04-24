# Развертывание SecOps Global на Netlify

## Подготовка

1. Установите Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Авторизуйтесь:
```bash
netlify login
```

## Деплой

### Вариант 1: Через CLI

```bash
# В корне проекта
netlify deploy --prod --dir=dist/public
```

### Вариант 2: Через Git (рекомендуется)

1. Создайте репозиторий на GitHub
2. Запушьте код (без .env файла!)
3. Подключите репозиторий в Netlify Dashboard
4. Настройки сборки:
   - Build command: `npm run build:client`
   - Publish directory: `dist/public`

## Настройка окружения

В Netlify Dashboard добавьте переменные окружения:
- `NODE_ENV=production`
- `SESSION_SECRET=<случайная строка>`
- `OPENAI_API_KEY=<ваш ключ>` (опционально)

## Функции API

Netlify Functions находятся в `netlify/functions/api.mjs`

API endpoints:
- `GET /api/health` - проверка статуса
- `POST /api/scans` - создание сканирования
- `GET /api/scans` - список сканирований
- `GET /api/stats` - статистика
- `GET /api/cves/recent` - последние CVE
- `POST /api/qr/generate` - генерация QR сессии

## Проблемы

### 404 на API endpoints
Убедитесь что `netlify.toml` настроен правильно:
```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

### CORS ошибки
Включены в `netlify/functions/api.mjs`:
```javascript
res.header('Access-Control-Allow-Origin', '*');
```

### База данных
На Netlify используется in-memory storage (PostgreSQL не требуется).
