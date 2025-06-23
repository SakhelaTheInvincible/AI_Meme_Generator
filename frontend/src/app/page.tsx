"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import Link from 'next/link';

interface Meme {
  id: number;
  user: string;
  image: string | null;
  image_url: string | null;
  caption: string;
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [view, setView] = useState<'all' | 'mine'>('all');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMemes = async () => {
      setLoading(true);
      try {
        let url = "/memes/";
        if (view === "mine" && isAuthenticated) {
          const profile = await axios.get("/profile/");
          url = `/memes/user/${profile.data.username}/`;
        }
        const res = await axios.get(url);
        setMemes(res.data);
      } catch (err) {
        setMemes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMemes();
  }, [view, isAuthenticated]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="flex gap-4 mt-8">
        <button
          className={`px-4 py-2 rounded text-white ${view === 'all' ? 'bg-gray-800' : 'bg-gray-600'}`}
          onClick={() => setView('all')}
        >
          All Memes
        </button>
        {isAuthenticated && (
          <button
            className={`px-4 py-2 rounded text-white ${view === 'mine' ? 'bg-gray-800' : 'bg-gray-600'}`}
            onClick={() => setView('mine')}
          >
            My Memes
          </button>
        )}
      </div>
      <div className="w-full max-w-8xl p-8 mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">Loading...</div>
        ) : memes.length === 0 ? (
          <div className="flex justify-center py-12">No memes found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {memes.map((meme) => (
              <div
                key={meme.id}
                className="bg-white rounded-lg shadow hover:shadow-lg overflow-hidden flex flex-col"
              >
                <div className="p-2 text-center bg-gray-50">
                  <Link 
                    href={user && user.username === meme.user ? '/profile' : `/users/${meme.user}`} 
                    className="font-semibold text-gray-800 hover:underline"
                  >
                    {meme.user}
                  </Link>
                </div>
                <Link href={`/memes/${meme.id}`} className="block">
                  {meme.image ? (
                    <img src={meme.image} alt={meme.user} className="w-full h-60 object-cover" />
                  ) : meme.image_url ? (
                    <img src={meme.image_url} alt={meme.user} className="w-full h-60 object-cover" />
                  ) : (
                    <div className="w-full h-60 bg-gray-200 flex items-center justify-center">No Image</div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
