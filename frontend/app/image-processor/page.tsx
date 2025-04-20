'use client';

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import serverClient from '@/utils/supabase/server';

export default function ImageProcessor() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Create object URL for original image
      const originalImageUrl = URL.createObjectURL(file);
      setOriginalImage(originalImageUrl);

      // Upload original image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded image
      const { data: { publicUrl: originalPublicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      // Process image (add text)
      const img = new window.Image();
      img.src = originalImageUrl;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }
        
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Add "processed" text
        ctx.font = '48px Arial';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add text with outline for better visibility
        const text = 'PROCESSED';
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        
        // Convert to URL
        const processedImageUrl = canvas.toDataURL('image/jpeg');
        setProcessedImage(processedImageUrl);

        // Upload processed image to Supabase
        const processedFileName = `processed_${fileName}`;
        const processedBlob = await fetch(processedImageUrl).then(res => res.blob());
        const { data: processedUploadData, error: processedUploadError } = await supabase.storage
          .from('images')
          .upload(processedFileName, processedBlob);

        if (processedUploadError) throw processedUploadError;

        // Get public URL for processed image
        const { data: { publicUrl: processedPublicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(processedFileName);

        // Store metadata in database using server client
        const { error: dbError } = await serverClient
          .from('images')
          .insert([
            {
              original_url: originalPublicUrl,
              processed_url: processedPublicUrl
            }
          ]);

        if (dbError) throw dbError;
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Image Processor
          </h1>
          
          {/* Upload Section */}
          <div className="mb-8">
            <label className="block">
              <span className="sr-only">Choose image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
            </div>
          )}

          {/* Images Display */}
          {(originalImage || processedImage) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Original Image */}
              {originalImage && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Original Image</h2>
                  <div className="relative aspect-square">
                    <Image
                      src={originalImage}
                      alt="Original"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Processed Image */}
              {processedImage && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Processed Image</h2>
                  <div className="relative aspect-square">
                    <Image
                      src={processedImage}
                      alt="Processed"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 