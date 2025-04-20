'use client';

import { useState, useRef } from 'react';
import Image from "next/image";

export default function ImageUploadPage() {
  const inputFileRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [images, setImages] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async (event) => {
    event.preventDefault();
    setError(null);
    setUploadStatus('uploading');

    try {
      const file = inputFileRef.current.files[0];
      if (!file) {
        throw new Error('Please select a file');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setImages({
        original: data.originalUrl,
        processed: data.processedUrl,
        id: data.imageId
      });
      setUploadStatus('success');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      setUploadStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Image Upload & Processing</h1>

      <form onSubmit={handleUpload} className="mb-8">
        <div className="mb-4">
          <input
            name="file"
            ref={inputFileRef}
            type="file"
            accept="image/*"
            required
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        <button
          type="submit"
          disabled={uploadStatus === 'uploading'}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload & Process'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {images && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Original Image</h2>
            <div className="relative aspect-square">
              <Image
                src={images.original}
                alt="Original"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Processed Image</h2>
            <div className="relative aspect-square">
              <Image
                src={images.processed}
                alt="Processed"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
          Images uploaded and processed successfully!
        </div>
      )}
    </div>
  );
}