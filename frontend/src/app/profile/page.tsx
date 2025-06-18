'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

// A mock user data structure. Replace with your actual user data type.
interface UserProfile {
  username: string;
  email: string;
}

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/profile/');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
        // Could also redirect to login on auth error
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">Could not load profile. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container py-12 mx-auto">
        <div className="w-full max-w-2xl p-8 mx-auto space-y-6 bg-white rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold text-center text-gray-900">
            User Profile
          </h1>
          <div className="space-y-4 text-lg text-gray-800">
            <div className="p-4 rounded-lg bg-gray-50">
              <strong className="font-medium text-gray-600">Username:</strong> {user.username}
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <strong className="font-medium text-gray-600">Email:</strong> {user.email}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 