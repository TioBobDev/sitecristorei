import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando semeadura do banco de dados...');

  // 1. Criar Configurações Gerais do Site
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      name: 'Associação Cristo Rei do Universo',
      logoUrl: '/images/logo.png',
      address: 'Praça Cristo Rei, 100 - Centro, São Paulo - SP',
      phone: '(11) 3456-7890',
      email: 'contato@cristorei.org',
      facebook: 'https://facebook.com/cristoreiuniverso',
      instagram: 'https://instagram.com/cristoreiuniverso',
      youtube: 'https://youtube.com/cristoreiuniverso',
      pixKey: 'contato@cristorei.org',
      pixBank: 'Banco do Brasil',
      pixReceiver: 'Associação Cristo Rei do Universo',
      pixQrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // Pix fake base64
      thankYouMsg: 'Muito obrigado por sua generosa doação e por alistar-se no Exército de Cristo Rei!',
    },
  });
  console.log('Configurações do site criadas:', settings.name);

  // 2. Criar Usuários Padrão (Admin e Editor)
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cristorei.org' },
    update: {},
    create: {
      name: 'Administrador Cristo Rei',
      email: 'admin@cristorei.org',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log('Usuário Administrador criado:', admin.email);

  const editorPasswordHash = await bcrypt.hash('Editor@123456', 10);
  const editor = await prisma.user.upsert({
    where: { email: 'editor@cristorei.org' },
    update: {},
    create: {
      name: 'Editor de Conteúdo',
      email: 'editor@cristorei.org',
      passwordHash: editorPasswordHash,
      role: Role.EDITOR,
    },
  });
  console.log('Usuário Editor criado:', editor.email);

  // 3. Criar Categorias Iniciais
  const initialCategories = [
    { name: 'Reforço Pedagógico', slug: 'reforco-pedagogico', description: 'Apoio escolar e pedagógico para crianças e adolescentes da comunidade.' },
    { name: 'Aula de Informática', slug: 'aula-de-informatica', description: 'Cursos de inclusão digital e programação básica para jovens e adultos.' },
    { name: 'Aula de Música', slug: 'aula-de-musica', description: 'Musicalização, violão, teclado, coral e percussão para todas as idades.' },
    { name: 'Pilates', slug: 'pilates', description: 'Aulas de pilates solo visando a saúde física e postura para idosos e adultos.' },
    { name: 'Festa Junina', slug: 'festa-junina', description: 'Nossa tradicional festividade com fins beneficentes e comunitários.' },
    { name: 'Noite Cultural', slug: 'noite-cultural', description: 'Apresentações teatrais, mostras artísticas e saraus comunitários.' },
  ];

  for (const cat of initialCategories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        bannerUrl: `/images/categories/${cat.slug}.jpg`,
      },
    });
    console.log(`Categoria criada: ${category.name} (/projetos/${category.slug})`);

    // Criar um projeto exemplo em cada categoria
    await prisma.project.create({
      data: {
        name: `Projeto ${cat.name}`,
        slug: `projeto-${cat.slug}`,
        summary: `Conheça o trabalho que realizamos no projeto de ${cat.name}.`,
        description: `O projeto de ${cat.name} foi criado para promover transformação social através do desenvolvimento de habilidades e integração da comunidade. Nossas ações contam com profissionais voluntários e doações da comunidade para prover o melhor acolhimento e ensino.`,
        bannerUrl: `/images/categories/${cat.slug}.jpg`,
        categoryId: category.id,
      },
    });
  }

  // 4. Criar Imagens de Carrossel Iniciais
  const carouselImages = [
    {
      title: 'Bem-vindo ao Exército de Cristo Rei',
      description: 'Ajude-nos a transformar vidas na comunidade através da educação e da fé.',
      imageUrl: '/images/carousel/hero-1.jpg',
      linkUrl: '#seja-benfeitor',
      order: 1,
    },
    {
      title: 'Aulas de Música para Jovens',
      description: 'Despertando talentos e abrindo novos caminhos por meio da arte musical.',
      imageUrl: '/images/carousel/hero-2.jpg',
      linkUrl: '/projetos/aula-de-musica',
      order: 2,
    },
  ];

  for (const img of carouselImages) {
    await prisma.carouselImage.create({
      data: img,
    });
  }
  console.log('Imagens do carrossel inicial criadas.');

  // 5. Criar Notícias Iniciais
  await prisma.news.create({
    data: {
      title: 'Inauguração das Novas Salas de Informática',
      subtitle: 'Comunidade ganha computadores novos e cursos gratuitos',
      summary: 'Graças às contribuições de nossos coroneis e tenentes do Exército de Cristo Rei, inauguramos hoje a nova sala de computadores.',
      content: '<p>A Associação Cristo Rei do Universo tem a alegria de informar que a nova sala de aula digital foi inaugurada. Equipados com computadores modernos, iniciaremos as novas turmas de informática básica e desenvolvimento web para jovens na próxima segunda-feira.</p><p>Agradecemos a todos os benfeitores que tornaram esse sonho possível através de suas generosas doações mensais via PIX.</p>',
      coverImage: '/images/news/informatica-inauguracao.jpg',
      status: 'Published',
      authorId: admin.id,
    },
  });

  await prisma.news.create({
    data: {
      title: 'Nossa Noite Cultural Reúne Centenas de Fiéis',
      subtitle: 'Apresentações artísticas marcaram o último final de semana',
      summary: 'Noite Cultural da paróquia arrecada fundos para as oficinas gratuitas de música e teatro.',
      content: '<p>O evento contou com apresentações de violão e flauta dos alunos da oficina de música Cristo Rei. Tivemos também uma peça teatral inspiradora contando a história de dedicação social da comunidade. Todo o valor arrecadado na praça de alimentação será revertido para a manutenção das oficinas gratuitas.</p>',
      coverImage: '/images/news/noite-cultural-evento.jpg',
      status: 'Published',
      authorId: admin.id,
    },
  });
  console.log('Notícias de exemplo criadas.');

  // 6. Criar Comunicados Iniciais
  await prisma.announcement.create({
    data: {
      title: 'Assembleia Mensal dos Benfeitores',
      content: 'Convidamos todos os membros do Exército de Cristo Rei a participarem de nossa assembleia virtual no dia 25 deste mês às 19h30, onde apresentaremos o balanço financeiro e as conquistas do último trimestre.',
      authorId: admin.id,
    },
  });
  console.log('Comunicados de exemplo criados.');

  console.log('Semeadura do banco de dados concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
