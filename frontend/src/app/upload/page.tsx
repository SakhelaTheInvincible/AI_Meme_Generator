"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  CloudArrowUpIcon, 
  PhotoIcon, 
  LinkIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function UploadMemePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview(null);
    }
  }, [image]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setImage(file);
        setUploadMode('file');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" variant="pulse" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const formData = new FormData();
      if (uploadMode === 'file') {
        if (!image) {
          setError("Please select an image file.");
          setLoading(false);
          return;
        }
        formData.append("image", image);
      } else {
        if (!imageUrl) {
          setError("Please provide an image URL.");
          setLoading(false);
          return;
        }
        formData.append("image_url", imageUrl);
      }
      
      await axios.post("/memes/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });
      
      router.push("/");
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError("Processing is taking longer than expected. Please check your memes later.");
      } else {
        setError(err?.response?.data?.detail || "Upload failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-60 h-60 bg-purple-400 rounded-full opacity-10 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-400 rounded-full opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card variant="glass" className="overflow-hidden">
            <CardHeader className="text-center">
              <motion.div
                className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-6"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <CloudArrowUpIcon className="w-10 h-10 text-white" />
              </motion.div>
              <CardTitle className="text-4xl font-bold gradient-text mb-2">
                Upload Your Meme
              </CardTitle>
              <p className="text-white/70 text-lg">
                Our AI will generate hilarious captions for your image
              </p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Upload Mode Toggle */}
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-2 glass rounded-xl p-1">
                  <Button
                    variant={uploadMode === 'file' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setUploadMode('file')}
                    className="flex items-center space-x-2 relative"
                  >
                    <PhotoIcon className="w-4 h-4" />
                    <span>File Upload</span>
                    {uploadMode === 'file' && (
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg -z-10"
                        layoutId="activeUploadMode"
                      />
                    )}
                  </Button>
                  <Button
                    variant={uploadMode === 'url' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setUploadMode('url')}
                    className="flex items-center space-x-2 relative"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>Image URL</span>
                    {uploadMode === 'url' && (
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg -z-10"
                        layoutId="activeUploadMode"
                      />
                    )}
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {uploadMode === 'file' ? (
                    <motion.div
                      key="file-upload"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                          dragActive 
                            ? 'border-purple-400 bg-purple-400/10' 
                            : 'border-white/30 hover:border-white/50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        
                        {imagePreview ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                          >
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-h-64 mx-auto rounded-lg shadow-lg"
                            />
                            <div className="flex items-center justify-center space-x-2 text-green-400">
                              <CheckCircleIcon className="w-5 h-5" />
                              <span className="font-medium">Image ready for upload!</span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setImage(null)}
                            >
                              Choose Different Image
                            </Button>
                          </motion.div>
                        ) : (
                          <div className="space-y-4">
                            <motion.div
                              className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center"
                              animate={{ y: [0, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <PhotoIcon className="w-8 h-8 text-white/60" />
                            </motion.div>
                            <div>
                              <p className="text-white text-lg font-medium mb-2">
                                Drop your image here, or click to browse
                              </p>
                              <p className="text-white/60 text-sm">
                                Supports JPG, PNG, GIF up to 10MB
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="url-upload"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="relative">
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://example.com/image.png"
                          className="w-full h-12 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300"
                          required
                        />
                        <LinkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      </div>
                      {imageUrl && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center"
                        >
                          <img
                            src={imageUrl}
                            alt="URL Preview"
                            className="max-h-48 mx-auto rounded-lg shadow-lg"
                            onError={() => setError("Invalid image URL")}
                            onLoad={() => setError("")}
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200"
                  >
                    <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4 p-6 rounded-lg bg-blue-500/20 border border-blue-500/30"
                  >
                    <LoadingSpinner size="lg" variant="pulse" />
                    <div className="space-y-2">
                      <p className="text-blue-200 font-medium">
                        🧠 AI is creating amazing captions...
                      </p>
                      <p className="text-blue-200/80 text-sm">
                        This usually takes 1-2 minutes. Hang tight!
                      </p>
                    </div>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  disabled={(!image && !imageUrl) || loading}
                  className="w-full"
                  size="lg"
                >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  {loading ? "Processing with AI..." : "Upload & Generate Meme"}
                </Button>
              </form>

              {/* Info section */}
              <motion.div
                className="text-center p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-white/80 text-sm">
                  ✨ Our AI analyzes your image and creates multiple hilarious captions automatically!
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 