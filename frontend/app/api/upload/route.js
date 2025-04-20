import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    // Check if the request has the correct content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Please upload a file with the key "file".' },
        { status: 400 }
      );
    }

    // Generate a unique ID for this image pair
    const imageId = uuidv4();
    
    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Get file extension
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    // Create filenames with unique IDs
    const originalFilename = `original_${imageId}.${fileExt}`;
    const processedFilename = `processed_${imageId}.${fileExt}`;
    
    // Upload the original image
    const originalBlob = await put(originalFilename, buffer, {
      access: 'public',
      addRandomSuffix: false, // We already added a unique ID
    });
    
    // Process the image (add "PROCESSED" text)
    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    const { width, height } = metadata;
    
    if (!width || !height) {
      throw new Error('Could not determine image dimensions');
    }
    
    // Create SVG text overlay
    const svgText = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .title { fill: white; font-size: ${Math.max(40, Math.floor(width / 20))}px; font-weight: bold; }
        </style>
        <text x="50%" y="50%" text-anchor="middle" class="title">PROCESSED</text>
      </svg>
    `;
    
    // Process the image with Sharp
    const processedBuffer = await sharp(buffer)
      .composite([
        {
          input: Buffer.from(svgText),
          top: 0,
          left: 0,
        }
      ])
      .toBuffer();
    
    // Upload the processed image
    const processedBlob = await put(processedFilename, processedBuffer, {
      access: 'public',
      addRandomSuffix: false, // We already added a unique ID
    });
    
    // Return both image URLs and the unique ID
    return NextResponse.json({
      success: true,
      imageId,
      originalUrl: originalBlob.url,
      processedUrl: processedBlob.url
    });
    
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}