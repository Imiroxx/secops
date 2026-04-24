import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { useAuth } from "../hooks/use-auth";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { 
  Terminal, Shield, Zap, AlertTriangle, 
  CheckCircle, Globe, ExternalLink, ArrowLeft,
  Loader2, Flame
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { motion } from "framer-motion";

export default function ArenaSession() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [flag, setFlag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/arena/sessions");
        if (res.ok) {
          const sessions = await res.json();
          const current = sessions.find((s: any) => s.id === Number(id));
          setSession(current);
        }
      } catch (err) {
        console.error("Failed to fetch session", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  const handleSubmitFlag = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/arena/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: Number(id), flag })
      });
      const result = await res.json();
      if (result.success) {
        toast({ title: "🚩 FLAG CAPTURED!", description: "Вы успешно выполнили задание!", variant: "default" });
        setSession({ ...session, status: 'completed', isSolved: true });
      } else {
        toast({ title: "❌ Неверный флаг", description: "Попробуйте еще раз", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Ошибка", description: "Не удалось отправить флаг", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "[SYSTEM] Container deployed successfully.",
    "[INFO] Virtual Environment: Debian 11 (Bullseye)",
    `[INFO] Target Port: ${session?.port || 3000}`,
    "--------------------------------------------------",
  ]);
  const [currentCommand, setCurrentCommand] = useState("");

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommand.trim()) return;

    const cmd = currentCommand.trim().toLowerCase();
    const newHistory = [...terminalHistory, `user@arena:~$ ${currentCommand}`];

    // Simple command simulation
    if (cmd === "help") {
      newHistory.push("Available commands: help, clear, nmap, ls, whoami, ifconfig");
    } else if (cmd.startsWith("nmap")) {
      newHistory.push("Starting Nmap 7.80 ( https://nmap.org ) at 2026-04-24 18:05 UTC");
      newHistory.push(`Nmap scan report for target.local (127.0.0.1)`);
      newHistory.push("PORT     STATE SERVICE");
      newHistory.push(`${session?.port || 3000}/tcp open  http`);
    } else if (cmd === "ls") {
      newHistory.push("total 12K\ndrwxr-xr-x 2 root root 4.0K index.html\n-rw-r--r-- 1 root root  245 config.php");
    } else if (cmd === "whoami") {
      newHistory.push("secops_warrior");
    } else if (cmd === "clear") {
      setTerminalHistory([]);
      setCurrentCommand("");
      return;
    } else {
      newHistory.push(`bash: ${cmd}: command not found`);
    }

    setTerminalHistory(newHistory);
    setCurrentCommand("");
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    </Layout>
  );

  if (!session) return (
    <Layout>
      <div className="container mx-auto py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-accent mx-auto mb-4" />
        <h2 className="text-2xl font-display text-white">Сессия не найдена</h2>
        <Link href="/arena">
          <Button className="mt-6 cyber-button">Вернуться на арену</Button>
        </Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/arena" className="flex items-center text-primary/60 hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Назад к списку заданий
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Terminal View */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="cyber-card bg-black border-primary/20 overflow-hidden shadow-[0_0_20px_rgba(0,255,65,0.1)]">
              <div className="bg-primary/10 px-4 py-2 flex items-center justify-between border-b border-primary/20">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="text-xs font-mono text-primary uppercase">Active Session: {session.challengeId}</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
              </div>
              <CardContent className="p-0">
                <div className="aspect-video bg-black p-6 font-mono text-sm overflow-y-auto flex flex-col">
                  <div className="flex-1 space-y-1">
                    {terminalHistory.map((line, i) => (
                      <div key={i} className={
                        line.startsWith("[SYSTEM]") ? "text-emerald-500" :
                        line.startsWith("[INFO]") ? "text-primary" :
                        line.startsWith("user@arena") ? "text-white" : "text-gray-400"
                      }>
                        {line}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleCommand} className="flex items-center mt-4">
                    <span className="text-primary mr-2">user@arena:~$</span>
                    <input
                      type="text"
                      autoFocus
                      className="flex-1 bg-transparent border-none outline-none text-white font-mono focus:ring-0 p-0"
                      value={currentCommand}
                      onChange={(e) => setCurrentCommand(e.target.value)}
                    />
                  </form>
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-card bg-slate-900/50 border-accent/20">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2 text-accent">
                  <Globe className="w-5 h-5" /> Доступ к цели
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-black/40 border border-accent/20 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-mono mb-1">Target URL</div>
                    <div className="text-accent font-mono">http://challenge.secops.local:{session.port}</div>
                  </div>
                  <Button variant="outline" className="border-accent/40 text-accent hover:bg-accent/10">
                    <ExternalLink className="w-4 h-4 mr-2" /> Открыть
                  </Button>
                </div>
                <p className="text-sm text-gray-400 font-mono">
                  Используйте предоставленный URL для анализа приложения. Контейнер будет автоматически удален через 60 минут.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Flag Submission & Info */}
          <div className="space-y-6">
            <Card className="cyber-card bg-primary/5 border-primary/30">
              <CardHeader>
                <CardTitle className="text-xl font-display flex items-center gap-2 text-primary">
                  <Zap className="w-6 h-6" /> Сдать флаг
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-primary/70 uppercase">FLAG[...]</label>
                  <Input 
                    className="cyber-input" 
                    placeholder="FLAG{YOUR_SECRET_CODE}" 
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    disabled={session.status === 'completed'}
                  />
                </div>
                <Button 
                  className="w-full cyber-button" 
                  onClick={handleSubmitFlag}
                  disabled={isSubmitting || !flag || session.status === 'completed'}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4 mr-2" />}
                  {session.status === 'completed' ? "Задание выполнено" : "Отправить флаг"}
                </Button>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-lg font-display">Статус миссии</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-primary/10">
                  <span className="text-sm text-gray-500 font-mono">Статус</span>
                  <Badge className={session.status === 'active' ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}>
                    {session.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-primary/10">
                  <span className="text-sm text-gray-500 font-mono">Сложность</span>
                  <span className="text-sm text-primary font-bold">BEGINNER</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500 font-mono">Награда</span>
                  <span className="text-sm text-accent font-bold">100 PTS</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
