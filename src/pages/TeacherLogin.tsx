
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { GraduationCap, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const TeacherLogin = () => {
  const navigate = useNavigate();
  const { user, signIn, loading: authLoading, isTeacher, isAdmin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if already authenticated as teacher or admin
    if (user && (isTeacher || isAdmin)) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/teacher');
    }
  }, [user, isTeacher, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login for:', email);
      
      const { data, error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message);
        toast({
          title: "Login Failed",
          description: signInError.message,
          variant: "destructive",
        });
        return;
      }

      if (data?.user) {
        toast({
          title: "Login Successful! 👩‍🏫",
          description: `Welcome! Access granted to Teacher CMS Dashboard`,
        });
        
        // Navigation will happen automatically via useEffect when user state updates
      }
    } catch (err: any) {
      console.error('Login exception:', err);
      setError('An unexpected error occurred');
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          <div className="text-xs text-[#666666] mt-2 space-y-1">
            <div>Sign in with your Supabase credentials</div>
            <div>Or create a new account to get started</div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#E0E0E0]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherLogin;
