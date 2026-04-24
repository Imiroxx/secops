import { useState, useEffect } from 'react';

export interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  lessons: Lesson[];
  progress: number;
  completedLessons: number;
  totalLessons: number;
  started: boolean;
  icon: string;
  color: string;
  skills: string[];
  price?: string;
  enrolled?: number;
  rating?: number;
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (courseId: number, lessonId: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      if (!response.ok) throw new Error('Failed to update progress');
      
      // Refresh courses after update
      await fetchCourses();
      return true;
    } catch (err) {
      console.error('Error updating progress:', err);
      return false;
    }
  };

  const getCourseDetails = async (courseId: number): Promise<Course | null> => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch course');
      return await response.json();
    } catch (err) {
      console.error('Error fetching course:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
    updateProgress,
    getCourseDetails
  };
}
