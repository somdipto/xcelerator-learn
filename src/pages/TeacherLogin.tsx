
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { GraduationCap, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const TeacherLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate login process
    setTimeout(() => {
      if (email && password) {
        localStorage.setItem('teacherAuth', 'true');
        localStorage.setItem('teacherData', JSON.stringify({
          email,
          name: 'Teacher',
          loginTime: new Date().toISOString()
        }));
        
        toast({
          title: "Login Successful! 👩‍🏫",
          description: "Welcome to the Teacher CMS Dashboard",
        });
        
        navigate('/teacher-dashboard');
      } else {
        toast({
          title: "Login Failed",
          description: "Please enter valid credentials",
        });
      }
      setLoading(false);
    }, 1000);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1A1A] border-[#2C2C2C]">
        <CardHeader className="text-center">
          <Button
            onClick={handleBackToHome}
            variant="ghost"
            className="absolute top-4 left-4 text-[#E0E0E0] hover:text-[#00E676]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex justify-center mb-4">
            <div className="bg-[#2979FF] rounded-full p-3">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-white">
            Teacher Portal
          </CardTitle>
          <p className="text-[#E0E0E0]">
            Login to access the Content Management System
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#E0E0E0]">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#121212] border-[#424242] text-white placeholder:text-[#666666] focus:border-[#2979FF]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#E0E0E0]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#121212] border-[#424242] text-white placeholder:text-[#666666] focus:border-[#2979FF] pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-[#666666] hover:text-[#E0E0E0]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#2979FF] hover:bg-[#2979FF]/90 text-white"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In to CMS'}
            </Button>

            <div className="text-center pt-4">
              <Button
                type="button"
                variant="link"
                className="text-[#666666] hover:text-[#00E676] text-sm"
                onClick={() => toast({
                  title: "Contact Administrator",
                  description: "Please contact your school administrator for password reset"
                })}
              >
                Forgot password?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherLogin;
