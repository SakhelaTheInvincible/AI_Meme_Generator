"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { VoteControls } from '@/components/ui/VoteButton';
import { formatTimeAgo } from '@/lib/utils';
import { 
  UserIcon, 
  PhotoIcon,
  TrophyIcon,
  FireIcon,
  ClockIcon,
  EyeIcon,
  ArrowLeftIcon
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
  caption: string | null;
  upvote: number;
  downvote: number;
  created_at: string;
  userVote?: 'upvote' | 'downvote' | null;
}

const BACKEND_URL = 'http://localhost:8000';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { username } = params;
  const { isAuthenticated } = useAuth();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'trending'>('newest');

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
    if (!username) return;

    const fetchUserMemes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/memes/user/${username}/`);
        const sortedMemes = sortMemes(response.data);
        setMemes(sortedMemes);
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

  useEffect(() => {
    setMemes(prevMemes => sortMemes(prevMemes));
  }, [sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" variant="pulse" />
      </div>
    );
  }

  const totalUpvotes = memes.reduce((sum, meme) => sum + meme.upvote, 0);
  const totalScore = memes.reduce((sum, meme) => sum + (meme.upvote - meme.downvote), 0);

  return (
    <div className="min-h-screen py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 bg-purple-400 rounded-full opacity-10 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-400 rounded-full opacity-10 animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
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

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <Card variant="glass">
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="w-12 h-12 text-white" />
              </div>
              <CardTitle className="text-4xl font-bold gradient-text mb-2">
                {username}
              </CardTitle>
              <p className="text-white/70">Meme Creator</p>
            </CardHeader>

            {memes.length > 0 && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <motion.div
                    className="p-4 rounded-lg bg-white/10"
                    whileHover={{ scale: 1.05 }}
                  >
                    <PhotoIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{memes.length}</div>
                    <div className="text-white/60 text-sm">Memes Created</div>
                  </motion.div>

                  <motion.div
                    className="p-4 rounded-lg bg-white/10"
                    whileHover={{ scale: 1.05 }}
                  >
                    <TrophyIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{totalUpvotes}</div>
                    <div className="text-white/60 text-sm">Total Upvotes</div>
                  </motion.div>

                  <motion.div
                    className="p-4 rounded-lg bg-white/10"
                    whileHover={{ scale: 1.05 }}
                  >
                    <FireIcon className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{totalScore}</div>
                    <div className="text-white/60 text-sm">Total Score</div>
                  </motion.div>
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* Memes Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <h2 className="text-3xl font-bold gradient-text">
              {username}'s Memes
            </h2>
            
            {memes.length > 0 && (
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
            )}
          </div>

          <AnimatePresence mode="wait">
            {error && memes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🤷‍♂️</div>
                <h3 className="text-2xl font-bold text-white mb-2">No Memes Found</h3>
                <p className="text-white/60 mb-6">{error}</p>
                <Button onClick={() => router.push('/')}>
                  Explore Other Memes
                </Button>
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
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white">
                              {meme.user}
                            </p>
                            <p className="text-xs text-white/60">
                              {formatTimeAgo(meme.created_at)}
                            </p>
                          </div>
                        </div>
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
        </motion.div>
      </div>
    </div>
  );
} 