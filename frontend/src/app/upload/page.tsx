"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function UploadMemePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">Loading...</p>
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
      } else { // url mode
        if (!imageUrl) {
          setError("Please provide an image URL.");
          setLoading(false);
          return;
        }
        formData.append("image_url", imageUrl);
      }
      
      await axios.post("/memes/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000, // 2 minutes timeout for AI processing
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
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-12">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6 ">Upload Meme</h1>
        <div className="flex justify-center mb-6 border-b">
          <button 
              className={`px-4 py-2 text-lg font-medium ${uploadMode === 'file' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setUploadMode('file')}
          >
              File Upload
          </button>
          <button 
              className={`px-4 py-2 text-lg font-medium ${uploadMode === 'url' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setUploadMode('url')}
          >
              URL
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {uploadMode === 'file' ? (
            <div>
              <label className="block mb-2 font-medium text-gray-600">Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setImage(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-gray-700
                  hover:file:bg-blue-100"
              />
            </div>
          ) : (
            <div>
              <label className="block mb-2 font-medium text-gray-600">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="block w-full border rounded px-3 py-2 text-gray-600"
                placeholder="https://example.com/image.png"
                required
              />
            </div>
          )}
          {error && <div className="text-red-500 text-center">{error}</div>}
          {loading && (
            <div className="text-center text-blue-600">
              <div className="mb-2">AI is generating meme captions...</div>
              <div className="text-sm text-gray-500">This may take up to 2 minutes</div>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Processing with AI..." : "Upload & Generate Meme"}
          </button>
        </form>
      </div>
    </div>
  );
} 