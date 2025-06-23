"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import Link from 'next/link';

interface Meme {
  id: number;
  user: string;
  image: string | null;
  image_url: string | null;
  caption: string | null;
}

const BACKEND_URL = 'http://localhost:8000';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { username } = params;
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) return;

    const fetchUserMemes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/memes/user/${username}/`);
        setMemes(response.data);
        if(response.data.length === 0){
          setError(`No memes found for user ${username}.`);
        }
      } catch (err) {
        console.error('Failed to fetch user memes', err);
        setError(`Could not find user: ${username}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMemes();
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (error && memes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container py-12 mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Memes by {username}
        </h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {memes.map((meme) => (
            <div
              key={meme.id}
              className="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer overflow-hidden"
              onClick={() => router.push(`/memes/${meme.id}`)}
            >
              {meme.image ? (
                <img src={meme.image} alt={meme.user} className="w-full h-52 object-cover" />
              ) : meme.image_url ? (
                <img src={meme.image_url} alt={meme.user} className="w-full h-52 object-cover" />
              ) : (
                <div className="w-full h-52 bg-gray-200 flex items-center justify-center">No Image</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 