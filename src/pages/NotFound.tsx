import React from "react";
import { Layout } from "../components/Layout";
import { Link } from "wouter";
import { Home, ArrowLeft, Search, Bug } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            {/* 404 Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <div className="relative inline-block">
                <div className="text-9xl font-display font-black text-primary/20">404</div>
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Bug className="w-24 h-24 text-primary/60" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-4xl md:text-5xl font-display font-bold text-primary mb-4"
            >
              Уязвимость не найдена
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-xl text-primary/70 font-mono mb-8"
            >
              Запрошенная страница не существует или была перемещена
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/">
                <Button className="cyber-button">
                  <Home className="w-4 h-4 mr-2" />
                  На главную
                </Button>
              </Link>
              
              <Button variant="outline" className="cyber-button border-primary/30">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
              
              <Link href="/scanner">
                <Button variant="outline" className="cyber-button border-primary/30">
                  <Search className="w-4 h-4 mr-2" />
                  Сканер
                </Button>
              </Link>
            </motion.div>
            
            {/* Error Code Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-12 p-4 bg-black/40 rounded-lg border border-primary/20"
            >
              <div className="text-xs text-primary/40 font-mono">
                <div>Error Code: 404_NOT_FOUND</div>
                <div>Timestamp: {new Date().toISOString()}</div>
                <div>Status: Page vulnerability not detected</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
