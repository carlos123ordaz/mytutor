import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { user, isLoading, login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-800">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError('No credentials received from Google.');
      return;
    }
    setLoggingIn(true);
    setError(null);
    try {
      await login(response.credential);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleError = () => {
    setError('Google sign-in failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MyTutor</h1>
            <p className="text-sm text-gray-500 mt-1">Admin Dashboard</p>
          </div>

          {/* Security badge */}
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded-lg px-4 py-3 mb-6 text-sm">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Admin access only. Unauthorized access is prohibited.</span>
          </div>

          <h2 className="text-lg font-semibold text-gray-800 mb-1 text-center">Sign in to your account</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Use your Google account to continue
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {loggingIn ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Verifying your account...</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                theme="outline"
                size="large"
                width="100%"
                text="signin_with"
                shape="rectangular"
              />
            </div>
          )}

          <p className="text-xs text-gray-400 text-center mt-6">
            Only users with admin role can access this panel.
          </p>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          &copy; {new Date().getFullYear()} MyTutor Platform
        </p>
      </div>
    </div>
  );
}
