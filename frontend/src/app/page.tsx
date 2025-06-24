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
  upvote: number;
  downvote: number;
  created_at: string;
  userVote?: 'upvote' | 'downvote' | null;
}

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [view, setView] = useState<'all' | 'mine'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'trending'>('newest');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleVote = async (meme: Meme, voteType: 'upvote' | 'downvote') => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const res = await axios.post(`/memes/${meme.id}/${voteType}/`);
      
      setMemes(memes.map(m =>
        m.id === meme.id
          ? {
              ...m,
              upvote: res.data.upvote,
              downvote: res.data.downvote,
              userVote: meme.userVote === voteType ? null : voteType,
            }
          : m
      ));
    } catch (err) {
      console.error("Failed to vote", err);
    }
  };

  const sortMemes = (memesToSort: Meme[]) => {
    if (sortBy === 'newest') {
      return [...memesToSort].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      return [...memesToSort].sort((a, b) => (b.upvote - b.downvote) - (a.upvote - a.downvote));
    }
  };

  useEffect(() => {
    const fetchMemes = async () => {
      setLoading(true);
      try {
        let url = "/memes/";
        if (view === "mine" && isAuthenticated) {
          const profile = await axios.get("/profile/");
          url =`/memes/user/${profile.data.username}/`;
        }
        const res = await axios.get(url);
        const sortedMemes = sortMemes(res.data);
        setMemes(sortedMemes);
      } catch (err) {
        setMemes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMemes();
  }, [view, isAuthenticated]);

  // Re-sort when sortBy changes
  useEffect(() => {
    setMemes(prevMemes => sortMemes(prevMemes));
  }, [sortBy]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="flex gap-4">
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
        
        <div className="flex items-center gap-2">
          <span className="text-gray-700 font-medium">Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'trending')}
              className="appearance-none bg-white border border-gray-300 rounded px-4 py-2 pr-8 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="trending">Trending</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
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
                className="bg-white rounded-lg shadow hover:shadow-lg overflow-hidden flex flex-row"
              >
                <div className="flex-grow flex flex-col">
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

                <div className="flex flex-col items-center justify-center p-2 bg-gray-100 w-16">
                  <button
                    onClick={() => handleVote(meme, 'upvote')}
                    className={`flex items-center justify-center p-1 rounded-full transition-colors ${meme.userVote === 'upvote' ? 'text-orange-500 bg-orange-100' : 'text-gray-500 hover:bg-gray-200'}`}
                    aria-label="Upvote"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06l-6.22-6.22V21a.75.75 0 01-1.5 0V4.81L4.03 11.03a.75.75 0 01-1.06-1.06l7.5-7.5z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span className="font-bold text-gray-800 my-1">{meme.upvote - meme.downvote}</span>
                  <button
                    onClick={() => handleVote(meme, 'downvote')}
                    className={`flex items-center justify-center p-1 rounded-full transition-colors ${meme.userVote === 'downvote' ? 'text-blue-500 bg-blue-100' : 'text-gray-500 hover:bg-gray-200'}`}
                    aria-label="Downvote"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M12.53 21.53a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L11.25 19.19V3a.75.75 0 011.5 0v16.19l6.22-6.22a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}