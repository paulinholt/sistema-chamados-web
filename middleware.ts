// src/middleware.ts
// Middleware para proteção de rotas e verificação de autenticação

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// Rotas públicas que não requerem autenticação
const publicRoutes = ['/', '/login', '/api/auth/login'];

// Rotas de API que não requerem autenticação
const publicApiRoutes = ['/api/auth/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar se é uma rota pública
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/auth/login')) {
    return NextResponse.next();
  }
  
  // Verificar se é uma rota de API
  const isApiRoute = pathname.startsWith('/api/');
  
  // Obter token do cookie
  const token = request.cookies.get('auth_token')?.value;
  
  // Se não houver token, redirecionar para login ou retornar erro para API
  if (!token) {
    if (isApiRoute) {
      return NextResponse.json(
        { status: 'error', message: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Verificar token
  const payload = await verifyToken(token);
  
  // Se o token for inválido, redirecionar para login ou retornar erro para API
  if (!payload) {
    if (isApiRoute) {
      return NextResponse.json(
        { status: 'error', message: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Verificar permissões específicas para certas rotas
  // Por exemplo, apenas administradores podem acessar a rota /admin
  if (pathname.startsWith('/admin') && payload.role !== 'admin') {
    if (isApiRoute) {
      return NextResponse.json(
        { status: 'error', message: 'Acesso negado' },
        { status: 403 }
      );
    }
    
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Se tudo estiver correto, permitir o acesso
  return NextResponse.next();
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    // Rotas que requerem autenticação
    '/dashboard/:path*',
    '/chamados/:path*',
    '/projetos/:path*',
    '/clientes/:path*',
    '/plantonistas/:path*',
    '/relatorios/:path*',
    '/configuracoes/:path*',
    '/admin/:path*',
    
    // Rotas de API que requerem autenticação
    '/api/:path*',
  ],
};
