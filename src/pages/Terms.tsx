import React from "react";
import { Layout } from "../components/Layout";
import { useLanguage } from "../lib/i18n";
import { motion } from "framer-motion";
import { 
  FileText,
  Scale,
  Shield,
  AlertTriangle,
  Gavel,
  UserCheck,
  Lock,
  CreditCard,
  Ban,
  HelpCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Mail,
  ChevronRight,
  Globe,
  Terminal,
  Bug,
  Server,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function Terms() {
  const { t } = useLanguage();
  const lastUpdated = "9 февраля 2026 года";

  const sections = [
    {
      id: "acceptance",
      icon: <FileText className="w-6 h-6" />,
      title: "1. Принятие условий",
      content: `Настоящие Условия использования ("Условия") представляют собой юридическое соглашение между вами и SecOps Global ("Компания", "мы", "нас"). Используя наш сервис, вы подтверждаете, что:

• Вам исполнилось 18 лет или вы имеете согласие родителей/опекунов
• Вы обладаете правоспособностью заключать обязательные соглашения
• Вы прочитали, поняли и согласны соблюдать настоящие Условия
• Ваша регистрационная информация является точной и актуальной

Если вы не согласны с этими условиями, пожалуйста, не используйте наш сервис.`
    },
    {
      id: "definitions",
      icon: <Scale className="w-6 h-6" />,
      title: "2. Определения",
      content: `В настоящих Условиях используются следующие термины:

• "Сервис" или "Платформа" — веб-сайт и API SecOps Global
• "Пользователь" или "Вы" — физическое или юридическое лицо, использующее Сервис
• "Аккаунт" — учетная запись пользователя в системе
• "Сканирование" — процесс анализа безопасности целевого объекта
• "Уязвимость" — выявленный недостаток безопасности
• "Контент" — данные, загружаемые или сканируемые пользователем
• "Сторонний сервис" — внешние API, включая OpenAI и NVD`
    },
    {
      id: "account",
      icon: <UserCheck className="w-6 h-6" />,
      title: "3. Регистрация и аккаунт",
      content: `При создании аккаунта вы обязуетесь:

• Предоставлять точную и полную информацию
• Поддерживать актуальность данных аккаунта
• Не создавать более одного аккаунта без разрешения
• Не передавать доступ к аккаунту третьим лицам
• Немедленно сообщать о несанкционированном доступе
• Отвечать за все действия, совершенные под вашим аккаунтом

Мы оставляем за собой право:
• Приостановить или удалить аккаунт за нарушение условий
• Требовать верификацию личности
• Установить лимиты на использование сервиса`
    },
    {
      id: "acceptable-use",
      icon: <CheckCircle className="w-6 h-6" />,
      title: "4. Допустимое использование",
      content: `Вы можете использовать Сервис исключительно для:

• Сканирования систем, которыми вы владеете или управляете
• Сканирования систем с явного письменного разрешения владельца
• Образовательных и исследовательских целей в рамках закона
• Тестирования безопасности собственных приложений
• Поиска уязвимостей в рамках bug bounty программ (с разрешения)

Требования к сканированию:
• Наличие верификации владения сайтом (для веб-сканирования)
• Соблюдение rate limits (не более 100 сканирований в час)
• Уведомление владельцев перед сканированием (когда применимо)`
    },
    {
      id: "prohibited",
      icon: <Ban className="w-6 h-6" />,
      title: "5. Запрещенные действия",
      content: `СТРОГО ЗАПРЕЩЕНО:

• Сканирование систем без разрешения владельца
• Попытки обойти механизмы безопасности Сервиса
• Использование Сервиса для кибератак или вредоносных действий
• Распространение найденных уязвимостей с целью шантажа
• Автоматизированный сбор данных других пользователей
• Создание множественных аккаунтов для обхода лимитов
• Передача учетных данных третьим лицам
• Использование Сервиса для незаконной деятельности
• Reverse engineering или декомпиляция Сервиса
• Использование Сервиса для DDoS-атак или флуда

Нарушение может привести к:
• Немедленной блокировке аккаунта
• Сохранению логов для правоохранительных органов
• Гражданской или уголовной ответственности`
    },
    {
      id: "security-testing",
      icon: <Shield className="w-6 h-6" />,
      title: "6. Правила тестирования безопасности",
      content: `При проведении сканирований безопасности:

Обязательно:
• Иметь письменное разрешение на тестирование
• Уведомлять о критических уязвимостях ответственно
• Давать разумное время на исправление уязвимостей
• Уничтожать все данные, полученные во время тестирования
• Соблюдать принцип наименьшего вреда

Запрещено:
• Эксплуатация найденных уязвимостей
• Уничтожение или повреждение данных
• Нарушение работоспособности систем
• Раскрытие информации третьим лицам
• Требование вознаграждения под угрозой разглашения

Мы сотрудничаем с правоохранительными органами и будем передавать информацию о незаконной активности.`
    },
    {
      id: "intellectual-property",
      icon: <Lock className="w-6 h-6" />,
      title: "7. Интеллектуальная собственность",
      content: `Права на Сервис:
• SecOps Global владеет всеми правами на платформу
• Запрещено копирование, модификация или распространение кода
• Торговые марки и логотипы являются собственностью Компании

Ваш контент:
• Вы сохраняете права на данные, загруженные для сканирования
• Мы не используем ваш код для коммерческих целей
• Вы предоставляете нам лицензию на обработку данных для целей сканирования
• Результаты сканирования остаются вашей собственностью

Open Source:
• Некоторые компоненты могут распространяться под лицензиями OSS
• Соблюдение лицензий стороннего ПО обязательно`
    },
    {
      id: "payment",
      icon: <CreditCard className="w-6 h-6" />,
      title: "8. Оплата и подписки",
      content: `Текущая модель:
• Базовый функционал предоставляется бесплатно
• Премиум-функции могут быть введены в будущем
• Цены будут опубликованы заранее

Общие условия:
• Все платежи обрабатываются через безежные процессоры
• Возврат средств рассматривается индивидуально
• Подписки автоматически продлеваются unless отменены
• Мы оставляем право изменять цены с уведомлением за 30 дней`
    },
    {
      id: "limitation",
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "9. Ограничение ответственности",
      content: `Сервис предоставляется "как есть" без гарантий:

Мы не гарантируем:
• Обнаружение всех уязвимостей
• Отсутствие ложных срабатываний
• Бесперебойную работу сервиса
• Подходимость для конкретных целей
• Своевременность уведомлений об угрозах

Ответственность ограничена:
• Максимальная ответственность — сумма оплаченных услуг за 12 месяцев
• Мы не отвечаем за косвенные, случайные или штрафные убытки
• Мы не отвечаем за ущерб, вызванный использованием результатов сканирования
• Вы используете сервис на свой страх и риск

В некоторых юрисдикциях ограничения могут не применяться.`
    },
    {
      id: "indemnification",
      icon: <Gavel className="w-6 h-6" />,
      title: "10. Возмещение убытков",
      content: `Вы соглашаетесь возместить убытки Компании и ее аффилированным лицам от:

• Нарушения вами настоящих Условий
• Незаконного использования Сервиса
• Нарушения прав третьих лиц
• Предоставления ложной информации
• Распространения вредоносного кода или результатов сканирования
• Попыток обхода технических ограничений

Возмещение включает:
• Юридические издержки и расходы
• Штрафы и санкции
• Расходы на разрешение споров
• Другие прямые и косвенные убытки`
    },
    {
      id: "termination",
      icon: <XCircle className="w-6 h-6" />,
      title: "11. Прекращение действия",
      content: `Вы можете прекратить использование:
• Удалить аккаунт в настройках профиля
• Прекратить доступ к Сервису в любое время

Мы можем прекратить доступ:
• При нарушении настоящих Условий
• По запросу правоохранительных органов
• При обнаружении мошеннической активности
• По техническим или юридическим причинам
• С уведомлением за 30 дней в обычных случаях

После прекращения:
• Данные аккаунта могут быть удалены
• Логи сканирования сохраняются в течение установленного срока
• Обязательства по конфиденциальности сохраняются`
    },
    {
      id: "changes",
      icon: <RefreshCw className="w-6 h-6" />,
      title: "12. Изменения условий",
      content: `Мы оставляем за собой право изменять Условия:

• Существенные изменения: уведомление за 30 дней
• Технические изменения: без предварительного уведомления
• Изменения публикуются на этой странице
• Дата последнего обновления указана в начале документа

Продолжение использования после изменений означает согласие с новыми Условиями. Если вы не согласны, прекратите использование Сервиса.`
    },
    {
      id: "governing-law",
      icon: <Globe className="w-6 h-6" />,
      title: "13. Применимое право",
      content: `Настоящие Условия регулируются законодательством:
• Основное: законодательство Российской Федерации
• Для пользователей ЕС: применимы положения GDPR
• Для пользователей США: применимы федеральные законы
• Международные конфликты: арбитраж в соответствии с правилами ICC

Юрисдикция:
• Споры подлежат рассмотрению в судах по месту регистрации Компании
• Вы соглашаетесь с такой юрисдикцией`
    },
    {
      id: "disclaimer",
      icon: <HelpCircle className="w-6 h-6" />,
      title: "14. Отказ от ответственности",
      content: `SecOps Global является инструментом для профессионалов:

• Сервис предназначен для легального тестирования безопасности
• Мы не поощряем и не поддерживаем незаконную деятельность
• Пользователь несет полную ответственность за законность своих действий
• Мы не являемся юридическими консультантами
• Информация о CVE предоставляется из открытых источников
• AI-анализ носит рекомендательный характер

Консультируйтесь с юристом перед использованием Сервиса в коммерческих целях.`
    },
    {
      id: "contact",
      icon: <Mail className="w-6 h-6" />,
      title: "15. Контактная информация",
      content: `По вопросам, связанным с настоящими Условиями:

• Email: legal@secops-global.com
• Почтовый адрес: SecOps Global Legal Dept, 123 Security Street, Tech City, TC 12345
• Для правоохранительных органов: law-enforcement@secops-global.com

Мы отвечаем на обращения в течение 5 рабочих дней.

Дата последнего обновления: ${lastUpdated}`
    }
  ];

  const keyPoints = [
    { icon: <Terminal className="w-5 h-5 text-green-400" />, text: "Сканируйте только свои системы" },
    { icon: <Bug className="w-5 h-5 text-yellow-400" />, text: "Сообщайте об уязвимостях ответственно" },
    { icon: <Server className="w-5 h-5 text-blue-400" />, text: "Соблюдайте rate limits" },
    { icon: <Zap className="w-5 h-5 text-red-400" />, text: "Не используйте для атак" }
  ];

  return (
    <Layout>
      <div className="min-h-screen relative">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/2 to-transparent" />
        
        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl border border-primary/30 mb-6">
              <Scale className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
              Условия Использования
            </h1>
            <p className="text-primary/60 font-mono text-lg">
              Последнее обновление: {lastUpdated}
            </p>
            <Badge className="mt-4 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Обязательно к прочтению
            </Badge>
          </motion.div>

          {/* Key Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            {keyPoints.map((item, idx) => (
              <Card key={idx} className="cyber-card border-primary/20">
                <CardContent className="p-4 flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm text-primary/80 font-mono">{item.text}</span>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Warning Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-12"
          >
            <Card className="cyber-card border-red-500/30 bg-red-500/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Ban className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-display text-red-400 mb-2">
                      Важное предупреждение
                    </h3>
                    <p className="text-primary/70 font-mono text-sm leading-relaxed">
                      SecOps Global предназначен исключительно для легального тестирования безопасности систем, 
                      которыми вы владеете или имеете явное разрешение на тестирование. 
                      Незаконное использование инструментов безопасности является уголовным преступлением в большинстве стран.
                      Мы активно сотрудничаем с правоохранительными органами и сохраняем логи активности.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content */}
          <div className="max-w-4xl mx-auto space-y-6">
            {sections.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                <Card className="cyber-card overflow-hidden group hover:border-primary/40 transition-colors">
                  <CardHeader className="border-b border-primary/10 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary/20 transition-colors">
                        {section.icon}
                      </div>
                      <CardTitle className="text-xl text-primary font-display">
                        {section.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="text-primary/70 font-mono whitespace-pre-line leading-relaxed">
                      {section.content}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="cyber-card border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-8 text-center">
                  <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-display text-primary mb-2">
                    Нужна помощь с условиями?
                  </h3>
                  <p className="text-primary/60 font-mono mb-6">
                    Наша юридическая команда готова ответить на ваши вопросы
                  </p>
                  <a 
                    href="mailto:legal@secops-global.com"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-mono transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    legal@secops-global.com
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
