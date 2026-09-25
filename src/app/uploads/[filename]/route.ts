import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ filename: string }>;
}

function getContentType(filename: string, dbType?: string): string {
  if (dbType) return dbType;
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'svg') return 'image/svg+xml';
  return 'image/jpeg';
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  const { filename } = await params;
  const filepath = join(process.cwd(), 'public', 'uploads', filename);
  const relativePath = `/uploads/${filename}`;

  // 1. Tenta ler do disco local
  try {
    const fileBuffer = await readFile(filepath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': getContentType(filename),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (diskError) {
    // 2. Se o arquivo não existir no disco (ex: deploy do Hostinger sobrescreveu a pasta public/uploads), busca do banco de dados!
    try {
      const media = await prisma.mediaFile.findFirst({
        where: { filepath: relativePath },
      });

      if (media && media.data) {
        const buffer = Buffer.from(media.data);

        // Tenta restaurar em disco para agilizar próximas leituras
        try {
          const uploadsDir = join(process.cwd(), 'public', 'uploads');
          await mkdir(uploadsDir, { recursive: true });
          await writeFile(filepath, buffer);
        } catch (writeErr) {
          // Ignora se o disco for somente leitura
        }

        return new NextResponse(buffer, {
          headers: {
            'Content-Type': getContentType(filename, media.filetype),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    } catch (dbError) {
      console.error('Erro ao recuperar mídia do banco:', dbError);
    }

    return new NextResponse('Imagem não encontrada', { status: 404 });
  }
}

