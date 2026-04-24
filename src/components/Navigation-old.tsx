import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BookOpen, 
  Search, 
  Swords, 
  Trophy, 
  BarChart3, 
  User, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; 
  BarChart3, 
  User, 
  LogOut, 
  Menu,
  X,
  Shield,
  Zap,
  Target,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navigationItems = [
  { path: '/', label: 'Главная', icon: Home, description: 'Домашняя страница' },
  { path: '/courses', label: 'Курсы', icon: BookOpen, description: 'Курсы кибербезопасности' },
  { path: '/scanner', label: 'Сканер', icon: Search, description: 'Сканер уязвимостей' },
  { path: '/arena', label: 'Арена', icon: Swords, description: 'PvP битвы' },
  { path: '/tournaments', label: 'Турниры', icon: Trophy, description: 'Соревнования' },
  { path: '/rankings', label: 'Рейтинги', icon: BarChart3, description: 'Статистика и рейтинги' },
];

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = '' }: NavigationProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black/90 backdrop-blur-xl border-b border-primary/20 shadow-lg ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Shield className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-full blur-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-display font-bold text-primary group-hover:text-primary/80 transition-colors">
                SecOps Global
              </h1>
              <p className="text-xs text-primary/60 font-mono hidden lg:block">Cybersecurity Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`
                        ${isActive 
                          ? "bg-primary/20 text-primary border-primary/40" 
                          : "text-primary/70 hover:text-primary hover:bg-primary/10"
                        }
                        transition-all duration-200 px-4 py-2
                      `}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </Button>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* User Menu */}
            {isAuthenticated ? (
              <div className="hidden lg:flex items-center space-x-3">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20"
                >
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-mono">{user?.username}</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Выход</span>
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Link href="/auth">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="cyber-button">
                      <Lock className="w-4 h-4 mr-2" />
                      Войти
                    </Button>
                  </motion.div>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-primary hover:bg-primary/10 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-primary/20"
            >
              <div className="py-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  
                  return (
                    <Link key={item.path} href={item.path}>
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-start ${
                            isActive 
                              ? "bg-primary/20 text-primary border-primary/40" 
                              : "text-primary/70 hover:text-primary hover:bg-primary/10"
                          }`}
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs opacity-70">{item.description}</div>
                          </div>
                        </Button>
                      </motion.div>
                    </Link>
                  );
                })}
                
                {isAuthenticated && (
                  <div className="pt-4 border-t border-primary/20">
                    <div className="px-4 py-2 flex items-center space-x-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-primary font-mono text-sm">{user?.username}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-2 border-primary/30 text-primary hover:bg-primary/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Выйти
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Animated border effect */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50">
        <motion.div
          className="h-full bg-primary"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </motion.nav>
  );
}
