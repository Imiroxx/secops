import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { Button } from './ui/button';
import { useLanguage } from '../lib/i18n';
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

const navigationItems = [
  { 
    path: '/', 
    labelKey: 'nav.home', 
    icon: Home,
    requiresAuth: false
  },
  { 
    path: '/courses', 
    labelKey: 'nav.courses', 
    icon: BookOpen,
    requiresAuth: true
  },
  { 
    path: '/scanner', 
    labelKey: 'nav.scanner', 
    icon: Search,
    requiresAuth: true
  },
  { 
    path: '/arena', 
    labelKey: 'nav.arena', 
    icon: Swords,
    requiresAuth: true
  },
  { 
    path: '/tournaments', 
    labelKey: 'nav.tournaments', 
    icon: Trophy,
    requiresAuth: true
  },
  { 
    path: '/rankings', 
    labelKey: 'nav.rankings', 
    icon: BarChart3,
    requiresAuth: true
  },
  { 
    path: '/profile', 
    labelKey: 'nav.profile', 
    icon: User,
    requiresAuth: true
  }
];

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className = '' }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/90 backdrop-blur-xl border-b border-primary/20 shadow-lg' 
          : 'bg-gradient-to-b from-black/80 to-transparent'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group min-w-max">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="relative flex-shrink-0"
            >
              <Shield className="w-8 h-8 lg:w-10 lg:h-10 text-primary drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-full blur-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <div className="flex flex-col">
              <h1 className="text-lg lg:text-2xl font-display font-bold text-primary group-hover:text-primary/80 transition-colors leading-tight">
                SEC<span className="text-white">OPS</span>
              </h1>
              <span className="text-[10px] text-primary/60 font-mono tracking-widest uppercase leading-none">Global</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              const isDisabled = item.requiresAuth && !isAuthenticated;
              const label = t(item.labelKey);
              
              return (
                <div key={item.path}>
                  {isDisabled ? (
                    <div className="relative group">
                      <Button
                        variant="ghost"
                        className="text-primary/40 cursor-not-allowed px-4 py-2"
                        disabled
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {label}
                      </Button>
                      <div className="absolute top-full left-0 mt-1 p-2 bg-black/90 border border-primary/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        <p className="text-xs text-primary/70 font-mono">{t('auth.required')}</p>
                      </div>
                    </div>
                  ) : (
                    <Link href={item.path}>
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
                          <Icon className="w-4 h-4 mr-2" />
                          {label}
                        </Button>
                      </motion.div>
                    </Link>
                  )}
                </div>
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
                    <span className="hidden sm:inline">{t('nav.logout_short')}</span>
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Link href="/auth">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="cyber-button">
                      <Lock className="w-4 h-4 mr-2" />
                      {t('nav.login_short')}
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
                  const isDisabled = item.requiresAuth && !isAuthenticated;
                  const label = t(item.labelKey);
                  
                  return (
                    <div key={item.path}>
                      {isDisabled ? (
                        <div className="relative group">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-primary/40 cursor-not-allowed"
                            disabled
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            <div className="text-left">
                              <div className="font-medium">{label}</div>
                            </div>
                          </Button>
                          <div className="absolute top-full left-0 mt-1 p-2 bg-black/90 border border-primary/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            <p className="text-xs text-primary/70 font-mono">{t('auth.required')}</p>
                          </div>
                        </div>
                      ) : (
                        <Link href={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                          <motion.div
                            whileTap={{ scale: 0.98 }}
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
                                <div className="font-medium">{label}</div>
                              </div>
                              {isActive && (
                                <motion.div
                                  layoutId="activeTab"
                                  className="ml-auto w-2 h-2 bg-primary rounded-full"
                                />
                              )}
                            </Button>
                          </motion.div>
                        </Link>
                      )}
                    </div>
                  );
                })}

                {/* Mobile User Section */}
                <div className="border-t border-primary/20 pt-4 mt-4">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 px-2">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-display text-primary">{user?.username}</p>
                          <p className="text-xs text-primary/60 font-mono">Уровень: {(user as any)?.level || 'Новичок'}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('nav.logout')}
                      </Button>
                    </div>
                  ) : (
                    <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full cyber-button">
                        <Lock className="w-4 h-4 mr-2" />
                        {t('nav.login')}
                      </Button>
                    </Link>
                  )}
                </div>
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
