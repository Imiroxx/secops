import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { useAuth } from "../hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { User, Settings, Shield, Award, Terminal, Github, Globe, Bell, Save } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { motion } from "framer-motion";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    bio: "",
    specialization: "",
    githubUrl: "",
    websiteUrl: "",
    notificationsEnabled: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/user/settings");
        if (res.ok) {
          const data = await res.json();
          if (data) setSettings(data);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast({ title: "Успех", description: "Настройки профиля сохранены" });
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      toast({ title: "Ошибка", description: "Не удалось сохранить настройки", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: User Info & Achievements */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="cyber-card">
              <CardContent className="pt-8 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary shadow-[0_0_15px_rgba(0,255,65,0.3)]">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                  <Badge className="absolute -bottom-2 right-0 bg-primary text-black">Pro</Badge>
                </div>
                <h2 className="text-2xl font-display text-white">{user?.username}</h2>
                <p className="text-primary/60 font-mono text-sm">{user?.email}</p>
                <div className="flex justify-center gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">12</div>
                    <div className="text-[10px] uppercase text-gray-500 font-mono">Сканов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">5</div>
                    <div className="text-[10px] uppercase text-gray-500 font-mono">Курсов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">850</div>
                    <div className="text-[10px] uppercase text-gray-500 font-mono">PTS</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" /> Достижения
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary">First Blood</Badge>
                <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary">Bug Hunter</Badge>
                <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary">Secure Coder</Badge>
                <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary">Network Expert</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="text-xl font-display flex items-center gap-2 text-primary">
                  <Settings className="w-6 h-6" /> Настройки профиля
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-primary/70 uppercase">Специализация</label>
                    <Input 
                      className="cyber-input" 
                      placeholder="Например: Web Security, Reverse Engineering" 
                      value={settings.specialization}
                      onChange={e => setSettings({...settings, specialization: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-primary/70 uppercase">GitHub URL</label>
                    <div className="relative">
                      <Github className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input 
                        className="cyber-input pl-10" 
                        placeholder="github.com/username" 
                        value={settings.githubUrl}
                        onChange={e => setSettings({...settings, githubUrl: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-primary/70 uppercase">О себе</label>
                  <Textarea 
                    className="cyber-input h-32" 
                    placeholder="Расскажите о своем опыте в кибербезопасности..." 
                    value={settings.bio}
                    onChange={e => setSettings({...settings, bio: e.target.value})}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-black/40 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm font-bold text-white">Уведомления о новых уроках</div>
                      <div className="text-xs text-gray-500 font-mono">Получайте Email, когда выходят новые материалы</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-primary" 
                    checked={settings.notificationsEnabled}
                    onChange={e => setSettings({...settings, notificationsEnabled: e.target.checked})}
                  />
                </div>

                <Button 
                  className="cyber-button w-full md:w-auto px-8" 
                  onClick={handleSave}
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Сохранение..." : "Сохранить настройки"}
                </Button>
              </CardContent>
            </Card>

            <Card className="cyber-card border-accent/30">
              <CardHeader>
                <CardTitle className="text-xl font-display flex items-center gap-2 text-accent">
                  <Shield className="w-6 h-6" /> Безопасность
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-400 font-mono">
                  Ваш аккаунт защищен по стандарту SecOps Global. Последний вход: сегодня, 15:45 (Moscow).
                </p>
                <Button variant="outline" className="border-accent/40 text-accent hover:bg-accent/10">
                  Сбросить пароль
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
}
