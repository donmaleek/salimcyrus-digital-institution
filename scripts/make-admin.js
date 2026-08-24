#!/usr/bin/env node
// Promotes an existing registered user to admin, so they can manage
// coaching availability at /dashboard/admin/availability.
// Usage: node scripts/make-admin.js someone@example.com

const { PrismaClient } = require('@prisma/client')

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: node scripts/make-admin.js <email>')
    process.exit(1)
  }

  const db = new PrismaClient()
  try {
    const user = await db.user.update({
      where: { email },
      data: { isAdmin: true },
    })
    console.log(`${user.email} is now an admin.`)
  } catch (error) {
    if (error.code === 'P2025') {
      console.error(`No registered user found with email "${email}". Register the account first, then run this again.`)
      process.exit(1)
    }
    throw error
  } finally {
    await db.$disconnect()
  }
}

main()
