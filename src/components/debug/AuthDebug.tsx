import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthProvider';
import { createTestTeacher, getTestTeacherCredentials } from '@/utils/createTestTeacher';
import { toast } from '@/hooks/use-toast';

const AuthDebug: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [creating, setCreating] = useState(false);
  const testCreds = getTestTeacherCredentials();

  const handleCreateTestTeacher = async () => {
    setCreating(true);
    try {
      const result = await createTestTeacher();
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test teacher",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="bg-[#1A1A1A] border-[#2C2C2C] text-white max-w-md">
      <CardHeader>
        <CardTitle className="text-[#00E676]">Auth Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-[#E0E0E0] mb-2">Current Auth State:</h4>
          <div className="text-sm space-y-1">
            <p>Loading: <span className={loading ? 'text-yellow-400' : 'text-green-400'}>{loading ? 'Yes' : 'No'}</span></p>
            <p>User: <span className={user ? 'text-green-400' : 'text-red-400'}>{user ? 'Authenticated' : 'Not authenticated'}</span></p>
            <p>Profile: <span className={profile ? 'text-green-400' : 'text-red-400'}>{profile ? `Loaded (${profile.role})` : 'Not loaded'}</span></p>
            {user && (
              <p>Email: <span className="text-blue-400">{user.email}</span></p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-[#E0E0E0] mb-2">Test Teacher Credentials:</h4>
          <div className="text-sm space-y-1 bg-[#2C2C2C] p-3 rounded">
            <p>Email: <span className="text-blue-400">{testCreds.email}</span></p>
            <p>Password: <span className="text-blue-400">{testCreds.password}</span></p>
            <p>Name: <span className="text-blue-400">{testCreds.name}</span></p>
          </div>
        </div>

        <Button
          onClick={handleCreateTestTeacher}
          disabled={creating}
          className="w-full bg-[#2979FF] hover:bg-[#2979FF]/90"
        >
          {creating ? 'Creating...' : 'Create/Verify Test Teacher'}
        </Button>

        <div className="text-xs text-[#999999] space-y-1">
          <p>• Use the credentials above to test teacher login</p>
          <p>• Click the button to ensure test teacher exists</p>
          <p>• Check browser console for detailed logs</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthDebug;
