// src/lib/auth.ts
// Utilitário para autenticação e segurança

import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { dbClient } from './db';

// Chave secreta para assinatura de tokens JWT
// Em produção, isso deve ser uma variável de ambiente segura
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sistema_chamados_web_secret_key_2025'
);

// Interface para o usuário autenticado
export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  tipo: 'admin' | 'plantonista' | 'gerente';
}

// Interface para o token JWT
export interface JWTPayload {
  sub: string; // ID do usuário
  name: string; // Nome do usuário
  email: string; // Email do usuário
  role: string; // Tipo do usuário
  iat: number; // Timestamp de emissão
  exp: number; // Timestamp de expiração
}

// Função para criar um token JWT
export async function createToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    sub: user.id.toString(),
    name: user.nome,
    email: user.email,
    role: user.tipo
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h') // Token válido por 8 horas
    .sign(JWT_SECRET);
}

// Função para verificar um token JWT
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
}

// Função para autenticar um usuário com email e senha
export async function authenticateUser(email: string, senha: string): Promise<{ success: boolean; user?: AuthUser; token?: string }> {
  // Se o banco de dados não estiver disponível, usar dados simulados
  if (!dbClient.isAvailable()) {
    return authenticateSimulatedUser(email, senha);
  }

  try {
    // Buscar usuário pelo email
    const user = await dbClient.queryOne<{
      id: number;
      nome: string;
      email: string;
      senha_hash: string;
      tipo: 'admin' | 'plantonista' | 'gerente';
      ativo: boolean;
    }>('SELECT * FROM usuarios WHERE email = ? AND ativo = 1', [email]);

    if (!user) {
      return { success: false };
    }

    // Verificar senha
    // Em produção, usar bcrypt.compare
    // Aqui estamos simulando a verificação para simplificar
    const isPasswordValid = user.senha_hash.includes(senha);

    if (!isPasswordValid) {
      return { success: false };
    }

    // Criar token JWT
    const authUser: AuthUser = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo
    };

    const token = await createToken(authUser);

    return {
      success: true,
      user: authUser,
      token
    };
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error);
    return { success: false };
  }
}

// Função para obter o usuário atual a partir do cookie
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  return {
    id: parseInt(payload.sub),
    nome: payload.name,
    email: payload.email,
    tipo: payload.role as 'admin' | 'plantonista' | 'gerente'
  };
}

// Função para verificar se o usuário tem permissão para acessar um recurso
export function hasPermission(user: AuthUser | null, requiredRoles: string[]): boolean {
  if (!user) {
    return false;
  }

  return requiredRoles.includes(user.tipo);
}

// Função para autenticar usuários simulados (desenvolvimento)
function authenticateSimulatedUser(email: string, senha: string): Promise<{ success: boolean; user?: AuthUser; token?: string }> {
  // Usuários simulados para desenvolvimento
  const users = [
    {
      id: 1,
      nome: 'Administrador',
      email: 'admin@w3fmaster.com.br',
      senha: 'admin123',
      tipo: 'admin' as const,
      ativo: true
    },
    {
      id: 2,
      nome: 'Aurélio',
      email: 'aurelio@w3fmaster.com.br',
      senha: 'plantonista123',
      tipo: 'plantonista' as const,
      ativo: true
    },
    {
      id: 3,
      nome: 'Gerente Teste',
      email: 'gerente@w3fmaster.com.br',
      senha: 'gerente123',
      tipo: 'gerente' as const,
      ativo: true
    }
  ];

  // Buscar usuário pelo email
  const user = users.find(u => u.email === email && u.ativo);

  if (!user) {
    return Promise.resolve({ success: false });
  }

  // Verificar senha
  if (user.senha !== senha) {
    return Promise.resolve({ success: false });
  }

  // Criar token JWT
  const authUser: AuthUser = {
    id: user.id,
    nome: user.nome,
    email: user.email,
    tipo: user.tipo
  };

  return createToken(authUser).then(token => ({
    success: true,
    user: authUser,
    token
  }));
}
