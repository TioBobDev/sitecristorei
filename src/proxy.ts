import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAdminOrEditorPath = nextUrl.pathname.startsWith('/admin');
  const isAssociadoPath = nextUrl.pathname.startsWith('/associado');

  if (isAdminOrEditorPath) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/login', nextUrl));
    }
    const role = req.auth?.user?.role;
    if (role !== 'ADMIN' && role !== 'EDITOR') {
      return Response.redirect(new URL('/', nextUrl));
    }
  }

  if (isAssociadoPath) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/login', nextUrl));
    }
    const role = req.auth?.user?.role;
    if (role !== 'BENEFACTOR' && role !== 'ADMIN') {
      return Response.redirect(new URL('/', nextUrl));
    }
  }
});

export const config = {
  matcher: ['/admin/:path*', '/associado/:path*'],
};
