"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import Link from 'next/link';

interface Meme {
  id: number;
  user: string;
  image: string | null;
  image_url: string | null;
  caption: string | null;
  upvote: number;
  downvote: number;
  userVote?: 'upvote' | 'downvote' | null;
}

export default function MemeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user, isAuthenticated } = useAuth();
  const [meme, setMeme] = useState<Meme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!meme) return;

    try {
      const res = await axios.post(`/memes/${meme.id}/${voteType}/`);
      
      setMeme({
        ...meme,
        upvote: res.data.upvote,
        downvote: res.data.downvote,
        userVote: meme.userVote === voteType ? null : voteType,
      });
    } catch (err) {
      console.error("Failed to vote", err);
    }
  };

  useEffect(() => {
    const fetchMeme = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/memes/${id}/`);
        setMeme(res.data);
        setError("");
      } catch (err) {
        setError("Meme not found.");
        setMeme(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMeme();
  }, [id]);

  if (loading) return <div className="flex justify-center py-12">Loading...</div>;
  if (error) return <div className="flex justify-center py-12 text-red-500">{error}</div>;
  if (!meme) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-12 px-4">
        <div className="flex w-full max-w-4xl items-start gap-8">
            <div className="mt-8 flex-shrink-0">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md hover:bg-gray-200 transition-colors duration-200 text-black"
                    aria-label="Go back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-xl p-8 w-full">
                <div className="mb-4 text-lg font-semibold text-gray-800">
                By:{" "}
                <Link 
                    href={user && user.username === meme.user ? '/profile' : `/users/${meme.user}`}
                    className="text-blue-600 hover:underline"
                >
                    {meme.user}
                </Link>
                </div>
                {meme.image ? (
                <img src={meme.image} alt={meme.caption || ''} className="w-full h-auto object-contain mb-4 max-h-[70vh]" />
                ) : meme.image_url ? (
                <img src={meme.image_url} alt={meme.caption || ''} className="w-full h-auto object-contain mb-4 max-h-[70vh]" />
                ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center mb-4">No Image</div>
                )}
                <div className="flex items-center justify-between">
                    <p className="text-gray-700 text-lg">{meme.caption}</p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleVote('upvote')}
                            className={`flex items-center justify-center gap-2 p-2 rounded-full transition-colors ${meme.userVote === 'upvote' ? 'text-orange-500 bg-orange-100' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06l-6.22-6.22V21a.75.75 0 01-1.5 0V4.81L4.03 11.03a.75.75 0 01-1.06-1.06l7.5-7.5z" clipRule="evenodd" />
                            </svg>
                            <span className="text-lg font-bold">{meme.upvote}</span>
                        </button>
                        <button
                            onClick={() => handleVote('downvote')}
                            className={`flex items-center justify-center gap-2 p-2 rounded-full transition-colors ${meme.userVote === 'downvote' ? 'text-blue-500 bg-blue-100' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M12.53 21.53a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L11.25 19.19V3a.75.75 0 011.5 0v16.19l6.22-6.22a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
                            </svg>
                            <span className="text-lg font-bold">{meme.downvote}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
} 