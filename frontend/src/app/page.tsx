"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { VoteControls } from '@/components/ui/VoteButton';
import { formatTimeAgo } from '@/lib/utils';
import { 
  FireIcon, 
  ClockIcon, 
  UserIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { 
  FireIcon as FireIconSolid,
  ClockIcon as ClockIconSolid 
} from '@heroicons/react/24/solid';

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.div 
        className="relative overflow-hidden py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20" />
        <div className="relative container mx-auto px-6 text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold gradient-text mb-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover Amazing Memes
          </motion.h1>
          <motion.p 
            className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Create, share, and vote on the funniest memes with our AI-powered platform
          </motion.p>
          
          {!isAuthenticated && (
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button size="xl" asChild>
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Controls */}
      <div className="container mx-auto px-6 py-8">
        <motion.div 
          className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* View Toggle */}
          <div className="flex items-center space-x-2 glass rounded-xl p-1">
            <Button
              variant={view === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('all')}
              className="relative"
            >
              All Memes
              {view === 'all' && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg -z-10"
                  layoutId="activeView"
                />
              )}
            </Button>
            {isAuthenticated && (
              <Button
                variant={view === 'mine' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('mine')}
                className="relative"
              >
                My Memes
                {view === 'mine' && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg -z-10"
                    layoutId="activeView"
                  />
                )}
              </Button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-3">
            <span className="text-white/80 font-medium">Sort by:</span>
            <div className="flex items-center space-x-2 glass rounded-xl p-1">
              <Button
                variant={sortBy === 'newest' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('newest')}
                className="flex items-center space-x-2"
              >
                {sortBy === 'newest' ? <ClockIconSolid className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}
                <span>Newest</span>
              </Button>
              <Button
                variant={sortBy === 'trending' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('trending')}
                className="flex items-center space-x-2"
              >
                {sortBy === 'trending' ? <FireIconSolid className="w-4 h-4" /> : <FireIcon className="w-4 h-4" />}
                <span>Trending</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Memes Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="h-96">
                  <div className="p-4">
                    <LoadingSkeleton lines={3} />
                  </div>
                  <div className="h-60 bg-gray-200 rounded-lg mx-4 mb-4">
                    <LoadingSpinner size="lg" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </Card>
              ))}
            </motion.div>
          ) : memes.length === 0 ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-2xl font-bold text-white mb-2">No memes found</h3>
              <p className="text-white/60 mb-6">Be the first to upload some amazing content!</p>
              {isAuthenticated && (
                <Button asChild>
                  <Link href="/upload">Upload Your First Meme</Link>
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {memes.map((meme, index) => (
                <motion.div
                  key={meme.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  layout
                >
                  <Card variant="glass" className="overflow-hidden group">
                    {/* User Header */}
                    <div className="p-4 border-b border-white/10">
                      <Link
                        href={user && user.username === meme.user ? '/profile' : `/users/${meme.user}`}
                        className="flex items-center space-x-3 group/user hover:bg-white/10 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white group-hover/user:text-purple-300 transition-colors">
                            {meme.user}
                          </p>
                          <p className="text-xs text-white/60">
                            {formatTimeAgo(meme.created_at)}
                          </p>
                        </div>
                      </Link>
                    </div>

                    {/* Image */}
                    <Link href={`/memes/${meme.id}`} className="block relative">
                      {meme.image ? (
                        <img 
                          src={meme.image} 
                          alt={meme.caption || meme.user} 
                          className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                      ) : meme.image_url ? (
                        <img 
                          src={meme.image_url} 
                          alt={meme.caption || meme.user} 
                          className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="w-full h-80 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <p className="text-gray-500">No Image</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <EyeIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </Link>

                    {/* Actions */}
                    <div className="p-4 flex justify-center">
                      <VoteControls
                        upvotes={meme.upvote}
                        downvotes={meme.downvote}
                        userVote={meme.userVote}
                        onVote={(type) => handleVote(meme, type)}
                        disabled={!isAuthenticated}
                        orientation="horizontal"
                      />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}