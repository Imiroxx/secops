import React from "react";
import { Layout } from "../components/Layout";
import { useLanguage } from "../lib/i18n";
import { motion } from "framer-motion";
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Cookie, 
  Share2, 
  Mail,
  AlertCircle,
  CheckCircle,
  FileText,
  Clock,
  Users,
  Globe,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function Privacy() {
  const { t } = useLanguage();
  const lastUpdated = "9 февраля 2026 года";

  const sections = [
    {
      id: "intro",
      icon: <Shield className="w-6 h-6" />,
      title: "1. Введение",
      content: `SecOps Global (далее — "Компания", "мы", "нас", "наш") серьезно относится к защите ваших персональных данных. Настоящая Политика конфиденциальности описывает, как мы собираем, используем, храним и защищаем информацию при использовании вами нашей платформы для анализа безопасности и сканирования уязвимостей.

Используя SecOps Global, вы соглашаетесь с практиками, описанными в настоящей Политике конфиденциальности.`
    },
    {
      id: "data-collection",
      icon: <Database className="w-6 h-6" />,
      title: "2. Собираемые данные",
      content: `Мы собираем следующие категории данных:

• Регистрационные данные: имя пользователя, email, хешированный пароль
• Данные сканирования: URL-адреса, код и результаты анализа безопасности
• Технические данные: IP-адрес, тип браузера, данные об устройстве
• Данные об использовании: история сканирований, настройки аккаунта
• Cookies и аналогичные технологии для улучшения работы сервиса`
    },
    {
      id: "data-usage",
      icon: <Eye className="w-6 h-6" />,
      title: "3. Цели использования данных",
      content: `Ваши данные используются для следующих целей:

• Предоставление услуг анализа безопасности и сканирования
• Хранение истории сканирований для вашего удобства
• Улучшение качества сервиса и разработки новых функций
• Обеспечение безопасности платформы и предотвращение мошенничества
• Отправка важных уведомлений об изменениях в сервисе
• Статистический анализ в обезличенном виде

Мы НЕ используем ваши данные для:
• Продажи третьим лицам
• Целевой рекламы на основе сканируемого контента
• Передачи данных государственным органам без законного основания`
    },
    {
      id: "security",
      icon: <Lock className="w-6 h-6" />,
      title: "4. Безопасность данных",
      content: `Мы применяем современные меры защиты:

• Шифрование данных при передаче (TLS 1.3)
• Шифрование данных в покое (AES-256)
• Хеширование паролей с использованием bcrypt
• Регулярное резервное копирование данных
• Мониторинг безопасности 24/7
• Ограниченный доступ сотрудников к данным
• Регулярные аудиты безопасности

Однако, ни один метод передачи через интернет не является абсолютно безопасным. Мы стремимся защитить ваши данные, но не можем гарантировать абсолютную безопасность.`
    },
    {
      id: "retention",
      icon: <Clock className="w-6 h-6" />,
      title: "5. Хранение данных",
      content: `Сроки хранения данных:

• Данные аккаунта: до момента удаления аккаунта
• Результаты сканирования: 2 года с момента создания
• Логи сервера: 90 дней
• Cookies: до 1 года (можно удалить в настройках браузера)

Вы можете запросить удаление всех ваших данных в любое время через настройки аккаунта или связавшись с нами.`
    },
    {
      id: "cookies",
      icon: <Cookie className="w-6 h-6" />,
      title: "6. Cookies и отслеживание",
      content: `Мы используем cookies для:

• Аутентификации и поддержания сессии
• Запоминания ваших предпочтений (язык, тема)
• Аналитики использования сервиса
• Предотвращения CSRF-атак

Типы cookies:
• Обязательные: необходимы для работы сервиса
• Функциональные: улучшают пользовательский опыт
• Аналитические: помогают нам улучшать сервис

Вы можете отключить cookies в настройках браузера, но это может ограничить функциональность.`
    },
    {
      id: "sharing",
      icon: <Share2 className="w-6 h-6" />,
      title: "7. Передача данных третьим лицам",
      content: `Мы не продаем и не передаем ваши персональные данные третьим лицам за исключением:

• Поставщиков услуг: хостинг, аналитика (обязательства по конфиденциальности)
• Правоохранительных органов: только по законному требованию
• AI-сервисы: анонимизированные данные для анализа уязвимостей (OpenAI)
• При слиянии или поглощении компании: с сохранением политик конфиденциальности

Все третьи стороны обязаны соблюдать стандарты защиты данных.`
    },
    {
      id: "rights",
      icon: <Users className="w-6 h-6" />,
      title: "8. Ваши права",
      content: `В соответствии с GDPR и другими законами о защите данных, вы имеете право:

• Доступа: получить копию ваших данных
• Исправления: обновить неточные данные
• Удаления: запросить удаление данных ("право на забвение")
• Ограничения обработки: временно ограничить использование
• Переносимости: получить данные в машиночитаемом формате
• Возражения: отказаться от определенных видов обработки
• Отзыва согласия: отозвать согласие в любое время

Для реализации прав свяжитесь с нами: privacy@secops-global.com`
    },
    {
      id: "international",
      icon: <Globe className="w-6 h-6" />,
      title: "9. Международная передача",
      content: `Ваши данные могут обрабатываться на серверах, расположенных в разных странах. Мы обеспечиваем:

• Соблюдение стандартных договорных положений ЕС
• Адекватный уровень защиты в соответствии с GDPR
• Шифрование при международной передаче
• Соглашения об обработке данных (DPA) с поставщиками

Основные локации: Европейский Союз, США (с защитными мерами)`
    },
    {
      id: "changes",
      icon: <FileText className="w-6 h-6" />,
      title: "10. Изменения политики",
      content: `Мы можем обновлять настоящую Политику конфиденциальности. В случае существенных изменений:

• Уведомление по email за 30 дней
• Уведомление на сайте
• Требование повторного согласия при значительных изменениях

Продолжение использования сервиса после изменений означает принятие новой версии.`
    },
    {
      id: "contact",
      icon: <Mail className="w-6 h-6" />,
      title: "11. Контакты",
      content: `Если у вас есть вопросы о настоящей Политике конфиденциальности:

• Email: privacy@secops-global.com
• Адрес: SecOps Global, 123 Security Street, Tech City, TC 12345
• Дата последнего обновления: ${lastUpdated}

Мы отвечаем на запросы в течение 30 дней.`
    }
  ];

  const highlights = [
    { icon: <CheckCircle className="w-5 h-5 text-green-400" />, text: "Данные шифруются при передаче и хранении" },
    { icon: <CheckCircle className="w-5 h-5 text-green-400" />, text: "Вы контролируете свои данные" },
    { icon: <CheckCircle className="w-5 h-5 text-green-400" />, text: "Никакой продажи данных третьим лицам" },
    { icon: <CheckCircle className="w-5 h-5 text-green-400" />, text: "Соответствие GDPR и другим стандартам" }
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
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
              Политика Конфиденциальности
            </h1>
            <p className="text-primary/60 font-mono text-lg">
              Последнее обновление: {lastUpdated}
            </p>
          </motion.div>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            {highlights.map((item, idx) => (
              <Card key={idx} className="cyber-card border-primary/20">
                <CardContent className="p-4 flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm text-primary/80 font-mono">{item.text}</span>
                </CardContent>
              </Card>
            ))}
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
              transition={{ delay: 0.8 }}
            >
              <Card className="cyber-card border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-display text-primary mb-2">
                    Остались вопросы?
                  </h3>
                  <p className="text-primary/60 font-mono mb-6">
                    Наша команда готова помочь с любыми вопросами о конфиденциальности
                  </p>
                  <a 
                    href="mailto:privacy@secops-global.com"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-mono transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    privacy@secops-global.com
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
