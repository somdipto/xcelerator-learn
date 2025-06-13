
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RefreshCw, TrendingUp, FileText, Globe, Users } from 'lucide-react';
import { googleDriveService } from '@/services/googleDriveService';

interface ContentAnalyticsProps {
  teacherId: string;
}

const ContentAnalytics: React.FC<ContentAnalyticsProps> = ({ teacherId }) => {
  const [analytics, setAnalytics] = useState({
    totalContent: 0,
    byType: {},
    bySubject: {},
    recentUploads: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [teacherId]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await googleDriveService.getContentAnalytics(teacherId);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const typeChartData = Object.entries(analytics.byType).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    fill: getTypeColor(type)
  }));

  const subjectChartData = Object.entries(analytics.bySubject).map(([subject, count]) => ({
    name: subject,
    count: count
  }));

  function getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      textbook: '#2979FF',
      video: '#00E676',
      summary: '#FFA726',
      ppt: '#FF7043',
      quiz: '#9C27B0'
    };
    return colors[type] || '#666666';
  }

  const getTypeIcon = (type: string) => {
    const iconMap = {
      textbook: '📚',
      video: '🎥',
      summary: '📝',
      ppt: '📊',
      quiz: '🏆'
    };
    return iconMap[type as keyof typeof iconMap] || '📄';
  };

  if (isLoading) {
    return (
      <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00E676] mx-auto mb-4"></div>
            <p className="text-[#E0E0E0]">Loading analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-[#2979FF]" />
              <div>
                <div className="text-2xl font-bold text-white">{analytics.totalContent}</div>
                <div className="text-sm text-[#999999]">Total Content</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-[#00E676]" />
              <div>
                <div className="text-2xl font-bold text-white">{analytics.totalContent}</div>
                <div className="text-sm text-[#999999]">Universal Access</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-[#FFA726]" />
              <div>
                <div className="text-2xl font-bold text-white">{analytics.recentUploads}</div>
                <div className="text-sm text-[#999999]">This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-[#9C27B0]" />
              <div>
                <div className="text-2xl font-bold text-white">{Object.keys(analytics.bySubject).length}</div>
                <div className="text-sm text-[#999999]">Subjects</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content by Type */}
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Content by Type</span>
              <Button
                onClick={loadAnalytics}
                variant="ghost"
                size="sm"
                className="text-[#2979FF] hover:bg-[#2979FF]/10"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-[#666666]">
                No content data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content by Subject */}
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-white">Content by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={subjectChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#424242" />
                  <XAxis dataKey="name" tick={{ fill: '#E0E0E0' }} />
                  <YAxis tick={{ fill: '#E0E0E0' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#2C2C2C', 
                      border: '1px solid #424242',
                      color: '#E0E0E0'
                    }} 
                  />
                  <Bar dataKey="count" fill="#00E676" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-[#666666]">
                No subject data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Type Breakdown */}
      <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="text-white">Content Type Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(analytics.byType).map(([type, count]) => (
              <div key={type} className="bg-[#121212] rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">{getTypeIcon(type)}</div>
                <div className="text-xl font-bold text-white">{count}</div>
                <div className="text-sm text-[#999999] capitalize">{type}</div>
                <div className="text-xs text-[#00E676] mt-1">Universal Access</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentAnalytics;
