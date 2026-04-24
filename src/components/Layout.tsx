import React from 'react';
import Navigation from './Navigation';
import { useLanguage } from '../lib/i18n';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Grid Animation Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid-pattern opacity-10" />
      
      {/* Matrix Rain Effect */}
      <div className="matrix-rain" />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="flex-1 relative z-10 pt-16 lg:pt-20">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-primary/20 bg-black/80 backdrop-blur-xl py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-primary font-mono text-xs font-bold">SEC</span>
              </div>
              <span className="font-display font-bold text-white">SEC<span className="text-primary">OPS</span> Global</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-primary/60 font-mono text-sm mb-2">
                {t('footer.rights')}
              </p>
              <div className="flex items-center justify-center md:justify-end gap-4 text-xs text-primary/40 font-mono">
                <a href="/privacy" className="hover:text-primary transition-colors">{t('footer.privacy')}</a>
                <a href="/terms" className="hover:text-primary transition-colors">{t('footer.terms')}</a>
                <a href="#" className="hover:text-primary transition-colors">{t('footer.contact')}</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
