'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
interface UserProfile {
  username: string;
  email: string;
}

interface Meme {
  id: number;
  user: string;
  image: string | null;
  image_url: string | null;
  caption: string;
}

export default function ProfilePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [memes, setMemes] = useState<Meme[]>([]);

  useEffect(() => {
    if (authLoading) return; // Wait until auth check is done
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
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        if (user) {
          const res = await axios.get(`/memes/user/${user.username}/`);
          setMemes(res.data);
        }
      } catch (err) {
        setMemes([]);
      }
    };
    if (user) fetchMemes();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">Loading...</p>
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
        <div className="w-full max-w-6xl mx-auto mt-8 text-center">
          <h2 className="text-3xl font-bold mb-8 text-black">My Memes</h2>
          {memes.length === 0 ? (
            <div className="text-gray-500">You haven't uploaded any memes yet.</div>
          ) : (
            <div className="flex flex-wrap justify-center gap-8">
              {memes.map((meme) => (
                <div
                  key={meme.id}
                  className="w-80 bg-white rounded-lg shadow hover:shadow-lg cursor-pointer overflow-hidden"
                  onClick={() => router.push(/memes/${meme.id})}
                >
                  {meme.image ? (
                    <img src={meme.image} alt="My Meme" className="w-full h-60 object-cover" />
                  ) : meme.image_url ? (
                    <img src={meme.image_url} alt="My Meme" className="w-full h-60 object-cover" />
                  ) : (
                    <div className="w-full h-60 bg-gray-200 flex items-center justify-center">No Image</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
