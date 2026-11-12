import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { requireRole } from '@/lib/auth';
import { CmsRepository } from '@/lib/cms/repository';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return apiResponse.badRequest('No file uploaded. Please select an image file.');
    }

    // Supported formats: PNG, JPG, JPEG, SVG, WEBP, ICO, GIF, AVIF
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/svg+xml',
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/gif',
      'image/avif',
    ];

    const isAllowedMime = allowedMimeTypes.includes(file.type.toLowerCase()) || 
      file.name.endsWith('.ico') || 
      file.name.endsWith('.png') || 
      file.name.endsWith('.svg') || 
      file.name.endsWith('.jpg') || 
      file.name.endsWith('.jpeg') || 
      file.name.endsWith('.webp');

    if (!isAllowedMime) {
      return apiResponse.badRequest(
        `Unsupported file type (${file.type}). Allowed formats: PNG, JPG, SVG, WEBP, ICO.`
      );
    }

    // Limit to 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return apiResponse.badRequest('File size exceeds the 10MB maximum limit.');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Determine extension
    let ext = path.extname(file.name) || '';
    if (!ext) {
      if (file.type.includes('svg')) ext = '.svg';
      else if (file.type.includes('png')) ext = '.png';
      else if (file.type.includes('webp')) ext = '.webp';
      else if (file.type.includes('icon')) ext = '.ico';
      else ext = '.jpg';
    }

    const safeBaseName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueFileName = `${safeBaseName}_${Date.now()}${ext}`;

    let fileUrl: string;

    try {
      // Attempt saving to local filesystem (works on local dev & Hostinger VPS/cPanel/Node server)
      const targetDir = path.join(process.cwd(), 'public', 'uploads', folder);
      await fs.promises.mkdir(targetDir, { recursive: true });
      const filePath = path.join(targetDir, uniqueFileName);
      await fs.promises.writeFile(filePath, buffer);
      fileUrl = `/uploads/${folder}/${uniqueFileName}`;
    } catch {
      // Fallback for serverless environments (e.g. Vercel read-only filesystem)
      // Base64 Data URL provides 100% universal compatibility for logos, favicons, and banners
      const mime = file.type || (ext === '.ico' ? 'image/x-icon' : ext === '.svg' ? 'image/svg+xml' : 'image/png');
      fileUrl = `data:${mime};base64,${buffer.toString('base64')}`;
    }

    // Register in CMS Media Library
    const saved = await CmsRepository.saveMediaItem({
      fileName: file.name,
      fileUrl,
      mimeType: file.type || 'image/png',
      fileSize: file.size,
      folder,
      altText: file.name,
    });

    return apiResponse.success(
      {
        fileUrl,
        fileName: file.name,
        uniqueFileName,
        mimeType: file.type,
        fileSize: file.size,
        mediaId: saved.id,
      },
      'File uploaded and processed successfully',
      201
    );
  } catch (error) {
    return apiResponse.handle(error, 'Admin Upload File');
  }
}
