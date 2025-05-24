
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Trophy, 
  Target, 
  Calendar, 
  BookOpen, 
  Star, 
  Settings, 
  Edit,
  Award,
  TrendingUp,
  Clock,
  RotateCcw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useProgress } from '@/hooks/useProgress';

interface ProfilePageProps {
  selectedGrade: number;
}

const ProfilePage = ({ selectedGrade }: ProfilePageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState('Student');
  const { progress, getStudyHours, getStudyMinutes, getTodayStudyTime, resetProgress } = useProgress();

  const achievements = [
    { 
      id: 1, 
      title: 'First Steps', 
      description: 'Complete your first study session', 
      icon: '🎯', 
      earned: progress.totalLessons > 0 
    },
    { 
      id: 2, 
      title: 'Time Keeper', 
      description: 'Study for 1 hour total', 
      icon: '⏰', 
      earned: getStudyHours() >= 1 
    },
    { 
      id: 3, 
      title: 'Point Collector', 
      description: 'Earn 100 points', 
      icon: '🏆', 
      earned: progress.totalPoints >= 100 
    },
    { 
      id: 4, 
      title: 'Consistent Learner', 
      description: 'Maintain 7-day streak', 
      icon: '🔥', 
      earned: progress.streak >= 7 
    }
  ];

  const recentSessions = JSON.parse(localStorage.getItem('studySessions') || '[]')
    .slice(-4)
    .reverse()
    .map((session: any) => ({
      subject: session.subject,
      chapter: session.chapter,
      duration: Math.floor(session.duration / 60), // Convert to minutes
      date: new Date(session.endTime).toLocaleDateString()
    }));

  const handleEditProfile = () => {
    if (isEditing) {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleResetProgress = () => {
    resetProgress();
    toast({
      title: "Progress Reset",
      description: "Your learning progress has been reset to start fresh!",
    });
  };

  const todayStudyMinutes = Math.floor(getTodayStudyTime() / 60);

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-[#1A1A1A] to-[#2C2C2C] border-[#424242]">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-[#00E676]">
                <AvatarFallback className="bg-gradient-to-r from-[#00E676] to-[#2979FF] text-black font-bold text-2xl">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="bg-[#2C2C2C] text-white px-3 py-1 rounded border border-[#424242] focus:border-[#00E676] outline-none"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-white">{userName}</h1>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEditProfile}
                    className="text-[#E0E0E0] hover:text-[#00E676]"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[#E0E0E0] mb-4">Class {selectedGrade} Student</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="bg-[#00E676]/20 text-[#00E676] border-[#00E676]/30">
                    {progress.streak} Day Streak
                  </Badge>
                  <Badge className="bg-[#2979FF]/20 text-[#2979FF] border-[#2979FF]/30">
                    {progress.totalPoints} Points
                  </Badge>
                  <Badge className="bg-[#FFA726]/20 text-[#FFA726] border-[#FFA726]/30">
                    {getStudyHours()}h {getStudyMinutes()}m Total
                  </Badge>
                </div>
              </div>

              <Button
                onClick={handleResetProgress}
                variant="outline"
                className="border-[#FF7043] text-[#FF7043] hover:border-[#FF7043] hover:bg-[#FF7043]/10"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Progress
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-[#FFA726] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{progress.totalPoints}</div>
              <div className="text-sm text-[#E0E0E0]">Total Points</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-[#00E676] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{progress.totalLessons}</div>
              <div className="text-sm text-[#E0E0E0]">Sessions Done</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-[#2979FF] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{getStudyHours()}h {getStudyMinutes()}m</div>
              <div className="text-sm text-[#E0E0E0]">Study Time</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-[#FF7043] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{todayStudyMinutes}</div>
              <div className="text-sm text-[#E0E0E0]">Minutes Today</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Achievements */}
          <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-[#FFA726]" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                    achievement.earned
                      ? 'bg-[#00E676]/10 border-[#00E676]/30'
                      : 'bg-[#2C2C2C] border-[#424242]'
                  }`}
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className={`font-medium ${achievement.earned ? 'text-[#00E676]' : 'text-[#E0E0E0]'}`}>
                      {achievement.title}
                    </div>
                    <div className="text-sm text-[#E0E0E0]">{achievement.description}</div>
                  </div>
                  {achievement.earned && (
                    <Trophy className="h-5 w-5 text-[#FFA726]" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Study Sessions */}
          <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#2979FF]" />
                Recent Study Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSessions.length > 0 ? recentSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-[#2C2C2C] rounded-lg border border-[#424242] hover:border-[#00E676]/30 transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="font-medium text-white">{session.subject}</div>
                    <div className="text-sm text-[#E0E0E0]">{session.chapter}</div>
                    <div className="text-xs text-[#E0E0E0] mt-1">{session.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#00E676]">
                      {session.duration} min
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center text-[#E0E0E0] py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No study sessions yet</p>
                  <p className="text-sm">Start your first session to see it here!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subject Progress */}
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#00E676]" />
              Subject Progress - Class {selectedGrade}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { subject: 'Mathematics', color: '#00E676' },
                { subject: 'Science', color: '#2979FF' },
                { subject: 'English', color: '#FFA726' },
                { subject: 'Social Science', color: '#FF7043' },
                { subject: 'Hindi', color: '#9C27B0' }
              ].map((item) => {
                const subjectData = progress.subjects[item.subject] || { lessons: 0, studyTime: 0 };
                const progressPercentage = Math.min((subjectData.lessons / 10) * 100, 100);
                const studyHours = Math.floor(subjectData.studyTime / 3600);
                const studyMinutes = Math.floor((subjectData.studyTime % 3600) / 60);
                
                return (
                  <div key={item.subject} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">{item.subject}</span>
                      <span className="text-[#E0E0E0] text-sm">
                        {studyHours > 0 ? `${studyHours}h ` : ''}{studyMinutes}m
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                    <div className="text-xs text-[#E0E0E0]">
                      {subjectData.lessons} sessions completed
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
