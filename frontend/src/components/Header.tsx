'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { 
  UserIcon, 
  ArrowUpTrayIcon, 
  ArrowLeftStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  UserPlusIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <motion.header 
      className="sticky top-0 z-50 glass border-b border-white/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                className="p-2 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <SparklesIcon className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold gradient-text">
                  Meme Generator
                </h1>
                <p className="text-xs text-white/60 hidden sm:block">
                  Create & Share Amazing Memes
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Navigation */}
          <nav className="flex items-center space-x-2">
            {isAuthenticated ? (
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >


                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="hidden sm:flex"
                >
                  <Link href="/profile" className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </Button>

                <Button 
                  variant="secondary" 
                  size="sm" 
                  asChild
                >
                  <Link href="/upload" className="flex items-center space-x-2">
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Upload</span>
                  </Link>
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                >
                  <Link href="/login" className="flex items-center space-x-2">
                    <ArrowRightEndOnRectangleIcon className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                </Button>

                <Button 
                  variant="default" 
                  size="sm" 
                  asChild
                >
                  <Link href="/register" className="flex items-center space-x-2">
                    <UserPlusIcon className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </Button>
              </motion.div>
            )}
          </nav>
        </div>
      </div>
    </motion.header>
  );
} 