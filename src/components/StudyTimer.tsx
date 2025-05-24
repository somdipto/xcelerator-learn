
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { toast } from '@/hooks/use-toast';

interface StudyTimerProps {
  subject?: string;
  chapter?: string;
  onSessionEnd?: (duration: number) => void;
}

const StudyTimer = ({ subject = 'General', chapter = 'Study Session', onSessionEnd }: StudyTimerProps) => {
  const { isStudying, currentSession, elapsedTime, startStudySession, pauseStudySession, endStudySession, formatTime } = useStudyTimer();

  const handleStart = () => {
    startStudySession(subject, chapter);
    toast({
      title: "Study Session Started! 📚",
      description: `Tracking your progress on ${subject} - ${chapter}`,
    });
  };

  const handlePause = () => {
    pauseStudySession();
    toast({
      title: "Study Session Paused ⏸️",
      description: "Take a break! Resume when you're ready.",
    });
  };

  const handleEnd = () => {
    const duration = endStudySession();
    const minutes = Math.floor(duration / 60);
    const points = minutes * 5;
    
    toast({
      title: "Great Job! 🎉",
      description: `You studied for ${minutes} minutes and earned ${points} points!`,
    });
    
    if (onSessionEnd) {
      onSessionEnd(duration);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-[#00E676]/10 to-[#2979FF]/10 border-[#00E676]/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-[#00E676]" />
            <div>
              <div className="font-semibold text-white">
                {isStudying ? 'Studying Now' : 'Ready to Study'}
              </div>
              {currentSession && (
                <div className="text-sm text-[#E0E0E0]">
                  {currentSession.subject} - {currentSession.chapter}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-[#00E676]">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-xs text-[#E0E0E0]">
                {isStudying ? 'Active' : 'Timer'}
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isStudying && !currentSession && (
                <Button
                  onClick={handleStart}
                  className="bg-[#00E676] hover:bg-[#00E676]/90 text-black"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}
              
              {isStudying && (
                <Button
                  onClick={handlePause}
                  variant="outline"
                  className="border-[#FFA726] text-[#FFA726] hover:bg-[#FFA726]/10"
                  size="sm"
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              )}
              
              {currentSession && !isStudying && (
                <Button
                  onClick={handleStart}
                  className="bg-[#2979FF] hover:bg-[#2979FF]/90 text-white"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
              )}
              
              {currentSession && (
                <Button
                  onClick={handleEnd}
                  variant="outline"
                  className="border-[#FF7043] text-[#FF7043] hover:bg-[#FF7043]/10"
                  size="sm"
                >
                  <Square className="h-4 w-4 mr-1" />
                  End
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyTimer;
