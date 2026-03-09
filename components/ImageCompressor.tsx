'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { Upload, Download, Image as ImageIcon, X, ArrowRight, Settings2, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageState {
  file: File;
  preview: string;
  size: number;
  compressedFile?: File;
  compressedPreview?: string;
  compressedSize?: number;
}

export default function ImageCompressor() {
  const [image, setImage] = useState<ImageState | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1920);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressImage = useCallback(async (file: File, currentQuality: number, currentMaxWidth: number) => {
    setIsCompressing(true);
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: currentMaxWidth,
        useWebWorker: true,
        initialQuality: currentQuality,
      };

      const compressedFile = await imageCompression(file, options);
      const compressedPreview = URL.createObjectURL(compressedFile);

      setImage((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          compressedFile,
          compressedPreview,
          compressedSize: compressedFile.size,
        };
      });
    } catch (error) {
      console.error('Compression failed:', error);
    } finally {
      setIsCompressing(false);
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setImage({
        file,
        preview,
        size: file.size,
      });
      compressImage(file, quality, maxWidth);
    }
  }, [compressImage, quality, maxWidth]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  const handleDownload = () => {
    if (image?.compressedFile) {
      const link = document.createElement('a');
      link.href = image.compressedPreview!;
      link.download = `compressed-${image.file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const reset = () => {
    if (image?.preview) URL.revokeObjectURL(image.preview);
    if (image?.compressedPreview) URL.revokeObjectURL(image.compressedPreview);
    setImage(null);
  };

  useEffect(() => {
    if (image?.file) {
      const timer = setTimeout(() => {
        compressImage(image.file, quality, maxWidth);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [quality, maxWidth, image?.file, compressImage]);

  const compressionRatio = image?.compressedSize && image?.size 
    ? Math.round((1 - image.compressedSize / image.size) * 100) 
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-display font-bold tracking-tight mb-4"
        >
          Image<span className="text-emerald-600">Compress</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-zinc-500 text-lg max-w-2xl mx-auto"
        >
          The fastest way to compress your images without losing quality. 
          Works entirely in your browser.
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {!image ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full"
          >
            <div
              {...getRootProps()}
              className={`
                relative group cursor-pointer
                border-2 border-dashed rounded-3xl p-16
                transition-all duration-300 ease-in-out
                flex flex-col items-center justify-center gap-6
                ${isDragActive 
                  ? 'border-emerald-500 bg-emerald-50/50' 
                  : 'border-zinc-200 hover:border-emerald-400 hover:bg-zinc-50'
                }
              `}
            >
              <input {...getInputProps()} />
              <div className={`
                w-20 h-20 rounded-2xl flex items-center justify-center
                transition-transform duration-300 group-hover:scale-110
                ${isDragActive ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}
              `}>
                <Upload size={40} />
              </div>
              <div className="text-center">
                <p className="text-xl font-medium mb-1">
                  {isDragActive ? 'Drop it here!' : 'Drag & drop your image'}
                </p>
                <p className="text-zinc-400">or click to browse from your computer</p>
              </div>
              <div className="flex gap-4 mt-4">
                {['JPG', 'PNG', 'WebP'].map(format => (
                  <span key={format} className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 text-xs font-semibold">
                    {format}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Controls Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xl flex items-center gap-2">
                    <Settings2 size={20} className="text-emerald-600" />
                    Settings
                  </h2>
                  <button 
                    onClick={reset}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-medium">
                    <label className="text-zinc-500">Quality</label>
                    <span className="text-emerald-600">{Math.round(quality * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1" 
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <p className="text-xs text-zinc-400">Lower quality results in smaller file sizes.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-medium">
                    <label className="text-zinc-500">Max Width</label>
                    <span className="text-emerald-600">{maxWidth}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="400" 
                    max="3840" 
                    step="100"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                    className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <p className="text-xs text-zinc-400">Resizing can significantly reduce file size.</p>
                </div>

                <div className="pt-4 border-t border-zinc-50 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                    <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Reduction</div>
                    <div className="text-2xl font-display font-bold text-emerald-600">
                      {isCompressing ? '...' : `-${compressionRatio}%`}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleDownload}
                    disabled={isCompressing || !image.compressedFile}
                    className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                  >
                    {isCompressing ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Download size={20} />
                        Download Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Original */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Original</span>
                    <span className="text-sm font-medium text-zinc-600">{formatSize(image.size)}</span>
                  </div>
                  <div className="aspect-square rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200 relative">
                    <img 
                      src={image.preview} 
                      alt="Original" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Compressed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Compressed</span>
                    <span className="text-sm font-medium text-emerald-600">
                      {image.compressedSize ? formatSize(image.compressedSize) : 'Processing...'}
                    </span>
                  </div>
                  <div className="aspect-square rounded-3xl overflow-hidden bg-zinc-100 border border-emerald-100 relative">
                    {isCompressing && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                        <Loader2 className="animate-spin text-emerald-600" size={32} />
                      </div>
                    )}
                    {image.compressedPreview ? (
                      <img 
                        src={image.compressedPreview} 
                        alt="Compressed" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        <ImageIcon size={48} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900">Ready for download</h3>
                  <p className="text-emerald-700/70 text-sm">
                    Your image was compressed from {formatSize(image.size)} to {image.compressedSize ? formatSize(image.compressedSize) : '...'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features Section */}
      {!image && (
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          {[
            {
              title: 'Privacy First',
              desc: 'Images are processed locally in your browser. Nothing is ever uploaded to a server.',
              icon: <ImageIcon className="text-emerald-600" />
            },
            {
              title: 'Fast & Free',
              desc: 'Instant compression with no limits. No registration or subscriptions required.',
              icon: <ArrowRight className="text-emerald-600" />
            },
            {
              title: 'Smart Optimization',
              desc: 'Advanced algorithms ensure your images look great while being much smaller.',
              icon: <Settings2 className="text-emerald-600" />
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-8 rounded-3xl bg-white border border-zinc-100 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
