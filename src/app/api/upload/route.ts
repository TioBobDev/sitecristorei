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

    // Escreve o arquivo no sistema local
    await writeFile(filepath, buffer);

    const relativePath = `/uploads/${filename}`;

    // Registra a mídia no banco de dados para consulta posterior se necessário
    const media = await prisma.mediaFile.create({
      data: {
        filename: originalName,
        filepath: relativePath,
        filetype: file.type,
        size: file.size,
      },
    });

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
