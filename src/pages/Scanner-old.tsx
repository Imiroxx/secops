import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { 
  Search, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Globe, 
  Lock, 
  Eye, 
  Download,
  RefreshCw,
  Copy,
  ExternalLink,
  Code,
  Database,
  Key,
  Bug,
  Terminal,
  Activity,
  Clock,
  TrendingUp,
  Filter,
  Zap,
  Target,
  Award,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function Scanner() {
  const { isAuthenticated } = useAuth();
  const [url, setUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{
    url: string;
    vulnerabilities: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    scanTime: string;
  } | null>(null);
  const [showVerification, setShowVerification] = useState(false);

  const recentCVEs = [
    {
      id: "CVE-2024-1234",
      severity: "critical",
      description: "Remote Code Execution in Apache Struts",
      affected: "Apache Struts 2.5.30",
      published: "2024-01-15",
      cvss: 9.8
    },
    {
      id: "CVE-2024-5678",
      severity: "high",
      description: "SQL Injection in WordPress Plugin",
      affected: "WordPress Plugin XYZ 1.2.3",
      published: "2024-01-14",
      cvss: 8.5
    },
    {
      id: "CVE-2024-9012",
      severity: "medium",
      description: "Cross-Site Scripting in React App",
      affected: "React 18.2.0",
      published: "2024-01-13",
      cvss: 6.1
    }
  ];

  const scanStats = {
    totalCVEs: "234,567",
    newToday: "142",
    critical: "1,234",
    high: "5,678",
    medium: "12,345",
    low: "215,310"
  };

  const vulnerabilityCategories = [
    { name: "SQL Injection", count: 45678, icon: <Database className="w-5 h-5" />, color: "from-red-500/20 to-orange-500/20" },
    { name: "XSS", count: 34234, icon: <Code className="w-5 h-5" />, color: "from-yellow-500/20 to-amber-500/20" },
    { name: "CSRF", count: 23456, icon: <ExternalLink className="w-5 h-5" />, color: "from-blue-500/20 to-cyan-500/20" },
    { name: "RCE", count: 12345, icon: <Terminal className="w-5 h-5" />, color: "from-purple-500/20 to-pink-500/20" },
    { name: "Authentication", count: 34567, icon: <Lock className="w-5 h-5" />, color: "from-green-500/20 to-emerald-500/20" },
    { name: "Information Disclosure", count: 84567, icon: <Eye className="w-5 h-5" />, color: "from-gray-500/20 to-slate-500/20" }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "critical": return "Критический";
      case "high": return "Высокий";
      case "medium": return "Средний";
      case "low": return "Низкий";
      default: return severity;
    }
  };

  const handleScan = () => {
    if (!isAuthenticated) {
      setShowVerification(true);
      return;
    }
    
    setIsScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      setScanResults({
        url: url,
        vulnerabilities: 12,
        critical: 2,
        high: 3,
        medium: 4,
        low: 3,
        scanTime: "2.3s"
      });
    }, 3000);
  };

  const generateVerificationCode = () => {
    const code = `sec-ver-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setVerificationCode(code);
  };

  return (
    <Layout>
      <div className="min-h-screen relative">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center mb-6">
                <Search className="w-16 h-16 text-primary mr-4" />
                <h1 className="text-5xl md:text-6xl font-display font-bold text-primary">
                  🔍 Сканер уязвимостей
                </h1>
              </div>
              <p className="text-xl text-primary/70 font-mono mb-8 max-w-2xl mx-auto">
                Комплексный сканер всех существующих уязвимостей CVE с проверкой владения сайтом
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                <div className="cyber-card p-3 text-center">
                  <div className="text-lg font-display font-bold text-primary">{scanStats.totalCVEs}</div>
                  <div className="text-xs text-primary/60 font-mono">Всего CVE</div>
                </div>
                <div className="cyber-card p-3 text-center">
                  <div className="text-lg font-display font-bold text-primary">{scanStats.newToday}</div>
                  <div className="text-xs text-primary/60 font-mono">Новых сегодня</div>
                </div>
                <div className="cyber-card p-3 text-center">
                  <div className="text-lg font-display font-bold text-red-400">{scanStats.critical}</div>
                  <div className="text-xs text-primary/60 font-mono">Критических</div>
                </div>
                <div className="cyber-card p-3 text-center">
                  <div className="text-lg font-display font-bold text-orange-400">{scanStats.high}</div>
                  <div className="text-xs text-primary/60 font-mono">Высоких</div>
                </div>
                <div className="cyber-card p-3 text-center">
                  <div className="text-lg font-display font-bold text-yellow-400">{scanStats.medium}</div>
                  <div className="text-xs text-primary/60 font-mono">Средних</div>
                </div>
                <div className="cyber-card p-3 text-center">
                  <div className="text-lg font-display font-bold text-blue-400">{scanStats.low}</div>
                  <div className="text-xs text-primary/60 font-mono">Низких</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Scanner Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary flex items-center">
                    <Target className="w-6 h-6 mr-3" />
                    Сканирование веб-сайта
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* URL Input */}
                  <div className="space-y-2">
                    <label className="text-primary/80 font-mono text-sm uppercase tracking-wider">
                      URL веб-сайта
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="cyber-input flex-1"
                      />
                      <Button
                        onClick={handleScan}
                        disabled={!url || isScanning}
                        className="cyber-button"
                      >
                        {isScanning ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Сканирование...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            Сканировать
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Website Verification */}
                  {!isAuthenticated && (
                    <div className="cyber-card p-6 bg-black/40 border border-primary/30">
                      <h3 className="text-lg font-display text-primary mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Проверка владения сайтом
                      </h3>
                      <p className="text-primary/70 font-mono text-sm mb-4">
                        Для сканирования веб-сайта необходимо подтвердить, что вы являетесь его владельцем. 
                        Разместите следующий код на главной странице вашего сайта:
                      </p>
                      
                      {verificationCode ? (
                        <div className="space-y-4">
                          <div className="bg-black/60 border border-primary/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-primary/60 font-mono">Код верификации:</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigator.clipboard.writeText(verificationCode)}
                                className="border-primary/30 text-primary/70"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Копировать
                              </Button>
                            </div>
                            <code className="text-primary font-mono text-sm break-all">
                              {verificationCode}
                            </code>
                          </div>
                          
                          <div className="bg-black/40 border border-primary/20 rounded-lg p-4">
                            <p className="text-primary/60 font-mono text-sm mb-2">
                              HTML код для размещения на сайте:
                            </p>
                            <code className="text-primary/80 font-mono text-xs block bg-black/60 p-3 rounded border border-primary/20">
                              {`<!-- SecOps Verification -->\n<meta name="secops-verification" content="${verificationCode}" />`}
                            </code>
                          </div>
                          
                          <Button
                            onClick={() => setShowVerification(false)}
                            className="cyber-button w-full"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Код размещен, начать сканирование
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={generateVerificationCode}
                          className="cyber-button"
                        >
                          <Key className="w-4 h-4 mr-2" />
                          Сгенерировать код верификации
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Scan Results */}
                  {scanResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="cyber-card p-6 bg-black/40 border border-primary/30"
                    >
                      <h3 className="text-lg font-display text-primary mb-4 flex items-center">
                        <Activity className="w-5 h-5 mr-2" />
                        Результаты сканирования
                      </h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-display font-bold text-primary">{scanResults.vulnerabilities}</div>
                          <div className="text-xs text-primary/60 font-mono">Всего уязвимостей</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-display font-bold text-red-400">{scanResults.critical}</div>
                          <div className="text-xs text-primary/60 font-mono">Критических</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-display font-bold text-orange-400">{scanResults.high}</div>
                          <div className="text-xs text-primary/60 font-mono">Высоких</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-display font-bold text-yellow-400">{scanResults.medium}</div>
                          <div className="text-xs text-primary/60 font-mono">Средних</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-display font-bold text-blue-400">{scanResults.low}</div>
                          <div className="text-xs text-primary/60 font-mono">Низких</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button className="cyber-button flex-1">
                          <Download className="w-4 h-4 mr-2" />
                          Скачать отчет
                        </Button>
                        <Button variant="outline" className="cyber-button border-primary/30">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Повторить
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Recent CVEs */}
        <section className="py-16 bg-gradient-to-b from-transparent to-primary/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-display font-bold text-primary mb-4">
                🚨 Последние уязвимости
              </h2>
              <p className="text-xl text-primary/60 font-mono">
                Самые свежие CVE из базы данных
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {recentCVEs.map((cve, idx) => (
                <motion.div
                  key={cve.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="cyber-card relative overflow-hidden">
                    <div className="absolute top-4 right-4">
                      <Badge className={getSeverityColor(cve.severity)}>
                        {getSeverityText(cve.severity)}
                      </Badge>
                    </div>
                    
                    <CardHeader>
                      <div className="flex items-center mb-4">
                        <Bug className="w-8 h-8 text-primary mr-3" />
                        <CardTitle className="text-lg text-primary font-mono">
                          {cve.id}
                        </CardTitle>
                      </div>
                      
                      <p className="text-primary/80 font-mono text-sm mb-4">
                        {cve.description}
                      </p>
                      
                      <div className="space-y-2 text-xs text-primary/60 font-mono">
                        <div className="flex justify-between">
                          <span>Затронуто:</span>
                          <span className="text-primary/80">{cve.affected}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Опубликовано:</span>
                          <span className="text-primary/80">{cve.published}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CVSS Score:</span>
                          <span className={`font-bold ${
                            cve.cvss >= 9 ? 'text-red-400' :
                            cve.cvss >= 7 ? 'text-orange-400' :
                            cve.cvss >= 4 ? 'text-yellow-400' : 'text-blue-400'
                          }`}>{cve.cvss}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <Button variant="outline" className="cyber-button w-full border-primary/30">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Подробнее
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Vulnerability Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-display font-bold text-primary mb-4">
                📊 Категории уязвимостей
              </h2>
              <p className="text-xl text-primary/60 font-mono">
                Распределение уязвимостей по типам
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vulnerabilityCategories.map((category, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className={`cyber-card relative overflow-hidden cursor-pointer group`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    <CardContent className="relative z-10 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-full bg-black/50 border border-primary/30 group-hover:border-primary transition-colors">
                          <div className="text-primary">{category.icon}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-display font-bold text-primary">
                            {category.count.toLocaleString()}
                          </div>
                          <div className="text-xs text-primary/60 font-mono">уязвимостей</div>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-display text-primary group-hover:text-primary/80 transition-colors">
                        {category.name}
                      </h3>
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
