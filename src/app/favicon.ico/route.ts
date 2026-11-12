import { NextResponse } from 'next/server';
import { CmsRepository } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const theme = await CmsRepository.getThemeSettings();
    if (theme?.favicon) {
      if (theme.favicon.startsWith('http://') || theme.favicon.startsWith('https://')) {
        return NextResponse.redirect(theme.favicon, { status: 302 });
      }
      if (theme.favicon.startsWith('data:')) {
        // Base64 data URI: decode and return directly
        const parts = theme.favicon.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/x-icon';
        const buffer = Buffer.from(parts[1], 'base64');
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': mime,
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }
      if (theme.favicon.startsWith('/')) {
        return NextResponse.redirect(new URL(theme.favicon, process.env.NEXT_PUBLIC_APP_URL || 'https://quickpostly.com'), { status: 302 });
      }
    }
  } catch {
    // fallback
  }

  // Fallback to static SVG/PNG or empty
  return new NextResponse(null, { status: 204 });
}
