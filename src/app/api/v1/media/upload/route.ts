import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { apiResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/ogg',
  'video/3gpp',
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return apiResponse.badRequest('No file uploaded. Please provide a "file" field in formData.');
    }

    const mimeType = file.type || 'application/octet-stream';
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType) || mimeType.startsWith('image/');
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType) || mimeType.startsWith('video/');

    if (!isImage && !isVideo) {
      return apiResponse.badRequest(
        `Unsupported media format (${mimeType}). Please upload a supported photo (PNG, JPG, WEBP, GIF) or video (MP4, WEBM, MOV).`
      );
    }

    // Size check
    const maxAllowed = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxAllowed) {
      const limitMb = Math.round(maxAllowed / (1024 * 1024));
      return apiResponse.badRequest(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of ${limitMb}MB for ${isVideo ? 'video' : 'photo'}.`
      );
    }

    // Prepare uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Clean filename
    const originalName = file.name || (isImage ? 'photo.png' : 'video.mp4');
    const ext = path.extname(originalName) || (isImage ? '.png' : '.mp4');
    const baseName = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const uniqueFileName = `${Date.now()}_${baseName}${ext}`;
    const targetFilePath = path.join(uploadsDir, uniqueFileName);

    // Write file to public/uploads (local or Node/Hostinger server) with serverless fallback
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let publicUrl = `/uploads/${uniqueFileName}`;

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(targetFilePath, buffer);
    } catch {
      // Fallback for serverless environments (e.g. Vercel read-only filesystem)
      publicUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    }

    return apiResponse.success(
      {
        url: publicUrl,
        fileName: originalName,
        fileSize: file.size,
        mimeType,
        mediaType: isVideo ? 'VIDEO' : 'IMAGE',
        uploadedAt: new Date().toISOString(),
      },
      `${isVideo ? 'Video' : 'Photo'} uploaded successfully`,
      201
    );
  } catch (error) {
    return apiResponse.handle(error, 'Media Upload API');
  }
}
