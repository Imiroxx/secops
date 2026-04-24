import React from "react";
import { Layout } from "../components/Layout";
import { useAuth } from "../hooks/use-auth";
import { Link } from "wouter";
import { 
  Swords, 
  Users, 
  Trophy, 
  Shield, 
  Zap, 
  Target, 
  Clock, 
  Star, 
  TrendingUp, 
  Award,
  Play,
  Lock,
  Eye,
  BarChart3,
  Gamepad2,
  Flame,
  Crown,
  Medal,
  Activity,
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle,
  Key,
  Terminal
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { useState, useEffect } from "react";

export default function Arena() {
  const { isAuthenticated, user } = useAuth();
  const [selectedMode, setSelectedMode] = useState("ranked");
  const [activeBattles, setActiveBattles] = useState([]);
  const [isJoining, setIsJoining] = useState<string | null>(null);

  const arenaChallenges = [
    {
      id: "sqli_login",
      title: "SQL Injection: Auth Bypass",
      description: "Обойдите форму входа, используя классическую SQL-инъекцию.",
      difficulty: "beginner",
      points: 100,
      icon: <Target className="w-6 h-6" />
    },
    {
      id: "jwt_secret_brute",
      title: "JWT Secret Brute",
      description: "Найдите слабый ключ подписи JWT и подделайте токен.",
      difficulty: "intermediate",
      points: 250,
      icon: <Key className="w-6 h-6" />
    },
    {
      id: "lfi_to_passwd",
      title: "LFI: Read Passwd",
      description: "Используйте уязвимость локального включения файлов для чтения системных данных.",
      difficulty: "advanced",
      points: 500,
      icon: <Terminal className="w-6 h-6" />
    }
  ];

  const handleJoin = async (challengeId: string) => {
    setIsJoining(challengeId);
    try {
      const res = await fetch("/api/arena/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId })
      });
      if (res.ok) {
        const session = await res.json();
        window.location.href = `/arena/session/${session.id}`;
      }
    } catch (err) {
      console.error("Failed to join arena", err);
    } finally {
      setIsJoining(null);
    }
  };

  const gameModes = [
    {
      id: "ranked",
      name: "Рейтинговые бои",
      description: "Бойтесь за очки рейтинга и поднимайтесь в таблице лидеров",
      icon: <Trophy className="w-6 h-6" />,
      color: "from-yellow-500/20 to-amber-500/20",
      players: "1v1",
      duration: "15 мин",
      rewards: "Рейтинговые очки"
    },
    {
      id: "casual",
      name: "Дружеские бои",
      description: "Тренируйтесь без риска для рейтинга",
      icon: <Gamepad2 className="w-6 h-6" />,
      color: "from-blue-500/20 to-cyan-500/20",
      players: "1v1",
      duration: "10 мин",
      rewards: "Опыт"
    },
    {
      id: "tournament",
      name: "Турниры",
      description: "Участвуйте в регулярных турнирах с призами",
      icon: <Crown className="w-6 h-6" />,
      color: "from-purple-500/20 to-pink-500/20",
      players: "8-16",
      duration: "2-3 часа",
      rewards: "Призы, рейтинги"
    },
    {
      id: "practice",
      name: "Тренировка",
      description: "Оттачивайте навыки в безопасной среде",
      icon: <Target className="w-6 h-6" />,
      color: "from-green-500/20 to-emerald-500/20",
      players: "1v0",
      duration: "Без лимита",
      rewards: "Навыки"
    }
  ];

  const activeBattlesData = [
    {
      id: 1,
      player1: { name: "CyberNinja", rating: 2450, avatar: "🥷" },
      player2: { name: "SecurityPro", rating: 2380, avatar: "🦸" },
      mode: "ranked",
      timeLeft: "12:45",
      spectators: 234,
      status: "active"
    },
    {
      id: 2,
      player1: { name: "HackMaster", rating: 2200, avatar: "🎯" },
      player2: { name: "DefenderX", rating: 2150, avatar: "🛡️" },
      mode: "casual",
      timeLeft: "08:30",
      spectators: 156,
      status: "active"
    },
    {
      id: 3,
      player1: { name: "CryptoKing", rating: 2650, avatar: "👑" },
      player2: { name: "ByteWarrior", rating: 2600, avatar: "⚔️" },
      mode: "ranked",
      timeLeft: "15:00",
      spectators: 412,
      status: "starting"
    }
  ];

  const leaderboard = [
    { rank: 1, name: "SecurityLegend", rating: 3200, wins: 342, losses: 45, avatar: "🏆", trend: "up" },
    { rank: 2, name: "CyberMaster", rating: 3150, wins: 298, losses: 52, avatar: "🥈", trend: "up" },
    { rank: 3, name: "HackElite", rating: 3100, wins: 276, losses: 48, avatar: "🥉", trend: "down" },
    { rank: 4, name: "DefenderPro", rating: 3050, wins: 254, losses: 61, avatar: "🛡️", trend: "up" },
    { rank: 5, name: "ByteNinja", rating: 2980, wins: 231, losses: 69, avatar: "🥷", trend: "stable" }
  ];

  const recentTournaments = [
    {
      id: 1,
      name: "Winter Cyber Championship",
      date: "2026-01-15",
      participants: 128,
      winner: "SecurityLegend",
      prize: "$10,000",
      status: "completed"
    },
    {
      id: 2,
      name: "Spring Security Cup",
      date: "2026-03-20",
      participants: 256,
      winner: "TBA",
      prize: "$25,000",
      status: "upcoming"
    },
    {
      id: 3,
      name: "Weekly Arena Masters",
      date: "2026-02-10",
      participants: 64,
      winner: "CyberMaster",
      prize: "$2,000",
      status: "completed"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Activity className="w-4 h-4 text-green-400" />;
      case "starting": return <Clock className="w-4 h-4 text-yellow-400" />;
      case "completed": return <CheckCircle className="w-4 h-4 text-blue-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "down": return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen relative">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center mb-6">
                <Swords className="w-16 h-16 text-primary mr-4" />
                <h1 className="text-5xl md:text-6xl font-display font-bold text-primary">
                  ⚔️ PvP Арена
                </h1>
              </div>
              <p className="text-xl text-primary/70 font-mono mb-8 max-w-2xl mx-auto">
                Соревнуйтесь с лучшими специалистами по кибербезопасности в реальном времени
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <div className="cyber-card p-4 text-center">
                  <div className="text-2xl font-display font-bold text-primary">100K+</div>
                  <div className="text-xs text-primary/60 font-mono">PvP битв</div>
                </div>
                <div className="cyber-card p-4 text-center">
                  <div className="text-2xl font-display font-bold text-primary">5K+</div>
                  <div className="text-xs text-primary/60 font-mono">Активных бойцов</div>
                </div>
                <div className="cyber-card p-4 text-center">
                  <div className="text-2xl font-display font-bold text-primary">$50K+</div>
                  <div className="text-xs text-primary/60 font-mono">Призовой фонд</div>
                </div>
                <div className="cyber-card p-4 text-center">
                  <div className="text-2xl font-display font-bold text-primary">24/7</div>
                  <div className="text-xs text-primary/60 font-mono">Бои в реальном времени</div>
                </div>
              </div>
              
              {/* CTA Button */}
              {!isAuthenticated && (
                <Link href="/auth">
                  <Button className="cyber-button text-lg px-8 py-4">
                    <Play className="w-5 h-5 mr-2" />
                    Войти в Арену
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </section>

        {/* Game Modes Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-display font-bold text-primary mb-4">
                🎮 Режимы игры
              </h2>
              <p className="text-xl text-primary/60 font-mono">
                Выберите подходящий режим для вашего уровня навыков
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {gameModes.map((mode, idx) => (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card 
                    className={`cyber-card h-full group cursor-pointer relative overflow-hidden ${
                      selectedMode === mode.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedMode(mode.id)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    <CardHeader className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-full bg-black/50 border border-primary/30">
                          <div className="text-primary">{mode.icon}</div>
                        </div>
                        {selectedMode === mode.id && (
                          <Badge className="bg-primary/20 text-primary border-primary/40">
                            Выбрано
                          </Badge>
                        )}
                      </div>
                      
                      <CardTitle className="text-xl text-white group-hover:text-primary transition-colors mb-2">
                        {mode.name}
                      </CardTitle>
                      
                      <p className="text-primary/70 font-mono text-sm mb-4">
                        {mode.description}
                      </p>
                      
                      <div className="space-y-2 text-xs text-primary/60 font-mono">
                        <div className="flex justify-between">
                          <span>Игроки:</span>
                          <span className="text-primary">{mode.players}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Длительность:</span>
                          <span className="text-primary">{mode.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Награды:</span>
                          <span className="text-primary">{mode.rewards}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="relative z-10">
                      <Button 
                        className={`w-full cyber-button ${
                          selectedMode === mode.id ? '' : 'border-primary/30'
                        }`}
                        disabled={!isAuthenticated}
                      >
                        {isAuthenticated ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Играть
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Требуется вход
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* REAL CHALLENGES SECTION */}
            <div className="mt-20">
              <h3 className="text-2xl font-display text-primary mb-8 flex items-center gap-2">
                <Flame className="w-6 h-6 text-accent animate-pulse" /> Доступные испытания (Docker)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {arenaChallenges.map((challenge) => (
                  <Card key={challenge.id} className="cyber-card group hover:border-accent/50 transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-accent">
                          {challenge.icon}
                        </div>
                        <Badge variant="outline" className="border-accent/40 text-accent font-mono uppercase text-[10px]">
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg text-white group-hover:text-accent transition-colors">
                        {challenge.title}
                      </CardTitle>
                      <p className="text-sm text-gray-500 font-mono mt-2 h-12 line-clamp-2">
                        {challenge.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xs font-mono text-gray-500">Награда:</div>
                        <div className="text-sm font-bold text-accent">{challenge.points} PTS</div>
                      </div>
                      <Button 
                        className="w-full cyber-button bg-accent/20 border-accent/40 text-accent hover:bg-accent/30"
                        onClick={() => handleJoin(challenge.id)}
                        disabled={isJoining === challenge.id || !isAuthenticated}
                      >
                        {isJoining === challenge.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2" />
                        )}
                        Запустить контейнер
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Active Battles Section */}
        <section className="py-16 bg-gradient-to-b from-transparent to-primary/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-display font-bold text-primary mb-4">
                🔥 Активные бои
              </h2>
              <p className="text-xl text-primary/60 font-mono">
                Наблюдайте за текущими сражениями в реальном времени
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {activeBattlesData.map((battle, idx) => (
                <motion.div
                  key={battle.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="cyber-card relative overflow-hidden">
                    <div className="absolute top-4 right-4">
                      {getStatusIcon(battle.status)}
                    </div>
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{battle.player1.avatar}</div>
                          <div>
                            <div className="font-display text-primary">{battle.player1.name}</div>
                            <div className="text-xs text-primary/60 font-mono">{battle.player1.rating} pts</div>
                          </div>
                        </div>
                        
                        <div className="text-primary font-bold text-xl">VS</div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="font-display text-primary">{battle.player2.name}</div>
                            <div className="text-xs text-primary/60 font-mono">{battle.player2.rating} pts</div>
                          </div>
                          <div className="text-2xl">{battle.player2.avatar}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-4 text-xs text-primary/60 font-mono">
                        <div className="flex items-center">
                          <Timer className="w-3 h-3 mr-1" />
                          {battle.timeLeft}
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {battle.spectators}
                        </div>
                        <Badge variant="outline" className="border-primary/30 text-primary/70">
                          {battle.mode}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <Button className="w-full cyber-button" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Наблюдать
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Leaderboard Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-display font-bold text-primary mb-4">
                🏆 Таблица лидеров
              </h2>
              <p className="text-xl text-primary/60 font-mono">
                Лучшие бойцы Арены
              </p>
            </motion.div>
            
            <div className="max-w-4xl mx-auto">
              <Card className="cyber-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {leaderboard.map((player, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          idx === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20' :
                          idx === 1 ? 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 border border-gray-500/20' :
                          idx === 2 ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20' :
                          'bg-black/20'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-display font-bold text-primary">
                            #{player.rank}
                          </div>
                          <div className="text-2xl">{player.avatar}</div>
                          <div>
                            <div className="font-display text-primary">{player.name}</div>
                            <div className="text-xs text-primary/60 font-mono">
                              {player.wins}W / {player.losses}L
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="text-lg font-display font-bold text-primary">
                              {player.rating}
                            </div>
                            <div className="text-xs text-primary/60 font-mono">Рейтинг</div>
                          </div>
                          {getTrendIcon(player.trend)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Tournaments Section */}
        <section className="py-16 bg-gradient-to-b from-transparent to-primary/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-display font-bold text-primary mb-4">
                🎯 Турниры
              </h2>
              <p className="text-xl text-primary/60 font-mono">
                Участвуйте в регулярных турнирах с призовыми фондами
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentTournaments.map((tournament, idx) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="cyber-card relative overflow-hidden">
                    <div className="absolute top-4 right-4">
                      <Badge 
                        className={
                          tournament.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          tournament.status === 'upcoming' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }
                      >
                        {tournament.status === 'completed' ? 'Завершен' :
                         tournament.status === 'upcoming' ? 'Предстоящий' : 'Активный'}
                      </Badge>
                    </div>
                    
                    <CardHeader>
                      <div className="flex items-center mb-4">
                        <Trophy className="w-8 h-8 text-primary mr-3" />
                        <CardTitle className="text-xl text-white">
                          {tournament.name}
                        </CardTitle>
                      </div>
                      
                      <div className="space-y-2 text-sm text-primary/70 font-mono">
                        <div className="flex justify-between">
                          <span>Дата:</span>
                          <span className="text-primary">{tournament.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Участники:</span>
                          <span className="text-primary">{tournament.participants}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Призовой фонд:</span>
                          <span className="text-primary">{tournament.prize}</span>
                        </div>
                        {tournament.winner !== 'TBA' && (
                          <div className="flex justify-between">
                            <span>Победитель:</span>
                            <span className="text-primary">{tournament.winner}</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <Button 
                        className="w-full cyber-button" 
                        variant={tournament.status === 'upcoming' ? 'default' : 'outline'}
                        disabled={!isAuthenticated || tournament.status === 'completed'}
                      >
                        {tournament.status === 'upcoming' ? 'Зарегистрироваться' : 'Подробнее'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
