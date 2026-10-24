import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

// Bounds how long a revoked admin/CRM role can keep authorizing requests
// through an already-issued session JWT before it gets re-checked against
// the database. See the jwt() callback below.
const ROLE_REVALIDATE_MS = 5 * 60 * 1000

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null

        const user = await db.user.findUnique({ where: { email: credentials.email } })
        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          crmRole: user.crmRole,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false
        token.crmRole = (user as { crmRole?: string }).crmRole ?? 'customer'
        token.roleCheckedAt = Date.now()
        return token
      }

      // The JWT strategy never re-runs this callback with `user` after sign-in,
      // so isAdmin/crmRole baked in above would otherwise stay valid for the
      // whole ~30-day session even after being revoked in the database (CSO
      // finding e9242976532b390881e899cf86e7d1fa). Re-check against the
      // database at most once per ROLE_REVALIDATE_MS so a revoked admin/CRM
      // role stops working within minutes, not weeks, without a DB round trip
      // on every single request.
      const checkedAt = typeof token.roleCheckedAt === 'number' ? token.roleCheckedAt : 0
      if (token.id && Date.now() - checkedAt > ROLE_REVALIDATE_MS) {
        try {
          const current = await db.user.findUnique({
            where: { id: token.id as string },
            select: { isAdmin: true, crmRole: true },
          })
          token.isAdmin = current?.isAdmin ?? false
          token.crmRole = current?.crmRole ?? 'customer'
        } catch (error) {
          console.error('Role re-validation failed; failing closed', { userId: token.id, error })
          token.isAdmin = false
          token.crmRole = 'customer'
        }
        token.roleCheckedAt = Date.now()
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as { id?: string; isAdmin?: boolean; crmRole?: string }).id = token.id as string
        ;(session.user as { id?: string; isAdmin?: boolean; crmRole?: string }).isAdmin = token.isAdmin as boolean
        ;(session.user as { id?: string; isAdmin?: boolean; crmRole?: string }).crmRole = token.crmRole as string
      }
      return session
    },
  },
}
