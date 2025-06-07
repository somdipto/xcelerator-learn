
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1A1A] border-[#2C2C2C]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-500/20 rounded-full p-3">
              <Shield className="h-8 w-8 text-red-400" />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-white">
            Access Denied
          </CardTitle>
          <p className="text-[#E0E0E0]">
            You don't have permission to access this page
          </p>
        </CardHeader>

        <CardContent className="text-center">
          <p className="text-[#999999] mb-6">
            This page requires specific permissions that your account doesn't have. 
            Please contact an administrator if you believe this is an error.
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-[#2979FF] hover:bg-[#2979FF]/90 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
            
            <Button
              onClick={() => navigate('/teacher-login')}
              variant="outline"
              className="w-full border-[#424242] text-[#E0E0E0] hover:bg-[#2C2C2C]"
            >
              Teacher Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;
