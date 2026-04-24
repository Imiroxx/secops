import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  CheckCircle, 
  Loader2, 
  AlertTriangle,
  Shield,
  ArrowLeft,
  Lock
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';

export default function QRAuthPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchParams] = useLocation();
  
  // Get sessionId from URL
  const params = new URLSearchParams(searchParams);
  const sessionId = params.get('sessionId');
  
  const [status, setStatus] = useState<'checking' | 'pending' | 'authenticated' | 'error' | 'login_required'>('checking');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }
    
    // Check session and auto-authenticate if already logged in
    checkSession();
  }, [sessionId]);

  const checkSession = async () => {
    try {
      const response = await fetch(`/api/qr/verify-link/${sessionId}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.status === 'authenticated') {
        setStatus('authenticated');
        toast({
          title: '✅ Вход выполнен',
          description: 'Вы успешно вошли на компьютере',
        });
      } else if (data.requiresAuth) {
        setStatus('login_required');
      } else {
        setStatus('pending');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setStatus('error');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // First login normally
      const loginResponse = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(loginData)
      });
      
      if (!loginResponse.ok) {
        throw new Error('Login failed');
      }
      
      // Then verify QR link again - this will auto-authenticate
      const verifyResponse = await fetch(`/api/qr/verify-link/${sessionId}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      const verifyData = await verifyResponse.json();
      
      if (verifyData.status === 'authenticated') {
        setStatus('authenticated');
        toast({
          title: '✅ Вход выполнен',
          description: 'Вы успешно вошли на компьютере',
        });
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: 'Неверное имя пользователя или пароль',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <p className="text-primary/60 font-mono">Проверка сессии...</p>
        </motion.div>
      </div>
    );
  }

  if (status === 'error' || !sessionId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="cyber-card max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-display text-primary mb-2">Ошибка сессии</h1>
            <p className="text-primary/60 font-mono mb-6">
              Сессия недействительна или истекла. Пожалуйста, попробуйте снова.
            </p>
            <Button onClick={() => setLocation('/auth')} className="cyber-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться к входу
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="cyber-card max-w-md w-full border-green-500/30">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-2xl font-display text-primary mb-2">Вход выполнен!</h1>
            <p className="text-primary/60 font-mono mb-6">
              Вы успешно авторизовались на компьютере. Можете закрыть эту страницу.
            </p>
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 font-mono text-sm">
                ✅ Сессия подтверждена
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl border border-primary/30 mb-4">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-primary mb-2">
            Вход через QR
          </h1>
          <p className="text-primary/60 font-mono">
            Войдите в аккаунт для подтверждения входа на компьютере
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="cyber-card">
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-primary/80 font-mono">
                    Имя пользователя
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Введите имя пользователя"
                    className="cyber-input"
                    value={loginData.username}
                    onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-primary/80 font-mono">
                    Пароль
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Введите пароль"
                    className="cyber-input"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="cyber-button w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Вход...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Подтвердить вход
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg">
            <Shield className="w-4 h-4 text-primary/60" />
            <span className="text-primary/60 font-mono text-sm">
              Безопасное соединение
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
