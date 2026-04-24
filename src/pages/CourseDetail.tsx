import { Layout } from "../components/Layout";
import { useAuth } from "../hooks/use-auth";
import { useCourses } from "../hooks/use-courses";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { 
  BookOpen, Shield, Globe, Terminal, Cpu, Key, Target,
  Clock, CheckCircle, Play, ArrowLeft, Lock
} from "lucide-react";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CourseDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { courses, loading, getCourseDetails, updateProgress } = useCourses();
  const [course, setCourse] = useState<any>(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<number | null>(null);

  useEffect(() => {
    const loadCourse = async () => {
      if (id) {
        const courseId = parseInt(id);
        const found = courses.find(c => c.id === courseId);
        if (found) {
          setCourse(found);
        } else {
          const details = await getCourseDetails(courseId);
          setCourse(details);
        }
      }
      setCourseLoading(false);
    };
    loadCourse();
  }, [id, courses, getCourseDetails]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return <Shield className="w-12 h-12" />;
      case 'Globe': return <Globe className="w-12 h-12" />;
      case 'Terminal': return <Terminal className="w-12 h-12" />;
      case 'Cpu': return <Cpu className="w-12 h-12" />;
      case 'Key': return <Key className="w-12 h-12" />;
      case 'Target': return <Target className="w-12 h-12" />;
      default: return <BookOpen className="w-12 h-12" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-emerald-500/20 text-emerald-400";
      case "intermediate": return "bg-yellow-500/20 text-yellow-400";
      case "advanced": return "bg-red-500/20 text-red-400";
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

  const handleLessonComplete = async (lessonId: number) => {
    if (!id) return;
    const success = await updateProgress(parseInt(id), lessonId, true);
    if (success) {
      const updated = await getCourseDetails(parseInt(id));
      setCourse(updated);
    }
  };

  const openLesson = (lessonId: number) => {
    setActiveLesson(lessonId);
  };

  const closeLesson = () => {
    setActiveLesson(null);
  };

  const goToNextLesson = () => {
    if (activeLesson !== null && course?.lessons) {
      const currentIndex = course.lessons.findIndex((l: any) => l.id === activeLesson);
      if (currentIndex < course.lessons.length - 1) {
        setActiveLesson(course.lessons[currentIndex + 1].id);
      }
    }
  };

  const goToPrevLesson = () => {
    if (activeLesson !== null && course?.lessons) {
      const currentIndex = course.lessons.findIndex((l: any) => l.id === activeLesson);
      if (currentIndex > 0) {
        setActiveLesson(course.lessons[currentIndex - 1].id);
      }
    }
  };

  if (loading || courseLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-primary font-mono">Загрузка курса...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-display text-primary mb-4">Курс не найден</h1>
            <Link href="/courses">
              <Button className="cyber-button">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад к курсам
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen relative">
        {/* Hero */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            <Link href="/courses">
              <Button variant="outline" className="mb-6 border-primary/30 hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад к курсам
              </Button>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <div className="flex items-start gap-6 mb-6">
                <div className="p-4 rounded-2xl bg-primary/20 text-primary">
                  {getIcon(course.icon || 'BookOpen')}
                </div>
                <div className="flex-1">
                  <Badge className={`${getLevelColor(course.level)} mb-3`}>
                    {getLevelText(course.level)}
                  </Badge>
                  <h1 className="text-4xl font-display font-bold text-white mb-3">
                    {course.title}
                  </h1>
                  <p className="text-primary/70 font-mono text-lg">
                    {course.description}
                  </p>
                </div>
              </div>

              {isAuthenticated && course.progress > 0 && (
                <div className="bg-black/40 border border-primary/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-primary font-mono">Ваш прогресс</span>
                    <span className="text-primary font-bold">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-3" />
                  <p className="text-sm text-primary/60 mt-2">
                    {course.completedLessons || 0} из {course.totalLessons || course.lessons?.length || 0} уроков завершено
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {course.skills?.map((skill: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="border-primary/30 text-primary/70">
                    {skill}
                  </Badge>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Lessons */}
        <section className="py-8 pb-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-2xl font-display text-primary mb-6">Уроки курса ({course.lessons?.length || 0})</h2>
              
              <div className="space-y-4">
                {course.lessons?.map((lesson: any, idx: number) => (
                  <Card 
                    key={lesson.id} 
                    className={`cyber-card ${lesson.completed ? 'border-emerald-500/30' : ''} ${activeLesson === lesson.id ? 'ring-2 ring-primary' : ''}`}
                  >
                    <CardContent className="p-6">
                      {activeLesson === lesson.id ? (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between border-b border-primary/20 pb-4">
                            <div>
                              <h3 className="text-xl font-display text-white">{idx + 1}. {lesson.title}</h3>
                              <p className="text-primary/60 text-sm font-mono">{lesson.duration}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={goToPrevLesson} disabled={idx === 0}>
                                <ChevronLeft className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={goToNextLesson} disabled={idx === course.lessons.length - 1}>
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={closeLesson}>
                                Закрыть
                              </Button>
                            </div>
                          </div>
                          
                          {lesson.videoUrl && (
                            <div className="aspect-video bg-black/50 rounded-lg overflow-hidden">
                              <iframe 
                                src={lesson.videoUrl} 
                                className="w-full h-full"
                                allowFullScreen
                                title={lesson.title}
                              />
                            </div>
                          )}
                          
                          {lesson.content && (
                            <div 
                              className="prose prose-invert max-w-none prose-headings:text-primary prose-h3:text-lg prose-h3:font-display prose-h4:text-base prose-code:text-emerald-400 prose-pre:bg-black/50 prose-pre:border prose-pre:border-primary/20 prose-pre:p-4"
                              dangerouslySetInnerHTML={{ __html: lesson.content }}
                            />
                          )}
                          
                          <div className="flex items-center justify-between pt-4 border-t border-primary/20">
                            <Button variant="outline" onClick={closeLesson}>
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              Назад к списку
                            </Button>
                            
                            {isAuthenticated ? (
                              <Button 
                                variant={lesson.completed ? "outline" : "default"}
                                className={lesson.completed ? 'border-emerald-500/30 text-emerald-400' : 'cyber-button'}
                                onClick={() => !lesson.completed && handleLessonComplete(lesson.id)}
                                disabled={lesson.completed}
                              >
                                {lesson.completed ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Урок завершен
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Отметить как пройденный
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Link href="/auth">
                                <Button variant="outline" className="border-primary/30">
                                  <Lock className="w-4 h-4 mr-2" />
                                  Войти для прогресса
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              lesson.completed 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-primary/20 text-primary'
                            }`}>
                              {lesson.completed ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <Play className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-white font-medium">
                                {idx + 1}. {lesson.title}
                              </h3>
                              <p className="text-primary/60 text-sm font-mono">
                                {lesson.duration}
                              </p>
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline"
                            size="sm"
                            className="border-primary/30 hover:bg-primary/10"
                            onClick={() => openLesson(lesson.id)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {lesson.completed ? 'Повторить' : 'Начать'}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
