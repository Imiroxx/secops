import serverless from 'serverless-http';
import express from 'express';

const app = express();

app.use(express.json({ limit: '10mb' }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth
app.get('/api/user', (req, res) => {
  res.json({ id: 1, username: 'demo', email: 'demo@example.com' });
});

app.post('/api/login', (req, res) => {
  const { username } = req.body;
  res.json({ id: 1, username: username || 'demo', email: (username || 'demo') + '@example.com' });
});

// Detailed scan with comprehensive vulnerability data
app.post('/api/scans', async (req, res) => {
  const { target } = req.body;
  
  const detailedResult = {
    id: Math.floor(Math.random() * 1000),
    target,
    isSafe: false,
    vulnerabilityCount: 5,
    createdAt: new Date().toISOString(),
    scanType: 'general',
    result: {
      summary: 'Обнаружено 5 уязвимостей в анализируемом коде. Критические проблемы требуют немедленного исправления для предотвращения возможных атак.',
      isSafe: false,
      recommendations: [
        'Используйте подготовленные запросы (prepared statements) для всех SQL-запросов',
        'Внедрите Content Security Policy (CSP) для защиты от XSS атак',
        'Обновите все зависимости до последних безопасных версий',
        'Проведите регулярное сканирование безопасности кода',
        'Обучите разработчиков практикам безопасного кодирования'
      ],
      vulnerabilities: [
        {
          type: 'SQL Injection',
          severity: 'critical',
          description: 'Обнаружена уязвимость SQL-инъекции в параметре user_id. Злоумышленник может выполнить произвольные SQL-запросы к базе данных.',
          impact: 'Полный доступ к базе данных, утечка конфиденциальных данных, возможность модификации или удаления данных.',
          evidence: "const query = \"SELECT * FROM users WHERE id = '\" + user_id + \"'\";\n// Пример эксплуатации:\n// user_id = \"' OR '1'='1\"\n// Результат: SELECT * FROM users WHERE id = '' OR '1'='1'",
          remediation: '1. Используйте подготовленные запросы:\nconst query = "SELECT * FROM users WHERE id = ?";\nconnection.execute(query, [user_id]);\n\n2. Используйте ORM с валидацией:\nUser.findOne({ where: { id: user_id } });\n\n3. Никогда не конкатенируйте пользовательский ввод в SQL',
          references: [
            'https://owasp.org/www-community/attacks/SQL_Injection',
            'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html'
          ]
        },
        {
          type: 'Cross-Site Scripting (XSS)',
          severity: 'high',
          description: 'Отсутствует экранирование пользовательского ввода перед выводом на страницу. Возможна вставка вредоносного JavaScript.',
          impact: 'Кража сессионных cookies, выполнение действий от имени пользователя, перенаправление на фишинговые сайты.',
          evidence: "// Уязвимый код:\nelement.innerHTML = userInput;\n\n// Пример атаки:\n// userInput = '<script>alert(document.cookie)</script>'",
          remediation: '1. Используйте textContent вместо innerHTML:\nelement.textContent = userInput;\n\n2. Экранируйте спецсимволы:\nfunction escapeHtml(text) {\n  return text\n    .replace(/&/g, "&amp;")\n    .replace(/</g, "&lt;")\n    .replace(/>/g, "&gt;");\n}\n\n3. Внедрите CSP заголовки:\nContent-Security-Policy: default-src \'self\'',
          references: [
            'https://owasp.org/www-community/attacks/xss/',
            'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html'
          ]
        },
        {
          type: 'Insecure Dependencies',
          severity: 'medium',
          description: 'Обнаружены устаревшие зависимости с известными уязвимостями CVE-2023-XXXX и CVE-2023-YYYY.',
          impact: 'Возможность использования известных эксплойтов для компрометации системы.',
          evidence: 'package.json:\n\"lodash\": \"4.17.15\" // CVE-2021-23337\n\"axios\": \"0.19.0\" // CVE-2021-3749',
          remediation: '1. Обновите зависимости:\nnpm update\n\n2. Используйте npm audit для проверки:\nnpm audit fix\n\n3. Подключите Dependabot для автоматических обновлений',
          references: [
            'https://docs.npmjs.com/cli/v8/commands/npm-audit',
            'https://github.com/dependabot'
          ]
        },
        {
          type: 'Missing Security Headers',
          severity: 'low',
          description: 'Отсутствуют важные HTTP security headers: X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security.',
          impact: 'Возможность clickjacking атак, MIME-sniffing, незащищенное соединение.',
          evidence: 'Ответ сервера не содержит:\nX-Content-Type-Options: nosniff\nX-Frame-Options: DENY\nStrict-Transport-Security: max-age=31536000',
          remediation: 'Добавьте в конфигурацию сервера:\napp.use((req, res, next) => {\n  res.setHeader("X-Content-Type-Options", "nosniff");\n  res.setHeader("X-Frame-Options", "DENY");\n  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");\n  next();\n});',
          references: [
            'https://owasp.org/www-project-secure-headers/',
            'https://securityheaders.com/'
          ]
        },
        {
          type: 'Information Disclosure',
          severity: 'info',
          description: 'В ответах API раскрываются технические детали: версия сервера, используемые технологии.',
          impact: 'Упрощение разведки для злоумышленников, таргетирование известных уязвимостей.',
          evidence: 'HTTP/1.1 200 OK\nX-Powered-By: Express\nServer: nginx/1.18.0',
          remediation: '1. Удалите заголовок X-Powered-By:\napp.disable("x-powered-by");\n\n2. Настройте nginx:\nserver_tokens off;',
          references: [
            'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/',
            'https://cheatsheetseries.owasp.org/cheatsheets/Information_Exposure_Cheat_Sheet.html'
          ]
        }
      ]
    }
  };
  
  res.json(detailedResult);
});

// CVEs mock data
app.get('/api/cves/recent', (req, res) => {
  res.json([
    { id: 'CVE-2024-0001', severity: 'critical', description: 'Test vulnerability 1', published: '2024-01-01' },
    { id: 'CVE-2024-0002', severity: 'high', description: 'Test vulnerability 2', published: '2024-01-02' }
  ]);
});

app.get('/api/cves/stats', (req, res) => {
  res.json({ total: 250000, critical: 20000, high: 37500, medium: 87500, low: 105000 });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

export const handler = serverless(app);
