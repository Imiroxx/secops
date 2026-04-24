import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { useQRAuthReal } from "../hooks/use-qr-auth-real";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Smartphone, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ArrowLeft,
  User,
  Lock,
  Mail,
  Loader2,
  Terminal,
  Code,
  Zap,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../hooks/use-toast";

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  
  const qrAuth = useQRAuthReal();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      toast({
        title: "❌ Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    try {
      await loginMutation.mutateAsync(loginData);
      toast({
        title: "✅ Успешный вход",
        description: "Добро пожаловать в SecOps Global!",
      });
      setTimeout(() => setLocation("/"), 500);
    } catch (error) {
      toast({
        title: "❌ Ошибка входа",
        description: "Неверное имя пользователя или пароль",
        variant: "destructive"
      });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.username || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      toast({
        title: "❌ Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "❌ Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive"
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: "❌ Ошибка",
        description: "Пароль должен содержать минимум 6 символов",
        variant: "destructive"
      });
      return;
    }

    try {
      await registerMutation.mutateAsync({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password
      });
      toast({
        title: "✅ Регистрация успешна",
        description: "Аккаунт создан! Перенаправление...",
      });
      setTimeout(() => setLocation("/"), 1000);
    } catch (error) {
      toast({
        title: "❌ Ошибка регистрации",
        description: "Не удалось создать аккаунт. Попробуйте другое имя пользователя.",
        variant: "destructive"
      });
    }
  };

  const getQRStatusIcon = () => {
    switch (qrAuth.status) {
      case 'ready':
        return <Smartphone className="w-8 h-8 text-primary" />;
      case 'scanned':
        return <CheckCircle className="w-8 h-8 text-yellow-400 animate-pulse" />;
      case 'authenticated':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'expired':
        return <Clock className="w-8 h-8 text-red-400" />;
      case 'error':
        return <AlertTriangle className="w-8 h-8 text-red-400" />;
      default:
        return <Loader2 className="w-8 h-8 text-primary animate-spin" />;
    }
  };

  const getQRStatusText = () => {
    switch (qrAuth.status) {
      case 'generating':
        return "Генерация QR кода...";
      case 'ready':
        return "Отсканируйте QR код";
      case 'scanned':
        return "Код отсканирован. Ожидание подтверждения...";
      case 'authenticated':
        return "Аутентификация успешна! Перенаправление...";
      case 'expired':
        return "Срок действия кода истек";
      case 'error':
        return "Ошибка. Попробуйте еще раз";
      default:
        return "";
    }
  };

  const codeLines = [
    "const auth = await secureLogin(credentials);",
    "if (auth.token) { await redirect('/dashboard'); }",
    "const encrypted = await crypto.encrypt(data);",
    "const vulnerability = await scanWebsite(url);",
    "const cveList = await fetchCVEs();",
    "if (vulnerability.severity === 'critical') { alert(); }",
    "const firewall = new SecurityFirewall();",
    "await firewall.protect(network);",
    "const penetration = new PenetrationTest();",
    "await penetration.run(target);"
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Анимированный фон с бегущими строками кода */}
      <div className="absolute inset-0 bg-slate-900 overflow-hidden">
        {/* Бегущие строки кода - больше и заметнее */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/40 font-mono text-sm whitespace-nowrap"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: ['-200vw', '200vw'],
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 12,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "linear"
            }}
          >
            <span className="inline-flex items-center">
              <Code className="w-3 h-3 mr-2 text-green-400" />
              {codeLines[i % codeLines.length]}
              <Terminal className="w-3 h-3 ml-2 text-blue-400" />
            </span>
          </motion.div>
        ))}
        
        {/* Вертикальные бегущие строки */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`vertical-${i}`}
            className="absolute text-primary/30 font-mono text-xs whitespace-nowrap"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-100px',
            }}
            animate={{
              y: ['-100px', '100vh'],
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
          >
            <span className="inline-flex items-center">
              <Zap className="w-2 h-2 mr-1 text-yellow-400" />
              const scan = await vulnerabilityScan(target);
              <Activity className="w-2 h-2 ml-1 text-red-400" />
            </span>
          </motion.div>
        ))}
        
        {/* Диагональные строки */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`diagonal-${i}`}
            className="absolute text-primary/35 font-mono text-xs whitespace-nowrap"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: ['-150vw', '150vw'],
              y: ['-150vh', '150vh'],
              opacity: [0, 0.7, 0.7, 0],
            }}
            transition={{
              duration: Math.random() * 12 + 18,
              repeat: Infinity,
              delay: Math.random() * 12,
              ease: "linear"
            }}
          >
            <span className="inline-flex items-center">
              <Shield className="w-2 h-2 mr-1 text-green-400" />
              level === 'max' ? 'protected' : 'scanning'
              <Lock className="w-2 h-2 ml-1 text-blue-400" />
            </span>
          </motion.div>
        ))}
        
        {/* Градиентные круги */}
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 30, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.3, 1, 1.3], rotate: [360, 180, 0] }}
          transition={{ duration: 35, repeat: Infinity }}
        />
        
        {/* Дополнительные анимированные элементы */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -200, 0],
              x: [0, Math.random() * 200 - 100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          {/* Заголовок */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <Shield className="w-16 h-16 lg:w-20 lg:h-20 text-primary" />
                <motion.div
                  className="absolute inset-0 bg-primary/30 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </motion.div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-primary mb-4">
              SecOps Global
            </h1>
            <p className="text-xl text-primary/70 font-mono">
              Вход в платформу кибербезопасности
            </p>
          </motion.div>

          {/* Основная карточка */}
          <Card className="cyber-card max-w-5xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 relative z-10">
              {/* Левая часть - Формы входа/регистрации */}
              <div className="p-4 sm:p-6 lg:p-12">
                <div className="mb-8">
                  <Link href="/" className="inline-flex items-center text-primary/60 hover:text-primary transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    На главную
                  </Link>
                  
                  <h2 className="text-2xl lg:text-3xl font-display font-bold text-primary mb-2">
                    {activeTab === "login" ? "Вход в систему" : "Регистрация"}
                  </h2>
                  <p className="text-primary/60 font-mono">
                    {activeTab === "login" 
                      ? "Войдите для доступа ко всем функциям платформы"
                      : "Создайте аккаунт для начала обучения"
                    }
                  </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-800/60 border border-primary/30">
                    <TabsTrigger 
                      value="login" 
                      className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Вход
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register" 
                      className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Регистрация
                    </TabsTrigger>
                  </TabsList>

                  {/* Форма входа */}
                  <TabsContent value="login" className="space-y-6">
                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-primary/80 font-mono text-sm">
                          Имя пользователя
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/50" />
                          <Input
                            id="username"
                            type="text"
                            placeholder="Введите имя пользователя"
                            className="cyber-input pl-10"
                            value={loginData.username}
                            onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-primary/80 font-mono text-sm">
                          Пароль
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/50" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Введите пароль"
                            className="cyber-input pl-10 pr-10"
                            value={loginData.password}
                            onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary/50 hover:text-primary transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="cyber-button w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Вход...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Войти
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Форма регистрации */}
                  <TabsContent value="register" className="space-y-6">
                    <form onSubmit={handleRegisterSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="reg-username" className="text-primary/80 font-mono text-sm">
                          Имя пользователя
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/50" />
                          <Input
                            id="reg-username"
                            type="text"
                            placeholder="Придумайте имя пользователя"
                            className="cyber-input pl-10"
                            value={registerData.username}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-primary/80 font-mono text-sm">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/50" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Введите ваш email"
                            className="cyber-input pl-10"
                            value={registerData.email}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-password" className="text-primary/80 font-mono text-sm">
                          Пароль
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/50" />
                          <Input
                            id="reg-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Придумайте пароль (мин. 6 символов)"
                            className="cyber-input pl-10 pr-10"
                            value={registerData.password}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary/50 hover:text-primary transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-primary/80 font-mono text-sm">
                          Подтвердите пароль
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/50" />
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Повторите пароль"
                            className="cyber-input pl-10 pr-10"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary/50 hover:text-primary transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="cyber-button w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Регистрация...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Создать аккаунт
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Правая часть - QR код вход */}
              <div className="p-4 sm:p-6 lg:p-12 bg-gradient-to-br from-primary/5 to-transparent border-t lg:border-t-0 lg:border-l border-primary/20">
                <div className="text-center">
                  <h3 className="text-xl lg:text-2xl font-display font-bold text-primary mb-4">
                    Быстрый вход
                  </h3>
                  <p className="text-primary/60 font-mono mb-6 lg:mb-8 text-sm">
                    Отсканируйте QR код мобильным приложением
                  </p>

                  <div className={`relative inline-block p-4 sm:p-6 lg:p-8 rounded-2xl border-2 transition-all duration-300 ${
                    qrAuth.status === 'ready' ? 'border-primary/50 bg-primary/5' :
                    qrAuth.status === 'scanned' ? 'border-yellow-500/50 bg-yellow-500/5' :
                    qrAuth.status === 'authenticated' ? 'border-green-500/50 bg-green-500/5' :
                    qrAuth.status === 'expired' || qrAuth.status === 'error' ? 'border-red-500/50 bg-red-500/5' :
                    'border-primary/30 bg-slate-800/50'
                  }`}>
                    {/* QR код */}
                    <AnimatePresence mode="wait">
                      {qrAuth.qrCode && qrAuth.status === 'ready' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative"
                        >
                          <img 
                            src={qrAuth.qrCode} 
                            alt="QR Code для входа" 
                            className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-lg"
                          />
                          <motion.div
                            className="absolute inset-0 border-2 border-primary/30 rounded-lg"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </motion.div>
                      )}
                      
                      {qrAuth.status === 'generating' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex items-center justify-center"
                        >
                          <Loader2 className="w-16 h-16 text-primary animate-spin" />
                        </motion.div>
                      )}
                      
                      {qrAuth.status === 'scanned' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex items-center justify-center"
                        >
                          <CheckCircle className="w-16 h-16 text-yellow-400 animate-pulse" />
                        </motion.div>
                      )}
                      
                      {qrAuth.status === 'authenticated' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex flex-col items-center justify-center"
                        >
                          <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
                          <p className="text-green-400 font-mono text-sm">Успешно!</p>
                        </motion.div>
                      )}
                      
                      {(qrAuth.status === 'expired' || qrAuth.status === 'error') && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex flex-col items-center justify-center"
                        >
                          {qrAuth.status === 'expired' ? (
                            <Clock className="w-16 h-16 text-red-400 mb-4" />
                          ) : (
                            <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
                          )}
                          <p className="text-red-400 font-mono text-sm">
                            {qrAuth.status === 'expired' ? 'Срок действия истек' : 'Произошла ошибка'}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Статус */}
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                      {getQRStatusIcon()}
                      <span className="text-primary font-mono">{getQRStatusText()}</span>
                    </div>
                    
                    {/* Кнопки управления */}
                    <div className="flex justify-center space-x-4">
                      {(qrAuth.status === 'expired' || qrAuth.status === 'error') && (
                        <Button
                          onClick={qrAuth.refresh}
                          className="cyber-button"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Обновить
                        </Button>
                      )}
                      
                      {qrAuth.status === 'ready' && (
                        <Button
                          onClick={qrAuth.refresh}
                          variant="outline"
                          className="cyber-button border-primary/30"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Новый код
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Инструкции */}
                  <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-primary/20">
                    <h4 className="text-primary font-mono font-semibold mb-2">Как использовать:</h4>
                    <ol className="text-left text-primary/60 font-mono text-sm space-y-2">
                      <li>1. Отсканируйте QR код камерой телефона</li>
                      <li>2. Перейдите по ссылке на телефоне</li>
                      <li>3. Войдите в аккаунт на телефоне</li>
                      <li>4. Вход автоматически подтвердится на компьютере</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
