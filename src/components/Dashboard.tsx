
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, PlayCircle, Trophy, Calendar, TrendingUp, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DashboardProps {
  selectedGrade: number;
}

const Dashboard = ({ selectedGrade }: DashboardProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleContinueTopic = (topic: string) => {
    toast({
      title: "Continuing Lesson",
      description: `Opening ${topic}...`,
    });
  };

  const handleContinueLearning = () => {
    toast({
      title: "Resuming Lesson",
      description: "Opening Mathematics - Quadratic Equations",
    });
  };

  const handleTakeChallenge = () => {
    toast({
      title: "Daily Challenge",
      description: "Starting your daily practice questions!",
    });
  };

  const featuredTopics = [
    {
      title: 'Mathematics - Algebra',
      description: 'Master linear equations and quadratic formulas',
      progress: 75,
      image: '🧮',
      duration: '45 min'
    },
    {
      title: 'Science - Physics',
      description: 'Explore the laws of motion and energy',
      progress: 60,
      image: '⚡',
      duration: '30 min'
    },
    {
      title: 'English - Grammar',
      description: 'Perfect your language skills',
      progress: 85,
      image: '📝',
      duration: '25 min'
    }
  ];

  const weeklyStats = {
    streak: 7,
    pointsEarned: 1250,
    lessonsCompleted: 12,
    nextGoal: 'Complete 5 more lessons to unlock achievement!'
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#121212] p-6 border-b border-[#2C2C2C]">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            {getGreeting()}! 👋
          </h1>
          <p className="text-[#E0E0E0] text-lg mb-6">
            Ready to continue your Class {selectedGrade} journey?
          </p>
          
          {/* Weekly Progress Card */}
          <Card className="bg-[#1A1A1A] border-[#2C2C2C] mb-6 hover:border-[#00E676]/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#00E676] flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Your Week at a Glance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-[#121212] rounded-lg">
                  <div className="text-2xl font-bold text-[#00E676] mb-1">{weeklyStats.streak}</div>
                  <div className="text-sm text-[#E0E0E0]">Day Streak</div>
                </div>
                <div className="text-center p-3 bg-[#121212] rounded-lg">
                  <div className="text-2xl font-bold text-[#2979FF] mb-1">{weeklyStats.pointsEarned}</div>
                  <div className="text-sm text-[#E0E0E0]">Points Earned</div>
                </div>
                <div className="text-center p-3 bg-[#121212] rounded-lg">
                  <div className="text-2xl font-bold text-white mb-1">{weeklyStats.lessonsCompleted}</div>
                  <div className="text-sm text-[#E0E0E0]">Lessons Done</div>
                </div>
                <div className="text-center p-3 bg-[#121212] rounded-lg">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-sm text-[#E0E0E0]">On Track</div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-[#00E676]/10 to-[#2979FF]/10 rounded-lg border border-[#00E676]/20">
                <p className="text-sm text-[#E0E0E0] flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#FFA726]" />
                  {weeklyStats.nextGoal}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Featured Topics Carousel */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#00E676]" />
            Featured for Class {selectedGrade}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredTopics.map((topic, index) => (
              <Card 
                key={index} 
                className="bg-[#1A1A1A] border-[#2C2C2C] hover:border-[#00E676]/50 transition-all duration-300 cursor-pointer group hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-200">
                      {topic.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-hover:text-[#00E676] transition-colors">
                        {topic.title}
                      </h3>
                      <p className="text-sm text-[#E0E0E0] mt-1">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#E0E0E0]">Progress</span>
                      <span className="text-[#00E676] font-medium">{topic.progress}%</span>
                    </div>
                    <Progress value={topic.progress} className="h-2" />
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-[#E0E0E0] flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {topic.duration}
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => handleContinueTopic(topic.title)}
                        className="bg-[#00E676] hover:bg-[#00E676]/90 text-black font-medium transition-all duration-200"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-[#2979FF]/20 to-[#1A1A1A] border-[#2979FF]/30 hover:border-[#2979FF]/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <PlayCircle className="h-12 w-12 text-[#2979FF]" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Resume Last Lesson
                    </h3>
                    <p className="text-[#E0E0E0] text-sm mb-3">
                      Mathematics - Quadratic Equations
                    </p>
                    <Progress value={45} className="h-2 mb-3" />
                    <Button 
                      onClick={handleContinueLearning}
                      className="bg-[#2979FF] hover:bg-[#2979FF]/90 text-white transition-all duration-200"
                    >
                      Continue Learning
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-[#00E676]/20 to-[#1A1A1A] border-[#00E676]/30 hover:border-[#00E676]/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Trophy className="h-12 w-12 text-[#00E676]" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Daily Challenge
                    </h3>
                    <p className="text-[#E0E0E0] text-sm mb-3">
                      Complete 3 practice questions
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-sm text-[#00E676] font-medium">2/3 completed</div>
                      <TrendingUp className="h-4 w-4 text-[#00E676]" />
                    </div>
                    <Button 
                      onClick={handleTakeChallenge}
                      className="bg-[#00E676] hover:bg-[#00E676]/90 text-black transition-all duration-200"
                    >
                      Take Challenge
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
