import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.warn('[AUTH_DIAGNOSTIC] Credenciais ausentes no input.');
          return null;
        }

        try {
          console.log(`[AUTH_DIAGNOSTIC] Tentando buscar usuário por email: ${credentials.email}`);
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            console.warn(`[AUTH_DIAGNOSTIC] Usuário não encontrado para o email: ${credentials.email}`);
            return null;
          }

          if (!user.passwordHash) {
            console.warn(`[AUTH_DIAGNOSTIC] Usuário encontrado, mas passwordHash está vazio para: ${credentials.email}`);
            return null;
          }

          console.log('[AUTH_DIAGNOSTIC] Usuário encontrado. Comparando hash da senha...');
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isValid) {
            console.warn('[AUTH_DIAGNOSTIC] Senha inválida para o usuário.');
            return null;
          }

          console.log('[AUTH_DIAGNOSTIC] Autenticação bem sucedida!');
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('[AUTH_DIAGNOSTIC] Erro durante a autenticação:', error);
          throw error;
        }
      },
    }),
  ],
});
