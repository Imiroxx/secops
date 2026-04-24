import { Layout } from "@/components/Layout";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { 
  Shield, 
  BookOpen, 
  Search, 
  Swords, 
  Trophy, 
  BarChart3, 
  Users, 
  Target,
  Zap,
  Lock,
  Globe,
  Cpu,
  Wifi,
  ArrowRight,
  Star,
  TrendingUp,
  Award,
  Gamepad2
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const mainFeatures = [
    {
      icon: <BookOpen className="w-12 h-12 text-primary" />,
      title: "📚 Курсы кибербезопасности",
      description: "Обучающие модули по всем аспектам кибербезопасности от основ до продвинутых техник",
      path: "/courses",
      color: "from-emerald-500/20 to-primary/20",
      stats: "50+ курсов"
    },
    {
      icon: <Search className="w-12 h-12 text-primary" />,
      title: "🔍 Сканер уязвимостей",
      description: "Полный сканер всех существующих уязвимостей CVE с проверкой владения сайтом",
      path: "/scanner",
      color: "from-blue-500/20 to-cyan-500/20",
      stats: "200,000+ CVE"
    },
    {
      icon: <Swords className="w-12 h-12 text-primary" />,
      title: "⚔️ Арена (PvP битвы)",
      description: "Соревновательные битвы с другими специалистами в реальном времени",
      path: "/arena",
      color: "from-red-500/20 to-orange-500/20",
      stats: "PvP модуль"
    },
    {
      icon: <Trophy className="w-12 h-12 text-primary" />,
      title: "🏆 Турниры и соревнования",
      description: "Еженедельные турниры с призами и международным рейтингом",
      path: "/tournaments",
      color: "from-yellow-500/20 to-amber-500/20",
      stats: "Призовой фонд"
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-primary" />,
      title: "📊 Рейтинги и статистика",
      description: "Детальная статистика вашего прогресса и мировые рейтинги",
      path: "/rankings",
      color: "from-purple-500/20 to-pink-500/20",
      stats: "Мировой рейтинг"
    }
  ];

  const stats = [
    { label: "Активных пользователей", value: "50,000+", icon: <Users className="w-5 h-5" /> },
    { label: "Обнаруженных уязвимостей", value: "1M+", icon: <Shield className="w-5 h-5" /> },
    { label: "PvP битв проведено", value: "100K+", icon: <Swords className="w-5 h-5" /> },
    { label: "Турниров проведено", value: "500+", icon: <Trophy className="w-5 h-5" /> }
  ];

  return (
    <Layout>
      <div className="relative min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-5xl mx-auto"
            >
              {/* Main Title */}
              <motion.h1 
                className="text-6xl md:text-8xl font-display font-black mb-6 leading-tight"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                  SecOps
                </span>
                <br />
                <span className="text-white">Global</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-primary/80 font-body mb-8 max-w-3xl mx-auto font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Платформа кибербезопасности нового поколения
                <br />
                <span className="text-primary/60">Обучение • Практика • Соревнования</span>
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button className="cyber-button text-lg px-8 py-4 group">
                      Перейти к дашборду
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth">
                      <Button className="cyber-button text-lg px-8 py-4 group">
                        Начать обучение
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/arena">
                      <Button variant="outline" className="cyber-button text-lg px-8 py-4 border-primary/40">
                        <Gamepad2 className="w-5 h-5 mr-2" />
                        PvP Арена
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>
              
              {/* Stats */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                {stats.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + idx * 0.1, duration: 0.3 }}
                    className="cyber-card p-4 text-center"
                  >
                    <div className="flex items-center justify-center mb-2 text-primary">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-display font-bold text-primary mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-primary/60 font-mono">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Main Features Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
                Функции платформы
              </h2>
              <p className="text-xl text-primary/60 font-mono max-w-2xl mx-auto">
                Комплексная экосистема для обучения и практики в кибербезопасности
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {mainFeatures.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  <Link href={feature.path}>
                    <Card className="cyber-card h-full group cursor-pointer overflow-hidden relative">
                      {/* Gradient Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      
                      <CardHeader className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 rounded-full bg-black/50 border border-primary/30 group-hover:border-primary transition-colors">
                            {feature.icon}
                          </div>
                          <span className="text-xs font-mono text-primary/60 bg-black/50 px-2 py-1 rounded border border-primary/20">
                            {feature.stats}
                          </span>
                        </div>
                        <CardTitle className="text-xl text-white group-hover:text-primary transition-colors">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="relative z-10">
                        <p className="text-primary/70 font-mono text-sm mb-4">
                          {feature.description}
                        </p>
                        <div className="flex items-center text-primary group-hover:text-primary/80 transition-colors">
                          <span className="text-sm font-mono mr-2">Перейти</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Arena Feature Section */}
        <section className="py-20 relative bg-gradient-to-b from-transparent to-primary/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <motion.div
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="cyber-card p-8 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10" />
                  <div className="relative z-10">
                    <Swords className="w-16 h-16 text-primary mb-6" />
                    <h3 className="text-3xl font-display font-bold text-primary mb-4">
                      ⚔️ PvP Арена
                    </h3>
                    <p className="text-primary/70 font-mono mb-6">
                      Соревнуйтесь с лучшими специалистами по кибербезопасности в реальном времени. 
                      Практикуйте атаку и защиту, зарабатывайте очки и поднимайтесь в рейтинге.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center text-primary/80">
                        <Zap className="w-4 h-4 mr-3" />
                        <span className="font-mono text-sm">Реальные PvP битвы</span>
                      </div>
                      <div className="flex items-center text-primary/80">
                        <Target className="w-4 h-4 mr-3" />
                        <span className="font-mono text-sm">Система рейтингов</span>
                      </div>
                      <div className="flex items-center text-primary/80">
                        <Award className="w-4 h-4 mr-3" />
                        <span className="font-mono text-sm">Турниры с призами</span>
                      </div>
                    </div>
                    <Link href="/arena">
                      <Button className="cyber-button mt-6 w-full">
                        <Swords className="w-4 h-4 mr-2" />
                        Войти в Арену
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
              
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="cyber-card p-6"
                >
                  <h4 className="text-xl font-display text-primary mb-3">🎮 Как функция обучения</h4>
                  <ul className="space-y-2 text-primary/70 font-mono text-sm">
                    <li>• Геймификация образовательного процесса</li>
                    <li>• Практическое применение теории</li>
                    <li>• Мотивация через соревнования</li>
                    <li>• Социальное взаимодействие</li>
                  </ul>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="cyber-card p-6"
                >
                  <h4 className="text-xl font-display text-primary mb-3">🏆 Как функция сообщества</h4>
                  <ul className="space-y-2 text-primary/70 font-mono text-sm">
                    <li>• Нетворкинг специалистов</li>
                    <li>• Обмен опытом и знаниями</li>
                    <li>• Командная работа и сотрудничество</li>
                    <li>• Менторство и наставничество</li>
                  </ul>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="cyber-card p-6"
                >
                  <h4 className="text-xl font-display text-primary mb-3">📊 Как функция прогресса</h4>
                  <ul className="space-y-2 text-primary/70 font-mono text-sm">
                    <li>• Измерение навыков в реальном времени</li>
                    <li>• Сравнение с другими специалистами</li>
                    <li>• Отслеживание роста компетенций</li>
                    <li>• Достижения и признание</li>
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Integration Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
                🔗 Интеграция функций
              </h2>
              <p className="text-xl text-primary/60 font-mono max-w-2xl mx-auto">
                Все модули платформы тесно связаны для создания единой экосистемы обучения
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="cyber-card p-6 text-center"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    <BookOpen className="w-8 h-8 text-emerald-400" />
                  </div>
                  <Swords className="w-8 h-8 text-primary mx-4" />
                  <div className="p-3 rounded-full bg-red-500/20 border border-red-500/30">
                    <Trophy className="w-8 h-8 text-red-400" />
                  </div>
                </div>
                <h3 className="text-xl font-display text-primary mb-3">Курсы → Арена → Турниры</h3>
                <p className="text-primary/70 font-mono text-sm">
                  Изучайте теорию, применяйте в PvP битвах, побеждайте в турнирах
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="cyber-card p-6 text-center"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-blue-500/20 border border-blue-500/30">
                    <Search className="w-8 h-8 text-blue-400" />
                  </div>
                  <Swords className="w-8 h-8 text-primary mx-4" />
                  <div className="p-3 rounded-full bg-purple-500/20 border border-purple-500/30">
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-xl font-display text-primary mb-3">Сканер → Арена → Рейтинги</h3>
                <p className="text-primary/70 font-mono text-sm">
                  Находите уязвимости, соревнуйтесь в их эксплуатации, растите в рейтинге
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="cyber-card p-6 text-center"
              >
                <div className="flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-primary mx-2" />
                  <Shield className="w-8 h-8 text-primary mx-2" />
                  <TrendingUp className="w-8 h-8 text-primary mx-2" />
                </div>
                <h3 className="text-xl font-display text-primary mb-3">Сообщество → Безопасность → Рост</h3>
                <p className="text-primary/70 font-mono text-sm">
                  Общайтесь с экспертами, изучайте безопасность, развивайтесь профессионально
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="cyber-card p-12 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-emerald-400/10" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6">
                  Готовы стать экспертом в кибербезопасности?
                </h2>
                <p className="text-xl text-primary/70 font-mono mb-8 max-w-2xl mx-auto">
                  Присоединяйтесь к сообществу профессионалов и начните свой путь в мир кибербезопасности сегодня
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  {isAuthenticated ? (
                    <Link href="/dashboard">
                      <Button className="cyber-button text-lg px-8 py-4">
                        Перейти к обучению
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth">
                      <Button className="cyber-button text-lg px-8 py-4">
                        Начать бесплатно
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  )}
                  <Link href="/arena">
                    <Button variant="outline" className="cyber-button text-lg px-8 py-4 border-primary/40">
                      <Swords className="w-5 h-5 mr-2" />
                      Попробовать Арену
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
