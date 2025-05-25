
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, TrendingUp, Clock } from 'lucide-react';

const StudentAnalytics = () => {
  const studentData = [
    { name: 'Arjun Sharma', grade: 10, progress: 85, studyTime: 45, lastActive: '2 hours ago' },
    { name: 'Priya Patel', grade: 10, progress: 92, studyTime: 52, lastActive: '1 hour ago' },
    { name: 'Rahul Kumar', grade: 10, progress: 78, studyTime: 38, lastActive: '3 hours ago' },
    { name: 'Anita Singh', grade: 10, progress: 88, studyTime: 41, lastActive: '30 mins ago' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Student Analytics</h1>
        <p className="text-[#E0E0E0]">Monitor student progress and engagement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-[#00E676]" />
              <div>
                <div className="text-2xl font-bold text-white">152</div>
                <div className="text-sm text-[#E0E0E0]">Total Students</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-[#2979FF]" />
              <div>
                <div className="text-2xl font-bold text-white">78%</div>
                <div className="text-sm text-[#E0E0E0]">Avg Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-[#FFA726]" />
              <div>
                <div className="text-2xl font-bold text-white">42m</div>
                <div className="text-sm text-[#E0E0E0]">Avg Study Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-[#E91E63]" />
              <div>
                <div className="text-2xl font-bold text-white">94%</div>
                <div className="text-sm text-[#E0E0E0]">Engagement</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="text-white">Student Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2C2C2C]">
                  <th className="text-left py-3 text-[#E0E0E0]">Student Name</th>
                  <th className="text-left py-3 text-[#E0E0E0]">Grade</th>
                  <th className="text-left py-3 text-[#E0E0E0]">Progress</th>
                  <th className="text-left py-3 text-[#E0E0E0]">Study Time</th>
                  <th className="text-left py-3 text-[#E0E0E0]">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {studentData.map((student, index) => (
                  <tr key={index} className="border-b border-[#2C2C2C]">
                    <td className="py-3 text-white">{student.name}</td>
                    <td className="py-3 text-[#E0E0E0]">Class {student.grade}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#2C2C2C] rounded-full h-2">
                          <div 
                            className="bg-[#00E676] h-2 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-white text-sm">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-[#E0E0E0]">{student.studyTime}m</td>
                    <td className="py-3 text-[#E0E0E0]">{student.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAnalytics;
