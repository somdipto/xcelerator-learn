import { useState, useEffect } from 'react';

interface UserProgress {
  totalStudyTime: number;
  totalPoints: number;
  totalLessons: number;
  streak: number;
  lastStudied: number;
  subjects: {
    [key: string]: {
      studyTime: number;
      points: number;
      lessons: number;
      progress: number;
    }
  };
}

export const useProgress = () => {
  const [progress, setProgress] = useState<UserProgress>({
    totalStudyTime: 0,
    totalPoints: 0,
    totalLessons: 0,
    streak: 0,
    lastStudied: 0,
    subjects: {}
  });

  const loadProgress = () => {
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      setProgress(parsed);
      return parsed;
    }
    return progress;
  };

  const updateStreak = () => {
    const today = new Date();
    const lastStudiedDate = new Date(progress.lastStudied);
    const daysDiff = Math.floor((today.getTime() - lastStudiedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let newStreak = progress.streak;
    
    if (daysDiff === 1) {
      // Consecutive day
      newStreak = progress.streak + 1;
    } else if (daysDiff > 1) {
      // Streak broken
      newStreak = 1;
    }
    // daysDiff === 0 means same day, keep streak
    
    return newStreak;
  };

  const getStudyHours = () => {
    return Math.floor(progress.totalStudyTime / 3600);
  };

  const getStudyMinutes = () => {
    return Math.floor((progress.totalStudyTime % 3600) / 60);
  };

  const getSubjectProgress = (subject: string) => {
    return progress.subjects[subject] || {
      studyTime: 0,
      points: 0,
      lessons: 0,
      progress: 0
    };
  };

  const getTodayStudyTime = () => {
    const today = new Date().toDateString();
    const sessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
    
    const todaySessions = sessions.filter((session: any) => {
      const sessionDate = new Date(session.startTime).toDateString();
      return sessionDate === today;
    });
    
    return todaySessions.reduce((total: number, session: any) => total + session.duration, 0);
  };

  const resetProgress = () => {
    const emptyProgress = {
      totalStudyTime: 0,
      totalPoints: 0,
      totalLessons: 0,
      streak: 0,
      lastStudied: 0,
      subjects: {}
    };
    
    localStorage.setItem('userProgress', JSON.stringify(emptyProgress));
    localStorage.setItem('studySessions', JSON.stringify([]));
    setProgress(emptyProgress);
  };

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadProgress();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    progress,
    loadProgress,
    updateStreak,
    getStudyHours,
    getStudyMinutes,
    getSubjectProgress,
    getTodayStudyTime,
    resetProgress
  };
};
