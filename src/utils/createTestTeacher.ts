import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to create a test teacher account
 * This can be used for testing purposes
 */
export const createTestTeacher = async () => {
  const testEmail = 'teacher@test.com';
  const testPassword = 'teacher123';
  const testName = 'Test Teacher';

  try {
    console.log('Creating test teacher account...');
    
    // First, try to sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName,
          role: 'teacher'
        }
      }
    });

    if (signUpError) {
      console.error('Sign up error:', signUpError);
      
      // If user already exists, try to sign in
      if (signUpError.message.includes('already registered')) {
        console.log('User already exists, trying to sign in...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        });

        if (signInError) {
          console.error('Sign in error:', signInError);
          return { success: false, error: signInError.message };
        }

        console.log('Sign in successful:', signInData);
        return { success: true, data: signInData, message: 'Signed in to existing account' };
      }
      
      return { success: false, error: signUpError.message };
    }

    if (signUpData.user) {
      console.log('Sign up successful:', signUpData);
      
      // Create or update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: signUpData.user.id,
          email: testEmail,
          full_name: testName,
          role: 'teacher'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { success: false, error: profileError.message };
      }

      console.log('Profile created successfully');
      return { 
        success: true, 
        data: signUpData, 
        message: 'Test teacher account created successfully' 
      };
    }

    return { success: false, error: 'Unknown error occurred' };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

/**
 * Check if test teacher exists and create if not
 */
export const ensureTestTeacher = async () => {
  try {
    // Try to sign in first
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'teacher@test.com',
      password: 'teacher123'
    });

    if (!error && data.user) {
      console.log('Test teacher already exists and can sign in');
      await supabase.auth.signOut(); // Sign out after test
      return { success: true, message: 'Test teacher account is ready' };
    }

    // If sign in failed, create the account
    return await createTestTeacher();
  } catch (error) {
    console.error('Error checking test teacher:', error);
    return { success: false, error: 'Failed to check test teacher' };
  }
};

/**
 * Get test teacher credentials for easy reference
 */
export const getTestTeacherCredentials = () => {
  return {
    email: 'teacher@test.com',
    password: 'teacher123',
    name: 'Test Teacher'
  };
};
