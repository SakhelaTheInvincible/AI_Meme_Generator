'use client';

import { useState } from 'react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  UserIcon, 
  LockClosedIcon, 
  SparklesIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/login/', { username, password });
      await login(response.data);
      router.push('/profile');
    } catch (error: any) {
      setError(error?.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Card variant="glass" className="overflow-hidden">
          <CardHeader className="text-center pb-2">
            <motion.div
              className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-4"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <SparklesIcon className="w-8 h-8 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold gradient-text">
              Welcome Back
            </CardTitle>
            <p className="text-white/70 mt-2">
              Sign in to your account to continue creating amazing memes
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  label="Username"
                  icon={<UserIcon className="w-5 h-5" />}
                  required
                  error={error && !username ? 'Username is required' : ''}
                />

                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    label="Password"
                    icon={<LockClosedIcon className="w-5 h-5" />}
                    required
                    error={error && !password ? 'Password is required' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-white/60">
                  Don't have an account?
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link href="/register">
                Create New Account
              </Link>
            </Button>

            {/* Demo hint */}
            <motion.div
              className="text-center p-3 rounded-lg bg-blue-500/20 border border-blue-500/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="text-blue-200 text-sm">
                💡 <strong>Quick Demo:</strong> Just sign up to explore all features!
              </p>
            </motion.div>
          </CardContent>
        </Card>

        {/* Back to home link */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/" className="text-white/60 hover:text-white transition-colors text-sm">
            ← Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
} 
