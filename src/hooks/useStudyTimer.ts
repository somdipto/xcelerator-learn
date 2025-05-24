import { useState, useEffect, useRef } from 'react';

interface StudySession {
  subject: string;
  chapter: string;
  startTime: number;
  duration: number;
}

export const useStudyTimer = () => {
  const [isStudying, setIsStudying] = useState(false);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (currentSession) {
        if (document.hidden) {
          // Page is hidden (user left the app), pause timer
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsStudying(false);
        } else {
          // Page is visible again, resume timer if there's an active session
          if (!isStudying && currentSession) {
            setIsStudying(true);
            intervalRef.current = setInterval(() => {
              setElapsedTime(prev => prev + 1);
            }, 1000);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentSession, isStudying]);

  const startStudySession = (subject: string, chapter: string) => {
    const session: StudySession = {
      subject,
      chapter,
      startTime: Date.now(),
      duration: 0
    };
    
    setCurrentSession(session);
    setIsStudying(true);
    setElapsedTime(0);
    
    // Start timer only if page is visible
    if (!document.hidden) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
  };

  const pauseStudySession = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsStudying(false);
  };

  const resumeStudySession = () => {
    if (currentSession && !isStudying && !document.hidden) {
      setIsStudying(true);
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
  };

  const endStudySession = () => {
    if (currentSession && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      
      const finalDuration = Math.floor((Date.now() - currentSession.startTime) / 1000);
      
      // Save session to localStorage
      const savedSessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
      const completedSession = {
        ...currentSession,
        duration: finalDuration,
        endTime: Date.now()
      };
      
      savedSessions.push(completedSession);
      localStorage.setItem('studySessions', JSON.stringify(savedSessions));
      
      // Update total study time and points
      updateProgress(finalDuration, currentSession.subject);
      
      setCurrentSession(null);
      setIsStudying(false);
      setElapsedTime(0);
      
      return finalDuration;
    }
    return 0;
  };

  const updateProgress = (duration: number, subject: string) => {
    const existingProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    
    const studyHours = Math.floor(duration / 3600);
    const studyMinutes = Math.floor((duration % 3600) / 60);
    const pointsEarned = Math.floor(duration / 60) * 5; // 5 points per minute
    
    const updatedProgress = {
      totalStudyTime: (existingProgress.totalStudyTime || 0) + duration,
      totalPoints: (existingProgress.totalPoints || 0) + pointsEarned,
      totalLessons: (existingProgress.totalLessons || 0) + 1,
      lastStudied: Date.now(),
      subjects: {
        ...existingProgress.subjects,
        [subject]: {
          studyTime: ((existingProgress.subjects?.[subject]?.studyTime) || 0) + duration,
          points: ((existingProgress.subjects?.[subject]?.points) || 0) + pointsEarned,
          lessons: ((existingProgress.subjects?.[subject]?.lessons) || 0) + 1
        }
      }
    };
    
    localStorage.setItem('userProgress', JSON.stringify(updatedProgress));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isStudying,
    currentSession,
    elapsedTime,
    startStudySession,
    pauseStudySession,
    resumeStudySession,
    endStudySession,
    formatTime
  };
};
