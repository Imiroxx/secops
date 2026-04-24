import { Layout } from "../components/Layout";
import { useAuth } from "../hooks/use-auth";
import { useCourses } from "../hooks/use-courses";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { 
  BookOpen, Shield, Globe, Terminal, Cpu, Key, Target,
  Clock, Search, Play
} from "lucide-react";

export default function Courses() {
  const { isAuthenticated } = useAuth();
  const { courses, loading } = useCourses();
  const [searchTerm, setSearchTerm] = useState("");

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return <Shield className="w-8 h-8" />;
      case 'Globe': return <Globe className="w-8 h-8" />;
      case 'Terminal': return <Terminal className="w-8 h-8" />;
      case 'Cpu': return <Cpu className="w-8 h-8" />;
      case 'Key': return <Key className="w-8 h-8" />;
      case 'Target': return <Target className="w-8 h-8" />;
      default: return <BookOpen className="w-8 h-8" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "intermediate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "advanced": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "beginner": return "Начальный";
      case "intermediate": return "Средний";
      case "advanced": return "Продвинутый";
      default: return level;
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <Layout>
      <div className="min-h-screen relative">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-5xl lg:text-6xl font-display font-bold text-primary mb-6">
                Образовательные <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">курсы</span>
              </h1>
              <p className="text-xl text-primary/70 font-mono mb-8 max-w-2xl mx-auto">
                Изучайте кибербезопасность с экспертами. От основ до продвинутых техник.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-8 pb-20">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="ml-3 text-primary font-mono">Загрузка курсов...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course, idx) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="cyber-card h-full group cursor-pointer overflow-hidden relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${course.color || 'from-primary/20 to-cyan-500/20'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      
                      <CardHeader className="relative z-10">
                        {course.image && (
                          <div className="w-full h-40 mb-4 rounded-lg overflow-hidden border border-primary/20">
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-full bg-black/50 border border-primary/30">
                            <div className="text-primary">{getIcon(course.icon || 'BookOpen')}</div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge className={getLevelColor(course.level)}>
                              {getLevelText(course.level)}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardTitle className="text-xl text-white group-hover:text-primary transition-colors mb-2">
                          {course.title}
                        </CardTitle>
                        
                        <p className="text-primary/70 font-mono text-sm mb-4">
                          {course.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-primary/60 font-mono">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {course.duration}
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="w-3 h-3 mr-1" />
                            {course.totalLessons || course.lessons?.length || 0} уроков
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="relative z-10">
                        <div className="mb-4">
                          <div className="text-xs text-primary/60 font-mono mb-2">Навыки:</div>
                          <div className="flex flex-wrap gap-1">
                            {course.skills?.slice(0, 3).map((skill, skillIdx) => (
                              <Badge key={skillIdx} variant="outline" className="text-xs border-primary/20 text-primary/60">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {isAuthenticated && course.progress > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-primary/60 font-mono mb-1">
                              <span>Прогресс</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Link href={`/courses/${course.id}`}>
                            <Button className="cyber-button flex-1">
                              <Play className="w-4 h-4 mr-2" />
                              {course.progress > 0 ? 'Продолжить' : 'Начать'}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                
                {filteredCourses.length === 0 && (
                  <div className="text-center py-20 col-span-3">
                    <div className="cyber-card p-8 max-w-md mx-auto">
                      <Search className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                      <h3 className="text-xl font-display text-primary mb-2">Курсы не найдены</h3>
                      <p className="text-primary/60 font-mono">Попробуйте изменить параметры поиска</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
