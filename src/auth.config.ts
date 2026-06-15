import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  session: { strategy: 'jwt' },
  providers: [], // Injetado no auth.ts que roda em Node.js
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
} satisfies NextAuthConfig;
