import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface RouteParams {
  params: Promise<{ filename: string }>;
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  const { filename } = await params;
  const filepath = join(process.cwd(), 'public', 'uploads', filename);

  try {
    const fileBuffer = await readFile(filepath);
    
    // Determina o Content-Type correto com base na extensão
    const ext = filename.split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === 'png') contentType = 'image/png';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'webp') contentType = 'image/webp';
    else if (ext === 'svg') contentType = 'image/svg+xml';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('Imagem não encontrada', { status: 404 });
  }
}
