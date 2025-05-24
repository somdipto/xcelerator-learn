
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
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfilePageProps {
  selectedGrade: number;
}

const ProfilePage = ({ selectedGrade }: ProfilePageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState('Student');

  const userStats = {
    totalPoints: 12450,
    streak: 15,
    completedLessons: 128,
    averageScore: 87,
    studyHours: 156,
    rank: 23
  };

  const achievements = [
    { id: 1, title: 'Math Master', description: 'Completed all algebra chapters', icon: '🧮', earned: true },
    { id: 2, title: 'Speed Reader', description: 'Read 10 chapters in a week', icon: '📚', earned: true },
    { id: 3, title: 'Quiz Champion', description: 'Score 90+ in 5 consecutive quizzes', icon: '🏆', earned: false },
    { id: 4, title: 'Consistent Learner', description: 'Maintain 30-day streak', icon: '🔥', earned: false }
  ];

  const recentActivity = [
    { subject: 'Mathematics', chapter: 'Quadratic Equations', score: 92, date: '2 hours ago' },
    { subject: 'Science', chapter: 'Light and Reflection', score: 88, date: '1 day ago' },
    { subject: 'English', chapter: 'Grammar Basics', score: 95, date: '2 days ago' },
    { subject: 'Social Science', chapter: 'Indian Constitution', score: 85, date: '3 days ago' }
  ];

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
    toast({
      title: "Reset Progress",
      description: "This action would reset your learning progress. Feature coming soon!",
    });
  };

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
                    Rank #{userStats.rank}
                  </Badge>
                  <Badge className="bg-[#2979FF]/20 text-[#2979FF] border-[#2979FF]/30">
                    {userStats.streak} Day Streak
                  </Badge>
                  <Badge className="bg-[#FFA726]/20 text-[#FFA726] border-[#FFA726]/30">
                    {userStats.totalPoints} Points
                  </Badge>
                </div>
              </div>

              <Button
                onClick={handleResetProgress}
                variant="outline"
                className="border-[#424242] text-[#E0E0E0] hover:border-[#00E676] hover:text-[#00E676]"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-[#FFA726] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{userStats.totalPoints}</div>
              <div className="text-sm text-[#E0E0E0]">Total Points</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-[#00E676] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{userStats.completedLessons}</div>
              <div className="text-sm text-[#E0E0E0]">Lessons Done</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-[#2979FF] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{userStats.averageScore}%</div>
              <div className="text-sm text-[#E0E0E0]">Average Score</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-[#FF7043] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{userStats.studyHours}</div>
              <div className="text-sm text-[#E0E0E0]">Study Hours</div>
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

          {/* Recent Activity */}
          <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#2979FF]" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-[#2C2C2C] rounded-lg border border-[#424242] hover:border-[#00E676]/30 transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="font-medium text-white">{activity.subject}</div>
                    <div className="text-sm text-[#E0E0E0]">{activity.chapter}</div>
                    <div className="text-xs text-[#E0E0E0] mt-1">{activity.date}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      activity.score >= 90 ? 'text-[#00E676]' :
                      activity.score >= 75 ? 'text-[#FFA726]' : 'text-[#FF7043]'
                    }`}>
                      {activity.score}%
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
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
                { subject: 'Mathematics', progress: 78, color: '#00E676' },
                { subject: 'Science', progress: 65, color: '#2979FF' },
                { subject: 'English', progress: 82, color: '#FFA726' },
                { subject: 'Social Science', progress: 71, color: '#FF7043' },
                { subject: 'Hindi', progress: 89, color: '#9C27B0' }
              ].map((item) => (
                <div key={item.subject} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{item.subject}</span>
                    <span className="text-[#E0E0E0]">{item.progress}%</span>
                  </div>
                  <Progress 
                    value={item.progress} 
                    className="h-3"
                    style={{
                      backgroundColor: '#2C2C2C',
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
