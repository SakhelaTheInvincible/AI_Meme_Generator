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
}

export default function MemeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();
  const [meme, setMeme] = useState<Meme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            </div>
        </div>
    </div>
  );
} 
