
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Video, Calendar, Clock, Users, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const LiveClassManager = () => {
  const [newClass, setNewClass] = useState({
    title: '',
    subject: '',
    date: '',
    time: '',
    duration: 60
  });

  const upcomingClasses = [
    {
      id: 1,
      title: 'Mathematics - Quadratic Equations',
      subject: 'Mathematics',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: 60,
      students: 25
    },
    {
      id: 2,
      title: 'Physics - Laws of Motion',
      subject: 'Physics',
      date: '2024-01-16',
      time: '2:00 PM',
      duration: 45,
      students: 30
    }
  ];

  const handleScheduleClass = () => {
    if (!newClass.title || !newClass.date || !newClass.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields"
      });
      return;
    }

    toast({
      title: "Class Scheduled",
      description: `${newClass.title} has been scheduled successfully`
    });

    setNewClass({
      title: '',
      subject: '',
      date: '',
      time: '',
      duration: 60
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Live Class Manager</h1>
        <p className="text-[#E0E0E0]">Schedule and manage live classes for your students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule New Class */}
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Schedule New Class
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="class-title" className="text-[#E0E0E0]">Class Title</Label>
              <Input
                id="class-title"
                value={newClass.title}
                onChange={(e) => setNewClass({...newClass, title: e.target.value})}
                className="bg-[#121212] border-[#424242] text-white"
                placeholder="e.g., Introduction to Calculus"
              />
            </div>

            <div>
              <Label htmlFor="subject" className="text-[#E0E0E0]">Subject</Label>
              <Input
                id="subject"
                value={newClass.subject}
                onChange={(e) => setNewClass({...newClass, subject: e.target.value})}
                className="bg-[#121212] border-[#424242] text-white"
                placeholder="e.g., Mathematics"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-[#E0E0E0]">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newClass.date}
                  onChange={(e) => setNewClass({...newClass, date: e.target.value})}
                  className="bg-[#121212] border-[#424242] text-white"
                />
              </div>
              <div>
                <Label htmlFor="time" className="text-[#E0E0E0]">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newClass.time}
                  onChange={(e) => setNewClass({...newClass, time: e.target.value})}
                  className="bg-[#121212] border-[#424242] text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration" className="text-[#E0E0E0]">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={newClass.duration}
                onChange={(e) => setNewClass({...newClass, duration: parseInt(e.target.value)})}
                className="bg-[#121212] border-[#424242] text-white"
                min="15"
                max="180"
              />
            </div>

            <Button
              onClick={handleScheduleClass}
              className="w-full bg-[#2979FF] hover:bg-[#2979FF]/90 text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Class
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Classes */}
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Video className="h-5 w-5" />
              Upcoming Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingClasses.map((cls) => (
                <div key={cls.id} className="bg-[#121212] p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">{cls.title}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-[#E0E0E0]">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {cls.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {cls.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {cls.students} students
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {cls.duration} mins
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="bg-[#00E676] hover:bg-[#00E676]/90 text-black">
                      Start Class
                    </Button>
                    <Button size="sm" variant="outline" className="border-[#424242] text-[#E0E0E0]">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveClassManager;
