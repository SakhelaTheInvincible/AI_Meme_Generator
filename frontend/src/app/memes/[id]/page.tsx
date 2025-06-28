"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { VoteControls } from '@/components/ui/VoteButton';
import { formatTimeAgo } from '@/lib/utils';
import { 
  ArrowLeftIcon, 
  UserIcon,
  CalendarIcon,
  EyeIcon 
} from '@heroicons/react/24/outline';

interface Meme {
  id: number;
  user: string;
  image: string | null;
  image_url: string | null;
  caption: string | null;
  upvote: number;
  downvote: number;
  created_at?: string;
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="xl" variant="pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">😿</div>
          <h2 className="text-2xl font-bold text-white mb-2">Meme Not Found</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <Button onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!meme) return null;

  return (
    <div className="min-h-screen py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-40 w-96 h-96 bg-purple-400 rounded-full opacity-10 animate-float"></div>
        <div className="absolute bottom-40 left-40 w-80 h-80 bg-pink-400 rounded-full opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Back Button */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="glass"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </motion.div>

          <Card variant="glass" className="overflow-hidden">
            {/* Header */}
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <Link
                  href={user && user.username === meme.user ? '/profile' : `/users/${meme.user}`}
                  className="flex items-center space-x-3 group hover:bg-white/10 rounded-lg p-2 -m-2 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                      {meme.user}
                    </h2>
                    {meme.created_at && (
                      <div className="flex items-center space-x-1 text-white/60 text-sm">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatTimeAgo(meme.created_at)}</span>
                      </div>
                    )}
                  </div>
                </Link>


              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Image Section */}
                <div className="flex-1 p-6">
                  <motion.div
                    className="relative group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    {meme.image ? (
                      <img 
                        src={meme.image} 
                        alt={meme.caption || 'Meme'} 
                        className="w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" 
                      />
                    ) : meme.image_url ? (
                      <img 
                        src={meme.image_url} 
                        alt={meme.caption || 'Meme'} 
                        className="w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" 
                      />
                    ) : (
                      <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500 text-lg">No Image Available</p>
                      </div>
                    )}
                  </motion.div>


                </div>

                {/* Vote Section */}
                <div className="lg:w-48 p-6 border-t lg:border-t-0 lg:border-l border-white/10">
                  <div className="flex lg:flex-col items-center justify-center h-full space-x-4 lg:space-x-0 lg:space-y-6">
                    <VoteControls
                      upvotes={meme.upvote}
                      downvotes={meme.downvote}
                      userVote={meme.userVote}
                      onVote={handleVote}
                      disabled={!isAuthenticated}
                      orientation="vertical"
                    />

                    {/* Share Section */}
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <p className="text-white/60 text-sm mb-2">Share this meme</p>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(window.location.href)}
                        >
                          Copy Link
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 