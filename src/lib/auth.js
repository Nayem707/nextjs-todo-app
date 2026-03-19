import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { UserRepository } from '@/repositories/UserRepository';

const userRepo = new UserRepository();

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const email = credentials.email;
        const password = credentials.password;

        // Find user by email
        const user = await userRepo.findByEmail(email);
        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        // Return user object (password excluded for security)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.avatar = token.avatar;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});
