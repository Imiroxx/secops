import React from "react";
import { Layout } from "../components/Layout";
import { useAuth } from "../hooks/use-auth";
import { Link } from "wouter";
import { 
  Shield, 
  Sword, 
  BookOpen, 
  Search, 
  Trophy, 
  BarChart3, 
  Users, 
  Target, 
  Zap, 
  Lock, 
  ArrowRight, 
  Play, 
  Star, 
  TrendingUp,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function Home() {
  const { isAuthenticated } = useAuth();

  const stats = [
    { label: "Студентов", value: "50K+", icon: <Users className="w-6 h-6" />, trend: "+12%" },
    { label: "Курсов", value: "100+", icon: <BookOpen className="w-6 h-6" />, trend: "+8" },
    { label: "PvP Битв", value: "100K+", icon: <Sword className="w-6 h-6" />, trend: "+25%" },
    { label: "Уязвимостей", value: "234K+", icon: <Shield className="w-6 h-6" />, trend: "+156" },
  ];

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Курсы кибербезопасности",
      description: "Комплексные обучающие программы от основ до продвинутых техник",
      color: "from-emerald-500/20 to-primary/20",
      link: "/courses"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Сканер уязвимостей",
      description: "Проверка сайтов на все существующие уязвимости CVE с верификацией",
      color: "from-blue-500/20 to-cyan-500/20",
      link: "/scanner"
    },
    {
      icon: <Sword className="w-8 h-8" />,
      title: "PvP Арена",
      description: "Соревнуйтесь с лучшими специалистами в реальном времени",
      color: "from-red-500/20 to-orange-500/20",
      link: "/arena"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Турниры и рейтинги",
      description: "Участвуйте в соревнованиях с призовыми фондами",
      color: "from-purple-500/20 to-pink-500/20",
      link: "/tournaments"
    }
  ];

  const recentActivity = [
    { user: "CyberNinja", action: "победил в турнире", time: "5 мин назад", icon: <Trophy className="w-4 h-4 text-yellow-400" /> },
    { user: "SecurityPro", action: "завершил курс", time: "12 мин назад", icon: <BookOpen className="w-4 h-4 text-green-400" /> },
    { user: "HackMaster", action: "нашел уязвимость", time: "18 мин назад", icon: <Shield className="w-4 h-4 text-red-400" /> },
    { user: "ByteWarrior", action: "победил в PvP", time: "25 мин назад", icon: <Sword className="w-4 h-4 text-blue-400" /> },
  ];

  return (
    <Layout>
      <div className="min-h-screen relative">
        {/* Hero Section с красивыми анимациями */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Анимированный фон */}
          <div className="absolute inset-0">
            {/* Плавающие частицы */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.random() * 100 - 50, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              />
            ))}
            
            {/* Градиентные круги */}
            <motion.div
              className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 20, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
              transition={{ duration: 25, repeat: Infinity }}
            />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-6xl mx-auto"
            >
              {/* Анимированный заголовок */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mb-8"
              >
                <div className="flex items-center justify-center mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="relative"
                  >
                    <Shield className="w-20 h-20 lg:w-32 lg:h-32 text-primary" />
                    <motion.div
                      className="absolute inset-0 bg-primary/30 rounded-full blur-2xl"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </motion.div>
                </div>
                
                <motion.h1
                  className="text-5xl md:text-7xl font-display font-bold text-primary mb-6"
                  animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                  style={{
                    background: "linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6, #10b981)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  SecOps Global
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-xl md:text-2xl text-primary/80 font-mono mb-12 max-w-3xl mx-auto"
                >
                  Платформа для изучения кибербезопасности и тестирования на проникновение
                  <br />
                  <span className="text-primary/60">Обучение, практика и соревнования в одном месте</span>
                </motion.p>
              </motion.div>
              
              {/* Описание сервиса */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="max-w-4xl mx-auto mb-12"
              >
                <Card className="cyber-card p-8">
                  <CardContent className="text-center">
                    <p className="text-lg text-primary/80 font-mono leading-relaxed mb-6">
                      SecOps Global — это комплексная платформа для обучения кибербезопасности, 
                      предназначенная как для новичков, так и для опытных специалистов. 
                      Мы предлагаем интерактивные курсы, сканер уязвимостей с проверкой владения сайтом, 
                      PvP арену для соревнований и турниры с реальными призами.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-primary/20">
                        <BookOpen className="w-8 h-8 text-primary mb-3" />
                        <h3 className="text-primary font-mono font-semibold mb-2">Обучение</h3>
                        <p className="text-primary/60 text-sm font-mono">Курсы от основ до продвинутых техник пентестинга</p>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-primary/20">
                        <Shield className="w-8 h-8 text-primary mb-3" />
                        <h3 className="text-primary font-mono font-semibold mb-2">Практика</h3>
                        <p className="text-primary/60 text-sm font-mono">Сканер уязвимостей с актуальной базой CVE 2026</p>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-primary/20">
                        <Sword className="w-8 h-8 text-primary mb-3" />
                        <h3 className="text-primary font-mono font-semibold mb-2">Соревнования</h3>
                        <p className="text-primary/60 text-sm font-mono">PvP арена и турниры для отработки навыков</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* CTA кнопки */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-6"
              >
                {isAuthenticated ? (
                  <>
                    <Link href="/courses">
                      <Button className="cyber-button text-lg px-8 py-4 group">
                        <Play className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                        Начать обучение
                      </Button>
                    </Link>
                    <Link href="/arena">
                      <Button variant="outline" className="cyber-button border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10 text-lg px-8 py-4">
                        <Sword className="w-5 h-5 mr-2" />
                        PvP Арена
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth">
                      <Button className="cyber-button text-lg px-8 py-4 group">
                        <Lock className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                        Войти в систему
                      </Button>
                    </Link>
                    <Link href="/courses">
                      <Button variant="outline" className="cyber-button border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10 text-lg px-8 py-4">
                        <Search className="w-5 h-5 mr-2" />
                        Посмотреть курсы
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>
          
          {/* Анимированная линия внизу */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-primary rounded-full mt-2" />
            </div>
          </motion.div>
        </section>

        {/* Основные функции */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-primary mb-6">
                🚀 Возможности платформы
              </h2>
              <p className="text-xl text-primary/70 font-mono max-w-3xl mx-auto">
                Все инструменты для становления экспертом в кибербезопасности
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2, duration: 0.8 }}
                  whileHover={{ y: -10 }}
                >
                  <Link href={feature.link}>
                    <Card className="cyber-card h-full group cursor-pointer relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      
                      <CardHeader className="relative z-10">
                        <div className="flex items-center mb-4">
                          <div className="p-4 rounded-full bg-slate-700/50 border border-primary/30 group-hover:border-primary transition-colors">
                            <div className="text-primary">{feature.icon}</div>
                          </div>
                        </div>
                        
                        <CardTitle className="text-2xl text-white group-hover:text-primary transition-colors mb-4">
                          {feature.title}
                        </CardTitle>
                        
                        <p className="text-primary/80 font-mono text-lg">
                          {feature.description}
                        </p>
                      </CardHeader>
                      
                      <CardContent className="relative z-10">
                        <Button variant="outline" className="cyber-button border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10 group-hover:border-primary transition-colors">
                          Подробнее
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Активность пользователей */}
        <section className="py-20 lg:py-32 bg-gradient-to-b from-transparent to-primary/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-primary mb-6">
                ⚡ Активность в реальном времени
              </h2>
              <p className="text-xl text-primary/70 font-mono max-w-3xl mx-auto">
                Присоединяйтесь к тысячам пользователей, которые уже учатся и соревнуются
              </p>
            </motion.div>
            
            <div className="max-w-4xl mx-auto">
              <Card className="cyber-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-primary flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Последние действия
                    </CardTitle>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                      Онлайн
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-primary/20 hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {activity.icon}
                          <div>
                            <span className="text-primary font-mono">{activity.user}</span>
                            <span className="text-primary/60 font-mono ml-2">{activity.action}</span>
                          </div>
                        </div>
                        <span className="text-xs text-primary/40 font-mono">{activity.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA секция */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Card className="cyber-card p-12 lg:p-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-500/10" />
                <div className="relative z-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 lg:w-24 lg:h-24 mx-auto mb-8"
                  >
                    <Shield className="w-full h-full text-primary" />
                  </motion.div>
                  
                  <h2 className="text-3xl lg:text-4xl font-display font-bold text-primary mb-6">
                    Готовы стать экспертом в кибербезопасности?
                  </h2>
                  
                  <p className="text-lg text-primary/70 font-mono mb-8 max-w-2xl mx-auto">
                    Присоединяйтесь к тысячам студентов и начните свой путь в мир кибербезопасности уже сегодня
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href={isAuthenticated ? "/courses" : "/auth"}>
                      <Button className="cyber-button text-lg px-8 py-4">
                        {isAuthenticated ? (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Начать обучение
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5 mr-2" />
                            Войти и начать
                          </>
                        )}
                      </Button>
                    </Link>
                    
                    <Link href="/scanner">
                      <Button variant="outline" className="cyber-button border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10 text-lg px-8 py-4">
                        <Search className="w-5 h-5 mr-2" />
                        Попробовать сканер
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
