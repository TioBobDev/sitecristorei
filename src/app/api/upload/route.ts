import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
  // Protege o endpoint: apenas Admin e Editor podem fazer uploads
  const session = await auth();
  if (
    !session ||
    (session.user?.role !== 'ADMIN' && session.user?.role !== 'EDITOR')
  ) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Garante que o diretório public/uploads exista
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Gera um nome único para o arquivo para evitar conflitos de nomes
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop();
    const filename = `${uniqueSuffix}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Tenta escrever no disco local (se o ambiente permitir gravação)
    try {
      await writeFile(filepath, buffer);
    } catch (diskErr) {
      console.warn('Aviso: Não foi possível gravar arquivo no disco local:', diskErr);
    }

    const relativePath = `/uploads/${filename}`;

    // Salva a mídia com o buffer completo no banco de dados para nunca perder em deploys
    const existing = await prisma.mediaFile.findFirst({
      where: { filepath: relativePath },
    });

    let media;
    if (existing) {
      media = await prisma.mediaFile.update({
        where: { id: existing.id },
        data: {
          filename: originalName,
          filetype: file.type,
          size: file.size,
          data: buffer,
        },
      });
    } else {
      media = await prisma.mediaFile.create({
        data: {
          filename: originalName,
          filepath: relativePath,
          filetype: file.type,
          size: file.size,
          data: buffer,
        },
      });
    }

    return NextResponse.json({
      success: true,
      url: relativePath,
      id: media.id,
    });
  } catch (error) {
    console.error('Erro ao processar upload:', error);
    return NextResponse.json(
      { error: 'Falha interna ao salvar arquivo' },
      { status: 500 }
    );
  }
}
